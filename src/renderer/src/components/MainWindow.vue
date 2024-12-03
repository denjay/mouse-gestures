<script setup lang="ts">
import { onMounted, reactive, ref, computed, toRaw /* watch, nextTick */ } from 'vue'
import { Leafer, Line } from 'leafer-ui'
import type { Config, TaskList } from '../stores/data'
import { defaultConfig } from '../stores/data'

// 不同的窗口之间不能用pinia共享数据,所以用监听storage的方式同步数据
const config = window.localStorage.getItem('config')
  ? ref<Config>(JSON.parse(window.localStorage.getItem('config')!))
  : ref<Config>(defaultConfig)
window.electron.ipcRenderer.send('config', toRaw(config.value))
window.addEventListener('storage', (event) => {
  if (event.key === 'config') {
    config.value = JSON.parse(event.newValue || '{}')
    window.electron.ipcRenderer.send('config', toRaw(config.value))
    line.set({ visible: config.value.shopTrajectory })
  }
})
const line = new Line({
  points: [],
  cornerRadius: 5,
  strokeWidth: 5,
  stroke: 'rgb(50,205,121)',
  visible: config.value.shopTrajectory
})
onMounted(() => {
  const leafer = new Leafer({ view: document.getElementById('leafer')!, wheel: { disabled: true } })
  leafer.add(line)
})

const points: { x: number; y: number }[] = []
const directions = reactive<string[]>([])
const svgContent = ref('')
const taskInfoList = ref<Array<TaskList>>([])
const allowAddPoint = ref(true)

const task = computed(() => {
  return taskInfoList.value.find((i) => i.directions === directions.join(''))
})

window.api.onFinished(() => {
  if (task.value) {
    window.electron.ipcRenderer.send('task', toRaw(task.value))
  }
  /* points.length = 0
  directions.length = 0
  line.set({ points: [] })
  taskInfoList.value = []
  allowAddPoint.value = true */
})

window.api.onTaskInfoList((_, _taskInfoList: []) => {
  taskInfoList.value = _taskInfoList
})
window.api.onPoint((_, point) => {
  if (!allowAddPoint.value) return
  points.push(point)
  line.set({ points })
  if (points.length <= 1) return
  const prePonit = points.at(-2)
  const deltaX = point.x - prePonit!.x
  const deltaY = point.y - prePonit!.y
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
    import(`../assets/images/${directions.join('')}.svg?raw`)
      .then((res) => (svgContent.value = res.default))
      .catch(() => (svgContent.value = ''))
  }
})
window.api.onOpenSettingsPage(() => {
  window.open('#/settings', '设置')
})
function getSvgIcon(directions: string) {
  return new URL(`/src/assets/images/${directions}.svg`, import.meta.url).href
}
function handleTipsMouseup(taskInfo: TaskList) {
  window.electron.ipcRenderer.send('task', toRaw(taskInfo))
}
function handleMouseEnterTips() {
  allowAddPoint.value = false
  points.length = 0
  directions.length = 0
  line.set({ points: [] })
}
window.addEventListener('mouseup', (e) => {
  console.log(e.button)
  if (e.button === 2) {
    const target = e.target as HTMLElement
    console.log('🏕️ MainWindow.vue:91 -> target: ', target.tagName)
    /* if (target.dataset.taskInfo) {
      const taskInfo = JSON.parse(target.dataset.taskInfo)
      handleTipsMouseup(taskInfo)
    } */
  }
})
</script>

<template>
  <div v-if="taskInfoList.length" id="tips" @mouseenter="handleMouseEnterTips">
    <div
      v-for="taskInfo in taskInfoList"
      :key="taskInfo.directions"
      @mouseup.right="handleTipsMouseup(taskInfo)"
    >
      <img :src="getSvgIcon(taskInfo.directions)" />
      <span :data-task-info="JSON.stringify(taskInfo)">{{ taskInfo.description }}</span>
    </div>
  </div>
  <canvas id="leafer"></canvas>
  <div id="indicator-wrapper">
    <div v-if="directions.length" id="indicator">
      <div v-if="svgContent" v-html="svgContent"></div>
      <div v-else id="direction">{{ directions.join('') }}</div>
      <div id="description">
        {{ task ? task.description : '无效手势' }}
      </div>
    </div>
  </div>
</template>

<style>
#tips {
  position: fixed;
  left: 10px;
  bottom: 10px;
  z-index: 100;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 10px;
  > div {
    display: flex;
    align-items: center;
    font-size: 12px;
    /* cursor: pointer; */
    user-select: none;
  }
  /* > div:hover {
    color: rgb(185, 225, 52);
  } */
  img {
    filter: invert(100%);
    margin-right: 5px;
  }
}
#indicator-wrapper {
  z-index: 1;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 70%;
  width: 100%;
  & #indicator {
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
