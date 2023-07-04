import useUserStore from '@/store/modules/user'
import pinia from '@/store/pinia'
const userStore = useUserStore(pinia)
export const PageEnum = {
  BASE_HOME: userStore.redirectURL || '/ctr/index',
}
