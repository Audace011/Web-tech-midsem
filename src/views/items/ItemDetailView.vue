<template>
  <AppLayout>
    <div class="page-wrap container">
      <div v-if="!item" class="empty-state" style="padding:4rem 0">
        <div class="empty-state__icon"><PackageSearch :size="28" /></div>
        <h3>Item not found</h3>
        <p>This item may have been removed.</p>
        <BaseButton variant="outline" size="md" @click="$router.push('/')">Browse Items</BaseButton>
      </div>

      <template v-else>
        <button class="back-btn" @click="$router.back()"><ChevronLeft :size="16" /> Back</button>

        <div class="detail-grid">
          <!-- Image -->
          <div class="detail-image-wrap">
            <img :src="item.imageUrl" :alt="item.title" class="detail-image"
                 @error="$event.target.src='https://placehold.co/600x400/F3F4F6/9CA3AF?text=No+Image'" />
            <div class="detail-badges">
              <span :class="['detail-pill', `detail-pill--${item.type}`]">
                <AlertCircle v-if="item.type==='lost'" :size="11" />
                <PackageCheck v-else :size="11" />
                {{ item.type === 'lost' ? 'Lost' : 'Found' }}
              </span>
              <span :class="['detail-pill', `detail-pill--${item.status}`]">
                <CheckCircle2 v-if="item.status==='resolved'" :size="11" />
                <Clock v-else :size="11" />
                {{ item.status === 'resolved' ? 'Resolved' : 'Open' }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="detail-info">
            <p class="detail-cat">{{ categoryLabel }}</p>
            <h1 class="detail-title">{{ item.title }}</h1>

            <div class="detail-meta">
              <div class="meta-row"><MapPin :size="14" /><span>{{ item.location }}</span></div>
              <div class="meta-row"><Calendar :size="14" /><span>{{ formatFull(item.dateLostFound) }}</span></div>
              <div class="meta-row"><Clock :size="14" /><span>Posted {{ formatRelative(item.createdAt) }}</span></div>
              <div class="meta-row"><User :size="14" /><span>By <strong>{{ item.userName }}</strong></span></div>
            </div>

            <div class="divider" />

            <div class="detail-section">
              <h3 class="detail-section__title">Description</h3>
              <p class="detail-desc">{{ item.description }}</p>
            </div>

            <!-- Actions -->
            <div class="detail-actions">
              <!-- Manage actions -->
              <template v-if="canEditDelete || canResolve">
                <BaseButton v-if="canEditDelete" variant="outline"  size="md" :icon="Pencil" @click="$router.push(`/edit/${item.id}`)">{{ t('item.edit') }}</BaseButton>
                <BaseButton v-if="canResolve" :variant="item.status==='resolved' ? 'outline' : 'success'" size="md" :icon="CheckCircle2" @click="toggleResolved">
                  {{ item.status === 'resolved' ? t('item.markOpen') : t('item.markResolved') }}
                </BaseButton>
                <BaseButton v-if="canEditDelete" variant="danger" size="md" :icon="Trash2" @click="confirmDel = true">{{ t('item.delete') }}</BaseButton>
              </template>
              <template v-else>
                <BaseButton v-if="auth.isLoggedIn && !isOwner" variant="primary" size="md" :icon="MessageSquare" @click="contactOwner">
                  {{ t('item.contact') }}
                </BaseButton>
                <BaseButton v-else-if="!auth.isLoggedIn" variant="primary" size="md" :icon="MessageSquare" @click="$router.push('/login')">
                  {{ t('item.signInContact') }}
                </BaseButton>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>

    <BaseModal v-model="confirmDel" title="Delete Report" width="420px">
      <p style="font-size:var(--text-sm);color:var(--color-text-2)">
        Delete <strong>{{ item?.title }}</strong>? This action cannot be undone.
      </p>
      <template #footer>
        <BaseButton variant="outline" size="sm" @click="confirmDel = false">Cancel</BaseButton>
        <BaseButton variant="danger"  size="sm" :loading="deleting" @click="doDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, MapPin, Calendar, Clock, User, Pencil, CheckCircle2, Trash2, MessageSquare, AlertCircle, PackageCheck, PackageSearch } from 'lucide-vue-next'
import AppLayout   from '@/components/layout/AppLayout.vue'
import BaseButton  from '@/components/ui/BaseButton.vue'
import BaseModal   from '@/components/ui/BaseModal.vue'
import { useItemsStore }    from '@/stores/items'
import { useAuthStore }     from '@/stores/auth'
import { useMessagesStore } from '@/stores/messages'
import { CATEGORIES }       from '@/helpers/constants'
import { formatRelative, formatFull } from '@/helpers/formatDate'

const { t }  = useI18n()
const route  = useRoute(); const router = useRouter(); const toast = useToast()
const store  = useItemsStore(); const auth = useAuthStore(); const msgStore = useMessagesStore()

// Reactive — automatically updates when store changes or route param changes
const item = computed(() => store.getItemById(route.params.id))

const confirmDel = ref(false)
const deleting   = ref(false)

const isOwner       = computed(() => auth.isLoggedIn && item.value?.userId === auth.user?.id)
const canEditDelete = computed(() => auth.isAdmin || (isOwner.value && item.value?.status !== 'resolved'))
const canResolve    = computed(() => auth.isAdmin)

const categoryLabel = computed(() => CATEGORIES.find(c => c.value === item.value?.category)?.label ?? item.value?.category)

async function toggleResolved() {
  await store.markResolved(item.value.id)
  const updatedItem = store.getItemById(item.value.id)
  if (updatedItem?.status === 'resolved') {
    toast.success('Item marked as resolved.')
    router.push('/resolved')
  } else {
    toast.success('Item marked as open.')
  }
}
async function doDelete() {
  deleting.value = true
  await store.deleteItem(item.value.id)
  toast.success('Report deleted.')
  // Admin goes to admin panel; owner goes to their dashboard
  router.push(auth.isAdmin && !isOwner.value ? '/admin/posts' : '/dashboard')
}
function contactOwner() {
  const key = `${[auth.user.id, item.value.userId].sort().join('-')}_${item.value.id}`
  const existing = msgStore.getThread(auth.user.id, item.value.userId, item.value.id)
  if (!existing.length) {
    msgStore.sendMessage({ senderId: auth.user.id, senderName: auth.user.name, receiverId: item.value.userId, receiverName: item.value.userName, itemId: item.value.id, itemTitle: item.value.title, text: `Hi, I'm reaching out about your post: "${item.value.title}".` })
  }
  router.push(`/inbox/${key}`)
}
</script>

<style scoped>
.page-wrap { padding: var(--space-8) var(--space-6) var(--space-16); }
.back-btn { display:flex; align-items:center; gap:var(--space-1); font-size:var(--text-sm); color:var(--color-text-3); background:none; border:none; cursor:pointer; margin-bottom:var(--space-6); transition:color var(--transition-fast); }
.back-btn:hover { color:var(--color-primary); }

.detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-10); align-items:start; }

.detail-image-wrap { position:relative; border-radius:var(--radius-2xl); overflow:hidden; border:1px solid var(--color-border); }
.detail-image { width:100%; height:380px; object-fit:cover; background:var(--color-bg-2); }
.detail-badges { position:absolute; top:var(--space-3); left:var(--space-3); display:flex; gap:var(--space-2); }
.detail-pill { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:var(--radius-full); font-size:var(--text-xs); font-weight:var(--weight-semibold); text-transform:uppercase; letter-spacing:0.04em; }
.detail-pill--lost     { background: var(--color-lost);    color:#fff; }
.detail-pill--found    { background: var(--color-found);   color:#fff; }
.detail-pill--open     { background:rgba(0,0,0,0.55);     color:#fff; }
.detail-pill--resolved { background:rgba(6,95,70,0.75);   color:#fff; }

.detail-info { display:flex; flex-direction:column; gap:var(--space-4); }
.detail-cat { font-size:var(--text-xs); font-weight:var(--weight-semibold); text-transform:uppercase; letter-spacing:0.06em; color:var(--color-primary); }
.detail-title { font-size:var(--text-3xl); font-weight:var(--weight-bold); letter-spacing:-0.01em; }

.detail-meta { display:flex; flex-direction:column; gap:var(--space-2); }
.meta-row { display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-sm); color:var(--color-text-3); }
.meta-row strong { color:var(--color-text-2); }

.detail-section__title { font-size:var(--text-sm); font-weight:var(--weight-semibold); color:var(--color-text-3); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:var(--space-2); }
.detail-desc { font-size:var(--text-base); color:var(--color-text-2); line-height:var(--leading-relaxed); }

.detail-actions { display:flex; gap:var(--space-3); flex-wrap:wrap; padding-top:var(--space-2); border-top:1px solid var(--color-border); }

@media (max-width:768px) { .detail-grid { grid-template-columns:1fr; } .detail-image { height:240px; } }
</style>
