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
	const currentTag = $derived(
		page.url.pathname === '/' ? (page.url.searchParams.get('tag') ?? '') : null
	);

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

	let navEl: HTMLElement | undefined = $state();
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	function checkScroll() {
		if (!navEl) return;
		const { scrollLeft, scrollWidth, clientWidth } = navEl;
		canScrollLeft = scrollLeft > 6;
		canScrollRight = scrollLeft < scrollWidth - clientWidth - 6;
	}

	$effect(() => {
		if (navEl) {
			checkScroll();
			window.addEventListener('resize', checkScroll);
			return () => {
				window.removeEventListener('resize', checkScroll);
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
	class="min-h-screen text-(--text-primary) antialiased transition-colors duration-300"
	style="background-color: var(--page-bg); {customThemeStyle ?? ''}"
>
	<header
		class="sticky top-0 z-20 border-b border-(--border-color) pt-[env(safe-area-inset-top)] backdrop-blur transition-colors duration-300"
		style="background-color: var(--header-bg);"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6">
			<!-- Top row: logo + desktop links (>= lg: 1024px) -->
			<div class="flex h-14 items-center justify-between lg:h-16">
				<a href={resolve('/')} class="text-lg font-semibold tracking-tight text-(--text-primary)">
					Studio<span class="text-(--text-muted)">Feed</span>
				</a>

				<!-- Desktop navigation (>= lg) -->
				<nav class="hidden items-center gap-1 text-sm text-(--text-secondary) lg:flex">
					<a
						href={resolve('/')}
						class="px-3 py-1 transition {currentTag === ''
							? 'font-normal text-(--text-primary)'
							: 'hover:text-(--nav-hover)'}"
					>
						All
					</a>
					{#each TAGS as tag (tag.value)}
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={`${resolve('/')}?tag=${encodeURIComponent(tag.value)}`}
							class="px-3 py-1 transition {currentTag === tag.value
								? 'font-normal text-(--text-primary)'
								: 'hover:text-(--nav-hover)'}"
						>
							{tag.label}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
				</nav>
			</div>

			<!-- Mobile & Tablet horizontal swipe rail with edge fade hints (< lg) -->
			<div class="relative -mx-4 sm:-mx-6 lg:hidden">
				<!-- Left fade indicator (appears when scrolled right) -->
				<div
					aria-hidden="true"
					class="pointer-events-none absolute top-0 bottom-2.5 left-0 z-10 w-8 transition-opacity duration-200 {canScrollLeft
						? 'opacity-100'
						: 'opacity-0'}"
					style="background: linear-gradient(to right, var(--page-bg), transparent);"
				></div>

				<!-- Right fade indicator (indicates more links continue off-screen) -->
				<div
					aria-hidden="true"
					class="pointer-events-none absolute top-0 right-0 bottom-2.5 z-10 w-12 transition-opacity duration-200 {canScrollRight
						? 'opacity-100'
						: 'opacity-0'}"
					style="background: linear-gradient(to left, var(--page-bg), transparent);"
				></div>

				<nav
					bind:this={navEl}
					onscroll={checkScroll}
					aria-label="Category filters"
					class="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-2.5 sm:px-6"
				>
					<a
						href={resolve('/')}
						class="shrink-0 px-3.5 py-1 text-sm transition {currentTag === ''
							? 'font-normal text-(--text-primary)'
							: 'font-normal text-(--text-secondary) hover:text-(--nav-hover)'}"
					>
						All
					</a>
					{#each TAGS as tag (tag.value)}
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={`${resolve('/')}?tag=${encodeURIComponent(tag.value)}`}
							class="shrink-0 px-3.5 py-1 text-sm transition {currentTag === tag.value
								? 'font-normal text-(--text-primary)'
								: 'font-normal text-(--text-secondary) hover:text-(--nav-hover)'}"
						>
							{tag.label}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
					<span class="w-4 shrink-0" aria-hidden="true"></span>
				</nav>
			</div>
		</div>
	</header>

	<main
		class="mx-auto max-w-7xl px-4 py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] sm:px-6"
	>
		{@render children()}
	</main>
</div>
