---
name: inline-comments-in-piped-bash
description: Never append `# comments` to a `curl … | bash` line you hand a user to copy-paste
type: anti-pattern
---

# No inline comments after `curl … | bash`

**The rule:** when giving a user a one-liner to paste — especially `curl -fsSL <url> | bash` — **never put a trailing `# comment`** (and never an emoji) after it.

**Why:** the comment can mis-parse on paste and SIGPIPE the script. Seen 2026-06-04 with Paxel: lines like `… | bash   # ip-radar, 10 sessions ⭐` failed twice with `bash: #: No such file or directory` + `curl: (56) Failure writing output to destination`, while the identical comment-free lines ran clean. Cost the user two wasted runs on his most important repo.

**Do instead:** put the explanation on its own line *above* the command, or in prose. Keep the command line bare:
```
# ip-radar — 10 sessions (richest)
cd "/path" && curl -fsSL <url> | bash
```

**Applies to:** any copy-paste command block, doc snippet, or README example. Bare command line; commentary elsewhere.
