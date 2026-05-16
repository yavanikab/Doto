import { ref, reactive, computed, nextTick } from 'vue'
import { useChecklist, syncChecklistNextId } from './useChecklist'
import { useNote } from './useNote'
import { useConfirmDialog } from './useConfirmDialog'

const tabs = ref([])
const activeIndex = ref(0)

export function useTabs() {
  const active = computed(() => tabs.value[activeIndex.value] || null)

  function createTab(type = 'checklist', filename) {
    const prefix = type === 'notes' ? 'N_' : 'C_'
    const name =
      filename ||
      (() => {
        const now = new Date()
        const ds =
          String(now.getFullYear()).slice(-2) +
          String(now.getMonth() + 1).padStart(2, '0') +
          String(now.getDate()).padStart(2, '0')
        const same = tabs.value.filter(
          (t) => t.type === type && t.filename && t.filename.startsWith(prefix + ds)
        ).length
        return prefix + ds + '-' + (same + 1) + '.md'
      })()
    const state = type === 'notes' ? useNote() : useChecklist()
    if (type !== 'notes') state.addBlankItem()
    const tab = reactive({
      id: Date.now(),
      type,
      filename: name,
      saveDir: null,
      createdDate: null,
      lastModified: null,
      pinned: false,
      isDotoNote: true,
      locked: false,
      ...state
    })
    tabs.value.push(tab)
    activeIndex.value = tabs.value.length - 1
    nextTick(() => {
      const selector = type === 'notes' ? '.note-input' : '.item-input'
      const el = document.querySelector(selector)
      if (el) el.focus()
    })
    return tab
  }

  function switchTab(index) {
    if (index >= 0 && index < tabs.value.length) {
      activeIndex.value = index
    }
  }

  async function closeTab(index) {
    const tab = tabs.value[index]
    if (!tab) return
    const { showConfirm } = useConfirmDialog()
    if (tab && !tab.isSaved) {
      const proceed = await showConfirm({
        title: 'Unsaved Changes',
        message: `"${tab.filename}" has unsaved changes. Close without saving?`,
        confirmLabel: 'Close Anyway',
        cancelLabel: 'Cancel',
        icon: 'fa-solid fa-pen-to-square'
      })
      if (!proceed) return
    }
    if (tab && tab.saveDir && !tab.isWelcomeNote) {
      const deleteFile = await showConfirm({
        title: 'Delete file from disk?',
        message: `Also delete "${tab.filename}" from your computer?`,
        confirmLabel: 'Delete File',
        cancelLabel: 'Keep File',
        danger: true,
        icon: 'fa-solid fa-trash-can'
      })
      if (deleteFile) {
        const filePath = tab.saveDir.replace(/\\/g, '/') + '/' + tab.filename
        await window.electronAPI?.deleteFile(filePath)
      }
    }
    tabs.value.splice(index, 1)
    if (tab && !tab.isWelcomeNote) await window.electronAPI?.deleteAppData(tab.id)
    if (index < activeIndex.value && activeIndex.value > 0) {
      activeIndex.value--
    } else if (activeIndex.value >= tabs.value.length) {
      activeIndex.value = tabs.value.length - 1
    } else if (activeIndex.value === index) {
      activeIndex.value = Math.min(index, tabs.value.length - 1)
    }
  }

  function truncateName(name, max = 10) {
    const base = name.replace(/\.md$/, '')
    return base.length > max ? base.slice(0, max) + '..' : base
  }

  async function closeAllTabs() {
    const unsaved = tabs.value.filter((t) => !t.isSaved && !t.isWelcomeNote)
    if (unsaved.length > 0) {
      const { showConfirm } = useConfirmDialog()
      const proceed = await showConfirm({
        title: 'Unsaved Changes',
        message: `${unsaved.length} tab(s) have unsaved changes. Close anyway?`,
        confirmLabel: 'Close All',
        cancelLabel: 'Cancel',
        icon: 'fa-solid fa-pen-to-square'
      })
      if (!proceed) return
    }
    await window.electronAPI?.clearAllAppData()
    tabs.value.splice(0, tabs.value.length)
    activeIndex.value = -1
  }

  function hydrateTab(data) {
    const state = data.type === 'notes' ? useNote() : useChecklist()
    const tab = reactive({
      id: data.id,
      type: data.type,
      filename: data.filename,
      saveDir: data.saveDir || null,
      createdDate: data.createdDate || null,
      lastModified: data.lastModified || null,
      pinned: data.pinned || false,
      fileMtime: data.fileMtime || null,
      isDotoNote: data.isDotoNote !== false,
      locked: data.locked || false,
      ...state
    })
    if (data.type === 'notes') {
      tab.content = data.content || ''
    } else {
      tab.items.splice(0, tab.items.length)
      if (data.items && data.items.length > 0) {
        data.items.forEach((item) => tab.items.push({ ...item }))
        const maxId = data.items.reduce((max, item) => Math.max(max, item.id || 0), 0)
        syncChecklistNextId(maxId)
      }
      if (tab.items.length === 0) tab.addBlankItem()
    }
    tab.isSaved = true
    tabs.value.push(tab)
  }

  function duplicateTab(tab) {
    if (!tab) return
    const state = tab.type === 'notes' ? useNote() : useChecklist()
    const newTab = reactive({
      id: Date.now(),
      type: tab.type,
      filename: tab.filename.replace(/\.md$/, '') + ' (copy).md',
      saveDir: null,
      createdDate: null,
      lastModified: null,
      pinned: false,
      isDotoNote: tab.isDotoNote !== false,
      locked: tab.locked || false,
      ...state
    })
    if (tab.type === 'notes') {
      newTab.content = tab.content || ''
    } else {
      tab.items.forEach((item) => newTab.items.push({ ...item }))
      const maxId = tab.items.reduce((max, item) => Math.max(max, item.id || 0), 0)
      syncChecklistNextId(maxId)
    }
    tabs.value.push(newTab)
    activeIndex.value = tabs.value.length - 1
    nextTick(() => {
      const selector = tab.type === 'notes' ? '.note-input' : '.item-input'
      const el = document.querySelector(selector)
      if (el) el.focus()
    })
    return newTab
  }

  return {
    tabs,
    activeIndex,
    active,
    createTab,
    switchTab,
    closeTab,
    closeAllTabs,
    truncateName,
    hydrateTab,
    duplicateTab
  }
}
