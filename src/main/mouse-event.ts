import { screen } from 'electron'
import { uIOhook } from 'uiohook-napi'
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
      console.log('title::: ', activeWindow?.title)
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
  uIOhook.start()
}
