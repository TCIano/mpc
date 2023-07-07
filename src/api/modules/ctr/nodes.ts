import { post, get } from '@/api/http'
import { OptionNode, NodeId, MovePrj } from '@/types/apis/ctr/nodes'
import { PMS } from '../baseUrl'
const BASE = PMS + '/Nodes'
//获取工程节点树
const GET_PRJ_NODE_TREE = BASE + '/GetPrjNodeTree'
//获取节点下的工程
const GET_PRJS_BY_NODE = BASE + '/GetPrjsByNode'
//增加节点
const ADD = BASE + '/Add'
const REMOVE = BASE + '/MovePrjs'
const UPDATE = BASE + '/Update'
const DELETE = BASE + '/Delete'

export const getPrjNodeTreeApi = (reload: boolean = false) => {
  return get({
    url: GET_PRJ_NODE_TREE,
    data: {
      reload,
    },
    // url: '/MPC/GetMPCPrj?fileURL=F%3A%5C%E6%B5%8B%E8%AF%95%E6%95%B0%E6%8D%AE%5CMPC10.0%5Ctest2.cf',
  })
}
/**
 *  获取节点下的工程
 * @param nodeId 节点id NodeId
 * @returns
 */
export const getPrjsByNodeApi = (nodeId: NodeId) => {
  return get({
    url: GET_PRJS_BY_NODE,
    data: {
      nodeId,
    },
  })
}
/**
 * 节点添加
 * @param data 节点信息
 * @returns
 */
export const AddNodeApi = (data: OptionNode) => {
  return post({
    url: ADD,
    data,
  })
}
/**
 *  拖动节点
 * @param data 拖动节点和目标节点集合
 * @returns
 */
export const RemoveNodeApi = (data: MovePrj) => {
  return post({
    url: REMOVE,
    data,
  })
}
/**
 *  更新节点信息
 * @param data 节点信息
 * @returns
 */
export const updateNodeApi = (data: OptionNode) => {
  return post({
    url: UPDATE,
    data,
  })
}
/**
 *  删除节点
 * @param data 节点信息
 * @returns
 */
export const deleteNodeApi = (id: string) => {
  return post({
    url: DELETE,
    data: { id },
  })
}
