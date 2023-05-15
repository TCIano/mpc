<template>
  <my-iframe />
</template>

<script setup lang="ts">
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue'
  import myIframe from '@/views/iframe/index.vue'
</script>

<style scoped lang="less"></style>
