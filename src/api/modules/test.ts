import { get, post } from '../http'
//模块请求
const getTest = '/test'
/**
 * 测试接口
 * @param testPara 测试参数
 * @returns
 */
export const getTestApi = (testPara: number) => {
  return get({
    url: getTest,
    data: {
      testPara,
    },
  })
}
