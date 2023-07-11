<template>
  <div class="treeMenu-layout">
    <a-row>
      <!-- 左侧树形 -->
      <a-col :span="4" v-if="hasLeft">
        <a-card
          class="treeMenu-menu"
          :title="props.leftTitle"
          :style="{
            height: height || treeHeight + 'px',
            scrollY: true,
            overflowY: 'scroll',
            minWidth: '185px',
          }"
          :bodyStyle="{ padding: '5px' }"
          :headerStyle="{ padding: '5px' }"
        >
          <template #extra>
            <slot name="left-extra"> </slot>
          </template>
          <slot name="leftContent"></slot>
        </a-card>
      </a-col>
      <!-- 左侧树形 -->

      <!-- 中间内容 -->
      <a-col :span="hasLeft ? 20 : 24">
        <a-card
          class="treeMenu-content"
          :title="props.rightTitle"
          :style="{
            height: height || treeHeight + 'px',
            width: '100%',
            padding: '0px',
            overflowY: 'auto',
            overflowX: 'auto',
          }"
        >
          <slot name="centerContent"></slot>
        </a-card>
      </a-col>
      <!-- 中间内容 -->

      <!-- 剩余内容 -->
      <!-- <a-col :span="4">
        <a-card>
          <slot name="elseContent"></slot>
        </a-card>
      </a-col> -->
    </a-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue'
  const props = defineProps({
    leftTitle: {
      type: String,
      default: '',
    },
    rightTitle: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    },
    hasLeft: {
      type: Boolean,
      default: true,
    },
  })
  const treeHeight = ref()
  onMounted(() => {
    treeHeight.value = document.querySelector('.main-section')?.getBoundingClientRect().height
  })
</script>

<style scoped lang="less">
  .treeMenu-layout {
    min-width: 1200px;
    .treeMenu-menu {
      &::-webkit-scrollbar {
        display: none;
      }
      scrollbar-width: none;
      -moz-scrollbar: none;
      -ms-overflow-style: none;
    }
  }
</style>
