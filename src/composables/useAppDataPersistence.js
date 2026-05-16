import { watch, onMounted, onUnmounted } from 'vue'
import { useTabs } from './useTabs'
import { useWelcomeNote } from './useWelcomeNote'

export function useAppDataPersistence() {
  const { tabs, activeIndex, hydrateTab } = useTabs()
  const { seedIfNeeded } = useWelcomeNote()
  let saveTimer = null

  onMounted(async () => {
    try {
      await seedIfNeeded()
      const savedTabs = await window.electronAPI?.loadAppData()
      if (savedTabs && savedTabs.length > 0) {
        tabs.value.splice(0, tabs.value.length)
        savedTabs.forEach((data) => {
          if (data.isWelcomeNote) return
          if (data.filename === 'N_welcome.md' || data.filename === 'C_getting-started.md') return
          hydrateTab(data)
        })
      }
      const config = await window.electronAPI?.loadConfig()
      const lastIdx = config?.lastActiveIndex
      if (lastIdx !== undefined && lastIdx >= 0 && lastIdx < tabs.value.length) {
        activeIndex.value = lastIdx
      } else {
        activeIndex.value = tabs.value.length > 0 ? 0 : -1
      }
    } catch (err) {
      console.error('Failed to load saved tabs:', err)
    }
    window.addEventListener('beforeunload', onBeforeUnload)
  })

  async function flushSave() {
    if (saveTimer) clearTimeout(saveTimer)
    try {
      await window.electronAPI?.saveConfig({ lastActiveIndex: activeIndex.value })
      for (const tab of tabs.value) {
        if (tab.isWelcomeNote) {
          await window.electronAPI?.saveWelcomeNote({
            content: tab.content,
            createdDate: tab.createdDate,
            lastModified: tab.lastModified
          })
          continue
        }
        const data = serializeTab(tab)
        await window.electronAPI?.saveAppData(data)
      }
    } catch (err) {
      console.error('AppData save failed:', err)
    }
  }

  function onBeforeUnload() {
    if (saveTimer) clearTimeout(saveTimer)
    flushSave()
  }

  onUnmounted(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
    if (saveTimer) clearTimeout(saveTimer)
    flushSave()
  })

  watch(
    tabs,
    () => {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => flushSave(), 500)
    },
    { deep: true }
  )

  function serializeTab(tab) {
    const base = {
      id: tab.id,
      type: tab.type,
      filename: tab.filename,
      saveDir: tab.saveDir,
      createdDate: tab.createdDate,
      lastModified: tab.lastModified,
      pinned: tab.pinned || false,
      locked: tab.locked || false,
      fileMtime: tab.fileMtime || null
    }
    if (tab.type === 'notes') {
      base.content = tab.content
    } else {
      base.items = tab.items.map((i) => ({ ...i }))
    }
    return base
  }

  return {}
}
