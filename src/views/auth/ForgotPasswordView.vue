<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo"><MapPin :size="28" /><span>Lost<span class="amp">&amp;</span>Found</span></div>
      <template v-if="!sent">
        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-sub">We'll send you a reset link (demo: just shows a toast).</p>
        <form class="auth-form" @submit.prevent="submit">
          <BaseInput v-model="email" label="Email Address" type="email" placeholder="you@example.com" :prefix-icon="Mail" :error="error" required />
          <BaseButton type="submit" variant="primary" size="lg" fullWidth :loading="loading">Send Reset Link</BaseButton>
        </form>
      </template>
      <template v-else>
        <div class="auth-success">
          <CheckCircle :size="48" style="color:var(--color-success)" />
          <h2>Check your email</h2>
          <p>A reset link has been sent to <strong>{{ email }}</strong>.</p>
          <RouterLink to="/login"><BaseButton variant="outline" size="md">Back to Sign In</BaseButton></RouterLink>
        </div>
      </template>
      <p class="auth-switch"><RouterLink to="/login">← Back to Sign In</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { Mail, MapPin, CheckCircle } from 'lucide-vue-next'
import BaseInput  from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { isValidEmail } from '@/helpers/validators'

const toast   = useToast()
const email   = ref(''); const error = ref(''); const loading = ref(false); const sent = ref(false)

async function submit() {
  error.value = ''
  if (!isValidEmail(email.value)) { error.value = 'Please enter a valid email.'; return }
  loading.value = true
  await new Promise(r => setTimeout(r, 1200))
  loading.value = false; sent.value = true
  toast.success('Reset link sent (demo mode)!')
}
</script>

<style scoped>
.auth-page { min-height:100vh;display:flex;align-items:center;justify-content:center;padding:var(--space-6);background:var(--color-bg); }
.auth-card { width:100%;max-width:420px;background:var(--color-bg-3);border:1px solid var(--color-border-strong);border-radius:var(--radius-xl);padding:var(--space-10) var(--space-8);box-shadow:var(--shadow-lg); }
.auth-logo { display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xl);font-weight:var(--weight-extrabold);margin-bottom:var(--space-6); }
.amp { background:var(--gradient-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.auth-title { font-size:var(--text-2xl);font-weight:var(--weight-extrabold); }
.auth-sub   { color:var(--color-text-2);font-size:var(--text-sm);margin-top:var(--space-1);margin-bottom:var(--space-6); }
.auth-form  { display:flex;flex-direction:column;gap:var(--space-4); }
.auth-switch { text-align:center;font-size:var(--text-sm);color:var(--color-text-2);margin-top:var(--space-5); }
.auth-success { display:flex;flex-direction:column;align-items:center;gap:var(--space-4);text-align:center;padding:var(--space-6) 0; }
.auth-success h2 { font-size:var(--text-xl); }
.auth-success p  { font-size:var(--text-sm);color:var(--color-text-2); }
</style>
