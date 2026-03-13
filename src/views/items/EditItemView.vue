<template>
  <AppLayout>
    <div class="page-wrap container">
      <button class="back-btn" @click="$router.back()"><ChevronLeft :size="16" /> Back</button>

      <div class="page-header">
        <h1 class="page-header__h">Edit Report</h1>
        <p class="page-header__sub">Update the details of your lost or found report.</p>
      </div>

      <!-- Not found -->
      <div v-if="!itemExists" class="empty-state" style="padding:3rem 0">
        <div class="empty-state__icon"><PackageSearch :size="26" /></div>
        <h3>Item not found</h3>
        <p>This item may have been removed.</p>
        <BaseButton variant="outline" size="md" @click="$router.push('/')">Browse Items</BaseButton>
      </div>

      <template v-else>
        <!-- Type selector -->
        <div class="type-selector">
          <button :class="['type-card', { 'type-card--on': form.type === 'lost' }]" type="button" @click="form.type = 'lost'">
            <div class="type-card__icon type-card__icon--lost"><AlertCircle :size="20" /></div>
            <div>
              <p class="type-card__label">Lost Item</p>
              <p class="type-card__desc">I've lost something and need help finding it</p>
            </div>
          </button>
          <button :class="['type-card', { 'type-card--on': form.type === 'found' }]" type="button" @click="form.type = 'found'">
            <div class="type-card__icon type-card__icon--found"><PackageCheck :size="20" /></div>
            <div>
              <p class="type-card__label">Found Item</p>
              <p class="type-card__desc">I've found something and want to return it</p>
            </div>
          </button>
        </div>

        <div class="form-card">
          <form class="form-body" @submit.prevent="submit" novalidate>
            <div class="form-row">
              <BaseInput   v-model="form.title"         label="Item Title"   placeholder="e.g. Black leather wallet"  :error="errors.title"         required />
              <BaseSelect  v-model="form.category"      label="Category"     :options="CATEGORIES"                    :error="errors.category"      required />
            </div>
            <div class="form-row">
              <BaseInput   v-model="form.location"      label="Location"     placeholder="e.g. Central Library"       :prefix-icon="MapPin" :error="errors.location"  required />
              <BaseInput   v-model="form.dateLostFound" label="Date"         type="date"                              :error="errors.dateLostFound" required />
            </div>
            <BaseInput     v-model="form.description"   label="Description"  type="textarea" :rows="4"
              placeholder="Describe the item in detail…"   :error="errors.description" required />
            <div class="form-field">
              <label class="form-label">Photo <span class="optional">(optional)</span></label>
              <ImageUpload v-model="form.imageUrl" />
            </div>
            <div class="form-submit">
              <BaseButton type="submit" variant="primary" size="lg" :loading="loading">Save Changes</BaseButton>
            </div>
          </form>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { ChevronLeft, MapPin, AlertCircle, PackageCheck, PackageSearch } from 'lucide-vue-next'
import AppLayout   from '@/components/layout/AppLayout.vue'
import BaseInput   from '@/components/ui/BaseInput.vue'
import BaseSelect  from '@/components/ui/BaseSelect.vue'
import BaseButton  from '@/components/ui/BaseButton.vue'
import ImageUpload from '@/components/items/ImageUpload.vue'
import { useItemsStore } from '@/stores/items'
import { useAuthStore }  from '@/stores/auth'
import { CATEGORIES }    from '@/helpers/constants'
import { validateForm, isRequired } from '@/helpers/validators'

const route   = useRoute(); const router = useRouter(); const toast = useToast()
const store   = useItemsStore()
const auth    = useAuthStore()
const loading = ref(false)
const errors  = reactive({})
const form    = reactive({ type:'', title:'', category:'', location:'', dateLostFound:'', description:'', imageUrl:'' })

const itemExists = ref(false)

onMounted(() => {
  const item = store.getItemById(route.params.id)
  if (!item) return
  
  if (item.status === 'resolved' && !auth.isAdmin) {
    toast.error('Resolved items cannot be edited.')
    router.push(`/items/${item.id}`)
    return
  }
  
  itemExists.value = true
  Object.assign(form, item)
})

async function submit() {
  const { errors: e, isValid } = validateForm(form, {
    title:         [{ validate: isRequired, message: 'Title is required.' }],
    category:      [{ validate: isRequired, message: 'Category is required.' }],
    location:      [{ validate: isRequired, message: 'Location is required.' }],
    dateLostFound: [{ validate: isRequired, message: 'Date is required.' }],
    description:   [{ validate: isRequired, message: 'Description is required.' }],
  })
  Object.assign(errors, e)
  if (!isValid) return
  loading.value = true
  try {
    await store.editItem(route.params.id, form)
    toast.success('Report updated successfully!')
    router.push(`/items/${route.params.id}`)
  } catch(err) { toast.error(err.message) }
  finally { loading.value = false }
}
</script>

<style scoped>
.page-wrap { max-width: 780px; margin: 0 auto; padding: var(--space-8) var(--space-6) var(--space-16); }
.back-btn  { display:flex;align-items:center;gap:var(--space-1);font-size:var(--text-sm);color:var(--color-text-3);background:none;border:none;cursor:pointer;margin-bottom:var(--space-5);transition:color var(--transition-fast); }
.back-btn:hover { color:var(--color-primary); }
.page-header { margin-bottom:var(--space-6); }
.page-header__h   { font-size:var(--text-2xl);font-weight:var(--weight-bold); }
.page-header__sub { font-size:var(--text-sm);color:var(--color-text-3);margin-top:var(--space-1); }

.type-selector { display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-6); }
.type-card { display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4) var(--space-5);background:var(--color-surface);border:2px solid var(--color-border);border-radius:var(--radius-xl);cursor:pointer;text-align:left;transition:all var(--transition-fast); }
.type-card:hover  { border-color:var(--color-border-strong); }
.type-card--on    { border-color:var(--color-primary);background:var(--color-primary-bg); }
.type-card__icon  { width:42px;height:42px;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.type-card__icon--lost  { background:var(--color-lost-bg);color:var(--color-lost); }
.type-card__icon--found { background:var(--color-found-bg);color:var(--color-found); }
.type-card__label { font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--color-text); }
.type-card__desc  { font-size:var(--text-xs);color:var(--color-text-3);margin-top:2px; }

.form-card { background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-2xl);box-shadow:var(--shadow-sm); }
.form-body { padding:var(--space-8);display:flex;flex-direction:column;gap:var(--space-5); }
.form-row  { display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4); }
.form-label  { font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--color-text-2); }
.optional    { font-weight:var(--weight-normal);color:var(--color-text-4); }
.form-submit { display:flex;justify-content:flex-end;padding-top:var(--space-2);border-top:1px solid var(--color-border); }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:var(--space-4);text-align:center; }
.empty-state__icon { width:52px;height:52px;border-radius:var(--radius-xl);background:var(--color-bg-2);border:1px solid var(--color-border);display:flex;align-items:center;justify-content:center;color:var(--color-text-4); }

@media (max-width:580px) { .form-row { grid-template-columns:1fr; } .type-selector { grid-template-columns:1fr; } }
</style>
