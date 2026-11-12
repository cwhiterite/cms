import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SANITY_PROJECT_ID: { public: true, static: true },
	PUBLIC_SANITY_DATASET: { public: true, static: true },
	PUBLIC_R2_BASE_URL: { public: true, static: true }
});
