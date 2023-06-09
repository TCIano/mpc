<template>
  <div class="action-items-wrapper">
    <span v-if="state.actionItem.showSearch" class="action-item" @click="onShowSearch">
      <SearchIcon />
    </span>
    <a-popover trigger="click" :width="600">
      <a-badge
        v-if="state.actionItem.showMessage"
        :count="badgeValue"
        class="badge-action-item action-item"
      >
        <NotificationsIcon />
      </a-badge>
      <template #content>
        <MessageContent />
      </template>
    </a-popover>
    <span v-if="state.actionItem.showRefresh" class="action-item" @click="onRefrehRoute">
      <RefreshIcon />
    </span>
    <span
      v-if="state.actionItem.showFullScreen && state.device !== 'mobile'"
      class="action-item"
      @click="onScreenFull"
    >
      <ExpandIcon v-if="!isFullscreen" />
      <ExitExpandIcon v-else />
    </span>
    <!-- <span class="action-item" @click="onShowSetting">
      <SettingIcon />
    </span> -->
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import { message } from 'ant-design-vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useLayoutStore } from '../index'
  import {
    SettingOutlined as SettingIcon,
    SearchOutlined as SearchIcon,
    FullscreenOutlined as ExpandIcon,
    FullscreenExitOutlined as ExitExpandIcon,
    BellOutlined as NotificationsIcon,
    ReloadOutlined as RefreshIcon,
  } from '@ant-design/icons-vue'
  import { useFullscreen } from '@vueuse/core'
  import useEmit from '@/hooks/useEmit'
  export default defineComponent({
    name: 'ActionItems',
    components: {
      SearchIcon,
      SettingIcon,
      ExpandIcon,
      NotificationsIcon,
      RefreshIcon,
      ExitExpandIcon,
    },
    setup() {
      const settingRef = ref()
      const badgeValue = ref(3)
      const store = useLayoutStore()
      const router = useRouter()
      const route = useRoute()
      const emitter = useEmit()
      function onShowSearch() {
        emitter?.emit('show-search')
      }
      const { isSupported, toggle, isFullscreen } = useFullscreen(document.documentElement)
      function onScreenFull() {
        if (!isSupported) {
          message.error('当前浏览器不支持全屏操作')
          return false
        }
        toggle()
      }
      function onRefrehRoute() {
        router.replace({ path: '/redirect' + route.path })
      }
      function onShowSetting() {
        emitter?.emit('show-setting')
      }
      return {
        settingRef,
        badgeValue,
        state: store.state,
        onShowSearch,
        onScreenFull,
        onRefrehRoute,
        onShowSetting,
        isFullscreen,
      }
    },
  })
</script>

<style lang="less" scoped>
  @primary-color: #f00;
  .action-items-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: 1;
    .action-item {
      font-size: 16px;
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      &:hover {
        cursor: pointer;
        background-color: var(--border-color);
      }
    }
    .badge-action-item {
      :deep(.ant-badge-count, .ant-badge-dot) {
        transform: translate(0, 20%) !important;
      }
    }
  }
</style>
