# Regenerate the credits roll:  vhs scripts/credits.tape
# Then optimize:  gifsicle -O3 --lossy=80 --colors 96 docs/assets/hamzaish-credits.gif -o /tmp/o.gif && mv /tmp/o.gif docs/assets/hamzaish-credits.gif
Output "docs/assets/hamzaish-credits.gif"
Set FontSize 20
Set Width 880
Set Height 600
Set Theme "Catppuccin Mocha"
Set Padding 30
Set TypingSpeed 45ms
Hide
Type 'export PATH="$HOME/.bun/bin:$PATH"'
Enter
Type "clear" Enter
Show
Sleep 500ms
Type "bun run credits"
Sleep 500ms
Enter
Sleep 26s
