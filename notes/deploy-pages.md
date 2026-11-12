# Cloudflare Pages Deployment Notes

* **Live URL:** `https://cms-41w.pages.dev/`
* **Repo:** `https://github.com/cwhiterite/cms` (pushing to `main` triggers automatic rebuilds)

## Setup Reference

1. In **Cloudflare Dashboard → Workers & Pages → Create**, choose **Pages** (look for the **Pages** tab / *"Looking to deploy Pages?"* link — not the default Workers screen) → **Import an existing Git repository** → `cwhiterite/cms`.
2. Build configuration:
   * **Root directory:** `web`
   * **Build command:** `npm run build` *(runs `vite build`)*
   * **Build output directory:** `.svelte-kit/cloudflare`
3. Public environment variables (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `PUBLIC_R2_BASE_URL`):
   * Defined in `web/wrangler.jsonc` (`"vars"`) with fallbacks in `web/src/env.ts` (and mirrored in `web/.env` locally), because when `wrangler.jsonc` is present Cloudflare Pages reads config from it instead of Dashboard build variables.
   * **Important:** Only put public values in `wrangler.jsonc`; if you ever add a private token (e.g., `SANITY_API_READ_TOKEN`), put it in Cloudflare Pages encrypted secrets, never in `wrangler.jsonc`.
4. Sanity CORS origins (`sanity.io/manage` → project `jsv8msl0` → **API → CORS origins**):
   * `http://localhost:3333` (local Sanity Studio)
   * `http://localhost:5173` (local SvelteKit dev)
   * `https://cms-41w.pages.dev` (live Cloudflare Pages site — add your custom domain here too if you attach one later)
