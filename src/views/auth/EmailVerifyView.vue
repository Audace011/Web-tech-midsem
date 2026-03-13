<template>
  <div class="auth-page">
    <div class="auth-box">

      <!-- ① Auto-verifying from URL token -->
      <div v-if="state === 'checking'" class="verify-state">
        <BaseSpinner size="md" style="margin:0 auto" />
        <p class="verify-state__msg">Verifying your email…</p>
      </div>

      <!-- ② Successfully verified via link -->
      <div v-else-if="state === 'success'" class="verify-state">
        <div class="verify-icon verify-icon--success"><CheckCircle2 :size="32" /></div>
        <h1 class="verify-state__h">Email Verified!</h1>
        <p class="verify-state__msg">Your account is active. You can now post lost &amp; found items.</p>
        <BaseButton variant="primary" size="lg" fullWidth @click="$router.push('/')">Go to Homepage</BaseButton>
      </div>

      <!-- ③ Token invalid / expired -->
      <div v-else-if="state === 'invalid'" class="verify-state">
        <div class="verify-icon verify-icon--error"><AlertCircle :size="32" /></div>
        <h1 class="verify-state__h">Link Invalid or Expired</h1>
        <p class="verify-state__msg">This verification link is no longer valid. Please register again or request a new link.</p>
        <BaseButton variant="outline" size="md" @click="$router.push('/register')">Back to Register</BaseButton>
      </div>

      <!-- ④ Already verified -->
      <div v-else-if="state === 'already'" class="verify-state">
        <div class="verify-icon verify-icon--success"><CheckCircle2 :size="32" /></div>
        <h1 class="verify-state__h">Already Verified</h1>
        <p class="verify-state__msg">Your email has already been verified. You're good to go!</p>
        <BaseButton variant="primary" size="lg" fullWidth @click="$router.push('/')">Go to Homepage</BaseButton>
      </div>

      <!-- ⑤ Default: waiting for link click (user just registered, no token in URL) -->
      <div v-else class="verify-state">
        <div class="auth-box__brand">
          <div class="auth-logo-mark"><MapPin :size="14" /></div>
          <span>Lost<b>&</b>Found</span>
        </div>
        <div class="verify-icon verify-icon--info"><Mail :size="32" /></div>
        <h1 class="verify-state__h">Check your email</h1>
        <p class="verify-state__msg">
          We've sent a verification link to <strong>{{ auth.user?.email }}</strong>.
          Click the link to activate your account and start posting items.
        </p>
        <div class="verify-steps">
          <div class="verify-step"><span class="verify-step__num">1</span><span>Check your inbox (and spam folder)</span></div>
          <div class="verify-step"><span class="verify-step__num">2</span><span>Click the verification link in the email</span></div>
          <div class="verify-step"><span class="verify-step__num">3</span><span>You'll be automatically verified and redirected</span></div>
        </div>
        <div class="verify-actions">
          <BaseButton variant="outline" size="sm" :loading="resending" @click="resend">Resend Email</BaseButton>
          <BaseButton variant="ghost"   size="sm" @click="$router.push('/')">Skip for now</BaseButton>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { CheckCircle2, AlertCircle, Mail, MapPin } from 'lucide-vue-next'
import BaseButton  from '@/components/ui/BaseButton.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import { useAuthStore } from '@/stores/auth'
import { sendVerificationEmail } from '@/services/emailService'

const route    = useRoute()
const router   = useRouter()
const toast    = useToast()
const auth     = useAuthStore()
const resending = ref(false)

// 'waiting' | 'checking' | 'success' | 'invalid' | 'already'
const state = ref('waiting')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    // No token in URL — user just registered, show "check inbox" UI
    // If already verified, skip straight to success
    if (auth.user?.emailVerified) { state.value = 'already'; return }
    state.value = 'waiting'
    return
  }
  // Token present — auto-verify
  state.value = 'checking'
  await new Promise(r => setTimeout(r, 800))  // brief UX pause

  const ok = auth.verifyEmailByToken(token)
  state.value = ok ? 'success' : 'invalid'
})

async function resend() {
  if (!auth.user) return
  resending.value = true
  try {
    // Find the stored verifyToken for the current user
    const users = JSON.parse(localStorage.getItem('laf_users') || '[]')
    const stored = users.find(u => u.id === auth.user.id)
    if (!stored?.verifyToken) {
      toast.info('Your email is already verified or no token was found.')
      return
    }
    await sendVerificationEmail({ name: auth.user.name, email: auth.user.email }, stored.verifyToken)
    toast.success('Verification email resent! Check your inbox.')
  } catch (err) {
    toast.error('Failed to resend email. Please try again.')
    console.error(err)
  } finally {
    resending.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - var(--nav-height)); display:flex; align-items:center; justify-content:center; background:var(--color-bg); padding: var(--space-8) var(--space-4); }
.auth-box  { width:100%; max-width:440px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-2xl); padding:var(--space-8); box-shadow:var(--shadow-lg); }

.auth-box__brand { display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-base); font-weight:var(--weight-bold); color:var(--color-text); margin-bottom:var(--space-6); }
.auth-logo-mark { width:26px; height:26px; background:var(--color-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:#fff; }
.auth-box__brand b { color:var(--color-primary); }

.verify-state { display:flex; flex-direction:column; align-items:center; gap:var(--space-4); text-align:center; }
.verify-state__h   { font-size:var(--text-xl); font-weight:var(--weight-bold); }
.verify-state__msg { font-size:var(--text-sm); color:var(--color-text-3); max-width:340px; line-height:var(--leading-relaxed); }

.verify-icon { width:64px; height:64px; border-radius:var(--radius-full); display:flex; align-items:center; justify-content:center; }
.verify-icon--success { background:#DCFCE7; color:#16A34A; }
.verify-icon--error   { background:#FEE2E2; color:var(--color-danger); }
.verify-icon--info    { background:var(--color-primary-bg); color:var(--color-primary); }

.verify-steps { display:flex; flex-direction:column; gap:var(--space-3); width:100%; text-align:left; }
.verify-step  { display:flex; align-items:flex-start; gap:var(--space-3); font-size:var(--text-sm); color:var(--color-text-2); }
.verify-step__num { width:22px; height:22px; border-radius:var(--radius-full); background:var(--color-primary); color:#fff; font-size:var(--text-xs); font-weight:var(--weight-bold); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }

.verify-actions { display:flex; gap:var(--space-3); justify-content:center; flex-wrap:wrap; }
</style>
