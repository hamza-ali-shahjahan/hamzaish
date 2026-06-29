#!/usr/bin/env bun
// Hamzaish credits roll — cinematic terminal scroll for a demo GIF. Throwaway.
const W = 60; // center width
const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  accent: (s: string) => `\x1b[38;5;213m${s}\x1b[0m`, // pink
  gold: (s: string) => `\x1b[38;5;222m${s}\x1b[0m`,
  sky: (s: string) => `\x1b[38;5;117m${s}\x1b[0m`,
};
const visLen = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "").length;
const center = (s: string) => " ".repeat(Math.max(0, Math.floor((W - visLen(s)) / 2))) + s;

const lines: Array<[string, number]> = [
  ["", 0], ["", 0], ["", 0], ["", 0], ["", 0], ["", 0],
  [center(C.bold(C.accent("H A M Z A I S H"))), 250],
  [center(C.dim("— credits —")), 250],
  ["", 600],
  [center(C.dim("built on a thousand generosities")), 1100],
  ["", 700],
  [center(C.gold("✦  THE SHOULDERS WE STAND ON  ✦")), 700],
  ["", 350],
  [center(C.bold("Addy Osmani")), 120],
  [center(C.dim("agent-skills — spec → build → ship")), 650],
  [center(C.bold("Andrej Karpathy")), 120],
  [center(C.dim("eval-driven dev + the learning flywheel")), 650],
  [center(C.bold("Garry Tan")), 120],
  [center(C.dim("gbrain — knowledge graph + hybrid retrieval")), 650],
  [center(C.bold("Anthropic")), 120],
  [center(C.dim("the Founder's Playbook — sharpened the framing")), 650],
  [center(C.bold("Nous Research")), 120],
  [center(C.dim("hermes-agent — self-improving skills")), 650],
  [center(C.bold("openclaw")), 120],
  [center(C.dim("multi-channel gateway patterns")), 650],
  [center(C.bold("DietrichGebert")), 120],
  [center(C.dim("ponytail — one skill, ten agents")), 700],
  ["", 600],
  [center(C.gold("✦  THE STACK THAT CARRIES US  ✦")), 600],
  ["", 300],
  [center(C.sky("Bun · Next.js · React · Tailwind · shadcn/ui")), 500],
  [center(C.sky("Supabase · Neon · Clerk · Vercel · Cloudflare")), 500],
  [center(C.sky("Resend · PostHog · Sentry · Groq · VHS")), 750],
  ["", 600],
  [center(C.gold("✦  THE PEOPLE  ✦")), 600],
  ["", 300],
  [center(C.bold("the 4 muakkals")), 120],
  [center(C.dim("the hands tearing down the wall")), 550],
  [center(C.dim("· · · your crew goes here · · ·")), 700],
  ["", 400],
  [center(C.dim("and — last —")), 500],
  [center(C.bold("Hamza Ali")), 120],
  [center(C.dim("an instinct built in Business-SWAT roles at Disrupt.com")), 250],
  [center(C.dim("the shoulders above elevated & sharpened it")), 250],
  [center(C.accent("the credit belongs to them")), 800],
  ["", 800],
  [center(C.gold("✦  AFTER THE CREDITS — YES, YOU  ✦")), 700],
  ["", 400],
  [center("You cloned it. You read this far."), 500],
  [center(C.accent("You're part of it now.")), 900],
  ["", 500],
  [center(C.dim("Build something today.")), 450],
  [center(C.dim("Credit the people who got you there.")), 450],
  [center(C.dim("Be kind in your issues. Generous in your PRs.")), 800],
  ["", 600],
  [center(C.bold(C.accent("Welcome to Builder Mode."))), 250],
  [center(C.bold("We're glad you're here.  🚀")), 1600],
  ["", 0], ["", 0], ["", 0],
];

process.stdout.write("\x1b[?25l"); // hide cursor
for (const [text, pause] of lines) {
  process.stdout.write(text + "\n");
  if (pause) await Bun.sleep(pause);
}
process.stdout.write("\x1b[?25h");
