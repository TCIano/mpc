<template>
  <div class="item-container">
    <div class="info-wrapper">
      <span class="title">
        {{ item.title }}
      </span>
      <a-space class="mt-6">
        <a-button danger size="small" @click="preView"> 预览地址 </a-button>
        <a-popover trigger="hover">
          <template #content>
            <img style="width: 150px" :src="WeiXin" alt="" />
          </template>
          <a-button ghost type="primary" size="small">授权客服</a-button>
        </a-popover>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts">
  // import WeiXin from '@/assets/custom_weixin.jpg'
  import { defineComponent, PropType, toRef } from 'vue'
  interface ItemData {
    title: string
    target?: string
  }

  export default defineComponent({
    name: 'ProjectItem',
    props: {
      item: {
        type: Object as PropType<ItemData>,
        default: () => {
          return {}
        },
      },
    },
    setup(props) {
      const item = toRef(props, 'item')
      return {
        WeiXin,
        preView: function () {
          window.open(item.value.target)
        },
      }
    },
  })
</script>

<style lang="less" scoped>
  .item-container {
    position: relative;
    height: 7rem;
    z-index: 0;
    cursor: pointer;
    .info-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      padding: 0;
      z-index: 2;
      font-size: 16px;
      font-weight: bold;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-shadow: 0px 0px 5px #1890ff, 0px 0px 15px #1890ff, 0px 0px 25px #1890ff;
      &::after {
        content: '';
        display: block;
        position: absolute;
        border-radius: 10px;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        background-color: var(--border-color);
      }
    }
  }
</style>
