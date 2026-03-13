<template>
  <aside class="filters">
    <div class="filters__top">
      <h3 class="filters__title">{{ t('filters.filters') }}</h3>
      <button v-if="active" class="filters__clear" @click="store.resetFilters()">{{ t('filters.clearAll') }}</button>
    </div>

    <div class="filter-section">
      <p class="filter-section__title">{{ t('filters.type') }}</p>
      <div class="filter-pills">
        <button v-for="opt in types" :key="opt.value"
          :class="['filter-pill', { 'filter-pill--on': store.filters.type === opt.value }]"
          @click="tog('type', opt.value)">
          <component :is="opt.icon" :size="12" />{{ opt.label }}
        </button>
      </div>
    </div>

    <div class="filter-section">
      <p class="filter-section__title">{{ t('item.category') }}</p>
      <div class="filter-list">
        <label v-for="c in CATEGORIES" :key="c.value" class="filter-radio">
          <input type="radio" name="cat" :value="c.value"
            :checked="store.filters.category === c.value"
            @change="tog('category', c.value)" />
          <span>{{ c.label }}</span>
        </label>
      </div>
    </div>

    <div class="filter-section">
      <p class="filter-section__title">{{ t('filters.status') }}</p>
      <div class="filter-pills">
        <button v-for="opt in statuses" :key="opt.value"
          :class="['filter-pill', { 'filter-pill--on': store.filters.status === opt.value }]"
          @click="tog('status', opt.value)">
          <component :is="opt.icon" :size="12" />{{ opt.label }}
        </button>
      </div>
    </div>

    <div class="filter-section">
      <p class="filter-section__title">{{ t('filters.dateRange') }}</p>
      <div class="date-range">
        <input type="date" class="date-input" :value="store.filters.dateFrom" :placeholder="t('filters.from')"
          @input="store.setFilter('dateFrom', $event.target.value)" />
        <input type="date" class="date-input" :value="store.filters.dateTo" :placeholder="t('filters.to')"
          @input="store.setFilter('dateTo', $event.target.value)" />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle, PackageCheck, Circle, CheckCircle2 } from 'lucide-vue-next'
import { useItemsStore } from '@/stores/items'
import { CATEGORIES }    from '@/helpers/constants'

const { t } = useI18n()
const store = useItemsStore()
const active = computed(() => Object.values(store.filters).some(v => v))
const types    = computed(() => [
  { value: 'lost',  label: t('item.lost'),  icon: AlertCircle  },
  { value: 'found', label: t('item.found'), icon: PackageCheck },
])
const statuses = computed(() => [
  { value: 'open',     label: t('item.open'),     icon: Circle       },
  { value: 'resolved', label: t('item.resolved'), icon: CheckCircle2 },
])
function tog(key, val) { store.setFilter(key, store.filters[key] === val ? '' : val) }
</script>

<style scoped>
.filters { display: flex; flex-direction: column; gap: var(--space-5); }
.filters__top { display: flex; align-items: center; justify-content: space-between; }
.filters__title { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-text); }
.filters__clear { background: none; border: none; font-size: var(--text-xs); color: var(--color-primary); cursor: pointer; }

.filter-section { display: flex; flex-direction: column; gap: var(--space-2); }
.filter-section__title {
  font-size: 11px; font-weight: var(--weight-semibold);
  text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-4);
}

.filter-pills { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.filter-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 5px var(--space-3); border-radius: var(--radius-full);
  font-size: var(--text-xs); font-weight: var(--weight-medium);
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  color: var(--color-text-3); cursor: pointer; transition: all var(--transition-fast);
}
.filter-pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
.filter-pill--on { background: var(--color-primary-bg); border-color: var(--color-primary-light); color: var(--color-primary); font-weight: var(--weight-semibold); }

.filter-list { display: flex; flex-direction: column; gap: 4px; }
.filter-radio {
  display: flex; align-items: center; gap: var(--space-2);
  font-size: var(--text-sm); color: var(--color-text-2); cursor: pointer;
  padding: 4px 0;
}
.filter-radio input[type=radio] { accent-color: var(--color-primary); width: 14px; height: 14px; }
.filter-radio:hover span { color: var(--color-primary); }

.date-range { display: flex; flex-direction: column; gap: var(--space-2); }
.date-input {
  width: 100%; height: 36px; padding: 0 var(--space-3);
  background: var(--color-surface); border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg); font-size: var(--text-sm); color: var(--color-text);
  outline: none; transition: border-color var(--transition-fast);
}
.date-input:focus { border-color: var(--color-primary); }
</style>
