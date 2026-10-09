# Shubham Shinde — Portfolio

## Editing and building

The shared source is `src/site.html`. It contains the page templates, project data and interactions. Styles and media live in `assets/`.

After editing, run:

```sh
node scripts/build.cjs
python3 scripts/check-static.py
```

The dependency-free build writes the homepage, About, Work, Studies and all project pages as complete HTML. Generated `index.html` files are deployment artifacts; do not edit them independently. Browser JavaScript enhances galleries, filters, dialogs and motion. Content and company links are present without JavaScript.

Serve the repository root with any static server. GitHub Pages deploys the root of the main branch. Old `#/about`, `#/project/...` links and legacy About/Approach HTML URLs remain supported. Removed Approach links resolve to About.

## SEO configuration

The canonical base defaults to `https://fakerplay.github.io/thatsme/`. For a custom domain, build with `SITE_URL=https://your-domain.example/ node scripts/build.cjs`.

Each public page has a unique title, description, canonical URL, social sharing metadata, and JSON-LD. `sitemap.xml` lists the 22 current pages; redirects and development previews are excluded. Structured data describes visible portfolio facts and does not assert ownership of client films.

`robots.txt` is generated for root-domain deployment. On a GitHub project site, `/thatsme/robots.txt` is not the host's authoritative robots file: that must live at `https://fakerplay.github.io/robots.txt` in the account-level Pages repository. No host-root access change is made by this build. A missing robots file does not itself block crawling.

After deployment, inspect the final host's robots and HTTP responses, submit the sitemap in Search Console, and request inspection of the homepage, About, and representative projects. Search Console verification requires access to the property. Structured data and sitemap validity do not guarantee indexing, rankings or AI recommendations.

Keep preview pages private or mark them `noindex` when hosting them. The separate printable résumé is `Shubham-Shinde-Resume.html`.

Original project media and artwork belong to their respective owners. No redistribution license is granted.
