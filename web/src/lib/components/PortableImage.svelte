<script lang="ts">
	import type { CustomBlockComponentProps } from '@portabletext/svelte';
	import { urlFor, type SanityImage } from '#lib/sanity.ts';

	let {
		portableText
	}: { portableText: CustomBlockComponentProps<SanityImage & { _type: string }> } = $props();

	let image = $derived(portableText.value);
</script>

{#if image}
	<figure class="my-8 space-y-2">
		<img
			src={urlFor(image).width(1400).url()}
			alt={image.alt || ''}
			loading="lazy"
			class="w-full rounded-lg bg-zinc-900 object-cover"
		/>
		{#if image.caption}
			<figcaption class="text-center text-sm text-zinc-400">{image.caption}</figcaption>
		{/if}
	</figure>
{/if}
