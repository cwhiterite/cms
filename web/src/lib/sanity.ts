import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { InputValue } from '@portabletext/svelte';
import {
	PUBLIC_R2_BASE_URL,
	PUBLIC_SANITY_DATASET,
	PUBLIC_SANITY_PROJECT_ID
} from '$app/env/public';

export const sanity = createClient({
	projectId: PUBLIC_SANITY_PROJECT_ID,
	dataset: PUBLIC_SANITY_DATASET,
	apiVersion: '2026-01-01',
	useCdn: true
});

const builder = createImageUrlBuilder(sanity);

export type SanityImage = Parameters<typeof builder.image>[0] & {
	alt?: string;
	caption?: string;
};

export type SanityGalleryItem = SanityImage & {
	_key: string;
};

export interface R2GalleryItem {
	_key: string;
	r2Key: string;
	alt?: string;
	caption?: string;
}

export interface PostSummary {
	_id: string;
	title: string;
	slug: string;
	publishedAt?: string;
	category?: string;
	tags?: string[];
	excerpt?: string;
	coverImage?: SanityImage;
}

export interface PostDetail extends PostSummary {
	backgroundColor?: {
		hex?: string;
	};
	gallery?: SanityGalleryItem[];
	r2Gallery?: R2GalleryItem[];
	body?: InputValue;
}

export interface TagItem {
	label: string;
	value: string;
}

export const TAGS: TagItem[] = [
	{ label: 'Design', value: 'design' },
	{ label: 'UI/UX', value: 'ux' },
	{ label: '3D', value: '3d' },
	{ label: 'Photography', value: 'photography' },
	{ label: 'Illustration', value: 'illustration' },
	{ label: 'Architecture', value: 'architecture' }
];

export const CATEGORIES = TAGS;

export function tagLabel(value?: string): string {
	if (!value) return '';
	const match = TAGS.find((t) => t.value.toLowerCase() === value.toLowerCase());
	if (match) return match.label;
	if (value.toLowerCase() === 'ui/ux') return 'UI/UX';
	return value;
}

export function tagSlug(value?: string): string {
	if (!value) return '';
	const match = TAGS.find(
		(t) =>
			t.value.toLowerCase() === value.toLowerCase() || t.label.toLowerCase() === value.toLowerCase()
	);
	return match ? match.value : value.toLowerCase();
}

export function urlFor(source: SanityImage) {
	return builder.image(source).auto('format');
}

export function r2Url(key: string) {
	const base = PUBLIC_R2_BASE_URL.replace(/\/$/, '');
	const cleanKey = key.replace(/^\//, '');
	return `${base}/${cleanKey}`;
}

export const postsQuery = `
	*[_type == "post" && defined(slug.current) && (
		$selectedTag == "" ||
		(defined(tags) && (
			$selectedTag in tags ||
			count(tags[lower(@) == lower($selectedTag)]) > 0 ||
			($selectedTag == "ux" && count(tags[lower(@) in ["ux", "ui/ux"]]) > 0)
		)) ||
		lower(category) == lower($selectedTag) ||
		($selectedTag == "ux" && lower(category) in ["ux", "ui/ux"])
	)]
	| order(publishedAt desc)[0...24] {
		_id,
		title,
		"slug": slug.current,
		publishedAt,
		category,
		tags,
		excerpt,
		coverImage {
			...,
			alt
		}
	}
`;

export const postBySlugQuery = `
	*[_type == "post" && slug.current == $slug][0] {
		_id,
		title,
		"slug": slug.current,
		publishedAt,
		category,
		tags,
		excerpt,
		coverImage {
			...,
			alt
		},
		backgroundColor {
			hex
		},
		gallery[] {
			_key,
			...,
			alt,
			caption
		},
		r2Gallery[] {
			_key,
			r2Key,
			alt,
			caption
		},
		body
	}
`;
