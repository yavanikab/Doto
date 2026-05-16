<template>
  <div class="markdown-body" @click="onLinkClick" v-html="rendered" />
</template>

<script setup>
import { computed } from 'vue'
// eslint-disable-next-line vue/no-v-html
import { marked } from 'marked'

const props = defineProps({
  content: { type: String, default: '' }
})

function sanitize(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
}

const rendered = computed(() => {
  if (!props.content) return ''
  const html = marked.parse(props.content, { gfm: true })
  return sanitize(html)
})

function onLinkClick(e) {
  const link = e.target.closest('a')
  if (!link) return
  e.preventDefault()
  const href = link.getAttribute('href')
  if (href && /^https?:\/\//.test(href)) {
    window.electronAPI?.openExternal(href)
  }
}
</script>

<style scoped>
.markdown-body {
  line-height: 1.7;
  color: var(--text);
  font-size: var(--editor-font-size);
}

.markdown-body :deep(h1) {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.markdown-body :deep(h2) {
  font-size: 17px;
  font-weight: 600;
  color: var(--checklist-color);
  margin: 20px 0 8px;
}

.markdown-body :deep(h3) {
  font-size: 15px;
  font-weight: 600;
  color: var(--notes-color);
  margin: 16px 0 6px;
}

.markdown-body :deep(h4) {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dim);
  margin: 14px 0 4px;
}

.markdown-body :deep(p) {
  margin: 0 0 10px;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: var(--text);
}

.markdown-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: color-mix(in srgb, var(--text-danger) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--text-danger) 25%, transparent);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--text-danger);
}

.markdown-body :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  border-radius: 0;
  color: var(--text);
}

.markdown-body :deep(pre) {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 10px 12px;
  overflow-x: auto;
  margin: 8px 0 12px;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text);
  font-size: 12px;
  line-height: 1.5;
}

.markdown-body :deep(ul) {
  margin: 4px 0 10px;
  padding-left: 20px;
  list-style: none;
}

.markdown-body :deep(ol) {
  margin: 4px 0 10px;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin: 3px 0;
  position: relative;
  padding-left: 6px;
}

.markdown-body :deep(ul > li::before) {
  content: '–';
  color: var(--text-dim);
  position: absolute;
  left: -14px;
}

.markdown-body :deep(a) {
  color: var(--link-color);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 16px 0;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid var(--accent);
  padding-left: 12px;
  color: var(--text-dim);
  margin: 8px 0;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0 12px;
  font-size: var(--font-size-sm);
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border);
  padding: 6px 10px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: var(--surface);
  font-weight: 600;
  color: var(--text);
}

.markdown-body :deep(td) {
  color: var(--text-dim);
}

.markdown-body :deep(input[type='checkbox']) {
  width: 14px;
  height: 14px;
  accent-color: var(--accent);
  cursor: default;
  margin-right: 6px;
  vertical-align: middle;
}

.markdown-body :deep(li:has(input[type='checkbox'])) {
  display: flex;
  align-items: center;
  padding-left: 0;
}

.markdown-body :deep(li:has(input[type='checkbox'])::before) {
  display: none;
}
</style>
