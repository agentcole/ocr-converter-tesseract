import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import { setupIPC } from './ipc.js'

const store = new Store({
  defaults: {
    onboardingComplete: false,
    installedLanguages: ['eng'],
    outputFormat: 'docx',
    outputDir: app.getPath('documents')
  }
})

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 620,
    show: false,
    resizable: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  setupIPC(mainWindow, store)
  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ocr-converter')
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
