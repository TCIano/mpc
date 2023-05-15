<template>
  <div class="redirect-contianer"></div>
</template>

<script lang="ts">
  import { defineComponent, unref } from 'vue'
  import { useRouter } from 'vue-router'
  import store from '@/store'
  export default defineComponent({
    created() {
      const { currentRoute, replace, push } = useRouter()
      const { params, query } = unref(currentRoute.value)
      // const cachedView = store.state.cachedView
      const { path } = params
      replace({
        path: '/' + (typeof path === 'string' ? path : path.join('/')),
        query,
      })
    },
  })
</script>
