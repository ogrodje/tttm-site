import {defineConfig} from 'astro/config';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    integrations: [mdx()],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ["legacy-js-api"],
                },
            },
        },
    },
    devToolbar: {
        enabled: false,
    },
});