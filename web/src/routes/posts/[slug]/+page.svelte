<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	import PortableImage from '#lib/components/PortableImage.svelte';
	import { r2Url, urlFor } from '#lib/sanity.ts';
	import { resolve } from '$app/paths';
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

<article class="mx-auto max-w-4xl space-y-10">
	<header class="space-y-4">
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
		>
			← Back to feed
		</a>

		<div class="flex flex-wrap items-center gap-2 text-xs tracking-wider text-zinc-400 uppercase">
			{#if data.post.tags?.length}
				{#each data.post.tags as tag (tag)}
					<a
						href={`${resolve('/')}?tag=${encodeURIComponent(tag)}`}
						class="rounded-full bg-zinc-900 px-2.5 py-0.5 text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
					>
						{tag}
					</a>
				{/each}
			{:else if data.post.category}
				<span class="rounded-full bg-zinc-900 px-2.5 py-0.5 text-zinc-200"
					>{data.post.category}</span
				>
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

	{#if data.post.coverImage}
		<figure class="overflow-hidden rounded-xl bg-zinc-900">
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
						class="w-full rounded-lg bg-zinc-900 object-cover"
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
						class="w-full rounded-lg bg-zinc-900 object-cover"
					/>
					{#if item.caption}
						<figcaption class="text-center text-sm text-zinc-400">{item.caption}</figcaption>
					{/if}
				</figure>
			{/each}
		</section>
	{/if}
</article>
