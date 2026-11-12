import { postsQuery, sanity, type PostSummary } from '#lib/sanity.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const activeCategory = url.searchParams.get('category') ?? '';
	const posts = await sanity.fetch<PostSummary[]>(postsQuery, {
		category: activeCategory
	});

	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	return {
		posts,
		activeCategory
	};
};
