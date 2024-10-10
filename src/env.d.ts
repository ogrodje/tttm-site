/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
    readonly PUBLIC_TTTM_WS_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}