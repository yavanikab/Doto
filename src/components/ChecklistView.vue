<template>
  <div v-if="active" class="checklist">
    <div class="filename-bar">
      <input
        v-model="active.filename"
        class="filename-input"
        type="text"
        placeholder="checklist.md"
        maxlength="50"
        @focus="onFilenameFocus"
        @blur="onFilenameBlur"
      />
      <span class="save-label">
        <span v-if="active.isSaved" class="saved-text">{{
          lastSaveType === 'auto' ? 'Auto Saved' : 'Saved'
        }}</span>
        <span v-else class="unsaved-text">Unsaved</span>
      </span>
      <button class="save-btn" @click="onSave">
        <span v-if="!active.saveDir">Save</span>
        <span v-else>Save As</span>
      </button>
    </div>

    <div v-if="showHeadingHint" class="heading-hint">
      <kbd>+</kbd> inserts heading below &middot; <kbd>Ctrl</kbd>+<kbd>+</kbd> inserts above
    </div>
    <div ref="itemsContainer" class="items">
      <div v-for="(item, index) in active.items" :key="item.id + '-' + active.version">
        <div
          v-if="item.type === 'heading'"
          class="heading-row"
          :class="{ 'drag-over': dragOverIndex === index }"
          @dragover.prevent="onDragOver(index)"
          @drop.prevent="onDrop(index)"
        >
          <button
            class="drag-handle"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragend="onDragEnd"
          >
            <i class="fa-solid fa-grip" />
          </button>
          <span class="heading-level-badge">H{{ item.headingLevel || 2 }}</span>
          <button
            class="insert-heading-btn"
            title="Click: below · Ctrl+click: above"
            @click.stop="onInsertHeading(index, item.headingLevel, $event)"
          >
            <i class="fa-solid fa-plus" />
          </button>
          <textarea
            class="heading-input"
            :class="'heading-h' + (item.headingLevel || 2)"
            :value="item.text"
            placeholder="Section title"
            rows="1"
            @input="onEditItem(index, $event)"
            @beforeinput="onBeforeInput($event)"
            @keydown="onItemKeydown(index, $event)"
          />
        </div>
        <div
          v-else-if="item.type === 'item'"
          class="item"
          :class="{ done: item.done, 'drag-over': dragOverIndex === index }"
          @dragover.prevent="onDragOver(index)"
          @drop.prevent="onDrop(index)"
        >
          <button
            class="drag-handle"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragend="onDragEnd"
          >
            <i class="fa-solid fa-grip" />
          </button>
          <button
            class="insert-heading-btn"
            title="Click: below · Ctrl+click: above"
            @click.stop="onInsertHeading(index, undefined, $event)"
          >
            <i class="fa-solid fa-plus" />
          </button>
          <button
            class="checkbox"
            :class="{ checked: item.done }"
            @click="active.toggleItem(index)"
          >
            <span v-if="item.done" class="check-icon">&#10003;</span>
          </button>
          <textarea
            class="item-input"
            :value="item.text"
            :placeholder="index === 0 && !item.text ? 'New Doto list' : ''"
            rows="1"
            @input="onEditItem(index, $event)"
            @beforeinput="onBeforeInput($event)"
            @keydown="onItemKeydown(index, $event)"
          />
        </div>
        <div v-else-if="item.type === 'raw'" class="raw-row" />
      </div>
    </div>

    <div class="bottom-bar">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>
      <span class="progress-text">{{ doneCount }} / {{ totalCount }} completed</span>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useTabs } from '../composables/useTabs'
import { parseChecklistContent, syncChecklistNextId } from '../composables/useChecklist'
import { useConfirmDialog } from '../composables/useConfirmDialog'

const { active } = useTabs()
const itemsContainer = ref(null)

let saveTimer = null
let suppressAutoSave = false
let isCheckingExternal = false
let focusTimer = null
let lastSaveType = ref('')

const dragIndex = ref(-1)
const dragOverIndex = ref(-1)

const showHeadingHint = computed(() => {
  if (!active.value || active.value.items.length === 0) return false
  const first = active.value.items[0]
  return first.type === 'item' && !first.text.trim()
})

const totalCount = computed(() =>
  active.value ? active.value.items.filter((i) => i.text.trim() && i.type === 'item').length : 0
)
const doneCount = computed(() =>
  active.value
    ? active.value.items.filter((i) => i.done && i.text.trim() && i.type === 'item').length
    : 0
)
const progressPercent = computed(() =>
  totalCount.value === 0 ? 0 : Math.round((doneCount.value / totalCount.value) * 100)
)

onMounted(() => {
  if (active.value?.saveDir && active.value?.fileMtime) {
    checkExternalChange(active.value)
  }
  window.addEventListener('focus', onWindowFocusDebounced)
})

onUnmounted(() => {
  if (saveTimer) clearTimeout(saveTimer)
  if (focusTimer) clearTimeout(focusTimer)
  window.removeEventListener('focus', onWindowFocusDebounced)
})

let prevFilename = ''

function onFilenameFocus() {
  if (!active.value) return
  prevFilename = active.value.filename
  active.value.filename = active.value.filename.replace(/\.md$/, '')
}

async function onFilenameBlur() {
  if (!active.value) return
  const oldName = prevFilename
  active.value.filename = sanitizeFilename(active.value.filename)
  if (!active.value.filename.endsWith('.md')) {
    active.value.filename += '.md'
  }
  if (active.value.saveDir && oldName && active.value.filename !== oldName) {
    const oldPath = active.value.saveDir + '/' + oldName
    const newPath = active.value.saveDir + '/' + active.value.filename
    const renamed = await window.electronAPI?.renameFile(oldPath, newPath)
    if (!renamed) active.value.filename = oldName
  }
}

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim()
}

async function onSave() {
  if (!active.value) return
  const result = await window.electronAPI?.saveFileDialog(active.value.filename)
  if (!result) return
  active.value.saveDir = result.dir
  await performSave(active.value, 'explicit')
}

async function performSave(tab, saveType = 'auto') {
  if (!tab || !tab.saveDir) return
  const filePath = tab.saveDir + '/' + tab.filename
  if (tab.fileMtime) {
    const mtimeResult = await window.electronAPI?.getFileMtime(filePath)
    if (mtimeResult && mtimeResult.mtimeMs && mtimeResult.mtimeMs > tab.fileMtime) {
      const { showConfirm } = useConfirmDialog()
      const choice = await showConfirm({
        title: 'File Modified Externally',
        message: `"${tab.filename}" was modified outside Doto. What do you want to do?`,
        confirmLabel: 'Save & Overwrite',
        cancelLabel: 'Cancel',
        altLabel: 'Discard & Reload',
        altValue: 'reload',
        icon: 'fa-solid fa-file-circle-exclamation'
      })
      if (choice === 'reload') {
        await reloadTabContent(tab)
        return
      }
      if (!choice) return
    }
  }
  const now = new Date().toISOString()
  if (!tab.createdDate) tab.createdDate = now
  tab.lastModified = now
  const heading = tab.filename.replace(/\.md$/, '')
  const content = tab.toMarkdown(heading)
  const result = await window.electronAPI?.saveFile(content, filePath)
  if (result?.success) {
    tab.markSaved()
    lastSaveType.value = saveType
    if (result.mtimeMs) tab.fileMtime = result.mtimeMs
  } else {
    console.error('Save failed:', result?.error || 'Unknown error')
    const { showConfirm } = useConfirmDialog()
    await showConfirm({
      title: 'Save Failed',
      message: `Could not save "${tab.filename}". Please check disk space and permissions, then try again.`,
      confirmLabel: 'OK',
      hideCancel: true,
      icon: 'fa-solid fa-circle-exclamation'
    })
  }
}

function onWindowFocusDebounced() {
  if (focusTimer) return
  focusTimer = setTimeout(() => {
    focusTimer = null
    const tab = active.value
    if (tab?.saveDir && tab?.fileMtime) {
      checkExternalChange(tab).catch((err) => console.error('External change check failed:', err))
    }
  }, 500)
}

async function checkExternalChange(tab) {
  if (!tab || !tab.saveDir || !tab.fileMtime) return
  if (isCheckingExternal) return
  isCheckingExternal = true
  try {
    const filePath = tab.saveDir + '/' + tab.filename
    const mtimeResult = await window.electronAPI?.getFileMtime(filePath)
    if (mtimeResult && mtimeResult.mtimeMs && mtimeResult.mtimeMs > tab.fileMtime) {
      const { showConfirm } = useConfirmDialog()
      const reload = await showConfirm({
        title: 'File Changed Externally',
        message: `"${tab.filename}" was modified outside Doto. Reload to see the latest changes?`,
        confirmLabel: 'Reload from file',
        cancelLabel: 'Ignore',
        icon: 'fa-solid fa-rotate'
      })
      if (reload) {
        await reloadTabContent(tab)
      }
    }
  } finally {
    isCheckingExternal = false
  }
}

async function reloadTabContent(tab) {
  if (!tab || !tab.saveDir) return
  const filePath = tab.saveDir + '/' + tab.filename
  const result = await window.electronAPI?.readFileByPath(filePath)
  if (!result) return
  suppressAutoSave = true
  tab.items.splice(0, tab.items.length)
  const parsed = parseChecklistContent(result.content)
  parsed.forEach((item) => tab.items.push(item))
  syncChecklistNextId(parsed.reduce((max, i) => Math.max(max, i.id || 0), 0))
  tab.fileMtime = result.mtimeMs
  tab.isSaved = true
  await nextTick()
  suppressAutoSave = false
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const tab = active.value
    if (!tab || !tab.saveDir) return
    performSave(tab).catch((err) => console.error('Auto-save failed:', err))
  }, 500)
}

watch(
  () => active.value?.items,
  () => {
    if (suppressAutoSave) return
    if (active.value?.saveDir) scheduleSave()
    nextTick(() => {
      if (!itemsContainer.value) return
      itemsContainer.value.querySelectorAll('textarea').forEach(autoResize)
    })
  },
  { deep: true }
)

watch(active, (newTab) => {
  if (newTab?.saveDir && newTab?.fileMtime) {
    checkExternalChange(newTab)
  }
})

function onBeforeInput(e) {
  if (e.inputType === 'historyUndo') {
    e.preventDefault()
    active.value?.undo()
    return
  }
  if (e.inputType === 'historyRedo') {
    e.preventDefault()
    active.value?.redo()
    return
  }
}

function onEditItem(index, event) {
  if (!active.value) return
  const newText = event.target.value
  active.value.onItemTextChanging(newText)
  const item = active.value.items[index]
  if (!item) return
  if (item.text !== newText) {
    const replaced = newText.replace(/\{today\}/g, () => {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })
    item.text = replaced
    if (replaced !== newText) {
      event.target.value = replaced
    }
  } else {
    item.text = newText
  }
  if (item.type === 'item' && !item.text.trim()) {
    item.done = false
  }
  autoResize(event.target)
}

function onItemKeydown(index, event) {
  if (!active.value) return
  const { key, shiftKey, altKey, target } = event
  const val = target.value
  const cursor = target.selectionStart
  const items = active.value.items

  if (altKey) {
    if (key === 'b') {
      event.preventDefault()
      onInsertHeading(index, undefined, { ctrlKey: false })
      return
    }
    if (key === 'a') {
      event.preventDefault()
      onInsertHeading(index, undefined, { ctrlKey: true })
      return
    }
  }

  if (key === 'Enter' && !shiftKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    if (val.trim()) {
      active.value.addBlankItem(index)
      nextTick(() => focusItem(index + 1))
    }
    return
  }

  if ((key === 'Backspace' || key === 'Delete') && !shiftKey) {
    if (val.trim() === '' && (items.length > 1 || items[index]?.type === 'heading')) {
      event.preventDefault()
      active.value.removeItem(index)
      if (active.value.items.length === 0) active.value.addBlankItem()
      const focusIndex = Math.min(index, active.value.items.length - 1)
      nextTick(() => focusItem(focusIndex))
      return
    }
  }

  if (key === 'ArrowUp' && !shiftKey) {
    const atStart = cursor === 0
    const isEmpty = val.trim() === ''
    if (atStart || isEmpty) {
      event.preventDefault()
      focusItem(index - 1)
    }
    return
  }

  if (key === 'ArrowDown' && !shiftKey) {
    const atEnd = cursor === val.length
    if (atEnd && index === items.length - 1) return
    if (atEnd || val.trim() === '') {
      event.preventDefault()
      focusItem(index + 1)
    }
    return
  }

  if (key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    const item = items[index]
    if (item && item.type !== 'heading' && item.text.trim()) {
      item.done = !item.done
    }
    return
  }

  if (key === 'Tab') {
    const item = items[index]
    if (item && item.type === 'heading') {
      event.preventDefault()
      if (shiftKey) {
        active.value.promoteHeading(index)
      } else {
        active.value.demoteHeading(index)
      }
    }
    return
  }
}

function autoResize(textarea) {
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

function onInsertHeading(index, headingLevel, e) {
  if (!active.value) return
  const level = headingLevel ? Math.min(6, (headingLevel || 2) + 1) : nearestHeadingLevel(index)
  const above = e?.ctrlKey || e?.metaKey
  const insertAt = above ? index : index + 1
  active.value.insertHeadingAt(insertAt, level)
  nextTick(() => focusItem(insertAt))
}

function nearestHeadingLevel(index) {
  const items = active.value.items
  for (let i = index; i >= 0; i--) {
    if (items[i].type === 'heading') {
      return Math.min(6, (items[i].headingLevel || 2) + 1)
    }
  }
  return 2
}

function focusItem(index) {
  if (!active.value || index < 0 || index >= active.value.items.length) return
  nextTick(() => {
    if (!itemsContainer.value) return
    const textareas = itemsContainer.value.querySelectorAll('textarea')
    if (textareas[index]) {
      textareas[index].focus()
      const len = textareas[index].value.length
      textareas[index].setSelectionRange(len, len)
    }
  })
}

function onDragStart(index) {
  dragIndex.value = index
}

function onDragOver(index) {
  if (dragIndex.value === -1 || dragIndex.value === index) return
  dragOverIndex.value = index
}

function onDrop(index) {
  if (dragIndex.value === -1 || dragIndex.value === index) return
  active.value.snap()
  const items = active.value.items
  const [moved] = items.splice(dragIndex.value, 1)
  items.splice(index, 0, moved)
  active.value.isSaved = false
  dragIndex.value = -1
  dragOverIndex.value = -1
}

function onDragEnd() {
  dragIndex.value = -1
  dragOverIndex.value = -1
}
</script>

<style scoped>
.checklist {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 100%;
  max-width: var(--max-content-width);
  height: 100%;
}

.filename-bar {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-xl);
  border-bottom: 1px solid var(--border);
  padding-bottom: var(--pad-xl);
}

.filename-input {
  flex: 1;
  outline: none;
  border: none;
  background: transparent;
  padding: var(--pad-xs) 0;
  color: var(--text-dim);
  font-size: var(--font-size-md);
  font-family: var(--font-mono);
}

.filename-input:focus {
  color: var(--text);
}

.save-label {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
}

.saved-text {
  color: var(--accent);
}

.unsaved-text {
  color: var(--unsaved);
}

.save-btn {
  transition: all var(--transition-fast);
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: transparent;
  padding: var(--pad-xs) var(--pad-2xl);
  color: var(--text-dim);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
}

.save-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.heading-hint {
  opacity: 0.5;
  padding: 0 0 var(--pad-xl);
  color: var(--unsaved);
  font-size: var(--font-size-xs);
  line-height: var(--line-height);
}
[data-theme='light'] .heading-hint {
  color: var(--text);
}

.heading-hint kbd {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-hover);
  padding: 0 3px;
  font-weight: 800;
  font-size: 9px;
  font-family: var(--font-mono);
}

.items {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--item-gap);
  padding: 0;
  font-size: var(--editor-font-size);
}

.item.done .item-input {
  color: var(--text-dim);
  text-decoration: line-through;
}

.checkbox {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: 2px solid var(--text-dim);
  border-radius: 0.15em;
  background: transparent;
  padding: 0;
  width: 1em;
  min-width: 1em;
  height: 1em;
  font-size: inherit;
}

.checkbox:hover {
  border-color: var(--accent);
}

.checkbox.checked {
  border-color: var(--accent-checked);
  background: var(--accent-checked);
}

.check-icon {
  color: var(--bg);
  font-weight: bold;
  font-size: 0.7em;
}

.item-input {
  flex: 1;
  outline: none;
  border: none;
  background: transparent;
  padding: var(--pad-md) 0;
  overflow: hidden;
  resize: none;
  color: var(--text);
  font-size: var(--editor-font-size);
  line-height: var(--line-height);
  font-family: inherit;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.heading-row {
  display: flex;
  align-items: center;
  gap: var(--item-gap);
  margin-top: calc(var(--gap-xl) - 8px);
  margin-bottom: var(--gap-sm);
  border-bottom: 1px solid var(--border);
  padding: var(--item-padding-y) 0;
  font-size: var(--editor-font-size);
}

.heading-level-badge {
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  padding: 0 4px;
  min-width: 16px;
  height: 14px;
  color: var(--accent);
  font-weight: 900;
  font-size: 9px;
  line-height: 14px;
  user-select: none;
  text-align: center;
}

.heading-input {
  flex: 1;
  outline: none;
  border: none;
  background: transparent;
  padding: var(--pad-md) 0;
  overflow: hidden;
  resize: none;
  color: var(--text);
  line-height: var(--line-height);
  font-family: inherit;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.heading-h2 {
  font-weight: 700;
  font-size: 16px;
}
.heading-h3 {
  font-weight: 700;
  font-size: 15px;
}
.heading-h4 {
  font-weight: 600;
  font-size: 14px;
}
.heading-h5 {
  font-weight: 600;
  font-size: 13px;
}
.heading-h6 {
  font-weight: 400;
  font-size: 12px;
}

.raw-row {
  display: none;
}

.insert-heading-btn {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
  cursor: pointer;
  border: none;
  border-radius: 50%;
  background: transparent;
  padding: 0;
  width: 20px;
  min-width: 20px;
  height: 20px;
  color: var(--accent);
  font-size: 11px;
}

.heading-row:hover .insert-heading-btn,
.item:hover .insert-heading-btn {
  opacity: 0.6;
}

.insert-heading-btn:hover {
  opacity: 1 !important;
  background: color-mix(in srgb, var(--accent) 30%, transparent);
}

.insert-heading-btn .fa-solid {
  margin-bottom: 0;
  font-weight: 900;
  font-size: 13px;
}

.bottom-bar {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  margin-top: var(--gap-sm);
  border-top: 1px solid var(--border);
  padding-top: var(--pad-3xl);
}

.progress-bar {
  flex: 1;
  border-radius: var(--radius-sm);
  background: var(--surface-hover);
  height: var(--progress-height);
  overflow: hidden;
}

.progress-fill {
  transition: width var(--transition-normal) ease;
  border-radius: var(--radius-sm);
  background: var(--accent);
  height: 100%;
}

.progress-text {
  color: var(--text-dim);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

.drag-handle {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
  cursor: grab;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  padding: 0;
  width: 20px;
  min-width: 20px;
  height: 20px;
  color: var(--text-dim);
  font-size: 12px;
}

.drag-handle:active {
  cursor: grabbing;
}

.heading-row:hover .drag-handle,
.item:hover .drag-handle {
  opacity: 0.5;
}

.drag-handle:hover {
  opacity: 1 !important;
  background: var(--surface-hover);
}

.heading-row.drag-over,
.item.drag-over {
  border-top: 2px solid var(--accent);
}
</style>
