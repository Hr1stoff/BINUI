import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/reset.css'
import './assets/style.css'
import './assets/createRow.css'
import './assets/changeRow.css'

createApp(App).use(router).mount('#app')
