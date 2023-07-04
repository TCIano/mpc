<template>
  <div class="vaw-header-layout">
    <div class="logo-wrapper">
      <Logo :always-show="true" :showTitle="true" />
    </div>
    <div class="menu-wrapper" v-if="state.layoutMode === 'ttb'">
      <ScrollerMenu mode="horizontal" :routes="routes" />
    </div>
    <div class="right-wrapper">
      <template v-if="state.device !== 'mobile'">
        <ActionItems />
      </template>
      <div class="avatar-wrapper">
        <VAWavatar />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue'
  import { useLayoutStore } from '../index'
  export default defineComponent({
    name: 'VAWHeader',
    setup() {
      const store = useLayoutStore()
      const routes = computed(() => {
        //后面的filter可以去掉
        // return store?.state.permissionRoutes.filter((it) => !!it.name)
        return store?.state.permissionRoutes
      })
      return {
        routes,
        state: store?.state,
      }
    },
  })
</script>

<style scoped lang="less">
  .vaw-header-layout {
    height: @logoHeight;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    border-bottom: 1px solid var(--border-color);
    .logo-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 12px;
      // width: calc(@menuWidth / 2);
    }
    .menu-wrapper {
      flex: 1;
      overflow: hidden;
    }
    .right-wrapper {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .avatar-wrapper {
        padding-right: 15px;
        margin-left: 10px;
      }
    }
  }
</style>
