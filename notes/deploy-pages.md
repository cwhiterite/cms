### Ready to deploy on Cloudflare Pages

1. In **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**, pick `cwhiterite/cms`.
2. Set the build configuration:
   - **Root directory:** `web`
   - **Build command:** `npm run build`
   - **Build output directory:** `.svelte-kit/cloudflare`
3. Under **Environment variables**, copy the 3 values from [web/.env](file:///c:/Users/cwhite/Documents/Projects/cms/web/.env):
   - `PUBLIC_SANITY_PROJECT_ID`
   - `PUBLIC_SANITY_DATASET`
   - `PUBLIC_R2_BASE_URL`
4. After deploy, add your live `https://<your-site>.pages.dev` URL to **Sanity → Project `jsv8msl0` → API → CORS origins**.
