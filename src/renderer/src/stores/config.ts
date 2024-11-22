import { watch } from 'vue'
import { defineStore } from 'pinia'

export const basicTaskInfoList: Array<TaskList> = [
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
  },
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
    directions: '↓↑',
    description: '滚动到页首',
    keyListGroup: [['Home']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '↑↓',
    description: '滚动到页尾',
    keyListGroup: [['End']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '←→',
    description: '打开新标签',
    keyListGroup: [['Ctrl', 'T']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '→←',
    description: '重新打开关闭的标签',
    keyListGroup: [['Ctrl', 'Shift', 'T']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '↑←',
    description: '切换到左侧标签',
    keyListGroup: [['Ctrl', 'Shift', 'Tab']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '↑→',
    description: '切换到右侧标签',
    keyListGroup: [['Ctrl', 'Tab']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '↓←',
    description: '关闭所有标签',
    keyListGroup: [['Ctrl', 'Shift', 'W']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '↓→',
    description: '关闭当前标签',
    keyListGroup: [['Ctrl', 'W']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '←↑',
    description: '打开主页',
    keyListGroup: [['Alt', 'Home']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '←↓',
    description: '停止加载',
    keyListGroup: [['Esc']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '→↑',
    description: '强制刷新当前标签页',
    keyListGroup: [['Ctrl', 'F5']],
    command: ''
  },
  {
    type: 'shortcut',
    directions: '→↓',
    description: '刷新当前标签页',
    keyListGroup: [['F5']],
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
      applications: 'Visual Studio Code;Visual Studio Code - Insiders',
      taskInfoList: [...basicTaskInfoList]
    },
    {
      name: 'browser',
      title: '浏览器',
      applications: 'Google Chrome;Microsoft Edge;QQBrowser;Quark',
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

export interface Config {
  disableCapsLock: boolean
  blacklist: string
  tabInfoList: Array<TabList>
}
type TabList = {
  name?: string
  title: string
  applications: string
  taskInfoList: Array<TaskList>
}
export type TaskList = {
  type: 'shortcut' | 'command'
  directions: string
  description: string
  keyListGroup: Array<Array<string>>
  command?: string
}
