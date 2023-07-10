import { defineStore } from 'pinia'
import { MpcState } from '../types'
const useMpcStore = defineStore('mpc', {
  state: (): MpcState => {
    return {
      onlineUrl: '',
    }
  },
  actions: {
    saveUrl(mpcOnlineUrl: string) {
      this.onlineUrl = ''
      this.onlineUrl = mpcOnlineUrl || ''
    },
  },
})

export default useMpcStore
