<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { TAGS, type PostDetail } from '#lib/sanity.ts';
	import { resolve } from '$app/paths';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	function sanitizeHex(hex?: unknown): string | null {
		if (typeof hex !== 'string') return null;
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

	const post = $derived((page.data as { post?: PostDetail })?.post);
	const postBg = $derived(sanitizeHex(post?.backgroundColor?.hex));
	const isCustomLight = $derived(postBg ? isLightColor(postBg) : null);

	const customThemeStyle = $derived(
		postBg
			? isCustomLight
				? `--page-bg: ${postBg}; --text-primary: #09090b; --text-secondary: #52525b; --text-muted: #71717a; --border-color: rgba(0, 0, 0, 0.12); --badge-bg: rgba(0, 0, 0, 0.06); --badge-text: #18181b; --card-placeholder-bg: rgba(0, 0, 0, 0.04); --header-bg: color-mix(in srgb, ${postBg} 85%, transparent); --nav-hover: #09090b;`
				: `--page-bg: ${postBg}; --text-primary: #ffffff; --text-secondary: #a1a1aa; --text-muted: #71717a; --border-color: rgba(255, 255, 255, 0.15); --badge-bg: rgba(255, 255, 255, 0.1); --badge-text: #f4f4f5; --card-placeholder-bg: rgba(255, 255, 255, 0.06); --header-bg: color-mix(in srgb, ${postBg} 85%, transparent); --nav-hover: #ffffff;`
			: undefined
	);

	$effect(() => {
		if (postBg) {
			document.documentElement.style.setProperty('--page-bg', postBg);
			return () => {
				document.documentElement.style.removeProperty('--page-bg');
			};
		}
	});

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
	{#if postBg}
		<meta name="theme-color" content={postBg} />
	{/if}
</svelte:head>

<div
	class="min-h-screen text-[var(--text-primary)] antialiased transition-colors duration-300"
	style="background-color: var(--page-bg); {customThemeStyle ?? ''}"
>
	<header
		class="sticky top-0 z-20 border-b border-[var(--border-color)] pt-[env(safe-area-inset-top)] backdrop-blur transition-colors duration-300"
		style="background-color: var(--header-bg);"
	>
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
			<a
				href={resolve('/')}
				class="text-lg font-semibold tracking-tight text-[var(--text-primary)]"
			>
				Studio<span class="text-[var(--text-muted)]">Feed</span>
			</a>

			<nav class="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
				<a href={resolve('/')} class="px-3 py-1 transition hover:text-[var(--nav-hover)]"> All </a>
				{#each TAGS as tag (tag.value)}
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={`${resolve('/')}?tag=${encodeURIComponent(tag.value)}`}
						class="px-3 py-1 transition hover:text-[var(--nav-hover)]"
					>
						{tag.label}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/each}
			</nav>
		</div>
	</header>

	<main
		class="mx-auto max-w-7xl px-4 py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] sm:px-6"
	>
		{@render children()}
	</main>
</div>
