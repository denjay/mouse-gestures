import { ipcMain } from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'

export function initMessageListen(mainWindow: Electron.BrowserWindow) {
  ipcMain.on('task', async (_, task) => {
    // 动作很快时，有可能右键释放作用到了原窗口，导致弹出了右键菜单，使命令失效，所以要先用esc键关闭菜单
    await keyboard.type(Key.Escape)
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
