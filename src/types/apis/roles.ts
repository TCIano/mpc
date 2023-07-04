export interface Roles {
  name?: string
  desc?: string
  isSystemReserved?: Boolean
  users?: number[]
  menus?: number[]
  id?: string
}
interface RoleId {
  roleId?: string
}
export interface UserByRid extends RoleId {
  users?: string[]
}
export interface UserByRidRes extends RoleId {
  userId: string
  id: string
}
export interface PageByid extends RoleId {
  pages?: string[]
}
export interface PageByidRes extends RoleId {
  pageId: string
  id: string
}
