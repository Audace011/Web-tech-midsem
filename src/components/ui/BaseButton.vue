<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled || loading"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--loading': loading, 'btn--full': fullWidth }]"
    v-bind="$attrs"
  >
    <BaseSpinner v-if="loading" size="sm" class="btn__spinner" />
    <component v-else-if="icon" :is="icon" :size="iconSize" class="btn__icon" />
    <span v-if="$slots.default" class="btn__label"><slot /></span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import BaseSpinner from './BaseSpinner.vue'
const props = defineProps({
  tag:       { type: String,  default: 'button' },
  type:      { type: String,  default: 'button' },
  variant:   { type: String,  default: 'primary' },
  size:      { type: String,  default: 'md' },
  icon:      { default: null },
  loading:   { type: Boolean, default: false },
  disabled:  { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
})
// Map size string → pixel number so Lucide gets a number, not an object
const iconSize = computed(() => ({ sm: 13, md: 15, lg: 16 }[props.size] ?? 15))
</script>

<style scoped>
.btn {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  gap:             var(--space-2);
  border:          none;
  border-radius:   var(--radius-lg);
  font-family:     var(--font-sans);
  font-weight:     var(--weight-semibold);
  cursor:          pointer;
  text-decoration: none;
  white-space:     nowrap;
  transition:      background var(--transition-fast), color var(--transition-fast),
                   border-color var(--transition-fast), box-shadow var(--transition-fast),
                   transform var(--transition-fast);
  user-select:     none;
}
.btn:active:not(:disabled) { transform: scale(0.98); }
.btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn--full { width: 100%; }

/* ── Sizes ── */
.btn--sm  { height: 32px; padding: 0 var(--space-3);  font-size: var(--text-sm);  }
.btn--md  { height: 38px; padding: 0 var(--space-4);  font-size: var(--text-sm);  }
.btn--lg  { height: 44px; padding: 0 var(--space-6);  font-size: var(--text-base); }

/* ── Primary ── */
.btn--primary {
  background: var(--color-primary);
  color:      var(--color-text-inverse);
  box-shadow: 0 1px 2px rgba(30,58,138,0.2);
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 2px 6px rgba(30,58,138,0.3);
}

/* ── Secondary ── */
.btn--secondary {
  background: var(--color-primary-bg);
  color:      var(--color-primary);
  border:     1px solid transparent;
}
.btn--secondary:hover:not(:disabled) {
  background: #DBEAFE;
  border-color: rgba(30,58,138,0.2);
}

/* ── Outline ── */
.btn--outline {
  background:   transparent;
  border:       1px solid var(--color-border-strong);
  color:        var(--color-text-2);
}
.btn--outline:hover:not(:disabled) {
  border-color: var(--color-primary);
  color:        var(--color-primary);
  background:   var(--color-primary-alpha);
}

/* ── Ghost ── */
.btn--ghost {
  background: transparent;
  color:      var(--color-text-3);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--color-bg-2);
  color:      var(--color-text);
}

/* ── Danger ── */
.btn--danger {
  background: var(--color-danger);
  color:      #fff;
}
.btn--danger:hover:not(:disabled) { background: #b91c1c; }

/* ── Success ── */
.btn--success {
  background: var(--color-success);
  color:      #fff;
}
.btn--success:hover:not(:disabled) { background: #047857; }

/* Loading */
.btn--loading { cursor: wait; }
.btn__spinner { flex-shrink: 0; }
</style>
