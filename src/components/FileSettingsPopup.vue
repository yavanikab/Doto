<template>
  <div class="settings-menu">
    <template v-if="tab?.type === 'checklist'">
      <button class="menu-item" @click="onSelectAll">
        <i class="fa-solid fa-check-double" />
        <span>Select All</span>
      </button>
      <button class="menu-item" @click="onSelectNone">
        <i class="fa-regular fa-square" />
        <span>Select None</span>
      </button>
      <div class="menu-sep" />
    </template>
    <button v-if="!tab?.isWelcomeNote" class="menu-item danger" @click="onClearAll">
      <i class="fa-solid fa-trash-can" />
      <span>Clear All</span>
    </button>
    <button v-if="!tab?.isWelcomeNote" class="menu-item danger" @click="onDeleteFile">
      <i class="fa-regular fa-trash-can" />
      <span>Delete File</span>
    </button>
    <div class="menu-sep" />
    <button class="menu-item" @click="onTogglePin">
      <i class="fa-solid fa-thumbtack" :style="tab?.pinned ? { color: 'var(--accent)' } : {}" />
      <span>{{ tab?.pinned ? 'Pinned' : 'Pin This Note' }}</span>
    </button>
    <button v-if="tab?.type === 'notes' && tab?.isDotoNote" class="menu-item" @click="onToggleLock">
      <i class="fa-solid fa-lock" :style="tab?.locked ? { color: 'var(--accent)' } : {}" />
      <span>{{ tab?.locked ? 'Unlock Note' : 'Lock Note' }}</span>
    </button>
  </div>
</template>

<script setup>
import { useTabs } from '../composables/useTabs'

const props = defineProps({
  tab: { type: Object, required: true }
})

const emit = defineEmits(['close'])

const { closeTab, tabs } = useTabs()

function onSelectAll() {
  if (props.tab?.selectAll) props.tab.selectAll()
  emit('close')
}

function onSelectNone() {
  if (props.tab?.selectNone) props.tab.selectNone()
  emit('close')
}

function onClearAll() {
  if (!props.tab) return
  if (props.tab.type === 'notes') {
    props.tab.setContent('')
  } else {
    props.tab.clearAll()
  }
  emit('close')
}

function onTogglePin() {
  if (!props.tab) return
  props.tab.pinned = !props.tab.pinned
  emit('close')
}

function onToggleLock() {
  if (!props.tab) return
  props.tab.locked = !props.tab.locked
  emit('close')
}

function onDeleteFile() {
  if (!props.tab) return
  const idx = tabs.value.indexOf(props.tab)
  if (idx !== -1) closeTab(idx)
  emit('close')
}
</script>

<style scoped>
.settings-menu {
  min-width: 170px;
  padding: var(--pad-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  width: 100%;
  padding: var(--pad-lg) var(--pad-3xl);
  font-size: var(--font-size-sm);
  color: var(--text);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  font-family: var(--font-family);
}

.menu-item:hover {
  background: var(--surface-raised);
}

.menu-item.danger {
  color: var(--text-danger);
}

.menu-item.danger:hover {
  background: color-mix(in srgb, var(--text-danger) 15%, transparent);
}

.menu-item i {
  width: 14px;
  text-align: center;
  flex-shrink: 0;
  font-size: 12px;
}

.menu-sep {
  height: 1px;
  background: var(--border);
  margin: var(--pad-xs) var(--pad-md);
}
</style>
