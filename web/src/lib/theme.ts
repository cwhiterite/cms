import type { PostDetail } from '#lib/sanity.ts';

export type ContrastTone = 'light' | 'dark';

export interface PostTheme {
	lightBg: string | null;
	darkBg: string | null;
	lightTone: ContrastTone | null;
	darkTone: ContrastTone | null;
	styleAttr: string | undefined;
}

export function sanitizeHex(hex?: unknown): string | null {
	if (typeof hex !== 'string') return null;
	const clean = hex.trim();
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(clean) ? clean : null;
}

export function isLightColor(hex: string): boolean {
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

export function resolvePostTheme(post?: PostDetail): PostTheme {
	const lightBg = sanitizeHex(post?.lightBackgroundColor?.hex);
	const darkBg = sanitizeHex(post?.darkBackgroundColor?.hex);

	const declarations: string[] = [];
	if (lightBg) declarations.push(`--post-light-bg: ${lightBg}`);
	if (darkBg) declarations.push(`--post-dark-bg: ${darkBg}`);

	return {
		lightBg,
		darkBg,
		lightTone: lightBg ? (isLightColor(lightBg) ? 'light' : 'dark') : null,
		darkTone: darkBg ? (isLightColor(darkBg) ? 'light' : 'dark') : null,
		styleAttr: declarations.length > 0 ? `${declarations.join('; ')};` : undefined
	};
}
