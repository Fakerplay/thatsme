# Shubham Shinde — Portfolio

Astro 7 static portfolio. Production: https://studioshubham.vercel.app/

## Develop

Use Node 24 (minimum 22.22):

```sh
npm ci
npm run dev
```

## Build and check

```sh
npm run build
npm test
npm run preview
```

Astro writes the 24 public pages, 404, sitemap and robots file into `dist/`. Vercel builds this directory on pushes to main. Analytics is included on Vercel builds only. The former Vercel domain permanently redirects to the primary domain.

## Editing

- `src/content/projects/*.json`: one file per case study. Edit copy, role, links, captions and asset selection here. `order` controls newest-first presentation. Astro validates required fields and matching captions during builds.
- `src/data/portfolio.json`: media file paths/dimensions, tag styles, film links and homepage media exclusions. All existing curated selections are preserved.
- `src/pages/`: homepage, About, Work, case-study index and project routes.
- `src/layouts/Portfolio.astro`: shared page shell, metadata, browser data and analytics.
- `src/components/`: navigation, footer, postcard, dialogs, homepage sections and shared gallery.
- `src/lib/render.js`: server-only presentation helpers for existing case-study and About layouts; these do not run in the browser.
- `src/scripts/interactions.js`: gallery motion, filters, lightbox, guide and navigation.
- `src/styles/portfolio.css` and `assets/*.css`: approved styles. HeadAssets preserves their cascade order.
- `assets/`: original media and fonts. The prebuild step copies them into ignored `public/assets`; do not edit generated `public/` or `dist/`.

Project URLs remain `/project/<id>/`. A new project JSON creates its route automatically. Register its media in `src/data/portfolio.json`, add captions in the same order, and choose a unique numeric `order`.

## Compatibility

The small root-level HTML files are redirects for the former GitHub Pages site, not editable page sources. Legacy About and Approach addresses remain available. `scripts/build.cjs` and `scripts/vercel-build.cjs` forward to the Astro build for older tooling. The former monolithic HTML/VM generator has been removed.

## Migration validation

All 24 pages were compared with the previous generated HTML for identical main text, links, images/video selections and ordering. Static checks cover metadata, headings, structured data, local assets and primary canonicals. Browser checks cover the intro, postcard, guide, filters, image lightbox and mobile navigation. No design or copy changes were part of this migration.
