<template>
  <div class="logo-wrapper">
    <img v-if="showLogo" class="logo-img" :src="importImg" />
    <div v-if="showTitle" :class="[!state.isCollapse || alwaysShow ? 'show-title' : 'close-title']">
      <span class="logo-title">{{ state.projectName }}</span>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { useLayoutStore } from '../index'
  import { getAssetsHomeFile } from '@/utils/utils'
  // import { projectName } from '../../setting'
  export default defineComponent({
    name: 'Logo',
    props: {
      showTitle: {
        type: Boolean,
        default: true,
      },
      showLogo: {
        type: Boolean,
        default: true,
      },
      alwaysShow: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const store = useLayoutStore()
      const importImg = getAssetsHomeFile(store.state.projectLogo)
      return {
        state: store?.state,
        // projectName,
        importImg,
      }
    },
  })
</script>
<style lang="less" scoped>
  .logo-wrapper {
    height: @logoHeight;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px dashed var(--border-color);
    .logo-img {
      width: calc(@menuWidth / 3);
    }
    .logo-title {
      margin-left: 10px;
      font-size: 20px;
      font-weight: bold;
    }
    .show-title {
      transform: scale(1);
      width: auto;
      transition: transform 0.2s ease-in;
    }
    .close-title {
      transform: scale(0);
      width: 0;
    }
  }
</style>
