<template>
  <a-row :gutter="10">
    <a-col :md="6" :sm="10" :xs="12">
      <a-card
        class="auto-scroll"
        :style="{ height: treeHeight + 'px' }"
        :bodyStyle="{ padding: '5px' }"
        :headerStyle="{ padding: '5px' }"
      >
        <a-input-search placeholder="搜索" v-model:value="searchText" size="small" />
        <div class="h-full mt-4">
          <a-tree
            show-line
            show-icon
            :auto-expand-parent="autoExpandParent"
            :expandedKeys="expandedKeys"
            :tree-data="tree"
            @expand="onExpand"
          >
            <!-- <div class="flex"> -->
            <template #title="{ title, key }">
              <span v-if="title.indexOf(searchText) > -1">
                {{ title?.substr(0, title.indexOf(searchText)) }}
                <span style="color: #f03e3e">{{ searchText }}</span>
                {{ title?.substr(title.indexOf(searchText) + searchText.length) }}
              </span>
              <span v-else>{{ title }}</span>
            </template>
            <template #icon="{ title, key }">
              <template v-if="key === '0-0'">
                <span class="ball"></span>
                <!-- <up-circle-outlined /> -->
              </template>
            </template>
            <!-- </div> -->
          </a-tree>
        </div>
      </a-card>
    </a-col>
    <a-col :md="18" :sm="14" :xs="12">
      <div class="right-top-title" ref="topV">
        <a-row :gutter="[10, 10]">
          <a-col :md="8" :sm="12" :xs="24" v-for="item in 3">
            <div
              class="flex items-center justify-between w-full h-28 pl-7 pr-7 bg-gradient-to-r from-blue-200 to-blue-400"
            >
              <div class="flex-wrap justify-items-center">
                <div class="mb-1 text-lg font-thin text-white">工程总数</div>
                <div class="text-2xl font-medium text-white">4</div>
              </div>
              <div class="w-12 h-12 bg-black"></div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[10, 10]" class="mt-1">
          <a-col>
            <a-radio-group v-model:value="status">
              <a-radio-button value="total">全部</a-radio-button>
              <a-radio-button value="run">正在运行</a-radio-button>
              <a-radio-button value="loaded">已加载</a-radio-button>
            </a-radio-group>
          </a-col>
        </a-row>
      </div>
      <table-body ref="tableBody">
        <div class="auto-scroll" :style="{ height: cardGridHei + 'px', padding: '5px' }">
          <cardItem />
        </div>
      </table-body>
      <table-footer ref="tableFooterRef"></table-footer>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="Personal">
  import cardItem from './components/card-item.vue'
  import { useTableHeight } from '@/hooks/table'
  import { ref, onMounted, getCurrentInstance, onBeforeUnmount, watch, reactive } from 'vue'
  import type { TreeProps } from 'ant-design-vue'
  import { DataNode } from 'ant-design-vue/lib/tree'
  import { post } from '@/api/http'
  import { getCardList } from '@/api/url'
  import { usePagination, useTable } from '@/hooks/table'
  import { debounce } from '@/utils/utils'
  const tree = ref<TreeProps['treeData']>([
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          children: [
            { title: 'leaf222', key: '0-0-0-0' },
            {
              key: '0-0-0-1',
              title: 'lea00001f',
            },
            { title: 'leaf112', key: '0-0-0-2' },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [{ title: 'leaf11', key: '0-0-1-0' }],
        },
        {
          title: 'parent 1-2',
          key: '0-0-2',
          children: [
            { title: 'leaf 1', key: '0-0-2-0' },
            {
              title: 'leaf 21',
              key: '0-0-2-1',
            },
            { title: 'leaf 1', key: '0-0-2-5' },
            {
              title: 'leaf 22',
              key: '0-0-2-2',
            },
            { title: 'leaf 1', key: '0-0-2-4' },
            {
              title: 'leaf 23',
              key: '0-0-2-3',
            },
            {
              title: 'leaf 24',
              key: '0-0-2-6',
            },
            {
              title: 'leaf 25',
              key: '0-0-2-7',
            },
            {
              title: 'leaf 26',
              key: '0-0-2-8',
            },
            {
              title: 'leaf 27',
              key: '0-0-2-19',
            },
            {
              title: 'leaf 28',
              key: '0-0-2-29',
            },
            {
              title: 'leaf 29',
              key: '0-0-2-39',
            },
            {
              title: 'leaf 222',
              key: '0-0-2-49',
            },
          ],
        },
      ],
    },
    {
      title: 'parent 3',
      key: '0-23',
      children: [
        {
          title: 'parent 3-0',
          key: '0-1-0',
          children: [
            { title: 'leaf1', key: '0-1-1-1' },
            { title: 'leaf2', key: '0-1-2-2' },
          ],
        },
      ],
    },
  ])
  const status = ref<string>('total')
  const expandedKeys = ref<(string | null)[]>([])
  const selectedKeys = ref<string[]>([])
  const checkedKeys = ref<string[]>([])
  const autoExpandParent = ref<boolean>(true)
  const tableFooterRef = ref<HTMLElement>()
  const topV = ref<HTMLElement>()
  const treeHeight = ref()
  const cardGridHei = ref()
  const footerHeight = ref()
  const contentHeight = ref()
  //搜索索引
  const searchText = ref('')
  const onExpand = (keys: string[]) => {
    expandedKeys.value = keys
    autoExpandParent.value = false
  }
  //组织机构搜索
  const dataList: TreeProps['treeData'] = []
  const getParentKey = (key: string | number, tree: TreeProps['treeData'] | any): string => {
    let parentKey: any
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some((item: DataNode) => item.key === key)) {
          parentKey = node.key
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children)
        }
      }
    }
    return parentKey
  }
  //扁平化
  const generateList = (data: TreeProps['treeData']) => {
    if (data?.length) {
      for (let i = 0; i < data.length; i++) {
        const node = data[i]
        const key = node.key
        const title = node.title
        dataList.push({ key, title })
        if (node.children) {
          generateList(node.children)
        }
      }
    }
    // return data.reduce((res:DataNode[], node) => {
    //   const key = node.key
    //   const title = node.title
    //   res.push({ key, title })
    // }, [])
  }
  generateList(tree.value)
  const getExpanded = (value: string) => {
    const expanded = dataList
      .map((item: DataNode, index: number, arr) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, tree.value)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)
    console.log(expanded)
    expandedKeys.value = expanded
    searchText.value = value
    autoExpandParent.value = true
  }
  const debounceExpanded = debounce(getExpanded)
  watch(searchText, (value) => {
    debounceExpanded(value)
  })
  /**
   * 设置元素高度
   */
  const setElementHeigth = () => {
    contentHeight.value = window.innerHeight
    let topH = document.querySelector('.fixed-nav-bar')?.getBoundingClientRect().height || 0
    let footerContainerH =
      document.querySelector('.footer-container')?.getBoundingClientRect().height || 0
    cardGridHei.value =
      contentHeight.value -
      (topV.value?.offsetHeight || 0) -
      (footerHeight.value || 0) -
      topH -
      footerContainerH -
      20
  }
  /**
   * 防抖
   */
  const cancelReseize: any = debounce(setElementHeigth, 200)
  window.addEventListener('resize', cancelReseize)
  onMounted(async () => {
    console.log(getCurrentInstance())

    cancelReseize()
    footerHeight.value = (tableFooterRef.value as any).$el.offsetHeight
    treeHeight.value = (await useTableHeight(getCurrentInstance())) + footerHeight.value
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', cancelReseize)
  })
</script>

<style scoped lang="less">
  .ball {
    width: 20px;
    height: 20px;
    display: block;
    background: black;
    border-radius: 50%;
    margin: 0;
    background: radial-gradient(circle at 100px 100px, #d0eccc, #6be7a3);
  }
</style>
