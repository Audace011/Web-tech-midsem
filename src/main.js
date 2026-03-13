import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from './router'
import App from './App.vue'
import './styles/main.css'
import './styles/themes.css'

// ── Locale messages ──────────────────────────────────────────
import en from './locales/en.json'
import fr from './locales/fr.json'
import rw from './locales/rw.json'

// Read saved language preference (before Pinia is ready)
function getSavedLanguage() {
    try {
        const prefs = JSON.parse(localStorage.getItem('laf_preferences')) || {}
        return ['en', 'fr', 'rw'].includes(prefs.language) ? prefs.language : 'en'
    } catch { return 'en' }
}

const i18n = createI18n({
    legacy: false,           // use Composition API mode
    locale: getSavedLanguage(),
    fallbackLocale: 'en',
    messages: { en, fr, rw },
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(Toast, {
    position: 'top-right',
    timeout: 3500,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: 'Vue-Toastification__fade',
    maxToasts: 5,
})

app.mount('#app')
