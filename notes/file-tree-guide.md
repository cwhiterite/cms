# Project File Tree & Architecture Guide

This project uses two main folders inside `cms/`:

* **`studio/`** — Your Sanity CMS schema & Studio configuration (hosted at `https://cwhiterite.sanity.studio/`).
* **`web/`** — Your SvelteKit + Tailwind CSS public blog (configured for Cloudflare Pages + Cloudflare R2).
* **`notes/`** — Project documentation and workflows.

---

## Quick Reference: Your Setup

| Service | Details |
| :--- | :--- |
| **Live Site (Cloudflare Pages)** | `https://cms-41w.pages.dev/` |
| **GitHub Repo** | `https://github.com/cwhiterite/cms` (`main` branch auto-deploys `web/`) |
| **Sanity Project ID** | `jsv8msl0` (`production` dataset) |
| **Sanity Studio URL** | `https://cwhiterite.sanity.studio/` |
| **Cloudflare R2 Bucket** | `blog-media` |
| **R2 Public URL** | `https://pub-110cf5f016a3427785e66eefdb5710df.r2.dev` |
| **Local Dev URL** | `http://localhost:5173` (`cd web` → `npm run dev`) |

---

## Files You Will Actually Edit

### 1. `studio/` (CMS Content Model)
You only need to touch these when changing what fields a post has:

* **`studio/schemaTypes/post.ts`**
  Defines the `post` document fields (`title`, `slug`, `publishedAt`, `category`, `excerpt`, `coverImage`, `r2Gallery`, and `body`).
* **`studio/schemaTypes/index.ts`**
  Exports `schemaTypes` so Sanity Studio knows about `postType` (and any new types you add later, like `author` or `about`).
* **`studio/sanity.config.ts`** & **`studio/sanity.cli.ts`**
  Stores your Sanity `projectId`, `dataset`, and deployment `appId` (`f7moqwhkjvfa2rbove8oc9x6`).

> **After editing anything in `studio/`:** Run `npx sanity deploy` inside `studio/` so `https://cwhiterite.sanity.studio/` updates.

---

### 2. `web/` (Public Blog Frontend)

#### Data, Helpers & Env
* **`web/src/lib/sanity.ts`**
  * Creates the Sanity client (`sanity`) and image URL helper (`urlFor`).
  * Builds full R2 URLs via `r2Url(key)` using `PUBLIC_R2_BASE_URL`.
  * Holds your GROQ queries (`postsQuery`, `postBySlugQuery`) and `CATEGORIES` list.
* **`web/.env`** *(gitignored — local only)*
  Holds `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, and `PUBLIC_R2_BASE_URL` for local development.
* **`web/wrangler.jsonc`**
  Cloudflare Pages config (`pages_build_output_dir: .svelte-kit/cloudflare`) plus public `"vars"` used in production.
* **`web/.env.example`**
  Template showing which environment variables the app needs.

#### Pages & Components (Look & Feel)
* **`web/src/routes/+layout.svelte`**
  Global page wrapper, top navigation bar, and category filter links.
* **`web/src/routes/layout.css`**
  Tailwind CSS entry file (`@import 'tailwindcss';` and `@plugin '@tailwindcss/typography';`).
* **`web/src/routes/+page.server.ts`** & **`web/src/routes/+page.svelte`**
  Homepage feed: fetches up to 24 posts (optionally filtered by `?category=...`), sets Cloudflare edge `cache-control` headers, and renders the 3-column card grid.
* **`web/src/routes/posts/[slug]/+page.server.ts`** & **`web/src/routes/posts/[slug]/+page.svelte`**
  Post detail page: fetches a single post by slug, renders `coverImage`, Portable Text `body`, and the full-width `r2Gallery` images.
* **`web/src/lib/components/PortableImage.svelte`**
  Renders inline images embedded inside a post's Portable Text `body`.

---

## Plumbing Files You Can Ignore

These are auto-generated or tool/build configs you normally never edit by hand:

* `node_modules/` — Installed npm packages.
* `web/.svelte-kit/` — SvelteKit build/type cache.
* `web/worker-configuration.d.ts` — Auto-generated Cloudflare Worker types (`npm run gen`).
* `web/src/env.ts` — Declares public env vars and fallback defaults for SvelteKit 3 (`defineEnvVars`).
* `web/vite.config.ts`, `web/tsconfig.json`, `web/eslint.config.js`, `web/prettier.config.js`, `package-lock.json`.

---

## Common Commands

### Run the blog locally
```powershell
cd web
npm run dev
```

### Verify types, lint, and production build (`web/`)
```powershell
cd web
npm run check
npm run lint
npm run build
```

### Update Cloudflare types (if you edit `wrangler.jsonc` or `.env` keys)
```powershell
cd web
npm run gen
```

### Deploy Studio changes (`studio/`)
```powershell
cd studio
npx sanity deploy
```

