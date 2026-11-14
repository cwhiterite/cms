import type { PostDetail } from '#lib/sanity.ts';

export interface PostTheme {
	lightBg: string | null;
	darkBg: string | null;
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

function buildModeVars(prefix: 'light' | 'dark', bg: string, isBright: boolean): string[] {
	if (isBright) {
		return [
			`--post-${prefix}-bg: ${bg}`,
			`--post-${prefix}-text-primary: #09090b`,
			`--post-${prefix}-text-secondary: #52525b`,
			`--post-${prefix}-text-muted: #71717a`,
			`--post-${prefix}-border-color: rgba(0, 0, 0, 0.12)`,
			`--post-${prefix}-badge-bg: rgba(0, 0, 0, 0.06)`,
			`--post-${prefix}-badge-text: #18181b`,
			`--post-${prefix}-card-placeholder-bg: rgba(0, 0, 0, 0.04)`,
			`--post-${prefix}-header-bg: color-mix(in srgb, ${bg} 85%, transparent)`,
			`--post-${prefix}-nav-hover: #09090b`,
			`--post-${prefix}-prose-body: #3f3f46`,
			`--post-${prefix}-prose-headings: #09090b`,
			`--post-${prefix}-prose-bold: #09090b`,
			`--post-${prefix}-prose-links: #09090b`,
			`--post-${prefix}-prose-code: #09090b`,
			`--post-${prefix}-prose-quotes: #27272a`,
			`--post-${prefix}-prose-quote-borders: rgba(0, 0, 0, 0.15)`,
			`--post-${prefix}-prose-counters: #52525b`,
			`--post-${prefix}-prose-bullets: #71717a`,
			`--post-${prefix}-prose-hr: rgba(0, 0, 0, 0.12)`,
			`--post-${prefix}-prose-captions: #52525b`,
			`--post-${prefix}-prose-th-borders: rgba(0, 0, 0, 0.2)`,
			`--post-${prefix}-prose-td-borders: rgba(0, 0, 0, 0.12)`
		];
	}

	return [
		`--post-${prefix}-bg: ${bg}`,
		`--post-${prefix}-text-primary: #ffffff`,
		`--post-${prefix}-text-secondary: #a1a1aa`,
		`--post-${prefix}-text-muted: #71717a`,
		`--post-${prefix}-border-color: rgba(255, 255, 255, 0.15)`,
		`--post-${prefix}-badge-bg: rgba(255, 255, 255, 0.1)`,
		`--post-${prefix}-badge-text: #f4f4f5`,
		`--post-${prefix}-card-placeholder-bg: rgba(255, 255, 255, 0.06)`,
		`--post-${prefix}-header-bg: color-mix(in srgb, ${bg} 85%, transparent)`,
		`--post-${prefix}-nav-hover: #ffffff`,
		`--post-${prefix}-prose-body: #d4d4d8`,
		`--post-${prefix}-prose-headings: #ffffff`,
		`--post-${prefix}-prose-bold: #ffffff`,
		`--post-${prefix}-prose-links: #ffffff`,
		`--post-${prefix}-prose-code: #ffffff`,
		`--post-${prefix}-prose-quotes: #f4f4f5`,
		`--post-${prefix}-prose-quote-borders: rgba(255, 255, 255, 0.2)`,
		`--post-${prefix}-prose-counters: #a1a1aa`,
		`--post-${prefix}-prose-bullets: #71717a`,
		`--post-${prefix}-prose-hr: rgba(255, 255, 255, 0.15)`,
		`--post-${prefix}-prose-captions: #a1a1aa`,
		`--post-${prefix}-prose-th-borders: rgba(255, 255, 255, 0.2)`,
		`--post-${prefix}-prose-td-borders: rgba(255, 255, 255, 0.12)`
	];
}

export function resolvePostTheme(post?: PostDetail): PostTheme {
	const lightBg = sanitizeHex(post?.lightBackgroundColor?.hex);
	const darkBg = sanitizeHex(post?.darkBackgroundColor?.hex);

	const declarations: string[] = [];
	if (lightBg) {
		declarations.push(...buildModeVars('light', lightBg, isLightColor(lightBg)));
	}
	if (darkBg) {
		declarations.push(...buildModeVars('dark', darkBg, isLightColor(darkBg)));
	}

	return {
		lightBg,
		darkBg,
		styleAttr: declarations.length > 0 ? `${declarations.join('; ')};` : undefined
	};
}
