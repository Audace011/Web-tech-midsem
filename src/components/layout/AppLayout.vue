<template>
  <AppNav />
  <main class="layout-main">
    <slot />
  </main>
  <AppFooter />
</template>

<script setup>
import AppNav    from './AppNav.vue'
import AppFooter from './AppFooter.vue'
</script>

<style scoped>
.layout-main { flex: 1; display: flex; flex-direction: column; }
</style>
