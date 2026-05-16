<template>
  <div class="welcome">
    <div class="welcome-center">
      <div class="welcome-content">
        <div class="welcome-logo">
          <img class="welcome-icon" :src="icon" alt="Doto" />
          <span class="logo-text">Doto</span>
        </div>
        <div class="welcome-shortcuts">
          <div class="shortcut-row">
            <kbd>Ctrl+N</kbd>
            <span>New checklist</span>
          </div>
          <div class="shortcut-row">
            <kbd>Ctrl+Shift+N</kbd>
            <span>New note</span>
          </div>
          <div class="shortcut-row">
            <kbd>Ctrl+O</kbd>
            <span>Open file</span>
          </div>
        </div>
        <button class="welcome-readme-btn" @click="$emit('open-welcome-note')">
          <i class="fa-solid fa-file-lines" />
          DOTO README
        </button>
      </div>
    </div>
    <div class="welcome-links">
      <a
        href="#"
        class="welcome-link"
        @click.prevent="openExternal('https://www.buymeacoffee.com/')"
      >
        <span class="welcome-link-icon" v-html="bmacSvg" />
        Support Here
      </a>
      <a href="#" class="welcome-link" @click.prevent="openExternal('https://github.com/')">
        <span class="welcome-link-icon" v-html="githubSvg" />
        GitHub
      </a>
    </div>
  </div>
</template>

<script setup>
import icon from '../assets/single-blue-color-icon.png'
import bmacSvg from '../assets/bmac.svg?raw'
import githubSvg from '../assets/github.svg?raw'
defineEmits(['open-welcome-note'])

function openExternal(url) {
  window.electronAPI?.openExternal(url)
}
</script>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: none;
}

.welcome-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.welcome-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  filter: opacity(0.4) saturate(0);
  transition: filter var(--transition-normal);
}

[data-theme='light'] .welcome-icon {
  filter: opacity(0.4) grayscale(1) saturate(0);
}

.logo-text {
  font-family: 'Space Mono', var(--font-family);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.6;
}

.welcome-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-size-md);
  color: var(--text-dim);
}

.shortcut-row kbd {
  background: var(--surface-dropdown);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 2px 6px;
  font-size: var(--font-size-xs);
  color: var(--text);
  font-family: var(--font-mono);
  min-width: 90px;
  text-align: center;
}

.shortcut-row span {
  color: var(--text-dim);
}

.welcome-readme-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  padding: 6px 14px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.welcome-readme-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

.welcome-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: var(--pad-3xl);
  border-top: 1px dashed var(--border);
}

.welcome-link {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
  color: var(--text-dim);
  text-decoration: none;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity var(--transition-fast);
}

.welcome-link:hover {
  opacity: 1;
  color: var(--accent);
}

.welcome-link i {
  font-size: 11px;
}

.welcome-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
}
.welcome-link-icon :deep(svg) {
  width: 14px;
  height: 14px;
}
</style>
