# Regenerate the hero demo:  vhs scripts/hero-flow.tape
# Then optimize:  gifsicle -O3 --lossy=80 --colors 110 docs/assets/hamzaish-hero-card.gif -o /tmp/o.gif && mv /tmp/o.gif docs/assets/hamzaish-hero-card.gif
# The plan → receipt → Try next loop, replayed by scripts/hero-flow.ts (which paces itself).
Output "docs/assets/hamzaish-hero-card.gif"
Set FontSize 18
Set Width 1100
Set Height 600
Set Theme "Catppuccin Mocha"
Set Padding 24
Set Framerate 20
Hide
Type "clear && bun scripts/hero-flow.ts" Enter
Show
Sleep 42.5s
