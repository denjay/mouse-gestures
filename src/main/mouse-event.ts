import { screen } from 'electron'
import { uIOhook } from 'uiohook-napi'
import { Button, mouse } from '@nut-tree-fork/nut-js'

export function initMouseEvent(mainWindow: Electron.BrowserWindow) {
  let rightKeyPressed = false
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
}
