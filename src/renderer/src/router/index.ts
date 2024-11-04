import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../components/MainWindow.vue') },
  { path: '/settings', component: () => import('../components/Settings.vue') }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
