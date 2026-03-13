<template>
  <AppLayout>
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <h1 class="page-header__h">{{ t('dashboard.title') }}</h1>
          <p class="page-header__sub">{{ t('dashboard.subtitle') }}</p>
        </div>
        <div style="display:flex;gap:var(--space-2)">
          <BaseButton variant="ghost" size="md" :icon="CheckCheck" @click="$router.push('/resolved')">Resolved Items</BaseButton>
          <BaseButton variant="primary" size="md" :icon="PlusCircle" @click="$router.push('/post')">{{ t('item.report') }}</BaseButton>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="stats-strip">
        <div class="stat-chip" v-for="s in stats" :key="s.label">
          <component :is="s.icon" :size="14" :style="{ color: s.color }" />
          <span class="stat-chip__num">{{ s.val }}</span>
          <span class="stat-chip__label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="q-tabs">
        <button v-for="tab in tabs" :key="tab.val"
          :class="['q-tab', { 'q-tab--on': activeTab === tab.val }]"
          @click="activeTab = tab.val">
          {{ tab.label }}
          <span class="q-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Empty -->
      <div v-if="filtered.length === 0" class="empty-state">
        <div class="empty-state__icon"><Inbox :size="28" /></div>
        <h3>{{ t('dashboard.noItems') }}</h3>
        <p>{{ t('dashboard.noItemsMsg') }}</p>
        <BaseButton variant="primary" size="md" :icon="PlusCircle" @click="$router.push('/post')">{{ t('dashboard.postFirst') }}</BaseButton>
      </div>

      <!-- Table-style list -->
      <div v-else class="item-list">
        <div v-for="item in filtered" :key="item.id" class="item-row">
          <img :src="item.imageUrl" :alt="item.title" class="item-row__img" @error="$event.target.src='https://placehold.co/64x64/F3F4F6/9CA3AF?text=?'" />
          <div class="item-row__info">
            <RouterLink :to="`/items/${item.id}`" class="item-row__title">{{ item.title }}</RouterLink>
            <div class="item-row__meta">
              <BaseBadge :variant="item.type">{{ item.type }}</BaseBadge>
              <BaseBadge :variant="item.status">{{ item.status }}</BaseBadge>
              <span class="meta-chip"><MapPin :size="11" />{{ item.location }}</span>
              <span class="meta-chip"><Calendar :size="11" />{{ formatFull(item.dateLostFound) }}</span>
            </div>
          </div>
          <div class="item-row__actions">
            <BaseButton variant="ghost" size="sm" :icon="Pencil" @click="$router.push(`/edit/${item.id}`)">{{ t('item.edit') }}</BaseButton>
            <BaseButton variant="ghost" size="sm" :icon="Trash2" class="btn-red" @click="confirmDel(item)">{{ t('item.delete') }}</BaseButton>
          </div>
        </div>
      </div>
    </div>

    <BaseModal v-model="delModal" title="Delete Item" width="420px">
      <p style="font-size:var(--text-sm);color:var(--color-text-2)">
        Are you sure you want to delete <strong>{{ delTarget?.title }}</strong>? This action cannot be undone.
      </p>
      <template #footer>
        <BaseButton variant="outline" size="sm" @click="delModal = false">{{ t('form.cancel') }}</BaseButton>
        <BaseButton variant="danger"  size="sm" :loading="deleting" @click="doDelete">{{ t('item.delete') }}</BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { MapPin, Calendar, PlusCircle, Pencil, Trash2, CheckCircle2, RotateCcw, Inbox, AlertCircle, PackageCheck, CheckCheck } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge  from '@/components/ui/BaseBadge.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'
import { useItemsStore } from '@/stores/items'
import { useAuthStore }  from '@/stores/auth'
import { formatFull } from '@/helpers/formatDate'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const store = useItemsStore()
const auth  = useAuthStore()
const activeTab = ref('all')
const delModal  = ref(false)
const delTarget = ref(null)
const deleting  = ref(false)

const myAllItems  = computed(() => store.getUserItems(auth.user.id))
const myResolved  = computed(() => myAllItems.value.filter(i => i.status === 'resolved'))
const myItems     = computed(() => myAllItems.value.filter(i => i.status !== 'resolved'))
const filtered    = computed(() => activeTab.value === 'all' ? myItems.value : myItems.value.filter(i => i.type === activeTab.value))

const tabs = computed(() => [
  { val: 'all',   label: t('item.all'),   count: myItems.value.length },
  { val: 'lost',  label: t('item.lost'),  count: myItems.value.filter(i => i.type === 'lost').length },
  { val: 'found', label: t('item.found'), count: myItems.value.filter(i => i.type === 'found').length },
])
const stats = computed(() => [
  { label: t('hero.total'),    val: myItems.value.length,                                            icon: PackageCheck, color: 'var(--color-primary)' },
  { label: t('item.lost'),     val: myItems.value.filter(i => i.type === 'lost').length,             icon: AlertCircle,  color: 'var(--color-lost)'    },
  { label: t('item.found'),    val: myItems.value.filter(i => i.type === 'found').length,            icon: PackageCheck, color: 'var(--color-found)'   },
  { label: t('item.resolved'), val: myResolved.value.length,                                         icon: CheckCheck,   color: 'var(--color-success)' },
])


function confirmDel(item) { delTarget.value = item; delModal.value = true }
async function doDelete() {
  deleting.value = true
  await store.deleteItem(delTarget.value.id)
  toast.success('Item deleted.')
  delModal.value = false; deleting.value = false
}
</script>

<style scoped>
.page-wrap { max-width: 900px; margin: 0 auto; padding: var(--space-10) var(--space-6) var(--space-16); }
.page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-6); gap:var(--space-4); flex-wrap:wrap; }
.page-header__h   { font-size:var(--text-2xl); font-weight:var(--weight-bold); }
.page-header__sub { font-size:var(--text-sm); color:var(--color-text-3); margin-top:var(--space-1); }

.stats-strip { display:flex; gap:var(--space-3); flex-wrap:wrap; margin-bottom:var(--space-6); }
.stat-chip { display:flex; align-items:center; gap:var(--space-2); padding:var(--space-2) var(--space-4); background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-full); }
.stat-chip__num   { font-size:var(--text-base); font-weight:var(--weight-bold); color:var(--color-text); }
.stat-chip__label { font-size:var(--text-xs); color:var(--color-text-3); }

.q-tabs { display:flex; gap:2px; padding:3px; background:var(--color-bg-2); border:1px solid var(--color-border); border-radius:var(--radius-lg); width:fit-content; margin-bottom:var(--space-5); }
.q-tab { display:flex; align-items:center; gap:var(--space-2); padding:5px 14px; border-radius:var(--radius-md); font-size:var(--text-sm); font-weight:var(--weight-medium); background:none; border:none; cursor:pointer; color:var(--color-text-3); transition:all var(--transition-fast); }
.q-tab--on { background:#fff; color:var(--color-text); box-shadow:var(--shadow-xs); }
.q-tab__count { background:var(--color-bg-2); color:var(--color-text-4); font-size:var(--text-xs); padding:1px 6px; border-radius:var(--radius-full); }

.item-list  { display:flex; flex-direction:column; gap:var(--space-2); }
.item-row   { display:flex; align-items:center; gap:var(--space-4); padding:var(--space-3) var(--space-4); background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-xl); transition:border-color var(--transition-fast); }
.item-row:hover { border-color:var(--color-border-strong); }
.item-row__img { width:56px; height:56px; object-fit:cover; border-radius:var(--radius-lg); background:var(--color-bg-2); flex-shrink:0; }
.item-row__info { flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--space-1); }
.item-row__title { font-size:var(--text-sm); font-weight:var(--weight-semibold); color:var(--color-text); text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.item-row__title:hover { color:var(--color-primary); text-decoration:underline; }
.item-row__meta { display:flex; align-items:center; flex-wrap:wrap; gap:var(--space-2); }
.meta-chip { display:flex; align-items:center; gap:3px; font-size:var(--text-xs); color:var(--color-text-4); }
.item-row__actions { display:flex; gap:var(--space-1); flex-shrink:0; }

.empty-state { display:flex; flex-direction:column; align-items:center; gap:var(--space-4); padding:var(--space-16) 0; text-align:center; }
.empty-state__icon { width:56px; height:56px; border-radius:var(--radius-xl); background:var(--color-bg-2); border:1px solid var(--color-border); display:flex; align-items:center; justify-content:center; color:var(--color-text-4); }
.empty-state h3 { font-size:var(--text-xl); font-weight:var(--weight-semibold); }
.empty-state p  { font-size:var(--text-sm); color:var(--color-text-3); }

.btn-red :deep(svg), .btn-red { color:var(--color-danger) !important; }
</style>
