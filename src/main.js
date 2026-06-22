import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mock/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  createApp(App).use(createPinia()).use(ElementPlus).use(router).mount('#app')
}

bootstrap()