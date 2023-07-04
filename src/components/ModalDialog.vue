<template>
  <a-modal
    v-model:visible="showModal"
    :title="title"
    class="modal-dialog-wrapper"
    :style="bodyStyle"
    cancelText="取消"
    okText="确定"
    @ok="onConfirm"
    @cancel="onCancel"
  >
    <div :style="{ maxHeight: '80vh' }">
      <slot name="content"></slot>
    </div>
    <template v-for="(value, name) in slots" #[name]="slotData">
      <slot v-if="name !== 'content'" :name="name" v-bind="slotData"></slot>
    </template>
  </a-modal>
</template>

<script lang="ts">
  import { computed, defineComponent, ref, useSlots } from 'vue'
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
      width: {
        type: String,
        default: '',
      },
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const slots = useSlots()
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
        slots,
      }
    },
  })
</script>
