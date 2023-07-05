import dayjs from 'dayjs'
import type { TreeProps } from 'ant-design-vue'
import { DataNode } from 'ant-design-vue/lib/tree'
import { customRef } from 'vue'
import { varColor } from '@/types/apis/dpc/mpc'
/**
 * 函数防抖
 * @param fn 被防抖函数
 * @param delay 延迟时间
 * @returns
 */
export const debounce = (fn: Function, delay: number = 600) => {
  let timer: NodeJS.Timeout | undefined
  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn && fn.apply(this, args)
    }, delay)
  }
}
/**
 * ref防抖
 * @param value 被防抖的ref值
 * @param delay 延迟时间
 * @returns
 */
export function debouncedRef<T>(value: T, delay = 500) {
  let timer: NodeJS.Timeout | undefined
  return customRef((track, trigger) => {
    return {
      get() {
        //注入依赖
        track()
        return value
      },
      set(newValue: T) {
        clearInterval(timer)
        timer = setTimeout(() => {
          //派发更新
          value = newValue
          trigger()
        }, delay)
      },
    }
  })
}
/**
 * 格式化时间
 * @param date 日期
 * @param f 格式
 * @returns string
 */
export const timeFormatter = (
  date: dayjs.ConfigType = new Date(),
  f: string = 'YYYY-MM-DD'
): string => {
  return dayjs(date).format(f)
}

export const getParentKey = (key: string | number, tree: TreeProps['treeData']): string => {
  let parentKey: any
  if (tree?.length) {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some((item: DataNode) => item.key === key)) {
          parentKey = node.key
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children)
        }
      }
    }
  }
  return parentKey
}

// 获取assets静态资源
export const getAssetsHomeFile = (url: string) => {
  const path = `../assets/${url}.png`
  const modules = import.meta.globEager('../assets/*')
  return modules[path] ? modules[path].default : ''
}
/**
 *  根据变量拿到对应颜色
 * @param text 变量值
 * @returns string
 */
export const handleVarColor = (text: string) => {
  const isHas = varColor.hasOwnProperty(text)
  if (isHas) {
    return varColor[text]
  } else {
    return varColor.other
  }
}
/**
 *判断是否为空对象
 * @param obj Object
 * @returns
 */
export function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0
}
