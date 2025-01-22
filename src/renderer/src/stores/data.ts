export const defaultConfig: Config = {
  showTips: true,
  shopTrajectory: true,
  disableCapsLock: false,
  tabInfoList: [
    {
      name: 'vscode',
      title: 'vscode',
      applications: navigator.userAgent.includes('Win')
        ? 'Visual Studio Code;Visual Studio Code - Insiders'
        : 'Code;Code - Insiders',
      taskInfoList: [
        {
          directions: '↑',
          description: '向上滚动一屏',
          keyListGroup: [['PageUp']]
        },
        {
          directions: '↓',
          description: '向下滚动一屏',
          keyListGroup: [['PageDown']]
        },
        {
          directions: '←',
          description: '撤销',
          keyListGroup: [['Ctrl', 'Z']]
        },
        {
          directions: '→',
          description: '重做',
          keyListGroup: navigator.userAgent.includes('Win')
            ? [['Ctrl', 'Shift', 'Z']]
            : [['Ctrl', 'Y']]
        },
        {
          directions: '↓↑',
          description: '滚动到页首',
          keyListGroup: [['Ctrl', 'Home']]
        },
        {
          directions: '↑↓',
          description: '滚动到页尾',
          keyListGroup: [['Ctrl', 'End']]
        },
        {
          directions: '←→',
          description: '打开新标签',
          keyListGroup: [['Ctrl', 'N']]
        },
        {
          directions: '→←',
          description: '重新打开关闭的标签',
          keyListGroup: [['Ctrl', 'Shift', 'T']]
        },
        {
          directions: '↑←',
          description: '切换到左侧标签',
          keyListGroup: [['Ctrl', 'PageUp']]
        },
        {
          directions: '↑→',
          description: '切换到右侧标签',
          keyListGroup: [['Ctrl', 'PageDown']]
        },
        {
          directions: '↓←',
          description: '关闭所有标签',
          keyListGroup: [['Ctrl', 'Shift', 'W']]
        },
        {
          directions: '↓→',
          description: '关闭当前标签',
          keyListGroup: [['Ctrl', 'W']]
        },
        {
          directions: '←↑',
          description: '转到上一个更改',
          keyListGroup: [['Shift', 'Alt', 'F5']]
        },
        {
          directions: '←↓',
          description: '转到下一个更改',
          keyListGroup: [['Alt', 'F5']]
        },
        {
          directions: '→↑',
          description: '固定',
          keyListGroup: [
            ['Ctrl', 'K'],
            ['Shift', 'Enter']
          ]
        },
        {
          directions: '→↓',
          description: '格式化文档',
          keyListGroup: navigator.userAgent.includes('Win')
            ? [['Shift', 'Alt', 'F']]
            : [['Ctrl', 'Shift', 'I']]
        }
      ]
    },
    {
      name: 'browser',
      title: '浏览器',
      applications: navigator.userAgent.includes('Win')
        ? 'Google Chrome;Microsoft Edge;QQBrowser;Quark'
        : 'Google-chrome;Microsoft-edge;Org.deepin.browser',
      taskInfoList: [
        {
          directions: '↑',
          description: '向上滚动一屏',
          keyListGroup: [['PageUp']]
        },
        {
          directions: '↓',
          description: '向下滚动一屏',
          keyListGroup: [['PageDown']]
        },
        {
          directions: '←',
          description: '返回',
          keyListGroup: [['Alt', 'ArrowLeft']]
        },
        {
          directions: '→',
          description: '前进',
          keyListGroup: [['Alt', 'ArrowRight']]
        },
        {
          directions: '↓↑',
          description: '滚动到页首',
          keyListGroup: [['Home']]
        },
        {
          directions: '↑↓',
          description: '滚动到页尾',
          keyListGroup: [['End']]
        },
        {
          directions: '←→',
          description: '打开新标签',
          keyListGroup: [['Ctrl', 'T']]
        },
        {
          directions: '→←',
          description: '重新打开关闭的标签',
          keyListGroup: [['Ctrl', 'Shift', 'T']]
        },
        {
          directions: '↑←',
          description: '切换到左侧标签',
          keyListGroup: [['Ctrl', 'Shift', 'Tab']]
        },
        {
          directions: '↑→',
          description: '切换到右侧标签',
          keyListGroup: [['Ctrl', 'Tab']]
        },
        {
          directions: '↓←',
          description: '关闭所有标签',
          keyListGroup: [['Ctrl', 'Shift', 'W']]
        },
        {
          directions: '↓→',
          description: '关闭当前标签',
          keyListGroup: [['Ctrl', 'W']]
        },
        {
          directions: '←↑',
          description: '打开主页',
          keyListGroup: [['Alt', 'Home']]
        },
        {
          directions: '←↓',
          description: '停止加载',
          keyListGroup: [['Esc']]
        },
        {
          directions: '→↑',
          description: '强制刷新当前标签页',
          keyListGroup: [['Ctrl', 'F5']]
        },
        {
          directions: '→↓',
          description: '刷新当前标签页',
          keyListGroup: [['F5']]
        }
      ]
    }
  ]
}

// 空的taskInfoList,用于新增标签时用
export const taskInfoList = [
  {
    directions: '↑',
    description: '',
    keyListGroup: []
  },
  {
    directions: '↓',
    description: '',
    keyListGroup: []
  },
  {
    directions: '←',
    description: '',
    keyListGroup: []
  },
  {
    directions: '→',
    description: '',
    keyListGroup: []
  },
  {
    directions: '↓↑',
    description: '',
    keyListGroup: []
  },
  {
    directions: '↑↓',
    description: '',
    keyListGroup: []
  },
  {
    directions: '←→',
    description: '',
    keyListGroup: []
  },
  {
    directions: '→←',
    description: '',
    keyListGroup: []
  },
  {
    directions: '↑←',
    description: '',
    keyListGroup: []
  },
  {
    directions: '↑→',
    description: '',
    keyListGroup: []
  },
  {
    directions: '↓←',
    description: '',
    keyListGroup: []
  },
  {
    directions: '↓→',
    description: '',
    keyListGroup: []
  },
  {
    directions: '←↑',
    description: '',
    keyListGroup: []
  },
  {
    directions: '←↓',
    description: '',
    keyListGroup: []
  },
  {
    directions: '→↑',
    description: '',
    keyListGroup: []
  },
  {
    directions: '→↓',
    description: '',
    keyListGroup: []
  }
]

export interface Config {
  showTips: boolean
  shopTrajectory: boolean
  disableCapsLock: boolean
  tabInfoList: Array<TabList>
}
type TabList = {
  name?: string
  title: string
  applications: string
  taskInfoList: Array<TaskList>
}
export type TaskList = {
  directions: string
  description: string
  keyListGroup: Array<Array<string>>
}
