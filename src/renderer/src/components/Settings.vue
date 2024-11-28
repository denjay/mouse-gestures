<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessageBox, type TabPaneName } from 'element-plus'
import { CloseBold, Setting, Edit, InfoFilled } from '@element-plus/icons-vue'
import { config } from '../stores/config'
import type { TaskList } from '../stores/data'
import { taskInfoList, defaultConfig } from '../stores/data'

const editableTabsValue = ref(config.tabInfoList[0].name)

const handleTabsEdit = (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
  if (action === 'add') {
    const newTabName = `${new Date().getTime()}`
    config.tabInfoList.push({
      name: newTabName,
      title: '新标签',
      applications: '',
      taskInfoList
    })
    editableTabsValue.value = newTabName
  } else if (action === 'remove') {
    const tabs = config.tabInfoList
    let activeName = editableTabsValue.value
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.name
          }
        }
      })
    }
    editableTabsValue.value = activeName
    config.tabInfoList = tabs.filter((tab) => tab.name !== targetName)
  }
}

// 记录输入的按键列表
let keyState: 'press' | 'release' = 'release'
let keyList: string[] = reactive([])
const curRow = ref<TaskList | null>(null)
function handleFocus(row) {
  keyState = 'release'
  keyList = reactive([])
  curRow.value = row
}
function handleBlur() {
  curRow.value = null
}
window.api.onKey((_, { key, type }) => {
  if (!curRow.value) return
  if (type === 'keydown') {
    if (keyState === 'release') {
      curRow.value.keyListGroup.push(keyList)
    }
    keyState = 'press'
    if (!keyList.includes(key)) {
      keyList.push(key)
    }
  } else if (type === 'keyup') {
    keyList = reactive([...keyList])
    keyList.splice(
      keyList.findLastIndex((item) => item === key),
      1
    )
    keyState = 'release'
  }
})
function getShortcut(row) {
  return row.keyListGroup.reduce((acc, cur) => {
    acc += ` ${cur.join('+')}`
    return acc
  }, '')
}
function editName(tabInfo) {
  ElMessageBox.prompt('', '修改标签名称', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.+$/,
    inputErrorMessage: '请输入合适的标签名称'
  }).then(({ value }) => {
    tabInfo.title = value
  })
}
function getSvgIcon(directions: string) {
  return new URL(`/src/assets/images/${directions}.svg`, import.meta.url).href
}
</script>

<template>
  <div id="title-bar">
    <el-icon><Setting /></el-icon>
    <span>设置</span>
  </div>
  <el-scrollbar height="calc(100vh - 30px)">
    <el-tabs tab-position="left" style="padding: 20px 10px">
      <el-tab-pane label="手势设置">
        <el-form :model="config" label-width="auto" inline style="padding: 10px">
          <el-form-item label="显示操作提示">
            <el-switch v-model="config.showTips" />
          </el-form-item>
          <el-form-item label="显示鼠标轨迹">
            <el-switch v-model="config.shopTrajectory" />
          </el-form-item>
          <el-form-item>
            <el-link type="primary" @click="config.$patch(defaultConfig)">
              重置所有手势设置
            </el-link>
          </el-form-item>
        </el-form>
        <el-tabs
          v-model="editableTabsValue"
          type="border-card"
          editable
          style="margin: 0 10px"
          @edit="handleTabsEdit"
        >
          <el-form :model="config" label-width="auto" style="padding: 0 10px"> </el-form>
          <el-tab-pane v-for="item in config.tabInfoList" :key="item.name" :name="item.name">
            <template #label>
              <span style="margin-right: 5px">{{ item.title }}</span>
              <el-icon
                v-show="item.name === editableTabsValue"
                @click="editName(item)"
                title="编辑标签名称"
              >
                <Edit />
              </el-icon>
            </template>
            <el-form :model="item" label-width="auto">
              <el-form-item required>
                <template #label>
                  <p class="applications-label">
                    <span>适用应用</span>
                    <el-tooltip
                      effect="dark"
                      content="多个应用名称用英文分号隔开，使用全局快捷键ctrl+alt+n可复制当前应用名称到剪贴板"
                      placement="top"
                    >
                      <el-icon><InfoFilled /></el-icon>
                    </el-tooltip>
                  </p>
                </template>
                <el-input v-model="item.applications" />
              </el-form-item>
            </el-form>
            <el-table :data="item.taskInfoList" style="width: 100%">
              <el-table-column prop="directions" label="手势" width="55px">
                <template #default="scope">
                  <img :src="getSvgIcon(scope.row.directions)" />
                </template>
              </el-table-column>
              <el-table-column prop="shortcut" label="快捷键">
                <template #default="scope">
                  <el-input
                    readonly
                    :value="getShortcut(scope.row)"
                    :placeholder="curRow === scope.row ? '正在录制按键' : '请录制按键'"
                    clearable
                    spellcheck="false"
                    @focus="handleFocus(scope.row)"
                    @blur="handleBlur"
                    @keydown="(event) => event.preventDefault()"
                  >
                    <template #prefix>
                      <img
                        src="/src/assets/images/keyboard.svg"
                        style="width: 20px; height: 20px"
                        @click="scope.row.shortcut = ''"
                      />
                    </template>
                    <template #suffix>
                      <el-icon style="cursor: pointer" @click="scope.row.keyListGroup = []">
                        <CloseBold />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述">
                <template #default="scope">
                  <el-input v-model="scope.row.description" placeholder="请输入描述" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
      <el-tab-pane label="CapsLock(待开发)">
        <el-form :model="config" label-width="auto" style="padding: 0 10px">
          <el-form-item label="CapsLock功能键">
            <el-switch v-model="config.disableCapsLock" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-scrollbar>
</template>

<style>
#title-bar {
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 10px;
}
.applications-label {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
