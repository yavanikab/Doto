<template>
  <div class="title-bar">
    <div class="drag-area">
      <span class="app-name">Doto</span>
      <span class="pipe">|</span>
    </div>
    <div class="tab-list">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: i === activeIndex }"
        @click="switchTab(i)"
      >
        <i
          v-if="tab.type === 'checklist'"
          class="fa-solid fa-clipboard-check tab-type-icon"
          style="color: var(--checklist-color)"
        />
        <i
          v-else-if="tab.type === 'notes'"
          class="fa-solid fa-file-lines tab-type-icon"
          style="color: var(--notes-color)"
        />
        <span class="tab-dot" :class="{ saved: tab.isSaved, unsaved: !tab.isSaved }" />
        <span class="tab-label">{{ truncateName(tab.filename) }}</span>
        <span class="tab-close" title="Close" @click.stop="closeTab(i)">&#x2715;</span>
      </button>
    </div>
    <button class="add-tab" title="New file" @click="onAddTab">
      <i class="fa-solid fa-square-plus" />
    </button>
    <div class="title-bar-controls">
      <button class="control-btn minimize" title="Minimize" @click="minimize">&#x2014;</button>
      <button class="control-btn close" title="Close" @click="close">&#x2715;</button>
    </div>
  </div>
</template>

<script setup>
import { useTabs } from '../composables/useTabs'

const { tabs, activeIndex, truncateName, switchTab, closeTab, createTab } = useTabs()

function minimize() {
  window.electronAPI?.minimizeWindow()
}

function close() {
  window.electronAPI?.closeWindow()
}

function onAddTab() {
  createTab()
}
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  height: var(--titlebar-height);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  -webkit-app-region: drag;
  user-select: none;
  flex-shrink: 0;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.drag-area {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: 0 var(--pad-3xl) 0 var(--pad-3xl);
  flex-shrink: 0;
  height: 100%;
  cursor: grab;
}

.app-name {
  font-family: 'Space Mono', var(--font-family);
  font-size: var(--font-size-md);
  color: var(--text);
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.pipe {
  color: var(--border-light);
  font-size: var(--font-size-md);
  flex-shrink: 0;
}

.tab-list {
  display: flex;
  align-items: center;
  gap: 1px;
  overflow: hidden;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.tab {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: var(--font-size-sm);
  padding: var(--pad-sm) var(--pad-sm) var(--pad-sm) var(--pad-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-family);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
  -webkit-app-region: no-drag;
  min-width: 0;
  overflow: hidden;
  max-width: 110px;
}

.tab:hover {
  color: var(--text);
  background: var(--surface-hover);
}

.tab.active {
  color: var(--text);
  background: var(--surface-hover);
}

.tab-dot {
  display: inline-block;
  width: var(--tab-dot-size);
  height: var(--tab-dot-size);
  border-radius: 50%;
  flex-shrink: 0;
}

.tab-dot.unsaved {
  background: var(--unsaved);
}

.tab-dot.saved {
  background: var(--accent);
}

.tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
  font-family: var(--font-mono);
}

.tab-type-icon {
  font-size: 11px;
  width: 14px;
  flex-shrink: 0;
}

.tab-close {
  font-size: var(--tab-close-size);
  color: var(--text-dim);
  padding: 1px 2px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  opacity: 0;
}

.tab:hover .tab-close,
.tab.active .tab-close {
  opacity: 1;
}

.tab-close:hover {
  color: var(--close-danger);
  background: color-mix(in srgb, var(--close-danger) 15%, transparent);
}

.add-tab {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 20px;
  font-weight: 600;
  padding: 0 var(--pad-2xl);
  cursor: pointer;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
  height: 100%;
  display: flex;
  align-items: center;
  transition: all var(--transition-fast);
  line-height: 1;
}

.add-tab:hover {
  color: var(--accent);
}

.title-bar-controls {
  display: flex;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
}

.control-btn {
  width: var(--control-btn-width);
  height: var(--control-btn-height);
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-size: var(--font-size-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}

.control-btn:hover {
  background: var(--border);
  color: var(--text);
}

.control-btn.close:hover {
  background: var(--close-danger);
  color: var(--text-white);
}
</style>
