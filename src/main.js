import '/src/assets/global.css'
import './assets/main.css'
import './assets/theme.css'
import './assets/badges.css'
import { useThemeStore } from './stores/theme'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'


const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
useThemeStore(pinia).inicializar()
app.use(router)

app.mount('#app')


