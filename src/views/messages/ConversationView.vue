<template>
  <AppLayout>
    <div class="container thread-wrap">
      <div class="thread-header">
        <button class="back-btn" @click="$router.push('/inbox')"><ArrowLeft :size="16" /> Inbox</button>
        <div class="thread-meta">
          <div class="thread-avatar">{{ otherName[0] }}</div>
          <div>
            <p class="thread-name">{{ otherName }}</p>
            <RouterLink :to="`/items/${itemId}`" class="thread-item-link">📦 {{ itemTitle }}</RouterLink>
          </div>
        </div>
        
        <!-- Admin Moderation Toggle -->
        <div style="margin-left:auto" v-if="auth.isAdmin">
          <BaseButton 
            v-if="isBlocked" 
            variant="outline" size="sm" 
            @click="store.unblockThread(threadKey)"
          >
            Unrestrict Chat
          </BaseButton>
          <BaseButton 
            v-else 
            variant="danger" size="sm" 
            @click="store.blockThread(threadKey)"
          >
            Restrict Chat
          </BaseButton>
        </div>
      </div>

      <div class="thread-messages" ref="messageList">
        <div v-for="m in thread" :key="m.id" class="bubble-wrap" :class="{ 'bubble-wrap--mine': m.senderId === auth.user.id }">
          <div class="bubble" :class="{ 'bubble--mine': m.senderId === auth.user.id }">
            <p class="bubble__text">{{ m.text }}</p>
            <span class="bubble__time">{{ formatRelative(m.timestamp) }}</span>
          </div>
        </div>
        <div v-if="thread.length === 0" class="thread-empty">No messages yet. Say hi!</div>
      </div>

      <!-- Input or Disabled Notice -->
      <div v-if="isResolved" class="thread-disabled-notice">
        This item has been resolved. The conversation is now read-only.
      </div>
      <div v-else-if="isBlocked" class="thread-disabled-notice">
        This conversation has been restricted by an administrator.
      </div>
      <form v-else class="thread-input" @submit.prevent="send">
        <input v-model="newMsg" class="thread-input__field" placeholder="Type a message…" @keyup.enter="send" />
        <BaseButton type="submit" variant="primary" size="md" :disabled="!newMsg.trim()">
          <Send :size="16" />
        </BaseButton>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Send } from 'lucide-vue-next'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useMessagesStore } from '@/stores/messages'
import { useItemsStore }    from '@/stores/items'
import { useAuthStore }     from '@/stores/auth'
import { formatRelative }   from '@/helpers/formatDate'

const route  = useRoute()
const auth   = useAuthStore()
const store  = useMessagesStore()
const itemsStore = useItemsStore()

const threadKey = computed(() => route.params.threadKey)
const [userPart, itemId] = computed(() => {
  const parts = threadKey.value.split('_')
  return [parts[0], parts[1]]
}).value

const otherIdFromKey = userPart.replace(auth.user.id + '-', '').replace('-' + auth.user.id, '')

const thread    = computed(() => store.getThread(auth.user.id, otherIdFromKey, itemId))
const otherName = computed(() => {
  const last = thread.value.find(m => m.senderId !== auth.user.id)
  if (last?.senderName) return last.senderName;
  if (thread.value.length > 0 && thread.value[0].receiverName) return thread.value[0].receiverName;
  if (itemId === 'admin-contact') return 'Support Admin';
  return 'User';
})
const itemTitle = computed(() => {
  if (thread.value.length > 0) return thread.value[0].itemTitle;
  if (itemId === 'admin-contact') return 'Platform Support';
  return '';
})
const itemObj   = computed(() => itemsStore.getItemById(itemId))
const isResolved= computed(() => itemObj.value?.status === 'resolved')
const isBlocked = computed(() => store.blockedThreads.includes(threadKey.value))

const newMsg     = ref('')
const messageList = ref(null)

function scrollBottom() {
  nextTick(() => {
    if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
  })
}

function send() {
  if (!newMsg.value.trim()) return
  store.sendMessage({
    senderId:     auth.user.id,
    senderName:   auth.user.name,
    receiverId:   otherIdFromKey,
    receiverName: otherName.value,
    itemId,
    itemTitle:    itemTitle.value,
    text:         newMsg.value.trim(),
  })
  newMsg.value = ''
  scrollBottom()
}

onMounted(() => {
  store.markThreadRead(auth.user.id, otherIdFromKey, itemId)
  scrollBottom()
})
</script>

<style scoped>
.thread-wrap { max-width:700px;margin:0 auto;padding:var(--space-6) var(--space-4);display:flex;flex-direction:column;height:calc(100vh - var(--nav-height) - 40px); }
.thread-header { display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4);padding-bottom:var(--space-4);border-bottom:1px solid var(--color-border); }
.back-btn { background:none;border:none;color:var(--color-text-2);cursor:pointer;display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);flex-shrink:0; }
.thread-meta { display:flex;align-items:center;gap:var(--space-3); }
.thread-avatar { width:40px;height:40px;border-radius:var(--radius-full);background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:var(--weight-bold); }
.thread-name { font-weight:var(--weight-semibold); }
.thread-item-link { font-size:var(--text-xs);color:var(--color-primary-light); }

.thread-messages { flex:1;overflow-y:auto;padding:var(--space-4) 0;display:flex;flex-direction:column;gap:var(--space-3); }
.thread-empty { text-align:center;color:var(--color-text-3);font-size:var(--text-sm);padding:var(--space-8) 0; }

.bubble-wrap { display:flex; }
.bubble-wrap--mine { justify-content:flex-end; }

.bubble {
  max-width:70%;padding:var(--space-3) var(--space-4);
  border-radius:var(--radius-lg);
  background:var(--color-surface);
  border:1px solid var(--color-border);
}
.bubble--mine { background:var(--color-primary);border-color:var(--color-primary-dark);border-radius:var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg); }
.bubble__text { font-size:var(--text-sm);line-height:var(--leading-relaxed); }
.bubble--mine .bubble__text { color:#fff; }
.bubble__time { font-size:10px;color:var(--color-text-3);margin-top:4px;display:block; }
.bubble--mine .bubble__time { color:rgba(255,255,255,0.6); }

.thread-input { display:flex;gap:var(--space-3);padding-top:var(--space-4);border-top:1px solid var(--color-border); }
.thread-input__field { flex:1;background:var(--color-surface);border:1px solid var(--color-border-strong);border-radius:var(--radius-full);padding:var(--space-3) var(--space-5);color:var(--color-text);font-size:var(--text-base);outline:none;transition:border-color var(--transition-fast); }
.thread-input__field:focus { border-color:var(--color-primary); }
.thread-input__field::placeholder { color:var(--color-text-3); }

.thread-disabled-notice {
  text-align: center;
  padding: var(--space-4);
  background: var(--color-bg-2);
  border-radius: var(--radius-lg);
  color: var(--color-text-3);
  font-size: var(--text-sm);
  margin-top: var(--space-4);
}
</style>
