import { watch } from 'vue'
import { defineStore } from 'pinia'

export const basicTaskInfoList: Array<TaskList> = [
  {
    type: 'shortcut',
    directions: '←',
    description: '返回',
    keyListGroup: [['Alt', 'ArrowLeft']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '→',
    description: '前进',
    keyListGroup: [['Alt', 'ArrowRight']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '↑',
    description: '向上滚动一屏',
    keyListGroup: [['PageUp']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '↓',
    description: '向下滚动一屏',
    keyListGroup: [['PageDown']],
    command: ''
  }
]

const defaultConfig: Config = {
  disableCapsLock: true,
  blacklist: '', // 黑名单
  tabInfoList: [
    {
      name: 'vscode',
      title: 'vscode',
      windowTitle: 'Visual Studio Code;Visual Studio Code - Insiders',
      taskInfoList: [...basicTaskInfoList]
    },
    {
      name: 'browser',
      title: '浏览器',
      windowTitle: 'Google Chrome;Microsoft Edge;QQBrowser;Quark',
      taskInfoList: [...basicTaskInfoList]
    }
  ]
}

const useConfigStore = defineStore('config', {
  state: () => {
    return {
      ...defaultConfig,
      ...JSON.parse(window.localStorage.getItem('config') || '{}')
    }
  }
})

export const config = useConfigStore()

watch(
  config,
  () => {
    window.localStorage.setItem('config', JSON.stringify(config.$state))
  },
  { immediate: true }
)

interface Config {
  disableCapsLock: boolean
  blacklist: string
  tabInfoList: Array<TabList>
}
type TabList = {
  name?: string
  title: string
  windowTitle: string
  taskInfoList: Array<TaskList>
}
export type TaskList = {
  type: 'shortcut' | 'command'
  directions: string
  description: string
  keyListGroup: Array<Array<string>>
  command?: string
}
