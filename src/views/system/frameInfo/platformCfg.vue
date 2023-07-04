<template>
  <tree-layout title-l="配置选项">
    <template #cardL>
      <a-tree
        defaultExpandAll
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        :tree-data="treeData"
      >
      </a-tree>
    </template>
    <template #cardR>
      <a-table></a-table>
    </template>
  </tree-layout>
</template>

<script setup lang="ts" name="PlatformCfg">
  import { ref, onMounted, computed } from 'vue'
  import treeLayout from '@/layouts/treeLayout/index.vue'
  import type { TreeProps } from 'ant-design-vue'
  const selectedKeys = ref<TreeProps['selectedKeys']>([])
  const checkedKeys = ref<TreeProps['checkedKeys']>([])
  const treeData = ref<TreeProps['treeData']>([
    {
      title: '平台配置',
      key: '0-0',
      selectable: false,
      children: [
        {
          title: '基础配置',
          key: '0-0-0',
        },
      ],
    },
  ])
</script>

<style scoped lang="less"></style>
