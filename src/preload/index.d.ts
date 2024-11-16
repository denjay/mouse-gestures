import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onKey: (event) => void
      onFinished: (event) => void
      onWindowTitle: (event) => void
      onPoint: (event) => void
      onOpenSettingsPage: (event) => void
    }
  }
}
