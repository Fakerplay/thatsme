# Editing portfolio case studies

Space: https://app.storyblok.com/#/me/spaces/296035515443427/stories/0/0/index/0

Open **Content → Projects**, then select a case study. Click the text or media in the visual preview, or use the fields on the right.

- Edit the title, summary, role, year and context.
- Edit project links and their labels.
- Add, remove and reorder Media blocks. Choose **Full width** for text-heavy images, or **Paired** for two-column media. Mobile uses one column.
- Replace a media asset with an image, GIF or MP4; add a poster for a video.
- **Save** keeps a draft. **Publish** starts a Vercel rebuild; allow the deployment to finish before checking the live website.

Existing media references the portfolio's public assets. Upload replacements through Storyblok's asset picker. The import retains the approved motion-first order and full images without cropping.

## Architecture

Public pages are prerendered from published Storyblok content. Only `/editor/project/:id/` renders on demand. Editor requests require Storyblok's signed, one-hour preview URL; draft access tokens remain on the server. Preview responses are private, uncached, and noindex. The bridge updates the visual preview while editing and reloads after saving.

Vercel environment variables: `STORYBLOK_DELIVERY_API_TOKEN`, `STORYBLOK_PREVIEW_TOKEN`, `STORYBLOK_SPACE_ID`, `STORYBLOK_REGION`. Local values are in ignored `.env`. Never commit credentials.

The Publish/unpublish webhook triggers the Vercel main-branch deploy hook. Website content only changes after a successful rebuild. API/auth failures fail the build and retain the previous deployment.

Scope: the existing 20 case studies. Homepage project selection and new project routes still come from the repository. Unpublishing a story currently restores its original repository content; it does not remove the route. To remove a project entirely, update the repository too.

The import scripts are one-time migration tools. Re-running the import skips existing stories and components. The import bundle is a snapshot, not the source for subsequent edits.
