type Key = string | number
export interface DataType {
  id: Key
  name: string
  dec: string
  method: string
  period: number
  timeout: number
  enable: boolean
}
