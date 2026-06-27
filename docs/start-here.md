# Start here — build your first thing, no coding required

This page is for one person: you've used **ChatGPT or Gemini in a browser**, you're curious about building something real — and you've **never** opened a "terminal," used "git," or heard of "Claude Code," "repos," "CLIs," or "Bun." Good. You don't need any of that. You need to type a sentence to an AI, which you already do every day. By the end you'll have a working to-do app you built — without writing a line of code. Take it one box at a time; nothing here can break your computer.

## First, the honest part (60 seconds, no surprises)

Hamzaish runs **on an AI assistant called Claude Code** — the thing that does the work. To use it you need a **paid Claude plan**:
- **Claude Pro — about $20/month** is all you need to start. (Max and a pay-as-you-go API exist; you don't need them.)
- **There is no free tier for this.** Better you hear it now than three steps in.

If ~$20/mo is a yes, keep going. If you want to think about it, bookmark this — it'll be here.

## The whole idea (so the rest makes sense)

The "techie" work — installing tools, running a setup command — gets done by **the AI**, because you *ask it in plain English*. You direct; it's the crew. So the path is the same on every computer:

**Get Claude → download Hamzaish (a ZIP, no git) → open the folder in Claude → type one sentence.**

The only thing that changes by machine is **how you start Claude up**. Pick yours:

> **👉 Find your machine:** [🍎 Mac](#mac-or-windows-the-easy-no-terminal-way) · [🪟 Windows](#mac-or-windows-the-easy-no-terminal-way) · [🐧 Linux](#linux-one-command-then-the-ai-takes-over)

> **One thing that trips everyone up:** the setup happens **inside the Claude app (or the Claude terminal) that's looking at the Hamzaish folder** — **not** in a web browser tab, ChatGPT, or a Google search box. Each path below tells you exactly which app to open.

---

## Mac or Windows: the easy, no-terminal way

Claude has a **desktop app** for Mac and Windows — a normal click-to-install program. You never open a terminal; the app's AI does that for you.

### Step 1 — Get Claude Pro + the desktop app
1. Subscribe to **[Claude Pro](https://claude.com/)** (~$20/mo).
2. Go to **[claude.com/download](https://claude.com/download)** and get the app for your computer:
   - **🍎 Mac:** download the `.dmg`, double-click it, drag **Claude** into the **Applications** folder, then open it.
   - **🪟 Windows:** download the `.exe`, double-click it, click through the installer (defaults are fine), then open **Claude** from the Start menu. *(If Windows shows a blue "Windows protected your PC" box, click **More info → Run anyway** — that appears for almost every new app.)*
3. **Log in** (or sign up — same as a ChatGPT signup: email or Google).

**You'll see:** Claude open in its own window. ✅

### Step 2 — Download Hamzaish (one button, no git)
1. Open **[github.com/hamza-ali-shahjahan/hamzaish](https://github.com/hamza-ali-shahjahan/hamzaish)**.
2. Click the green **`< > Code`** button → **Download ZIP**. *(No "git," no "cloning" — just a download.)*
3. **Unzip it** — Mac: double-click the `.zip`. Windows: right-click → **Extract All → Extract**. You get a folder named **`hamzaish-main`**.
4. Drag that folder into your **Documents** so it's easy to find.

### Step 3 — Open the folder in Claude and say the magic words
1. In the Claude app, **open the `hamzaish-main` folder** — look for a **folder icon**, a **+**, or **"Open project."** *(The exact label can vary by app version; if you can't spot it, just type into the chat: "How do I open a local folder in this app?" and Claude will point to it.)*
2. Type this, exactly, and press Enter:
   > **I'm brand new to all this — never used a terminal. Please set me up (install anything you need and run `bun run setup`), explain what you did in plain English, then let's build a simple to-do app.**

**→ Now skip to [What happens next](#what-happens-next-any-computer).**

---

## Linux: one command, then the AI takes over

There's **no Claude desktop app for Linux** yet — so you'll use the official **Claude Code** for your terminal. It's one command to install, and after that the AI does the rest, exactly like the Mac/Windows path. Linux folks usually have a terminal handy; if it's new to you, no stress — you'll only paste two short commands.

**Open your terminal:** open your apps menu and search **`Terminal`** (on most Linux desktops **Ctrl + Alt + T** opens it directly). A window with a prompt and a blinking cursor appears. To paste a command: **Ctrl + Shift + V**, then press Enter.

### Step 1 — Get Claude Pro + install Claude Code
1. Subscribe to **[Claude Pro](https://claude.com/)** (~$20/mo).
2. Paste this into your terminal and press Enter — it installs the official Claude Code:
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```
   **You'll see:** it installs a `claude` command and prints that it's ready. *(If it tells you to open a new terminal, just close this one and open a fresh terminal.)*
3. Log in when prompted — typing `claude` once will walk you through it in your browser.

### Step 2 — Download Hamzaish (no git needed)
On **[the GitHub page](https://github.com/hamza-ali-shahjahan/hamzaish)**, click the green **`< > Code`** button → **Download ZIP**, then unzip it (double-click in your file manager, or `unzip hamzaish-main.zip`). You get a **`hamzaish-main`** folder.

### Step 3 — Open the folder with Claude and say the magic words
1. In the terminal, go into the folder and start Claude:
   ```bash
   cd ~/Downloads/hamzaish-main    # or wherever you unzipped it
   claude
   ```
   *(Tip: type `cd ` with a space, then drag the `hamzaish-main` folder onto the terminal window to paste its path, then Enter.)*
2. Once Claude is running, type:
   > **I'm brand new to all this. Please set me up (install anything you need, like Bun, and run `bun run setup`), explain what you did in plain English, then let's build a simple to-do app.**

**→ Continue to [What happens next](#what-happens-next-any-computer).**

---

## What happens next (any computer)
- Claude **asks permission** before running or installing things — when it shows a command and asks, that's normal and safe; say **yes / allow**. (It uses its *own* terminal; you still never have to.)
- It installs a small tool called **Bun** if your computer lacks it (just what setup runs on — you don't need to understand it).
- It runs **`bun run setup`** — creates your personal files + a search index. Safe on a fresh download, safe to re-run, never deletes your stuff.
- Then it starts building your to-do app.

You did the terminal work by asking for it in a sentence. That's the whole point.

## Your first win 🎉
Keep going — try: *"Let's build the to-do app now — add a task, check it off, delete it. Show me how to see it running."* Claude scaffolds a small app, runs it locally, and gives you a link (like `http://localhost:3000`) to open in your browser. You add a task. **You built that — by describing it.**

From here, the words to remember:
- **`/builder-mode a <thing you want>`** — start any new idea (try `/builder-mode a tip calculator`).
- **Just ask in plain English** — "what did that do?", "make the button blue", "I'm lost, where are we?" are all fair game.

## Jargon decoder
| Word | Plain English |
|---|---|
| Terminal | A text box for typed commands. On Mac/Windows you avoid it; on Linux you paste two commands, then the AI takes over. |
| Repo / folder | A project's folder of files. Hamzaish is one. |
| Clone / git | A developer way to copy a repo. You skip it — "Download ZIP" does the same. |
| Bun | A small free tool Hamzaish runs on. The AI installs it for you. |
| Claude Code | The version of Claude that builds software and runs commands. It powers Hamzaish. |

## If something doesn't work (none of these mean you broke anything)
- **(Mac/Windows) "I can't find where to open a folder."** Look for a folder icon, a **+**, or **"Open project."** Or just ask in the chat: *"How do I open a local project folder in this app?"*
- **(Linux) "`claude` isn't found after installing."** Close the terminal and open a fresh one (the installer adds `claude` to a new terminal's path), then try `claude` again.
- **"It asked to run a command and I got scared."** That's the expected flow — read it, and if it's the setup it described, say **yes**. Unsure? Type *"What will this do and is it safe?"* first.
- **"bun isn't found."** Tell Claude: *"Bun install didn't work — try another way or fix my PATH."* (For the curious: Mac/Linux `curl -fsSL https://bun.sh/install | bash`; Windows `powershell -c "irm bun.sh/install.ps1 | iex"` — but let the agent do it.)
- **"Something about git / `.git` / 'not a repository'."** Ignore it — a ZIP has no git and that's fine; Hamzaish's setup doesn't need it. If a command insists, say *"I downloaded the ZIP, there's no git — set up without it."*
- **"I closed everything — did I lose my work?"** No. Your folder's in Documents (or Downloads). Reopen Claude on the `hamzaish-main` folder and say *"let's pick up where we left off."*
- **Still stuck?** Paste the exact message you see into a Claude chat, or [open an issue](https://github.com/hamza-ali-shahjahan/hamzaish/issues).

When you're comfortable here, the next stop is **[Your first product in 10 minutes](your-first-product.md)** — same style, one level up. You can do this. You already did the hard part: you started.
