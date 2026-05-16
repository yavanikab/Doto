<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-backdrop"
      @mousedown="onBackdropClick"
      @contextmenu.prevent="close"
    >
      <div
        ref="menuRef"
        class="context-menu"
        :style="{ left: posX + 'px', top: posY + 'px' }"
        @mousedown.stop
      >
        <button
          v-for="(item, i) in items"
          :key="i"
          class="context-item"
          :class="{ danger: item.danger }"
          @click="onItemClick(item)"
        >
          <i v-if="item.icon" :class="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: Boolean,
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  items: { type: Array, default: () => [] }
})
const emit = defineEmits(['close', 'action'])

const menuRef = ref(null)
const posX = ref(0)
const posY = ref(0)

watch(
  () => props.visible,
  (v) => {
    if (!v) return
    posX.value = props.x
    posY.value = props.y
    nextTick(() => {
      const el = menuRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.right > window.innerWidth) posX.value = window.innerWidth - rect.width - 8
      if (rect.bottom > window.innerHeight) posY.value = window.innerHeight - rect.height - 8
    })
  }
)

function close() {
  emit('close')
}

function onBackdropClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) close()
}

function onItemClick(item) {
  emit('action', item.id)
  close()
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  background: var(--surface-dropdown);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  min-width: 170px;
  z-index: 1000;
}

.context-item {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--pad-lg) var(--pad-3xl);
  font-size: var(--font-size-sm);
  color: var(--text);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  text-align: left;
  font-family: var(--font-family);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.context-item:hover {
  background: var(--surface-raised);
}

.context-item.danger {
  color: var(--text-danger);
}

.context-item.danger:hover {
  background: color-mix(in srgb, var(--text-danger) 15%, transparent);
}

.context-item i {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 12px;
}
</style>
