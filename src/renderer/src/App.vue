<script setup lang="ts">
import { reactive /* ref, onMounted, watch, computed, nextTick, toRaw */ } from 'vue'
import { Leafer, Line } from 'leafer-ui'

const leafer = new Leafer({ view: window })
const line = new Line({
  points: [],
  cornerRadius: 5,
  strokeWidth: 5,
  stroke: 'rgb(50,205,121)'
})
leafer.add(line)

const points: { x: number; y: number }[] = []
const directions = reactive<string[]>([])
document.addEventListener('mousemove', (e) => {
  points.push({ x: e.x, y: e.y })
  const prePonit = points.at(-2)
  const deltaX = e.x - prePonit!.x
  const deltaY = e.y - prePonit!.y
  // 过滤掉小于5的移动
  if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return
  let direction = ''
  if (deltaX > 0 && Math.abs(deltaY) < deltaX) {
    direction = '→'
  } else if (deltaX < 0 && Math.abs(deltaY) < Math.abs(deltaX)) {
    direction = '←'
  } else if (deltaY > 0 && Math.abs(deltaX) < deltaY) {
    direction = '↓'
  } else if (deltaY < 0 && Math.abs(deltaX) < Math.abs(deltaY)) {
    direction = '↑'
  }
  if (direction && directions.at(-1) !== direction) {
    directions.push(direction)
  }
  line.set({ points })
})
document.addEventListener('mouseup', async (e) => {
  if (e.button === 2) {
    // 这里不能用hide,否则窗口隐藏后会暂停渲染
    window.electron.ipcRenderer.send('execMainWindowMethod', 'minimize')
    points.length = 0
    directions.length = 0
    line.set({ points: [] })
  }
})
window.api.onSetFirstPoint((_, point) => {
  points.push(point)
  window.electron.ipcRenderer.send('execMainWindowMethod', 'show')
})
</script>

<template>
  <div id="wrapper">
    <div id="tips">{{ directions.join(' ') }}</div>
  </div>
</template>

<style>
#wrapper {
  z-index: 1;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 70%;
  width: 100%;
  & #tips {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    padding: 25px 50px;
    font-size: 32px;
    color: white;
  }
}
</style>
