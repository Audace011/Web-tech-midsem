<template>
  <AppLayout>
    <div class="page-wrap">
      <div class="page-header">
        <div>
          <h1 class="page-header__h">{{ t('item.report') }}</h1>
          <p class="page-header__sub">{{ t('form.lostTypeDesc') }}</p>
        </div>
      </div>

      <!-- Type selector -->
      <div class="type-selector">
        <button :class="['type-card', { 'type-card--on': form.type === 'lost' }]" @click="form.type = 'lost'">
          <div class="type-card__icon type-card__icon--lost"><AlertCircle :size="20" /></div>
          <div>
            <p class="type-card__label">{{ t('form.lostType') }}</p>
            <p class="type-card__desc">{{ t('form.lostTypeDesc') }}</p>
          </div>
        </button>
        <button :class="['type-card', { 'type-card--on': form.type === 'found' }]" @click="form.type = 'found'">
          <div class="type-card__icon type-card__icon--found"><PackageCheck :size="20" /></div>
          <div>
            <p class="type-card__label">{{ t('form.foundType') }}</p>
            <p class="type-card__desc">{{ t('form.foundTypeDesc') }}</p>
          </div>
        </button>
      </div>

      <div class="form-card">
        <form class="form-body" @submit.prevent="submit" novalidate>
          <div class="form-row">
            <BaseInput v-model="form.title" :label="t('form.title')" placeholder="e.g. Black leather wallet" :error="errors.title" required />
            <BaseSelect v-model="form.category" :label="t('form.category')" :options="CATEGORIES" placeholder="Select category…" :error="errors.category" required />
          </div>
          <div class="form-row">
            <BaseInput v-model="form.location" :label="t('form.location')" placeholder="e.g. Central Library, 2nd floor" :prefix-icon="MapPin" :error="errors.location" required />
            <BaseInput v-model="form.dateLostFound" :label="t('form.date')" type="date" :error="errors.dateLostFound" required />
          </div>
          <BaseInput v-model="form.description" :label="t('form.description')" type="textarea" :rows="4"
            placeholder="Describe the item in detail — color, size, brand, distinguishing marks…"
            :error="errors.description" required />

          <div class="form-field">
            <label class="form-label">{{ t('form.photo') }} <span class="optional">{{ t('form.optional') }}</span></label>
            <ImageUpload v-model="form.imageUrl" />
          </div>

          <div class="form-submit">
            <BaseButton type="submit" variant="primary" size="lg" :loading="loading">
              {{ t('form.submit') }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { MapPin, AlertCircle, PackageCheck } from 'lucide-vue-next'
import AppLayout   from '@/components/layout/AppLayout.vue'
import BaseInput   from '@/components/ui/BaseInput.vue'
import BaseSelect  from '@/components/ui/BaseSelect.vue'
import BaseButton  from '@/components/ui/BaseButton.vue'
import ImageUpload from '@/components/items/ImageUpload.vue'
import { useItemsStore } from '@/stores/items'
import { useAuthStore }  from '@/stores/auth'
import { CATEGORIES }    from '@/helpers/constants'
import { validateForm, isRequired } from '@/helpers/validators'

const { t }   = useI18n()
const router  = useRouter()
const toast      = useToast()
const store      = useItemsStore()
const auth       = useAuthStore()
const loading    = ref(false)
const errors     = reactive({})
const form       = reactive({ type: 'lost', title: '', category: '', location: '', dateLostFound: '', description: '', imageUrl: null })

onMounted(() => {
  const defaultType = sessionStorage.getItem('defaultPostType')
  if (defaultType) { form.type = defaultType; sessionStorage.removeItem('defaultPostType') }
})

async function submit() {
  const { errors: e, isValid } = validateForm(form, {
    title:         [{ validate: isRequired, message: 'Title is required.' }],
    category:      [{ validate: isRequired, message: 'Please select a category.' }],
    location:      [{ validate: isRequired, message: 'Location is required.' }],
    dateLostFound: [{ validate: isRequired, message: 'Date is required.' }],
    description:   [{ validate: isRequired, message: 'Description is required.' }],
  })
  Object.assign(errors, e)
  if (!isValid) return
  loading.value = true
  try {
    const item = await store.postItem({ ...form, imageUrl: form.imageUrl || `https://placehold.co/400x220/F3F4F6/9CA3AF?text=${encodeURIComponent(form.title.slice(0,16))}` }, auth.user)
    toast.success('Your report has been submitted successfully!')
    router.push(`/items/${item.id}`)
  } catch(err) { toast.error(err.message) }
  finally { loading.value = false }
}
</script>

<style scoped>
.page-wrap { max-width: 780px; margin: 0 auto; padding: var(--space-10) var(--space-6) var(--space-16); }
.page-header { margin-bottom: var(--space-6); }
.page-header__h   { font-size: var(--text-2xl); font-weight: var(--weight-bold); }
.page-header__sub { font-size: var(--text-sm); color: var(--color-text-3); margin-top: var(--space-1); }

/* Type selector */
.type-selector { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
.type-card {
  display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-5);
  background: var(--color-surface); border: 2px solid var(--color-border);
  border-radius: var(--radius-xl); cursor: pointer; text-align: left;
  transition: all var(--transition-fast);
}
.type-card:hover { border-color: var(--color-border-strong); }
.type-card--on { border-color: var(--color-primary); background: var(--color-primary-bg); }
.type-card__icon { width: 42px; height: 42px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.type-card__icon--lost  { background: var(--color-lost-bg);  color: var(--color-lost); }
.type-card__icon--found { background: var(--color-found-bg); color: var(--color-found); }
.type-card--on .type-card__icon--lost  { background: #FEE2E2; }
.type-card--on .type-card__icon--found { background: #D1FAE5; }
.type-card__label { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-text); }
.type-card__desc  { font-size: var(--text-xs); color: var(--color-text-3); margin-top: 2px; }

/* Form card */
.form-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-2xl); box-shadow: var(--shadow-sm); }
.form-body { padding: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); }
.form-row  { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
@media (max-width: 580px) { .form-row { grid-template-columns: 1fr; } .type-selector { grid-template-columns: 1fr; } }
.form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-2); }
.optional { font-weight: var(--weight-normal); color: var(--color-text-4); }
.form-submit { display: flex; justify-content: flex-end; padding-top: var(--space-2); border-top: 1px solid var(--color-border); }
</style>
