<template>
  <div class="spinner-wrap" :class="`spinner-wrap--${size}`" role="status">
    <svg class="spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle class="spinner__track" cx="12" cy="12" r="9" stroke-width="2" />
      <path class="spinner__arc" d="M21 12a9 9 0 00-9-9" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span v-if="label" class="spinner__label">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({ size: { type: String, default: 'md' }, label: { type: String, default: '' } })
</script>

<style scoped>
.spinner-wrap { display: inline-flex; align-items: center; gap: var(--space-2); }
.spinner-wrap--sm  .spinner { width: 14px; height: 14px; }
.spinner-wrap--md  .spinner { width: 22px; height: 22px; }
.spinner-wrap--lg  .spinner { width: 32px; height: 32px; }
.spinner-wrap--md { flex-direction: column; }

.spinner { animation: spin 0.8s linear infinite; flex-shrink: 0; }
.spinner__track { stroke: var(--color-border-strong); }
.spinner__arc   { stroke: var(--color-primary); }
@keyframes spin { to { transform: rotate(360deg); } }

.spinner__label { font-size: var(--text-sm); color: var(--color-text-3); }
</style>
