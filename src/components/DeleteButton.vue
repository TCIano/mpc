<template>
  <a-button danger size="small" @click="onDelete">
    <template #icon>
      <DeleteOutlined />
    </template>
    {{ props.name ?? '删除' }}
  </a-button>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'DeleteButton',
    emits: ['delete'],
    props: ['name'],
    setup(props, { emit }) {
      function onDelete() {
        emit('delete')
      }
      return {
        onDelete,
        props,
      }
    },
  })
</script>
