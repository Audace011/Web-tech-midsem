<template>
  <AppLayout>
    <div class="page-wrap">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-header__h"><CheckCircle2 :size="22" class="h-icon" /> Resolved Items</h1>
          <p class="page-header__sub">
            {{ auth.isAdmin ? 'All items marked as resolved across the platform' : 'All resolved items — read-only view' }}
          </p>
        </div>
        <BaseButton variant="outline" size="md" @click="$router.push('/')">
          Browse Active Items
        </BaseButton>
      </div>

      <!-- Stats strip -->
      <div class="stats-strip">
        <div class="stat-chip">
          <CheckCircle2 :size="14" style="color:var(--color-success)" />
          <span class="stat-chip__num">{{ resolvedItems.length }}</span>
          <span class="stat-chip__label">Total Resolved</span>
        </div>
        <div class="stat-chip">
          <AlertCircle :size="14" style="color:var(--color-lost)" />
          <span class="stat-chip__num">{{ resolvedLost }}</span>
          <span class="stat-chip__label">Lost → Resolved</span>
        </div>
        <div class="stat-chip">
          <PackageCheck :size="14" style="color:var(--color-found)" />
          <span class="stat-chip__num">{{ resolvedFound }}</span>
          <span class="stat-chip__label">Found → Resolved</span>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <Search :size="14" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search resolved items…"
          class="search-input"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <X :size="13" />
        </button>
      </div>

      <!-- Empty state: no resolved items at all -->
      <div v-if="resolvedItems.length === 0" class="empty-state">
        <div class="empty-state__icon"><CheckCircle2 :size="28" /></div>
        <h3>No resolved items yet</h3>
        <p>{{ auth.isAdmin ? 'Items marked as resolved by any user will appear here.' : 'Items you mark as resolved will appear here.' }}</p>
        <BaseButton variant="primary" size="md" @click="$router.push('/')">Browse Items</BaseButton>
      </div>

      <!-- Empty state: search returned nothing -->
      <div v-else-if="filtered.length === 0" class="empty-state">
        <div class="empty-state__icon"><SearchX :size="28" /></div>
        <h3>No results for "{{ searchQuery }}"</h3>
        <p>Try a different search term.</p>
        <BaseButton variant="outline" size="md" @click="searchQuery = ''">Clear Search</BaseButton>
      </div>

      <!-- Item list -->
      <div v-else class="item-list">
        <div v-for="item in filtered" :key="item.id" class="item-row resolved-row">
          <img
            :src="item.imageUrl"
            :alt="item.title"
            class="item-row__img"
            @error="$event.target.src='https://placehold.co/64x64/F3F4F6/9CA3AF?text=?'"
          />
          <div class="item-row__info">
            <RouterLink :to="`/items/${item.id}`" class="item-row__title">{{ item.title }}</RouterLink>
            <div class="item-row__meta">
              <BaseBadge :variant="item.type">{{ item.type }}</BaseBadge>
              <BaseBadge variant="resolved">Resolved</BaseBadge>
              <span class="meta-chip"><MapPin :size="11" />{{ item.location }}</span>
              <span class="meta-chip"><Calendar :size="11" />{{ formatFull(item.dateLostFound) }}</span>
              <!-- Admin: show who posted it -->
              <span v-if="auth.isAdmin" class="meta-chip"><User :size="11" />{{ item.userName }}</span>
            </div>
          </div>
          <div class="item-row__actions" v-if="auth.isAdmin">
            <!-- Re-open -->
            <BaseButton
              variant="ghost"
              size="sm"
              :icon="RotateCcw"
              @click="reopen(item)"
              title="Mark as Open"
            >
              Re-open
            </BaseButton>
            <!-- Delete -->
            <BaseButton
              variant="ghost"
              size="sm"
              :icon="Trash2"
              class="btn-red"
              @click="confirmDel(item)"
            >
              Delete
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <BaseModal v-model="delModal" title="Delete Item" width="420px">
      <p style="font-size:var(--text-sm);color:var(--color-text-2)">
        Delete <strong>{{ delTarget?.title }}</strong>? This cannot be undone.
      </p>
      <template #footer>
        <BaseButton variant="outline" size="sm" @click="delModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" size="sm" :loading="deleting" @click="doDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { CheckCircle2, AlertCircle, PackageCheck, MapPin, Calendar, User, Trash2, RotateCcw, Search, SearchX, X } from 'lucide-vue-next'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseBadge  from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'
import { useItemsStore } from '@/stores/items'
import { useAuthStore }  from '@/stores/auth'
import { formatFull } from '@/helpers/formatDate'

const store  = useItemsStore()
const auth   = useAuthStore()
const toast  = useToast()

const searchQuery = ref('')
const delModal  = ref(false)
const delTarget = ref(null)
const deleting  = ref(false)

// Everyone sees all resolved items; admins can manage them
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
  await store.markResolved(item.id)   // toggles back to 'open'
  toast.success(`"${item.title}" is now open again.`)
}

function confirmDel(item) { delTarget.value = item; delModal.value = true }
async function doDelete() {
  deleting.value = true
  await store.deleteItem(delTarget.value.id)
  toast.success('Item deleted.')
  delModal.value = false
  deleting.value = false
  delTarget.value = null
}
</script>

<style scoped>
.page-wrap { max-width: 900px; margin: 0 auto; padding: var(--space-10) var(--space-6) var(--space-16); }

.page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-6); gap:var(--space-4); flex-wrap:wrap; }
.page-header__h   { font-size:var(--text-2xl); font-weight:var(--weight-bold); display:flex; align-items:center; gap:var(--space-2); }
.h-icon { color: var(--color-success, #22c55e); }
.page-header__sub { font-size:var(--text-sm); color:var(--color-text-3); margin-top:var(--space-1); }

/* Stats */
.stats-strip { display:flex; gap:var(--space-3); flex-wrap:wrap; margin-bottom:var(--space-5); }
.stat-chip { display:flex; align-items:center; gap:var(--space-2); padding:var(--space-2) var(--space-4); background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-full); }
.stat-chip__num   { font-size:var(--text-base); font-weight:var(--weight-bold); color:var(--color-text); }
.stat-chip__label { font-size:var(--text-xs); color:var(--color-text-3); }

/* Search */
.search-bar {
  display:flex; align-items:center; gap:var(--space-2);
  background:var(--color-surface); border:1px solid var(--color-border);
  border-radius:var(--radius-lg); padding:var(--space-2) var(--space-3);
  margin-bottom:var(--space-5); max-width:420px;
}
.search-icon  { color:var(--color-text-4); flex-shrink:0; }
.search-input { border:none; background:none; outline:none; flex:1; font-size:var(--text-sm); color:var(--color-text); }
.search-clear { background:none; border:none; cursor:pointer; color:var(--color-text-4); display:flex; align-items:center; }
.search-clear:hover { color:var(--color-text-2); }

/* Item list */
.item-list  { display:flex; flex-direction:column; gap:var(--space-2); }
.item-row   {
  display:flex; align-items:center; gap:var(--space-4);
  padding:var(--space-3) var(--space-4);
  background:var(--color-surface); border:1px solid var(--color-border);
  border-radius:var(--radius-xl); transition:border-color var(--transition-fast);
}
.resolved-row { border-left: 3px solid #22c55e; }
.item-row:hover { border-color:var(--color-border-strong); }
.item-row__img  { width:56px; height:56px; object-fit:cover; border-radius:var(--radius-lg); background:var(--color-bg-2); flex-shrink:0; }
.item-row__info { flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--space-1); }
.item-row__title { font-size:var(--text-sm); font-weight:var(--weight-semibold); color:var(--color-text); text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.item-row__title:hover { color:var(--color-primary); text-decoration:underline; }
.item-row__meta { display:flex; align-items:center; flex-wrap:wrap; gap:var(--space-2); }
.meta-chip { display:flex; align-items:center; gap:3px; font-size:var(--text-xs); color:var(--color-text-4); }
.item-row__actions { display:flex; gap:var(--space-1); flex-shrink:0; }

/* Empty */
.empty-state { display:flex; flex-direction:column; align-items:center; gap:var(--space-4); padding:var(--space-16) 0; text-align:center; }
.empty-state__icon { width:56px; height:56px; border-radius:var(--radius-xl); background:var(--color-bg-2); border:1px solid var(--color-border); display:flex; align-items:center; justify-content:center; color:var(--color-text-4); }
.empty-state h3 { font-size:var(--text-xl); font-weight:var(--weight-semibold); }
.empty-state p  { font-size:var(--text-sm); color:var(--color-text-3); }

.btn-red :deep(svg), .btn-red { color:var(--color-danger) !important; }
</style>
