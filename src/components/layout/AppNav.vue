<template>
  <nav class="nav" :class="{ 'nav--shadow': scrolled }">
    <div class="container nav__inner">
      <!-- Logo -->
      <RouterLink to="/" class="nav__logo">
        <div class="nav__logo-mark">
          <MapPin :size="14" />
        </div>
        <span>AUCA Lost<span class="nav__logo-amp">&amp;</span>Found</span>
      </RouterLink>

      <!-- Primary links -->
      <div class="nav__links">
        <RouterLink class="nav__link" to="/" :class="{ 'nav__link--active': $route.path === '/' }">{{ t('hero.browse') }}</RouterLink>
        <RouterLink class="nav__link" to="/post">{{ t('nav.post') }}</RouterLink>
      </div>

      <!-- Search -->
      <div class="nav__search-wrap">
        <Search class="nav__search-icon" :size="14" />
        <input v-model="query" class="nav__search" :placeholder="t('nav.search')" @keyup.enter="runSearch" />
      </div>

      <!-- Right side actions -->
      <div class="nav__actions">
        <template v-if="auth.isLoggedIn">
          <!-- Notifications -->
          <div class="nav__pill-wrap" ref="notifRef">
            <button class="nav__icon-btn" @click="notifOpen = !notifOpen" :aria-label="'Notifications'">
              <Bell :size="17" />
              <span v-if="unread > 0" class="nav__dot">{{ unread }}</span>
            </button>
            <Transition name="slide-up">
              <div v-if="notifOpen" class="nav__drop nav__drop--notif">
                <div class="nav__drop-header">
                  <span>Notifications</span>
                  <button class="nav__drop-link" @click="notifStore.markAllRead()">Mark all read</button>
                </div>
                <div v-if="notifStore.notifications.length === 0" class="nav__drop-empty">No notifications</div>
                <div v-for="n in notifStore.notifications.slice(0,6)" :key="n.id"
                     class="notif-row" :class="{ 'notif-row--unread': !n.read }"
                     @click="notifStore.markRead(n.id)">
                  <div class="notif-row__dot" />
                  <div>
                    <p class="notif-row__title">{{ n.title }}</p>
                    <p class="notif-row__msg">{{ n.message }}</p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Inbox -->
          <RouterLink to="/inbox" class="nav__icon-btn" :aria-label="t('nav.inbox')">
            <MessageSquare :size="17" />
            <span v-if="msgStore.unreadCount(auth.user.id) > 0" class="nav__dot" style="background:#6c63ff">{{ msgStore.unreadCount(auth.user.id) }}</span>
          </RouterLink>

          <!-- User dropdown -->
          <div class="nav__pill-wrap" ref="userRef">
            <button class="nav__avatar" @click="userOpen = !userOpen">
              {{ auth.user?.name?.[0]?.toUpperCase() ?? '?' }}
            </button>
            <Transition name="slide-up">
              <div v-if="userOpen" class="nav__drop">
                <div class="nav__drop-user">
                  <strong>{{ auth.user?.name }}</strong>
                  <span>{{ auth.user?.email }}</span>
                </div>
                <RouterLink class="nav__drop-item" to="/dashboard" @click="userOpen = false">
                  <LayoutDashboard :size="13" /> {{ t('nav.dashboard') }}
                </RouterLink>
                <RouterLink class="nav__drop-item" to="/resolved" @click="userOpen = false">
                  <CheckCircle2 :size="13" /> Resolved Items
                </RouterLink>
                <RouterLink class="nav__drop-item" to="/profile" @click="userOpen = false">
                  <User :size="13" /> {{ t('nav.profile') }}
                </RouterLink>
                <RouterLink v-if="auth.isAdmin" class="nav__drop-item" to="/admin" @click="userOpen = false">
                  <ShieldCheck :size="13" /> {{ t('nav.admin') }}
                </RouterLink>
                <div class="nav__drop-sep" />
                <button class="nav__drop-item nav__drop-item--red" @click="logout">
                  <LogOut :size="13" /> {{ t('nav.logout') }}
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <template v-else>
          <RouterLink to="/login" class="nav__link">{{ t('nav.login') }}</RouterLink>
          <BaseButton variant="primary" size="sm" @click="$router.push('/register')">{{ t('nav.register') }}</BaseButton>
        </template>

        <!-- Preferences (always visible) -->
        <PreferencesPanel />
      </div>

      <!-- Hamburger -->
      <button class="nav__hamburger" @click="mobileOpen = !mobileOpen">
        <component :is="mobileOpen ? X : Menu" :size="20" />
      </button>
    </div>

    <!-- Mobile -->
    <Transition name="slide-up">
      <div v-if="mobileOpen" class="nav__mobile">
        <RouterLink class="nav__mob-item" to="/"         @click="mobileOpen=false">{{ t('nav.home') }}</RouterLink>
        <RouterLink class="nav__mob-item" to="/post"     @click="mobileOpen=false">{{ t('nav.post') }}</RouterLink>
        <template v-if="auth.isLoggedIn">
          <RouterLink class="nav__mob-item" to="/dashboard" @click="mobileOpen=false">{{ t('nav.dashboard') }}</RouterLink>
          <RouterLink class="nav__mob-item" to="/resolved"  @click="mobileOpen=false">Resolved Items</RouterLink>
          <RouterLink class="nav__mob-item" to="/inbox"     @click="mobileOpen=false">{{ t('nav.inbox') }}</RouterLink>
          <RouterLink class="nav__mob-item" to="/profile"   @click="mobileOpen=false">{{ t('nav.profile') }}</RouterLink>
          <RouterLink v-if="auth.isAdmin" class="nav__mob-item" to="/admin" @click="mobileOpen=false">{{ t('nav.admin') }}</RouterLink>
          <div class="nav__mob-sep" />
          <button class="nav__mob-item nav__mob-item--red" @click="logout">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <div class="nav__mob-sep" />
          <RouterLink class="nav__mob-item" to="/login"    @click="mobileOpen=false">{{ t('nav.login') }}</RouterLink>
          <RouterLink class="nav__mob-item" to="/register" @click="mobileOpen=false">{{ t('nav.register') }}</RouterLink>
        </template>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { MapPin, Search, Bell, MessageSquare, User, LayoutDashboard, ShieldCheck, LogOut, Menu, X, CheckCircle2 } from 'lucide-vue-next'
import { useAuthStore }          from '@/stores/auth'
import { useItemsStore }         from '@/stores/items'
import { useNotificationsStore } from '@/stores/notifications'
import { usePreferencesStore }   from '@/stores/preferences'
import { useMessagesStore }      from '@/stores/messages'
import BaseButton        from '@/components/ui/BaseButton.vue'
import PreferencesPanel  from '@/components/ui/PreferencesPanel.vue'

const { t } = useI18n()

const router      = useRouter()
const auth        = useAuthStore()
const itemsStore  = useItemsStore()
const notifStore  = useNotificationsStore()
const msgStore    = useMessagesStore()
usePreferencesStore()  // initialize on mount so font/theme are applied immediately

const scrolled   = ref(false)
const mobileOpen = ref(false)
const notifOpen  = ref(false)
const userOpen   = ref(false)
const query      = ref('')
const notifRef   = ref(null)
const userRef    = ref(null)

const unread = computed(() => notifStore.notifications.filter(n => !n.read).length)

function runSearch() {
  itemsStore.setSearch(query.value)
  router.push('/')
  mobileOpen.value = false
}
function logout() {
  auth.logout(); userOpen.value = false; mobileOpen.value = false; router.push('/')
}
function outsideClick(e) {
  if (notifRef.value && !notifRef.value.contains(e.target)) notifOpen.value = false
  if (userRef.value  && !userRef.value.contains(e.target))  userOpen.value  = false
}
onMounted(() => {
  window.addEventListener('scroll', () => { scrolled.value = window.scrollY > 4 })
  document.addEventListener('mousedown', outsideClick)
})
onUnmounted(() => document.removeEventListener('mousedown', outsideClick))
</script>

<style scoped>
/* ── Shell ── */
.nav {
  position:        fixed; top: 0; left: 0; right: 0;
  height:          var(--nav-height);
  background:      #fff;
  border-bottom:   1px solid var(--color-border);
  z-index:         var(--z-sticky);
  transition:      box-shadow var(--transition-fast);
}
.nav--shadow { box-shadow: var(--shadow-sm); }

.nav__inner {
  height:      100%;
  display:     flex;
  align-items: center;
  gap:         var(--space-4);
}

/* ── Logo ── */
.nav__logo {
  display:     flex; align-items: center; gap: var(--space-2);
  font-size:   var(--text-lg); font-weight: var(--weight-bold);
  color:       var(--color-text); text-decoration: none; flex-shrink: 0;
}
.nav__logo-mark {
  width: 28px; height: 28px; background: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.nav__logo-amp { color: var(--color-primary); }

/* ── Primary links ── */
.nav__links { display: flex; gap: var(--space-1); }
.nav__link {
  padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: var(--weight-medium);
  color: var(--color-text-3); text-decoration: none; white-space: nowrap;
  transition: all var(--transition-fast);
}
.nav__link:hover, .nav__link--active { color: var(--color-text); background: var(--color-bg-2); text-decoration: none; }

/* ── Search ── */
.nav__search-wrap { flex: 1; max-width: 340px; position: relative; }
.nav__search-icon {
  position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%);
  color: var(--color-text-4); pointer-events: none;
}
.nav__search {
  width: 100%; height: 34px;
  padding: 0 var(--space-3) 0 calc(var(--space-3) + 14px + var(--space-2));
  background: var(--color-bg-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-full); font-size: var(--text-sm);
  color: var(--color-text); outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.nav__search:focus { border-color: var(--color-primary); background: #fff; box-shadow: 0 0 0 3px rgba(30,58,138,0.08); }
.nav__search::placeholder { color: var(--color-text-4); }

/* ── Actions ── */
.nav__actions { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }

/* ── Icon buttons ── */
.nav__icon-btn {
  position: relative; background: none; border: none; cursor: pointer;
  padding: var(--space-2); border-radius: var(--radius-md);
  color: var(--color-text-3); display: flex; align-items: center;
  text-decoration: none; transition: all var(--transition-fast);
}
.nav__icon-btn:hover { background: var(--color-bg-2); color: var(--color-text); }
.nav__dot {
  position: absolute; top: 3px; right: 3px;
  width: 14px; height: 14px; background: var(--color-danger);
  border-radius: var(--radius-full); border: 2px solid #fff;
  font-size: 9px; font-weight: 700; color: #fff;
  display: flex; align-items: center; justify-content: center;
}

/* ── Avatar ── */
.nav__pill-wrap { position: relative; }
.nav__avatar {
  width: 32px; height: 32px;
  background: var(--color-primary); border-radius: var(--radius-full);
  color: #fff; font-weight: var(--weight-bold); font-size: var(--text-sm);
  cursor: pointer; border: none; display: flex; align-items: center; justify-content: center;
}

/* ── Dropdown ── */
.nav__drop {
  position: absolute; top: calc(100% + 6px); right: 0;
  min-width: 200px;
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); z-index: var(--z-dropdown);
  overflow: hidden;
}
.nav__drop--notif { width: 288px; max-height: 380px; overflow-y: auto; }
.nav__drop-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm); font-weight: var(--weight-semibold);
  border-bottom: 1px solid var(--color-border);
}
.nav__drop-link { background: none; border: none; cursor: pointer; color: var(--color-primary); font-size: var(--text-xs); }
.nav__drop-empty { padding: var(--space-6) var(--space-4); text-align: center; font-size: var(--text-sm); color: var(--color-text-4); }
.nav__drop-user {
  padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border);
  display: flex; flex-direction: column; gap: 2px;
}
.nav__drop-user strong { font-size: var(--text-sm); }
.nav__drop-user span   { font-size: var(--text-xs); color: var(--color-text-4); word-break: break-all; }
.nav__drop-item {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4); font-size: var(--text-sm);
  color: var(--color-text-2); background: none; border: none; cursor: pointer;
  width: 100%; text-align: left; text-decoration: none;
  transition: all var(--transition-fast);
}
.nav__drop-item:hover { background: var(--color-bg-2); color: var(--color-text); }
.nav__drop-item--red { color: var(--color-danger); }
.nav__drop-item--red:hover { background: var(--color-danger-bg); }
.nav__drop-sep { height: 1px; background: var(--color-border); margin: var(--space-1) 0; }

/* Notifications */
.notif-row { display: flex; gap: var(--space-3); padding: var(--space-3) var(--space-4); cursor: pointer; }
.notif-row:hover { background: var(--color-bg-2); }
.notif-row--unread { background: var(--color-primary-bg); }
.notif-row__dot { width: 8px; height: 8px; border-radius: var(--radius-full); background: var(--color-primary); flex-shrink: 0; margin-top: 5px; }
.notif-row__title { font-size: var(--text-sm); font-weight: var(--weight-medium); }
.notif-row__msg   { font-size: var(--text-xs); color: var(--color-text-3); }

/* ── Hamburger ── */
.nav__hamburger { display: none; background: none; border: none; cursor: pointer; padding: var(--space-2); color: var(--color-text-2); border-radius: var(--radius-md); }

/* ── Mobile menu ── */
.nav__mobile {
  background: #fff; border-top: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-4) var(--space-4);
  display: flex; flex-direction: column;
}
.nav__mob-item {
  padding: var(--space-3) var(--space-2); font-size: var(--text-sm); font-weight: var(--weight-medium);
  color: var(--color-text-2); text-decoration: none; border-radius: var(--radius-md);
  background: none; border: none; cursor: pointer; text-align: left;
  transition: all var(--transition-fast);
}
.nav__mob-item:hover { background: var(--color-bg-2); color: var(--color-text); }
.nav__mob-item--red { color: var(--color-danger); }
.nav__mob-sep { height: 1px; background: var(--color-border); margin: var(--space-2) 0; }

@media (max-width: 780px) {
  .nav__links, .nav__search-wrap { display: none; }
  .nav__hamburger { display: flex; }
  .nav__inner { justify-content: space-between; }
}
</style>
