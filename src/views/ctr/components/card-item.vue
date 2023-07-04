<template>
  <a-row :gutter="[10, 10]">
    <a-col :span="8" :lg="8" :md="12" :sm="24" :xs="10" v-for="item in cardList">
      <a-card class="shadow-md">
        <template #actions>
          <span @click="openScript(item.title)">
            <!-- <setting-outlined key="setting" /> -->
            在线
          </span>
          <span @click="openPerformance(item.title)">
            <!-- <edit-outlined key="edit" /> -->
            性能评估
          </span>
          <span>
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1">
                    <UserOutlined />
                    1st menu item
                  </a-menu-item>
                  <a-menu-item key="2">
                    <UserOutlined />
                    2nd menu item
                  </a-menu-item>
                </a-menu>
              </template>
              <ellipsis-outlined key="ellipsis" />
            </a-dropdown>
          </span>
        </template>
        <a-card-meta :title="item.title">
          <template #avatar>
            <a-avatar src="https://joeschmoe.io/api/v1/random" />
          </template>
          <template #description>
            <div class="MetaCon">
              <div>2023-04-21 09：39：00</div>
              <div class="flex items-center">
                <div id="success" class=""></div><span class="flex-1 ml-3">正在运行</span>
              </div>
            </div>
          </template>
        </a-card-meta>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  const router = useRouter()
  const route = useRoute()
  interface cardItem {
    title: string
  }
  const cardList: cardItem[] = reactive([
    {
      title: '脚本1',
      status: 'run',
    },
  ])
  for (let index = 0; index < 20; index++) {
    cardList.push({
      title: '脚本' + index,
    })
  }
  const openScript = (title: string) => {
    // router.push({
    //   path: '/script',
    //   query: {
    //     title,
    //   },
    // })
    let routeUrl = router.resolve({
      path: '/script',
      query: {
        title,
      },
    })
    window.open(routeUrl.href, '_blank')
  }
  const openPerformance = (title: string) => {
    router.push({
      path: 'performance',
      query: {
        title,
      },
    })
  }
</script>

<style scoped lang="less"></style>
