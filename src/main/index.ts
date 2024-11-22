import { app, BrowserWindow, screen } from 'electron'
import { exec } from 'child_process'
import { dirname, join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initMessageListen } from './message-listen'
import { initMouseEvent } from './mouse-event'
import { createTray } from './tray'

import icon from '../../resources/icon.png?asset'

if (process.platform === 'win32') {
  const exeFilePath = app.isPackaged
    ? join(dirname(app.getPath('exe')), 'resources', 'DisableCapsLock.exe')
    : join(__dirname, '../../resources/DisableCapsLock.exe')
  exec(exeFilePath)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: screen.getPrimaryDisplay().size.width,
    height: screen.getPrimaryDisplay().size.height,
    resizable: false, // 禁止改变窗口大小
    focusable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    type: 'toolbar', // 不显示任务栏窗口
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setIgnoreMouseEvents(true) // 禁止鼠标事件

  initMessageListen(mainWindow)
  initMouseEvent(mainWindow)
  createTray(mainWindow)

  /* mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  }) */

  // 拦截window.open(),设置弹出窗口的属性
  mainWindow.webContents.setWindowOpenHandler((args) => {
    if (args.frameName === '设置') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          title: '设置',
          width: 1000,
          autoHideMenuBar: true,
          // parent: mainWindow, // 设置层级在父窗口之上
          // type: 'toolbar', // 不显示任务栏窗口
          icon: join(__dirname, '../../resources/icon.png'),
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: '#ffffff' // 标题栏背景颜色
          },
          webPreferences: {
            preload: join(__dirname, '../preload/index.js')
          }
        }
      }
    }
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
