import { IconNameType } from '@/types/components'
export interface NodeId {
  nodeId: string
}

export interface OptionNode {
  id?: string
  name?: string
  parentId?: string
  type?: NodeType
}
export type NodeType = 'node' | 'mpc' | 'script'
export interface MovePrj {
  dstNodeId: string
  srcPrjNames: string[]
}
export interface Prjs {
  name: string
  desc: string
  type: NodeType
  fileURL: string
  properties: any[]
  nodeId: string
  pid: number
  id: string
  state: number
  serviceURL: string
}

export interface TreeNodes {
  id?: string
  name: string
  parentId: string
  type: NodeType
  children?: TreeNodes[]
  prjs?: Prjs[]
}
//图标类型
export const nodeIconMap: Record<NodeType, IconNameType> = {
  node: 'FolderOpenOutlined',
  mpc: 'FileMarkdownOutlined',
  script: 'StrikethroughOutlined',
}
