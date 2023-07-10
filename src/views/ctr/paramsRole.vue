<template>
  <div>
    <table-header>
      <template #top-left>
        <add-button @add="onAddItem" />
      </template>
    </table-header>
    <table-body>
      <a-table
        :pagination="false"
        :loading="tableLoading"
        :row-key="rowKey"
        :data-source="dataList"
        :columns="columns"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button ghost type="primary" size="small" @click="onEdit(record)">编辑</a-button>
              <a-button danger size="small" @click="onDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </table-body>
    <drawer-dialog
      :title="diaTitle === 'add' ? '新增角色参数' : '修改角色参数'"
      ref="cfgModel"
      @confirm="onOprionConfirm"
    >
      <template #content>
        <a-form
          ref="formRef"
          name="form"
          :model="formData"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-form-item
            label="角色名称"
            name="name"
            :rules="[{ required: true, message: '请输入角色名称' }]"
          >
            <a-input v-model:value="formData.name" placeholder="请输入角色名称" />
          </a-form-item>
          <a-form-item label="角色描述" name="desc">
            <a-textarea v-model:value="formData.desc" placeholder="请输入角色描述" />
          </a-form-item>
          <template v-for="(name, key) in VarMap" :key="key">
            <a-form-item :label="name" :name="key">
              <a-select
                v-model:value="formData[key as keyof FormData]"
                mode="multiple"
                :max-tag-count="6"
                :field-names="{ label: 'name', value: 'name' }"
                style="width: 100%"
                placeholder="请选择"
                :options="varTree[key as keyof FormData]"
              ></a-select>
            </a-form-item>
          </template>
        </a-form>
      </template>
    </drawer-dialog>
  </div>
</template>

<script setup lang="ts">
  import {
    addParamsRole,
    deleteParamsRole,
    getParamsByIdApi,
    getParamsByVarTypeApi,
    getProlesApi,
    updateParamsRole,
  } from '@/api/modules'
  import { useRowKey, useTable, useTableColumn, useTableHeight } from '@/hooks/table'
  import { DrawerDialogType } from '@/types/components'
  import { FormInstance, message } from 'ant-design-vue'
  import { ref, getCurrentInstance, onMounted, computed, nextTick } from 'vue'
  interface FormData {
    id?: string
    name?: string
    desc?: string
    ctr?: string[]
    mv: string[]
    dv: string[]
    cv: string[]
  }
  const VarMap = {
    mv: '操作变量',
    dv: '扰动变量',
    cv: '被控变量',
  }
  const { tableHeight, handleSuccess, dataList, tableLoading } = useTable()
  const rowKey = useRowKey('id')
  const cfgModel = ref<DrawerDialogType>()
  const formRef = ref<FormInstance>()
  const columns = useTableColumn(
    [
      {
        title: '角色名称',
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: '角色描述',
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
  const varTree = ref<FormData>({
    // ctr: [],
    mv: [],
    cv: [],
    dv: [],
  })
  const useFormData = () => ({
    name: '',
    desc: '',
    ctr: [],
    mv: [],
    cv: [],
    dv: [],
  })
  const diaTitle = ref<string>('')
  const formData = ref<FormData>(useFormData())
  const resetForm = () => {
    Object.assign(formData.value, useFormData())
    formRef.value?.clearValidate()
    // formRef.value?.resetFields()
  }
  const onAddItem = () => {
    resetForm()
    diaTitle.value = 'add'
    cfgModel.value.show()
  }
  const onEdit = async (record: FormData) => {
    resetForm()
    diaTitle.value = 'edit'
    const res = await getParamsByIdApi(record.id as string)
    for (const key in res) {
      formData.value[key as keyof FormData] = res[key as keyof FormData] as any
    }
    cfgModel.value.show()
    //获取当前角色对应参数集合
  }
  const onDelete = async (record: FormData) => {
    await deleteParamsRole(record.id as string)
    message.success('删除成功')
    doRefresh()
  }
  const doRefresh = async () => {
    const res = await getProlesApi()
    handleSuccess(res)
  }
  const onOprionConfirm = async () => {
    try {
      await formRef.value?.validateFields()
      //请求
      if (diaTitle.value === 'add') {
        await addParamsRole(formData.value)
        message.success('添加成功')
      } else {
        await updateParamsRole(formData.value)
        message.success('修改成功')
      }
      cfgModel.value.toggle()
      doRefresh()
    } catch (error) {
      console.warn(error)
    }
  }
  const getParamsByVarType = async () => {
    for (let index = 0; index < VarMap.length; index++) {
      const item = VarMap[index] as keyof FormData
      const res = await getParamsByVarTypeApi(item)
      varTree.value[item] = res.params
    }
  }
  onMounted(async () => {
    tableHeight.value = (await useTableHeight(getCurrentInstance())) as number
    getParamsByVarType()
    doRefresh()
  })
</script>

<style scoped lang="less"></style>
