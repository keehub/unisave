import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  easycom: {
    // 注意一定要放在custom里，否则无效，https://ask.dcloud.net.cn/question/131175
    custom: {
      '^u--(.*)': 'uview-plus/components/u-$1/u-$1.vue',
      '^up-(.*)': 'uview-plus/components/u-$1/u-$1.vue',
      '^u-([^-].*)': 'uview-plus/components/u-$1/u-$1.vue',
    },
  },
  // 你也可以定义 pages 字段，它具有最高的优先级。
  pages: [{
    path: 'pages/index/index',
    style: { navigationBarTitleText: '首页' },
  }, {
    path: 'pages/monitor/index',
    style: { navigationBarTitleText: '监控' },
  }],
  globalStyle: {
    'navigationBarBackgroundColor': '#fff',
    'backgroundColor': '#fff',
    'navigationBarTextStyle': 'black',
    'navigationBarTitleText': 'unisave',
    'app-plus': {
      titleNView: false, // 移除 H5、APP 顶部导航
    },
  },
  tabBar: {
    color: '#000000',
    selectedColor: '#ff0000',
    backgroundColor: '#F7F7F7',
    borderStyle: 'black',
    list: [
      {
        text: '首页',
        iconPath: '/static/tb11.png',
        pagePath: 'pages/index/index',
        selectedIconPath: '/static/tb12.png',
      },
      {
        text: '监控',
        iconPath: '/static/tb41.png',
        pagePath: 'pages/monitor/index',
        selectedIconPath: '/static/tb42.png',
      },
    ],
  },
})
