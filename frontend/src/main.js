import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import './assets/reset.css';
import './assets/style.css';
import './assets/createRow.css';
import './assets/changeRow.css';

const app = createApp(App); 
const pinia = createPinia();

app.use(pinia); 
app.use(router);
app.mount('#app');
