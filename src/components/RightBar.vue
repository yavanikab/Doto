<template>
  <div ref="barRef" class="right-bar">
    <div class="bar-item">
      <button
        class="bar-btn"
        :class="{ active: activePopup === 'info' }"
        title="File info"
        @click="openPopup('info')"
      >
        <i class="fa-solid fa-circle-info" />
      </button>
      <InfoPopup v-if="activePopup === 'info'" :tab="tab" class="bar-popup" />
    </div>
    <div class="bar-item">
      <button
        class="bar-btn"
        :class="{ active: activePopup === 'settings' }"
        title="File settings"
        @click="openPopup('settings')"
      >
        <i class="fa-solid fa-sliders" />
      </button>
      <FileSettingsPopup
        v-if="activePopup === 'settings'"
        :tab="tab"
        class="bar-popup"
        @close="activePopup = null"
      />
    </div>
    <div v-if="tab?.type === 'notes'" class="bar-item">
      <button
        class="bar-btn"
        :class="{ active: activePopup === 'markdown' }"
        title="Markdown formatting"
        @click="openPopup('markdown')"
      >
        <i class="fa-solid fa-code" />
      </button>
      <MarkdownPopup v-if="activePopup === 'markdown'" class="bar-popup" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import InfoPopup from './InfoPopup.vue'
import FileSettingsPopup from './FileSettingsPopup.vue'
import MarkdownPopup from './MarkdownPopup.vue'

defineProps({
  tab: { type: Object, required: true }
})

const activePopup = ref(null)
const barRef = ref(null)

function openPopup(name) {
  activePopup.value = activePopup.value === name ? null : name
}

function onClickOutside(e) {
  if (barRef.value && !barRef.value.contains(e.target)) {
    activePopup.value = null
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') activePopup.value = null
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.right-bar {
  width: 35px;
  min-width: 20px;
  height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--pad-3xl) 0;
  gap: var(--gap-xs);
}

.bar-item {
  position: relative;
}

.bar-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all var(--transition-fast);
}

.bar-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.bar-btn.active {
  background: var(--surface-raised);
  color: var(--accent);
}

.bar-popup {
  position: absolute;
  right: 100%;
  top: 0;
  margin-right: 8px;
}
</style>
