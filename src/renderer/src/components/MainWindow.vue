<script setup lang="ts">
import { reactive, ref, computed, toRaw /* onMounted, watch, nextTick */ } from 'vue'
import { Leafer, Line } from 'leafer-ui'

const leafer = new Leafer({ view: window, wheel: { disabled: true } })
const line = new Line({
  points: [],
  cornerRadius: 5,
  strokeWidth: 5,
  stroke: 'rgb(50,205,121)'
})
leafer.add(line)

const points: { x: number; y: number }[] = []
const directions = reactive<string[]>([])
const svgContent = ref('')

const task = computed(() => {
  const taskList = [
    {
      id: 1,
      type: 'shortcut', // shortcut | command
      description: '返回',
      shortcut: 'alt+left',
      command: ''
    },
    {
      id: 2,
      type: 'shortcut',
      description: '前进',
      shortcut: 'alt+right',
      command: ''
    },
    {
      id: 3,
      type: 'shortcut',
      description: '向上滚动一屏',
      shortcut: 'PageUp',
      command: ''
    },
    {
      id: 4,
      type: 'shortcut',
      description: '向下滚动一屏',
      shortcut: 'PageDown',
      command: ''
    }
  ]
  const gestureList = [
    { directions: '←', description: '向左', taskID: 1 },
    { directions: '→', description: '向右', taskID: 2 },
    { directions: '↑', description: '向上', taskID: 3 },
    { directions: '↓', description: '向下', taskID: 4 }
  ]
  const taskID = gestureList.find((i) => i.directions === directions.join(''))?.taskID
  return taskList.find((i) => i.id === taskID)
})

window.api.onFinished(() => {
  if (task.value) {
    window.electron.ipcRenderer.send('task', toRaw(task.value))
  }
  points.length = 0
  directions.length = 0
  line.set({ points: [] })
})

window.api.onPoint((_, point) => {
  points.push(point)
  line.set({ points })
  if (points.length <= 1) return
  const prePonit = points.at(-2)
  const deltaX = point.x - prePonit!.x
  const deltaY = point.y - prePonit!.y
  // 过滤掉小于3的移动
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
    import(`../assets/images/${directions.join('')}.svg?raw`)
      .then((res) => (svgContent.value = res.default))
      .catch(() => (svgContent.value = ''))
  }
})
window.api.onOpenSettingsPage(() => {
  window.open('#/settings', '设置')
})
</script>

<template>
  <div id="wrapper">
    <div v-if="directions.length" id="tips">
      <div v-if="svgContent" v-html="svgContent"></div>
      <div v-else id="direction">{{ directions.join('') }}</div>
      <div id="description">
        {{ task ? task.description : '无效手势' }}
      </div>
    </div>
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
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    padding: 25px 50px;
    color: white;
    & svg {
      fill: white;
      width: 50px;
      height: 50px;
    }
    & #direction {
      font-size: 50px;
    }
    & #description {
      font-size: 20px;
    }
  }
}
</style>
