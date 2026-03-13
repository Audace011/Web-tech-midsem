<template>
  <AppLayout>
    <div class="container admin-wrap">
      <div class="admin-header">
        <h1><ShieldCheck :size="24" /> Admin Dashboard</h1>
        <p class="text-muted">Overview of platform activity</p>
      </div>
      <div class="stat-grid">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <div class="stat-icon" :style="{ background: s.color }"><component :is="s.icon" :size="20" /></div>
          <div>
            <p class="stat-value">{{ s.value }}</p>
            <p class="stat-label">{{ s.label }}</p>
          </div>
        </div>
      </div>
      <div class="admin-nav">
        <RouterLink to="/admin/posts" class="admin-link"><Package :size="15" /> Manage Posts</RouterLink>
        <RouterLink to="/admin/users" class="admin-link"><Users :size="15" /> Manage Users</RouterLink>
        <RouterLink to="/admin/messages" class="admin-link"><MessageSquare :size="15" /> Manage Messages</RouterLink>
        <RouterLink to="/admin/resolved" class="admin-link admin-link--resolved"><CheckCircle :size="15" /> Resolved Items</RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { ShieldCheck, Package, CheckCircle, Users, AlertTriangle, PackageSearch, MessageSquare } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useItemsStore } from '@/stores/items'
import { useAuthStore }  from '@/stores/auth'

const items = useItemsStore()
const auth  = useAuthStore()
const stats = computed(() => [
  { label: 'Total Items',   value: items.stats.total,    icon: Package,       color: 'rgba(108,99,255,0.2)' },
  { label: 'Lost',          value: items.stats.lost,     icon: PackageSearch, color: 'rgba(255,101,132,0.2)' },
  { label: 'Found',         value: items.stats.found,    icon: Package,       color: 'rgba(67,217,173,0.2)' },
  { label: 'Resolved',      value: items.stats.resolved, icon: CheckCircle,   color: 'rgba(67,197,158,0.2)' },
  { label: 'Pending Review',value: items.stats.pending,  icon: AlertTriangle, color: 'rgba(246,201,14,0.2)' },
  { label: 'Users',         value: auth.getAllUsers().length, icon: Users,    color: 'rgba(108,99,255,0.2)' },
])
</script>

<style scoped>
.admin-wrap { padding:var(--space-10) var(--space-4) var(--space-16); }
.admin-header { margin-bottom:var(--space-8); }
.admin-header h1 { display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-3xl);font-weight:var(--weight-extrabold); }
.stat-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-4);margin-bottom:var(--space-8); }
.stat-card { background:var(--color-bg-2);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);display:flex;align-items:center;gap:var(--space-4); }
.stat-icon { width:44px;height:44px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;color:var(--color-text); }
.stat-value { font-size:var(--text-2xl);font-weight:var(--weight-extrabold); }
.stat-label { font-size:var(--text-xs);color:var(--color-text-3);text-transform:uppercase;letter-spacing:.06em; }
.admin-nav { display:flex;gap:var(--space-4); }
.admin-link {
  display: flex; align-items: center; gap: var(--space-2);
  padding:var(--space-4) var(--space-5);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);font-weight:var(--weight-semibold);font-size:var(--text-sm);color:var(--color-text);transition:all var(--transition-base);
}
.admin-link:hover { border-color:var(--color-primary);background:var(--color-primary-alpha);color:var(--color-primary-light); }
.admin-link--resolved:hover { border-color:#22c55e;background:rgba(34,197,94,0.08);color:#16a34a; }
</style>
