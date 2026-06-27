#!/usr/bin/env python3
"""
Build the Builder Mode banner (docs/assets/builder-mode.png) from the original
full-body meditation illustration (docs/assets/hamza-meditation.png).

Wide, short strip (1920x540) so it doesn't eat vertical space. The whole figure —
head, crossed legs, prayer rug, and the golden orbs — is shown; nothing cropped or
covered. The art bleeds into a navy canvas matching its own background (#080b16),
with a left-edge feather so there's no rectangular seam. Text sits on the left.
Re-run after tweaking geometry:  python3 scripts/build-banner.py
"""
import base64, pathlib, subprocess, tempfile, os

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "docs/assets/hamza-meditation.png"   # 1200 x 896, full body
OUT  = ROOT / "docs/assets/builder-mode.png"
W, H = 1920, 540

# --- source image as a data URI -------------------------------------------------
IMG_W, IMG_H = 1200, 896
b64 = base64.b64encode(SRC.read_bytes()).decode()
data_uri = f"data:image/png;base64,{b64}"

# --- foreground geometry: contain-fit the full figure on the right --------------
fg_h = 500                                  # leaves a small navy margin top/bottom
fg_w = round(IMG_W * fg_h / IMG_H)          # ~670
fg_x = 1900 - fg_w                          # right edge just inside the frame
fg_y = (H - fg_h) // 2

# left-edge feather: fade the art in so it melts into the navy. The figure's body
# sits well right of this, so it stays fully opaque.
feather = 130
fade_end = fg_x + feather
cx = (fg_x + fg_w / 2) / W                   # glow centre tracks the figure

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="#0a0c18"/>
      <stop offset="0.55" stop-color="#080b16"/>
      <stop offset="1"    stop-color="#0b0a14"/>
    </linearGradient>
    <radialGradient id="glow" cx="{cx:.3f}" cy="0.44" r="0.5">
      <stop offset="0" stop-color="#1b1733" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#1b1733" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fademask" x1="{fg_x}" y1="0" x2="{fade_end}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#000"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
    <mask id="fgmask">
      <rect x="{fg_x}" y="{fg_y}" width="{feather}" height="{fg_h}" fill="url(#fademask)"/>
      <rect x="{fade_end}" y="{fg_y}" width="{fg_w - feather}" height="{fg_h}" fill="#fff"/>
    </mask>
  </defs>

  <!-- canvas -->
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>

  <!-- full-body illustration (figure + orbs), nothing cropped, feathered into navy -->
  <image xlink:href="{data_uri}" href="{data_uri}"
         x="{fg_x}" y="{fg_y}" width="{fg_w}" height="{fg_h}" mask="url(#fgmask)"/>

  <!-- thin gold frame -->
  <rect x="16" y="16" width="{W-32}" height="{H-32}" rx="20"
        fill="none" stroke="#c9a24a" stroke-opacity="0.45" stroke-width="2"/>

  <!-- ===== left-hand copy ===== -->
  <text x="92" y="150" font-family="Helvetica, Arial, sans-serif" font-size="26"
        font-weight="700" letter-spacing="8" fill="#c9a24a">HAMZAISH</text>

  <text x="86" y="258" font-family="Georgia, 'Times New Roman', serif" font-size="86"
        font-weight="700" fill="#f4ead6">Builder Mode</text>

  <rect x="92" y="298" width="116" height="3" rx="1.5" fill="#c9a24a" fill-opacity="0.8"/>

  <text x="92" y="356" font-family="Georgia, 'Times New Roman', serif" font-style="italic"
        font-size="31" fill="#c3bdd2">Momentum first. Strategy second.</text>

  <text x="92" y="412" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="600"
        letter-spacing="0.5" fill="#e0a93f">Build better&#160;&#160;·&#160;&#160;Build faster&#160;&#160;·&#160;&#160;Build more</text>

  <text x="92" y="506" font-family="Helvetica, Arial, sans-serif" font-size="20"
        letter-spacing="1" fill="#7b7790">github.com/hamza-ali-shahjahan/hamzaish&#160;&#160;·&#160;&#160;open source</text>
</svg>
"""

# Render via a throwaway SVG (it embeds the image as base64 — never keep it on disk).
with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as tmp:
    tmp.write(svg)
    tmp_path = tmp.name
try:
    subprocess.run(["rsvg-convert", "-o", str(OUT), tmp_path], check=True)
finally:
    os.unlink(tmp_path)
print(f"wrote {OUT}  ({W}x{H}, fg {fg_w}x{fg_h} at x={fg_x}, feather={feather})")
