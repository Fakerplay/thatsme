# Illustration archive implementation plan

Goal: Integrate the approved six-illustration carousel after More of my work and before contact on the homepage.
Architecture: A scoped Astro component renders six original WebP assets with semantic image descriptions; a small standalone client module adds cyclic dragging, dynamic uniform scaling and pointer tilt/lift. Existing Area typography, neutral background, gutters and heading styles are reused.

Constraints: Exact headline “5 years ago. Before AI could draw, I did.”; no eyebrow; full original image proportions; no overlapping cards; infinite drag in both directions. Preserve existing CMS changes.

- [x] Extract the six embedded original images from the downloaded prototype into assets/illustration-archive; keep bytes intact.
- [x] Add IllustrationArchive.astro and its client module; import it immediately before HomeContact. Use reserved maximum-size slots so dynamic scaling and hover never overlap. Add keyboard controls, pause and reduced-motion support, native horizontal fallback and offscreen suspension.
- [x] Run the production build and existing tests. Check desktop/mobile rendering, image ratios, spacing, drag wrapping, hover lift, keyboard and reduced motion in browser.
- [ ] Commit only archive changes, push main through existing GitHub/Vercel integration, and verify the new section and assets on production. Save visual proof.
