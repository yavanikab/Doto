const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveFileDialog: (defaultFilename) => ipcRenderer.invoke('save-file-dialog', defaultFilename),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  saveFile: (content, filePath) => ipcRenderer.invoke('save-file', content, filePath),
  getSaveDir: () => ipcRenderer.invoke('get-save-dir'),
  saveConfig: (data) => ipcRenderer.invoke('save-config', data),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  saveAppData: (tabData) => ipcRenderer.invoke('save-appdata', tabData),
  loadAppData: () => ipcRenderer.invoke('load-appdata'),
  deleteAppData: (tabId) => ipcRenderer.invoke('delete-appdata', tabId),
  clearAllAppData: () => ipcRenderer.invoke('clear-all-appdata'),
  loadWelcomeNote: () => ipcRenderer.invoke('load-welcome-note'),
  saveWelcomeNote: (data) => ipcRenderer.invoke('save-welcome-note', data),
  exportZip: (tabData) => ipcRenderer.invoke('export-zip', tabData),
  openMdFile: () => ipcRenderer.invoke('open-md-file'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('rename-file', oldPath, newPath),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  getFileMtime: (filePath) => ipcRenderer.invoke('get-file-mtime', filePath),
  readFileByPath: (filePath) => ipcRenderer.invoke('read-file-by-path', filePath),
  onBeforeAppClose: (cb) => ipcRenderer.on('before-app-close', cb),
  confirmAppClose: () => ipcRenderer.send('confirm-app-close')
})
