# Astro Portfolio Migration Implementation Plan

**Goal:** Serve the existing portfolio through Astro while preserving all public pages, media selections, copy, metadata and interactions.

**Architecture:** Astro owns static routing and the shared document layout. Each project becomes an independent JSON content entry. Shared render helpers run at build time; only interaction code and compact guide data reach the browser. Existing styles and media remain intact.

**Tech Stack:** Astro 7.4, Node 24, JavaScript, JSON, existing CSS.

## Global Constraints
- Primary URL: https://studioshubham.vercel.app/
- Preserve all 24 public routes, legacy redirects, analytics and current designs.
- Keep the latest remote performance improvements.
- No invented project facts or unrequested redesign.
- Execute inline under existing migration authorization.

## Implementation
- [x] Capture current page text, links and media as a regression baseline.
- [x] Extract effective project data into src/content/projects/*.json, media maps into src/data, and server-only render helpers into src/lib.
- [x] Create Astro layout, shared navigation/footer/dialog/postcard components and static page routes.
- [x] Separate and bundle browser interactions; retain intro, galleries, filters, guide, lightbox and reduced-motion handling.
- [x] Configure asset preparation, static output, sitemap, robots, legacy URLs and Vercel build.
- [x] Compare all generated pages with the baseline; validate local targets, canonical metadata, media selections and JSON-LD.
- [ ] Commit, push and verify production (desktop and mobile interaction checks passed).
