import { screen, webContents } from 'electron'
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { Button, mouse } from '@nut-tree-fork/nut-js'

export function initMouseEvent(mainWindow: Electron.BrowserWindow) {
  let rightKeyPressed = false
  let mouseMoved = false
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor
  uIOhook.on('mousedown', async (e) => {
    // 按住alt键时不执行任何操作
    if (e.altKey) return
    if (e.button === 2) {
      rightKeyPressed = true
      const activeWindow = await (await import('get-windows')).activeWindow()
      mainWindow.webContents.send('windowTitle', activeWindow?.owner?.name)
    }
  })
  uIOhook.on('mouseup', (e) => {
    if (e.button === 2) {
      rightKeyPressed = false
      if (mouseMoved) {
        mainWindow.setIgnoreMouseEvents(true)
        mainWindow.webContents.send('finished')
        mouseMoved = false
      }
    }
  })
  uIOhook.on('mousemove', async (e) => {
    if (!rightKeyPressed) return
    if (!mouseMoved) {
      mouseMoved = true
      mainWindow.setIgnoreMouseEvents(false)
      await mouse.click(Button.LEFT)
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
