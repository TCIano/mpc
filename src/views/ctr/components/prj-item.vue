<template>
  <div>
    <div class="flex">
      <a-input-search placeholder="搜索" v-model:value="searchText" size="small" />
      <div class="flex justify-center align-bottom">
        <plus-outlined
          class="text-lg cursor-pointer height hover:bg-blue-300"
          @click="onAddGroup"
        />
      </div>
    </div>
    <div class="auto-scroll" :style="{ height: treeHeight - 30 + 'px' }">
      <a-tree
        v-if="tree?.length"
        v-model:selectedKeys="selectTreeNode"
        block-node
        draggable
        show-icon
        defaultExpandAll
        :fieldNames="fieldNames"
        :auto-expand-parent="autoExpandParent"
        :tree-data="tree"
        @drop="onTreeDrop"
      >
        <template #title="{ name, id, dataRef }">
          <!-- 右键菜单 -->
          <a-dropdown :trigger="['contextmenu']">
            <div
              :style="
                dataRef.type === 'mpc'
                  ? {
                      height: '20px',
                      width: '80%',
                      margin: '0 auto',
                      display: 'inline-block',
                      lineHeight: '20px',
                    }
                  : { display: 'inline-block' }
              "
            >
              <span
                v-if="name.indexOf(searchText) > -1"
                @dblclick="onContextMenuClick('load', dataRef)"
              >
                {{ name?.substr(0, name.indexOf(searchText)) }}
                <span style="color: #f03e3e">{{ searchText }}</span>
                {{ name?.substr(name.indexOf(searchText) + searchText.length) }}
              </span>
              <span style="width: 80%" v-else>{{ name }}</span>
            </div>
            <template #overlay>
              <a-menu @click="({ key: menuKey }) => onContextMenuClick(menuKey, dataRef)">
                <a-menu-item :disabled="dataRef.type === 'node' || !!dataRef.state" key="load"
                  >加载</a-menu-item
                >
                <a-menu-item :disabled="dataRef.type === 'node' || !dataRef.state" key="unLoad"
                  >卸载</a-menu-item
                >
              </a-menu>
            </template>
          </a-dropdown>
          <a-space v-show="selectTreeNode?.[0] === id" class="ml-3">
            <plus-outlined @click="onAddGroup(dataRef)" v-if="dataRef.type === 'node'" />
            <edit-outlined @click.prevent="onEditNode(dataRef)" v-if="dataRef.type === 'node'" />
            <delete-outlined @click="onDeleteNode(dataRef)" v-if="dataRef.type === 'node'" />
          </a-space>
        </template>
        <template #icon="{ data }">
          <template v-if="data.type === 'node'">
            <folder-open-outlined />
          </template>
          <template v-else>
            <file-markdown-outlined />
          </template>
        </template>
      </a-tree>
    </div>
    <DrawerDialog
      ref="drawerDialog"
      :title="drawerDiaTitle"
      @confirm="onConfirmNode"
      @cancel="restForm"
    >
      <template #content>
        <a-form ref="formRef" name="form" :model="formState">
          <a-form-item
            label="节点名称"
            name="name"
            :rules="[{ required: true, message: '请输入节点名称!' }]"
          >
            <a-input v-model:value="formState.name"></a-input>
          </a-form-item>
          <a-form-item> </a-form-item>
        </a-form>
      </template>
    </DrawerDialog>
  </div>
</template>

<script setup lang="ts" name="PrjItem">
  import {
    ref,
    reactive,
    toRefs,
    onBeforeMount,
    onMounted,
    watchEffect,
    computed,
    watch,
  } from 'vue'
  import { TreeNodes, Prjs, NodeType } from '@/types/apis/ctr/nodes'
  import { FormInstance, TreeProps, message } from 'ant-design-vue'
  import type { AntTreeNodeDragEnterEvent, AntTreeNodeDropEvent } from 'ant-design-vue/es/tree'
  import { AntTreeNodeSelectedEvent, DataNode } from 'ant-design-vue/lib/tree'
  import { DrawerDialogType } from '@/types/components'
  import { debounce } from '@/utils/utils'
  import {
    AddNodeApi,
    deleteNodeApi,
    getPrjNodeTreeApi,
    updateNodeApi,
  } from '@/api/modules/ctr/nodes'
  import { RemoveNodeApi } from '@/api/modules/ctr/nodes'
  import { cloneDeep } from 'lodash-es'
  const formRef = ref<FormInstance>()
  const selectTreeNode = ref<TreeProps['selectedKeys']>()
  const drawerDialog = ref<DrawerDialogType>()
  const drawerDiaTitle = ref('')
  const expandedKeys = ref<(string | null)[]>([])
  const treeHeight = ref()
  const autoExpandParent = ref<boolean>(true)

  const useFormState = () => ({
    name: '',
  })
  const emit = defineEmits(['onLoadNode', 'onUnLoadNode'])
  const formState = ref<any>(useFormState())
  //增加组
  const restForm = () => {
    Object.assign(formState.value, useFormState())
    formRef.value?.clearValidate()
    formRef.value?.resetFields()
  }
  const dataNodeRef = ref<TreeNodes>()
  const onAddGroup = async (dataRef: any) => {
    restForm()
    dataNodeRef.value = cloneDeep(dataRef)
    drawerDiaTitle.value = '新建节点'
    drawerDialog.value?.toggle()
  }
  const onEditNode = async (dataRef: any) => {
    drawerDiaTitle.value = '编辑节点'
    dataNodeRef.value = dataRef
    for (const key in formState.value) {
      if (Object.keys(dataRef).includes(key)) {
        formState.value[key] = dataRef[key]
      }
    }

    drawerDialog.value?.toggle()
  }
  const onDeleteNode = async (dataRef: any) => {
    await deleteNodeApi(dataRef.id)
    message.success('删除' + dataRef.name + '成功')
    getPrjNodeTree()
  }
  //抽取确认
  const onConfirmNode = async () => {
    const option = {
      name: formState.value.name,
      type: (dataNodeRef?.value?.type as NodeType) ?? 'node',
    }
    if (drawerDiaTitle.value === '新建节点') {
      await AddNodeApi({
        ...option,
        parentId: dataNodeRef?.value?.type === 'node' ? dataNodeRef.value?.id : '',
      })
    } else {
      await updateNodeApi({
        ...option,
        id: dataNodeRef.value?.id,
        parentId: dataNodeRef?.value?.parentId,
      })
    }
    restForm()
    drawerDialog.value?.toggle()
    getPrjNodeTree()
  }
  const onContextMenuClick = (menuKey: string, dataRef: any) => {
    if (menuKey === 'load') {
      emit('onLoadNode', dataRef)
    } else {
      emit('onUnLoadNode', dataRef)
    }
  }
  const fieldNames: TreeProps['fieldNames'] = {
    children: 'children',
    title: 'name',
    key: 'id',
  }
  const tree = ref<TreeNodes[]>()
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
      if (node.prjs) {
        if (node.prjs.some((item: DataNode) => item.nodeId === key)) {
          parentKey = node.id
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children)
        }
      }
    }
    return parentKey
  }
  //扁平化

  const generateList = (data: any) => {
    if (data?.length) {
      for (let i = 0; i < data.length; i++) {
        const node = data[i]
        const key = node.id
        const id = node.nodeId || node.id
        const title = node.name
        dataList.push({ key, title, id })
        if (node.prjs) {
          generateList(node.prjs)
        }
      }
    }
  }
  const getExpanded = (value: string) => {
    const expanded = dataList
      .map((item: DataNode, index: number, arr) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.id, tree.value)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)

    expandedKeys.value = expanded
    searchText.value = value
    autoExpandParent.value = true
  }

  const debounceExpanded = debounce(getExpanded)
  watch(searchText, (value) => {
    debounceExpanded(value)
  })
  // 拖动
  const onTreeDrop = async (
    dInfo: AntTreeNodeDropEvent & TreeNodes & AntTreeNodeDragEnterEvent
  ) => {
    try {
      let dstNodeId = ''
      let srcPrjNames = [] as string[]
      const dropNode = dInfo.dragNode
      const node = dInfo.node
      const dropToGap = dInfo.dropToGap
      // dropToGap===true 添加在节点缝隙中 也就是同级添加，目标节点的父节点才是真正的父节点
      // dropToGap===false 添加节点在内容之中 也就是目标节点作为父节点
      if (dropToGap) {
        //同级添加,使用拖曳节点的nodeid（父级节点id）
        //1. 工程节点移动到目标工程节点下方，=== 工程节点移动到目标工程节点的父级节点 使用nodeId代表当前目标节点的父节点
        //2. 工程节点移动到控制器目录 === 控制器目录就是工程节点的父级节点，用id作为父级节点
        dstNodeId = (node.parentId || node.nodeId) ?? ''
        srcPrjNames = [dropNode.name]
      } else {
        //非同级拖曳，使用目标节点的id
        dstNodeId = node.id
        srcPrjNames = [dropNode.name]
      }
      await RemoveNodeApi({
        dstNodeId,
        srcPrjNames,
      })
    } catch (error) {}
    getPrjNodeTree()
  }
  /**
   * 节点处理
   * @param res 节点
   */
  const handleNode = (res: any) => {
    for (let index = 0; index < res.length; index++) {
      const item = res[index]
      if (item.prjs && item.prjs.length > 0) {
        item.prjs.forEach((prj: any) => {
          prj.id = prj.name + prj.type
          item.children.push(prj)
        })
      }
      item.children && handleNode(item.children)
    }
    return res
  }
  // 获取所有工程
  const getPrjNodeTree = async () => {
    const res = await getPrjNodeTreeApi()
    tree.value = handleNode(res as TreeNodes[])
    generateList(tree.value)
  }
  //修改节点状态
  function updateNodeValue(node: any, name: string, newValue: number, prop: string) {
    if (node.name === name) {
      node[prop] = newValue
    }
    if (node.children) {
      node.children.forEach((child: any) => updateNodeValue(child, name, newValue, prop))
    }
  }
  //修改节点状态
  const reSetPrjState = (name: string, state: number) => {
    tree.value!.forEach((element) => {
      updateNodeValue(element, name, state, 'state')
    })
  }
  defineExpose({
    getPrjNodeTree,
    reSetPrjState,
  })
  onMounted(() => {
    treeHeight.value = document.querySelector('.main-section')?.getBoundingClientRect().height
    getPrjNodeTree()
  })
</script>

<style scoped lang="less"></style>
