<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade">
      <component :is="Component" :key="$route.path" />
    </Transition>
  </RouterView>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
/* Simple crossfade — no sequential out-in delay, new page mounts immediately */
.fade-enter-active { transition: opacity 120ms ease; }
.fade-leave-active { transition: opacity 80ms ease; position: absolute; width: 100%; }
.fade-enter-from  { opacity: 0; }
.fade-leave-to    { opacity: 0; }
</style>
