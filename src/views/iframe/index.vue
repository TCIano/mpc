<template>
  <iframe ref="myFrame" :src="iSrc" width="100%" :height="height + 'px'" frameborder="0"></iframe>
</template>

<script lang="ts">
  import { onMounted, ref, defineComponent } from 'vue'
  import { useRoute } from 'vue-router'
  export default defineComponent({
    name: 'Iframe',
    setup() {
      const route = useRoute()
      const iSrc = ref()
      const myFrame = ref<HTMLIFrameElement>()
      const height = ref(0)
      onMounted(() => {
        height.value = myFrame.value!.parentElement!.clientHeight
        iSrc.value = route.query.url
        console.log(iSrc.value)
      })
      return {
        myFrame,
        height,
        iSrc,
      }
    },
  })
</script>
