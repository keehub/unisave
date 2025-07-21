import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  easycom: {
    custom: {
      '^u--(.*)': 'uview-plus/components/u-$1/u-$1.vue',
      '^up-(.*)': 'uview-plus/components/u-$1/u-$1.vue',
      '^u-([^-].*)': 'uview-plus/components/u-$1/u-$1.vue',
    },
  },
  pages: [
    {
      path: 'pages/index/index',
      style: {
        'navigationBarTitleText': '首页',
        'app-plus': {
          titleNView: {
            autoBackButton: false,
          },
        },
      },
    },
    {
      path: 'pages/monitor/index',
      style: {
        'navigationBarTitleText': '监控',
        'app-plus': {
          titleNView: {
            autoBackButton: false,
          },
        },
      },
    },
  ],
  globalStyle: {
    'navigationBarBackgroundColor': '#fff',
    'backgroundColor': '#fff',
    'navigationBarTextStyle': 'black',
    'navigationBarTitleText': 'unisave',
    'app-plus': {
      titleNView: {
        backgroundColor: '#fff',
        titleColor: '#000000',
        splitLine: {
          color: '#eaeaea',
          height: '1px',
        },
      },
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
