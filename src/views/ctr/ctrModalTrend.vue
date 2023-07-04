<template>
  <div>
    <all-model />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue'
  import allModel from './components/all-model.vue'
</script>

<style scoped lang="less"></style>
