import { number } from 'echarts/core'
import { StorageDic } from '../enum'
import { StorageCls, StorageData, StorageResult, Key, Expire } from '../types/store'
//本地存储
class useStorage implements StorageCls {
  public set<T>(key: Key, value: T, expire: Expire) {
    const data = {
      value,
      [StorageDic.expire]: expire,
    }
    localStorage.setItem(key, JSON.stringify(data))
  }
  public get<T>(key: Key): StorageResult<T | null> {
    const value = localStorage.getItem(key)
    if (value) {
      const obj = JSON.parse(value)
      const now = new Date().getTime()
      if (typeof obj[StorageDic.expire] === 'number' && obj[StorageDic.expire] < now) {
        this.remove(key)
        return {
          message: `${key}已经过期`,
          value: null,
        }
      } else {
        return {
          message: '读取成功',
          value: obj.value,
        }
      }
    } else {
      console.warn(`${key}值无效`)
      return {
        message: 'key值无效',
        value: null,
      }
    }
  }
  public remove(key: Key) {
    localStorage.removeItem(key)
  }
  public clear() {
    localStorage.clear()
  }
}

export { useStorage }
