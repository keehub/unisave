<script setup lang="ts">
const repos = ref<GithubReposRes | null>({
  name: 'unisave',
  description: '拥抱 web 开发，拯救 uniapp。👋👋👋 基于Uniapp、Vue 3、pinia(且持久化保存)、Typescript、UnoCSS等主流技术开发的开箱即用模版，适配所有(app、mp、web)平台！！！',
  html_url: 'https://github.com/sunpm/unisave',
})
</script>

<template>
  <view us-flex="~ col items-center justify-center" us-p-50px>
    <Logos />
    <InputEntry />
    <view v-if="repos" us-border="1 solid" us-mt-4 class="p-10 text-center">
      <h2>
        请求返回结果：
      </h2>
      <p>{{ repos.name }}</p>
      <p>{{ repos.description }}</p>
      <a class="icon-btn" :href="repos.html_url" target="_blank">仓库地址</a>
    </view>
    <Footer />
  </view>
</template>

<route lang="yaml" type="home">
style:
  navigationBarTitleText: 首页
</route>
