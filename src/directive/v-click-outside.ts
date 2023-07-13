import type { Directive, DirectiveBinding } from 'vue'
type DocumentHandler = <T extends MouseEvent>(e: T) => void
interface ListProps {
  documentHandler?: DocumentHandler
}

let nodeList: ListProps = {}
function createDocumentHandler(el: HTMLElement, binding: DirectiveBinding): DocumentHandler {
  return function (e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!el.contains(target)) {
      //判断点击的地方是否为包含元素的地方
      //不包含就失去焦点
      const editData = binding.value?.editData
      if (editData) {
        const record = binding.value.record
        const indexName = binding.value.indexName
        if (editData?.[record?.[indexName]]) {
          editData[record[indexName]] = {}
        }
      }
    }
  }
}
const handler = (e: MouseEvent) => {
  const { documentHandler } = nodeList
  if (documentHandler) {
    documentHandler(e)
  }
}
export const clickOutside: Directive = {
  mounted(el: HTMLInputElement, binding: DirectiveBinding) {
    //首先拿到当前元素的焦点
    if (el.tagName.toLocaleLowerCase() == 'input') {
      el.focus()
      el.select()
    } else {
      if (el.getElementsByTagName('input')) {
        el.getElementsByTagName('input')[0].focus()
        el.getElementsByTagName('input')[0].select()
      }
    }

    nodeList = {
      documentHandler: createDocumentHandler(el, binding),
    }
    window.addEventListener('click', handler)
  },

  beforeUnmount(el: any) {
    window.removeEventListener('click', handler)
    el.removeEventListener('focus', () => {
      el.select()
    })
  },
}
