<template>
  <div>
    <a-row :gutter="10">
      <a-col :span="6">
        <a-card
          :title="props.titleL"
          :style="{
            height: treeHeight + 'px',
          }"
        >
          <div
            class="auto-scroll"
            :style="{
              height: treeHeight - 108 + 'px',
            }"
          >
            <slot name="cardL"> </slot>
          </div>
          <template #extra>
            <slot name="extraL"></slot>
          </template>
        </a-card>
      </a-col>
      <a-col :span="18">
        <a-card :title="props.titleR" class="auto-scroll" :style="{ height: treeHeight + 'px' }">
          <slot name="cardR"></slot>
          <template #extra>
            <slot name="extraR"></slot>
          </template>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="treeLayout">
  import { ref, getCurrentInstance, onMounted, watch } from 'vue'
  import { useTableHeight } from '@/hooks/table'
  const props = defineProps({
    titleL: {
      value: String,
      default: '',
    },

    titleR: {
      value: String,
      default: '',
    },
  })
  const treeHeight = ref()
  const reseize = async () => {
    treeHeight.value = await useTableHeight(getCurrentInstance())
  }
  onMounted(() => {
    reseize()
  })
</script>

<style scoped lang="less"></style>
