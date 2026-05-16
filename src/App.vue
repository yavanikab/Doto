<template>
  <div class="app">
    <TitleBar />
    <div class="app-body">
      <Sidebar
        :theme="theme"
        :font-size="fontSize"
        @open-file="onOpenFile"
        @toggle-theme="toggleTheme"
        @update-font-size="onFontSizeChange"
        @clear-all-tabs="closeAllTabs()"
        @export-all="onExportAll()"
        @open-welcome-note="openWelcomeNote()"
      />
      <main class="content">
        <WelcomePlaceholder v-if="tabs.length === 0" @open-welcome-note="openWelcomeNote" />
        <ChecklistView v-else-if="active?.type === 'checklist'" />
        <NotesView v-else-if="active?.type === 'notes'" :tab="active" />
      </main>
      <RightBar v-if="active" :tab="active" />
    </div>
    <ContextMenu
      :visible="ctxVisible"
      :x="ctxX"
      :y="ctxY"
      :items="[
        { id: 'select-all', icon: 'fa-solid fa-check-double', label: 'Select All' },
        { id: 'refresh', icon: 'fa-solid fa-rotate', label: 'Refresh' }
      ]"
      @close="ctxVisible = false"
      @action="onGlobalContextAction"
    />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import ChecklistView from './components/ChecklistView.vue'
import NotesView from './components/NotesView.vue'
import RightBar from './components/RightBar.vue'
import WelcomePlaceholder from './components/WelcomePlaceholder.vue'
import ContextMenu from './components/ContextMenu.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useTabs } from './composables/useTabs'
import { parseChecklistContent, syncChecklistNextId } from './composables/useChecklist'
import { useAppDataPersistence } from './composables/useAppDataPersistence'
import { useWelcomeNote } from './composables/useWelcomeNote'
import { useConfirmDialog } from './composables/useConfirmDialog'

const { tabs, active, activeIndex, createTab, closeTab, closeAllTabs, duplicateTab } = useTabs()
const { openWelcomeNote } = useWelcomeNote()
useAppDataPersistence()
const theme = ref('dark')

const fontSize = ref(14)

const ctxVisible = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)

function onGlobalContextMenu(e) {
  if (e.defaultPrevented) return
  e.preventDefault()
  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxVisible.value = true
}

function onGlobalContextAction(action) {
  if (action === 'refresh') location.reload()
  if (action === 'select-all') {
    if (active.value?.type === 'checklist' && typeof active.value?.selectAll === 'function') {
      active.value.selectAll()
    } else if (active.value?.type === 'notes') {
      const pm = document.querySelector('.ProseMirror')
      if (pm) {
        pm.focus()
        document.execCommand('selectAll')
      }
    }
  }
}

onMounted(async () => {
  const config = await window.electronAPI?.loadConfig()
  if (config?.theme) {
    theme.value = config.theme
    document.documentElement.setAttribute('data-theme', config.theme)
    localStorage.setItem('doto-theme', config.theme)
  }
  if (config?.fontSize) {
    fontSize.value = config.fontSize
    document.documentElement.style.setProperty('--editor-font-size', config.fontSize + 'px')
  }
  document.addEventListener('keydown', onGlobalKeydown)
  document.addEventListener('contextmenu', onGlobalContextMenu)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onGlobalKeydown)
  document.removeEventListener('contextmenu', onGlobalContextMenu)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

function onBeforeUnload() {
  const t = document.documentElement.getAttribute('data-theme')
  if (t) localStorage.setItem('doto-theme', t)
}

function onGlobalKeydown(e) {
  if (e.key === 'F5') {
    e.preventDefault()
    location.reload()
    return
  }
  if (e.key === 'F2') {
    e.preventDefault()
    document.querySelector('.filename-input')?.focus()
    return
  }
  if (e.key === 'Escape') {
    document.querySelector('.shortcuts-overlay')?.click()
    return
  }
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'w') {
      e.preventDefault()
      if (e.shiftKey) {
        closeAllTabs()
      } else {
        closeTab(activeIndex.value)
      }
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const len = tabs.value.length
      if (len === 0) return
      activeIndex.value = (activeIndex.value + (e.shiftKey ? -1 : 1) + len) % len
      return
    }
    switch (e.key.toLowerCase()) {
      case 'd':
        e.preventDefault()
        if (e.shiftKey) {
          closeTab(activeIndex.value)
        } else {
          if (active.value) duplicateTab(active.value)
        }
        return
      case 'e':
        if (e.shiftKey) {
          e.preventDefault()
          onExportAll()
          return
        }
        return
      case 'o':
        e.preventDefault()
        onOpenFile()
        return
      case 'n':
        e.preventDefault()
        createTab(e.shiftKey ? 'notes' : 'checklist')
        return
      case 'r':
        e.preventDefault()
        location.reload()
        return
      case 's':
        e.preventDefault()
        if (e.shiftKey) {
          const tab = active.value
          if (tab && tab.saveDir) {
            tab.saveDir = null
            document.querySelector('.save-btn')?.click()
            return
          }
        }
        document.querySelector('.save-btn')?.click()
        return
    }
  }
}

async function onExportAll() {
  const tabData = tabs.value
    .filter((t) => !t.isWelcomeNote)
    .map((tab) => ({
      filename: tab.filename,
      content:
        tab.type === 'notes'
          ? tab.isDotoNote
            ? '<!-- doto:note -->\n' + tab.toText()
            : tab.toText()
          : tab.toMarkdown(tab.filename.replace(/\.md$/, ''))
    }))
  await window.electronAPI?.exportZip(tabData)
}

async function onOpenFile() {
  const data = await window.electronAPI?.openMdFile()
  if (!data) return
  if (data.error) {
    const { showConfirm } = useConfirmDialog()
    await showConfirm({
      title: 'Cannot Open File',
      message: data.error,
      confirmLabel: 'OK',
      hideCancel: true,
      icon: 'fa-solid fa-circle-exclamation'
    })
    return
  }

  if (data.type === 'checklist') {
    const tab = createTab('checklist', data.filename)
    tab.saveDir = data.dir
    tab.items.splice(0, tab.items.length)
    const parsed = parseChecklistContent(data.content)
    parsed.forEach((item) => tab.items.push(item))
    syncChecklistNextId(parsed.reduce((max, i) => Math.max(max, i.id || 0), 0))
    if (tab.items.length === 0) tab.addBlankItem()
    tab.fileMtime = data.mtimeMs
    tab.isSaved = true
  } else {
    const tab = createTab('notes', data.filename)
    tab.saveDir = data.dir
    const hasMarker = data.content && data.content.startsWith('<!-- doto:note -->')
    tab.isDotoNote = hasMarker || (data.filename && data.filename.startsWith('N_'))
    tab.content = hasMarker ? data.content.replace(/^<!-- doto:note -->\s*\n?/, '') : data.content
    tab.isSaved = true
  }
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('doto-theme', theme.value)
  window.electronAPI?.saveConfig({ theme: theme.value })
}

function onFontSizeChange(val) {
  fontSize.value = val
  document.documentElement.style.setProperty('--editor-font-size', val + 'px')
  window.electronAPI?.saveConfig({ fontSize: val })
}
</script>

<style>
@import './assets/tokens.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

::selection {
  background: var(--surface-raised);
  color: var(--accent);
}

::-moz-selection {
  background: var(--surface-raised);
  color: var(--accent);
}

/* Global custom scrollbar — consistent across all components */
::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  border-radius: var(--radius-md);
  background: var(--scrollbar-thumb);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
* {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

html {
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

body,
#app {
  height: 100%;
  overflow: hidden;
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.5;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow: hidden;
  padding: 16px 20px;
}
</style>
