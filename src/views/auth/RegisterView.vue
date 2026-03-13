<template>
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-box__brand">
        <div class="auth-logo-mark"><MapPin :size="14" /></div>
        <span>AUCA Lost<b>&amp;</b>Found</span>
      </div>
      <h1 class="auth-box__h">{{ t('auth.createAccount') }}</h1>
      <p class="auth-box__sub">{{ t('auth.alreadyHave') }} <RouterLink to="/login">{{ t('auth.signInInstead') }}</RouterLink></p>

      <button class="google-btn" @click="googleModal = true">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M16.24 8.71c0-.59-.05-1.15-.15-1.7H8.5v3.22h4.33a3.71 3.71 0 01-1.61 2.44v2.03h2.6c1.52-1.4 2.4-3.46 2.4-5.98z" fill="#4285F4"/><path d="M8.5 16.5c2.16 0 3.98-.72 5.3-1.94l-2.6-2.03c-.72.48-1.64.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.35v2.1A8 8 0 008.5 16.5z" fill="#34A853"/><path d="M4.03 10.01A4.79 4.79 0 013.77 8.5c0-.52.09-1.03.26-1.5v-2.1H1.35A8 8 0 00.5 8.5c0 1.3.31 2.52.85 3.6l2.68-2.09z" fill="#FBBC05"/><path d="M8.5 3.73c1.17 0 2.22.4 3.05 1.2l2.28-2.28C12.48.96 10.66.5 8.5.5A8 8 0 001.35 4.9l2.68 2.1C4.66 5.12 6.42 3.73 8.5 3.73z" fill="#EA4335"/></svg>
        {{ t('auth.google') }}
      </button>
      <GoogleSignIn v-model="googleModal" />
      <div class="auth-divider"><span>or</span></div>

      <form class="auth-form" @submit.prevent="submit">
        <BaseInput v-model="form.name" :label="t('auth.fullName')" placeholder="Alice Martin" :prefix-icon="User" :error="errors.name" required />
        <BaseInput v-model="form.email" :label="t('auth.email')" type="email" placeholder="you@example.com" :prefix-icon="Mail" :error="errors.email" required />
        <!-- Did you mean? hint -->
        <div v-if="emailSuggestion" class="email-suggest">
          <AlertTriangle :size="12" />
          Did you mean <strong>{{ form.email.split('@')[0] + '@' + emailSuggestion }}</strong>?
          <button type="button" class="email-suggest__fix" @click="fixEmail">Use this instead</button>
        </div>
        <BaseInput v-model="form.password" :label="t('auth.password')" type="password" placeholder="Min 8 chars, with A-z, 0-9, !@#"
          :prefix-icon="Lock" :error="errors.password" :show-strength="true" required />
        <BaseInput v-model="form.confirm" :label="t('auth.confirmPassword')" type="password" placeholder="Repeat password"
          :prefix-icon="Lock" :error="errors.confirm" required />

        <BaseButton type="submit" variant="primary" size="lg" fullWidth :loading="loading">{{ t('auth.createAccount') }}</BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { User, Mail, Lock, MapPin, AlertTriangle } from 'lucide-vue-next'
import BaseInput    from '@/components/ui/BaseInput.vue'
import BaseButton   from '@/components/ui/BaseButton.vue'
import GoogleSignIn from '@/components/ui/GoogleSignIn.vue'
import { useAuthStore } from '@/stores/auth'
import { validateForm, isRequired, isValidEmail, isValidName, isStrongPassword, suggestEmailDomain } from '@/helpers/validators'

const { t } = useI18n()
const router = useRouter(); const toast = useToast(); const auth = useAuthStore()
const loading     = ref(false)
const googleModal = ref(false)
const form        = reactive({ name:'', email:'', password:'', confirm:'' })
const errors      = reactive({})

// Live domain typo suggestion
const emailSuggestion = computed(() => suggestEmailDomain(form.email))
function fixEmail() {
  const [local] = form.email.split('@')
  form.email = `${local}@${emailSuggestion.value}`
}

async function submit() {
  const { errors: e, isValid } = validateForm(form, {
    name:     [{ validate: v => isValidName(v).valid,                           message: isValidName(form.name).message }],
    email:    [{ validate: v => isRequired(v) && isValidEmail(v),               message: 'Please enter a valid email address (e.g. name@domain.com).' }],
    password: [{ validate: v => isStrongPassword(v).valid,                      message: isStrongPassword(form.password).message }],
    confirm:  [{ validate: v => v === form.password,                             message: 'Passwords do not match.' }],
  })
  Object.assign(errors, e)
  if (!isValid) return
  loading.value = true
  try {
    await auth.register({ name: form.name, email: form.email, password: form.password })
    toast.success(`Welcome, ${form.name}! Your account is ready.`)
    router.push('/')
  } catch(err) { toast.error(err.message) }
  finally { loading.value = false }
}
</script>

<style scoped>
.auth-page { min-height:calc(100vh - var(--nav-height)); display:flex; align-items:center; justify-content:center; background:var(--color-bg); padding:var(--space-8) var(--space-4); }
.auth-box  { width:100%; max-width:420px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-2xl); padding:var(--space-8); box-shadow:var(--shadow-lg); }
.auth-box__brand { display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-base); font-weight:var(--weight-bold); color:var(--color-text); margin-bottom:var(--space-6); }
.auth-logo-mark { width:26px; height:26px; background:var(--color-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:#fff; }
.auth-box__brand b { color:var(--color-primary); }
.auth-box__h   { font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-1); }
.auth-box__sub { font-size:var(--text-sm); color:var(--color-text-3); margin-bottom:var(--space-5); }
.auth-box__sub a { color:var(--color-primary); font-weight:var(--weight-medium); }
.google-btn { width:100%; height:40px; display:flex; align-items:center; justify-content:center; gap:var(--space-3); background:var(--color-surface); border:1px solid var(--color-border-strong); border-radius:var(--radius-lg); font-size:var(--text-sm); font-weight:var(--weight-medium); color:var(--color-text); cursor:pointer; margin-bottom:var(--space-4); transition:all var(--transition-fast); }
.google-btn:hover { background:var(--color-bg-2); }
.auth-divider { display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-4); color:var(--color-text-4); font-size:var(--text-xs); }
.auth-divider::before, .auth-divider::after { content:''; flex:1; height:1px; background:var(--color-border); }
.auth-form { display:flex; flex-direction:column; gap:var(--space-4); }
.auth-note { display:flex; align-items:flex-start; gap:var(--space-2); padding:var(--space-3); background:var(--color-primary-bg); border:1px solid #BFDBFE; border-radius:var(--radius-lg); font-size:var(--text-xs); color:var(--color-primary); line-height:var(--leading-relaxed); }
.email-suggest {
  display:       flex; align-items: center; flex-wrap: wrap; gap: var(--space-2);
  padding:       var(--space-2) var(--space-3);
  background:    #FFFBEB; border: 1px solid #FCD34D;
  border-radius: var(--radius-lg);
  font-size:     var(--text-xs); color: #92400E;
  margin-top:    calc(-1 * var(--space-2));
}
.email-suggest strong { font-weight: var(--weight-semibold); }
.email-suggest__fix {
  background: none; border: none; cursor: pointer; padding: 0;
  color: #B45309; font-size: var(--text-xs); font-weight: var(--weight-semibold);
  text-decoration: underline; white-space: nowrap;
}
.email-suggest__fix:hover { color: #78350F; }

</style>
