import { createApp } from 'vue'
import App from './App.vue'
// import 'default-passive-events'
import LayoutStore from './layouts'
import './styles/index.css'
import router from './router'
import { DeviceType } from './types/store'
import './utils/router'
import '../mock'
import { Direction } from '@/directive'
// import 'ant-design-vue/dist/antd.css'
import './styles/theme/antd.dark.min.css'
import './styles/theme/antd.min.css'
import pinia from './store/pinia'

function getScreenType() {
  const width = document.body.clientWidth
  if (width <= 768) {
    return DeviceType.MOBILE
  } else if (width < 992 && width > 768) {
    return DeviceType.PAD
  } else if (width < 1200 && width >= 992) {
    return DeviceType.PC
  } else {
    return DeviceType.PC
  }
}

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(LayoutStore, {
  state: {
    device: getScreenType(),
  },
  actions: {
    onPersonalCenter() {
      router.push('/personal')
    },
    onLogout() {
      router.replace({ path: '/login', query: { redirect: '/' } }).then(() => {
        window.location.reload()
      })
    },
  },
})
//注册自定义指令
Object.keys(Direction).forEach((name, i) => {
  app.directive(name, Direction[name])
})

router.isReady().then(() => {
  app.mount('#app')
})
