import { ref } from 'vue'

let nextId = 1

export function syncChecklistNextId(minId) {
  if (minId >= nextId) nextId = minId + 1
}

export function parseChecklistContent(content) {
  const items = []
  const lines = content.split('\n')
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (i === 0) line = line.replace(/^\uFEFF/, '')
    line = line.replace(/\r$/, '')
    const itemMatch = line.match(/^- \[( |x)\] (.+)$/i)
    if (itemMatch) {
      items.push({
        id: nextId++,
        text: itemMatch[2],
        done: itemMatch[1] === 'x' || itemMatch[1] === 'X',
        type: 'item'
      })
      continue
    }
    const headingMatch = line.match(/^(#{2,6})\s+(.+)$/)
    if (headingMatch) {
      items.push({
        id: nextId++,
        text: headingMatch[2],
        done: false,
        type: 'heading',
        headingLevel: headingMatch[1].length
      })
      continue
    }
    items.push({ id: nextId++, type: 'raw', text: line })
  }
  return items
}

export function useChecklist() {
  const items = ref([])
  const isSaved = ref(true)
  const undoStack = ref([])
  const redoStack = ref([])
  const version = ref(0)

  function snap() {
    undoStack.value.push(JSON.stringify(items.value))
    if (undoStack.value.length > 50) undoStack.value.shift()
    redoStack.value = []
  }

  function undo() {
    if (!undoStack.value.length) return
    redoStack.value.push(JSON.stringify(items.value))
    if (redoStack.value.length > 50) redoStack.value.shift()
    items.value = JSON.parse(undoStack.value.pop())
    isSaved.value = false
    version.value++
  }

  function redo() {
    if (!redoStack.value.length) return
    undoStack.value.push(JSON.stringify(items.value))
    if (undoStack.value.length > 50) undoStack.value.shift()
    items.value = JSON.parse(redoStack.value.pop())
    isSaved.value = false
    version.value++
  }

  let textHadContent = false

  function onItemTextChanging(newText) {
    if (!textHadContent) {
      snap()
      textHadContent = true
    } else if (newText.endsWith(' ') && newText.trim().length > 0 && newText !== ' ') snap()
  }

  function addItem(text) {
    snap()
    const trimmed = text.trim()
    if (!trimmed) return
    items.value.push({ id: nextId++, text: trimmed, done: false, type: 'item' })
    isSaved.value = false
  }

  function addBlankItem(afterIndex) {
    snap()
    const item = { id: nextId++, text: '', done: false, type: 'item' }
    if (afterIndex !== undefined && afterIndex >= 0) {
      items.value.splice(afterIndex + 1, 0, item)
    } else {
      items.value.push(item)
    }
    isSaved.value = false
  }

  function insertHeadingAt(index, level = 2) {
    snap()
    items.value.splice(index, 0, {
      id: nextId++,
      text: '',
      done: false,
      type: 'heading',
      headingLevel: Math.max(2, Math.min(6, level))
    })
    isSaved.value = false
  }

  function promoteHeading(index) {
    snap()
    const item = items.value[index]
    if (item && item.type === 'heading') {
      item.headingLevel = Math.max(2, (item.headingLevel || 2) - 1)
      isSaved.value = false
    }
  }

  function demoteHeading(index) {
    snap()
    const item = items.value[index]
    if (item && item.type === 'heading') {
      item.headingLevel = Math.min(6, (item.headingLevel || 2) + 1)
      isSaved.value = false
    }
  }

  function toggleItem(index) {
    snap()
    if (index >= 0 && index < items.value.length) {
      const item = items.value[index]
      if (item.type !== 'item' || !item.text.trim()) return
      item.done = !item.done
      isSaved.value = false
    }
  }

  function removeItem(index) {
    snap()
    if (index >= 0 && index < items.value.length) {
      items.value.splice(index, 1)
      isSaved.value = false
    }
  }

  function markSaved() {
    isSaved.value = true
  }

  function selectAll() {
    snap()
    items.value.forEach((item) => {
      if (item.type === 'item') item.done = true
    })
    isSaved.value = false
  }

  function selectNone() {
    snap()
    items.value.forEach((item) => {
      if (item.type === 'item') item.done = false
    })
    isSaved.value = false
  }

  function clearAll() {
    snap()
    items.value = [{ id: nextId++, text: '', done: false, type: 'item' }]
    isSaved.value = false
  }

  function toMarkdown(heading) {
    const lines = items.value
      .map((item) => {
        if (item.type === 'heading') {
          const level = item.headingLevel || 2
          return `${'#'.repeat(level)} ${item.text}`
        }
        if (item.type === 'raw') {
          return item.text
        }
        return `- [${item.done ? 'x' : ' '}] ${item.text}`
      })
      .join('\n')
    if (heading) {
      const expected = `# ${heading}`
      const first = items.value[0]
      const alreadyPresent = first && first.type === 'raw' && first.text === expected
      if (alreadyPresent) return lines
      return `# ${heading}\n\n${lines}`
    }
    return lines
  }

  return {
    items,
    isSaved,
    snap,
    undo,
    redo,
    onItemTextChanging,
    version,
    addItem,
    addBlankItem,
    insertHeadingAt,
    promoteHeading,
    demoteHeading,
    toggleItem,
    removeItem,
    markSaved,
    selectAll,
    selectNone,
    clearAll,
    toMarkdown
  }
}
