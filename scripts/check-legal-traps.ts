#!/usr/bin/env bun
// scripts/check-legal-traps.ts
//
// Static scanner for the six launch-day legal traps AI-built apps ship silently.
// Each one is billed PER unit (per child, per visitor, per session, per email,
// per renewal, per work), which is how an app with zero sales runs up a six-figure
// exposure. Backend for `/security-check` § 7a, which `/ship` gates on.
// Playbook (what each trap is, and the fix): factory/playbooks/launch-stage/legal-launch-traps.md
//
//   1. age-gate        signup with no age question            COPPA (US)
//   2. google-fonts    fonts loaded from Google's servers     GDPR (EU), LG München I 3 O 17493/20
//   3. session-replay  replay/keystroke capture without opt-in CIPA (California wiretap act)
//   4. marketing-email bulk email without unsubscribe+address CAN-SPAM (US)
//   5. renewal-terms   subscription checkout without terms    California Automatic Renewal Law
//   6. dmca-agent      user uploads with no DMCA agent/policy 17 U.S.C. § 512(c) safe harbor
//
// A heuristic, not a lawyer: PASS means "the marker a fix leaves behind is present",
// not "compliant". FAIL means "the trigger is present and the fix's marker isn't".
// N/A means the trigger (signup, email, subscriptions, uploads…) wasn't found.
//
// Usage:
//   bun scripts/check-legal-traps.ts <repo-dir> [--json]
//
// A FAIL you've verified is a false positive is accepted in `legal-traps.json` at the
// repo root — never silently: the reason is required and printed on every run.
//   { "accept": { "age-gate": "waitlist form only — nothing creates an account" } }
// An accepted FAIL reports as WARN ("accepted: <reason>") and stops blocking.
//
// Exit codes: 0 = no FAIL (WARN allowed), 1 = at least one FAIL, 2 = bad usage.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

export type Status = "PASS" | "FAIL" | "WARN" | "N/A";
export type Result = {
  id: string;
  title: string;
  law: string;
  status: Status;
  why: string;
  evidence: string[];
  fix: string;
};

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", ".nuxt", ".svelte-kit", ".vercel", ".turbo", ".cache",
  "dist", "build", "out", "coverage", "vendor", "references", "_archive", ".output",
  "__pycache__", ".venv", "venv", "target", "storybook-static",
]);
const CODE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".vue", ".svelte", ".astro",
  ".html", ".htm", ".css", ".scss", ".sass", ".less", ".py", ".php", ".liquid", ".ejs", ".hbs",
]);
const UI_EXT = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm", ".mdx", ".md", ".liquid", ".ejs", ".hbs", ".php", ".ts", ".js"]);
// Policy pages are often prose (terms.md, dmca.mdx) — searched for markers only.
const DOC_EXT = new Set([".md", ".mdx", ".txt"]);
const MAX_BYTES = 1_000_000;

type File = { rel: string; ext: string; text: string; isTest: boolean };

export function collect(root: string): File[] {
  const out: File[] = [];
  const walk = (dir: string) => {
    let entries: import("node:fs").Dirent[];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.isSymbolicLink()) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(full);
        continue;
      }
      const ext = extname(e.name).toLowerCase();
      if (!CODE_EXT.has(ext) && !DOC_EXT.has(ext)) continue;
      if (/\.min\.(js|css)$/.test(e.name) || /(^|\.)lock(\.|$)/.test(e.name)) continue;
      let size = 0;
      try { size = statSync(full).size; } catch { continue; }
      if (size > MAX_BYTES) continue;
      const rel = relative(root, full);
      out.push({
        rel,
        ext,
        text: readFileSync(full, "utf8"),
        isTest: /(^|\/)(__tests__|tests?|e2e|evals?|fixtures|__mocks__)\//.test(rel) || /\.(test|spec)\.[a-z]+$/.test(rel),
      });
    }
  };
  walk(root);
  return out;
}

// file:line hits for a regex, capped so one noisy file can't drown the report.
function hits(files: File[], re: RegExp, limit = 6): string[] {
  const out: string[] = [];
  for (const f of files) {
    const lines = f.text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        out.push(`${f.rel}:${i + 1}`);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
const any = (files: File[], re: RegExp) => files.some((f) => re.test(f.text));

// ─── triggers & markers ──────────────────────────────────────────────────────
const RE = {
  googleFonts: /fonts\.(googleapis|gstatic)\.com/,
  nextFontGoogle: /from\s+["']next\/font\/google["']/,

  thirdPartyReplay:
    /(static\.hotjar\.com|@hotjar\/|\bhotjar\b.*init|fullstory\.com|@fullstory\/|\blogrocket\b|LogRocket\.init|clarity\.ms|@microsoft\/clarity|mouseflow\.com|smartlook|inspectlet\.com|luckyorange|@openreplay\/|@highlight-run\/|rrweb)/i,
  sentryReplay: /(replayIntegration\s*\(|new\s+(Sentry\.)?Replay\s*\(|Sentry\.Replay\b)/,
  sentryUnmasked: /(maskAllText|maskAllInputs|blockAllMedia)\s*:\s*false/,
  posthogInit: /(posthog\.init\s*\(|PostHogProvider|initPostHog|posthog-js)/,
  posthogReplayOff: /disable_session_recording\s*:\s*true/,
  posthogReplayOn: /(disable_session_recording\s*:\s*false|startSessionRecording\s*\()/,
  replayConsent: /(consent|cookie[_-]?banner|opt[_-]?in|analytics_storage|hasConsent|cookieConsent)/i,

  signup:
    /(auth\.signUp\s*\(|signInWithOtp\s*\(|verifyOtp\s*\(|auth\.admin\.createUser|(send|request|verify)(Login|Email|Otp|Verification)?Code\s*\(|\/(api\/)?(v\d\/)?auth\/(signup|sign-up|register|otp|email-code|magic)|\b(registerUser|registerAction|signUp|signup|createAccount|requestLogin|requestMagicLink)(User|Action|Handler)?\(|signInWithOAuth\s*\(|createUserWithEmailAndPassword|signInWithPopup\s*\(|<SignUp\b|SignUpButton|<SignIn\b|\bsignIn\(\s*["'](google|github|email|credentials))/,
  signupCopy: /(\/(signup|sign-up|register)\b|["'>]\s*(Sign up|Create (an |your )?account|Get started free)\b)/,
  authSdk: /(@supabase\/(supabase-js|ssr|auth-helpers)|@clerk\/|next-auth|@auth\/core|firebase\/auth|better-auth|lucia|@auth0\/|@kinde-oss\/|@stackframe\/|from\s+["']@\/integrations\/supabase)/,
  ageGate:
    /(date[_ ]?of[_ ]?birth|dateOfBirth|birth_?date|birthYear|birth_year|\bdob\b|age[_-]?gate|AgeGate|ageConfirmed|age_confirmed|confirmAge|MIN(IMUM)?_AGE|minimumAge|(at least|over|older than|aged)\s*(13|16|18)\b(?!\s*(million|billion|thousand|%|,\d|\.\d))|\b(13|16|18)(\+(?![\s(]*\w)|\s+or older|\s+years (of age|or older)))/i,

  emailProvider:
    /(from\s+["']resend["']|new\s+Resend\s*\(|nodemailer|@sendgrid\/mail|postmark|mailgun|@aws-sdk\/client-ses|from\s+["']loops["']|@getbrevo|sib-api|@react-email\/|useplunk|api\.resend\.com)/,
  marketingEmail:
    /(broadcasts\.(create|send)|audiences?\.(create|get|list)|contacts\.(create|list)|audienceId|newsletter|campaign|(?<!\.)\bdigest\b(?!\s*\()|announcement|we('|’)?ve? launched|launch(ed)? email|weekly (update|recap)|batch\.send|sendBulk|bulk[_-]?email|marketing[_-]?email)/i,
  hostedEsp: /(mailchimp|beehiiv|convertkit|kit\.com|substack|buttondown|loops\.so)/i,
  unsubscribe: /(unsubscribe|List-Unsubscribe|opt[- ]?out of (these|marketing) emails|email preferences)/i,
  postalAddress:
    /(POSTAL_ADDRESS|MAILING_ADDRESS|COMPANY_ADDRESS|postalAddress|mailingAddress|physical (postal )?address|P\.?\s?O\.?\s?Box|\b(Street|St\.|Road|Rd\.|Avenue|Ave\.|Suite|Floor|Block)\b[^\n]{0,60}\b\d{4,6}\b)/,

  subscription:
    /(mode\s*:[^,\n]{0,80}["']subscription["']|subscription_data\s*:|stripe\.subscriptions\.create\s*\(|recurring\s*:\s*\{\s*interval\s*:\s*["']|lemonsqueezy\.com\/checkout|createCheckout\s*\(|@paddle\/paddle-js|Paddle\.Checkout\.open|@polar-sh\/(sdk|nextjs)|buy\.stripe\.com)/i,
  // UI that puts a pay/subscribe button in front of the user (the renewal copy must sit here).
  checkoutCta:
    /(\/api\/(stripe\/|billing\/)?checkout|checkout\.sessions\.create|redirectToCheckout|createCheckout\s*\(|Paddle\.Checkout|buy\.stripe\.com|lemonsqueezy\.com\/checkout|["'>]\s*(Subscribe|Upgrade( now| to Pro)?|Go Pro|Get Pro|Start (your )?(free )?trial|Choose (this )?plan|Buy now)\b|\/pricing\b)/i,
  renewalTerms:
    /(auto(matically)?[- ]?renew|renews (automatically|every|each|monthly|annually|yearly|at)|until (you )?cancel|recurring (charge|billing|payment))/i,

  // A file picker alone isn't hosting: CSV imports and in-browser previews never leave the
  // device. Uploads count only when something actually stores the file server-side.
  uploadStore:
    /(\.storage\s*\.from\([^)]*\)\s*\.upload\s*\(|uploadthing|\bmulter\b|formidable|from\s+["']@vercel\/blob(\/client)?["']|handleUpload\s*\(|PutObjectCommand|cloudinary\.uploader|createSignedUploadUrl|upload_preset|\.uploadBytes(Resumable)?\s*\()/,
  dmca: /(DMCA|designated (copyright )?agent|copyright agent|dmca\.copyright\.gov|takedown (notice|request))/i,

  webApp:
    /(from\s+["'](react|next|vue|svelte|astro|@remix-run|solid-js)|<html|<!doctype html|<body|createRoot\s*\(|export default function (Page|RootLayout|App)\b)/i,
};

// Policy/legal prose and docs: they describe the rule, they don't enforce it.
const LEGAL_PAGE = /(^|\/)(terms|tos|privacy|legal|policies|policy|refund|faq)[^/]*(\/|\.|$)/i;
const SEEDISH = /(^|\/)(seed|seeds|fixtures?|mocks?|__mocks__|data|demo|samples?)(\/|\.)/i;
// Where an age check actually lives: the signup/auth code or a legal config module.
const AGE_HOME = /((^|[/._-])age([/._-]|$)|age-?gate|legal|sign-?up|sign-?in|register|auth|onboard|login|join)/i;
// A file that actually sends email (vs. one that merely says "newsletter").
const SENDS_EMAIL = /(\.emails\.send|\bsendEmail\s*\(|\bsendMail\s*\(|batch\.send|broadcasts\.|\.send\(\s*\{[\s\S]{0,200}\b(to|subject)\s*:)/;

// ─── the checks ──────────────────────────────────────────────────────────────
export function scan(root: string): { root: string; webApp: boolean; files: number; results: Result[] } {
  const all = collect(root);
  const code = all.filter((f) => CODE_EXT.has(f.ext) && !f.isTest);
  const ui = all.filter((f) => UI_EXT.has(f.ext) && !f.isTest);
  const everything = all.filter((f) => !f.isTest);
  const webApp = any(code, RE.webApp);
  const results: Result[] = [];

  const na = (id: string, title: string, law: string, why: string, fix: string): Result =>
    ({ id, title, law, status: "N/A", why, evidence: [], fix });

  // 1 — age gate on signup
  {
    const id = "age-gate", title = "Age gate on signup", law = "COPPA (US) — civil penalties per child under 13";
    const fix = "Add a neutral age question to signup (don't hint the cut-off), block under-13s without storing their data, and record age_confirmed on the account.";
    const app = code.filter((f) => !LEGAL_PAGE.test(f.rel) && !SEEDISH.test(f.rel) && !/\.gen\./.test(f.rel));
    const trig = [...hits(app, RE.signup), ...(any(app, RE.authSdk) ? hits(app, RE.signupCopy) : [])].slice(0, 6);
    const ageFiles = code.filter((f) => !LEGAL_PAGE.test(f.rel) && RE.ageGate.test(f.text) && (RE.signup.test(f.text) || AGE_HOME.test(f.rel)));
    if (!webApp || trig.length === 0) results.push(na(id, title, law, "no signup / account creation found", fix));
    else if (ageFiles.length) results.push({ id, title, law, status: "PASS", why: "signup present and an age check sits in the auth/legal code", evidence: hits(ageFiles, RE.ageGate, 3), fix });
    else results.push({ id, title, law, status: "FAIL", why: "accounts can be created with no age question", evidence: trig, fix });
  }

  // 2 — Google Fonts from Google's servers
  {
    const id = "google-fonts", title = "Self-hosted fonts", law = "GDPR (EU) — IP sent to Google per visitor (LG München I, 20 Jan 2022)";
    const fix = "Self-host the font files: next/font/google (downloads at build time, serves from your domain) or @fontsource/<family>, and delete every fonts.googleapis.com / fonts.gstatic.com link, @import and preconnect.";
    const leak = hits(code, RE.googleFonts);
    if (!webApp && leak.length === 0) results.push(na(id, title, law, "not a web app", fix));
    else if (leak.length) results.push({ id, title, law, status: "FAIL", why: "fonts load from Google's servers, sending each visitor's IP to Google", evidence: leak, fix });
    else results.push({ id, title, law, status: "PASS", why: any(code, RE.nextFontGoogle) ? "next/font/google self-hosts at build time; no Google font requests" : "no requests to Google font servers", evidence: [], fix });
  }

  // 3 — session replay
  {
    const id = "session-replay", title = "Session replay off (or consented + masked)", law = "CIPA (California) — statutory damages per session";
    const fix = "Turn replay off in code (PostHog: disable_session_recording: true; Sentry: drop replayIntegration or set replaysSessionSampleRate: 0) — or load it only after explicit opt-in consent with every input and text field masked.";
    const third = hits(code.filter((f) => !SEEDISH.test(f.rel)), RE.thirdPartyReplay);
    const sentry = hits(code, RE.sentryReplay);
    const posthog = hits(code, RE.posthogInit);
    const consent = any(code, RE.replayConsent);
    if (third.length && !consent) results.push({ id, title, law, status: "FAIL", why: "a session-replay / heatmap recorder loads with no consent gate", evidence: third, fix });
    else if (sentry.length && any(code, RE.sentryUnmasked)) results.push({ id, title, law, status: "FAIL", why: "Sentry Replay runs with masking turned off — keystrokes and text are recorded", evidence: [...sentry, ...hits(code, RE.sentryUnmasked, 2)], fix });
    else if (posthog.length && any(code, RE.posthogReplayOn)) results.push({ id, title, law, status: consent ? "WARN" : "FAIL", why: "PostHog session recording is switched on in code" + (consent ? " (a consent marker exists — confirm replay only starts after opt-in)" : " with no consent gate"), evidence: hits(code, RE.posthogReplayOn, 3), fix });
    else if (posthog.length && !any(code, RE.posthogReplayOff)) results.push({ id, title, law, status: "WARN", why: "PostHog loads without disable_session_recording: true — recording then depends on a dashboard toggle anyone on the project can flip", evidence: posthog.slice(0, 3), fix });
    else if (third.length || sentry.length) results.push({ id, title, law, status: "WARN", why: "a replay tool is present behind a consent marker — confirm it starts only after opt-in and masks inputs", evidence: [...third, ...sentry].slice(0, 4), fix });
    else if (!webApp) results.push(na(id, title, law, "not a web app", fix));
    else results.push({ id, title, law, status: "PASS", why: posthog.length ? "PostHog session recording pinned off in code" : "no session-replay tooling found", evidence: [], fix });
  }

  // 4 — marketing email
  {
    const id = "marketing-email", title = "Unsubscribe link + postal address in marketing email", law = "CAN-SPAM (US) — civil penalties per email";
    const fix = "Every marketing email (launch, newsletter, digest, waitlist blast) needs a working unsubscribe link, a List-Unsubscribe header, and your physical postal address in the footer. Transactional email (receipts, magic links) is exempt.";
    const provider = hits(code, RE.emailProvider);
    const senders = code.filter((f) => !SEEDISH.test(f.rel) && (SENDS_EMAIL.test(f.text) || /(^|\/)(emails?|mail|newsletter|digest|campaigns?)(\/|\.)/i.test(f.rel)));
    const marketing = provider.length ? hits(senders, RE.marketingEmail) : [];
    if (provider.length === 0) {
      const hosted = any(code, RE.hostedEsp);
      results.push(na(id, title, law, hosted ? "email goes through a hosted ESP that adds its own footer — set your postal address in that tool's settings" : "no email-sending code found", fix));
    } else if (marketing.length === 0) {
      results.push(na(id, title, law, "email code looks transactional only (no lists, broadcasts or campaigns) — exempt, but re-run this when you send a launch email", fix));
    } else {
      const unsub = any(everything, RE.unsubscribe);
      const addr = any(everything, RE.postalAddress);
      if (unsub && addr) results.push({ id, title, law, status: "PASS", why: "marketing email code with unsubscribe and postal-address markers", evidence: [], fix });
      else results.push({ id, title, law, status: "FAIL", why: `marketing email is sent with no ${[!unsub && "unsubscribe link", !addr && "postal address"].filter(Boolean).join(" and no ")}`, evidence: marketing, fix });
    }
  }

  // 5 — renewal terms beside the subscribe button
  {
    const id = "renewal-terms", title = "Renewal terms next to the subscribe button", law = "California Automatic Renewal Law — undisclosed renewals can be treated as an unconditional gift";
    const fix = "Right next to the subscribe/checkout button state: the price, that it renews automatically every <period> until cancelled, and how to cancel (online, as easily as signing up). Send the same terms in the confirmation email.";
    const subs = hits(code, RE.subscription);
    // Terms/privacy pages don't count: the law wants the terms beside the button, not in a policy.
    const legalPage = /(^|\/)(terms|tos|privacy|legal|policies|policy|refund)/i;
    const ctaFiles = ui.filter((f) => !legalPage.test(f.rel) && RE.checkoutCta.test(f.text));
    const sharedTerms = code.some((f) => /renewal/i.test(f.text) && RE.renewalTerms.test(f.text));
    const disclosed = ctaFiles.filter((f) => RE.renewalTerms.test(f.text) || (sharedTerms && /\b\w*renewal\w*\b/i.test(f.text)));
    // Stripe Checkout's own submit-button text counts — it renders beside Stripe's Pay button.
    const stripeSubmitText = code.filter((f) => /custom_text\s*:\s*\{[\s\S]{0,400}submit\s*:/.test(f.text) && RE.renewalTerms.test(f.text));
    if (subs.length === 0) results.push(na(id, title, law, "no recurring subscription checkout found", fix));
    else if (disclosed.length || stripeSubmitText.length) results.push({ id, title, law, status: "PASS", why: "renewal terms sit in the same view as the subscribe button" + (stripeSubmitText.length ? " (incl. Stripe Checkout submit text)" : ""), evidence: [...disclosed, ...stripeSubmitText].map((f) => f.rel).slice(0, 4), fix });
    else results.push({ id, title, law, status: "FAIL", why: ctaFiles.length ? "subscribe/checkout buttons render with no auto-renewal + cancellation copy beside them" + (any(ui, RE.renewalTerms) ? " (renewal terms exist only in a policy page)" : "") : "recurring checkout with no auto-renewal / cancellation copy in the UI", evidence: ctaFiles.length ? ctaFiles.map((f) => f.rel).slice(0, 6) : subs, fix });
  }

  // 6 — DMCA agent for user uploads
  {
    const id = "dmca-agent", title = "Registered DMCA agent + takedown policy", law = "DMCA § 512(c) — without a registered agent, no safe harbor for user uploads";
    const fix = "Register a designated agent at dmca.copyright.gov ($6, renew every 3 years) and publish a /dmca (or terms) section naming that agent with a takedown contact. Registration is a manual step — the code can only publish the policy.";
    // File-level match: storage calls are usually chained across lines.
    const flat = (t: string) => t.replace(/\s*\n\s*/g, "");
    const up = code.filter((f) => !SEEDISH.test(f.rel) && RE.uploadStore.test(flat(f.text))).map((f) => f.rel).slice(0, 6);
    if (up.length === 0) results.push(na(id, title, law, "no server-side storage of user files found", fix));
    else if (any(everything, RE.dmca)) results.push({ id, title, law, status: "WARN", why: "uploads present and a DMCA policy marker exists — confirm the agent is actually registered at dmca.copyright.gov (can't be checked from code)", evidence: hits(everything, RE.dmca, 3), fix });
    else results.push({ id, title, law, status: "FAIL", why: "users can upload files and there is no DMCA policy or agent", evidence: up, fix });
  }

  // Recorded acceptances: a verified false positive downgrades to WARN, reason shown.
  const cfgPath = join(root, "legal-traps.json");
  if (existsSync(cfgPath)) {
    let accept: Record<string, unknown> = {};
    try { accept = (JSON.parse(readFileSync(cfgPath, "utf8")).accept ?? {}) as Record<string, unknown>; } catch {
      results.push({ id: "config", title: "legal-traps.json", law: "—", status: "FAIL", why: "legal-traps.json is not valid JSON", evidence: [cfgPath], fix: "Fix the JSON or delete the file." });
    }
    for (const r of results) {
      const reason = accept[r.id];
      if (r.status === "FAIL" && typeof reason === "string" && reason.trim().length >= 10) {
        r.status = "WARN";
        r.why = `accepted in legal-traps.json: ${reason.trim()}  (scanner saw: ${r.why})`;
      }
    }
  }

  return { root, webApp, files: all.length, results };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
if (import.meta.main) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const target = args.find((a) => !a.startsWith("--"));
  if (!target || !existsSync(target) || !statSync(target).isDirectory()) {
    console.error("usage: bun scripts/check-legal-traps.ts <repo-dir> [--json]");
    process.exit(2);
  }
  const report = scan(resolve(target));
  const failed = report.results.some((r) => r.status === "FAIL");
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const icon: Record<Status, string> = { PASS: "✅", FAIL: "❌", WARN: "⚠️ ", "N/A": "➖" };
    console.log(`Legal launch traps — ${report.root}${report.webApp ? "" : "  (no web app detected)"}\n`);
    for (const r of report.results) {
      console.log(`${icon[r.status]} ${r.status.padEnd(4)} ${r.title}  [${r.law}]`);
      console.log(`        ${r.why}`);
      for (const e of r.evidence) console.log(`        · ${e}`);
      if (r.status === "FAIL" || r.status === "WARN") console.log(`        fix: ${r.fix}`);
    }
    console.log(`\nVerdict: ${failed ? "FAIL — fix the ❌ items before real users arrive" : "no blocking traps found"}  (heuristic scan; not legal advice)`);
  }
  process.exit(failed ? 1 : 0);
}
