# Regenerate the hero demo:  vhs scripts/hero.tape
# Then optimize:  gifsicle -O3 --lossy=80 --colors 110 docs/assets/hamzaish-hero.gif -o /tmp/o.gif && mv /tmp/o.gif docs/assets/hamzaish-hero.gif
# Branded welcome card (bun run hero) + a real eval run. Replace with a live idea->scaffold->ship TUI recording when ready.
Output "docs/assets/hamzaish-hero.gif"
Set FontSize 18
Set Width 1100
Set Height 600
Set Theme "Catppuccin Mocha"
Set Padding 24
Set TypingSpeed 38ms
Hide
Type "clear" Enter
Show
Sleep 400ms
Type "bun run hero"
Sleep 400ms
Enter
Sleep 3200ms
Type "bun run eval --no-llm"
Sleep 400ms
Enter
Sleep 4500ms
Type "# real verdicts, not vibes. point your agent here, then build."
Enter
Sleep 2200ms
