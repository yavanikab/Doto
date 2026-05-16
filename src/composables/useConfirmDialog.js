import { reactive } from 'vue'

const state = reactive({
  visible: false,
  title: '',
  message: '',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  altLabel: null,
  altValue: 'alt',
  danger: false,
  icon: 'fa-solid fa-circle-exclamation',
  hideCancel: false
})

let resolvePromise = null

export function useConfirmDialog() {
  function showConfirm(opts = {}) {
    Object.assign(state, {
      visible: true,
      title: 'Confirm',
      message: '',
      confirmLabel: 'OK',
      cancelLabel: 'Cancel',
      altLabel: null,
      altValue: 'alt',
      danger: false,
      icon: 'fa-solid fa-circle-exclamation',
      hideCancel: false,
      ...opts
    })
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleResult(value) {
    if (!state.visible) return
    state.visible = false
    if (resolvePromise) {
      resolvePromise(value)
      resolvePromise = null
    }
  }

  return { state, showConfirm, handleResult }
}
