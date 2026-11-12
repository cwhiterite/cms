import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SANITY_PROJECT_ID: {
		public: true,
		static: true,
		schema: (value) => value || 'jsv8msl0'
	},
	PUBLIC_SANITY_DATASET: {
		public: true,
		static: true,
		schema: (value) => value || 'production'
	},
	PUBLIC_R2_BASE_URL: {
		public: true,
		static: true,
		schema: (value) => value || 'https://pub-110cf5f016a3427785e66eefdb5710df.r2.dev'
	}
});
