/**
 * @file vite-env.d.ts
 * @summary Module: src/vite-env.d.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
interface ImportMetaEnv {
    readonly VITE_FOODICS_TOKEN: string;
    readonly VITE_API_BASE_URL?: string;
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
