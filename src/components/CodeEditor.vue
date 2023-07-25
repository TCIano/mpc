<template>
  <codemirror
    :modelValue="modelValue"
    v-bind="{ ...options }"
    :style="{ height: height + 'px' }"
    :extensions="extensions"
    @ready="handleReady"
  />
</template>

<script setup lang="ts">
  import { ref, watch, shallowRef, onMounted, computed } from 'vue'
  import { Codemirror, DEFAULT_CONFIG } from 'vue-codemirror'
  import { python } from '@codemirror/lang-python'
  import { oneDark } from '@codemirror/theme-one-dark'
  interface Props {
    modelValue: string | undefined
    options?: any
    codeHeigth: number | undefined | null
  }
  const extensions = [python(), oneDark]
  const view = shallowRef()
  const props = withDefaults(defineProps<Props>(), {
    options: () => {
      return {
        disabled: false,
        autofocus: true,
        indentWithTab: true,
        placeholder: '请选择脚本或直接编写..',
      }
    },
  })
  const height = ref<number | undefined | null>(props.codeHeigth)
  const handleReady = (payload: any) => {
    view.value = payload.view
  }
  watch(
    () => props.codeHeigth,
    (newValue) => {
      height.value = newValue
    }
  )
  //   const getCodemirrorStates = () => {
  //     const state = view.value.state
  //     const ranges = state.selection.ranges
  //     const selected = ranges.reduce((r: any, range: any) => r + range.to - range.from, 0)
  //     const cursor = ranges[0].anchor
  //     const length = state.doc.length
  //     const lines = state.doc.lines
  //   }
</script>

<style scoped lang="less"></style>
