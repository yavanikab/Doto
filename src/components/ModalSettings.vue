<template>
  <div ref="wrapperRef" class="settings-wrapper">
    <button class="settings-btn" @click="toggle">
      <i class="fa-solid fa-gear" />
      <span v-if="label">{{ label }}</span>
    </button>
    <div v-if="visible" ref="menuRef" class="settings-menu">
      <div class="settings-row">
        <span class="settings-row-label">Appearance</span>
        <button
          class="theme-toggle"
          :class="{ active: theme === 'dark' }"
          @click="setTheme(theme === 'dark' ? 'light' : 'dark')"
        >
          <span class="toggle-track">
            <span class="toggle-thumb" />
          </span>
        </button>
      </div>
      <div class="settings-separator" />
      <div class="settings-row">
        <span class="settings-row-label">Font size</span>
        <div class="font-size-controls">
          <button class="size-btn" :disabled="fontSize <= 10" @click="onChangeFontSize(-1)">
            −
          </button>
          <span class="size-value">{{ fontSize }}</span>
          <button class="size-btn" :disabled="fontSize >= 24" @click="onChangeFontSize(1)">
            +
          </button>
        </div>
      </div>
      <div class="settings-separator" />
      <button class="settings-item danger" @click="onClearAllTabs">
        <i class="fa-solid fa-square-xmark" />
        Clear All Tabs
      </button>
      <button class="settings-item" :disabled="noFiles" @click="onExportAll">
        <i class="fa-solid fa-arrow-up-from-bracket" />
        Export All as ZIP
      </button>
      <div class="settings-separator" />
      <button class="settings-item" @click="showShortcuts = true">
        <i class="fa-solid fa-keyboard" />
        Shortcuts
        <i class="fa-solid fa-chevron-right chevron" />
      </button>
      <div class="settings-separator" />
      <button class="settings-item open-btn" @click="onOpenWelcomeNote">
        <i class="fa-solid fa-file-lines" />
        <span>DOTO README</span>
        <i class="fa-solid fa-chevron-right chevron" />
      </button>
      <div class="settings-footer">Doto<br />Desktop v{{ appVersion }}</div>
    </div>
    <ShortcutsModal v-if="showShortcuts" @close="showShortcuts = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ShortcutsModal from './ShortcutsModal.vue'
import { version as appVersion } from '../../package.json'

const props = defineProps({
  label: { type: String, default: '' },
  theme: { type: String, default: 'dark' },
  fontSize: { type: Number, default: 14 },
  noFiles: { type: Boolean, default: false }
})

const emit = defineEmits([
  'toggle-theme',
  'update-font-size',
  'clear-all-tabs',
  'export-all',
  'open-welcome-note'
])

const visible = ref(false)
const showShortcuts = ref(false)
const wrapperRef = ref(null)

function toggle() {
  visible.value = !visible.value
}
function close() {
  visible.value = false
}

function setTheme(theme) {
  if (theme !== props.theme) emit('toggle-theme')
}

function onChangeFontSize(delta) {
  const newVal = Math.max(10, Math.min(24, props.fontSize + delta))
  if (newVal !== props.fontSize) emit('update-font-size', newVal)
}

function onClearAllTabs() {
  emit('clear-all-tabs')
  close()
}

function onExportAll() {
  emit('export-all')
  close()
}

function onOpenWelcomeNote() {
  emit('open-welcome-note')
  close()
}

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) close()
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
.settings-wrapper {
  position: relative;
}

.settings-btn {
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

.settings-btn:hover {
  color: var(--text);
  background: var(--surface-hover);
}

.settings-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  padding: var(--pad-sm);
  background: var(--surface-hover);
  border: 1px solid oklch(from var(--surface-dropdown) calc(l - 0.06) c h);
  border-radius: var(--radius-lg);
  z-index: 1000;
}

.settings-separator {
  height: 1px;
  background: oklch(from var(--surface-dropdown) calc(l - 0.06) c h);
  margin: var(--pad-xs) var(--pad-3xl);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pad-2xl) var(--pad-3xl);
  gap: var(--gap-xl);
}

.settings-row-label {
  font-size: var(--font-size-sm);
  color: var(--text);
  white-space: nowrap;
}

/* ── Theme Toggle ── */

.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.toggle-track {
  width: 28px;
  height: 14px;
  background: var(--surface);
  border-radius: 7px;
  position: relative;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.theme-toggle.active .toggle-track {
  background: var(--accent);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  background: var(--text);
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.theme-toggle.active .toggle-thumb {
  left: 16px;
  background: var(--bg);
}

/* ── Font Size ── */

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.size-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: var(--font-size-sm);
  cursor: pointer;
  font-family: var(--font-family);
  transition: all var(--transition-fast);
  line-height: 1;
  padding: 0;
}

.size-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

.size-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.size-value {
  min-width: 24px;
  font-size: var(--font-size-sm);
  color: var(--text-dim);
  text-align: center;
  font-family: var(--font-mono);
}

/* ── Settings Items ── */

.settings-item {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: var(--font-size-sm);
  padding: var(--pad-xl) var(--pad-3xl);
  cursor: pointer;
  font-family: var(--font-family);
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.settings-item:hover {
  background: var(--surface);
}

.settings-item:disabled {
  opacity: 0.25;
  cursor: not-allowed;
  pointer-events: none;
}

.settings-item.danger {
  color: var(--text-danger);
}

.settings-item.danger:hover {
  background: color-mix(in srgb, var(--text-danger) 15%, transparent);
}

.settings-item .chevron {
  margin-left: auto;
  color: var(--text-dim);
  font-size: 9px;
  opacity: 0.25;
  transition: opacity var(--transition-fast);
}

.settings-item:hover .chevron {
  opacity: 0.6;
}

/* ── Footer ── */

.settings-footer {
  text-align: center;
  padding: var(--pad-3xl);
  margin-block: var(--pad-md);
  font-size: var(--font-size-sm);
  color: var(--text-dim);
}
</style>
