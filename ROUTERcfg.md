## 1. 路由基础配置

**注意：menuUrl 最好不要用 index 作为其中的路径** **如果结束路径是 index，那么路由的名称会截取 menuUrl 中后两个路径进行拼接，格式如下**

> /abc/index 等价于 Abc-index,如果需要缓存则组件名字也需要是这个格式

- 一个路由对应一个对象

```js
{
  path: '**' //路由路径，
  name: '**' //路由名（别名）
  component: Layout //路由组件
  meta: {
    title: '**' //路由菜单名称
    icon: '**' //图标，对应antd中图标库名字
    isSingle: '**' //是否为单独菜单（没有子路由，子路由配置见 2.）
  } //路由扩展
  children:[
    {
        path: '**' //路由路径，
        name: '**' //路由名（别名）
        component: () => import('@/***') //路由组件
        meta: {
            title: '**' //路由菜单名称
            affix: true / false // 是否固定在tababr
            cacheable: true / false //是否缓存
            icon: '**' //图标，对应antd中图标库名字
        } //路由扩展
    }
  ]
}
```

## 2. 独立菜单配置（没有子路由）

**注意：上下两个 name 不要一致，或者第一个 name 可以没有，路由中会自动**

```js
{
  path: '**' //路由路径，
  name: '**' //路由名（别名）
  component: Layout //路由组件
  meta: {
    title: '**' //路由菜单名称
    icon: '**' //图标，对应antd中图标库名字
    isSingle: '**' //是否为单独菜单（没有子路由，子路由配置见 2.）
  } //路由扩展
  children: [
    {
      path: '', // children元素只有一个时，路径为空，并且父级加有 isSingle:true
      name:'**'
      component: () => import('@/***'),
    },
  ]
}
```

### 3. 单级动态路由（后台返回格式）

```js
{
    menuUrl: '/test',
    menuName: '测试页面',
    icon: '',
    isSingle: true, //必须要有此属性
    children: [
      {
        parentPath: '/test',
        menuUrl: '/test/index', //第二个斜杠后面的路径为组件的在test文件夹下的路径
        menuName: '测试组件',
      },
    ],
  },
```
