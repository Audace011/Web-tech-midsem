<template>
  <div class="upload" :class="{ 'upload--drag': isDragging }" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop">
    <div v-if="!preview" class="upload__placeholder">
      <ImagePlus :size="32" class="upload__icon" />
      <p class="upload__text">Drag & drop an image or <label class="upload__browse" for="file-input">browse</label></p>
      <p class="upload__hint">JPEG, PNG, WebP up to 5MB</p>
    </div>
    <div v-else class="upload__preview">
      <img :src="preview" alt="Preview" class="upload__img" />
      <button class="upload__remove" @click.prevent="removeImage">
        <X :size="16" />
      </button>
    </div>
    <input id="file-input" type="file" accept="image/*" class="upload__hidden" @change="onFileChange" />
    <p v-if="error" class="upload__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ImagePlus, X } from 'lucide-vue-next'
import { fileToBase64, validateImageFile } from '@/helpers/imageHelper'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({ modelValue: { default: null } })

const preview   = ref(props.modelValue || null)
const error     = ref('')
const isDragging = ref(false)

async function handleFile(file) {
  error.value = ''
  const { valid, message } = validateImageFile(file)
  if (!valid) { error.value = message; return }
  const base64 = await fileToBase64(file)
  preview.value = base64
  emit('update:modelValue', base64)
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) handleFile(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) handleFile(file)
}

function removeImage() {
  preview.value = null
  emit('update:modelValue', null)
}
</script>

<style scoped>
.upload {
  border:        2px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding:       var(--space-6);
  text-align:    center;
  cursor:        pointer;
  transition:    all var(--transition-base);
  background:    var(--color-surface);
}
.upload--drag, .upload:hover {
  border-color: var(--color-primary);
  background:   var(--color-primary-alpha);
}
.upload__placeholder { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
.upload__icon  { color: var(--color-text-3); }
.upload__text  { font-size: var(--text-sm); color: var(--color-text-2); }
.upload__browse { color: var(--color-primary-light); cursor: pointer; text-decoration: underline; }
.upload__hint  { font-size: var(--text-xs); color: var(--color-text-3); }
.upload__hidden { display: none; }
.upload__error  { font-size: var(--text-xs); color: var(--color-danger); margin-top: var(--space-2); }

.upload__preview {
  position: relative;
  display:  inline-block;
  max-width: 100%;
}
.upload__img  { max-height: 200px; border-radius: var(--radius-md); margin: 0 auto; }
.upload__remove {
  position:      absolute;
  top:           -8px; right: -8px;
  background:    var(--color-danger);
  border:        none;
  border-radius: var(--radius-full);
  width: 26px; height: 26px;
  color: #fff; cursor: pointer;
  display:       flex;
  align-items:   center;
  justify-content: center;
}
</style>
