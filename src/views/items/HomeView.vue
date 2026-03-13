<template>
  <AppLayout>
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <div class="hero__body">
          <div class="hero__tag">
            <MapPin :size="12" /> {{ t('hero.tag') }}
          </div>
          <h1 class="hero__h">{{ t('hero.title') }}<br />{{ t('hero.subtitle') }}</h1>
          <p class="hero__sub">{{ t('hero.body') }}</p>
          <div class="hero__cta">
            <BaseButton variant="primary" size="lg" :icon="PlusCircle" @click="$router.push('/post')">{{ t('hero.report') }}</BaseButton>
            <BaseButton variant="outline"  size="lg" :icon="Search" @click="scrollToGrid">{{ t('hero.browse') }}</BaseButton>
          </div>
          <div class="hero__stats">
            <div class="hero__stat"><span class="hero__stat-num">{{ stats.total }}</span><span class="hero__stat-label">{{ t('hero.total') }}</span></div>
            <div class="hero__stat-div" />
            <div class="hero__stat"><span class="hero__stat-num">{{ stats.lost }}</span><span class="hero__stat-label">{{ t('hero.lost') }}</span></div>
            <div class="hero__stat-div" />
            <div class="hero__stat"><span class="hero__stat-num">{{ stats.found }}</span><span class="hero__stat-label">{{ t('hero.found') }}</span></div>
            <div class="hero__stat-div" />
            <div class="hero__stat"><span class="hero__stat-num">{{ stats.resolved }}</span><span class="hero__stat-label">{{ t('item.resolved') }}</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Browse Section -->
    <section id="browse" class="browse-section">
      <div class="container browse-wrap">
        <!-- Sidebar -->
        <aside class="filters-sidebar">
          <div class="filters-card">
            <ItemFilters />
          </div>
        </aside>

        <!-- Main -->
        <main class="browse-main">
          <div class="browse-toolbar">
            <p class="browse-count">
              <span class="browse-count__num">{{ store.filteredItems.length }}</span>
              result{{ store.filteredItems.length !== 1 ? 's' : '' }}
            </p>
            <div class="browse-type-tabs">
              <button :class="['tab', { 'tab--on': !store.filters.type }]" @click="store.setFilter('type', '')">All</button>
              <button :class="['tab', { 'tab--on': store.filters.type === 'lost' }]" @click="store.setFilter('type', store.filters.type === 'lost' ? '' : 'lost')">
                <AlertCircle :size="13" /> Lost
              </button>
              <button :class="['tab', { 'tab--on': store.filters.type === 'found' }]" @click="store.setFilter('type', store.filters.type === 'found' ? '' : 'found')">
                <PackageCheck :size="13" /> Found
              </button>
            </div>
          </div>

          <!-- Empty state: no items at all -->
          <div v-if="store.filteredItems.length === 0 && !hasFilters" class="empty-state">
            <div class="empty-state__icon"><Inbox :size="32" /></div>
            <h3>No items posted yet</h3>
            <p>Be the first to report a lost or found item in your community.</p>
            <BaseButton variant="primary" size="md" :icon="PlusCircle" @click="$router.push('/post')">Report an Item</BaseButton>
          </div>

          <!-- Empty state: filters returned nothing -->
          <div v-else-if="store.filteredItems.length === 0" class="empty-state">
            <div class="empty-state__icon"><SearchX :size="32" /></div>
            <h3>No results found</h3>
            <p>Try adjusting your search terms or clearing the filters.</p>
            <BaseButton variant="outline" size="md" @click="store.resetFilters()">Clear Filters</BaseButton>
          </div>

          <!-- Item grid -->
          <div v-else class="item-grid">
            <ItemCard v-for="item in store.filteredItems" :key="item.id" :item="item" />
          </div>
        </main>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { MapPin, PlusCircle, Search, AlertCircle, PackageCheck, Inbox, SearchX } from 'lucide-vue-next'
import AppLayout   from '@/components/layout/AppLayout.vue'
import ItemCard    from '@/components/items/ItemCard.vue'
import ItemFilters from '@/components/items/ItemFilters.vue'
import BaseButton  from '@/components/ui/BaseButton.vue'
import { useItemsStore } from '@/stores/items'

const { t } = useI18n()
const router  = useRouter()
const store   = useItemsStore()
const stats   = computed(() => store.stats)
const hasFilters = computed(() => Object.values(store.filters).some(v => v) || store.searchQuery)
function scrollToGrid() { document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }) }
</script>

<style scoped>
/* ── Hero ── */
.hero {
  background:    var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding:       var(--space-16) 0 var(--space-12);
}
.hero__body { max-width: 680px; display: flex; flex-direction: column; gap: var(--space-5); }
.hero__tag {
  display:inline-flex; align-items:center; gap:var(--space-2);
  background: var(--color-primary-bg); color: var(--color-primary);
  border: 1px solid #BFDBFE; border-radius: var(--radius-full);
  font-size: var(--text-xs); font-weight: var(--weight-semibold);
  padding: 4px 12px; width: fit-content;
}
.hero__h {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: var(--weight-bold); line-height: var(--leading-tight);
  color: var(--color-text); letter-spacing: -0.02em;
}
.hero__sub { font-size: var(--text-base); color: var(--color-text-3); max-width: 520px; line-height: var(--leading-relaxed); }
.hero__cta { display: flex; gap: var(--space-3); flex-wrap: wrap; }

.hero__stats {
  display:    flex; align-items: center; gap: var(--space-6);
  padding-top: var(--space-4); border-top: 1px solid var(--color-border);
  margin-top: var(--space-2);
}
.hero__stat { display: flex; flex-direction: column; gap: 2px; }
.hero__stat-num { font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--color-text); line-height: 1; }
.hero__stat-label { font-size: var(--text-xs); color: var(--color-text-4); font-weight: var(--weight-medium); }
.hero__stat-div { width: 1px; height: 36px; background: var(--color-border); }

/* ── Browse ── */
.browse-section { background: var(--color-bg); padding: var(--space-8) 0 var(--space-16); }
.browse-wrap {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--space-8);
  align-items: start;
}
.filters-card {
  background:    var(--color-surface);
  border:        1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow:    var(--shadow-xs);
  padding:       var(--space-5);
  position:      sticky;
  top:           calc(var(--nav-height) + var(--space-4));
}

/* Toolbar */
.browse-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); gap: var(--space-3); flex-wrap: wrap; }
.browse-count { font-size: var(--text-sm); color: var(--color-text-3); }
.browse-count__num { font-weight: var(--weight-semibold); color: var(--color-text); }
.browse-type-tabs { display: flex; gap: var(--space-1); background: var(--color-bg-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 3px; }
.tab {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: var(--radius-md);
  font-size: var(--text-xs); font-weight: var(--weight-medium);
  background: none; border: none; cursor: pointer; color: var(--color-text-3);
  transition: all var(--transition-fast);
}
.tab--on { background: #fff; color: var(--color-text); box-shadow: var(--shadow-xs); }

/* Item grid */
.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-5); }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-16) 0; text-align: center; }
.empty-state__icon { width: 64px; height: 64px; border-radius: var(--radius-xl); background: var(--color-bg-2); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-text-4); }
.empty-state h3 { font-size: var(--text-xl); font-weight: var(--weight-semibold); }
.empty-state p  { font-size: var(--text-sm); color: var(--color-text-3); max-width: 320px; }

@media (max-width: 860px) { .browse-wrap { grid-template-columns: 1fr; } .filters-sidebar { display: none; } }
</style>
