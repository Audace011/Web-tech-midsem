<template>
  <div class="prefs-wrap" ref="wrapRef">
    <!-- Trigger button -->
    <button class="prefs-btn" :aria-label="t('prefs.title')" :aria-expanded="open" @click="open = !open">
      <Settings2 :size="17" />
    </button>

    <!-- Panel -->
    <Transition name="prefs-panel">
      <div v-if="open" class="prefs-panel" role="dialog" :aria-label="t('prefs.title')">
        <p class="prefs-panel__title">{{ t('prefs.title') }}</p>

        <!-- Text Size -->
        <div class="prefs-row">
          <span class="prefs-label">{{ t('prefs.textSize') }}</span>
          <div class="size-ctrl">
            <button class="size-btn" :disabled="prefs.fontSize <= prefs.FONT_STEPS[0]"
              aria-label="Decrease font size" @click="prefs.decreaseFontSize()">A−</button>
            <span class="size-val">{{ prefs.fontSize }}px</span>
            <button class="size-btn" :disabled="prefs.fontSize >= prefs.FONT_STEPS[prefs.FONT_STEPS.length-1]"
              aria-label="Increase font size" @click="prefs.increaseFontSize()">A+</button>
          </div>
        </div>

        <!-- Theme -->
        <div class="prefs-row prefs-row--col">
          <span class="prefs-label">{{ t('prefs.theme') }}</span>
          <div class="theme-btns">
            <button :class="['theme-btn', { 'theme-btn--on': prefs.theme === 'light' }]"
              @click="prefs.setTheme('light')">
              <Sun :size="13" /> {{ t('prefs.light') }}
            </button>
            <button :class="['theme-btn', { 'theme-btn--on': prefs.theme === 'colorblind' }]"
              @click="prefs.setTheme('colorblind')">
              <Eye :size="13" /> {{ t('prefs.colorblind') }}
            </button>
            <button :class="['theme-btn', { 'theme-btn--on': prefs.theme === 'high-contrast' }]"
              @click="prefs.setTheme('high-contrast')">
              <Contrast :size="13" /> {{ t('prefs.highContrast') }}
            </button>
          </div>
        </div>

        <!-- Language -->
        <div class="prefs-row prefs-row--col">
          <span class="prefs-label">{{ t('prefs.language') }}</span>
          <div class="lang-btns">
            <button :class="['lang-btn', { 'lang-btn--on': prefs.language === 'en' }]"
              @click="switchLang('en')">🇬🇧 English</button>
            <button :class="['lang-btn', { 'lang-btn--on': prefs.language === 'fr' }]"
              @click="switchLang('fr')">🇫🇷 Français</button>
            <button :class="['lang-btn', { 'lang-btn--on': prefs.language === 'rw' }]"
              @click="switchLang('rw')">🇷🇼 Kinyarwanda</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Settings2, Sun, Eye, Contrast } from 'lucide-vue-next'
import { usePreferencesStore } from '@/stores/preferences'

const { t, locale } = useI18n()
const prefs = usePreferencesStore()
const open  = ref(false)
const wrapRef = ref(null)

function switchLang(lang) {
  prefs.setLanguage(lang)
  locale.value = lang   // update vue-i18n reactive locale immediately
}

// Close panel when clicking outside
function onOutsideClick(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) open.value = false
}
onMounted(()    => document.addEventListener('mousedown', onOutsideClick))
onUnmounted(()  => document.removeEventListener('mousedown', onOutsideClick))
</script>

<style scoped>
.prefs-wrap { position: relative; }

.prefs-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  background: var(--color-bg-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); cursor: pointer; color: var(--color-text-3);
  transition: all var(--transition-fast);
}
.prefs-btn:hover { background: var(--color-surface); color: var(--color-primary); border-color: var(--color-primary); }

/* Panel */
.prefs-panel {
  position: absolute; right: 0; top: calc(100% + 8px); z-index: 200;
  width: 240px; background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-xl);
  padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4);
}
.prefs-panel__title {
  font-size: var(--text-xs); font-weight: var(--weight-semibold);
  text-transform: uppercase; letter-spacing: .06em; color: var(--color-text-4);
}

.prefs-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
.prefs-row--col { flex-direction: column; align-items: flex-start; }
.prefs-label { font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-text-2); }

/* Font size controls */
.size-ctrl { display: flex; align-items: center; gap: var(--space-2); }
.size-btn {
  background: var(--color-bg-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); cursor: pointer; padding: 2px 8px;
  font-size: var(--text-xs); font-weight: var(--weight-bold); color: var(--color-text-2);
  transition: all var(--transition-fast);
}
.size-btn:disabled { opacity: .4; cursor: not-allowed; }
.size-btn:not(:disabled):hover { border-color: var(--color-primary); color: var(--color-primary); }
.size-val { font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-text); min-width: 32px; text-align: center; }

/* Theme buttons */
.theme-btns, .lang-btns { display: flex; flex-direction: column; gap: var(--space-1); width: 100%; }
.theme-btn, .lang-btn {
  display: flex; align-items: center; gap: var(--space-2);
  width: 100%; padding: var(--space-2) var(--space-3);
  background: var(--color-bg-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); cursor: pointer;
  font-size: var(--text-xs); color: var(--color-text-2);
  transition: all var(--transition-fast); text-align: left;
}
.theme-btn:hover, .lang-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.theme-btn--on, .lang-btn--on {
  border-color: var(--color-primary); background: var(--color-primary-bg);
  color: var(--color-primary); font-weight: var(--weight-semibold);
}

/* Transition */
.prefs-panel-enter-active, .prefs-panel-leave-active {
  transition: opacity 130ms, transform 130ms;
}
.prefs-panel-enter-from, .prefs-panel-leave-to {
  opacity: 0; transform: translateY(-6px);
}
</style>
