<template>
  <a-upload
    :accept="accept"
    v-model:file-list="fileList"
    @remove="handleRemove"
    :before-upload="beforeUpload"
  >
    <a-button size="small">
      <upload-outlined></upload-outlined>
      点击上传
    </a-button>
  </a-upload>
</template>

<script setup lang="ts">
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue'
  import { message, type UploadProps } from 'ant-design-vue'
  interface Props {
    accept?: string
  }
  interface Emit {
    (e: 'handleUpload', fileList: FormData): void
  }
  const props = withDefaults(defineProps<Props>(), {
    accept: 'image/*',
  })
  const emit = defineEmits<Emit>()
  const fileList = ref<UploadProps['fileList']>([])

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const accept = props.accept.split(',').map((item) => item.trim()) //去除每项的空格
    const typeOk = accept.includes(file.type)
    if (!typeOk) {
      message.warning('接受的文件类型为' + props.accept)
    } else {
      //上传
      const formData = new FormData()
      fileList.value = [file]
      fileList.value.forEach((item) => {
        formData.append('file', item as any)
      })
      emit('handleUpload', formData)
    }
    return false
  }
  const handleRemove = () => {
    fileList.value = []
  }
</script>

<style scoped lang="less" name="BasicUpload"></style>
