<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessageBox, type TabPaneName } from 'element-plus'
import { CloseBold, Setting, Edit } from '@element-plus/icons-vue'
import { config, basicTaskInfoList, TaskList } from '../stores/config'

const editableTabsValue = ref(config.tabInfoList[0].name)

const handleTabsEdit = (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
  if (action === 'add') {
    const newTabName = `${new Date().getTime()}`
    config.tabInfoList.push({
      name: newTabName,
      title: '新标签',
      applications: '',
      taskInfoList: basicTaskInfoList
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
</script>

<template>
  <div id="title-bar">
    <el-icon><Setting /></el-icon>
    <span>设置</span>
  </div>
  <el-scrollbar height="calc(100vh - 30px)">
    <el-tabs tab-position="left" style="padding: 20px 10px">
      <el-tab-pane label="手势设置">
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
              <el-form-item label="适用应用" required>
                <el-input v-model="item.applications" />
              </el-form-item>
            </el-form>
            <el-table :data="item.taskInfoList" style="width: 100%">
              <el-table-column prop="directions" label="手势" width="60px">
                <template #default="scope">
                  <img :src="`/src/assets/images/${scope.row.directions}.svg`" />
                </template>
              </el-table-column>
              <el-table-column prop="type" label="动作类型" width="120px">
                <template #default="scope">
                  <el-select v-model="scope.row.type" placeholder="Select">
                    <el-option key="shortcut" label="快捷键" value="shortcut" />
                    <el-option key="command" label="命令" value="command" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :prop="item.type" label="">
                <template #default="scope">
                  <el-input
                    v-if="scope.row.type === 'shortcut'"
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
                        @click="scope.row[scope.row.type] = ''"
                      />
                    </template>
                    <template #suffix>
                      <el-icon style="cursor: pointer" @click="scope.row.keyListGroup = []">
                        <CloseBold />
                      </el-icon>
                    </template>
                  </el-input>
                  <el-input
                    v-else-if="scope.row.type === 'command'"
                    v-model="scope.row[scope.row.type]"
                    placeholder="请输入命令"
                  >
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
        <el-form-item label="黑名单" label-width="90px" style="margin: 25px 10px">
          <el-input v-model="config.blacklist" placeholder="请输入应用名" />
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="CapsLock设置">
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
</style>
