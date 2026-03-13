<template>
  <AppLayout>
    <div class="container notfound-wrap">
      <div class="notfound-glow" />
      <div class="notfound-content">
        <h1 class="notfound-code gradient-text">404</h1>
        <h2 class="notfound-title">Page Not Found</h2>
        <p class="notfound-sub">Looks like this page got lost too. Let's get you back on track.</p>
        <BaseButton variant="primary" size="lg" :icon="Home" @click="$router.push('/')">Go Home</BaseButton>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { Home } from 'lucide-vue-next'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<style scoped>
.notfound-wrap { position:relative;display:flex;align-items:center;justify-content:center;min-height:calc(100vh - var(--nav-height) - 200px);text-align:center; }
.notfound-glow { position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:500px;height:500px;background:var(--gradient-glow);pointer-events:none;z-index:0; }
.notfound-content { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:var(--space-4); }
.notfound-code  { font-size:8rem;font-weight:var(--weight-extrabold);line-height:1;letter-spacing:-.05em; }
.notfound-title { font-size:var(--text-3xl);font-weight:var(--weight-bold); }
.notfound-sub   { font-size:var(--text-lg);color:var(--color-text-2);max-width:400px; }
</style>
