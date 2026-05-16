<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="state.visible" class="confirm-overlay" @click.self="onCancel">
        <div ref="cardRef" class="confirm-card" tabindex="-1">
          <div class="confirm-icon" :class="{ 'icon-danger': state.danger }">
            <i :class="state.icon" />
          </div>
          <div class="confirm-title">
            {{ state.title }}
          </div>
          <div class="confirm-message">
            {{ state.message }}
          </div>
          <div class="confirm-actions">
            <button
              v-if="!state.hideCancel"
              ref="cancelBtnRef"
              class="btn btn-cancel"
              @click="onCancel"
            >
              {{ state.cancelLabel }}
            </button>
            <button v-if="state.altLabel" ref="altBtnRef" class="btn btn-alt" @click="onAlt">
              {{ state.altLabel }}
            </button>
            <button
              ref="confirmBtnRef"
              class="btn"
              :class="state.danger ? 'btn-danger' : 'btn-primary'"
              @click="onConfirm"
            >
              {{ state.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useConfirmDialog } from '../composables/useConfirmDialog'

const { state, handleResult } = useConfirmDialog()
const cardRef = ref(null)
const cancelBtnRef = ref(null)
const confirmBtnRef = ref(null)
const altBtnRef = ref(null)

function onCancel() {
  handleResult(false)
}
function onConfirm() {
  handleResult(true)
}
function onAlt() {
  handleResult(state.altValue)
}

watch(
  () => state.visible,
  (visible) => {
    if (!visible) return
    nextTick(() => {
      if (cancelBtnRef.value) {
        cancelBtnRef.value.focus()
      } else if (confirmBtnRef.value) {
        confirmBtnRef.value.focus()
      }
    })
  }
)
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.confirm-icon {
  text-align: center;
  margin-bottom: 12px;
  font-size: 32px;
  color: var(--accent);
}

.confirm-icon.icon-danger {
  color: var(--text-danger);
}

.confirm-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  text-align: center;
}

.confirm-message {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 20px;
  text-align: center;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn {
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid var(--border);
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.btn-cancel {
  background: transparent;
  color: var(--text-dim);
}

.btn-cancel:hover {
  color: var(--text);
  background: var(--surface-raised);
}

.btn-alt {
  background: transparent;
  color: var(--text-dim);
}

.btn-alt:hover {
  color: var(--text);
  background: var(--surface-raised);
}

.btn-primary {
  background: var(--accent);
  color: var(--bg);
  border-color: var(--accent);
  font-weight: 600;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-danger {
  background: var(--text-danger);
  color: var(--text-white);
  border-color: var(--text-danger);
  font-weight: 600;
}

.btn-danger:hover {
  filter: brightness(1.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
