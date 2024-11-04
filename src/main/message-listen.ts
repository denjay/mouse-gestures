import { ipcMain } from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'

export function initMessageListen(mainWindow: Electron.BrowserWindow) {
  ipcMain.on('task', (_, task) => {
    if (task.type === 'shortcut') {
      const keyList = task.shortcut
        .split('+')
        .map((str) => str.replace(/(^\w)/, (match) => match.toUpperCase()))
        .map((str) => Key[str])
      keyboard.type(...keyList)
    } else if (task.type === 'command') {
      // TODO: 其他命令
    }
  })
  ipcMain.on('minimizeMainWindow', () => {
    mainWindow.minimize()
  })
}
