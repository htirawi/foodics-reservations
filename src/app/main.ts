import { createApp } from "vue";

import { createPinia } from "pinia";

import { i18n } from "@/app/i18n";

import App  from "@app/App.vue";
import "@app/styles/main.css";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(i18n);
app.mount("#app");
