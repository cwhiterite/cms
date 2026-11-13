<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	import PortableImage from '#lib/components/PortableImage.svelte';
	import { r2Url, tagLabel, urlFor } from '#lib/sanity.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

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
</svelte:head>

<article class="mx-auto max-w-4xl lg:max-w-7xl">
	<div class={data.post.coverImage ? 'lg:grid lg:grid-cols-12 lg:items-start lg:gap-12' : ''}>
		<!-- Left column: scrolls through header, body text, and secondary galleries -->
		<div class={data.post.coverImage ? 'space-y-10 lg:col-span-7' : 'space-y-10'}>
			<header class="space-y-4">
				<div
					class="flex flex-wrap items-center gap-2 text-xs tracking-wider text-zinc-400 uppercase"
				>
					{#if data.post.tags?.length}
						{#each data.post.tags as tag (tag)}
							<span class="bg-zinc-900 px-2.5 py-0.5 text-zinc-200">{tagLabel(tag)}</span>
						{/each}
					{/if}
					{#if data.post.publishedAt}
						<time datetime={data.post.publishedAt}>{formatDate(data.post.publishedAt)}</time>
					{/if}
				</div>

				<h1 class="text-3xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
					{data.post.title}
				</h1>

				{#if data.post.excerpt}
					<p class="text-lg leading-relaxed text-zinc-400">{data.post.excerpt}</p>
				{/if}
			</header>

			<!-- Mobile / tablet cover image (< lg) -->
			{#if data.post.coverImage}
				<figure class="overflow-hidden bg-zinc-900 lg:hidden">
					<img
						src={urlFor(data.post.coverImage).width(1600).url()}
						alt={data.post.coverImage.alt || data.post.title}
						class="w-full object-cover"
					/>
				</figure>
			{/if}

			{#if Array.isArray(data.post.body) ? data.post.body.length > 0 : Boolean(data.post.body)}
				<div
					class="prose prose-lg max-w-none prose-invert prose-headings:font-semibold prose-a:text-zinc-200"
				>
					<PortableText value={data.post.body} components={{ types: { image: PortableImage } }} />
				</div>
			{/if}

			{#if data.post.gallery?.length}
				<section class="space-y-8 border-t border-zinc-800 pt-10">
					{#each data.post.gallery as item (item._key)}
						<figure class="space-y-2">
							<img
								src={urlFor(item).width(1600).url()}
								alt={item.alt || data.post.title}
								loading="lazy"
								class="w-full bg-zinc-900 object-cover"
							/>
							{#if item.caption}
								<figcaption class="text-center text-sm text-zinc-400">{item.caption}</figcaption>
							{/if}
						</figure>
					{/each}
				</section>
			{/if}

			{#if data.post.r2Gallery?.length}
				<section class="space-y-8 border-t border-zinc-800 pt-10">
					{#each data.post.r2Gallery as item (item._key)}
						<figure class="space-y-2">
							<img
								src={r2Url(item.r2Key)}
								alt={item.alt || data.post.title}
								loading="lazy"
								class="w-full bg-zinc-900 object-cover"
							/>
							{#if item.caption}
								<figcaption class="text-center text-sm text-zinc-400">{item.caption}</figcaption>
							{/if}
						</figure>
					{/each}
				</section>
			{/if}
		</div>

		<!-- Right column: fixed/sticky cover image on desktop (>= lg: 1024px) -->
		{#if data.post.coverImage}
			<div class="hidden lg:sticky lg:top-[6.5rem] lg:col-span-5 lg:block lg:self-start">
				<figure class="overflow-hidden bg-zinc-900">
					<img
						src={urlFor(data.post.coverImage).width(1600).url()}
						alt={data.post.coverImage.alt || data.post.title}
						class="aspect-square w-full object-cover"
					/>
				</figure>
			</div>
		{/if}
	</div>
</article>
