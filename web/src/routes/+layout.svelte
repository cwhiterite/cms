<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { TAGS, type PostDetail } from '#lib/sanity.ts';
	import { resolvePostTheme } from '#lib/theme.ts';
	import { resolve } from '$app/paths';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const post = $derived((page.data as { post?: PostDetail })?.post);
	const postTheme = $derived(resolvePostTheme(post));
	const currentTag = $derived(
		page.url.pathname === '/' ? (page.url.searchParams.get('tag') ?? '') : null
	);

	$effect(() => {
		const root = document.documentElement;
		if (postTheme.lightBg && postTheme.lightTone) {
			root.setAttribute('data-post-light-tone', postTheme.lightTone);
			root.style.setProperty('--post-light-bg', postTheme.lightBg);
		}
		if (postTheme.darkBg && postTheme.darkTone) {
			root.setAttribute('data-post-dark-tone', postTheme.darkTone);
			root.style.setProperty('--post-dark-bg', postTheme.darkBg);
		}
		return () => {
			root.removeAttribute('data-post-light-tone');
			root.style.removeProperty('--post-light-bg');
			root.removeAttribute('data-post-dark-tone');
			root.style.removeProperty('--post-dark-bg');
		};
	});

	let navEl: HTMLElement | undefined = $state();
	let firstSetEl: HTMLElement | undefined = $state();
	let isWrapping = false;

	const navCategories = [{ label: 'All', value: '' }, ...TAGS];

	function getSingleSetWidth(): number {
		if (!firstSetEl) return 0;
		return firstSetEl.offsetWidth + 8;
	}

	function handleScroll() {
		if (!navEl || isWrapping) return;
		const singleSetWidth = getSingleSetWidth();
		if (singleSetWidth <= 0) return;

		// Wrap seamlessly when scrolling right past the middle set
		if (navEl.scrollLeft >= singleSetWidth * 2) {
			isWrapping = true;
			navEl.scrollLeft -= singleSetWidth;
			isWrapping = false;
		}
		// Wrap seamlessly when scrolling left before the middle set
		else if (navEl.scrollLeft <= singleSetWidth * 0.2) {
			isWrapping = true;
			navEl.scrollLeft += singleSetWidth;
			isWrapping = false;
		}
	}

	$effect(() => {
		if (navEl && firstSetEl) {
			const singleSetWidth = getSingleSetWidth();
			if (singleSetWidth > 0 && navEl.scrollLeft === 0) {
				navEl.scrollLeft = singleSetWidth;
			}
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
	<meta
		name="theme-color"
		media="(prefers-color-scheme: light)"
		content={postTheme.lightBg ?? '#ffffff'}
	/>
	<meta
		name="theme-color"
		media="(prefers-color-scheme: dark)"
		content={postTheme.darkBg ?? '#000000'}
	/>
</svelte:head>

<div
	class="min-h-screen text-(--text-primary) antialiased transition-colors duration-300"
	data-post-light-tone={postTheme.lightTone ?? undefined}
	data-post-dark-tone={postTheme.darkTone ?? undefined}
	style="background-color: var(--page-bg); {postTheme.styleAttr ?? ''}"
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
				<nav class="hidden items-center gap-1 text-base text-(--text-secondary) lg:flex">
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

			<!-- Mobile & Tablet infinite horizontal swipe rail with dual-edge fade (< lg) -->
			<div class="relative -mx-4 sm:-mx-6 lg:hidden">
				<!-- Permanent left fade indicator -->
				<div
					aria-hidden="true"
					class="pointer-events-none absolute top-0 bottom-2.5 left-0 z-10 w-8"
					style="background: linear-gradient(to right, var(--page-bg), transparent);"
				></div>

				<!-- Permanent right fade indicator -->
				<div
					aria-hidden="true"
					class="pointer-events-none absolute top-0 right-0 bottom-2.5 z-10 w-8"
					style="background: linear-gradient(to left, var(--page-bg), transparent);"
				></div>

				{#snippet tagItems(isDuplicate: boolean)}
					{#each navCategories as cat (cat.value)}
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={cat.value
								? `${resolve('/')}?tag=${encodeURIComponent(cat.value)}`
								: resolve('/')}
							tabindex={isDuplicate ? -1 : undefined}
							class="shrink-0 px-3.5 py-1 text-base transition {currentTag === cat.value
								? 'font-normal text-(--text-primary)'
								: 'font-normal text-(--text-secondary) hover:text-(--nav-hover)'}"
						>
							{cat.label}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
				{/snippet}

				<nav
					bind:this={navEl}
					onscroll={handleScroll}
					aria-label="Category filters"
					class="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-2.5 sm:px-6"
				>
					<div bind:this={firstSetEl} class="flex shrink-0 items-center gap-2" aria-hidden="true">
						{@render tagItems(true)}
					</div>
					<div class="flex shrink-0 items-center gap-2">
						{@render tagItems(false)}
					</div>
					<div class="flex shrink-0 items-center gap-2" aria-hidden="true">
						{@render tagItems(true)}
					</div>
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
