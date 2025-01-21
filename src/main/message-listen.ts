import { ipcMain } from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'
import { keyMap } from './key-map'

export function initMessageListen() {
  ipcMain.on('task', async (_, task) => {
    for (const keyList of task.keyListGroup) {
      await keyboard.type(...keyList.map((key) => Key[keyMap[key]]))
    }
  })
}
