<template>
  <AppLayout>
    <div class="container admin-wrap">
      <div class="admin-header">
        <h1><Package :size="22" /> Manage Posts</h1>
        <RouterLink to="/admin" class="back-link">← Dashboard</RouterLink>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Item</th><th>Type</th><th>User</th><th>Date</th><th>Status</th><th>Approved</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.allItemsForAdmin" :key="item.id">
              <td><RouterLink :to="`/items/${item.id}`" class="item-link">{{ item.title }}</RouterLink></td>
              <td><BaseBadge :variant="item.type">{{ item.type }}</BaseBadge></td>
              <td class="text-muted">{{ item.userName }}</td>
              <td class="text-muted">{{ formatFull(item.createdAt) }}</td>
              <td><BaseBadge :variant="item.status">{{ item.status }}</BaseBadge></td>
              <td>
                <BaseBadge :variant="item.approved ? 'success' : 'warning'">{{ item.approved ? 'Yes' : 'Pending' }}</BaseBadge>
              </td>
              <td class="actions">
                <!-- Approve / Reject -->
                <BaseButton v-if="!item.approved" variant="outline" size="sm" @click="store.approveItem(item.id)">Approve</BaseButton>
                <BaseButton v-if="item.approved"  variant="ghost"   size="sm" @click="store.rejectItem(item.id)">Reject</BaseButton>

                <!-- Edit -->
                <BaseButton variant="ghost" size="sm" :icon="Pencil"      @click="$router.push(`/edit/${item.id}`)" title="Edit" />

                <!-- Mark Resolved / Open -->
                <BaseButton
                  :variant="item.status === 'resolved' ? 'ghost' : 'ghost'"
                  size="sm"
                  :icon="item.status === 'resolved' ? RotateCcw : CheckCircle2"
                  :title="item.status === 'resolved' ? 'Mark as Open' : 'Mark as Resolved'"
                  @click="store.markResolved(item.id)"
                />

                <!-- Delete -->
                <BaseButton variant="danger" size="sm" :icon="Trash2" @click="confirmDelete(item)" title="Delete" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <BaseModal v-model="showDel" title="Delete Report" width="420px">
      <p style="font-size:var(--text-sm);color:var(--color-text-2)">
        Delete <strong>{{ delTarget?.title }}</strong>? This cannot be undone.
      </p>
      <template #footer>
        <BaseButton variant="outline" size="sm" @click="showDel = false">Cancel</BaseButton>
        <BaseButton variant="danger"  size="sm" :loading="deleting" @click="doDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { Package, Trash2, Pencil, CheckCircle2, RotateCcw } from 'lucide-vue-next'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseBadge  from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'
import { useItemsStore } from '@/stores/items'
import { formatFull } from '@/helpers/formatDate'

const store   = useItemsStore()
const router  = useRouter()
const toast   = useToast()

const showDel   = ref(false)
const delTarget = ref(null)
const deleting  = ref(false)

function confirmDelete(item) { delTarget.value = item; showDel.value = true }

async function doDelete() {
  deleting.value = true
  await store.deleteItem(delTarget.value.id)
  toast.success('Report deleted.')
  showDel.value = false
  deleting.value = false
  delTarget.value = null
}
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
.item-link { color:var(--color-primary); font-weight:var(--weight-medium); }
.text-muted { color:var(--color-text-2); }
.actions { display:flex;gap:var(--space-1);flex-wrap:wrap; }
</style>
