<template>
  <div :class="['sel-field', { 'sel-field--error': error }]">
    <label v-if="label" class="field__label">{{ label }}</label>
    <div class="sel-field__wrap">
      <select class="sel-field__select" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)" v-bind="$attrs">
        <option value="" disabled>{{ placeholder || 'Select…' }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <ChevronDown :size="14" class="sel-field__arrow" />
    </div>
    <p v-if="error" class="field__error"><AlertCircle :size="12" />{{ error }}</p>
  </div>
</template>

<script setup>
import { ChevronDown, AlertCircle } from 'lucide-vue-next'
defineProps({ modelValue: { default: '' }, label: String, options: Array, placeholder: String, error: String })
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })
</script>

<style scoped>
.sel-field { display: flex; flex-direction: column; gap: var(--space-1); }
.sel-field__wrap { position: relative; }
.sel-field__select {
  width:          100%;
  height:         40px;
  padding:        0 36px 0 var(--space-3);
  appearance:     none;
  background:     var(--color-surface);
  border:         1px solid var(--color-border-strong);
  border-radius:  var(--radius-lg);
  font-size:      var(--text-sm);
  color:          var(--color-text);
  cursor:         pointer;
  outline:        none;
  transition:     border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.sel-field__select:focus {
  border-color: var(--color-primary);
  box-shadow:   0 0 0 3px rgba(30,58,138,0.1);
}
.sel-field--error .sel-field__select { border-color: var(--color-danger); }
.sel-field__arrow {
  position:       absolute;
  right:          var(--space-3);
  top:            50%;
  transform:      translateY(-50%);
  color:          var(--color-text-4);
  pointer-events: none;
}
.field__label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-2); }
.field__error { display: flex; align-items: center; gap: 4px; font-size: var(--text-xs); color: var(--color-danger); }
</style>
