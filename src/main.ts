import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, Dark } from 'quasar'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { initTheme } from './composables/useTheme'
import { setUnauthorizedHandler } from './boot/api'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(Quasar, {
  plugins: { Notify, Dialog, Dark },
})

initTheme()

setUnauthorizedHandler(() => {
  router.push({ name: 'login' })
})

app.mount('#app')
