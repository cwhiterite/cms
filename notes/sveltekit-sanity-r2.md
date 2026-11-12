# SvelteKit + Sanity + Cloudflare Pages + R2 Blog Setup

An inexpensive, high-performance architecture for an image-heavy editorial blog (similar to Abduzeedo):

* **Sanity:** Structured content, categories/tags, rich text (Portable Text), and a free hosted editorial Studio (`your-project.sanity.studio`).
* **Cloudflare R2:** Zero-egress object storage for large/high-res visual galleries, videos, and downloadable assets (avoiding Sanity free-tier asset bandwidth caps).
* **SvelteKit:** Fast SSR/edge frontend.
* **Cloudflare Pages:** Free hosting with unlimited bandwidth and commercial use allowed.

---

## 1. Create the Sanity Project & Schema

1. Go to [Sanity](https://www.sanity.io/) and sign in (the free plan is plenty for a solo/small editorial blog).
2. Scaffold the Sanity Studio locally in a `studio/` folder (or a separate repo):

```bash
npx create-sanity@latest --template clean --output-path studio
cd studio
```

3. When prompted, create a new project (e.g., `my-blog-cms`), choose the `production` dataset, and select **TypeScript**.
4. Define a blog post schema tailored for a visual inspiration blog in `studio/schemaTypes/post.ts`:

```typescript
import { defineField, defineType } from 'sanity';

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: ['Design', 'UI/UX', '3D', 'Photography', 'Illustration', 'Architecture'],
      },
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image (Sanity CDN)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'r2Gallery',
      title: 'High-Res Gallery Keys (Cloudflare R2)',
      description: 'Store object keys/paths from your R2 bucket (e.g., posts/2026/neon-study/01.jpg)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'r2Key', title: 'R2 Object Key', type: 'string' },
            { name: 'alt', title: 'Alt Text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
  ],
});
```

5. Register `postType` in `studio/schemaTypes/index.ts`:

```typescript
import { postType } from './post';

export const schemaTypes = [postType];
```

6. Deploy the Studio for free to Sanity's hosting (this keeps your Cloudflare Pages bundle small):

```bash
npx sanity deploy
```

7. Save your **Project ID** and **Dataset** (`production`) from `studio/sanity.config.ts` or [sanity.io/manage](https://www.sanity.io/manage).
   * In the Sanity dashboard under **API → CORS origins**, add `http://localhost:5173` and your eventual Cloudflare Pages domain.

---

## 2. Create the Cloudflare R2 Bucket

Use R2 for full-resolution image galleries, ZIP downloads, or videos so you never worry about egress fees or Sanity asset bandwidth limits.

1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **R2 Object Storage** and click **Create bucket** (e.g., `my-blog-media`).
2. Open the bucket's **Settings** tab and enable **Public Access**:
   * **Recommended:** Connect a custom domain (e.g., `media.yourdomain.com`) on Cloudflare DNS so assets benefit from Cloudflare caching and clean URLs.
   * Alternatively, enable the public `r2.dev` subdomain for testing.
3. Save the public base URL (e.g., `https://media.yourdomain.com`).
4. *(Optional — only needed if uploading from a custom script/endpoint rather than the Cloudflare dashboard or R2 CLI)*: Under **R2 → Manage R2 API Tokens**, create an **Object Read & Write** token and save the Access Key ID, Secret Access Key, and S3 Endpoint.

> **Tip for visual blogs:** Compress heavy gallery images locally with **Jpegli** (`cjpegli`, producing ~35% smaller standard `.jpg` files with universal browser/social-preview support) or `.webp`/`.avif` before uploading to R2 so pages load fast without needing paid image transformation add-ons. See the [Jpegli Batch-Compress & R2 Upload](#6-batch-compress-with-jpegli--upload-to-r2-windows) section below.

---

## 3. Scaffold the SvelteKit App

In your parent project directory (outside `studio/`), scaffold a new SvelteKit app:

```bash
npx sv create web
cd web
```

When prompted:
* Choose **SvelteKit minimal** (or demo if you prefer).
* Enable **TypeScript**.
* Install dependencies (`npm install`).

Install the Cloudflare adapter, Sanity client, and Portable Text renderer:

```bash
npm install -D @sveltejs/adapter-cloudflare
npm install @sanity/client @sanity/image-url @portabletext/svelte
```

Update `web/svelte.config.js` to use the Cloudflare adapter:

```javascript
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;
```

Create `web/.env` for local development:

```env
PUBLIC_SANITY_PROJECT_ID="your_sanity_project_id"
PUBLIC_SANITY_DATASET="production"
PUBLIC_R2_BASE_URL="https://media.yourdomain.com"
```

---

## 4. Connect Sanity & R2 in SvelteKit

1. Create `web/src/lib/sanity.ts`:

```typescript
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import {
  PUBLIC_SANITY_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_R2_BASE_URL
} from '$env/static/public';

export const sanity = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  apiVersion: '2025-01-01',
  useCdn: true
});

const builder = imageUrlBuilder(sanity);

export function sanityImageUrl(source: SanityImageSource) {
  return builder.image(source).auto('format');
}

export function r2Url(key: string) {
  const base = PUBLIC_R2_BASE_URL.replace(/\/$/, '');
  const cleanKey = key.replace(/^\//, '');
  return `${base}/${cleanKey}`;
}
```

2. Load posts on your homepage in `web/src/routes/+page.server.ts`:

```typescript
import { sanity } from '$lib/sanity';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
  const posts = await sanity.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0...24] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      category,
      excerpt,
      coverImage
    }
  `);

  // Cache at the Cloudflare edge for 5 minutes, allow stale while revalidating
  setHeaders({
    'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  });

  return { posts };
};
```

3. Render the grid in `web/src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import { sanityImageUrl } from '$lib/sanity';
  let { data } = $props();
</script>

<main>
  <h1>Inspiration Feed</h1>
  <section class="grid">
    {#each data.posts as post (post._id)}
      <article>
        <a href="/posts/{post.slug}">
          {#if post.coverImage}
            <img
              src={sanityImageUrl(post.coverImage).width(800).height(550).url()}
              alt={post.title}
              loading="lazy"
            />
          {/if}
          <h2>{post.title}</h2>
          {#if post.category}
            <span>{post.category}</span>
          {/if}
        </a>
      </article>
    {/each}
  </section>
</main>
```

4. Create the post detail route `web/src/routes/posts/[slug]/+page.server.ts`:

```typescript
import { error } from '@sveltejs/kit';
import { sanity } from '$lib/sanity';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const post = await sanity.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      title,
      publishedAt,
      category,
      coverImage,
      r2Gallery,
      body
    }`,
    { slug: params.slug }
  );

  if (!post) {
    throw error(404, 'Post not found');
  }

  setHeaders({
    'cache-control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
  });

  return { post };
};
```

5. Render the post and R2 gallery in `web/src/routes/posts/[slug]/+page.svelte`:

```svelte
<script lang="ts">
  import { PortableText } from '@portabletext/svelte';
  import { r2Url, sanityImageUrl } from '$lib/sanity';

  let { data } = $props();
</script>

<article>
  <h1>{data.post.title}</h1>

  {#if data.post.coverImage}
    <img
      src={sanityImageUrl(data.post.coverImage).width(1400).url()}
      alt={data.post.title}
    />
  {/if}

  {#if data.post.body}
    <div class="prose">
      <PortableText value={data.post.body} />
    </div>
  {/if}

  {#if data.post.r2Gallery?.length}
    <section class="gallery">
      {#each data.post.r2Gallery as item}
        <figure>
          <img src={r2Url(item.r2Key)} alt={item.alt || data.post.title} loading="lazy" />
          {#if item.caption}
            <figcaption>{item.caption}</figcaption>
          {/if}
        </figure>
      {/each}
    </section>
  {/if}
</article>
```

6. Test locally:

```bash
npm run dev
```

---

## 5. Deploy to Cloudflare Pages

1. Commit your repository (`studio/` and `web/`, or `web/` on its own) and push it to GitHub.
2. Log into the **Cloudflare Dashboard** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select your repository and configure the build settings:
   * **Root directory:** `web` (if `studio/` and `web/` share one repo)
   * **Build command:** `npm run build`
   * **Build output directory:** `.svelte-kit/cloudflare`
4. Open **Environment variables** and add:
   * `PUBLIC_SANITY_PROJECT_ID`
   * `PUBLIC_SANITY_DATASET` (`production`)
   * `PUBLIC_R2_BASE_URL` (`https://media.yourdomain.com`)
5. Click **Save and Deploy**.

Once deployed, your SvelteKit site runs on Cloudflare's edge network with unlimited free bandwidth, your editors publish from `your-project.sanity.studio`, and heavy visual galleries stream directly from R2 with zero egress fees.

---

## 6. Batch-Compress with Jpegli & Upload to R2 (Windows)

Instead of paying for cloud image transforms, you can compress a folder of `.png`/`.jpg` assets locally with **Jpegli** (`cjpegli`) and upload them straight to R2 via `wrangler`.

1. **Install the tools (one-time):**
   * Install `cjpegli` via Scoop (`scoop install main/libjxl`) or download `jxl-x64-windows-static.zip` from the [libjxl Releases](https://github.com/libjxl/libjxl/releases) and add it to your `PATH`.
   * Authenticate Wrangler with Cloudflare:
     ```powershell
     npx wrangler login
     ```

2. **Save a batch script (`upload-gallery.ps1`):**

```powershell
param(
  [Parameter(Mandatory = $true)]
  [string]$SourceDir,

  [Parameter(Mandatory = $true)]
  [string]$R2Prefix,     # e.g. "posts/2026/neon-study"

  [string]$Bucket = "my-blog-media",
  [int]$Quality = 85
)

$outDir = Join-Path $SourceDir "_jpegli"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$files = Get-ChildItem -Path $SourceDir -File | Where-Object {
  $_.Extension -match '^\.(png|jpg|jpeg)$'
}

foreach ($file in $files) {
  $outName = "$($file.BaseName).jpg"
  $outPath = Join-Path $outDir $outName
  $r2Key   = "$($R2Prefix.Trim('/'))/$outName"

  # Compress with Jpegli (progressive JPEG at chosen quality)
  & cjpegli $file.FullName $outPath -q $Quality -p 2
  if ($LASTEXITCODE -ne 0) {
    Write-Error "cjpegli failed on $($file.Name)"
    continue
  }

  # Upload to remote Cloudflare R2 bucket
  & npx wrangler r2 object put "$Bucket/$r2Key" --file="$outPath" --remote --content-type="image/jpeg"
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Uploaded: $r2Key"
  }
}
```

3. **Run it for a post's image folder:**

```powershell
.\upload-gallery.ps1 -SourceDir ".\exports\neon-study" -R2Prefix "posts/2026/neon-study"
```

Then copy the printed `r2Key` paths (e.g., `posts/2026/neon-study/01.jpg`) into your post's **High-Res Gallery Keys** field in Sanity Studio.

---

## Optional Next Steps

* **Direct R2 Uploader in Sanity or SvelteKit:** If you prefer uploading gallery images straight into R2 without opening the Cloudflare dashboard, add an R2 bucket binding (`[[r2_buckets]]` in `web/wrangler.toml`) and a protected SvelteKit `+server.ts` endpoint (or Cloudflare Access on an `/upload` route) that writes directly to `platform.env.MEDIA_BUCKET.put(...)`.
* **Search & Filtering:** For a blog, Sanity GROQ queries handle category filtering and keyword search (`title match $q`) out of the box with no extra database needed.
* **Custom Domain:** Point your domain to Cloudflare DNS and attach it to your Cloudflare Pages project for free SSL and edge caching.

