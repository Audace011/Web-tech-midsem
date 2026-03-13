<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <div class="footer__logo">
          <MapPin :size="13" />
          <span>AUCA Lost<b>&amp;</b>Found</span>
        </div>
        <p class="footer__tagline">A community platform for reuniting lost items with their owners.</p>
      </div>
      <div class="footer__links">
        <div class="footer__col">
          <p class="footer__col-title">Platform</p>
          <RouterLink class="footer__link" to="/">Browse Items</RouterLink>
          <RouterLink class="footer__link" to="/post">Report Item</RouterLink>
        </div>
        <div class="footer__col">
          <p class="footer__col-title">Account</p>
          <RouterLink class="footer__link" to="/login">Sign In</RouterLink>
          <RouterLink class="footer__link" to="/register">Create Account</RouterLink>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__copy">&copy; {{ year }} AUCA Lost &amp; Found Platform. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { MapPin } from 'lucide-vue-next'
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background:    var(--color-surface);
  border-top:    1px solid var(--color-border);
  margin-top:    auto;
}
.footer__inner {
  display:         flex;
  justify-content: space-between;
  align-items:     flex-start;
  gap:             var(--space-8);
  padding:         var(--space-10) var(--space-6) var(--space-8);
}
.footer__logo {
  display:     flex; align-items: center; gap: var(--space-2);
  font-size:   var(--text-base); font-weight: var(--weight-bold);
  color:       var(--color-text); margin-bottom: var(--space-3);
}
.footer__logo b { color: var(--color-primary); }
.footer__tagline { font-size: var(--text-sm); color: var(--color-text-4); max-width: 260px; line-height: var(--leading-relaxed); }

.footer__links { display: flex; gap: var(--space-12); }
.footer__col { display: flex; flex-direction: column; gap: var(--space-2); }
.footer__col-title { font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-3); margin-bottom: var(--space-1); }
.footer__link { font-size: var(--text-sm); color: var(--color-text-3); text-decoration: none; }
.footer__link:hover { color: var(--color-primary); text-decoration: none; }

.footer__bottom {
  border-top: 1px solid var(--color-border);
  padding:    var(--space-4) var(--space-6);
}
.footer__copy { font-size: var(--text-xs); color: var(--color-text-4); text-align: center; }

@media (max-width: 600px) {
  .footer__inner { flex-direction: column; }
  .footer__links { gap: var(--space-8); }
}
</style>
