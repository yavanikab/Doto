<template>
  <div ref="wrapperRef" class="sort-wrapper">
    <button
      class="sort-btn"
      :class="{ disabled }"
      :disabled="disabled"
      :title="disabled ? 'No files to sort' : 'Sort options'"
      @click="disabled ? null : toggle()"
    >
      <i class="fa-solid fa-up-down" />
    </button>
    <div v-if="visible" class="sort-menu">
      <button
        v-for="opt in options"
        :key="opt.value"
        class="sort-option"
        :class="{ active: opt.value === modelValue }"
        @click="select(opt.value)"
      >
        <i :class="opt.icon" />
        <span>{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  modelValue: { type: String, default: 'manual' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const wrapperRef = ref(null)

const options = [
  { value: 'manual', icon: 'fa-solid fa-grip-lines', label: 'Manual' },
  { value: 'alpha-asc', icon: 'fa-solid fa-sort-alpha-down', label: 'A-Z' },
  { value: 'alpha-desc', icon: 'fa-solid fa-sort-alpha-up', label: 'Z-A' },
  { value: 'recent', icon: 'fa-solid fa-clock-rotate-left', label: 'Recent' }
]

function toggle() {
  visible.value = !visible.value
}
function close() {
  visible.value = false
}

function select(value) {
  emit('update:modelValue', value)
  close()
}

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    close()
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.sort-wrapper {
  position: relative;
}

.sort-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.sort-btn:hover:not(.disabled) {
  color: var(--accent);
  background: var(--surface-hover);
}

.sort-btn.disabled {
  opacity: 0.35;
  cursor: default;
}

.sort-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  background: var(--surface-dropdown);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  min-width: 130px;
  z-index: 1000;
  padding: 2px;
}

.sort-option {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--pad-lg) var(--pad-3xl);
  font-size: var(--font-size-sm);
  color: var(--text);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  text-align: left;
  transition: background var(--transition-fast);
  border-radius: var(--radius-sm);
}

.sort-option:hover {
  background: var(--surface-raised);
}

.sort-option.active {
  background: var(--surface-raised);
  color: var(--accent);
}

.sort-option i {
  width: 14px;
  text-align: center;
  flex-shrink: 0;
  font-size: 11px;
}
</style>
