<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import 'dayjs/locale/zh-cn'
  export default defineComponent({
    setup() {
      return {
        zhCN,
      }
    },
  })
</script>
