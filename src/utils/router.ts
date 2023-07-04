import router, { constantRoutes, notFountCom } from '../router'
import Cookies from 'js-cookie'
import { post } from '@/api/http'
import { OriginRoute } from '@/types/router'
import { getMenuListByRoleId } from '@/api/url'
import { RouteRecordRaw } from 'vue-router'
import { isExternal, mapTwoLevelRouter, toHump } from './index'
import Layout from '@/layouts/Layout.vue'
import layoutStore from '@/store'
import { defineAsyncComponent } from 'vue'
import LoadingComponent from '@/layouts/loading/index.vue'
// import Page404 from '@/views/exception/404.vue'
import { USER_TOKEN_KEY } from '@/layouts/setting/keys'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import useUserStore from '@/store/modules/user'
import pinia from '@/store/pinia'
import { getPageDataApi, getPagesByUser } from '@/api/modules'
const userStore = useUserStore(pinia)
NProgress.configure({
  showSpinner: false,
})

// interface OriginRoute {
//   menuUrl: string
//   menuName?: string
//   hidden?: boolean
//   outLink?: string
//   affix?: boolean
//   cacheable?: boolean
//   iconPrefix?: string
//   icon?: string
//   badge?: string | number
//   isSingle?: boolean
//   children: Array<OriginRoute>
// }

type RouteRecordRawWithHidden = RouteRecordRaw & { hidden: boolean }

export async function getRoutes() {
  try {
    const res = await getPagesByUser(userStore.userName)
    userStore.menus = res
    const preMenus: OriginRoute[] = sortTree(userStore.menus)
    return generatorRoutes(preMenus)
  } catch (error) {
    userStore.logout()
  }
}

function loadComponents() {
  return import.meta.glob('../views/**/*.vue')
}

const asynComponents = loadComponents()
function urlFormatter(it: OriginRoute): string {
  return it.url.startsWith('/') ? it.url : '/' + it.url
}
function getComponent(it: OriginRoute) {
  // return defineAsyncComponent({
  //   loader: asynComponents['../views' + urlFormatter(it) + '.vue'],
  //   delay: 2000,
  //   loadingComponent: LoadingComponent,
  //   // 加载失败后展示的组件
  //   // errorComponent: Page404,
  // })

  return asynComponents['../views' + urlFormatter(it) + '.vue']
}

function getCharCount(str: string, char: string) {
  const regex = new RegExp(char, 'g')
  const result = str.match(regex)
  const count = !result ? 0 : result.length
  return count
}

function isMenu(path: string) {
  return getCharCount(path, '/') === 1 && path.startsWith('/')
}

function getNameByUrl(menuUrl: string) {
  const temp = menuUrl.split('/')
  const IndexTemp = temp.slice(-2).join('-')
  return toHump(temp[temp.length - 1] === 'index' ? IndexTemp : temp[temp.length - 1])
}
/**
 * 菜单排序
 * @param tree 节点
 * @param property 排序属性
 */
export function sortTree(tree: Array<OriginRoute>) {
  const stack = []
  stack.push(...tree)
  while (stack.length > 0) {
    const node = stack.pop() as OriginRoute
    if (node?.children) {
      stack.push(...node.children)
      node.children.sort((a, b) => a.sortNumber - b.sortNumber)
    }
  }
  tree.sort((a, b) => a.sortNumber - b.sortNumber)
  return tree
}
function generatorRoutes(res: Array<OriginRoute>) {
  const tempRoutes: Array<RouteRecordRawWithHidden> = []
  res.forEach((it) => {
    const route: RouteRecordRawWithHidden | any = {
      path: it.outLink && isExternal(it.outLink) ? it.outLink : urlFormatter(it) || '',
      name: getNameByUrl(it.url),
      hidden: !!it.isHidden,
      component: isMenu(it.url) ? Layout : getComponent(it),
      meta: {
        title: it.name,
        affix: !!it.isFixed,
        cacheable: !!it.isCache,
        icon: it.icon || 'MenuOutlined',
        isSingle: !!it.isSingle,
      },
    }
    if (it.children && it.children.length > 0) {
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

router.beforeEach(async (to, from) => {
  NProgress.start()
  if (whiteRoutes.includes(to.path)) {
    return true
    // next()
  } else {
    if (!isTokenExpired()) {
      return {
        path: '/login',
        /**
         * 可以配置首页路径
         */
        query: { redirect: to.fullPath },
      }
    } else {
      const isEmptyRoute = layoutStore.isEmptyPermissionRoute()
      if (isEmptyRoute) {
        console.warn('执行一次')
        // 加载路由
        const accessRoutes: Array<RouteRecordRaw> = []
        const tempRoutes = (await getRoutes()) as Array<RouteRecordRaw>
        accessRoutes.push(...tempRoutes)
        const mapRoutes = mapTwoLevelRouter(accessRoutes)
        mapRoutes.forEach((it: any) => {
          router.addRoute(it)
        })

        router.addRoute({
          path: '/:pathMatch(.*)*',
          redirect: '/404',
          name: 'not-found',
          hidden: true,
        } as RouteRecordRaw)

        layoutStore.initPermissionRoute([...constantRoutes, ...accessRoutes])
        return { ...to, replace: true }
      } else {
        return true
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
