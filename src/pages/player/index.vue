<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'Player',
  // #ifdef H5
  props: {
    playUrl: { type: String, required: true },
    playTitle: { type: String, required: true },
    authorization: { type: String, required: true },
  },
  emits: ['close'],
  // #endif

  setup(props, context) {
    const reloadKey = ref(0)
    const playUrl = ref<string | undefined>('')
    const playTitle = ref<string | undefined>('')
    const authorization = ref<string | undefined>('')
    const iframeRef = ref<HTMLIFrameElement | null>(null)
    const retryPlay = () => {
      reloadKey.value++
    }
    const closePlayer = () => {
      context.emit('close')
    }

    // #ifdef H5
    playUrl.value = props.playUrl
    playTitle.value = props.playTitle
    authorization.value = props.authorization
    const handleIframeMessage = (event: MessageEvent) => {
      console.log('[父页面]发送消息:', typeof event.data, event.data)
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data)
        if (data.type === 'requestAuthorization') {
          const payload = JSON.stringify({
            type: 'authorization',
            data: authorization.value,
          })
          iframeRef.value?.contentWindow?.postMessage(payload, '*')
        }
      }
    }
    window.addEventListener('message', handleIframeMessage)
    onUnmounted(() => {
      window.removeEventListener('message', handleIframeMessage)
    })
    // #endif

    // #ifdef MP || APP-PLUS
    onMounted(() => {
      (getCurrentInstance() as any).proxy.getOpenerEventChannel().on('navigateToSendData', (data: any) => {
        console.log('收到跳转数据', data)
        authorization.value = data.authorization
        playTitle.value = data.playTitle
        playUrl.value = `${data.playUrl}?authorization=${data.authorization}`
        reloadKey.value++
        uni.setNavigationBarTitle({
          title: data.playTitle,
        })
      })
    })
    // #endif

    return {
      playTitle,
      playUrl,
      iframeRef,
      reloadKey,
      retryPlay,
      closePlayer,
    }
  },
})
</script>

<template>
  <view class="player-fullscreen">
    <!-- #ifdef H5 -->
    <view class="player-header">
      <u-icon name="arrow-left" size="32" color="#000" class="back-icon" @click="closePlayer" />
      <text class="player-title">
        {{ playTitle }}
      </text>
      <u-icon name="reload" size="32" color="#000" class="reload-icon" @click="retryPlay" />
    </view>
    <!-- #endif -->

    <view class="player-content">
      <!-- #ifdef H5 -->
      <iframe
        :key="reloadKey" ref="iframeRef" class="video-frame" :src="playUrl"
        allow="autoplay; fullscreen; screen-wake-lock"
      />
      <!-- #endif -->
      <!-- #ifdef MP | APP-PLUS -->
      <web-view :key="reloadKey" class="video-frame" :src="playUrl" />
      <!-- #endif -->
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
</style>
