<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="g-backdrop" @mousedown.self="$emit('update:modelValue', false)">
        <div class="g-panel">
          <!-- Google branding header -->
          <div class="g-header">
            <svg width="74" height="24" viewBox="0 0 74 24" fill="none"><text x="0" y="19" font-family="Arial,sans-serif" font-size="22" font-weight="bold"><tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan></text></svg>
            <h2 class="g-header__title">Sign in</h2>
            <p class="g-header__sub">to continue to Lost &amp; Found</p>
          </div>

          <!-- Account picker -->
          <div class="g-accounts">
            <p class="g-accounts__label">Choose an account</p>
            <button v-for="acc in accounts" :key="acc.email"
              class="g-account" @click="selectAccount(acc)">
              <div class="g-account__avatar" :style="{ background: acc.color }">
                {{ acc.name[0] }}
              </div>
              <div class="g-account__info">
                <p class="g-account__name">{{ acc.name }}</p>
                <p class="g-account__email">{{ acc.email }}</p>
              </div>
              <ChevronRight :size="16" class="g-account__arrow" />
            </button>

            <button class="g-account g-account--add" @click="addAccount">
              <div class="g-account__avatar g-account__avatar--add">
                <UserPlus :size="15" />
              </div>
              <div class="g-account__info">
                <p class="g-account__name">Use another account</p>
              </div>
              <ChevronRight :size="16" class="g-account__arrow" />
            </button>
          </div>

          <!-- Footer -->
          <div class="g-footer">
            <a href="#" class="g-footer__link" @click.prevent>Privacy Policy</a>
            <span>·</span>
            <a href="#" class="g-footer__link" @click.prevent>Terms of Service</a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ChevronRight, UserPlus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ modelValue: Boolean })
const emit  = defineEmits(['update:modelValue'])
const router = useRouter()
const toast  = useToast()
const auth   = useAuthStore()

// Mock Google accounts — realistic demo accounts
const accounts = [
  { name: 'Alice Martin',  email: 'alice@example.com',  password: 'alice123', color: '#4285F4' },
  { name: 'Bob Johnson',   email: 'bob@example.com',    password: 'bob12345', color: '#34A853' },
  { name: 'Admin User',    email: 'admin@laf.com',      password: 'admin123', color: '#EA4335' },
]

async function selectAccount(acc) {
  emit('update:modelValue', false)
  try {
    await auth.login(acc.email, acc.password)
    toast.success(`Signed in as ${acc.name}`)
    router.push('/')
  } catch {
    // If email not found, register them as a new Google user
    await auth.register({ name: acc.name, email: acc.email, password: acc.password })
    auth.markEmailVerified()
    toast.success(`Google account connected — welcome, ${acc.name}!`)
    router.push('/')
  }
}

function addAccount() {
  emit('update:modelValue', false)
  toast.info('In production this opens the full Google sign-in flow.')
}
</script>

<style scoped>
/* Backdrop */
.g-backdrop {
  position: fixed; inset: 0; z-index: var(--z-modal);
  background: rgba(17,24,39,0.4);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-4);
}

/* Panel */
.g-panel {
  background:    #fff;
  border-radius: 28px;
  box-shadow:    0 8px 40px rgba(0,0,0,0.18);
  width:         100%;
  max-width:     400px;
  overflow:      hidden;
  font-family:   'Google Sans', Roboto, Arial, sans-serif;
}

/* Header */
.g-header {
  padding:         var(--space-8) var(--space-8) var(--space-5);
  text-align:      center;
  border-bottom:   1px solid #E5E7EB;
}
.g-header__title {
  font-size: 1.375rem;
  font-weight: 400;
  color: #202124;
  margin: var(--space-4) 0 var(--space-1);
  letter-spacing: 0;
}
.g-header__sub {
  font-size: var(--text-sm);
  color: #5F6368;
}

/* Accounts */
.g-accounts { padding: var(--space-3) 0; }
.g-accounts__label {
  font-size: var(--text-xs);
  color: #5F6368;
  padding: var(--space-2) var(--space-6);
  font-weight: 500;
}
.g-account {
  display:     flex;
  align-items: center;
  gap:         var(--space-4);
  width:       100%;
  padding:     var(--space-3) var(--space-6);
  background:  none;
  border:      none;
  cursor:      pointer;
  text-align:  left;
  transition:  background 0.1s;
}
.g-account:hover { background: #F8F9FA; }

.g-account__avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1rem; font-weight: 500;
  flex-shrink: 0;
}
.g-account__avatar--add {
  background: #E8F0FE !important;
  color: #1A73E8 !important;
  border: 1px solid #DADCE0;
}
.g-account__info { flex: 1; min-width: 0; }
.g-account__name  { font-size: var(--text-sm); font-weight: 500; color: #202124; }
.g-account__email { font-size: var(--text-xs); color: #5F6368; }
.g-account--add .g-account__name { color: #1A73E8; }
.g-account__arrow { color: #5F6368; flex-shrink: 0; }

/* Footer */
.g-footer {
  display:         flex;
  justify-content: center;
  align-items:     center;
  gap:             var(--space-2);
  padding:         var(--space-4) var(--space-6) var(--space-5);
  border-top:      1px solid #E5E7EB;
  font-size:       var(--text-xs);
  color:           #5F6368;
}
.g-footer__link { color: #1A73E8; text-decoration: none; }
.g-footer__link:hover { text-decoration: underline; }

/* Transition */
.modal-enter-active, .modal-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
