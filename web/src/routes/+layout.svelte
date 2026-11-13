<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { TAGS } from '#lib/sanity.ts';
	import { resolve } from '$app/paths';
	import { onNavigate } from '$app/navigation';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Inspiration Feed</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
	<header class="sticky top-0 z-20 h-16 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
		<div class="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
			<a href={resolve('/')} class="text-lg font-semibold tracking-tight text-white">
				Studio<span class="text-zinc-400">Feed</span>
			</a>

			<nav class="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
				<a href={resolve('/')} class="px-3 py-1 transition hover:text-white"> All </a>
				{#each TAGS as tag (tag.value)}
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={`${resolve('/')}?tag=${encodeURIComponent(tag.value)}`}
						class="px-3 py-1 transition hover:text-white"
					>
						{tag.label}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/each}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
		{@render children()}
	</main>
</div>
