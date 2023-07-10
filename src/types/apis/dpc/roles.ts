export type VarType = 'ctr' | 'mv' | 'dv' | 'cv'
export interface ParamRoles {
  id?: string
  name?: string
  desc?: string
  ctr?: string[]
  mv: string[]
  dv: string[]
  cv: string[]
}

export interface ParamRolesById {
  id: string
  name: string
  desc: string
  ctr: string[]
  mv: string[]
  dv: string[]
  cv: string[]
}
