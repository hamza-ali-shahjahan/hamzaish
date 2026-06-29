#!/usr/bin/env bun
// Hamzaish hero — a branded "welcome card" for the README hero GIF. Run: bun run hero
// Centered, rounded box (Claude-Code-launch vibe). Hamzaish is the name; Builder Mode is the promise.
const C = {
  pink: (s: string) => `\x1b[38;5;213m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  sky: (s: string) => `\x1b[38;5;117m${s}\x1b[0m`,
  border: (s: string) => `\x1b[38;5;103m${s}\x1b[0m`,
};
const SCREEN = 84; // approx cols at FontSize 18 / Width 1100
const BOX = 54; // inner content width
const strip = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");
const dispW = (s: string) => strip(s).length; // 🏭 is length 2 == its 2-cell width; everything else length==width

const screenPad = " ".repeat(Math.max(0, Math.floor((SCREEN - (BOX + 4)) / 2)));
function line(content = ""): string {
  const pad = BOX - dispW(content);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return screenPad + C.border("│") + " ".repeat(left + 1) + content + " ".repeat(right + 1) + C.border("│");
}
const top = screenPad + C.border("╭" + "─".repeat(BOX + 2) + "╮");
const bot = screenPad + C.border("╰" + "─".repeat(BOX + 2) + "╯");

console.log();
console.log(top);
console.log(line());
console.log(line(C.bold(C.pink("🏭  H A M Z A I S H"))));
console.log(line());
console.log(line(C.bold("Puts you in Builder Mode — and keeps you there.")));
console.log(line());
console.log(line(C.dim("momentum first · validate in the process, not before")));
console.log(line(C.dim("134 practices · 35 agents · 41 playbooks")));
console.log(line());
console.log(line(C.sky("→  /builder-mode  <your idea>")));
console.log(line());
console.log(bot);
console.log();
