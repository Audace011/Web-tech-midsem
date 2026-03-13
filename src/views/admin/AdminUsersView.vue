<template>
  <AppLayout>
    <div class="container admin-wrap">
      <div class="admin-header">
        <h1><Users :size="22" /> Manage Users</h1>
        <RouterLink to="/admin" class="back-link">← Dashboard</RouterLink>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td class="user-name">
                <div class="user-avatar">{{ u.name[0] }}</div> {{ u.name }}
              </td>
              <td class="text-muted">{{ u.email }}</td>
              <td><BaseBadge :variant="u.role === 'admin' ? 'warning' : 'default'">{{ u.role }}</BaseBadge></td>
              <td class="text-muted">{{ formatFull(u.createdAt) }}</td>
              <td><BaseBadge :variant="u.banned ? 'danger' : 'success'">{{ u.banned ? 'Banned' : 'Active' }}</BaseBadge></td>
              <td>
                <BaseButton v-if="u.id !== auth.user.id" variant="ghost" size="sm" @click="authStore.banUser(u.id)">
                  {{ u.banned ? 'Unban' : 'Ban' }}
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { Users } from 'lucide-vue-next'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseBadge  from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { formatFull }  from '@/helpers/formatDate'
const authStore = useAuthStore()
const auth  = authStore
const users = computed(() => authStore.getAllUsers())
</script>

<style scoped>
.admin-wrap { padding:var(--space-10) var(--space-4) var(--space-16); }
.admin-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6); }
.admin-header h1 { display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-2xl);font-weight:var(--weight-extrabold); }
.back-link { font-size:var(--text-sm);color:var(--color-text-2); }
.admin-table-wrap { overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--color-border); }
.admin-table { width:100%;border-collapse:collapse;font-size:var(--text-sm); }
.admin-table th { background:var(--color-bg-2);padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-3);border-bottom:1px solid var(--color-border); }
.admin-table td { padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border);vertical-align:middle; }
.admin-table tr:last-child td { border-bottom:none; }
.admin-table tr:hover td { background:var(--color-surface); }
.user-name { display:flex;align-items:center;gap:var(--space-3); }
.user-avatar { width:30px;height:30px;border-radius:var(--radius-full);background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:var(--weight-bold);font-size:var(--text-xs);flex-shrink:0; }
.text-muted { color:var(--color-text-2); }
</style>
