<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @mousedown.self="$emit('update:modelValue', false)">
        <div class="modal-panel" :style="{ maxWidth: width }">
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button class="modal-close" @click="$emit('update:modelValue', false)"><X :size="16" /></button>
          </div>
          <div class="modal-body"><slot /></div>
          <div v-if="$slots.footer" class="modal-footer"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'
defineProps({ modelValue: Boolean, title: String, width: { type: String, default: '500px' } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-backdrop {
  position:        fixed; inset: 0; z-index: var(--z-modal);
  background:      rgba(17,24,39,0.5);
  display:         flex; align-items: center; justify-content: center;
  padding:         var(--space-4);
}
.modal-panel {
  background:    var(--color-surface);
  border:        1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow:    var(--shadow-lg);
  width:         100%;
  overflow:      hidden;
}
.modal-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         var(--space-4) var(--space-6);
  border-bottom:   1px solid var(--color-border);
}
.modal-title { font-size: var(--text-lg); font-weight: var(--weight-semibold); }
.modal-close {
  background: none; border: none; cursor: pointer;
  padding: var(--space-1); border-radius: var(--radius-md);
  color: var(--color-text-3); transition: all var(--transition-fast);
}
.modal-close:hover { background: var(--color-bg-2); color: var(--color-text); }
.modal-body   { padding: var(--space-5) var(--space-6); }
.modal-footer {
  display:       flex; justify-content: flex-end; gap: var(--space-3);
  padding:       var(--space-4) var(--space-6);
  border-top:    1px solid var(--color-border);
  background:    var(--color-bg);
}
</style>
