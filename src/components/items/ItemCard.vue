<template>
  <RouterLink :to="`/items/${item.id}`" class="item-card">
    <div class="item-card__img-wrap">
      <img :src="item.imageUrl || fallback" :alt="item.title" class="item-card__img" loading="lazy" @error="$event.target.src = fallback" />
      <div class="item-card__badges">
        <span :class="['badge-pill', `badge-pill--${item.type}`]">
          <AlertCircle v-if="item.type==='lost'" :size="10" />
          <PackageCheck v-else :size="10" />
          {{ item.type === 'lost' ? t('item.lost') : t('item.found') }}
        </span>
        <span v-if="item.status === 'resolved'" class="badge-pill badge-pill--resolved">
          <CheckCircle2 :size="10" /> {{ t('item.resolved') }}
        </span>
      </div>
    </div>
    <div class="item-card__body">
      <p class="item-card__cat">{{ categoryLabel }}</p>
      <h3 class="item-card__title">{{ item.title }}</h3>
      <p class="item-card__desc">{{ item.description }}</p>
      <div class="item-card__meta">
        <span class="item-card__meta-pill"><MapPin :size="11" />{{ item.location }}</span>
        <span class="item-card__meta-pill"><Clock :size="11" />{{ formatRelative(item.createdAt) }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MapPin, Clock, AlertCircle, PackageCheck, CheckCircle2 } from 'lucide-vue-next'
import { formatRelative } from '@/helpers/formatDate'
import { CATEGORIES }     from '@/helpers/constants'

const { t } = useI18n()

const props = defineProps({ item: { type: Object, required: true } })
const fallback = 'https://placehold.co/400x220/F3F4F6/9CA3AF?text=No+Image'
const categoryLabel = computed(() =>
  CATEGORIES.find(c => c.value === props.item.category)?.label ?? props.item.category
)
</script>

<style scoped>
.item-card {
  display:         flex;
  flex-direction:  column;
  background:      #fff;
  border:          1px solid var(--color-border);
  border-radius:   var(--radius-xl);
  overflow:        hidden;
  text-decoration: none;
  color:           inherit;
  box-shadow:      var(--shadow-sm);
  transition:      box-shadow var(--transition-base), transform var(--transition-base), border-color var(--transition-base);
}
.item-card:hover {
  box-shadow:    var(--shadow-md);
  transform:     translateY(-2px);
  border-color:  var(--color-border-strong);
  text-decoration: none;
}

.item-card__img-wrap {
  position: relative; height: 170px;
  overflow: hidden; flex-shrink: 0;
  background: var(--color-bg-2);
}
.item-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 300ms ease; }
.item-card:hover .item-card__img { transform: scale(1.03); }

.item-card__badges {
  position: absolute; top: var(--space-2); left: var(--space-2);
  display: flex; gap: var(--space-1);
}
.badge-pill {
  display:     inline-flex; align-items: center; gap: 4px;
  padding:     3px 8px; border-radius: var(--radius-full);
  font-size:   10px; font-weight: var(--weight-semibold);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.badge-pill--lost     { background: var(--color-lost);     color: #fff; }
.badge-pill--found    { background: var(--color-found);    color: #fff; }
.badge-pill--resolved { background: rgba(55,65,81,0.75);  color: #fff; }

.item-card__body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); flex: 1; }

.item-card__cat {
  font-size: var(--text-xs); font-weight: var(--weight-semibold);
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-primary);
}
.item-card__title {
  font-size:   var(--text-base); font-weight: var(--weight-semibold); color: var(--color-text);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: var(--leading-snug);
}
.item-card__desc {
  font-size:   var(--text-sm); color: var(--color-text-3); line-height: var(--leading-relaxed);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  flex: 1;
}
.item-card__meta {
  display: flex; flex-wrap: wrap; gap: var(--space-3);
  padding-top: var(--space-3); border-top: 1px solid var(--color-border);
  margin-top: var(--space-1);
}
.item-card__meta-pill { display: flex; align-items: center; gap: 4px; font-size: var(--text-xs); color: var(--color-text-4); }
</style>
