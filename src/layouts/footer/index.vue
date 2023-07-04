<template>
  <a-card class="footer-container" :bodyStyle="{ padding: 0 }">
    Copyright © {{ state.projectName }} {{ nowYear }}
  </a-card>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  // import { projectName } from '../../setting'
  import { useLayoutStore } from '@/layouts'
  export default defineComponent({
    name: 'Footer',
    setup() {
      const store = useLayoutStore()
      const state = store?.state
      let nowYear = new Date().getFullYear()
      return {
        // projectName,
        state,
        nowYear,
      }
    },
  })
</script>

<style lang="less" scoped>
  @--border-color: #f5f5f5;
  .footer-container {
    height: @footerHeight;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border-top: 1px dashed var(--border-color);
  }
</style>
