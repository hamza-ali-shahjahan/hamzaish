#!/usr/bin/env bun
// Hamzaish hero flow — the README hero GIF's content: a paced replay of the
// plan → receipt → Try next loop a Hamzaish session gives you. Recorded by
// scripts/hero-flow.tape (vhs). Run standalone: bun scripts/hero-flow.ts
// Illustrative demo (labelled on screen): the shapes are the real protocol;
// the product being built is a stand-in.
const C = {
  pink: (s: string) => `\x1b[38;5;213m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  sky: (s: string) => `\x1b[38;5;117m${s}\x1b[0m`,
  green: (s: string) => `\x1b[38;5;114m${s}\x1b[0m`,
  border: (s: string) => `\x1b[38;5;103m${s}\x1b[0m`,
};

// HERO_SPEED scales all pacing (1 = record speed, 0 = instant, for previewing the text)
const SPEED = Number(process.env.HERO_SPEED ?? "1");
const sleep = (ms: number) => Bun.sleep(ms * SPEED);
const out = (s = "") => process.stdout.write(s + "\n");

async function typewriter(prefix: string, text: string, cps = 34) {
  process.stdout.write(prefix);
  for (const ch of text) {
    process.stdout.write(ch);
    await sleep(cps);
  }
  process.stdout.write("\n");
}

const PROMPT = C.pink("❯ ");

async function userTypes(cmd: string) {
  await sleep(500);
  await typewriter(PROMPT, cmd, 34);
  await sleep(600);
}

async function main() {
  // Beat 1 — setup
  out();
  out(C.bold(C.pink("🏭  Hamzaish")) + C.dim("  — factory session opening") + C.dim("   · illustrative demo ·"));
  await sleep(700);
  const setupLines = [
    "reading brain          persona ✓  operating principles ✓",
    "loading portfolio      24 products ✓",
    "latest learnings       loaded ✓   active sprint ✓",
  ];
  for (const l of setupLines) {
    out(C.dim("  " + l));
    await sleep(380);
  }
  out(C.green("  ready.") + C.dim("  every task opens with a plan and closes with a receipt."));
  await sleep(1300);
  out();

  // Beat 2 — the one thing the user types
  await typewriter(PROMPT, "/builder-mode a waitlist page for my coffee-subscription idea", 32);
  await sleep(800);
  out();

  // Beat 3 — the plan
  out(C.bold("🏭 Hamzaish plan"));
  out("- Goal: " + "a live waitlist page people can actually join");
  out("- Steps: scaffold the page · wire the signup · prove it with tests");
  out("- Commands: /full-cycle — builds it end to end with checkpoints");
  out("- Proof before done: tests pass and the page loads, not my word for it");
  await sleep(4600);
  out();

  // Beat 4 — work montage
  const work = [
    "scaffolding…            page + signup form ✓",
    "wiring storage…         signups land in the database ✓",
    "running tests…          12/12 green ✓",
  ];
  for (const l of work) {
    out(C.dim("  " + l));
    await sleep(430);
  }
  await sleep(700);
  out();

  // Beat 5 — receipt #1
  out(C.bold("🏭 Hamzaish receipt"));
  out("- What you got: a working waitlist page, built and saved");
  out("- Checked: 12/12 tests green · page loads locally");
  out("- Recommendation: prove it end to end before showing anyone");
  out(C.sky(C.bold("- Try next: /test — run the full proof")));
  await sleep(4800);
  out();

  // Beat 6 — user only echoes
  await userTypes("/test");
  out(C.dim("  full run…              12/12 tests · signup flow verified ✓"));
  await sleep(700);
  out();
  out(C.bold("🏭 Hamzaish receipt"));
  out("- What you got: proof the page works, end to end");
  out("- Checked: every test green on a fresh run");
  out("- Recommendation: security next — before anyone touches it");
  out(C.sky(C.bold("- Try next: /security-check — audit it")));
  await sleep(4800);
  out();

  // Beat 7 — again
  await userTypes("/security-check");
  out(C.dim("  auditing…              70 checks · 0 findings ✓"));
  await sleep(700);
  out();
  out(C.bold("🏭 Hamzaish receipt"));
  out("- What you got: a clean security bill for the page");
  out("- Checked: 70/70 checks pass · nothing exposed");
  out("- Recommendation: it's ready — put it live");
  out(C.sky(C.bold("- Try next: /ship — deploy it")));
  await sleep(4800);
  out();

  // Beat 8 — the close
  await userTypes("/ship");
  out(C.dim("  deploying…             live URL verified ✓"));
  await sleep(700);
  out();
  out(C.bold("🏭 Hamzaish receipt"));
  out("- What you got: your idea, live — built, proven, checked");
  out("- Checked: tests 12/12 · security 70/70 · deploy verified");
  out("- Recommendation: share the link with 5 real people");
  out(C.sky(C.bold("- Try next: /portfolio-pulse — see it join your portfolio")));
  await sleep(2600);
  out(C.green("  ✓ learning saved") + C.dim(" → the factory is smarter for your next build"));
  await sleep(1600);
  out();
  out("  " + C.bold("You only ever type the Try next.") + "   " + C.sky("→ /builder-mode <your idea>"));
  // hold the final frame; vhs ends the recording before this runs out
  await sleep(20000);
}

main();
