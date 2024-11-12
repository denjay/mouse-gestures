import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onFinished: (event) => void
      onPoint: (event) => void
      onOpenSettingsPage: (event) => void
    }
  }
}
