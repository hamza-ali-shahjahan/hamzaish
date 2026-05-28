# Landing Page Template

A minimal HTML/Tailwind landing page for products that don't need a full Next.js app yet (idea-stage validation, waitlist page, link-in-bio).

## Files
- `index.html` — single-page landing with hero, value props, CTA, footer
- `style.css` — Tailwind via CDN, minimal additions
- `script.js` — waitlist form submit handler

## Use
1. Edit `index.html` — replace `{{PLACEHOLDERS}}` with product copy
2. Configure waitlist form (`script.js`) — point at Resend/Tally/your own endpoint
3. Deploy to GitHub Pages, Vercel, or any static host
4. Domain: point to the host
5. Add to Search Console for SEO tracking from day 1

## When to use this vs. the full Next.js starter
- Idea stage, no real product yet → this
- MVP onwards → full starter
