import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  system: {
    detect: () => ipcRenderer.invoke('system:detect'),
  },
  tesseract: {
    check: () => ipcRenderer.invoke('tesseract:check'),
  },
  install: {
    getCommands: (opts) => ipcRenderer.invoke('install:getCommands', opts),
    run: (opts) => ipcRenderer.invoke('install:run', opts),
    bootstrap: (opts) => ipcRenderer.invoke('install:bootstrap', opts),
    onOutput: (cb) => {
      const listener = (_, data) => cb(data)
      ipcRenderer.on('install:output', listener)
      return () => ipcRenderer.removeListener('install:output', listener)
    }
  },
  convert: {
    files: (opts) => ipcRenderer.invoke('convert:files', opts),
  },
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openDir: () => ipcRenderer.invoke('dialog:openDir'),
    saveFile: (opts) => ipcRenderer.invoke('dialog:saveFile', opts),
  },
  shell: {
    openPath: (p) => ipcRenderer.invoke('shell:openPath', p),
  },
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
  },
  window: {
    resize: (opts) => ipcRenderer.invoke('window:resize', opts),
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
