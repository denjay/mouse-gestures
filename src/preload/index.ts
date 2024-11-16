import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onKey: (callback) => ipcRenderer.on('key', (_event, keyInfo) => callback(_event, keyInfo)),
  onFinished: (callback) => ipcRenderer.on('finished', (_event) => callback(_event)),
  onWindowTitle: (callback) =>
    ipcRenderer.on('windowTitle', (_event, windowTitle) => callback(_event, windowTitle)),
  onPoint: (callback) => ipcRenderer.on('point', (_event, point) => callback(_event, point)),
  onOpenSettingsPage: (callback) =>
    ipcRenderer.on('open-settings-page', (_event) => callback(_event))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
