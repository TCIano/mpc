<template>
  <router-view v-slot="{ Component, route }" ref="tabContent">
    <transition :name="state.pageAnim + '-transform'" mode="out-in" appear>
      <keep-alive :include="cachedViews" v-if="cachedViews">
        <component :is="Component" :key="route.path" v-if="!refresh" />
      </keep-alive>
      <!-- <component :is="Component" v-else-if="!refresh" /> -->
    </transition>
  </router-view>
</template>

<script lang="ts">
  import { defineComponent, unref, computed, onMounted, onUnmounted, ref } from 'vue'
  import store from '../store'
  export default defineComponent({
    name: 'Main',
    setup() {
      const tabContent = ref()
      const refresh = ref(false)
      const SYSTEM_TABS_STORE = 'system-tabs'
      const state = unref(store.state)
      const cachedViews = computed(() => {
        return state.cachedView.map((it: string) => it)
      })
      const reload = () => {
        window.addEventListener('beforeunload', setSession)
        let sessionTabs = sessionStorage.getItem(SYSTEM_TABS_STORE)
        if (sessionTabs) {
          let oldTabs = JSON.parse(sessionTabs)
          if (oldTabs) {
            state.cachedView = oldTabs
          }
        }
      }
      const setSession = () => {
        sessionStorage.setItem(SYSTEM_TABS_STORE, JSON.stringify(state.cachedView))
      }
      onMounted(() => {
        reload() //防止刷新之后第一次缓存失效
      })
      onUnmounted(() => {
        window.removeEventListener('beforeunload', setSession)
      })
      return {
        state,
        cachedViews,
        reload,
        tabContent,
        refresh,
      }
    },
  })
</script>
