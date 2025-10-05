import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { i18n } from '@/i18n';
import App from './App.vue';
import './styles/main.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(i18n);

app.mount('#app');
