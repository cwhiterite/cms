# Creating & Publishing a Blog Post

Your blog supports three ways to add visual media:

1. **Sanity CDN Cover & Secondary Images (`coverImage` & `gallery`):** Drag-and-drop directly in Sanity Studio. Best for standard posts with 1–10 secondary images. Sanity automatically resizes and serves optimized WebP/AVIF without needing Cloudflare R2.
2. **Sanity CDN Inline Images (`body`):** Insert images directly between paragraphs in the rich text editor (with alt text and captions).
3. **Cloudflare R2 (`r2Gallery`):** Used for large 10+ image high-res showcases, large photography collections, or downloadable assets to bypass CMS quotas with zero egress fees.

---

## Step 1: Optimize Gallery Images with Jpegli (Optional, Recommended for R2)

Before uploading a batch of heavy `.png` or `.jpg` images to R2, compress them locally with **Jpegli** (`cjpegli`) for ~35% smaller standard `.jpg` files:

```powershell
cjpegli input.png 01.jpg -q 85 -p 2
```

* `-q 85`: Quality target (use `85–90` for detailed UI/3D/photography work).
* `-p 2`: Progressive JPEG encoding.

*(See [sveltekit-sanity-r2.md](./sveltekit-sanity-r2.md#6-batch-compress-with-jpegli--upload-to-r2-windows) for the batch PowerShell `upload-gallery.ps1` script.)*

---

## Step 2: Upload Gallery Images to Cloudflare R2

Pick a clean folder path inside your **`blog-media`** bucket, e.g.:

`posts/2026/neon-study/01.jpg`

You can upload via either method:

### Option A: Cloudflare Dashboard
1. Open **R2 Object Storage → `blog-media`**.
2. Upload your images into a folder path like `posts/2026/neon-study/`.
3. Note the object key (everything after the bucket name, e.g. `posts/2026/neon-study/01.jpg`).

### Option B: Wrangler CLI
```powershell
npx wrangler r2 object put "blog-media/posts/2026/neon-study/01.jpg" --file=".\01.jpg" --remote --content-type="image/jpeg"
```

---

## Step 3: Create the Post in Sanity Studio

1. Open **`https://cwhiterite.sanity.studio/`**.
2. Click **Post → Create new**.
3. Fill in the fields:
   * **Title:** Post headline.
   * **Slug:** Click **Generate** (this sets `/posts/<your-slug>`).
   * **Published At:** Defaults to now; adjust if needed.
   * **Category:** Pick one (`Design`, `UI/UX`, `3D`, `Photography`, `Illustration`, `Architecture`).
   * **Excerpt:** Short 1–2 sentence summary shown on the homepage grid and `<meta name="description">`.
   * **Cover Image (Sanity CDN):** Upload a **`1600×1600`** master image and fill in **Alternative Text**. *(Use Sanity's hotspot picker if needed—the homepage serves `800×800` for 1-column cards and `1600×800` for 2-column wide cards, and the post page serves `1600px` wide.)*
   * **Secondary Images (Sanity CDN):** Upload 1–10 images directly via drag & drop or file browse (with optional alternative text and captions). Perfect for standard posts without needing R2.
   * **Body:** Write article text and optionally insert inline Sanity images (`≤1400px` wide recommended) with captions.
   * **High-Res Gallery Keys (Cloudflare R2):** Optional for large 10+ image sets. Click **Add item** for each R2 image and enter:
     * **R2 Object Key:** `posts/2026/neon-study/01.jpg` *(path only — do NOT paste the full `https://...` domain)*
     * **Alternative Text:** Brief description for accessibility.
     * **Caption:** Optional caption shown below the image.
4. Click **Publish**.

---

## Step 4: Preview & Caching Notes

* **Local preview:** Run `npm run dev` in `web/` and visit `http://localhost:5173`.
* **Live edge cache:** Once deployed on Cloudflare Pages:
  * The homepage feed caches at the edge for **5 minutes** (`s-maxage=300`, `stale-while-revalidate=600`).
  * Individual post pages cache at the edge for **1 hour** (`s-maxage=3600`, `stale-while-revalidate=86400`).
  *(If you republish a fix to an existing post and don't see it right away on the live domain, wait for the cache window or purge cache in Cloudflare.)*

---

## Adding or Renaming Categories

Categories are defined in two places so Studio dropdowns and site navigation stay in sync:

1. **`studio/schemaTypes/post.ts`** — update the `category` field's `options.list` array, then run `npx sanity deploy` inside `studio/`.
2. **`web/src/lib/sanity.ts`** — update the `CATEGORIES` array so the navbar filter links match.

