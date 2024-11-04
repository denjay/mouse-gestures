import { app, Menu, Tray } from 'electron'
import { default as AutoLaunch } from 'auto-launch'

import icon from '../../resources/icon.png?asset'

export function createTray(mainWindow: Electron.BrowserWindow) {
  const setContextMenu = async (tray: Tray) => {
    const minecraftAutoLauncher = new AutoLaunch({ name: 'mouse-gestures' })
    const template = [
      {
        label: '退出',
        click: () => {
          mainWindow.close()
        }
      },
      {
        label: '设置',
        click: () => {
          mainWindow.webContents.send('open-settings-page')
        }
      }
    ]
    if (app.isPackaged) {
      const isEnabled: boolean = await minecraftAutoLauncher.isEnabled()
      if (isEnabled) {
        template.unshift({
          label: '取消开机启动',
          click: () => {
            minecraftAutoLauncher.disable()
            setContextMenu(tray)
          }
        })
      } else {
        template.unshift({
          label: '开机启动',
          click: () => {
            minecraftAutoLauncher.enable()
            setContextMenu(tray)
          }
        })
      }
    }
    const contextMenu = Menu.buildFromTemplate(template)
    tray.setContextMenu(contextMenu)
  }

  // 创建托盘图标
  const tray = new Tray(icon)
  tray.setToolTip('丁丁鼠标手势')
  setContextMenu(tray)
  /* tray.on('click', function () {
    mainWindow.webContents.send('openSettingsPage')
  }) */
  tray.on('right-click', function () {
    tray.popUpContextMenu()
  })
}
