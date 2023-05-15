<template>
  <a-drawer
    v-model:visible="showModal"
    :title="title"
    class="drawer-dialog-wrapper"
    @cancel="onCancel"
  >
    <template #extra>
      <a-space>
        <a-button @click="onCancel">取消</a-button>
        <a-button @click="onConfirm" type="primary">确定</a-button>
      </a-space>
    </template>
    <div :style="{ maxHeight: '50vh', overflow: 'auto' }">
      <slot name="content"></slot>
    </div>
  </a-drawer>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue'
  import { useLayoutStore } from '@/layouts'

  export default defineComponent({
    name: 'ModalDialog',
    props: {
      title: {
        type: String,
        default: '操作',
      },
      contentHeight: {
        type: String,
        default: '30vh',
      },
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const showModal = ref(false)
      const layoutStore = useLayoutStore()
      const bodyStyle = computed(() => ({
        width: layoutStore.state.device === 'mobile' ? '80%' : '50%',
      }))
      function toggle() {
        showModal.value = !showModal.value
        return Promise.resolve(showModal.value)
      }
      function show() {
        showModal.value = true
        return Promise.resolve(true)
      }
      function close() {
        showModal.value = false
        return Promise.resolve(false)
      }
      function onConfirm() {
        emit('confirm')
      }
      function onCancel() {
        showModal.value = false
        emit('cancel')
      }
      return {
        showModal,
        bodyStyle,
        toggle,
        show,
        close,
        onConfirm,
        onCancel,
      }
    },
  })
</script>
