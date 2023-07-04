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
      console.log(mpcOnlineUrl)
      this.onlineUrl = ''
      this.onlineUrl = mpcOnlineUrl || ''
    },
  },
})

export default useMpcStore
