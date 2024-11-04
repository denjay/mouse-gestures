import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { exec } from 'child_process'
import { dirname, join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { uIOhook } from 'uiohook-napi'
import { Button, mouse, keyboard, Key } from '@nut-tree-fork/nut-js'

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
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    type: 'toolbar', // 不显示任务栏窗口
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

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

  let rightKeyPressed = false
  uIOhook.on('mousedown', (e) => {
    // 按住alt键时不执行任何操作
    if (e.altKey) return
    if (e.button === 2) {
      rightKeyPressed = true
    }
  })
  uIOhook.on('mouseup', (e) => {
    if (e.button === 2) {
      rightKeyPressed = false
      if (mainWindow.isVisible()) {
        mainWindow.minimize()
      }
    }
  })
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor
  uIOhook.on('mousemove', async (e) => {
    if (!rightKeyPressed) return
    const dipPoint = {
      x: e.x / scaleFactor,
      y: e.y / scaleFactor
    }
    // 要把第一个点传过去,要不然鼠标移动快了的话,轨迹显示不完整
    mainWindow.webContents.send('point', dipPoint)
    if (!mainWindow.isVisible()) {
      await mouse.click(Button.LEFT)
      mainWindow.show()
    }
  })
  uIOhook.start()

  /* mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  }) */

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
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
