/**
 * Stripe wiring: check it, or do it — without a single copy-paste.
 *
 *   npm run stripe:check                    # read-only. Safe. Run it often.
 *   STRIPE_SECRET_KEY=sk_test_… npm run stripe:wire -- --env preview
 *
 * WHY THIS EXISTS
 * ---------------
 * Wiring Stripe by hand cost a full afternoon and one payment that took money
 * and delivered nothing. Every minute of it was avoidable: creating a webhook
 * endpoint through the API RETURNS the signing secret, and `vercel env add`
 * reads a value from stdin. One pipes into the other. Nobody ever needs to
 * look at a `whsec_`, pick the right row out of three identically-named ones,
 * or wonder whether it saved.
 *
 * The one paste that cannot be removed is the secret key itself — Stripe has
 * no API for handing you your own API key. So it is supplied as an environment
 * variable by the person running this, in their own terminal. It is never
 * written to a file, never printed, and never passed as a command argument
 * (arguments are visible in `ps`).
 *
 * WHAT THE CHECK CATCHES — every one of these actually happened
 * ------------------------------------------------------------
 *   1. A live key on a preview deployment (guarded, but worth naming).
 *   2. No webhook endpoint at all, while payments were already possible.
 *      Two real payments were taken with nowhere to deliver the confirmation.
 *   3. An endpoint pointing at a URL that no longer exists.
 *   4. A signing secret that does not match — every confirmation refused,
 *      every payment taking money and granting nothing.
 *   5. Another product's endpoint subscribed in the same sandbox, so each
 *      product collects permanent failures from the other's payments.
 *   6. Undelivered events sitting unnoticed.
 */
import Stripe from "stripe";
import { execFileSync } from "node:child_process";

const KEY = process.env.STRIPE_SECRET_KEY;
const args = process.argv.slice(2);
const WIRE = args.includes("--wire");
// No default. Defaulting to "preview" once made a live key look like a
// catastrophe — the key was fine, the comparison was against the wrong
// environment. A tool that guesses which environment you meant will
// eventually guess wrong and report a disaster that is not happening.
const ENV = args[args.indexOf("--env") + 1] as "preview" | "production";
if (ENV !== "preview" && ENV !== "production") {
  console.error("\n  Say which environment: --env production  or  --env preview\n");
  process.exit(1);
}

if (!KEY) {
  console.error("Set STRIPE_SECRET_KEY in your shell. Never in a file, never as an argument.");
  process.exit(1);
}

// A placeholder run verbatim is the most likely first failure, because the
// command is handed over as something to copy and run. Stripe's own answer to
// it — "Invalid API Key provided: sk_live_xxx" — reads like the key is broken
// rather than absent, so catch it here and say what to actually do.
if (/^sk_(live|test)_(x+|your|key|here|xxx.*)$/i.test(KEY) || KEY.length < 20) {
  console.error(`
  That is the placeholder, not a real key — nothing was contacted.

  Get the real one:
    1. https://dashboard.stripe.com/apikeys   (LIVE mode: the "Test mode"
       toggle at the top right must be OFF)
    2. "Secret key" → Reveal → copy
    3. Run the command again with that value in place of the placeholder

  It starts sk_live_ and is about 107 characters. Keep it out of files and
  out of chat — it belongs in this command and nowhere else.
`);
  process.exit(1);
}

const mode = KEY.startsWith("sk_live_") ? "live" : KEY.startsWith("sk_test_") ? "test" : "unknown";
const stripe = new Stripe(KEY);

/** Problems, worst first. `blocking` means do not launch. */
const problems: { blocking: boolean; text: string }[] = [];
const say = (s = "") => console.log(s);
const fail = (text: string) => problems.push({ blocking: true, text });
const warn = (text: string) => problems.push({ blocking: false, text });

async function main() {
  say(`\n  Stripe wiring — ${mode.toUpperCase()} mode, target: ${ENV}\n`);

  if (mode === "unknown") fail("That key is neither sk_test_ nor sk_live_.");
  if (mode === "live" && ENV === "preview") {
    fail("A LIVE key aimed at preview. Staging is public — this charges real cards.");
  }
  if (mode === "test" && ENV === "production") {
    fail("A TEST key aimed at production. Real customers would pay nothing and get everything.");
  }

  const url = targetUrl();
  say(`  Deployment URL:   ${url}`);

  /* ---------------------------------------------------------- endpoints */
  const eps = await stripe.webhookEndpoints.list({ limit: 20 });
  const ours = eps.data.filter((e) => e.url.startsWith(url));
  const foreign = eps.data.filter(
    (e) => !e.url.startsWith(url) && e.enabled_events.includes("checkout.session.completed"),
  );

  say(`  Endpoints here:   ${ours.length}`);
  if (foreign.length) {
    warn(
      `${foreign.length} endpoint(s) from ANOTHER product share this Stripe mode ` +
        `(${foreign.map((e) => new URL(e.url).host).join(", ")}). Each product will collect ` +
        `permanent delivery failures from the other's payments. Give every product its own ` +
        `sandbox — do NOT unsubscribe theirs, they need it.`,
    );
  }

  if (WIRE) {
    await wire(url, ours);
  } else if (!ours.length) {
    fail("No webhook endpoint for this deployment. Any payment taken now delivers nothing.");
  } else if (!ours.some((e) => e.enabled_events.includes("checkout.session.completed"))) {
    fail("An endpoint exists but is not listening for checkout.session.completed.");
  }

  /* ------------------------------------------------------- deliverability */
  // The only honest proof the signing secret matches: did a real event land?
  const events = await stripe.events.list({ limit: 60 });
  // Ours only. One Stripe account commonly serves several products, and every
  // one of their payments appears in this list too. Attributing another
  // product's failure to this one sends somebody hunting a fault they do not
  // have — which is exactly what happened the first time this ran.
  //
  // Our own checkouts always carry `intentId` in metadata; nobody else's do.
  const completed = events.data.filter(
    (e) =>
      e.type === "checkout.session.completed" &&
      Boolean((e.data.object as { metadata?: Record<string, string> }).metadata?.intentId),
  );
  const stuck = completed.filter((e) => e.pending_webhooks > 0);

  if (!completed.length) {
    warn("No payment from THIS product has ever completed in this mode, so the signing " +
         "secret is unproven. " +
         "A wrong one takes money and delivers nothing, and the refund safeguard does not " +
         "catch it — settlement never runs. Make one real payment before launch.");
  } else if (stuck.length === completed.length) {
    fail(`Every one of the last ${completed.length} payment confirmations failed to deliver. ` +
         "That is a signing-secret mismatch. Money in, nothing granted.");
  } else if (stuck.length) {
    warn(`${stuck.length} of the last ${completed.length} confirmations are undelivered.`);
  } else {
    say(`  Delivery:         all ${completed.length} recent confirmations landed ✓`);
  }

  report();
}

/** Where this environment actually lives. */
function targetUrl(): string {
  const explicit = process.env.STRIPE_TARGET_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  throw new Error("Set STRIPE_TARGET_URL to this environment's deployment URL.");
}

/**
 * Create the endpoint and push its signing secret straight into Vercel.
 *
 * The secret exists only in this process's memory and on stdin. It is never
 * logged, never written, never an argument. That is the whole point — the
 * manual route is not merely slower, it is the route where a value gets
 * pasted into the wrong one of three identically-named rows.
 */
async function wire(url: string, existing: Stripe.WebhookEndpoint[]) {
  const endpointUrl = `${url}/api/stripe/webhook`;

  for (const old of existing) {
    say(`  Removing stale endpoint ${old.id}…`);
    await stripe.webhookEndpoints.del(old.id);
  }

  say(`  Creating endpoint → ${endpointUrl}`);
  const created = await stripe.webhookEndpoints.create({
    url: endpointUrl,
    enabled_events: [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
    ],
    description: `${process.env.PRODUCT_NAME ?? "product"} ${ENV}`,
  });

  const secret = created.secret;
  if (!secret) {
    fail("Stripe did not return a signing secret. Nothing was written to Vercel.");
    return;
  }

  setVercelEnv("STRIPE_WEBHOOK_SECRET", secret);
  setVercelEnv("STRIPE_SECRET_KEY", KEY!);
  say("  Wrote both values to Vercel. Neither was printed or written to disk.");
  say("  Redeploy that environment, then run the check again.");
}

/** Replace a Vercel environment variable, value supplied on stdin only. */
function setVercelEnv(name: string, value: string) {
  try {
    execFileSync("npx", ["vercel", "env", "rm", name, ENV, "--yes"], { stdio: "ignore" });
  } catch {
    // Absent is fine — this is a replace, and the first run has nothing to remove.
  }
  execFileSync("npx", ["vercel", "env", "add", name, ENV], {
    input: value,
    stdio: ["pipe", "ignore", "inherit"],
  });
  say(`  ${name} → ${ENV} ✓`);
}

function report() {
  const blocking = problems.filter((p) => p.blocking);
  say("");
  if (!problems.length) {
    say("  Nothing wrong. Payments are wired end to end.\n");
    process.exit(0);
  }
  for (const p of problems) say(`  ${p.blocking ? "STOP" : "note"}  ${p.text}\n`);
  process.exit(blocking.length ? 1 : 0);
}

main().catch((error) => {
  console.error("\n  Could not complete:", error instanceof Error ? error.message : error);
  process.exit(1);
});
