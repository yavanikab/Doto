<template>
  <div ref="wrapperRef" class="help-wrapper">
    <button class="help-btn" @click="toggle">
      <i class="fa-solid fa-circle-question" />
      <span v-if="label">{{ label }}</span>
    </button>
    <div v-if="visible" ref="menuRef" class="help-menu">
      <a href="#" class="help-link" @click.prevent="openExternal('https://www.buymeacoffee.com/')">
        <span class="help-link-icon" v-html="bmacSvg" /> Support
      </a>
      <a href="#" class="help-link" @click.prevent="openExternal('https://github.com/')">
        <span class="help-link-icon" v-html="githubSvg" /> GitHub
      </a>
      <div class="help-separator" />
      <a href="#" class="help-link" @click.prevent="openExternal('https://github.com/')">
        <span class="help-link-icon" v-html="projectSvg" /> Other Projects
      </a>
      <div class="help-separator" />
      <a href="#" class="help-link" @click.prevent="openExternal('mailto:feedback@example.com')">
        <i class="fa-solid fa-pen-clip" /> Submit Feedback
      </a>
      <a href="#" class="help-link" @click.prevent="openExternal('https://github.com/')">
        <i class="fa-solid fa-pen-clip" /> Submit Issues
      </a>
      <div class="help-separator" />
      <a href="#" class="help-link" @click.prevent="openExternal('https://github.com/')">
        <i class="fa-solid fa-file-shield" /> License & Terms
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import bmacSvg from '../assets/bmac.svg?raw'
import githubSvg from '../assets/github.svg?raw'
import projectSvg from '../assets/project.svg?raw'

defineProps({
  label: { type: String, default: '' }
})

function openExternal(url) {
  window.electronAPI?.openExternal(url)
}

const visible = ref(false)
const wrapperRef = ref(null)

function toggle() {
  visible.value = !visible.value
}
function close() {
  visible.value = false
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
.help-wrapper {
  position: relative;
}

.help-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--pad-xs) var(--pad-md);
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-family: var(--font-family);
}

.help-btn:hover {
  color: var(--text);
  background: var(--surface-hover);
}

.help-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--pad-sm);
  background: var(--surface-hover);
  border: 1px solid oklch(from var(--surface-dropdown) calc(l - 0.06) c h);
  border-radius: var(--radius-lg);
  min-width: 160px;
  z-index: 1000;
}

.help-link {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--pad-lg) var(--pad-3xl);
  font-size: var(--font-size-md);
  color: var(--text);
  text-decoration: none;
  white-space: nowrap;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.help-link:hover {
  background: var(--surface);
}

.help-link i {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.help-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.help-link-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.help-separator {
  height: 1px;
  background: oklch(from var(--surface-dropdown) calc(l - 0.06) c h);
  margin: 0 var(--pad-3xl);
}
</style>
