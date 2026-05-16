import { ref } from 'vue'

export function useNote() {
  const content = ref('')
  const isSaved = ref(true)
  const undoStack = ref([])
  const redoStack = ref([])
  const version = ref(0)

  function snap() {
    undoStack.value.push(content.value)
    if (undoStack.value.length > 50) undoStack.value.shift()
    redoStack.value = []
  }

  function undo() {
    if (!undoStack.value.length) return
    redoStack.value.push(content.value)
    if (redoStack.value.length > 50) redoStack.value.shift()
    content.value = undoStack.value.pop()
    isSaved.value = false
    version.value++
  }

  function redo() {
    if (!redoStack.value.length) return
    undoStack.value.push(content.value)
    if (undoStack.value.length > 50) undoStack.value.shift()
    content.value = redoStack.value.pop()
    isSaved.value = false
    version.value++
  }

  function setContent(text) {
    if (typeof text !== 'string') return
    content.value = text
    isSaved.value = false
    redoStack.value = []
  }

  function markSaved() {
    isSaved.value = true
  }

  function toText() {
    return content.value
  }

  return { content, isSaved, undo, redo, snap, version, setContent, markSaved, toText }
}
