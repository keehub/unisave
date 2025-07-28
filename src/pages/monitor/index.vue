<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { request } from '@/services/request'
// #ifdef H5
import player from '../player/index.vue'
// #endif

export default defineComponent({
  name: 'MonitorPage',
  // #ifdef H5
  components: {
    player,
  },
  // #endif
  setup() {
    const playTitle = ref('')
    const selectedId = ref('')
    const playUrl = ref('')
    const selectedLabel = ref('')
    const showTree = ref(false)
    const showPlayer = ref(false)
    const videoList = ref<any[]>([])
    const nestedTree = ref<any[]>([])
    const baseUrl = ref('https://water.nbcxps.com')
    const authorization = ref('Bearer eyJhbGciOiJSUzI1N')
    const closePlayer = () => {
      showPlayer.value = false
    }

    const isDeviceNode = (node: any): boolean => {
      return node?.playInfo != null
    }

    const expandDeepest = (node: any): any => {
      if (isDeviceNode(node)) {
        return null
      }
      node.expanded = true
      const nonDeviceChildren = (node.children || []).filter(
        (child: any) => !isDeviceNode(child),
      )
      if (nonDeviceChildren.length > 0) {
        return expandDeepest(nonDeviceChildren[0])
      }
      return node
    }

    const toggleExpand = (node: any) => {
      if (!isDeviceNode(node) && node.hasChildren) {
        node.expanded = !node.expanded
      }
    }

    const collectPlayableDevices = (node: any): any[] => {
      const devices: any[] = []
      const traverse = (currentNode: any) => {
        if (!currentNode.children)
          return
        currentNode.children.forEach((child: any) => {
          if (isDeviceNode(child)) {
            devices.push(child)
          }
          else if (child.children) {
            traverse(child)
          }
        })
      }
      traverse(node)
      return devices
    }

    const handleNodeClick = (node: any) => {
      if (isDeviceNode(node))
        return
      if (node.hasChildren) {
        toggleExpand(node)
      }
      else {
        showTree.value = false
      }
      selectedId.value = node.id
      selectedLabel.value = node.labelNotes
      videoList.value = collectPlayableDevices(node)
    }

    const transformToNestedTree = (nodes: any[], level: number): any[] => {
      return nodes.map((node) => {
        const children = node.children || []
        const hasChildren = Array.isArray(children) && children.length > 0
        return {
          ...node,
          level,
          hasChildren,
          expanded: false,
          imageLoaded: true,
          children: hasChildren ? transformToNestedTree(children, level + 1) : [],
        }
      })
    }

    const prepareTreeData = (data: any) => {
      nestedTree.value = transformToNestedTree(data, 0)
      if (nestedTree.value.length > 0) {
        const deepestNode = expandDeepest(nestedTree.value[0])
        if (deepestNode) {
          handleNodeClick(deepestNode)
        }
      }
    }

    const displayList = computed(() => {
      const list: any[] = []
      const traverse = (nodes: any[]) => {
        nodes.forEach((node) => {
          if (!isDeviceNode(node)) {
            list.push(node)
            if (node.hasChildren && node.expanded) {
              traverse(node.children)
            }
          }
        })
      }
      traverse(nestedTree.value)
      return list
    })

    const playVideo = (item: any, type: string) => {
      const url = type === 'live' ? item.playInfo?.url : item.playInfo?.control
      if (!url) {
        uni.showToast({ title: '该设备暂时无法操作', icon: 'none' })
        return
      }
      playTitle.value = item.labelNotes
      // playUrl.value = baseUrl.value + url
      playUrl.value = 'https://water.sxsrxt.com/video/dist/test.html'

      // #ifdef H5
      showPlayer.value = true
      // #endif

      // #ifdef MP || APP-PLUS
      uni.navigateTo({
        url: '/pages/player/index',
        success: (res) => {
          res.eventChannel.emit('navigateToSendData', {
            authorization: authorization.value,
            playTitle: playTitle.value,
            playUrl: playUrl.value,
          })
        },
      })
      // #endif
    }

    onMounted(() => {
      uni.showLoading({ title: '数据加载中...' })
      request<any>(`${baseUrl.value}/video/wvp/api/sangrui/tree`, {}, {
        method: 'GET',
      }).then((res: any) => {
        uni.hideLoading()
        prepareTreeData(res.data)
      }).catch((err: any) => {
        uni.hideLoading()
        console.error(err)
      })
    })

    onBeforeUnmount(() => {
      if (showPlayer.value) {
        closePlayer()
      }
    })

    return {
      baseUrl,
      playUrl,
      showTree,
      showPlayer,
      playTitle,
      selectedId,
      videoList,
      displayList,
      authorization,
      selectedLabel,
      playVideo,
      closePlayer,
      toggleExpand,
      handleNodeClick,
    }
  },
  onLoad() {
    uni.$on('appBackPress', () => {
      if (this.showPlayer) {
        this.closePlayer()
        return true
      }
      return false
    })
  },
})
</script>

<template>
  <view class="monitor-page">
    <!-- 分类选择模块 -->
    <view class="section-select">
      <view class="custom-select-input" :class="{ 'input-active': showTree }" @click="showTree = true">
        <text v-if="selectedLabel" class="selected-text">
          {{ selectedLabel }}
        </text>
        <text v-else class="placeholder-text">
          请选择分类区域
        </text>
        <u-icon name="arrow-down" size="24" class="dropdown-icon" />
      </view>
      <u-popup :show="showTree" mode="bottom" round="16" :duration="300">
        <view class="tree-container">
          <view class="tree-header">
            <text class="title">
              请选择分类区域
            </text>
            <u-icon name="close" size="32" class="close-icon" @click="showTree = false" />
          </view>
          <scroll-view scroll-y class="tree-scroll-view">
            <view
              v-for="node in displayList" :key="node.id" :style="{ '--level': node.level }" class="tree-node"
              @click="handleNodeClick(node)"
            >
              <view class="node-content" :class="{ selected: selectedId === node.id }">
                <u-icon
                  v-if="selectedId === node.id" name="checkbox-mark" size="20" class="select-icon"
                  color="#409eff"
                />
                <u-icon
                  v-else :name="node.expanded ? 'minus' : 'plus'" size="20" class="expand-icon"
                  @click.stop="toggleExpand(node)"
                />
                <text class="node-label">
                  {{ node.labelNotes }}
                </text>
              </view>
            </view>
          </scroll-view>
        </view>
      </u-popup>
    </view>

    <!-- 视频列表模块 -->
    <view class="video-container">
      <view v-for="(item, i) in videoList" :key="i" class="video-item">
        <view class="video-title" @click="playVideo(item, 'control')">
          <view class="status-dot" :class="[item.status ? 'online' : 'offline']" />
          <text>{{ item.labelNotes }}</text>
          <view class="control-icon">
            <u-icon name="setting" size="20" color="#666" />
          </view>
        </view>
        <view class="thumb-container" @click="playVideo(item, 'live')">
          <image
            class="video-thumb" :src="item.imageLoaded ? `${baseUrl}${item.playInfo.snap}` : ''"
            :class="{ placeholder: !item.imageLoaded }" @error="() => { item.imageLoaded = false; }"
          />
        </view>
      </view>
    </view>

    <!-- #ifdef H5 || APP-PLUS -->
    <player
      v-if="showPlayer" :authorization="authorization" :play-url="playUrl" :play-title="playTitle"
      @close="closePlayer"
    />
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped>
.monitor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
}

.custom-select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 15px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: scale(1);

  &.input-active {
    background-color: #f9f9f9;
    border-color: #409eff;
    box-shadow:
      0 0 0 2px rgb(64 158 255 / 20%),
      0 4px 8px rgb(64 158 255 / 10%);
    transform: scale(1.03);
  }

  &:active {
    transition: all 0.1s ease;
    transform: scale(0.98);
  }

  .placeholder-text {
    font-size: 14px;
    color: #999;
  }

  .selected-text {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }

  .dropdown-icon {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.video-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-bottom: 10px;
  margin-top: 15px;
  overflow-y: auto;

  .video-item {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 150px;
    overflow: hidden;
    cursor: pointer;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgb(0 0 0 / 8%);

    .video-title {
      position: relative;
      display: flex;
      flex-shrink: 0;
      gap: 6px;
      align-items: center;
      height: 36px;
      padding-left: 5px;
      margin-bottom: 0;
      font-size: 16px;
      font-weight: bold;
      background-color: rgb(0 0 0 / 8%);

      .status-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;

        &.online {
          background-color: #0ba8a2;
          animation: status-dot-online 1.5s infinite alternate;
        }

        &.offline {
          background-color: #f00;
        }
      }

      text {
        flex: 1;
        overflow: hidden;
        font-weight: bold;
        color: #000;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .control-icon {
        position: relative;
        margin-right: 5px;
      }
    }

    .thumb-container {
      position: relative;
      flex: 1;
      overflow: hidden;
    }

    .video-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-thumb.placeholder {
      background-color: #f5f5f5;
      background-image:
        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      background-size: 20px 20px;
    }
  }
}

.tree-container {
  padding: 15px;
  background-color: #fff;

  .tree-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    .title {
      width: 100%;
      font-size: 18px;
      font-weight: bold;
      color: #000;
      text-align: center;
    }

    .close-icon {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  .tree-scroll-view {
    height: 60vh;
  }

  .tree-node {
    padding: 8px 0;
    padding-left: calc(var(--level) * 20px);

    .node-content {
      display: flex;
      align-items: center;
      padding: 8px 10px;
      border-radius: 6px;
      transition: background-color 0.3s;

      &.selected {
        background-color: rgb(64 158 255 / 10%);
        border-left: 3px solid #409eff;
      }
    }

    .expand-icon,
    .select-icon {
      margin-right: 8px;
      color: #606266;
    }

    .node-label {
      font-size: 16px;
      font-weight: bold;
      color: #000;
    }
  }
}

@keyframes status-dot-online {
  0% {
    box-shadow: 0 0 0 0 rgb(11 168 162 / 40%);
    transform: scale(1);
  }

  70% {
    box-shadow: 0 0 0 8px rgb(11 168 162 / 0%);
    transform: scale(1.1);
  }

  100% {
    box-shadow: 0 0 0 0 rgb(11 168 162 / 0%);
    transform: scale(1);
  }
}
</style>
