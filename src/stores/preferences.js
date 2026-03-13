/**
 * preferences.js
 * Manages theme, font size, and language preferences.
 * All settings are persisted to localStorage and applied to <body> on change.
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const LS_KEY = 'laf_preferences'
const FONT_STEPS = [14, 16, 18, 20, 22, 24]
const THEMES = ['light', 'colorblind', 'high-contrast']
const LANGUAGES = ['en', 'fr', 'rw']

function load() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || {}
    } catch { return {} }
}

export const usePreferencesStore = defineStore('preferences', () => {
    const saved = load()

    const fontSize = ref(FONT_STEPS.includes(saved.fontSize) ? saved.fontSize : 16)
    const theme = ref(THEMES.includes(saved.theme) ? saved.theme : 'light')
    const language = ref(LANGUAGES.includes(saved.language) ? saved.language : 'en')

    // Apply font size to <html> root so rem-based sizes scale automatically
    function applyFontSize(size) {
        document.documentElement.style.fontSize = `${size}px`
    }

    // Apply theme via data-theme attribute on <body>
    function applyTheme(t) {
        document.body.setAttribute('data-theme', t)
    }

    function save() {
        localStorage.setItem(LS_KEY, JSON.stringify({
            fontSize: fontSize.value,
            theme: theme.value,
            language: language.value,
        }))
    }

    function increaseFontSize() {
        const idx = FONT_STEPS.indexOf(fontSize.value)
        if (idx < FONT_STEPS.length - 1) fontSize.value = FONT_STEPS[idx + 1]
    }

    function decreaseFontSize() {
        const idx = FONT_STEPS.indexOf(fontSize.value)
        if (idx > 0) fontSize.value = FONT_STEPS[idx - 1]
    }

    function setTheme(t) { theme.value = t }
    function setLanguage(l) { language.value = l }

    // Watch and auto-apply + save on any change
    watch(fontSize, v => { applyFontSize(v); save() }, { immediate: true })
    watch(theme, v => { applyTheme(v); save() }, { immediate: true })
    watch(language, () => save())

    return {
        fontSize, theme, language,
        FONT_STEPS, THEMES, LANGUAGES,
        increaseFontSize, decreaseFontSize,
        setTheme, setLanguage,
    }
})
