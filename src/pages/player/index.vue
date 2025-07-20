<script lang="ts">
import { defineComponent, getCurrentInstance, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'Player',
  props: {
    playUrl: { type: String, required: true },
    playTitle: { type: String, required: true },
    authorization: { type: String, required: true },
  },
  emits: ['close'],
  setup(props, context) {
    const reloadKey = ref(0)
    const isLoading = ref(true)
    const showError = ref(false)
    const TIMEOUT_DURATION = 15000
    const dynamicPlayUrl = ref(props.playUrl)
    const dynamicPlayTitle = ref(props.playTitle)
    const dynamicAuthorization = ref(props.authorization)
    const iframeRef = ref<HTMLIFrameElement | null>(null)
    let loadTimer: ReturnType<typeof setTimeout> | null = null

    // #ifdef MP
    const instance = getCurrentInstance() as any
    instance?.proxy?.$scope?.getOpenerEventChannel?.().on('navigateToSendData', (data: any) => {
      if (data.playUrl)
        dynamicPlayUrl.value = data.playUrl
      if (data.playTitle)
        dynamicPlayTitle.value = data.playTitle
      if (data.authorization)
        dynamicAuthorization.value = data.authorization
    })
    // #endif

    // 发送动态口令
    const sendAuthorization = () => {
      const payload = JSON.stringify({
        type: 'authorization',
        data: dynamicAuthorization.value,
      })
      console.log('发送动态口令:', payload)

      // #ifdef H5
      iframeRef.value?.contentWindow?.postMessage(payload, '*')
      // #endif

      // #ifdef MP
      window.dispatchEvent(new CustomEvent('postMessage', {
        detail: { data: [payload] },
      }))
      // #endif

      // #ifdef APP-PLUS
      if (typeof plus !== 'undefined') {
        const current = plus.webview.currentWebview()
        const children = current.children()
        if (children && children.length > 0) {
          const webview = children[0]
          webview.evalJS(`window.postMessage(${JSON.stringify(payload)}, '*')`)
        }
      }
      // #endif
    }
    // 统一处理嵌入页面的消息
    const handleEmbeddedPageMessage = (message: any) => {
      console.log('统一处理嵌入页面的消息:', typeof message, message)
      try {
        let payload = message
        // #ifdef MP
        payload = Array.isArray(message.detail?.data) ? message.detail.data[0] : message.detail?.data
        // #endif

        if (typeof payload === 'string') {
          const data = JSON.parse(payload)
          if (data.type === 'requestAuthorization') {
            sendAuthorization()
          }
        }
      }
      catch (error) {
        console.error('统一处理嵌入页面的消息:', error)
      }
    }
    const clearLoadTimer = () => {
      if (loadTimer) {
        clearTimeout(loadTimer)
        loadTimer = null
      }
    }
    const startLoadTimer = () => {
      clearLoadTimer()
      loadTimer = setTimeout(() => {
        if (isLoading.value) {
          showError.value = true
          isLoading.value = false
        }
      }, TIMEOUT_DURATION)
    }
    // #ifdef H5
    const handleIframeMessage = (event: MessageEvent) => {
      handleEmbeddedPageMessage(event.data)
    }
    window.addEventListener('message', handleIframeMessage)
    // #endif

    const initPlayer = () => {
      isLoading.value = true
      showError.value = false
      startLoadTimer()
    }
    const retryPlay = () => {
      reloadKey.value++
      initPlayer()
    }

    const closePlayer = () => {
      context.emit('close')
    }

    const handlePlayerError = () => {
      showError.value = true
      isLoading.value = false
      clearLoadTimer()
    }

    const handlePlayerLoad = () => {
      isLoading.value = false
      clearLoadTimer()
    }

    onUnmounted(() => {
      clearLoadTimer()
      // #ifdef H5
      window.removeEventListener('message', handleIframeMessage)
      // #endif
    })

    initPlayer()
    return {
      iframeRef,
      reloadKey,
      showError,
      isLoading,
      retryPlay,
      closePlayer,
      handlePlayerLoad,
      handlePlayerError,
      handleEmbeddedPageMessage,
      playUrl: dynamicPlayUrl,
      playTitle: dynamicPlayTitle,
      authorization: dynamicAuthorization,
    }
  },
})
</script>

<template>
  <view class="player-fullscreen">
    <!-- #ifdef H5 | APP-PLUS -->
    <view class="player-header">
      <u-icon name="arrow-left" size="32" color="#000" class="back-icon" @click="closePlayer" />
      <text class="player-title">
        {{ playTitle }}
      </text>
      <u-icon name="reload" size="32" color="#000" class="reload-icon" @click="retryPlay" />
    </view>
    <!-- #endif -->
    <view class="player-content">
      <!-- #ifdef MP | APP-PLUS -->
      <web-view
        v-show="!showError && !isLoading" :key="reloadKey" class="video-frame" :src="playUrl"
        @error="handlePlayerError" @load="handlePlayerLoad" @message="handleEmbeddedPageMessage"
      />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <iframe
        v-show="!showError && !isLoading" :key="reloadKey" ref="iframeRef" class="video-frame" :src="playUrl"
        allow="autoplay; fullscreen; screen-wake-lock" @error="handlePlayerError" @load="handlePlayerLoad"
      />
      <!-- #endif -->
      <view v-if="isLoading" class="loading-center">
        <u-loading-icon size="40" color="#000" />
        <text class="loading-text">
          通知设备推流中...
        </text>
      </view>
      <view v-if="showError" class="error-overlay">
        <text class="error-text">
          视频加载失败
        </text>
        <text class="error-hint">
          请检查网络或稍后重试
        </text>
        <button class="reload-btn" @click="retryPlay">
          重新加载
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.player-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.player-header {
  z-index: 10;
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 15px;
  background-color: #fff;
}

.player-title {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  color: #000;
  text-align: center;
}

.player-content {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.video-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  border: none;
}

.loading-center {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
}

.loading-text {
  margin-top: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #000;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 80%);
}

.error-text {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.error-hint {
  margin-bottom: 20px;
  font-size: 14px;
  color: #ccc;
}

.reload-btn {
  padding: 8px 20px;
  font-size: 16px;
  color: white;
  background-color: #007aff;
  border-radius: 20px;
}
</style>
