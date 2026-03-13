<template>
  <span :class="['badge', `badge--${variant}`]"><slot /></span>
</template>

<script setup>
defineProps({ variant: { type: String, default: 'default' } })
</script>

<style scoped>
.badge {
  display:        inline-flex;
  align-items:    center;
  gap:            4px;
  padding:        2px 10px;
  border-radius:  var(--radius-full);
  font-size:      var(--text-xs);
  font-weight:    var(--weight-semibold);
  letter-spacing: 0.02em;
  white-space:    nowrap;
  border:         1px solid transparent;
}

.badge--default  { background: var(--color-bg-2);    color: var(--color-text-3); border-color: var(--color-border); }
.badge--primary  { background: var(--color-primary-bg); color: var(--color-primary); border-color: #BFDBFE; }

/* Semantic */
.badge--success  { background: var(--color-success-bg);  color: #059669; border-color: #A7F3D0; }
.badge--warning  { background: var(--color-warning-bg);  color: #B45309; border-color: #FDE68A; }
.badge--danger   { background: var(--color-danger-bg);   color: var(--color-danger); border-color: #FECACA; }

/* Item-specific */
.badge--lost     { background: var(--color-lost-bg);  color: var(--color-lost);  border-color: #FECACA; }
.badge--found    { background: var(--color-found-bg); color: var(--color-found); border-color: #A7F3D0; }
.badge--open     { background: #FFFBEB; color: #B45309; border-color: #FDE68A; }
.badge--resolved { background: var(--color-success-bg); color: #059669; border-color: #A7F3D0; }
.badge--admin    { background: #EDE9FE; color: #7C3AED; border-color: #DDD6FE; }
.badge--user     { background: var(--color-bg-2); color: var(--color-text-3); border-color: var(--color-border); }
</style>
