<template>
  <!-- <component :is="tag"> -->
  <a-menu
    :mode="menuMode"
    :theme="theme"
    :inline-collapsed="state.device === 'mobile' ? false : state.isCollapse"
    v-model:selectedKeys="defaultPath"
    v-model:openKeys="defaultExpandKeys"
    @select="onMenuClick"
  >
    <template v-for="item of menuOptions" :key="item.key">
      <template v-if="!item.children">
        <a-menu-item :key="item.key" :title="item.label">
          <template #icon>
            <component :is="item.icon || 'MenuOutlined'" />
          </template>
          {{ item.label }}
        </a-menu-item>
      </template>
      <template v-else>
        <SubMenu :key="item.key" :menu-info="item" />
      </template>
    </template>
  </a-menu>
  <!-- </component> -->
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
    PropType,
    ref,
    shallowReactive,
    watch,
    watchEffect,
  } from 'vue'
  import { LocationQueryValue, useRoute, useRouter } from 'vue-router'
  import { useLayoutStore } from '../../index'
  import { RouteRecordRawWithHidden } from '../../../types/store'
  import { isExternal, transfromMenu } from '../../../utils'
  import { MenuOption } from '@/utils'
  const IframeName = 'Iframe'
  export default defineComponent({
    name: 'ScrollerMenu',
    props: {
      routes: {
        type: Object as PropType<Array<RouteRecordRawWithHidden>>,
        require: true,
      },
      mode: {
        type: String,
        default: 'inline',
      },
    },
    setup(props) {
      const store = useLayoutStore()
      const menuOptions = shallowReactive([] as Array<any>)
      const defaultPath = ref([] as Array<string | LocationQueryValue | LocationQueryValue[]>)
      const defaultExpandKeys = ref([] as Array<string>)
      const menuMode = computed(() => props.mode)
      const tag = ref(menuMode.value === 'inline' ? 'Scrollbar' : 'div')
      const theme = computed(() => {
        if (store.state.theme === 'dark') {
          return 'dark'
        }
        if (store.state.layoutMode === 'ttb') {
          return 'light'
        }
        return store.state.sideBarBgColor === 'image' ? 'dark' : store.state.sideBarBgColor
      })
      const currentRoute = useRoute()
      const router = useRouter()
      const currentRoutePath =
        currentRoute.name === IframeName
          ? currentRoute.query.url || currentRoute.fullPath
          : currentRoute.fullPath
      defaultPath.value.push(currentRoutePath)
      onMounted(() => {
        handleMenu(props.routes)
        handleExpandPath()
      })
      /**
       * 菜单渲染
       * @param routes
       */
      function handleMenu(routes?: Array<RouteRecordRawWithHidden>) {
        menuOptions.length = 0
        const tempMenus = transfromMenu(routes || [])
        menuOptions.push(...tempMenus)
      }
      /**
       * 找到
       * @param tree 菜单
       * @param code 菜单key
       */
      function getAllParentNodes(
        tree: MenuOption[],
        code: string | LocationQueryValue | LocationQueryValue[]
      ) {
        let arr: any = [] //要返回的数组
        for (let i = 0; i < tree.length; i++) {
          let item = tree[i]
          arr = []
          arr.push(item.key)
          if (code == item.key) {
            return arr
          } else {
            if (item.children && item.children.length > 0) {
              //合并子节点返回的数据
              arr = arr.concat(getAllParentNodes(item.children, code))
              if (arr.includes(code)) {
                //如果当前数据中已包含默认节点，则退出循环、返回数据
                return arr
              }
            }
          }
        }
      }
      function handleExpandPath() {
        if (props.mode === 'inline') {
          const paths =
            currentRoute.name === IframeName
              ? currentRoute.query.url || currentRoute.fullPath
              : currentRoute.fullPath
          let pathList = getAllParentNodes(menuOptions, paths)
          // const paths = currentRoute.fullPath.split('/')
          // const pathList = paths
          //   .filter((it) => !!it)
          //   .reduce((pre: Array<string>, cur: string) => {
          //     const lastItem = pre[pre.length - 1] || ''
          //     pre.push(lastItem + '/' + cur)
          //     return pre
          //   }, [])
          defaultExpandKeys.value = pathList
        }
      }
      function onMenuClick({ key, item, keyPath }: any) {
        if (isExternal(key)) {
          window.open(key)
        } else {
          let isIframe = router.getRoutes().find((item) => item.path === key)?.components

          // if (!isIframe)
          //   return router.push({
          //     name: IframeName,
          //     query: {
          //       url: key,
          //       title: item.title,
          //     },
          //   })
          router.push(key)
          if (store.state.device === 'mobile') {
            store.toggleCollapse(true)
          }
        }
      }
      watch(
        () => router.currentRoute.value,
        (newVal) => {
          let newPath =
            newVal.name === IframeName ? newVal.query.url || newVal.fullPath : newVal.fullPath
          defaultPath.value = [newPath]
          handleExpandPath()
        }
      )
      watch(
        () => props.mode,
        (newVal) => {
          newVal === 'inline' ? 'Scrollbar' : 'div'
        }
      )
      watchEffect(() => {
        handleMenu(props.routes)
      })
      return {
        tag,
        menuMode,
        defaultPath,
        defaultExpandKeys,
        state: store?.state,
        menuOptions,
        onMenuClick,
        theme,
      }
    },
  })
</script>

<style lang="less" scoped>
  :deep(.ant-menu.ant-menu-inline-collapsed) {
    width: 65px !important;
  }
  :deep(.ant-menu-horizontal) {
    border-bottom: none !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-active:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-active:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-open:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  :deep(.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover:after) {
    border-bottom: 3px solid #1890ff !important;
  }
  .scrollbar {
    height: calc(100vh - @logoHeight) !important;
    overflow-y: auto;
  }
</style>
