<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	import PortableImage from '#lib/components/PortableImage.svelte';
	import { r2Url, tagLabel, urlFor } from '#lib/sanity.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function sanitizeHex(hex?: string): string | null {
		if (!hex) return null;
		const clean = hex.trim();
		return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(clean) ? clean : null;
	}

	function isLightColor(hex: string): boolean {
		const c = hex.replace('#', '');
		const full =
			c.length === 3
				? c
						.split('')
						.map((x) => x + x)
						.join('')
				: c;
		const r = parseInt(full.substring(0, 2), 16) || 0;
		const g = parseInt(full.substring(2, 4), 16) || 0;
		const b = parseInt(full.substring(4, 6), 16) || 0;
		const yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return yiq >= 128;
	}

	let postBg = $derived(sanitizeHex(data.post.backgroundColor?.hex));
	let isCustomLight = $derived(postBg ? isLightColor(postBg) : null);

	function formatDate(iso?: string) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{data.post.title}</title>
	{#if data.post.excerpt}
		<meta name="description" content={data.post.excerpt} />
	{/if}
	{#if postBg}
		<meta name="theme-color" content={postBg} />
	{/if}
</svelte:head>

<article class="mx-auto max-w-4xl lg:max-w-7xl">
	<div class={data.post.coverImage ? 'lg:grid lg:grid-cols-12 lg:items-start lg:gap-12' : ''}>
		<!-- Left column: scrolls through header, body text, and secondary galleries -->
		<div class={data.post.coverImage ? 'space-y-10 lg:col-span-5' : 'space-y-10'}>
			<header class="space-y-4">
				<div
					class="flex flex-wrap items-center gap-2 text-xs tracking-wider text-[var(--text-muted)] uppercase"
				>
					{#if data.post.tags?.length}
						{#each data.post.tags as tag (tag)}
							<span class="bg-[var(--badge-bg)] px-2.5 py-0.5 text-[var(--badge-text)]"
								>{tagLabel(tag)}</span
							>
						{/each}
					{/if}
					{#if data.post.publishedAt}
						<time datetime={data.post.publishedAt}>{formatDate(data.post.publishedAt)}</time>
					{/if}
				</div>

				<h1
					class="text-5xl leading-tight font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl"
				>
					{data.post.title}
				</h1>

				{#if data.post.excerpt}
					<p class="text-lg leading-relaxed text-[var(--text-secondary)]">{data.post.excerpt}</p>
				{/if}
			</header>

			<!-- Mobile / tablet cover image (< lg) -->
			{#if data.post.coverImage}
				<figure class="overflow-hidden bg-[var(--card-placeholder-bg)] lg:hidden">
					<img
						src={urlFor(data.post.coverImage).width(1600).url()}
						alt={data.post.coverImage.alt || data.post.title}
						style="view-transition-name: cover-{data.post.slug};"
						class="w-full object-cover"
					/>
				</figure>
			{/if}

			{#if Array.isArray(data.post.body) ? data.post.body.length > 0 : Boolean(data.post.body)}
				<div
					class={postBg
						? isCustomLight
							? 'prose prose-lg max-w-none prose-headings:font-semibold'
							: 'prose prose-lg max-w-none prose-invert prose-headings:font-semibold'
						: 'prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold'}
				>
					<PortableText value={data.post.body} components={{ types: { image: PortableImage } }} />
				</div>
			{/if}

			{#if data.post.gallery?.length}
				<section class="space-y-8 border-t border-[var(--border-color)] pt-10">
					{#each data.post.gallery as item (item._key)}
						<figure class="space-y-2">
							<img
								src={urlFor(item).width(1600).url()}
								alt={item.alt || data.post.title}
								loading="lazy"
								class="w-full bg-[var(--card-placeholder-bg)] object-cover"
							/>
							{#if item.caption}
								<figcaption class="text-center text-sm text-[var(--text-muted)]">
									{item.caption}
								</figcaption>
							{/if}
						</figure>
					{/each}
				</section>
			{/if}

			{#if data.post.r2Gallery?.length}
				<section class="space-y-8 border-t border-[var(--border-color)] pt-10">
					{#each data.post.r2Gallery as item (item._key)}
						<figure class="space-y-2">
							<img
								src={r2Url(item.r2Key)}
								alt={item.alt || data.post.title}
								loading="lazy"
								class="w-full bg-[var(--card-placeholder-bg)] object-cover"
							/>
							{#if item.caption}
								<figcaption class="text-center text-sm text-[var(--text-muted)]">
									{item.caption}
								</figcaption>
							{/if}
						</figure>
					{/each}
				</section>
			{/if}
		</div>

		<!-- Right column: fixed/sticky cover image on desktop (>= lg: 1024px) -->
		{#if data.post.coverImage}
			<div class="hidden lg:sticky lg:top-26 lg:col-span-7 lg:block lg:self-start">
				<figure class="overflow-hidden bg-[var(--card-placeholder-bg)]">
					<img
						src={urlFor(data.post.coverImage).width(1600).url()}
						alt={data.post.coverImage.alt || data.post.title}
						style="view-transition-name: cover-{data.post.slug};"
						class="aspect-square w-full object-cover"
					/>
				</figure>
			</div>
		{/if}
	</div>
</article>
