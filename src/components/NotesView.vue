<template>
  <div class="notes-view" :class="{ locked: tab?.locked, 'welcome-note': tab?.isWelcomeNote }">
    <div class="filename-bar" :class="{ disabled: tab?.isWelcomeNote }">
      <input
        v-model="active.filename"
        class="filename-input"
        type="text"
        placeholder="note.md"
        maxlength="50"
        :disabled="tab?.isWelcomeNote"
        @focus="onFilenameFocus"
        @blur="onFilenameBlur"
      />
      <span class="save-label">
        <span v-if="active.isSaved" class="saved-text">Saved</span>
        <span v-else class="unsaved-text">Unsaved</span>
      </span>
      <button class="save-btn" :disabled="tab?.isWelcomeNote" @click="onSave">
        <span v-if="!active.saveDir">Save</span>
        <span v-else>Save As</span>
      </button>
    </div>

    <textarea
      v-if="!showPreview && !tab?.locked && !tab?.isWelcomeNote"
      ref="textareaRef"
      v-model="localContent"
      class="note-textarea"
      placeholder="Write your Doto note..."
      @input="onInput"
    />

    <MarkdownRender
      v-if="showPreview || tab?.locked || tab?.isWelcomeNote"
      :content="tab?.content || ''"
      class="note-preview"
      :class="{ 'no-copy': tab?.isWelcomeNote }"
    />

    <div v-if="!tab?.locked && !tab?.isWelcomeNote" class="notes-toolbar">
      <button
        class="toolbar-btn"
        :class="{ active: showPreview }"
        @click="showPreview = !showPreview"
      >
        <i :class="showPreview ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
        {{ showPreview ? 'Edit' : 'Preview' }}
      </button>
      <span class="char-count">{{ charCount }} chars · {{ wordCount }} words</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import MarkdownRender from './MarkdownRender.vue'
import { useTabs } from '../composables/useTabs'

const { active } = useTabs()

const props = defineProps({
  tab: { type: Object, required: true }
})

const textareaRef = ref(null)
const showPreview = ref(false)
const localContent = ref('')
let saveTimer = null

function preventCopy(e) {
  if (props.tab?.isWelcomeNote) {
    e.preventDefault()
    e.stopPropagation()
  }
}

watch(
  () => props.tab?.content,
  (val) => {
    localContent.value = val || ''
  },
  { immediate: true }
)

function onInput() {
  if (props.tab) {
    props.tab.content = localContent.value
    props.tab.isSaved = false
    scheduleSave()
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (props.tab?.saveDir) {
      performSave()
    }
  }, 500)
}

async function performSave() {
  if (!props.tab || !props.tab.saveDir) return
  const filePath = props.tab.saveDir + '/' + props.tab.filename
  const content = '<!-- doto:note -->\n' + props.tab.content
  const result = await window.electronAPI?.saveFile(content, filePath)
  if (result?.success) {
    props.tab.markSaved()
    if (result.mtimeMs) props.tab.fileMtime = result.mtimeMs
  } else {
    console.error('Save failed:', result?.error || 'Unknown error')
    // Note: we don't show dialog here since this is auto-save context
    // The file will remain marked as unsaved and retry on next change
  }
}

async function onSave() {
  if (!props.tab) return
  const result = await window.electronAPI?.saveFileDialog(props.tab.filename)
  if (!result) return
  props.tab.saveDir = result.dir
  await performSave()
}

let prevFilename = ''

function onFilenameFocus() {
  if (!props.tab) return
  prevFilename = props.tab.filename
  props.tab.filename = props.tab.filename.replace(/\.md$/, '')
}

async function onFilenameBlur() {
  if (!props.tab) return
  const oldName = prevFilename
  props.tab.filename = sanitizeFilename(props.tab.filename)
  if (!props.tab.filename.endsWith('.md')) {
    props.tab.filename += '.md'
  }
  if (props.tab.saveDir && oldName && props.tab.filename !== oldName) {
    const oldPath = props.tab.saveDir + '/' + oldName
    const newPath = props.tab.saveDir + '/' + props.tab.filename
    const renamed = await window.electronAPI?.renameFile(oldPath, newPath)
    if (!renamed) props.tab.filename = oldName
  }
}

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').trim()
}

const charCount = computed(() => localContent.value?.length || 0)
const wordCount = computed(() => {
  const words = (localContent.value || '').trim().split(/\s+/)
  return words[0] === '' ? 0 : words.length
})

function onGlobalKeydown(e) {
  if (e.altKey && e.key === 'p') {
    e.preventDefault()
    if (!props.tab?.locked && !props.tab?.isWelcomeNote) {
      showPreview.value = !showPreview.value
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKeydown)
  if (props.tab?.isWelcomeNote) {
    const previewEl = document.querySelector('.note-preview.no-copy')
    if (previewEl) {
      previewEl.addEventListener('contextmenu', preventCopy)
      previewEl.addEventListener('copy', preventCopy)
      previewEl.addEventListener('cut', preventCopy)
    }
  }
  if (!props.tab?.locked && !showPreview.value && !props.tab?.isWelcomeNote) {
    nextTick(() => textareaRef.value?.focus())
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onGlobalKeydown)
  if (saveTimer) clearTimeout(saveTimer)
  if (props.tab?.isWelcomeNote) {
    const previewEl = document.querySelector('.note-preview.no-copy')
    if (previewEl) {
      previewEl.removeEventListener('contextmenu', preventCopy)
      previewEl.removeEventListener('copy', preventCopy)
      previewEl.removeEventListener('cut', preventCopy)
    }
  }
})
</script>

<style scoped>
.notes-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.notes-view.locked {
  opacity: 0.65;
  pointer-events: none;
}

.filename-bar {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-xl);
  border-bottom: 1px solid var(--border);
  padding-bottom: var(--pad-xl);
  user-select: none;
  -webkit-user-select: none;
}

.filename-bar.disabled {
  opacity: 0.5;
  pointer-events: none;
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

.filename-input:disabled {
  cursor: default;
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

.save-btn:disabled {
  cursor: default;
  opacity: 0.5;
}

.save-btn:disabled:hover {
  border-color: var(--border);
  color: var(--text-dim);
}

.note-textarea {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: var(--editor-font-size);
  line-height: var(--line-height);
  font-family: var(--font-family);
  resize: none;
  padding: var(--pad-xl) 0;
}

.note-textarea::placeholder {
  color: var(--text-dim);
  opacity: 0.5;
}

.note-preview {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--pad-xl) 0;
}

.notes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--pad-xs) 0;
  border-top: 1px solid var(--border);
  font-size: var(--font-size-sm);
  user-select: none;
  -webkit-user-select: none;
}

.toolbar-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-fast);
}

.toolbar-btn:hover {
  color: var(--text);
  border-color: var(--accent);
}

.toolbar-btn.active {
  color: var(--accent);
  border-color: var(--accent);
}

.char-count {
  color: var(--text-dim);
}
</style>
