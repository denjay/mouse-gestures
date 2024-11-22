import { ipcMain, screen, webContents } from 'electron'
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { Button, mouse } from '@nut-tree-fork/nut-js'

export function initMouseEvent(mainWindow: Electron.BrowserWindow) {
  let config: Config | null = null
  ipcMain.on('config', async (_, _config) => {
    config = _config
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
    if (!config) return
    // 获取当前应用
    const application = (await (await import('get-windows')).activeWindow())?.owner?.name
    // 未获取到应用名或者应用在黑名单中则不执行任何操作
    if (!application || config.blacklist.split(';').includes(application)) return
    tabInfo = config.tabInfoList.find(({ applications }) =>
      applications
        .split(';')
        .map((item) => item.trim())
        .includes(application)
    )
  })

  // 用于控制鼠标是否响应右键释放,如果不释放的话鼠标在主窗口的所有事件都不能触发,但是这里要处理第二次鼠标释放
  let ignoreRightButtonRelease = false
  uIOhook.on('mouseup', (e) => {
    if (e.button !== 2) return
    if (ignoreRightButtonRelease) {
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
      await mouse.click(Button.LEFT)
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
  blacklist: string
  tabInfoList: { applications: string; taskInfoList: [] }[]
}
