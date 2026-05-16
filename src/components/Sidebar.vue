<template>
  <aside class="sidebar">
    <div class="sidebar-welcome">
      <span class="welcome-text">{{ fileSummary }}</span>
      <div class="welcome-actions">
        <SortPopup v-model="sortMode" :disabled="tabs.length === 0" />
        <button class="welcome-open-btn" title="Open file" @click="$emit('open-file')">
          <i class="fa-solid fa-folder-open" />
        </button>
      </div>
    </div>

    <div class="sidebar-search">
      <i class="fa-solid fa-magnifying-glass search-icon" />
      <input
        v-model="searchInput"
        class="search-input"
        type="text"
        placeholder="Search files..."
        maxlength="100"
      />
      <button v-if="searchInput" class="search-clear" @click="searchInput = ''">
        <i class="fa-solid fa-xmark" />
      </button>
    </div>

    <div class="sidebar-section">
      <div class="section-header">
        <span class="section-title">Checklists</span>
        <div class="section-actions">
          <button class="section-add" title="New checklist" @click="createTab('checklist')">
            <i class="fa-solid fa-plus" />
          </button>
        </div>
      </div>
      <div class="section-files">
        <div
          v-for="tab in checklistTabs"
          :key="tab.id"
          class="file-row"
          tabindex="0"
          :class="{ active: tab.id === active?.id }"
          :style="tab.id === active?.id ? { '--active-border': 'var(--checklist-color)' } : {}"
          @click="switchTab(tabs.indexOf(tab))"
          @keydown.enter="switchTab(tabs.indexOf(tab))"
          @contextmenu.prevent="openContextMenu($event, tab)"
          @mouseenter="hoveredFile = tab.id"
          @mouseleave="hoveredFile = null"
        >
          <i class="fa-solid fa-clipboard-check file-icon" style="color: var(--checklist-color)" />
          <span class="file-name">{{ tab.filename }}</span>
          <i v-if="tab.pinned" class="fa-solid fa-thumbtack pin-icon" />
          <span class="file-indicator">
            <button
              class="file-close"
              :class="{ visible: hoveredFile === tab.id }"
              title="Close"
              @click.stop="closeTab(tabs.indexOf(tab))"
            >
              <i class="fa-solid fa-xmark" />
            </button>
            <span
              class="file-dot"
              :class="{ hidden: hoveredFile === tab.id, saved: tab.isSaved, unsaved: !tab.isSaved }"
            />
          </span>
        </div>
        <div v-if="checklistTabs.length === 0" class="empty-section">Add files</div>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-header">
        <span class="section-title">Notes</span>
        <div class="section-actions">
          <button class="section-add" title="New note" @click="createTab('notes')">
            <i class="fa-solid fa-plus" />
          </button>
        </div>
      </div>
      <div class="section-files">
        <div
          v-for="tab in notesTabs"
          :key="tab.id"
          class="file-row"
          tabindex="0"
          :class="{ active: tab.id === active?.id }"
          :style="tab.id === active?.id ? { '--active-border': 'var(--notes-color)' } : {}"
          @click="switchTab(tabs.indexOf(tab))"
          @keydown.enter="switchTab(tabs.indexOf(tab))"
          @contextmenu.prevent="openContextMenu($event, tab)"
          @mouseenter="hoveredFile = tab.id"
          @mouseleave="hoveredFile = null"
        >
          <i class="fa-solid fa-file-lines file-icon" style="color: var(--notes-color)" />
          <span class="file-name">{{ tab.filename }}</span>
          <i v-if="tab.pinned" class="fa-solid fa-thumbtack pin-icon" />
          <i v-if="tab.locked && tab.type === 'notes'" class="fa-solid fa-lock lock-icon" />
          <span class="file-indicator">
            <button
              class="file-close"
              :class="{ visible: hoveredFile === tab.id }"
              title="Close"
              @click.stop="closeTab(tabs.indexOf(tab))"
            >
              <i class="fa-solid fa-xmark" />
            </button>
            <span
              class="file-dot"
              :class="{ hidden: hoveredFile === tab.id, saved: tab.isSaved, unsaved: !tab.isSaved }"
            />
          </span>
        </div>
        <div v-if="notesTabs.length === 0" class="empty-section">Add files</div>
      </div>
    </div>

    <div class="sidebar-footer">
      <SettingsPopup
        label="Settings"
        :theme="theme"
        :font-size="fontSize"
        :no-files="tabs.length === 0"
        @toggle-theme="$emit('toggle-theme')"
        @update-font-size="$emit('update-font-size', $event)"
        @clear-all-tabs="$emit('clear-all-tabs')"
        @export-all="$emit('export-all')"
        @open-welcome-note="$emit('open-welcome-note')"
      />
      <HelpPopup label="Help" />
    </div>
    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenuItems"
      @close="contextMenu.visible = false"
      @action="onContextAction"
    />
  </aside>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useTabs } from '../composables/useTabs'
import HelpPopup from './HelpPopup.vue'
import SortPopup from './SortPopup.vue'
import ContextMenu from './ContextMenu.vue'
import SettingsPopup from './ModalSettings.vue'

const { tabs, active, createTab, switchTab, closeTab, duplicateTab } = useTabs()

defineProps({
  theme: { type: String, default: 'dark' },
  fontSize: { type: Number, default: 14 }
})

defineEmits([
  'open-file',
  'toggle-theme',
  'update-font-size',
  'clear-all-tabs',
  'export-all',
  'open-welcome-note'
])

const contextMenu = reactive({ visible: false, x: 0, y: 0, tab: null })

function openContextMenu(e, tab) {
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.tab = tab
  contextMenu.visible = true
}

const contextMenuItems = computed(() => {
  const tab = contextMenu.tab
  if (!tab) return []
  const items = [
    { id: 'duplicate', icon: 'fa-regular fa-copy', label: 'Duplicate' },
    {
      id: 'pin',
      icon: tab.pinned ? 'fa-solid fa-map-pin' : 'fa-solid fa-thumbtack',
      label: tab.pinned ? 'Unpin' : 'Pin this ' + (tab.type === 'notes' ? 'note' : 'list')
    }
  ]
  if (tab.saveDir) {
    items.push({
      id: 'open-location',
      icon: 'fa-solid fa-folder-open',
      label: 'Open file location'
    })
  }
  items.push({ id: 'delete', icon: 'fa-regular fa-trash-can', label: 'Delete', danger: true })
  return items
})

function onContextAction(action) {
  const tab = contextMenu.tab
  if (!tab) return
  if (action === 'duplicate') {
    duplicateTab(tab)
  } else if (action === 'pin') {
    tab.pinned = !tab.pinned
  } else if (action === 'delete') {
    closeTab(tabs.value.indexOf(tab))
  } else if (action === 'open-location') {
    const filePath = tab.saveDir + '/' + tab.filename
    window.electronAPI?.showItemInFolder(filePath)
  }
}

const fileSummary = computed(() => {
  const realTabs = tabs.value.filter((t) => !t.isWelcomeNote)
  const lists = realTabs.filter((t) => t.type === 'checklist').length
  const notes = realTabs.filter((t) => t.type === 'notes').length
  const parts = []
  if (lists > 0) parts.push(`${lists} ${lists === 1 ? 'LIST' : 'LISTS'}`)
  if (notes > 0) parts.push(`${notes} ${notes === 1 ? 'NOTE' : 'NOTES'}`)
  return parts.length > 0 ? parts.join(', ') : 'NO FILES'
})

const hoveredFile = ref(null)
const searchInput = ref('')
const searchQuery = ref('')
const sortMode = ref(localStorage.getItem('doto-sort') || 'manual')

watch(sortMode, (v) => localStorage.setItem('doto-sort', v))

let searchTimer = null
watch(searchInput, (v) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = v
  }, 150)
})

function matchesSearch(tab, query) {
  if (!query) return true
  const q = query.toLowerCase()
  if (tab.filename.toLowerCase().includes(q)) return true
  if (tab.type === 'notes' && tab.content && tab.content.toLowerCase().includes(q)) return true
  if (tab.type === 'checklist' && tab.items) {
    return tab.items.some((item) => item.text && item.text.toLowerCase().includes(q))
  }
  return false
}

function sortTabs(list, mode) {
  const pinned = []
  const unpinned = []
  for (const t of list) {
    if (t.pinned) pinned.push(t)
    else unpinned.push(t)
  }
  if (mode === 'manual' || !mode) return [...pinned, ...unpinned]
  const sorted = [...unpinned]
  switch (mode) {
    case 'alpha-asc':
      sorted.sort((a, b) => a.filename.localeCompare(b.filename))
      break
    case 'alpha-desc':
      sorted.sort((a, b) => b.filename.localeCompare(a.filename))
      break
    case 'recent':
      sorted.sort((a, b) => {
        const ta = a.lastModified ? new Date(a.lastModified).getTime() : 0
        const tb = b.lastModified ? new Date(b.lastModified).getTime() : 0
        return tb - ta
      })
      break
  }
  return [...pinned, ...sorted]
}

const checklistTabs = computed(() => {
  const filtered = tabs.value.filter(
    (t) => t.type === 'checklist' && matchesSearch(t, searchQuery.value)
  )
  return sortTabs(filtered, sortMode.value)
})
const notesTabs = computed(() => {
  const filtered = tabs.value.filter(
    (t) => t.type === 'notes' && matchesSearch(t, searchQuery.value)
  )
  return sortTabs(filtered, sortMode.value)
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.sidebar-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pad-xl) var(--sidebar-padding);
}

.welcome-text {
  font-size: var(--font-size-xs);
  color: var(--text-dim);
  font-family: var(--font-mono);
}

.welcome-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.welcome-open-btn {
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

.welcome-open-btn:hover {
  color: var(--accent);
  background: var(--surface-hover);
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
  padding: var(--pad-3xl) var(--sidebar-padding);
}

.search-icon {
  color: var(--text-dim);
  font-size: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-dim);
  opacity: 0.6;
}

.search-clear {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.search-clear:hover {
  color: var(--text);
  background: var(--surface-hover);
}

.sidebar-section {
  border-bottom: 1px solid var(--border);
  flex: 1;
  overflow-y: auto;
}

.sidebar-section:last-of-type {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--pad-2xl);
  padding-inline: var(--sidebar-padding);
  margin-bottom: var(--gap-xs);
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 1;
}

.section-title {
  font-size: var(--font-size-xs);
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: var(--font-mono);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.section-add {
  background: var(--surface-raised);
  border: none;
  color: var(--text);
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.section-add:hover {
  background: var(--accent);
  color: var(--bg);
}

.empty-section {
  font-size: var(--font-size-xs);
  color: var(--text-dim);
  padding: var(--pad-xl) var(--sidebar-padding);
  text-align: center;
  opacity: 0.5;
  font-style: italic;
}

.section-files {
  display: flex;
  flex-direction: column;
}

.file-row:hover {
  background: var(--surface-hover);
}

.file-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--pad-sm) var(--sidebar-padding) var(--pad-sm) calc(var(--sidebar-padding) - 2px);
  cursor: pointer;
  transition: background var(--transition-fast);
  border-left: 2px solid transparent;
}

.file-row.active {
  background: var(--surface-hover);
  border-left-color: var(--active-border, var(--accent));
}

.file-icon {
  width: 14px;
  font-size: 13px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-family: var(--font-mono);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pin-icon {
  font-size: 9px;
  color: var(--accent);
  flex-shrink: 0;
  margin: 0 2px 0 0;
}

.lock-icon {
  font-size: 9px;
  color: #e06060;
  flex-shrink: 0;
  margin: 0 2px 0 0;
}

.file-indicator {
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.file-dot.saved {
  background: var(--accent);
}
.file-dot.unsaved {
  background: var(--unsaved);
}
.file-dot.hidden {
  visibility: hidden;
}

.file-close {
  position: absolute;
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 10px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  padding: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
}

.file-close.visible {
  visibility: visible;
}

.file-close:hover {
  color: var(--close-danger);
  background: color-mix(in srgb, var(--close-danger) 15%, transparent);
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  padding: var(--pad-3xl) var(--sidebar-padding);
  border-top: 1px solid var(--border);
}

.sidebar-footer-btn {
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

.sidebar-footer-btn:hover {
  color: var(--text);
  background: var(--surface-hover);
}
</style>
