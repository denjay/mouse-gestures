import { ipcMain } from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'
import { keyMap } from './key-map'

export function initMessageListen(mainWindow: Electron.BrowserWindow) {
  ipcMain.on('task', async (_, task) => {
    if (task.type === 'shortcut') {
      for (const keyList of task.keyListGroup) {
        await keyboard.type(...keyList.map((key) => Key[keyMap[key]]))
      }
    } else if (task.type === 'command') {
      // TODO: 其他命令
    }
  })
  ipcMain.on('minimizeMainWindow', () => {
    mainWindow.minimize()
  })
}
