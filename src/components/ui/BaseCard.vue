<template>
  <div class="card" :class="{ 'card--hoverable': hoverable }">
    <slot />
  </div>
</template>

<script setup>
defineProps({ hoverable: { type: Boolean, default: false } })
</script>

<style scoped>
.card {
  background:    var(--gradient-card);
  border:        1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow:    var(--shadow-card);
  overflow:      hidden;
  transition:    all var(--transition-base);
}
.card--hoverable:hover {
  border-color: var(--color-border-strong);
  box-shadow:   var(--shadow-md), 0 0 0 1px rgba(108,99,255,0.2);
  transform:    translateY(-3px);
}
</style>
