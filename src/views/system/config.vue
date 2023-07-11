<template>
  <!-- <tree-menu-layout :hasLeft="false"> -->
  <!-- <template #centerContent> -->
  <!-- <a-form>
        <a-form-item label="平台名称">
          <a-input
            v-model:value="state.projectName"
            size="small"
            @pressEnter="onPrjNameUpdate"
            @blur="onPrjNameUpdate"
          />
        </a-form-item>
      </a-form> -->

  <!-- </template> -->
  <!-- </tree-menu-layout> -->
  <div>
    <table-header>
      <template #top-left>
        <AddButton @add="onAddItem" />
      </template>
    </table-header>
    <table-body>
      <a-table
        :loading="tableLoading"
        :columns="colums"
        :pagination="false"
        :scroll="{ y: tableHeight }"
        :data-source="dataList"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button ghost type="primary" size="small" @click.prevent="onEdit(record)"
                >编辑</a-button
              >
              <a-button danger size="small" @click="onDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </table-body>
    <drawer-dialog
      :title="diaTitle === 'add' ? '新增配置' : '修改配置'"
      ref="cfgMode"
      @cancel="onCancel"
      @confirm="onOprionConfirm"
    >
      <template #content>
        <a-form
          ref="formRef"
          name="formD"
          :model="formData"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入键' }]">
            <a-input v-model:value="formData.name" placeholder="请输入键" />
          </a-form-item>
          <a-form-item label="值" name="value" :rules="[{ required: true, message: '请输入值' }]">
            <a-input v-model:value="formData.value" placeholder="请输入值" />
          </a-form-item>
          <a-form-item label="描述" name="desc">
            <a-textarea v-model:value="formData.desc" placeholder="请输入描述" />
          </a-form-item>
        </a-form>
      </template>
    </drawer-dialog>
  </div>
</template>

<script setup lang="ts">
  import { TreeProps, message, FormInstance } from 'ant-design-vue'
  import { useTable, useTableColumn, useTableHeight, useRowKey } from '@/hooks/table'
  import {
    ref,
    reactive,
    toRefs,
    getCurrentInstance,
    onBeforeMount,
    onMounted,
    watchEffect,
    computed,
  } from 'vue'
  import { addPlfCfgApi, deletePlfCfgApi, updatePlfCfgApi, getPlfCfgApi } from '@/api/modules'
  import { DrawerDialogType } from '@/types/components'
  import { cloneDeep } from 'lodash-es'
  import { CfgFormData } from '@/types/apis/user'
  import useUserStore from '@/store/modules/user'
  const selectedKeys = ref<string[]>(['pltf'])
  const userStore = useUserStore()
  const { handleSuccess, tableHeight, tableLoading, dataList } = useTable()
  const diaTitle = ref<string>('')
  const cfgMode = ref<DrawerDialogType>()
  const formRef = ref<FormInstance>()
  const colums = useTableColumn(
    [
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: '值',
        key: 'value',
        dataIndex: 'value',
      },
      {
        title: '描述',
        key: 'desc',
        dataIndex: 'desc',
      },
      {
        title: '操作',
        key: 'action',
      },
    ],
    {
      align: 'center',
    }
  )

  const useFormData = () => {
    return {
      id: '',
      name: '',
      value: '',
      desc: '',
    }
  }
  const formData = ref<CfgFormData>(useFormData())
  const resetForm = () => {
    formRef.value?.resetFields()
    formRef.value?.clearValidate()
    Object.assign(formData.value, useFormData())
  }
  const onCancel = () => {
    resetForm()
  }
  const onAddItem = () => {
    cfgMode.value.show()
    diaTitle.value = 'add'
  }
  const onEdit = (record: CfgFormData) => {
    diaTitle.value = 'edit'
    cfgMode.value.show()
    // for (const key in record) {
    //   formData.value[key as keyof FormData] = record[key as keyof FormData] as any
    // }
    formData.value = cloneDeep(record)
  }
  const onDelete = async (record: CfgFormData) => {
    await deletePlfCfgApi(record.id)
    message.success('删除成功')
    doRefresh()
  }
  const doRefresh = async () => {
    //可进行封装，和进入页面获取配置一起封装
    const { apiCfg, systemCfg } = await userStore.reloadCfg()
    handleSuccess(apiCfg)
    await userStore.presistSystemCfg(systemCfg as any)
  }
  const onOprionConfirm = async () => {
    try {
      await formRef.value?.validateFields()
      //请求
      if (diaTitle.value === 'add') {
        await addPlfCfgApi(formData.value)
        message.success('添加成功')
      } else {
        await updatePlfCfgApi(formData.value)
        message.success('修改成功')
      }
      cfgMode.value.toggle()
      resetForm()
      doRefresh()
    } catch (error) {
      console.warn(error)
    }
  }
  onMounted(async () => {
    tableHeight.value = (await useTableHeight(getCurrentInstance())) as number
    doRefresh()
  })
</script>

<style scoped lang="less"></style>
