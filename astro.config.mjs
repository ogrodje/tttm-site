import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    integrations: [vue({
        // appEntrypoint: '/src/pages/_app',
        devtools: true,
        jsx: true,
        /*
        jsx: {
            // treat any tag that starts with ion- as custom elements
            // isCustomElement: (tag) => tag.startsWith('ion-'),
        } */
    }), mdx(),],
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