import { getMenuList } from '@/api/url'
import Mock from 'mockjs'

export const adminRoutes = [
  {
    menuUrl: '/system',
    menuName: '系统管理',
    icon: 'setting-outlined',
    parentPath: '',
    children: [
      // {
      //   parentPath: '/system',
      //   menuUrl: '/system/department',
      //   menuName: '部门管理',
      //   cacheable: true,
      // },
      {
        parentPath: '/system',
        menuUrl: '/system/user',
        menuName: '岗位管理',
      },
      {
        parentPath: '/system',
        menuUrl: '/system/role',
        menuName: '角色管理',
      },
      {
        parentPath: '/system',
        menuUrl: '/system/menu',
        menuName: '菜单管理',
        cacheable: true,
      },
      {
        parentPath: '/system',
        menuUrl: '/test1/demo', //第二个斜杠后面的路径为组件的在test文件夹下的路径
        menuName: '测试组件1',
      },
      {
        parentPath: '/system',
        menuName: '我的',
        menuUrl: '/wod',
        outLink: '',
        icon: 'AccountBookOutlined',
        cacheable: '',
        hidden: '',
        affix: '',
        // isSingle: true, //必须要有此属性
        children: [
          {
            parentPath: '/wod',
            menuUrl: '/wod/w/index', //第二个斜杠后面的路径为组件的在test文件夹下的路径
            menuName: '我的',
          },
        ],
      },
    ],
  },

  // {
  //   menuUrl: '/test1',
  //   menuName: '测试页面',
  //   icon: 'left-circle-outlined',
  //   parentPath: '',
  //   isSingle: true, //必须要有此属性
  //   children: [
  //     {
  //       parentPath: '/test1',
  //       menuUrl: '/test1/demo', //第二个斜杠后面的路径为组件的在test文件夹下的路径
  //       menuName: '测试组件1',
  //     },
  //   ],
  // },
  {
    menuUrl: '/test',
    menuName: '测试页面',
    icon: 'left-circle-outlined',
    parentPath: '',
    isSingle: true, //必须要有此属性
    children: [
      {
        parentPath: '/test',
        menuUrl: '/test/index', //第二个斜杠后面的路径为组件的在test文件夹下的路径
        menuName: '测试组件',
      },
    ],
  },
  // {
  //   parentPath: '',
  //   menuName: '我的',
  //   menuUrl: '/wod',
  //   outLink: '',
  //   icon: 'AccountBookOutlined',
  //   cacheable: '',
  //   hidden: '',
  //   affix: '',
  //   // isSingle: true, //必须要有此属性
  //   children: [
  //     {
  //       parentPath: '/wod',
  //       menuUrl: '/wod/w/index', //第二个斜杠后面的路径为组件的在test文件夹下的路径
  //       menuName: '我的',
  //     },
  //   ],
  // },
  {
    menuUrl: '/editor',
    menuName: '编辑器',
    icon: 'edit-outlined',
    parentPath: '',
    children: [
      {
        parentPath: '/editor',
        menuUrl: '/editor/rich-text',
        menuName: '富文本',
        cacheable: true,
      },
      {
        parentPath: '/editor',
        menuUrl: '/editor/markdown',
        menuName: 'markdown',
      },
    ],
  },
  {
    menuUrl: '/excel',
    menuName: 'Excel',
    icon: 'file-excel-outlined',
    parentPath: '',
    children: [
      {
        parentPath: '/excel',
        menuUrl: '/excel/export-excel',
        menuName: '导出Excel',
      },
      {
        parentPath: '/excel',
        menuUrl: '/excel/export-rows-excel',
        menuName: '导出选中行',
      },
    ],
  },
  {
    menuUrl: '/twhg',
    menuName: '天伟化工',
    icon: 'file-excel-outlined',
    parentPath: '',
    children: [
      {
        parentPath: '/twhg',
        menuUrl: '/equipmentWeb/#/typeOfEquipment',
        menuName: '设备',
      },
    ],
  },
]
export const editorRoutes = [
  {
    menuUrl: '/editor',
    menuName: '编辑器',
    icon: 'edit-outlined',
    parentPath: '',
    children: [
      {
        parentPath: '/editor',
        menuUrl: '/editor/rich-text',
        menuName: '富文本',
      },
      {
        parentPath: '/editor',
        menuUrl: '/editor/markdown',
        menuName: 'markdown',
      },
    ],
  },
  {
    menuUrl: '/test',
    menuName: '测试页面',
    // icon: 'left-circle-outlined',
    parentPath: '',
    isSingle: true, //必须要有此属性
    children: [
      {
        parentPath: '/test',
        menuUrl: '/test/demo/', //第二个斜杠后面的路径为组件的在test文件夹下的路径
        menuName: '测试组件',
      },
    ],
  },
  // {
  //   menuUrl: '/other',
  //   menuName: '功能/组件',
  //   icon: 'appstore',
  //   parentPath: '',
  //   children: [
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/chart',
  //       menuName: '图表',
  //       children: [
  //         {
  //           parentPath: '/other/chart',
  //           menuUrl: '/other/chart/icons',
  //           menuName: '图标',
  //         },
  //         {
  //           parentPath: '/other/chart',
  //           menuUrl: '/other/chart/echarts',
  //           menuName: 'echarts',
  //         },
  //         {
  //           parentPath: '/other/chart',
  //           menuUrl: '/other/chart/icon-selector',
  //           menuName: '图标选择器',
  //         },
  //       ],
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/print',
  //       menuName: '打印',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/badge',
  //       menuName: '消息提示',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/clipboard',
  //       menuName: '剪贴板',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: 'http://qingqingxuan.gitee.io/work-p-site',
  //       menuName: '外链',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/qrcode',
  //       menuName: '二维码',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/css-animation',
  //       menuName: 'CSS动画',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/flow',
  //       menuName: '流程图',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/player',
  //       menuName: '视频播放器',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/password-strong-page',
  //       menuName: '密码强度',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/cropper',
  //       menuName: '图片裁剪',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/iframe',
  //       menuName: '内嵌iframe',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/big-preview',
  //       menuName: '大图预览',
  //     },
  //     {
  //       parentPath: '/other',
  //       menuUrl: '/other/city-selector-page',
  //       menuName: '省市区选择器',
  //     },
  //   ],
  // },
  // {
  //   menuUrl: '/map',
  //   menuName: '地图',
  //   icon: 'location',
  //   children: [
  //     {
  //       parentPath: '/map',
  //       menuUrl: '/map/gaode',
  //       menuName: '高德地图',
  //     },
  //     {
  //       parentPath: '/map',
  //       menuUrl: '/map/baidu',
  //       menuName: '百度地图',
  //     },
  //   ],
  // },
  // {
  //   menuUrl: '/project',
  //   menuName: '项目信息',
  //   icon: 'detail',
  //   children: [
  //     {
  //       parentPath: '/project',
  //       menuUrl: '/project/infomation',
  //       menuName: '项目依赖',
  //     },
  //   ],
  // },
]

Mock.mock(RegExp(getMenuList), 'post', function () {
  return Mock.mock({ code: 200, data: adminRoutes, msg: '获取菜单列表成功' })
})
