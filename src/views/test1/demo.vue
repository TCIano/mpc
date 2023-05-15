<template>
  <div>
    <a-card hoverable>
      <template #actions>
        <!-- <setting-outlined key="setting" />
        <edit-outlined key="edit" />
        <ellipsis-outlined key="ellipsis" /> -->
        <span>在线</span>
        <span>性能评估</span>
        <span>更多操作</span>
      </template>
      <a-card-meta title="Card title" description="This is the description">
        <template #avatar>
          <a-avatar src="" />
        </template>
      </a-card-meta>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue'
</script>

<style scoped lang="less"></style>
