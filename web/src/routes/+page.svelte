<script lang="ts">
	import { tagLabel, urlFor } from '#lib/sanity.ts';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatDate(iso?: string) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<section class="space-y-8">
	<div class="flex items-baseline justify-between border-b border-(--border-color) pb-4">
		<h1 class="text-2xl font-semibold tracking-tight text-(--text-primary)">
			{tagLabel(data.activeTag) || 'Latest Inspiration'}
		</h1>
		<span class="text-xs tracking-wider text-(--text-secondary) uppercase">
			{data.posts.length}
			{data.posts.length === 1 ? 'post' : 'posts'}
		</span>
	</div>

	{#if data.posts.length > 0}
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.posts as post, i (post._id)}
				{@const isWide = i % 5 === 3}
				<article class={isWide ? 'group lg:col-span-2' : 'group'}>
					<a href={resolve('/posts/[slug]', { slug: post.slug })} class="block space-y-3">
						<div
							class={isWide
								? 'aspect-square overflow-hidden bg-(--card-placeholder-bg) lg:aspect-2/1'
								: 'aspect-square overflow-hidden bg-(--card-placeholder-bg)'}
						>
							{#if post.coverImage}
								<img
									src={urlFor(post.coverImage)
										.width(isWide ? 1600 : 800)
										.height(800)
										.fit('crop')
										.url()}
									alt={post.coverImage.alt || post.title}
									style="view-transition-name: cover-{post.slug};"
									loading="lazy"
									class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
								/>
							{:else}
								<div
									class="flex h-full items-center justify-center text-sm text-(--text-secondary)"
								>
									No cover image
								</div>
							{/if}
						</div>

						<div class="space-y-2.5">
							<div class="flex items-center gap-2 text-xs text-(--text-secondary)">
								{#if post.tags?.length}
									{#each post.tags as tag (tag)}
										<span class="bg-(--badge-bg) px-2.5 py-0.5 text-(--badge-text)"
											>{tagLabel(tag).toUpperCase()}</span
										>
									{/each}
								{/if}
								{#if post.publishedAt}
									<time datetime={post.publishedAt}
										>{formatDate(post.publishedAt).toUpperCase()}</time
									>
								{/if}
							</div>

							<h2
								class="text-lg leading-snug font-medium text-(--text-primary) transition group-hover:text-(--text-secondary)"
							>
								{post.title}
							</h2>

							{#if post.excerpt}
								<p class="line-clamp-2 text-sm text-(--text-secondary)">{post.excerpt}</p>
							{/if}
						</div>
					</a>
				</article>
			{/each}
		</div>
	{:else}
		<div class="border border-dashed border-(--border-color) bg-(--badge-bg)/40 p-12 text-center">
			<p class="text-(--text-primary)">No published posts found yet.</p>
			<p class="mt-2 text-sm text-(--text-secondary)">
				Publish your first post in
				<a
					href="https://cwhiterite.sanity.studio/"
					target="_blank"
					rel="noreferrer"
					class="text-(--text-primary) underline underline-offset-4 hover:opacity-80"
				>
					Sanity Studio
				</a>
				and refresh this page.
			</p>
		</div>
	{/if}
</section>
