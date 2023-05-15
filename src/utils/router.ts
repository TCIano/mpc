import router, { constantRoutes, notFountCom } from '../router'
import Cookies from 'js-cookie'
import { post } from '@/api/http'
import { getMenuListByRoleId } from '@/api/url'
import { RouteRecordRaw } from 'vue-router'
import { isExternal, mapTwoLevelRouter, toHump } from './index'
import Layout from '@/layouts/Layout.vue'
import layoutStore from '@/store'
import { defineAsyncComponent } from 'vue'
import LoadingComponent from '@/layouts/loading/index.vue'
import { USER_TOKEN_KEY } from '@/layouts/setting/keys'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import useUserStore from '@/store/modules/user'
import pinia from '@/store/pinia'

const userStore = useUserStore(pinia)

NProgress.configure({
  showSpinner: false,
})

interface OriginRoute {
  menuUrl: string
  menuName?: string
  hidden?: boolean
  outLink?: string
  affix?: boolean
  cacheable?: boolean
  iconPrefix?: string
  icon?: string
  badge?: string | number
  isSingle?: boolean
  children: Array<OriginRoute>
}

type RouteRecordRawWithHidden = RouteRecordRaw & { hidden: boolean }

function getRoutes() {
  return post({
    url: getMenuListByRoleId,
    data: {
      userId: userStore.userId,
      roleId: userStore.roleId,
    },
  }).then((res: any) => {
    return generatorRoutes(res.data)
  })
}

function loadComponents() {
  console.log(import.meta.glob('../views/**/*.vue'))

  return import.meta.glob('../views/**/*.vue')
}

const asynComponents = loadComponents()

function getComponent(it: OriginRoute) {
  // return defineAsyncComponent({
  //   loader: asynComponents['../views' + it.menuUrl + '.vue'],
  //   loadingComponent: LoadingComponent,
  // })
  return asynComponents['../views' + it.menuUrl + '.vue']
}

function getCharCount(str: string, char: string) {
  const regex = new RegExp(char, 'g')
  const result = str.match(regex)
  const count = !result ? 0 : result.length
  return count
}

function isMenu(path: string) {
  return getCharCount(path, '/') === 1
}

function getNameByUrl(menuUrl: string) {
  const temp = menuUrl.split('/')
  const IndexTemp = temp.slice(-2).join('-')
  return toHump(temp[temp.length - 1] === 'index' ? IndexTemp : temp[temp.length - 1])
}

function generatorRoutes(res: Array<OriginRoute>) {
  const tempRoutes: Array<RouteRecordRawWithHidden> = []
  res.forEach((it) => {
    const route: RouteRecordRawWithHidden | any = {
      path: it.outLink && isExternal(it.outLink) ? it.outLink : it.menuUrl,
      name: getNameByUrl(it.menuUrl),
      hidden: !!it.hidden,
      component: isMenu(it.menuUrl) ? Layout : getComponent(it) || undefined,
      meta: {
        title: it.menuName,
        affix: !!it.affix,
        cacheable: !!it.cacheable,
        icon: it.icon || 'MenuOutlined',
        isSingle: !!it.isSingle,
      },
    }
    if (it.children) {
      route.children = generatorRoutes(it.children)
    }
    tempRoutes.push(route)
  })
  return tempRoutes
}

const whiteRoutes: string[] = ['/login', '/404']

function isTokenExpired(): boolean {
  const token = Cookies.get(USER_TOKEN_KEY)
  return !!token
}

router.beforeEach(async (to) => {
  NProgress.start()
  if (whiteRoutes.includes(to.path)) {
    return true
    // next()
  } else {
    if (!isTokenExpired()) {
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      }
      // next({
      //   path: '/login',
      //   query: { redirect: to.fullPath },
      // })
    } else {
      const isEmptyRoute = layoutStore.isEmptyPermissionRoute()
      if (isEmptyRoute) {
        // 加载路由
        const accessRoutes: Array<RouteRecordRaw> = []
        const tempRoutes = await getRoutes()
        accessRoutes.push(...tempRoutes)
        const mapRoutes = mapTwoLevelRouter(accessRoutes)
        console.log(mapRoutes)

        mapRoutes.forEach((it: any) => {
          router.addRoute(it)
        })
        // const isNotFd = router.getRoutes().findIndex((item) => item.name === NOTFDNAME)
        // if (isNotFd === -1) {
        router.addRoute({
          path: '/:pathMatch(.*)*',
          // redirect: '/404',
          name: 'not-found',
          component: notFountCom,
          hidden: true,
        } as RouteRecordRaw)
        // }
        layoutStore.initPermissionRoute([...constantRoutes, ...accessRoutes])
        // next({ ...to })
        return { ...to, replace: true }
      } else {
        return true
        // next()
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
