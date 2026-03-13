<template>
  <AppLayout>
    <div class="container admin-wrap">
      <!-- Header -->
      <div class="admin-header">
        <div>
          <h1><CheckCircle2 :size="22" /> Resolved Items</h1>
          <p class="text-muted">All items that have been marked as resolved</p>
        </div>
        <RouterLink to="/admin" class="back-link">← Dashboard</RouterLink>
      </div>

      <!-- Stats strip -->
      <div class="stats-strip">
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(67,217,173,0.15)">
            <CheckCircle2 :size="18" style="color:#22c55e" />
          </div>
          <div>
            <p class="stat-value">{{ resolvedItems.length }}</p>
            <p class="stat-label">Total Resolved</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(255,101,132,0.15)">
            <AlertCircle :size="18" style="color:#f87171" />
          </div>
          <div>
            <p class="stat-value">{{ resolvedLost }}</p>
            <p class="stat-label">Resolved Lost</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(108,99,255,0.15)">
            <PackageCheck :size="18" style="color:#818cf8" />
          </div>
          <div>
            <p class="stat-value">{{ resolvedFound }}</p>
            <p class="stat-label">Resolved Found</p>
          </div>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <Search :size="15" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search resolved items..."
          class="search-input"
        />
      </div>

      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="empty-state">
        <div class="empty-state__icon"><CheckCircle2 :size="28" /></div>
        <h3 v-if="resolvedItems.length === 0">No resolved items yet</h3>
        <h3 v-else>No results for "{{ searchQuery }}"</h3>
        <p v-if="resolvedItems.length === 0">Items marked as resolved will appear here.</p>
        <p v-else>Try a different search term.</p>
      </div>

      <!-- Table -->
      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Reported by</th>
              <th>Date Lost/Found</th>
              <th>Resolved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id" class="resolved-row">
              <td>
                <div class="item-cell">
                  <img
                    :src="item.imageUrl"
                    :alt="item.title"
                    class="item-thumb"
                    @error="$event.target.src='https://placehold.co/40x40/F3F4F6/9CA3AF?text=?'"
                  />
                  <div>
                    <RouterLink :to="`/items/${item.id}`" class="item-link">{{ item.title }}</RouterLink>
                    <p class="item-location"><MapPin :size="10" /> {{ item.location }}</p>
                  </div>
                </div>
              </td>
              <td><BaseBadge :variant="item.type">{{ item.type }}</BaseBadge></td>
              <td class="text-muted">{{ item.userName }}</td>
              <td class="text-muted">{{ formatFull(item.dateLostFound) }}</td>
              <td class="text-muted">{{ formatFull(item.updatedAt || item.createdAt) }}</td>
              <td class="actions">
                <!-- Re-open -->
                <BaseButton
                  variant="outline"
                  size="sm"
                  :icon="RotateCcw"
                  @click="reopen(item)"
                  title="Mark as Open"
                >
                  Re-open
                </BaseButton>
                <!-- Delete -->
                <BaseButton
                  variant="danger"
                  size="sm"
                  :icon="Trash2"
                  @click="confirmDelete(item)"
                  title="Delete"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <BaseModal v-model="showDel" title="Delete Resolved Item" width="420px">
      <p style="font-size:var(--text-sm);color:var(--color-text-2)">
        Delete <strong>{{ delTarget?.title }}</strong>? This cannot be undone.
      </p>
      <template #footer>
        <BaseButton variant="outline" size="sm" @click="showDel = false">Cancel</BaseButton>
        <BaseButton variant="danger" size="sm" :loading="deleting" @click="doDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { CheckCircle2, AlertCircle, PackageCheck, MapPin, Trash2, RotateCcw, Search } from 'lucide-vue-next'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseBadge  from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'
import { useItemsStore } from '@/stores/items'
import { formatFull } from '@/helpers/formatDate'

const store   = useItemsStore()
const toast   = useToast()

const searchQuery = ref('')
const showDel   = ref(false)
const delTarget = ref(null)
const deleting  = ref(false)

// All items with status === 'resolved'
const resolvedItems = computed(() =>
  store.allItemsForAdmin.filter(i => i.status === 'resolved')
)
const resolvedLost  = computed(() => resolvedItems.value.filter(i => i.type === 'lost').length)
const resolvedFound = computed(() => resolvedItems.value.filter(i => i.type === 'found').length)

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return resolvedItems.value
  return resolvedItems.value.filter(i =>
    i.title.toLowerCase().includes(q) ||
    i.description?.toLowerCase().includes(q) ||
    i.location?.toLowerCase().includes(q) ||
    i.userName?.toLowerCase().includes(q)
  )
})

async function reopen(item) {
  await store.markResolved(item.id) // toggles back to open
  toast.success(`"${item.title}" marked as open.`)
}

function confirmDelete(item) { delTarget.value = item; showDel.value = true }
async function doDelete() {
  deleting.value = true
  await store.deleteItem(delTarget.value.id)
  toast.success('Item deleted.')
  showDel.value = false
  deleting.value = false
  delTarget.value = null
}
</script>

<style scoped>
.admin-wrap { padding: var(--space-10) var(--space-4) var(--space-16); }

.admin-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: var(--space-6); gap: var(--space-4); flex-wrap: wrap;
}
.admin-header h1 {
  display: flex; align-items: center; gap: var(--space-2);
  font-size: var(--text-2xl); font-weight: var(--weight-extrabold);
}
.back-link { font-size: var(--text-sm); color: var(--color-text-2); margin-top: 6px; }

/* Stats */
.stats-strip { display: flex; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-6); }
.stat-card {
  display: flex; align-items: center; gap: var(--space-3);
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5);
  min-width: 160px;
}
.stat-icon {
  width: 40px; height: 40px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-value { font-size: var(--text-xl); font-weight: var(--weight-extrabold); }
.stat-label { font-size: var(--text-xs); color: var(--color-text-3); text-transform: uppercase; letter-spacing: .06em; }

/* Search */
.search-bar {
  display: flex; align-items: center; gap: var(--space-2);
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-5); max-width: 400px;
}
.search-icon { color: var(--color-text-4); flex-shrink: 0; }
.search-input { border: none; background: none; outline: none; flex: 1; font-size: var(--text-sm); color: var(--color-text); }

/* Table */
.admin-table-wrap { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
.admin-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.admin-table th {
  background: var(--color-bg-2); padding: var(--space-3) var(--space-4);
  text-align: left; font-size: var(--text-xs); text-transform: uppercase;
  letter-spacing: .06em; color: var(--color-text-3); border-bottom: 1px solid var(--color-border);
}
.admin-table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.admin-table tr:last-child td { border-bottom: none; }
.resolved-row:hover td { background: var(--color-surface); }

.item-cell  { display: flex; align-items: center; gap: var(--space-3); }
.item-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-md); background: var(--color-bg-2); flex-shrink: 0; }
.item-link  { color: var(--color-primary); font-weight: var(--weight-medium); }
.item-location { display: flex; align-items: center; gap: 3px; font-size: var(--text-xs); color: var(--color-text-4); margin-top: 2px; }
.text-muted { color: var(--color-text-2); }
.actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-16) 0; text-align: center; }
.empty-state__icon { width: 56px; height: 56px; border-radius: var(--radius-xl); background: var(--color-bg-2); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-text-4); }
.empty-state h3 { font-size: var(--text-xl); font-weight: var(--weight-semibold); }
.empty-state p  { font-size: var(--text-sm); color: var(--color-text-3); }
</style>
