import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { dirname, join } from 'path'
import { app, ipcMain, screen, webContents } from 'electron'
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { Button, Key, keyboard, mouse } from '@nut-tree-fork/nut-js'

export function initMouseEvent(mainWindow: Electron.BrowserWindow) {
  let config: Config | null = null
  let disableCapsLockProcess: ChildProcessWithoutNullStreams | null = null
  ipcMain.on('config', async (_, _config) => {
    config = _config
    if (process.platform !== 'win32') return
    if (config?.disableCapsLock) {
      const exeFilePath = app.isPackaged
        ? join(dirname(app.getPath('exe')), 'resources', 'DisableCapsLock.exe')
        : join(__dirname, '../../resources/DisableCapsLock.exe')
      disableCapsLockProcess = spawn(exeFilePath)
    } else {
      if (disableCapsLockProcess) {
        disableCapsLockProcess.kill()
        disableCapsLockProcess = null
      }
    }
  })
  let tabInfo: { applications: string; taskInfoList: [] } | undefined
  let mouseMoved = false
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor
  uIOhook.on('mousedown', async (e) => {
    // 按下的不是右键则不执行任何操作
    if (e.button !== 2) return
    // 按住alt键时不执行任何操作
    if (e.altKey) return
    // 未获取到配置则不执行任何操作
    if (!config?.tabInfoList?.length) return
    // 获取当前应用
    const application = (await (await import('get-windows')).activeWindow())?.owner?.name
    // 未获取到应用名则不执行任何操作
    if (!application) return
    tabInfo = config.tabInfoList.find(({ applications }) =>
      applications
        .split(';')
        .map((item) => item.trim())
        .includes(application)
    )
  })

  // windows系统下,通过命令释放右键会触发mouseup事件,要忽略该事件,通过ignoreRightButtonRelease变量来判断是否忽略mouseup事件
  // 但是在linux系统下,mouseup事件不会触发,所以要区分windows和linux系统
  let ignoreRightButtonRelease = false
  uIOhook.on('mouseup', (e) => {
    if (e.button !== 2) return
    if (process.platform === 'win32' && ignoreRightButtonRelease) {
      ignoreRightButtonRelease = false
      return
    }
    tabInfo = undefined
    if (mouseMoved) {
      mainWindow.setIgnoreMouseEvents(true)
      mainWindow.webContents.send('finished')
      mouseMoved = false
    }
  })
  uIOhook.on('mousemove', async (e) => {
    if (!tabInfo) return
    if (!mouseMoved) {
      mouseMoved = true
      mainWindow.webContents.send('taskInfoList', tabInfo.taskInfoList)
      mainWindow.setIgnoreMouseEvents(false)
      // linux和windows下行为不同
      if (process.platform === 'win32') {
        await mouse.click(Button.LEFT)
      } else {
        await keyboard.type(Key.Escape)
      }
      await mouse.releaseButton(Button.RIGHT)
      ignoreRightButtonRelease = true
      return
    }
    const dipPoint = {
      x: e.x / scaleFactor,
      y: e.y / scaleFactor
    }
    mainWindow.webContents.send('point', dipPoint)
  })
  uIOhook.on('keydown', (e) => handleKey(e.keycode, 'keydown'))
  uIOhook.on('keyup', (e) => handleKey(e.keycode, 'keyup'))
  uIOhook.start()
}

function handleKey(keycode: number, type: string) {
  const focusedWebContents = webContents.getFocusedWebContents()
  const title = focusedWebContents?.mainFrame?.name
  if (title === '设置') {
    const key = Object.entries(UiohookKey).find((item) => item[1] === keycode)![0]
    focusedWebContents!.send('key', { key, type })
  }
}

interface Config {
  disableCapsLock: boolean
  tabInfoList: { applications: string; taskInfoList: [] }[]
}
