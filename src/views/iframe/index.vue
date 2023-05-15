<template>
  <iframe
    ref="myFrame"
    src="http://localhost:8099/equipmentWeb/#/equipmentManagement"
    width="100%"
    :height="height + 'px'"
    frameborder="0"
  ></iframe>
</template>

<script lang="ts">
  import { onMounted, ref, defineComponent } from 'vue'
  export default defineComponent({
    name: 'Iframe',
    setup() {
      const myFrame = ref<HTMLIFrameElement>()
      const height = ref(0)
      onMounted(() => {
        height.value = myFrame.value!.parentElement!.clientHeight
      })
      return {
        myFrame,
        height,
      }
    },
  })
</script>
