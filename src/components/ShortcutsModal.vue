<template>
  <Teleport to="body">
    <div class="shortcuts-overlay" @click.self="$emit('close')">
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="close-btn" title="Close" @click="$emit('close')">&times;</button>
        </div>
        <div class="shortcuts-body">
          <div class="featured-section">
            <div class="featured-badge">DOTO SPECIFIC</div>
            <div class="featured-grid">
              <div class="featured-col">
                <h3>Navigation</h3>
                <div class="row"><kbd>Ctrl+N</kbd><span>New checklist</span></div>
                <div class="row"><kbd>Ctrl+Shift+N</kbd><span>New note</span></div>
                <div class="row"><kbd>Ctrl+O</kbd><span>Open file</span></div>
                <div class="row"><kbd>Ctrl+W</kbd><span>Close tab</span></div>
                <div class="row"><kbd>Ctrl+Shift+W</kbd><span>Close all tabs</span></div>
                <div class="row"><kbd>Ctrl+Tab</kbd><span>Next tab</span></div>
                <div class="row"><kbd>Ctrl+Shift+Tab</kbd><span>Previous tab</span></div>
                <div class="row"><kbd>Ctrl+F</kbd><span>Search files</span></div>
                <div class="row"><kbd>F2</kbd><span>Rename file</span></div>
              </div>
              <div class="featured-col">
                <h3>Saving &amp; File</h3>
                <div class="row"><kbd>Ctrl+S</kbd><span>Save</span></div>
                <div class="row"><kbd>Ctrl+Shift+S</kbd><span>Save As</span></div>
                <div class="row"><kbd>Ctrl+D</kbd><span>Duplicate tab</span></div>
                <div class="row"><kbd>Ctrl+Shift+D</kbd><span>Close tab (skip prompt)</span></div>
                <div class="row"><kbd>Ctrl+Shift+E</kbd><span>Export all as ZIP</span></div>
                <div class="row"><kbd>F5</kbd><span>Refresh window</span></div>
                <div class="row"><kbd>Escape</kbd><span>Close modal / cancel</span></div>
              </div>
            </div>
            <div class="featured-divider" />
            <h3 class="featured-subhead">Checklist</h3>
            <div class="checklist-grid">
              <div class="row"><kbd>Enter</kbd><span>Add item below</span></div>
              <div class="row"><kbd>Ctrl+Enter</kbd><span>Toggle done/undone</span></div>
              <div class="row"><kbd>Alt+B</kbd><span>Insert heading below</span></div>
              <div class="row"><kbd>Alt+A</kbd><span>Insert heading above</span></div>
              <div class="row"><kbd>Tab / Shift+Tab</kbd><span>Demote / Promote heading</span></div>
              <div class="row"><kbd>Backspace / Delete</kbd><span>Remove empty item</span></div>
              <div class="row"><kbd>↑ / ↓</kbd><span>Navigate items</span></div>
            </div>
            <div class="featured-divider" />
            <h3 class="featured-subhead">Notes</h3>
            <div class="checklist-grid">
              <div class="row"><kbd>Alt+P</kbd><span>Toggle preview / edit</span></div>
            </div>
          </div>
        </div>
        <button class="close-bottom" @click="$emit('close')">Got it</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
const emit = defineEmits(['close'])
function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.shortcuts-overlay {
  display: flex;
  position: fixed;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  inset: 0;
  background: color-mix(in srgb, var(--bg) 72%, transparent);
}
.shortcuts-modal {
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  width: 540px;
  max-width: 92vw;
  max-height: 90vh;
}
.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: var(--pad-lg) var(--pad-xl);
}
.shortcuts-header h2 {
  margin: 0;
  color: var(--text);
  font-weight: 700;
  font-size: 18px;
}
.close-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  width: 28px;
  height: 28px;
  color: var(--text-dim);
  font-size: 22px;
}
.close-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.shortcuts-body {
  flex: 1;
  padding: var(--pad-lg) var(--pad-xl);
  overflow-y: auto;
}

/* ===== Featured Section ===== */
.featured-section {
  margin-bottom: var(--pad-lg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  padding: var(--pad-lg);
}
.featured-badge {
  margin-bottom: var(--gap-sm);
  color: var(--accent);
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 1.5px;
}
.featured-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--pad-xl);
}
.featured-col h3 {
  margin: 0 0 6px;
  color: var(--accent);
  font-weight: 700;
  font-size: 11px;
}
.featured-col .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}
.featured-divider {
  margin: var(--gap-md) 0;
  background: var(--border);
  height: 1px;
}
.featured-subhead {
  margin: 0 0 6px;
  color: var(--accent);
  font-weight: 700;
  font-size: 11px;
}
.checklist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px var(--pad-xl);
}
.checklist-grid .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

/* ===== Standard Section ===== */
.standard-section {
  padding: 0;
}
.standard-badge {
  margin-bottom: var(--gap-sm);
  color: var(--text-dim);
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 1.5px;
}
.standard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px var(--pad-xl);
}
.standard-grid .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
}

/* ===== Row Shared ===== */
.row kbd {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-dropdown);
  padding: 2px 7px;
  color: var(--text);
  font-size: 10px;
  font-family: var(--font-mono);
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.row span {
  color: var(--text-dim);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}
.standard-grid .row span {
  color: color-mix(in srgb, var(--text-dim) 70%, transparent);
}

/* ===== Close Button ===== */
.close-bottom {
  transition: all var(--transition-fast);
  cursor: pointer;
  margin: var(--gap-md) var(--pad-xl) var(--pad-lg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 10px 0;
  color: var(--text);
  font-weight: 900;
  font-size: 13px;
  font-family: var(--font-family);
  letter-spacing: 0.5px;
}
.close-bottom:hover {
  border-color: var(--accent);
  background: var(--surface-raised);
  color: var(--accent);
}
</style>
