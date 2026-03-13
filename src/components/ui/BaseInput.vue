<template>
  <div :class="['field', { 'field--error': error }]">
    <label v-if="label" :for="id" class="field__label">
      {{ label }} <span v-if="required" class="field__required">*</span>
    </label>

    <div class="field__control">
      <!-- Prefix icon -->
      <component v-if="prefixIcon" :is="prefixIcon" :size="15" class="field__icon field__icon--prefix" />

      <!-- Textarea -->
      <textarea v-if="type === 'textarea'" :id="id" v-bind="$attrs"
        class="field__input field__textarea"
        :class="{ 'field__input--padl': prefixIcon }"
        :rows="rows" :value="modelValue" :required="required"
        @input="$emit('update:modelValue', $event.target.value)" />

      <!-- Regular input (including password with toggle) -->
      <input v-else :id="id" v-bind="$attrs"
        class="field__input"
        :class="{ 'field__input--padl': prefixIcon, 'field__input--padr': isPassword }"
        :type="isPassword ? (showPassword ? 'text' : 'password') : type"
        :value="modelValue" :required="required"
        @input="$emit('update:modelValue', $event.target.value)" />

      <!-- Password show/hide toggle -->
      <button v-if="isPassword" type="button"
        class="field__icon field__icon--suffix field__eye"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="showPassword = !showPassword">
        <Eye    v-if="!showPassword" :size="15" />
        <EyeOff v-else               :size="15" />
      </button>
    </div>

    <!-- Password strength bar (shown only when type=password AND value exists) -->
    <div v-if="isPassword && showStrength && modelValue" class="strength-wrap">
      <div class="strength-bar">
        <div v-for="i in 4" :key="i"
          :class="['strength-seg', `strength-seg--${strengthLevel >= i ? strengthColor : 'empty'}`]" />
      </div>
      <span :class="['strength-label', `strength-label--${strengthColor}`]">{{ strengthText }}</span>
    </div>

    <p v-if="error" class="field__error"><AlertCircle :size="12" />{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { AlertCircle, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue:   { default: '' },
  label:        { type: String,  default: '' },
  type:         { type: String,  default: 'text' },
  prefixIcon:   { default: null },
  error:        { type: String,  default: '' },
  hint:         { type: String,  default: '' },
  rows:         { type: Number,  default: 4 },
  required:     { type: Boolean, default: false },
  showStrength: { type: Boolean, default: false }, // opt-in strength bar
})
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })

const id           = computed(() => `field-${Math.random().toString(36).slice(2, 8)}`)
const isPassword   = computed(() => props.type === 'password')
const showPassword = ref(false)

// Strength calculation
const strengthLevel = computed(() => {
  const pw = props.modelValue || ''
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
})
const strengthColor = computed(() => {
  if (strengthLevel.value <= 1) return 'weak'
  if (strengthLevel.value === 2) return 'fair'
  if (strengthLevel.value === 3) return 'good'
  return 'strong'
})
const strengthText = computed(() => {
  return ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthLevel.value] || ''
})
</script>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--space-1); }

.field__label {
  font-size:   var(--text-sm);
  font-weight: var(--weight-medium);
  color:       var(--color-text-2);
}
.field__required { color: var(--color-danger); margin-left: 2px; }

.field__control { position: relative; }

.field__input {
  width:         100%;
  padding:       0 var(--space-3);
  height:        40px;
  background:    var(--color-surface);
  border:        1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  font-size:     var(--text-sm);
  color:         var(--color-text);
  outline:       none;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.field__textarea {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
  line-height: var(--leading-relaxed);
}
/* Left padding when prefix icon present */
.field__input--padl { padding-left: calc(var(--space-3) + 15px + var(--space-2)); }
/* Right padding when eye button present */
.field__input--padr { padding-right: calc(var(--space-3) + 15px + var(--space-2)); }

.field__input::placeholder { color: var(--color-text-4); }
.field__input:focus {
  border-color: var(--color-primary);
  box-shadow:   0 0 0 3px rgba(30,58,138,0.1);
}
.field--error .field__input { border-color: var(--color-danger); }
.field--error .field__input:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }

/* Icons */
.field__icon {
  position:   absolute;
  top:        50%;
  transform:  translateY(-50%);
  color:      var(--color-text-4);
  pointer-events: none;
}
.field__icon--prefix { left: var(--space-3); }
.field__icon--suffix { right: var(--space-3); }

/* Eye button */
.field__eye {
  pointer-events: all;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  transition: color var(--transition-fast);
}
.field__eye:hover { color: var(--color-text-2); }

/* Strength bar */
.strength-wrap {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
  margin-top:  2px;
}
.strength-bar {
  display: flex;
  gap:     3px;
  flex:    1;
}
.strength-seg {
  flex:          1;
  height:        3px;
  border-radius: var(--radius-full);
  transition:    background var(--transition-fast);
}
.strength-seg--empty  { background: var(--color-border); }
.strength-seg--weak   { background: var(--color-danger); }
.strength-seg--fair   { background: #F59E0B; }
.strength-seg--good   { background: #3B82F6; }
.strength-seg--strong { background: var(--color-success); }

.strength-label {
  font-size:   var(--text-xs);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
  width:       42px;
  text-align:  right;
}
.strength-label--weak   { color: var(--color-danger); }
.strength-label--fair   { color: #F59E0B; }
.strength-label--good   { color: #3B82F6; }
.strength-label--strong { color: var(--color-success); }

/* Error / hint */
.field__error {
  display:    flex;
  align-items: center;
  gap:        4px;
  font-size:  var(--text-xs);
  color:      var(--color-danger);
}
.field__hint {
  font-size: var(--text-xs);
  color:     var(--color-text-4);
}
</style>
