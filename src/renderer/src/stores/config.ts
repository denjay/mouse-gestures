import { watch } from 'vue'
import { defineStore } from 'pinia'
import { defaultConfig } from './data'

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
