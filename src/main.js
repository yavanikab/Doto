import { createApp } from 'vue'
import App from './App.vue'
import './assets/fonts/css/all.min.css'

const splash = document.getElementById('splash')
if (splash) {
  const theme = localStorage.getItem('doto-theme')
  if (theme === 'light') {
    splash.style.background = '#f5f2eb'
    splash.style.setProperty('--splash-text-color', '#1a1a1a')
  }
}

createApp(App).mount('#app')

if (splash) {
  const removeSplash = () => splash.remove()
  splash.addEventListener('animationend', removeSplash, { once: true })
  setTimeout(() => {
    if (splash.parentNode) splash.remove()
  }, 1600)
}
