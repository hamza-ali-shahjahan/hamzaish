import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { scan, type Status } from "./check-legal-traps";

// Each case is a tiny fake repo; we assert the one trap it exercises.
const dirs: string[] = [];
function repo(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "legal-traps-"));
  dirs.push(root);
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));
const status = (root: string, id: string): Status => scan(root).results.find((r) => r.id === id)!.status;

const APP = { "src/app/layout.tsx": "import React from 'react';\nexport default function RootLayout() { return <html><body/></html>; }\n" };
const SIGNUP = "import { createClient } from '@supabase/supabase-js';\nawait supabase.auth.signInWithOtp({ email });\n";

describe("age-gate", () => {
  test("signup with no age question fails", () => {
    expect(status(repo({ ...APP, "src/app/login/page.tsx": SIGNUP }), "age-gate")).toBe("FAIL");
  });
  test("birth-year gate in the auth code passes", () => {
    expect(status(repo({ ...APP, "src/app/login/page.tsx": SIGNUP + "const [birthYear] = useState('');\n" }), "age-gate")).toBe("PASS");
  });
  test("'at least 18' in a terms page does not count as a gate", () => {
    expect(status(repo({ ...APP, "src/app/login/page.tsx": SIGNUP, "src/app/terms/page.tsx": "You must be at least 18 to use this.\n" }), "age-gate")).toBe("FAIL");
  });
  test("'13 million' and arithmetic are not age gates", () => {
    expect(status(repo({ ...APP, "src/app/auth/page.tsx": SIGNUP + "// over 13 million users\nconst x = rating * 18 + 2;\n" }), "age-gate")).toBe("FAIL");
  });
  test("react-hook-form register() is not signup", () => {
    expect(status(repo({ ...APP, "src/components/Form.tsx": "<input {...register('name')} />\n" }), "age-gate")).toBe("N/A");
  });
});

describe("google-fonts", () => {
  test("a googleapis link fails", () => {
    expect(status(repo({ ...APP, "index.html": '<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">' }), "google-fonts")).toBe("FAIL");
  });
  test("next/font/google passes (self-hosted at build)", () => {
    expect(status(repo({ ...APP, "src/app/fonts.ts": "import { Inter } from 'next/font/google';\n" }), "google-fonts")).toBe("PASS");
  });
});

describe("session-replay", () => {
  test("posthog without the off-switch warns", () => {
    expect(status(repo({ ...APP, "src/lib/a.ts": "posthog.init(key, { api_host });\n" }), "session-replay")).toBe("WARN");
  });
  test("posthog with disable_session_recording passes", () => {
    expect(status(repo({ ...APP, "src/lib/a.ts": "posthog.init(key, { disable_session_recording: true });\n" }), "session-replay")).toBe("PASS");
  });
  test("a hotjar snippet with no consent fails", () => {
    expect(status(repo({ ...APP, "index.html": '<script src="https://static.hotjar.com/c/hotjar-1.js"></script>' }), "session-replay")).toBe("FAIL");
  });
  test("a tool catalog that merely names FullStory is not a recorder", () => {
    expect(status(repo({ ...APP, "src/data/tools.ts": "export const tools = [{ name: 'FullStory', url: 'https://fullstory.com' }];\n" }), "session-replay")).toBe("PASS");
  });
});

describe("marketing-email", () => {
  const SEND = "import { Resend } from 'resend';\nawait resend.emails.send({ to, subject: 'Our newsletter', text });\n";
  test("a newsletter with no footer fails", () => {
    expect(status(repo({ ...APP, "src/lib/newsletter.ts": SEND }), "marketing-email")).toBe("FAIL");
  });
  test("unsubscribe + POSTAL_ADDRESS passes", () => {
    expect(status(repo({ ...APP, "src/lib/newsletter.ts": SEND + "const f = `Unsubscribe: ${u} ${env.POSTAL_ADDRESS}`;\n" }), "marketing-email")).toBe("PASS");
  });
  test("crypto .digest() is not a newsletter digest", () => {
    expect(status(repo({ ...APP, "src/lib/auth.ts": "import { Resend } from 'resend';\nawait resend.emails.send({ to, subject: 'Your code', text });\nhmac.digest('hex');\n" }), "marketing-email")).toBe("N/A");
  });
});

describe("renewal-terms", () => {
  const CHECKOUT = { "src/app/api/checkout/route.ts": "stripe.checkout.sessions.create({ mode: 'subscription' });\n" };
  test("a subscribe button with no renewal copy fails", () => {
    expect(status(repo({ ...APP, ...CHECKOUT, "src/app/pricing/page.tsx": "<button>Subscribe</button>\n" }), "renewal-terms")).toBe("FAIL");
  });
  test("renewal terms only in /terms still fail", () => {
    expect(status(repo({ ...APP, ...CHECKOUT, "src/app/pricing/page.tsx": "<button>Subscribe</button>\n", "src/app/terms/page.tsx": "Plans renew automatically.\n" }), "renewal-terms")).toBe("FAIL");
  });
  test("renewal copy beside the button passes", () => {
    expect(status(repo({ ...APP, ...CHECKOUT, "src/app/pricing/page.tsx": "<button>Subscribe</button><p>$9/month, renews automatically every month until you cancel.</p>\n" }), "renewal-terms")).toBe("PASS");
  });
  test("'billed annually' alone is not a renewal disclosure", () => {
    expect(status(repo({ ...APP, ...CHECKOUT, "src/app/pricing/page.tsx": "<button>Subscribe</button><p>$8/month billed annually. Cancel anytime.</p>\n" }), "renewal-terms")).toBe("FAIL");
  });
  test("a ternary-set subscription mode is still a subscription", () => {
    expect(status(repo({ ...APP, "src/app/api/checkout/route.ts": "stripe.checkout.sessions.create({ mode: once ? 'payment' : 'subscription' });\n", "src/app/pricing/page.tsx": "<button>Subscribe</button>\n" }), "renewal-terms")).toBe("FAIL");
  });
});

describe("dmca-agent", () => {
  const STORE = "await supabase.storage\n  .from('logos')\n  .upload(name, file);\n";
  test("stored user uploads with no policy fail (multi-line chain)", () => {
    expect(status(repo({ ...APP, "src/components/Logo.tsx": STORE }), "dmca-agent")).toBe("FAIL");
  });
  test("a policy page downgrades to WARN (registration can't be checked)", () => {
    expect(status(repo({ ...APP, "src/components/Logo.tsx": STORE, "src/app/dmca/page.tsx": "<h1>DMCA policy</h1>\n" }), "dmca-agent")).toBe("WARN");
  });
  test("a file input that never leaves the browser is not hosting", () => {
    expect(status(repo({ ...APP, "src/components/Import.tsx": '<input type="file" onChange={readCsv} />\n' }), "dmca-agent")).toBe("N/A");
  });
});

describe("legal-traps.json acceptances", () => {
  test("a reasoned acceptance downgrades FAIL to WARN and keeps the reason", () => {
    const root = repo({ ...APP, "src/app/login/page.tsx": SIGNUP, "legal-traps.json": JSON.stringify({ accept: { "age-gate": "internal tool, sign-in restricted to company domain" } }) });
    const r = scan(root).results.find((x) => x.id === "age-gate")!;
    expect(r.status).toBe("WARN");
    expect(r.why).toContain("company domain");
  });
  test("an acceptance with no real reason is ignored", () => {
    const root = repo({ ...APP, "src/app/login/page.tsx": SIGNUP, "legal-traps.json": JSON.stringify({ accept: { "age-gate": "ok" } }) });
    expect(status(root, "age-gate")).toBe("FAIL");
  });
});
