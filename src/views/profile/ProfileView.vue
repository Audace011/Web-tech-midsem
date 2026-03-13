<template>
  <AppLayout>
    <div class="container profile-wrap">
      <div class="profile-hero">
        <div class="profile-avatar">{{ auth.user?.name?.[0] }}</div>
        <div>
          <h1 class="profile-name">{{ auth.user?.name }}</h1>
          <p class="profile-email">{{ auth.user?.email }}</p>
          <BaseBadge variant="primary">{{ auth.user?.role }}</BaseBadge>
        </div>
      </div>

      <!-- Edit profile -->
      <div class="profile-section">
        <h2>Edit Profile</h2>
        <form class="profile-form" @submit.prevent="saveProfile">
          <BaseInput v-model="editForm.name" label="Name" :prefix-icon="User" :error="editErrors.name" />
          <BaseButton type="submit" variant="primary" size="md" :loading="saving">Save Changes</BaseButton>
        </form>
      </div>

      <!-- My items -->
      <div class="profile-section">
        <h2>My Posts ({{ myItems.length }})</h2>
        <div v-if="myItems.length === 0" class="profile-empty">You haven't posted any items yet.</div>
        <div v-else class="item-grid">
          <ItemCard v-for="item in myItems" :key="item.id" :item="item" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { User } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseInput  from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge  from '@/components/ui/BaseBadge.vue'
import ItemCard   from '@/components/items/ItemCard.vue'
import { useAuthStore }  from '@/stores/auth'
import { useItemsStore } from '@/stores/items'
import { isRequired }    from '@/helpers/validators'

const auth   = useAuthStore()
const items  = useItemsStore()
const toast  = useToast()
const saving = ref(false)
const editForm   = reactive({ name: auth.user?.name ?? '' })
const editErrors = reactive({})
const myItems    = computed(() => items.getUserItems(auth.user.id))

async function saveProfile() {
  editErrors.name = isRequired(editForm.name) ? '' : 'Name is required.'
  if (editErrors.name) return
  saving.value = true
  await auth.updateProfile({ name: editForm.name })
  toast.success('Profile updated!')
  saving.value = false
}
</script>

<style scoped>
.profile-wrap { max-width:800px;margin:0 auto;padding:var(--space-10) var(--space-4) var(--space-16); }
.profile-hero { display:flex;align-items:center;gap:var(--space-6);margin-bottom:var(--space-10); }
.profile-avatar { width:80px;height:80px;border-radius:var(--radius-full);background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;font-size:var(--text-3xl);font-weight:var(--weight-bold);color:#fff;flex-shrink:0; }
.profile-name  { font-size:var(--text-2xl);font-weight:var(--weight-extrabold); }
.profile-email { font-size:var(--text-sm);color:var(--color-text-2); }
.profile-section { margin-bottom:var(--space-10); }
.profile-section h2 { font-size:var(--text-xl);font-weight:var(--weight-bold);margin-bottom:var(--space-4); }
.profile-form { display:flex;flex-direction:column;gap:var(--space-4);max-width:400px; }
.profile-empty { font-size:var(--text-sm);color:var(--color-text-3); }
.item-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--space-5); }
</style>
