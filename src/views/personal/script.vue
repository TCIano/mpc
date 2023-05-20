<template>
  <codemirror
    v-model="code"
    placeholder="Code goes here..."
    :style="{ height: codeHeigth ? codeHeigth + 'px' : '100%' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="handleReady"
    @change="log('change', $event)"
    @focus="log('focus', $event)"
    @blur="log('blur', $event)"
  />
</template>

<script>
  import { defineComponent, ref, shallowRef, onMounted, getCurrentInstance } from 'vue'
  import { Codemirror } from 'vue-codemirror'
  import { python } from '@codemirror/lang-python'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { useTableHeight } from '@/hooks/table'
  export default defineComponent({
    components: {
      Codemirror,
    },
    setup() {
      const code = ref(`print('Hello, world!')`)
      const extensions = [python(), oneDark]
      const view = shallowRef()
      const codeHeigth = ref()
      const handleReady = (payload) => {
        console.log(payload)
        view.value = payload.view
      }

      const getCodemirrorStates = () => {
        const state = view.value.state
        const ranges = state.selection.ranges
        const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
        const cursor = ranges[0].anchor
        const length = state.doc.length
        const lines = state.doc.lines
      }
      onMounted(async () => {
        codeHeigth.value = await useTableHeight(getCurrentInstance())
      })

      return {
        code,
        extensions,
        handleReady,
        log: console.log,
        codeHeigth,
      }
    },
  })
</script>
