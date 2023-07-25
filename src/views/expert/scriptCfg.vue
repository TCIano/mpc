<template>
  <div>
    <table-header ref="tableHeaderRef">
      <template #top-left>
        <!-- <a-button size="small">测试输入</a-button> -->
        <a-radio-group v-model:value="activeKey" size="small">
          <a-radio-button value="1">脚本内容</a-radio-button>
          <a-radio-button value="2">测试输入</a-radio-button>
        </a-radio-group>
      </template>
      <template #top-right>
        <a-checkbox>是否启用</a-checkbox>
        <a-checkbox>脚本执行异常时禁止脚本再次执行</a-checkbox>
      </template>
    </table-header>
    <table-body>
      <template #default>
        <a-row :gutter="2">
          <a-col :span="16">
            <code-editor
              v-show="activeKey === '1'"
              v-model:modelValue="code"
              :options="codeOptions"
              :code-heigth="tableHeight"
            />
            <div v-show="activeKey !== '1'" :style="{ height: tableHeight + 'px' }">123</div>
          </a-col>
          <a-col :span="8">
            <div ref="scriptFormRef" class="script-form_wrapper">
              <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 13 }" style="padding: 5px">
                <a-form-item
                  v-for="item in scriptForm"
                  :label="item.label"
                  :key="item.key"
                  :required="item.required"
                >
                  <a-input
                    :placeholder="item.placeholder"
                    v-model:value="item.value.value"
                  ></a-input>
                </a-form-item>
              </a-form>
            </div>
            <div class="script-button_wrapper">
              <a-button type="primary" size="small">保存</a-button>
              <a-button size="small">测试执行</a-button>
              <a-button size="small">新建变量</a-button>
              <a-button size="small">删除变量</a-button>
              <a-button size="small">
                <template #icon>
                  <arrow-right-outlined />
                </template>
                导入变量
              </a-button>
              <a-button size="small">
                <template #icon>
                  <arrow-down-outlined />
                </template>
                导出变量
              </a-button>
            </div>
            <div>
              <a-table
                bordered
                :columns="columns"
                :data-source="dataList"
                :pagination="false"
                :scroll="{ y: editHeight }"
              />
            </div>
          </a-col>
        </a-row>
      </template>
    </table-body>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue'
  import { useTable, useTableColumn, useTableHeight } from '../../hooks/table'
  import { FormItem } from '../../types/components'
  import { message } from 'ant-design-vue'
  import type { TabsProps } from 'ant-design-vue'
  const { tableHeight, tableHeaderRef, handleSuccess, dataList } = useTable()
  const activeKey = ref('1')
  const size = ref<TabsProps['size']>('small')
  const codeOptions = { disabled: true }
  const code = ref<string | undefined>('')
  const scriptFormRef = ref<HTMLElement>()
  const editHeight = ref<number>()
  const scriptForm = [
    {
      key: 'period',
      label: '脚本执行周期',
      value: ref(30),
      required: true,
      type: 'input',
      placeholder: '请输入脚本执行周期',
      validator: function () {
        if (!this.value.value) {
          message.warning(this.placeholder)
          return false
        }
        return true
      },
      reset() {
        this.value.value = 30
      },
    },
    {
      key: 'seconds',
      label: '脚本超时时间',
      value: ref(60),
      required: true,
      type: 'input',
      placeholder: '请输入脚本超时时间',
      validator: function () {
        if (!this.value.value) {
          message.warning(this.placeholder)
          return false
        }
        return true
      },
      reset() {
        this.value.value = 60
      },
    },
    {
      key: 'main',
      label: '脚本执行入口方法',
      value: ref('main'),
      required: true,
      type: 'input',
      placeholder: '请输入脚本执行入口方法',
      validator: function () {
        if (!this.value.value) {
          message.warning(this.placeholder)
          return false
        }
        return true
      },
      reset() {
        this.value.value = 'main'
      },
    },
  ] as FormItem[]
  const columns = useTableColumn([{ key: 'index', title: '序号', dataIndex: 'index' }], {
    align: 'center',
  })
  const tableData = [
    {
      index: 12,
    },
    {
      index: 22,
    },
  ]
  handleSuccess(tableData)
  onMounted(async () => {
    const instance: ComponentInternalInstance | null = getCurrentInstance()
    tableHeight.value = ((await useTableHeight(instance)) + 32) as number
    const formHeight =
      (instance?.refs.scriptFormRef as HTMLElement).getBoundingClientRect().height || 0
    console.log(tableHeight.value)
    //编辑表格内容高度
    editHeight.value = tableHeight.value - formHeight - 53 - 55
  })
</script>

<style scoped lang="less">
  .script-form_wrapper {
  }

  .script-button_wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
</style>
