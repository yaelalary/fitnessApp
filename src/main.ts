import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { registerServiceWorker } from './services/notifications'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'

createApp(App).use(createPinia()).use(router).mount('#app')
void registerServiceWorker()
