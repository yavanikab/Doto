<template>
  <div class="info-menu">
    <div class="info-line">
      <span class="info-label">File</span>
      <span class="info-value">{{ tab?.filename }}</span>
    </div>
    <div class="info-line">
      <span class="info-label">Created</span>
      <span class="info-value">{{ formatDate(tab?.createdDate) }}</span>
    </div>
    <div class="info-line">
      <span class="info-label">Modified</span>
      <span class="info-value">{{ formatDate(tab?.lastModified) }}</span>
    </div>
    <div class="info-sep" />
    <div class="info-line">
      <span class="info-label">Chars</span>
      <span class="info-value">{{ charCount }}</span>
    </div>
    <div class="info-line">
      <span class="info-label">Words</span>
      <span class="info-value">{{ wordCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tab: { type: Object, required: true }
})

const charCount = computed(() => {
  if (!props.tab) return 0
  if (props.tab.type === 'notes') return props.tab.content?.length || 0
  return props.tab.items?.reduce((sum, i) => sum + i.text.length, 0) || 0
})

function formatDate(iso) {
  if (!iso) return 'Not saved yet'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const wordCount = computed(() => {
  if (!props.tab) return 0
  if (props.tab.type === 'notes') {
    const words = (props.tab.content || '').trim().split(/\s+/)
    return words[0] === '' ? 0 : words.length
  }
  return (
    props.tab.items?.reduce((sum, i) => {
      const words = i.text.trim().split(/\s+/)
      return sum + (words[0] === '' ? 0 : words.length)
    }, 0) || 0
  )
})
</script>

<style scoped>
.info-menu {
  min-width: 200px;
  padding: var(--pad-lg) var(--pad-3xl);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  z-index: 1000;
  user-select: none;
}

.info-line {
  display: flex;
  justify-content: space-between;
  gap: var(--gap-lg);
  font-size: var(--font-size-sm);
  padding: var(--pad-xs) 0;
}

.info-label {
  color: var(--text-dim);
}

.info-value {
  color: var(--text);
  text-align: right;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-sep {
  height: 1px;
  background: var(--border);
  margin: var(--pad-sm) 0;
}
</style>
