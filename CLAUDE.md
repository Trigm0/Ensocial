# Alpha

First web project. This file is auto-loaded by Claude Code when working in this folder, so it carries context across conversations.

## Goal
Website for **Mediafy** — a full-stack marketing agency. Story anchors on **efficiency and quality**, proven through outcomes. Do **not** pitch "AI" overtly — no "AI-native", "AI-powered", "AI agents" in copy. The animations and delivery metrics carry the implication.

Narrative arc:
1. Hero (lite, built elsewhere) — the promise of speed
2. Services — what we ship, each with a delivery time attached (efficiency claim)
3. Clientele — marquee, metrics, case studies, testimonials (proof)
4. Process — our rhythm, 4-week cycle (why we can ship that fast)
5. Contact — start one

- Palette: deep purple (#7c3aed / #5b21b6 / #4c1d95), black (#050507 / #0a0a0f), white. No teal.
- Must be fully functional and animated throughout.
- Hero is minimal here; real hero lives outside this page.

Sections: nav, hero-lite, services (6 cards with animated SVG graphics), clientele (marquee + metrics + cases + testimonials), process, **difference** (interactive scrubber: Mediafy vs traditional agency timeline), **faq** (accordion), contact, footer.

Interactive layer (global):
- Scroll progress bar (top, 2px, purple gradient)
- Custom cursor (purple dot + lagging ring, grows on hoverable elements, `mix-blend-mode: difference`)
- Floating "Book a call" CTA (bottom-right, appears after 700px scroll, hides near footer)

## Stack
- Plain HTML / CSS / JavaScript (no build tools yet)

## Owner
Shashwat (macOS, beginner to web dev as of 2026-04-23)

## Decisions log
- 2026-04-23: Installed Homebrew, Node.js 25.9, VS Code 1.117. Started with plain HTML/CSS/JS for learning fundamentals before introducing build tools.

## Notes
_Add anything worth remembering between sessions here._
