import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

async function bootstrap() {
  if (import.meta.env.DEV) {
    // 清除旧的 MSW Service Worker 缓存，确保加载最新 handler
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
    }
    const { worker } = await import('./mock/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  createApp(App).use(createPinia()).use(ElementPlus).use(router).mount('#app')
}

bootstrap()