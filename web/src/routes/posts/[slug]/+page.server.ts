import { error } from '@sveltejs/kit';
import { postBySlugQuery, sanity, type PostDetail } from '#lib/sanity.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const post = await sanity.fetch<PostDetail | null>(postBySlugQuery, {
		slug: params.slug
	});

	if (!post) {
		throw error(404, 'Post not found');
	}

	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
	});

	return { post };
};
