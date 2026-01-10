<template>
  <view class="page">
    <!-- 扫码区域 -->
    <view class="scan-area" v-if="!pileInfo">
      <view class="scan-tip">
        <text class="tip-title">扫描充电桩上的二维码</text>
        <text class="tip-desc">请将二维码放入扫描框内</text>
      </view>

      <!-- 切换按钮 -->
      <view class="mode-switch">
        <view 
          :class="['switch-item', { active: scanMode === 'camera' }]"
          @click="scanMode = 'camera'"
        >
          <text class="switch-text">扫码</text>
        </view>
        <view 
          :class="['switch-item', { active: scanMode === 'input' }]"
          @click="scanMode = 'input'"
        >
          <text class="switch-text">输入码</text>
        </view>
      </view>

      <!-- 摄像头扫码模式 -->
      <view v-if="scanMode === 'camera'" class="camera-container">
        <!-- 扫描框遮罩层 -->
        <view class="scan-mask">
          <view class="mask-top"></view>
          <view class="mask-middle">
            <view class="mask-left"></view>
            <view class="scan-frame-inner">
              <view class="frame-corner top-left"></view>
              <view class="frame-corner top-right"></view>
              <view class="frame-corner bottom-left"></view>
              <view class="frame-corner bottom-right"></view>
              <view class="scan-line"></view>
            </view>
            <view class="mask-right"></view>
          </view>
          <view class="mask-bottom"></view>
        </view>

        <!-- 小程序使用 camera 组件 -->
        <!-- #ifdef MP-WEIXIN -->
        <camera
          class="camera"
          device-position="back"
          flash="off"
          frame-size="medium"
          @initdone="onCameraInit"
          @error="onCameraError"
          @scancode="handleScanCode"
        />
        <!-- #endif -->
        
        <!-- H5 使用原生摄像头 -->
        <!-- #ifdef H5 -->
        <view class="h5-camera-wrapper">
          <view v-show="!h5StreamActive" class="camera-placeholder">
            <view class="placeholder-icon">📷</view>
            <text class="placeholder-text">H5环境下建议使用输入码方式扫码</text>
            <text class="placeholder-hint">或点击下方按钮尝试开启摄像头</text>
            <view class="btn btn-white btn-block mt-40" @click="handleH5Scan">
              开启摄像头
            </view>
          </view>
          <!-- video和canvas始终存在于DOM中，通过v-show控制显示 -->
          <view class="h5-video-container" :style="{ display: h5StreamActive ? 'block' : 'none' }">
            <video
              id="h5-camera-video"
              class="h5-video"
              autoplay
              playsinline
              muted
            />
            <canvas
              id="h5-camera-canvas"
              class="h5-canvas"
              style="display: none;"
            />
            <view class="h5-camera-controls">
              <view class="btn btn-white btn-block" @click="stopH5Camera">关闭摄像头</view>
              <view class="h5-scan-tip">摄像头已开启，请使用输入码方式识别二维码</view>
            </view>
          </view>
        </view>
        <!-- #endif -->
      </view>

      <!-- 手动输入模式 -->
      <view v-if="scanMode === 'input'" class="manual-input">
        <view class="input-wrap">
          <input
            v-model="manualCode"
            placeholder="请输入充电桩编号"
            class="code-input"
            placeholder-class="input-placeholder"
            type="text"
          />
        </view>
        <view class="btn btn-white btn-block mt-32" @click="handleManualInput">
          确认
        </view>
      </view>
    </view>

      <!-- 充电桩信息 -->
    <view v-else class="pile-info">
      <!-- 返回按钮 -->
      <view class="back-btn" @click="handleBack">
        <text class="iconfont icon-arrow-left"></text>
        <text>重新扫码</text>
      </view>

      <view class="info-card card">
        <view class="card-header">
          <view class="pile-icon">
            <text class="iconfont icon-charging-pile"></text>
          </view>
          <view class="pile-basic">
            <text class="pile-name">{{ pileInfo.pileName }}</text>
            <text class="pile-station">{{ pileInfo.stationName }}</text>
          </view>
          <view :class="['pile-status', getStatusClass(pileInfo.status)]">
            {{ getStatusText(pileInfo.status) }}
          </view>
        </view>

        <view class="card-body">
          <view class="info-row">
            <text class="info-label">充电类型</text>
            <view class="info-value-right">
              <text :class="['type-tag', pileInfo.type === 'fast' ? 'type-fast' : 'type-slow']">
                {{ pileInfo.type === 'fast' ? '⚡ 快充' : '🔋 慢充' }}
              </text>
            </view>
          </view>
          <view class="info-row">
            <text class="info-label">额定功率</text>
            <text class="info-value">{{ pileInfo.power }} kW</text>
          </view>
          <view class="info-row">
            <text class="info-label">当前电价</text>
            <text class="info-value price">¥{{ pileInfo.price.toFixed(2) }}/度</text>
          </view>
        </view>
      </view>

      <!-- 状态提示 -->
      <view v-if="!canCharge" class="warning-card card">
        <view class="warning-title">
          <text class="iconfont icon-warning"></text>
          <text>无法充电</text>
        </view>
        <view class="warning-content">
          <text v-if="pileInfo.status !== PILE_STATUS.FREE">
            {{ getStatusText(pileInfo.status) }}，请选择其他充电桩
          </text>
          <text v-else-if="userStore.balance < 10">
            账户余额不足（当前余额：¥{{ userStore.balance.toFixed(2) }}），请先充值
          </text>
        </view>
        <view v-if="userStore.balance < 10" class="warning-action">
          <view class="btn btn-outline" @click="goToRecharge">去充值</view>
        </view>
      </view>

      <!-- 注意事项 -->
      <view class="notice card">
        <view class="notice-title">
          <text class="iconfont icon-info"></text>
          充电须知
        </view>
        <view class="notice-list">
          <view class="notice-item">1. 请确保充电枪已正确连接</view>
          <view class="notice-item">2. 充电过程中请勿拔出充电枪</view>
          <view class="notice-item">3. 如遇异常请立即停止充电</view>
          <view class="notice-item">4. 充电完成后请及时拔出充电枪</view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-action safe-area-bottom">
        <view class="balance-info">
          <text class="balance-label">账户余额</text>
          <text class="balance-value">¥{{ userStore.balance.toFixed(2) }}</text>
          <text v-if="userStore.balance < 10" class="balance-warning">余额不足</text>
        </view>
        <view
          :class="['btn', 'btn-primary', { 'btn-disabled': !canCharge }]"
          @click="handleStartCharging"
        >
          {{ startBtnText }}
        </view>
      </view>
    </view>

    <!-- 加载遮罩 -->
    <view v-if="loading" class="loading-mask">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在识别二维码...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { useChargingStore } from '@/store/modules/charging'
import { chargingApi } from '@/api/charging'
import { PILE_STATUS, PILE_STATUS_TEXT, PAGE_PATH } from '@/constants'

// Store
const userStore = useUserStore()
const chargingStore = useChargingStore()

// 状态
const scanMode = ref<'camera' | 'input'>('camera') // 扫码模式：camera-摄像头扫码，input-手动输入
const manualCode = ref('')
const pileInfo = ref<{
  pileId: number
  stationId: number
  stationName: string
  pileName: string
  type: string
  power: number
  price: number
  status: number
} | null>(null)
const loading = ref(false)
const cameraReady = ref(false)

// H5 摄像头相关
// #ifdef H5
const h5StreamActive = ref(false)
let h5Stream: MediaStream | null = null
let h5ScanInterval: number | null = null
let h5VideoElement: HTMLVideoElement | null = null
let h5CanvasSizeHandler: (() => void) | null = null

// 获取原生video元素（通过ID，避免ref的Proxy问题）
function getH5VideoElement(): HTMLVideoElement | null {
  if (typeof document === 'undefined') {
    console.warn('[getH5VideoElement] document未定义')
    return null
  }
  
  // 尝试多种方式获取元素
  let el = document.getElementById('h5-camera-video')
  if (!el) {
    el = document.querySelector('#h5-camera-video') as HTMLElement | null
  }
  if (!el) {
    el = document.querySelector('video#h5-camera-video') as HTMLElement | null
  }
  
  if (!el) {
    console.warn('[getH5VideoElement] 未找到video元素，当前DOM结构:', {
      allVideos: document.querySelectorAll('video').length,
      allElementsWithId: Array.from(document.querySelectorAll('[id]')).map(e => e.id),
    })
    return null
  }
  
  if (el instanceof HTMLVideoElement) {
    return el
  } else {
    console.warn('[getH5VideoElement] 找到的元素不是HTMLVideoElement', el)
    return null
  }
}

function getH5CanvasElement(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') {
    console.warn('[getH5CanvasElement] document未定义')
    return null
  }
  
  // 尝试多种方式获取元素
  let el = document.getElementById('h5-camera-canvas')
  if (!el) {
    el = document.querySelector('#h5-camera-canvas') as HTMLElement | null
  }
  if (!el) {
    el = document.querySelector('canvas#h5-camera-canvas') as HTMLElement | null
  }
  
  if (!el) {
    console.warn('[getH5CanvasElement] 未找到canvas元素')
    return null
  }
  
  if (el instanceof HTMLCanvasElement) {
    return el
  } else {
    console.warn('[getH5CanvasElement] 找到的元素不是HTMLCanvasElement', el)
    return null
  }
}
// #endif

// 计算属性
const canCharge = computed(() => {
  if (!pileInfo.value) return false
  if (pileInfo.value.status !== PILE_STATUS.FREE) return false
  if (userStore.balance < 10) return false
  return true
})

const startBtnText = computed(() => {
  if (!pileInfo.value) return '扫码充电'
  if (pileInfo.value.status !== PILE_STATUS.FREE) return '充电桩不可用'
  if (userStore.balance < 10) return '余额不足'
  return '开始充电'
})

// 页面加载
onLoad((options) => {
  if (options?.code) {
    handleQRCode(decodeURIComponent(options.code))
  }
})

onMounted(() => {
  // 获取余额
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo()
  }
  
  // #ifdef H5
  // 验证H5元素是否存在于DOM中
  nextTick(() => {
    setTimeout(() => {
      const videoEl = getH5VideoElement()
      const canvasEl = getH5CanvasElement()
      console.log('[onMounted] H5元素检查:', {
        videoEl: !!videoEl,
        canvasEl: !!canvasEl,
        videoElId: videoEl?.id,
        canvasElId: canvasEl?.id,
        documentReady: document.readyState,
      })
      
      // 如果元素不存在，尝试查找所有video和canvas元素
      if (!videoEl || !canvasEl) {
        const allVideos = document.querySelectorAll('video')
        const allCanvases = document.querySelectorAll('canvas')
        console.warn('[onMounted] DOM中存在的元素:', {
          videoCount: allVideos.length,
          canvasCount: allCanvases.length,
          videoIds: Array.from(allVideos).map(v => v.id),
          canvasIds: Array.from(allCanvases).map(c => c.id),
        })
      }
    }, 500)
  })
  // #endif
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  // #ifdef H5
  stopH5Camera()
  // #endif
})

// 处理扫码结果
async function handleQRCode(code: string) {
  if (!code || !code.trim()) {
    uni.showToast({
      title: '二维码内容为空',
      icon: 'none',
    })
    return
  }

  loading.value = true
  try {
    const result = await chargingApi.scanPile(code.trim())
    pileInfo.value = result
    
    // 扫码成功提示
    uni.showToast({
      title: '扫码成功',
      icon: 'success',
      duration: 1500,
    })
    
    // 小程序扫码成功后震动反馈
    // #ifdef MP-WEIXIN
    uni.vibrateShort()
    // #endif
  } catch (error: any) {
    console.error('扫码失败:', error)
    
    // 根据不同错误显示不同提示
    let errorMsg = '无效的充电桩二维码'
    if (error?.message) {
      if (error.message.includes('不存在')) {
        errorMsg = '充电桩不存在'
      } else if (error.message.includes('格式')) {
        errorMsg = '二维码格式错误，请重试'
      } else if (error.message.includes('网络')) {
        errorMsg = '网络错误，请检查网络连接'
      } else {
        errorMsg = error.message
      }
    }
    
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000,
    })
    
    // 清空输入框（H5）
    // #ifdef H5
    manualCode.value = ''
    // #endif
  } finally {
    loading.value = false
  }
}

// 小程序扫码回调
function handleScanCode(e: { detail: { result: string } }) {
  handleQRCode(e.detail.result)
}

// 小程序摄像头初始化成功
function onCameraInit() {
  cameraReady.value = true
  console.log('摄像头初始化成功')
}

// 小程序摄像头初始化失败
function onCameraError(e: any) {
  console.error('摄像头初始化失败:', e)
  uni.showToast({
    title: '摄像头初始化失败，请检查权限设置',
    icon: 'none',
    duration: 2000,
  })
  // 自动切换到输入模式
  scanMode.value = 'input'
}

// H5 开启摄像头
async function handleH5Scan() {
  // #ifdef H5
  try {
    // 检查浏览器是否支持getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      uni.showModal({
        title: '提示',
        content: '您的浏览器不支持摄像头功能，请使用输入码方式',
        confirmText: '切换',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            scanMode.value = 'input'
          }
        },
      })
      return
    }

    // 请求摄像头权限
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 使用后置摄像头
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })

    h5Stream = stream
    // 先设置状态，video元素现在始终存在于DOM中
    h5StreamActive.value = true
    
    // 等待一下确保状态更新完成
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 获取video和canvas元素（现在应该能直接获取到）
    let videoEl = getH5VideoElement()
    let canvasEl = getH5CanvasElement()

    // 如果还是找不到，尝试再等待一下（最多3次）
    if (!videoEl || !canvasEl) {
      for (let i = 0; i < 3; i++) {
        await nextTick()
        await new Promise((resolve) => setTimeout(resolve, 200))
        videoEl = getH5VideoElement()
        canvasEl = getH5CanvasElement()
        if (videoEl && canvasEl) {
          console.log(`第 ${i + 1} 次重试后成功获取video元素`)
          break
        }
      }
    }

    // 如果找不到元素，尝试动态创建
    if (!videoEl || !canvasEl) {
      console.warn('模板中的video/canvas元素未找到，尝试动态创建...')
      
      const wrapper = document.querySelector('.h5-camera-wrapper')
      if (!wrapper) {
        console.error('未找到h5-camera-wrapper容器')
        uni.showToast({
          title: '容器元素未找到',
          icon: 'none',
          duration: 3000,
        })
        stopH5Camera()
        return
      }
      
      // 动态创建video元素
      if (!videoEl) {
        const newVideo = document.createElement('video')
        newVideo.id = 'h5-camera-video'
        newVideo.className = 'h5-video'
        newVideo.setAttribute('autoplay', 'true')
        newVideo.setAttribute('playsinline', 'true')
        newVideo.setAttribute('muted', 'true')
        newVideo.style.display = 'block'
        wrapper.appendChild(newVideo)
        videoEl = newVideo
        console.log('动态创建了video元素')
      }
      
      // 动态创建canvas元素
      if (!canvasEl) {
        const newCanvas = document.createElement('canvas')
        newCanvas.id = 'h5-camera-canvas'
        newCanvas.className = 'h5-canvas'
        newCanvas.style.display = 'none'
        wrapper.appendChild(newCanvas)
        canvasEl = newCanvas
        console.log('动态创建了canvas元素')
      }
    }
    
    if (!videoEl || !canvasEl) {
      console.error('无法获取或创建video/canvas元素', {
        videoEl: !!videoEl,
        canvasEl: !!canvasEl,
        h5StreamActive: h5StreamActive.value,
      })
      uni.showToast({
        title: '视频元素初始化失败',
        icon: 'none',
        duration: 3000,
      })
      stopH5Camera()
      return
    }
    
    console.log('成功获取/创建video和canvas元素', { 
      videoEl, 
      canvasEl,
      videoId: videoEl.id,
      canvasId: canvasEl.id,
    })

    try {
      // 设置视频流
      if ('srcObject' in videoEl) {
        videoEl.srcObject = stream
      } else {
        // 兼容旧浏览器
        const videoElAny = videoEl as any
        videoElAny.src = URL.createObjectURL(stream as any)
      }

      // 播放视频
      const playPromise = videoEl.play()
      if (playPromise !== undefined && playPromise instanceof Promise) {
        playPromise
          .then(() => {
            console.log('视频播放成功，开始二维码扫描')
            uni.showToast({
              title: '摄像头已开启',
              icon: 'success',
              duration: 2000,
            })
            // 视频播放成功后启动二维码扫描
            startH5QRCodeScan(videoEl, canvasEl)
          })
          .catch((err: any) => {
            console.error('视频播放失败:', err)
            uni.showToast({
              title: '视频播放失败: ' + (err.message || '未知错误'),
              icon: 'none',
              duration: 3000,
            })
            stopH5Camera()
          })
      } else {
        // play()立即返回（旧浏览器）
        setTimeout(() => {
          uni.showToast({
            title: '摄像头已开启',
            icon: 'success',
            duration: 2000,
          })
          // 启动二维码扫描
          startH5QRCodeScan(videoEl, canvasEl)
        }, 500)
      }
    } catch (err: any) {
      console.error('设置视频流失败:', err)
      uni.showToast({
        title: '设置视频流失败: ' + (err.message || '未知错误'),
        icon: 'none',
        duration: 3000,
      })
      stopH5Camera()
    }
  } catch (error: any) {
    console.error('摄像头启动失败:', error)
    let errorMsg = '无法访问摄像头'
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMsg = '请允许访问摄像头权限'
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMsg = '未找到摄像头设备'
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMsg = '摄像头被其他应用占用'
    }

    uni.showModal({
      title: '摄像头启动失败',
      content: errorMsg + '，是否切换到输入码方式？',
      confirmText: '切换',
      cancelText: '取消',
      success: (modalRes) => {
        if (modalRes.confirm) {
          scanMode.value = 'input'
        }
      },
    })
  }
  // #endif
}

// H5 启动二维码扫描
function startH5QRCodeScan(videoEl: HTMLVideoElement, canvasEl: HTMLCanvasElement) {
  // 保存video元素引用
  h5VideoElement = videoEl
  
  // 停止之前的扫描定时器
  if (h5ScanInterval) {
    clearInterval(h5ScanInterval)
    h5ScanInterval = null
  }

  // 清理之前的事件监听器
  if (h5CanvasSizeHandler && h5VideoElement) {
    h5VideoElement.removeEventListener('loadedmetadata', h5CanvasSizeHandler)
  }

  // 设置canvas尺寸与video一致
  const setCanvasSize = () => {
    if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
      canvasEl.width = videoEl.videoWidth
      canvasEl.height = videoEl.videoHeight
    } else {
      canvasEl.width = videoEl.clientWidth || 640
      canvasEl.height = videoEl.clientHeight || 480
    }
    console.log('Canvas尺寸已更新:', { width: canvasEl.width, height: canvasEl.height })
  }

  // 保存事件处理函数引用
  h5CanvasSizeHandler = setCanvasSize

  // 初始化canvas尺寸
  setCanvasSize()

  // 监听video尺寸变化
  videoEl.addEventListener('loadedmetadata', setCanvasSize)

  // 尝试加载jsQR库并开始扫描
  const startScan = async () => {
    let jsQR: any = null
    
    try {
      // 动态导入jsQR
      const jsQRModule = await import('jsqr')
      jsQR = jsQRModule.default
      console.log('jsQR库加载成功')
    } catch (err) {
      console.warn('jsQR库未安装，尝试使用Canvas API识别', err)
      // 如果jsQR未安装，提示用户
      uni.showToast({
        title: '二维码识别库未安装，请安装jsqr',
        icon: 'none',
        duration: 3000,
      })
      return
    }

    // 开始定时扫描
    h5ScanInterval = window.setInterval(() => {
      try {
        // 检查video是否已加载且正在播放
        if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
          const ctx = canvasEl.getContext('2d')
          if (!ctx) {
            console.error('无法获取canvas上下文')
            return
          }

          // 绘制当前视频帧到canvas
          ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height)

          // 获取图像数据
          const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)

          // 使用jsQR识别二维码
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })

          if (code) {
            console.log('识别到二维码:', code.data)
            // 停止扫描
            if (h5ScanInterval) {
              clearInterval(h5ScanInterval)
              h5ScanInterval = null
            }
            // 处理二维码
            handleQRCode(code.data)
            // 关闭摄像头
            stopH5Camera()
          }
        }
      } catch (err: any) {
        console.error('二维码扫描出错:', err)
      }
    }, 300) // 每300ms扫描一次
  }

  // 等待一下再开始扫描，确保视频已开始播放
  setTimeout(() => {
    startScan()
  }, 1000)
}

// H5 关闭摄像头
function stopH5Camera() {
  // #ifdef H5
  // 停止扫描定时器
  if (h5ScanInterval) {
    clearInterval(h5ScanInterval)
    h5ScanInterval = null
  }

  // 清理事件监听器
  if (h5VideoElement && h5CanvasSizeHandler) {
    h5VideoElement.removeEventListener('loadedmetadata', h5CanvasSizeHandler)
    h5CanvasSizeHandler = null
  }

  // 停止所有视频轨道
  if (h5Stream) {
    h5Stream.getTracks().forEach((track) => {
      track.stop()
    })
    h5Stream = null
  }

  // 清理video元素（通过ID获取原生元素）
  const videoEl = getH5VideoElement() || h5VideoElement
  if (videoEl) {
    try {
      videoEl.pause()
      if ('srcObject' in videoEl) {
        videoEl.srcObject = null
      } else if ((videoEl as any).src) {
        // 如果使用createObjectURL创建的URL，需要revoke
        try {
          URL.revokeObjectURL((videoEl as any).src)
        } catch (e) {
          // 忽略revoke错误
        }
        (videoEl as any).src = ''
      }
    } catch (e) {
      console.error('清理video元素失败:', e)
    }
  }

  h5VideoElement = null
  h5StreamActive.value = false
  // #endif
}

// H5 手动输入
function handleManualInput() {
  if (!manualCode.value.trim()) {
    uni.showToast({ title: '请输入充电桩编号', icon: 'none' })
    return
  }
  handleQRCode(manualCode.value.trim())
}

// 获取状态样式
function getStatusClass(status: number): string {
  switch (status) {
    case PILE_STATUS.FREE:
      return 'success'
    case PILE_STATUS.CHARGING:
      return 'warning'
    case PILE_STATUS.FAULT:
    case PILE_STATUS.OFFLINE:
      return 'danger'
    default:
      return ''
  }
}

// 获取状态文字
function getStatusText(status: number): string {
  return PILE_STATUS_TEXT[status] || '未知'
}

// 返回重新扫码
function handleBack() {
  uni.showModal({
    title: '提示',
    content: '确定要返回重新扫码吗？',
    success: (res) => {
      if (res.confirm) {
        pileInfo.value = null
        manualCode.value = ''
      }
    },
  })
}

// 跳转到充值页面
function goToRecharge() {
  uni.navigateTo({ url: PAGE_PATH.RECHARGE })
}

// 开始充电
async function handleStartCharging() {
  if (!pileInfo.value) {
    return
  }

  if (!canCharge.value) {
    // 如果余额不足，引导充值
    if (userStore.balance < 10) {
      uni.showModal({
        title: '余额不足',
        content: `当前余额 ¥${userStore.balance.toFixed(2)}，需要至少 ¥10 才能开始充电，是否前往充值？`,
        confirmText: '去充值',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            goToRecharge()
          }
        },
      })
    } else if (pileInfo.value.status !== PILE_STATUS.FREE) {
      uni.showToast({
        title: getStatusText(pileInfo.value.status) + '，无法充电',
        icon: 'none',
        duration: 2000,
      })
    }
    return
  }

  // 确认开始充电
  uni.showModal({
    title: '确认开始充电',
    content: `充电桩：${pileInfo.value.pileName}\n所属站点：${pileInfo.value.stationName}\n充电类型：${pileInfo.value.type === 'fast' ? '快充' : '慢充'}\n当前电价：¥${pileInfo.value.price.toFixed(2)}/度\n\n确认开始充电吗？`,
    confirmText: '确认开始',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '正在启动充电...' })
          await chargingStore.startCharging(pileInfo.value!.pileId)
          uni.hideLoading()

          uni.showToast({
            title: '充电已启动',
            icon: 'success',
            duration: 2000,
          })

          // 跳转到充电页面
          setTimeout(() => {
            uni.redirectTo({ url: PAGE_PATH.CHARGING })
          }, 2000)
        } catch (error: any) {
          uni.hideLoading()
          
          let errorMsg = '启动失败，请重试'
          if (error?.message) {
            if (error.message.includes('余额')) {
              errorMsg = '余额不足，请先充值'
            } else if (error.message.includes('订单')) {
              errorMsg = '您已有进行中的充电订单'
            } else if (error.message.includes('不可用')) {
              errorMsg = '充电桩当前不可用，请选择其他充电桩'
            } else {
              errorMsg = error.message
            }
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000,
          })
          
          // 如果余额不足，引导充值
          if (errorMsg.includes('余额')) {
            setTimeout(() => {
              goToRecharge()
            }, 2000)
          }
        }
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.scan-area {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000000;
  padding: calc(var(--status-bar-height, 44px) + 40rpx) 0 0;
}

.scan-tip {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 0 40rpx;

  .tip-title {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #FFFFFF;
    margin-bottom: 8rpx;
    line-height: 1.4;
  }

  .tip-desc {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }
}

// 模式切换
.mode-switch {
  display: flex;
  gap: 16rpx;
  padding: 0 40rpx;
  margin-bottom: 40rpx;

  .switch-item {
    flex: 1;
    height: 68rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.08);
    border: 1rpx solid rgba(255, 255, 255, 0.15);
    border-radius: 10rpx;
    transition: all 0.2s ease;

    &.active {
      background-color: #FFFFFF;
      border-color: #FFFFFF;

      .switch-text {
        color: #000000;
        font-weight: 500;
      }
    }

    .switch-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.85);
      transition: color 0.2s ease;
    }
  }
}

// 摄像头容器
.camera-container {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
}

.camera {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

// H5 摄像头容器
.h5-camera-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.h5-video-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.h5-video {
  width: 100%;
  max-width: 500rpx;
  height: auto;
  max-height: 500rpx;
  object-fit: cover;
  border-radius: 12rpx;
  background-color: #000000;
  transform: scaleX(-1); // 镜像翻转，符合用户习惯
}

.h5-canvas {
  display: none !important;
}

.h5-camera-controls {
  margin-top: 32rpx;
  width: 100%;
  max-width: 500rpx;
  padding: 0 40rpx;
}

.h5-scan-tip {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  line-height: 1.5;
}

// H5 摄像头占位
.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 500rpx;
  padding: 60rpx 40rpx;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;

  .placeholder-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
    opacity: 0.7;
  }

  .placeholder-text {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12rpx;
    text-align: center;
    line-height: 1.5;
  }

  .placeholder-hint {
    display: block;
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 32rpx;
    text-align: center;
    line-height: 1.5;
  }
}

// 扫描框遮罩层
.scan-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.mask-top,
.mask-bottom {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
}

.mask-middle {
  display: flex;
  height: 500rpx;
  width: 100%;
  justify-content: center;
}

.mask-left,
.mask-right {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
}

.scan-frame-inner {
  position: relative;
  width: 500rpx;
  height: 500rpx;
  flex-shrink: 0;
}

.frame-corner {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border-color: #FFFFFF;
  border-style: solid;
  border-width: 4rpx;

  &.top-left {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
    border-radius: 8rpx 0 0 0;
  }

  &.top-right {
    top: 0;
    right: 0;
    border-left: none;
    border-bottom: none;
    border-radius: 0 8rpx 0 0;
  }

  &.bottom-left {
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: none;
    border-radius: 0 0 0 8rpx;
  }

  &.bottom-right {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
    border-radius: 0 0 8rpx 0;
  }
}

.scan-line {
  position: absolute;
  top: 0;
  left: 60rpx;
  right: 60rpx;
  height: 2rpx;
  background: #FFFFFF;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 1;
  }
  100% {
    top: calc(100% - 2rpx);
    opacity: 1;
  }
}

// 手动输入
.manual-input {
  padding: 0 40rpx;
  width: 100%;
  max-width: 500rpx;
  margin: 0 auto;

  .input-wrap {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1rpx solid rgba(255, 255, 255, 0.15);
    border-radius: 10rpx;
    padding: 0 20rpx;
    margin-bottom: 24rpx;
    transition: border-color 0.2s ease;

    &:focus-within {
      border-color: rgba(255, 255, 255, 0.35);
    }
  }

  .code-input {
    height: 80rpx;
    color: #FFFFFF;
    font-size: 28rpx;
    line-height: 1.5;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .input-placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
}

.mt-32 {
  margin-top: 24rpx;
}

// 充电桩信息
.pile-info {
  padding: 24rpx;
  padding-bottom: 200rpx;
  min-height: 100vh;
  background-color: var(--bg-color);
}

.info-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  margin-left: 0;
  margin-right: 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    align-items: center;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid var(--border-color);
  }

  .pile-icon {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;

    .iconfont {
      font-size: 50rpx;
      color: #FFFFFF;
    }
  }

  .pile-basic {
    flex: 1;
  }

  .pile-name {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
  }

  .pile-station {
    font-size: 26rpx;
    color: var(--text-secondary);
  }

  .pile-status {
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    border-radius: 20rpx;

    &.success {
      color: var(--primary-color);
      background-color: rgba(76, 175, 80, 0.1);
    }

    &.warning {
      color: var(--warning-color);
      background-color: rgba(255, 152, 0, 0.1);
    }

    &.danger {
      color: var(--danger-color);
      background-color: rgba(244, 67, 54, 0.1);
    }
  }

  .card-body {
    padding-top: 24rpx;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
  }

  .info-label {
    color: var(--text-secondary);
  }

  .info-value {
    font-weight: 500;

    &.price {
      color: var(--primary-color);
      font-size: 32rpx;
    }
  }
}

.notice {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 24rpx;
  margin-left: 0;
  margin-right: 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .notice-title {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 20rpx;

    .iconfont {
      color: var(--warning-color);
      margin-right: 10rpx;
      font-size: 32rpx;
    }
  }

  .notice-item {
    font-size: 26rpx;
    color: var(--text-secondary);
    line-height: 2;
    padding: 8rpx 0;
  }
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 52px;
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

  .balance-info {
    margin-right: 30rpx;
  }

  .balance-label {
    font-size: 24rpx;
    color: var(--text-secondary);
  }

  .balance-value {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: var(--primary-color);
  }

  .btn {
    flex: 1;
  }

  .balance-warning {
    display: block;
    font-size: 22rpx;
    color: var(--danger-color);
    margin-top: 4rpx;
  }
}

// 返回按钮
.back-btn {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  color: var(--text-primary);
  font-size: 28rpx;
  background-color: #FFFFFF;
  border-radius: 12rpx;
  margin-left: 24rpx;
  margin-right: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .iconfont {
    margin-right: 8rpx;
    font-size: 32rpx;
    color: var(--text-primary);
  }
}

// 类型标签
.type-tag {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;

  &.type-fast {
    color: #FF6B35;
    background-color: rgba(255, 107, 53, 0.1);
  }

  &.type-slow {
    color: #4ECDC4;
    background-color: rgba(78, 205, 196, 0.1);
  }
}

.info-value-right {
  display: flex;
  align-items: center;
}

// 警告卡片
.warning-card {
  margin-top: 24rpx;
  margin-left: 0;
  margin-right: 0;
  background-color: #FFF7E6;
  border: 1rpx solid #FFE58F;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .warning-title {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: bold;
    color: #FA8C16;
    margin-bottom: 12rpx;

    .iconfont {
      margin-right: 8rpx;
      font-size: 32rpx;
    }
  }

  .warning-content {
    font-size: 26rpx;
    color: #AD6800;
    line-height: 1.8;
    margin-bottom: 16rpx;
  }

  .warning-action {
    padding-top: 16rpx;
    border-top: 1rpx solid #FFE58F;

    .btn-outline {
      border: 1rpx solid var(--primary-color);
      color: var(--primary-color);
      background-color: transparent;
      width: 100%;
      padding: 20rpx;
      text-align: center;
      border-radius: 12rpx;
    }
  }
}

// 白色按钮样式
.btn-white {
  background-color: #FFFFFF;
  color: #000000;
  font-weight: 500;
  font-size: 28rpx;
  height: 80rpx;
  border-radius: 10rpx;
  transition: opacity 0.2s ease;

  &:active {
    opacity: 0.85;
  }
}

// 加载遮罩
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48rpx 32rpx;
    background-color: rgba(26, 26, 26, 0.95);
    border-radius: 16rpx;

    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 3rpx solid rgba(255, 255, 255, 0.2);
      border-top: 3rpx solid #FFFFFF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 24rpx;
    }

    .loading-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// mt 工具类
.mt-30 {
  margin-top: 30rpx;
}

.mt-40 {
  margin-top: 40rpx;
}
</style>
