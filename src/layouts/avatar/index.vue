<template>
  <div class="vaw-avatar-container">
    <a-dropdown trigger="hover" :options="options" size="large" @select="handleSelect">
      <div class="action-wrapper">
        <div class="avatar">
          <a-avatar shape="circle" :size="30" :src="userStore.avatar" />
        </div>
        <span class="nick-name">
          {{ userStore.userName }}
        </span>
        <CaretDownOutlined class="tip" />
      </div>
      <template #overlay>
        <a-menu @click="handleSelect">
          <a-menu-item v-for="item of options" :key="item.key">
            <template #icon>
              <component :is="item.icon" />
            </template>
            {{ item.label }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts">
  import { Modal } from 'ant-design-vue'
  import { defineComponent } from 'vue'
  import { useLayoutStore } from '../index'
  import { UserOutlined, LogoutOutlined, CaretDownOutlined } from '@ant-design/icons-vue'
  import useUserStore from '@/store/modules/user'

  export default defineComponent({
    name: 'VAWavatar',
    components: { UserOutlined, LogoutOutlined, CaretDownOutlined },
    setup() {
      const store = useLayoutStore()
      const userStore = useUserStore()
      const options = [
        // {
        //   label: '个人中心',
        //   key: 'personal-center',
        //   icon: 'UserOutlined',
        // },
        {
          label: '退出登录',
          key: 'logout',
          icon: 'LogoutOutlined',
        },
      ]
      function personalCenter() {
        ;(store as any).onPersonalCenter && (store as any).onPersonalCenter()
      }
      function logout() {
        Modal.confirm({
          title: '提示',
          content: '是否要退出当前账号？',
          okText: '退出',
          cancelText: '再想想',
          onOk: () => {
            userStore.logout().then(() => {
              ;(store as any).onLogout && (store as any).onLogout()
            })
          },
        })
      }
      function handleSelect({ key }: any) {
        switch (key) {
          case 'personal-center':
            personalCenter()
            break
          case 'logout':
            logout()
            break
        }
      }
      return {
        userStore,
        options,
        handleSelect,
      }
    },
  })
</script>

<style lang="less" scoped>
  .vaw-avatar-container {
    .action-wrapper {
      display: flex;
      align-items: center;
      .nick-name {
        margin: 0 5px;
        .tip {
          transform: rotate(0);
          transition: transform @transitionTime;
          margin-left: 2px;
        }
      }
    }
  }
  .vaw-avatar-container:hover {
    cursor: pointer;
    color: var(--primary-color);
    .tip {
      transform: rotate(180deg);
      transition: transform @transitionTime;
    }
  }
</style>
