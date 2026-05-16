const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs').promises
const fsSync = require('fs')
const archiver = require('archiver')

function resolveIconPath() {
  const pngPath = path.join(__dirname, '..', 'dist-vite', 'icon.png')
  const icoPath = path.join(__dirname, '..', 'dist-vite', 'icon.ico')
  const unpackedPng = pngPath.replace('app.asar', 'app.asar.unpacked')
  const unpackedIco = icoPath.replace('app.asar', 'app.asar.unpacked')
  if (fsSync.existsSync(unpackedIco)) return unpackedIco
  if (fsSync.existsSync(unpackedPng)) return unpackedPng
  if (fsSync.existsSync(icoPath)) return icoPath
  if (fsSync.existsSync(pngPath)) return pngPath
  return path.join(__dirname, '..', 'public', 'icon.png')
}

let mainWindow = null
let saveDir = null
let readyToClose = false
let closePending = false
let configPath = ''
let appDataDir = ''

function initializePaths() {
  configPath = path.join(app.getPath('userData'), 'config.json')
  appDataDir = path.join(app.getPath('userData'), 'data')
}

function ensureAppDataDir() {
  if (!fsSync.existsSync(appDataDir)) {
    fsSync.mkdirSync(appDataDir, { recursive: true })
  }
}

function readConfig() {
  try {
    if (fsSync.existsSync(configPath)) {
      return JSON.parse(fsSync.readFileSync(configPath, 'utf-8'))
    }
  } catch {
    /* file not found, return defaults */
  }
  return {}
}

function writeConfig(data) {
  try {
    const dir = path.dirname(configPath)
    if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true })
    const existing = readConfig()
    const merged = { ...existing, ...data }
    fsSync.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write config:', err)
  }
}

function createWindow() {
  readyToClose = false
  closePending = false
  const saved = readConfig()
  const bounds = saved.windowBounds || {}

  mainWindow = new BrowserWindow({
    width: bounds.width || 800,
    height: bounds.height || 600,
    x: bounds.x,
    y: bounds.y,
    minWidth: 400,
    minHeight: 300,
    frame: false,
    backgroundColor: saved.theme === 'light' ? '#f5f2eb' : '#1a1a1a',
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist-vite', 'index.html'))
  }

  mainWindow.webContents.once('did-finish-load', () => {
    fitWindowToContent()
  })

  mainWindow.on('close', (e) => {
    if (readyToClose) return
    if (closePending) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    closePending = true
    mainWindow.webContents.send('before-app-close')
    const timeout = setTimeout(() => {
      readyToClose = true
      closePending = false
      mainWindow?.close()
    }, 3000)
    ipcMain.once('confirm-app-close', () => {
      clearTimeout(timeout)
      readyToClose = true
      closePending = false
      mainWindow?.close()
    })
  })
}

function fitWindowToContent() {
  if (!mainWindow || mainWindow.isMaximized()) return
  mainWindow.webContents
    .executeJavaScript(
      'parseInt(getComputedStyle(document.documentElement).getPropertyValue("--max-content-width"), 10)'
    )
    .then((contentWidth) => {
      if (contentWidth && contentWidth > 0) {
        const targetWidth = contentWidth + 46
        const bounds = mainWindow.getBounds()
        mainWindow.setBounds({ ...bounds, width: Math.max(targetWidth, bounds.width) })
      }
    })
    .catch(() => {})
}

app.whenReady().then(() => {
  initializePaths()
  const saved = readConfig()
  if (saved.lastSaveDir) saveDir = saved.lastSaveDir
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const bounds = mainWindow.getBounds()
    writeConfig({
      windowBounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
    })
  }
})

ipcMain.handle('show-message-box', async (_event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options)
  return result
})

ipcMain.handle('save-file-dialog', async (_event, defaultFilename) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultFilename || 'checklist.md',
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })
  if (!result.canceled && result.filePath) {
    const dir = path.dirname(result.filePath)
    const file = path.basename(result.filePath)
    saveDir = dir
    writeConfig({ lastSaveDir: saveDir })
    return { dir, file }
  }
  return null
})

ipcMain.handle('save-file', async (_event, content, filePath) => {
  if (!filePath || !path.isAbsolute(filePath)) return { success: false, mtimeMs: null }
  const resolved = path.resolve(filePath)
  try {
    const dir = path.dirname(resolved)
    if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true })
    await fs.writeFile(resolved, content, 'utf-8')
    const stat = await fs.stat(resolved)
    return { success: true, mtimeMs: stat.mtimeMs }
  } catch (err) {
    console.error('Failed to save file:', err)
    return { success: false, mtimeMs: null }
  }
})

ipcMain.handle('get-file-mtime', async (_event, filePath) => {
  if (!filePath) return { error: 'No file path provided' }
  const resolved = path.resolve(filePath)
  try {
    if (fsSync.existsSync(resolved)) {
      const stat = await fs.stat(resolved)
      return { mtimeMs: stat.mtimeMs }
    }
    return { error: 'File not found' }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('read-file-by-path', async (_event, filePath) => {
  if (!filePath) return null
  const resolved = path.resolve(filePath)
  try {
    const content = await fs.readFile(resolved, 'utf-8')
    const stat = await fs.stat(resolved)
    return { content, mtimeMs: stat.mtimeMs }
  } catch {
    return null
  }
})

ipcMain.handle('get-save-dir', () => saveDir)

ipcMain.handle('save-config', async (_event, data) => {
  writeConfig(data)
  return true
})

ipcMain.handle('load-config', async () => readConfig())

ipcMain.on('minimize-window', () => {
  mainWindow?.minimize()
})

ipcMain.on('close-window', () => {
  mainWindow?.close()
})

ipcMain.handle('save-appdata', async (_event, tabData) => {
  ensureAppDataDir()
  const safeId = String(tabData.id).replace(/[^a-zA-Z0-9_-]/g, '_')
  const filePath = path.join(appDataDir, `tab_${safeId}.json`)
  try {
    const data = { ...tabData, _savedAt: Date.now() }
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to save appdata:', err)
    return false
  }
})

ipcMain.handle('load-appdata', async () => {
  ensureAppDataDir()
  try {
    const files = await fs.readdir(appDataDir)
    const jsonFiles = files.filter((f) => f.startsWith('tab_') && f.endsWith('.json'))
    const tabs = []
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(appDataDir, file), 'utf-8')
        tabs.push(JSON.parse(content))
      } catch (err) {
        console.error('Failed to load appdata file:', file, err)
      }
    }
    return tabs
  } catch (err) {
    console.error('Failed to load appdata:', err)
    return []
  }
})

ipcMain.handle('delete-appdata', async (_event, tabId) => {
  const safeId = String(tabId).replace(/[^a-zA-Z0-9_-]/g, '_')
  const filePath = path.join(appDataDir, `tab_${safeId}.json`)
  try {
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath)
    }
    return true
  } catch (err) {
    console.error('Failed to delete appdata:', err)
    return false
  }
})

ipcMain.handle('clear-all-appdata', async () => {
  ensureAppDataDir()
  try {
    const files = await fs.readdir(appDataDir)
    for (const file of files) {
      if (file.startsWith('tab_') && file.endsWith('.json')) {
        await fs.unlink(path.join(appDataDir, file))
      }
    }
    return true
  } catch (err) {
    console.error('Failed to clear appdata:', err)
    return false
  }
})

ipcMain.handle('load-welcome-note', async () => {
  ensureAppDataDir()
  const filePath = path.join(appDataDir, 'welcome_note.json')
  try {
    if (fsSync.existsSync(filePath)) {
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Failed to load welcome note:', err)
  }
  return null
})

ipcMain.handle('save-welcome-note', async (_event, data) => {
  ensureAppDataDir()
  const filePath = path.join(appDataDir, 'welcome_note.json')
  try {
    data._savedAt = Date.now()
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to save welcome note:', err)
    return false
  }
})

ipcMain.handle('export-zip', async (_event, tabData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'doto-export.zip',
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
  })
  if (result.canceled || !result.filePath) return false

  return new Promise((resolve) => {
    const output = fsSync.createWriteStream(result.filePath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.pipe(output)
    for (const tab of tabData) {
      archive.append(tab.content, { name: tab.filename })
    }
    archive.finalize()
    output.on('close', () => resolve(true))
    output.on('error', (err) => {
      console.error('Export stream failed:', err)
      resolve(false)
    })
    archive.on('error', (err) => {
      console.error('Export failed:', err)
      resolve(false)
    })
  })
})

ipcMain.handle('open-md-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Markdown', extensions: ['md'] }],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  const basename = path.basename(filePath)

  if (!basename.startsWith('C_') && !basename.startsWith('N_')) {
    return { error: 'Only C_ (checklist) and N_ (notes) files created in Doto can be opened.' }
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const stat = await fs.stat(filePath)
    const type = basename.startsWith('C_') ? 'checklist' : 'notes'
    const dir = path.dirname(filePath)
    return { filename: basename, content, type, dir, mtimeMs: stat.mtimeMs }
  } catch (err) {
    console.error('Failed to read file:', err)
    return { error: 'Failed to read file: ' + err.message }
  }
})

ipcMain.handle('open-external', async (_event, url) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) {
    await shell.openExternal(url)
  }
})

ipcMain.handle('show-item-in-folder', async (_event, filePath) => {
  if (filePath) shell.showItemInFolder(filePath)
})

ipcMain.handle('rename-file', async (_event, oldPath, newPath) => {
  if (!oldPath || !newPath) return false
  try {
    if (fsSync.existsSync(oldPath)) {
      await fs.rename(oldPath, newPath)
      return true
    }
  } catch (err) {
    console.error('Failed to rename file:', err)
  }
  return false
})

ipcMain.handle('delete-file', async (_event, filePath) => {
  if (!filePath || !path.isAbsolute(filePath)) return false
  const resolved = path.resolve(filePath)
  try {
    if (fsSync.existsSync(resolved)) {
      await fs.unlink(resolved)
      return true
    }
  } catch (err) {
    console.error('Failed to delete file:', err)
  }
  return false
})
