import { mapTwoLevelRouter } from '@/utils'
import { createRouter, createWebHashHistory } from 'vue-router'

const Layout = () => import('@/layouts/Layout.vue')
export const notFountCom = () => import('@/views/exception/404.vue')
export const notFountComName = 'not-found'
// export const NOTFDNAME = 'not-found'
export const HOME = '/'
export const REDIRECT = '/redirect'
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    hidden: true,
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/',
    redirect: '/personal/panel',
    // component: Layout,
    hidden: true,
  },
  {
    path: '/redirect',
    name: 'Redirect',
    component: Layout,
    hidden: true,
    meta: {
      noShowTabbar: true,
    },
    children: [
      {
        name: 'Redirect',
        path: '/redirect/:path(.*)*',
        component: (): any => import('@/views/redirect/index.vue'),
      },
    ],
  },
  // {
  //   path: '/index',
  //   component: Layout,
  //   name: 'Index',
  //   meta: {
  //     title: 'Dashboard',
  //     icon: 'dashboard-outlined',
  //   },
  //   children: [
  //     {
  //       path: 'home',
  //       name: 'Home',
  //       component: (): any => import('@/views/index/main.vue'),
  //       meta: {
  //         title: '主控台',
  //         affix: true,
  //         cacheable: true,
  //         icon: 'MenuOutlined',
  //       },
  //     },
  //   ],
  // },
  {
    path: '/personal',
    name: 'pagePersonal',
    component: Layout,
    meta: {
      title: '个人中心',
      icon: 'HomeOutlined',
    },
    children: [
      {
        path: 'panel',
        name: 'Personal',
        component: () => import('@/views/personal/index.vue'),
        meta: {
          affix: true,
          title: '先控面板',
          cacheable: true,
          // icon: '',
        },
      },

      //  性能评估
      {
        path: '/performance',
        name: 'performance',
        hidden: true,
        component: () => import('@/views/personal/performance.vue'),
        meta: {
          title: '性能评估',
          cacheable: true,
        },
      },
    ],
  },
  //  在线脚本
  {
    path: '/script',
    name: 'script',
    hidden: true,
    component: () => import('@/views/personal/script.vue'),
    meta: {
      title: '在线脚本',
    },
  },
  {
    path: '/iframe',
    // name: 'pagePersonal',
    component: Layout,
    hidden: true,
    meta: {
      title: '内嵌页面',
      isSingle: true,
    },
    children: [
      {
        path: '',
        name: 'iframe',
        component: () => import('@/views/iframe/index.vue'),
        meta: {
          title: '内嵌页面',
          icon: '',
          // cacheable: true,
        },
      },
    ],
  },
  //页面配置
  {
    path: '/configCenter',
    name: 'pageConfig',
    component: Layout,
    meta: {
      title: '配置中心',
      isSingle: true,
    },
    children: [
      {
        path: 'cfg',
        name: 'ConfigCenter',
        component: (): any => import('@/views/cfgCenter/index.vue'),
        meta: {
          title: '配置中心',
          icon: 'ApiFilled',
          cacheable: true,
          // affix: true,
        },
      },
    ],
  },
  //先进控制
  {
    path: '/ctr',
    name: 'Ctr',
    component: Layout,
    meta: {
      icon: 'controlOutlined',
      title: '先进控制',
    },
    children: [
      {
        path: 'config',
        name: 'Config',
        component: () => import('@/views/ctr/config.vue'),
        meta: {
          title: '控制器组态',
          cacheable: true,
        },
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    hidden: true,
    component: notFountCom,
  },
  {
    path: '/500',
    name: '500',
    hidden: true,
    component: () => import('@/views/exception/500.vue'),
  },
  {
    path: '/403',
    name: '403',
    hidden: true,
    component: () => import('@/views/exception/403.vue'),
  },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes: mapTwoLevelRouter(constantRoutes),
})

export default router
