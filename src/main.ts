/**
 * @file main.ts
 * @summary Module: src/main.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { createApp } from "vue";
import { createPinia } from "pinia";
import { i18n } from "@/i18n";
import App from "./App.vue";
import "./styles/main.css";
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(i18n);
app.mount("#app");
