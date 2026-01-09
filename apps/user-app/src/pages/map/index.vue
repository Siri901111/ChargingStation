<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-wrap">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input
            v-model="keyword"
            class="search-input"
            placeholder="搜索充电站名称"
            confirm-type="search"
            @confirm="handleSearch"
          />
          <text v-if="keyword" class="clear-icon" @click="clearSearch">✕</text>
        </view>
      </view>
      <!-- 筛选标签 -->
      <view class="filter-tabs">
        <view
          v-for="item in filterOptions"
          :key="item.value"
          :class="['filter-tab', { active: currentFilter === item.value }]"
          @click="handleFilterChange(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <!-- H5平台使用高德地图 -->
    <!-- #ifdef H5 -->
    <view class="map-wrapper">
      <view id="amap-container" class="amap-container"></view>
      <view v-if="mapLoading" class="map-loading">
        <text>地图加载中...</text>
      </view>
      <view v-if="mapError" class="map-error">
        <text>{{ mapError }}</text>
        <view class="retry-btn" @click="initAMap">重试</view>
      </view>
    </view>
    <!-- #endif -->
    
    <!-- 小程序/APP使用原生map组件 -->
    <!-- #ifndef H5 -->
    <map
      id="map"
      class="map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="mapScale"
      :markers="markers"
      :show-location="true"
      @markertap="handleMarkerTap"
      @regionchange="handleRegionChange"
    />
    <!-- #endif -->

    <!-- 重新定位按钮 -->
    <view class="location-btn" @click="relocate">
      <text class="btn-icon">📍</text>
    </view>

    <!-- 站点列表弹窗 -->
    <view :class="['station-popup', { show: showStationList }]">
      <view class="popup-header" @click="toggleStationList">
        <view class="popup-handle"></view>
        <text class="popup-title">附近{{ stationList.length }}个充电站</text>
      </view>
      <scroll-view class="popup-content" scroll-y>
        <view
          v-for="station in stationList"
          :key="station.id"
          class="station-item"
          @click="goToStationDetail(station)"
        >
          <view class="station-info">
            <view class="station-name">{{ station.name }}</view>
            <view class="station-address">{{ station.address || station.city }}</view>
            <view class="station-meta">
              <text class="meta-item">
                <text class="meta-icon fast"></text>
                快充 {{ station.fastFree }}/{{ station.fast }}
              </text>
              <text class="meta-item">
                <text class="meta-icon slow"></text>
                慢充 {{ station.slowFree }}/{{ station.slow }}
              </text>
            </view>
          </view>
          <view class="station-action">
            <view class="station-distance" v-if="station.distance">
              {{ formatDistance(station.distance) }}
            </view>
            <view class="nav-btn" @click.stop="handleNavigation(station)">
              🧭 导航
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 站点详情卡片 -->
    <view v-if="selectedStation" class="station-card" @click="goToStationDetail(selectedStation)">
      <view class="card-header">
        <view class="station-name">{{ selectedStation.name }}</view>
        <text class="close-icon" @click.stop="closeStationCard">✕</text>
      </view>
      <view class="card-body">
        <view class="station-address">{{ selectedStation.address || selectedStation.city }}</view>
        <view class="station-status">
          <view class="status-item">
            <text class="status-label">快充</text>
            <text class="status-value success">{{ selectedStation.fastFree }}</text>
            <text class="status-divider">/</text>
            <text class="status-total">{{ selectedStation.fast }}</text>
          </view>
          <view class="status-item">
            <text class="status-label">慢充</text>
            <text class="status-value success">{{ selectedStation.slowFree }}</text>
            <text class="status-divider">/</text>
            <text class="status-total">{{ selectedStation.slow }}</text>
          </view>
        </view>
      </view>
      <view class="card-footer">
        <view class="price-info" v-if="selectedStation.price">
          <text class="price-value">¥{{ selectedStation.price.toFixed(2) }}</text>
          <text class="price-unit">/度起</text>
        </view>
        <view class="action-btns">
          <view class="action-btn outline" @click.stop="handleNavigation(selectedStation)">
            🧭 导航
          </view>
          <view class="action-btn primary" @click.stop="goToStationDetail(selectedStation)">
            去充电
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useLocationStore } from '@/store/modules/location'
import { stationApi, type Station } from '@/api/station'
import { formatDistance, openNavigation } from '@/utils'
import { PAGE_PATH } from '@/constants'
import config from '@/config'

// Store
const locationStore = useLocationStore()

// 状态
const statusBarHeight = ref(0)
const keyword = ref('')
const currentFilter = ref('all')
const mapScale = ref(14)
const showStationList = ref(false)
const stationList = ref<Station[]>([])
const selectedStation = ref<Station | null>(null)

// H5地图相关（高德地图）
// #ifdef H5
const mapLoading = ref(true)
const mapError = ref('')
let amapInstance: any = null
let amapMap: any = null
let amapMarkers: any[] = []
// #endif

// 地图中心点（默认长沙）
const mapCenter = ref({
  latitude: 28.1963,
  longitude: 112.9822,
})

// 筛选选项
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '快充', value: 'fast' },
  { label: '慢充', value: 'slow' },
  { label: '空闲', value: 'free' },
]

// 地图标记点
const markers = computed(() => {
  return stationList.value.map((station, index) => ({
    id: station.id,
    latitude: station.latitude,
    longitude: station.longitude,
    width: 40,
    height: 50,
    iconPath: getMarkerIcon(station),
    callout: {
      content: station.name,
      color: '#333333',
      fontSize: 12,
      borderRadius: 4,
      padding: 6,
      display: 'BYCLICK',
      bgColor: '#FFFFFF',
    },
  }))
})

// 获取标记图标
function getMarkerIcon(station: Station): string {
  const hasFree = station.fastFree > 0 || station.slowFree > 0
  return hasFree
    ? '/static/marker/marker-green.png'
    : '/static/marker/marker-gray.png'
}

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  // #ifdef H5
  // H5平台初始化高德地图
  nextTick(() => {
    const container = document.getElementById('amap-container')
    if (container) {
      initAMap()
    } else {
      console.error('❌ 地图容器不存在')
      mapError.value = '地图容器初始化失败'
      mapLoading.value = false
    }
  })
  // #endif
  
  // #ifndef H5
  // 小程序/APP平台初始化定位
  initLocation()
  // #endif
})

// #ifdef H5
// 初始化高德地图（严格按照官方文档和admin端实现）
function initAMap() {
  mapLoading.value = true
  mapError.value = ''
  
  // 检查是否已加载高德地图SDK
  if ((window as any).AMap) {
    createMap()
    return
  }
  
  // 动态加载高德地图SDK（使用1.4.15版本，与admin端一致）
  const script = document.createElement('script')
  script.type = 'text/javascript'
  const amapKey = config.amapKey
  script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${amapKey}&callback=initAMapCallback`
  script.async = true
  script.defer = true
  
  // 全局回调函数
  ;(window as any).initAMapCallback = () => {
    setTimeout(() => {
      createMap()
      delete (window as any).initAMapCallback
    }, 100)
  }
  
  script.onerror = () => {
    mapLoading.value = false
    mapError.value = '地图SDK加载失败，请检查网络连接'
    delete (window as any).initAMapCallback
  }
  
  document.head.appendChild(script)
}

// 创建地图实例（参考admin端实现）
function createMap() {
  try {
    amapInstance = (window as any).AMap
    
    if (!amapInstance) {
      throw new Error('高德地图SDK加载失败')
    }
    
    // 获取当前位置或使用默认位置
    const location = locationStore.currentLocation || {
      latitude: 28.1963,
      longitude: 112.9822,
    }
    
    // 在创建地图前，先阻止容器的滚轮事件冒泡（关键：解决页面滚动导致滚轮缩放失效）
    const container = document.getElementById('amap-container')
    if (container) {
      // 阻止滚轮事件冒泡到页面，但不阻止默认行为（让地图可以缩放）
      // 使用 capture 阶段在事件冒泡前捕获并阻止冒泡
      container.addEventListener('wheel', (e) => {
        // 阻止冒泡到document/window，防止页面滚动
        e.stopPropagation()
        // 不调用 e.preventDefault()，让高德地图自己处理滚轮缩放
      }, { passive: false, capture: true })
      
      // 也阻止 map-wrapper 的滚轮事件冒泡
      const mapWrapper = container.parentElement
      if (mapWrapper && mapWrapper.classList.contains('map-wrapper')) {
        mapWrapper.addEventListener('wheel', (e) => {
          // 如果事件来自地图容器或其子元素，阻止冒泡
          if (e.target === container || container.contains(e.target as Node)) {
            e.stopPropagation()
          }
        }, { passive: false, capture: true })
      }
    }
    
    // 创建地图（严格按照官方文档，启用缩放、拖拽等功能）
    amapMap = new amapInstance.Map('amap-container', {
      viewMode: '3D', // 是否为3D地图模式
      zoom: 14, // 初始化地图级别
      center: [location.longitude, location.latitude], // 初始化地图中心点位置 [经度, 纬度]
      // 启用缩放和交互功能
      zoomEnable: true, // 是否可以通过鼠标滚轮缩放
      dragEnable: true, // 是否可通过鼠标拖拽平移地图
      scrollWheel: true, // 是否可以通过鼠标滚轮缩放
      doubleClickZoom: true, // 是否可以通过双击鼠标放大地图
      keyboardEnable: true, // 是否可以通过键盘控制地图
      resizeEnable: true, // 是否监控地图容器尺寸变化
      rotateEnable: true, // 是否允许旋转
      pitchEnable: true, // 是否允许倾斜
    })
    
    // 监听地图加载完成事件（必须等待complete事件后再添加标记）
    amapMap.on('complete', () => {
      console.log('✅ 地图加载完成，开始加载站点')
      mapLoading.value = false
      
      // 确保缩放功能已启用（如果之前被禁用）
      if (typeof amapMap.setStatus === 'function') {
        amapMap.setStatus({
          zoomEnable: true,
          dragEnable: true,
          scrollWheel: true,
        })
      }
      
      // 在地图加载完成后，再次确保滚轮事件不冒泡到页面
      // 因为高德地图内部可能会重新绑定事件
      try {
        const mapContainer = amapMap.getContainer()
        if (mapContainer) {
          // 使用 capture 阶段捕获滚轮事件，阻止冒泡到页面
          mapContainer.addEventListener('wheel', (e) => {
            e.stopPropagation()
            // 不阻止默认行为，让高德地图处理滚轮缩放
          }, { passive: false, capture: true })
        }
      } catch (e) {
        console.warn('设置地图容器事件监听失败:', e)
      }
      
      // 延迟确保地图完全渲染
      setTimeout(() => {
        loadMapStations()
      }, 300)
    })
    
    // 监听地图错误
    amapMap.on('error', (error: any) => {
      console.error('地图初始化错误:', error)
      mapLoading.value = false
      if (error && error.message) {
        if (error.message.includes('USERKEY_PLAT_NOMATCH') || error.message.includes('10009')) {
          mapError.value = '地图Key平台类型不匹配\n请在控制台确认Key类型为"Web端（JS API）"'
        } else {
          mapError.value = `地图加载失败: ${error.message}`
        }
      } else {
        mapError.value = '地图加载失败，请检查Key配置'
      }
    })
    
  } catch (error: any) {
    console.error('创建地图失败:', error)
    mapLoading.value = false
    mapError.value = error.message || '地图初始化失败'
  }
}

// 加载地图上的站点标记（严格按照高德地图官方文档实现）
async function loadMapStations() {
  // 检查地图实例是否已初始化
  if (!amapMap || !amapInstance) {
    console.warn('⚠️ 地图实例未初始化，无法加载站点')
    mapLoading.value = false
    return
  }
  
  console.log('📍 开始加载站点数据...')
  
  try {
    // 清除已有标记（参考admin端实现）
    amapMarkers.forEach(marker => {
      try {
        amapMap.remove(marker)
      } catch (e) {
        console.warn('移除标记失败:', e)
      }
    })
    amapMarkers = []
    
    // 获取站点列表
    const location = locationStore.currentLocation || {
      latitude: 28.1963,
      longitude: 112.9822,
    }
    
    console.log('📡 请求站点数据，位置:', location)
    
    const res = await stationApi.getNearbyStations({
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 10000,
      type: currentFilter.value === 'all' ? undefined : currentFilter.value as 'fast' | 'slow',
      pageSize: 50,
    })
    
    console.log('✅ 获取到站点数据:', res.list?.length || 0, '个站点')
    
    stationList.value = res.list || []
    
    if (stationList.value.length === 0) {
      console.warn('⚠️ 没有找到附近的站点')
      mapLoading.value = false
      return
    }
    
    // 创建信息窗体（参考admin端实现）
    const infoWindow = new amapInstance.InfoWindow({
      offset: new amapInstance.Pixel(0, -30),
    })
    
    // 创建标记点（严格按照官方文档：AMap.Marker）
    stationList.value.forEach((station: Station) => {
      if (!station.latitude || !station.longitude) {
        console.warn('⚠️ 站点缺少坐标信息:', station.name)
        return
      }
      
      try {
        const hasFree = station.fastFree > 0 || station.slowFree > 0
        
        // 根据官方文档创建Marker图标
        // 使用AMap.Icon对象设置图标（更可靠，可以设置大小和偏移）
        let iconUrl = ''
        if (hasFree) {
          // 有可用桩：使用红色标记
          iconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
        } else {
          // 无可用桩：使用蓝色标记
          iconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
        }
        
        // 创建Icon对象（根据官方文档，更可靠）
        const markerIcon = new amapInstance.Icon({
          size: new amapInstance.Size(25, 34), // 图标实际尺寸
          image: iconUrl, // 图标URL
          imageSize: new amapInstance.Size(25, 34), // 图标显示尺寸
          imageOffset: new amapInstance.Pixel(0, 0), // 图标偏移
        })
        
        // 按照官方文档创建Marker
        const marker = new amapInstance.Marker({
          position: [station.longitude, station.latitude], // [经度, 纬度]
          icon: markerIcon, // 使用Icon对象
          title: station.name, // 鼠标悬停显示标题
          offset: new amapInstance.Pixel(-12, -34), // 标记偏移，使图标底部对齐坐标点
        })
        
        // 添加点击事件（参考admin端实现）
        marker.on('click', () => {
          // 设置信息窗体内容
          const content = createInfoWindowContent(station)
          infoWindow.setContent(content)
          // 打开信息窗体
          infoWindow.open(amapMap, marker.getPosition())
          // 更新选中状态（用于小程序/APP显示）
          selectedStation.value = station
        })
        
        // 将标记添加到地图（严格按照官方文档：map.add(marker)）
        amapMap.add(marker)
        amapMarkers.push(marker)
        
      } catch (markerError: any) {
        console.error('创建标记失败:', station.name, markerError)
      }
    })
    
    console.log('✅ 成功创建', amapMarkers.length, '个标记点')
    
    // 如果有站点，调整地图视野（参考admin端实现）
    if (amapMarkers.length > 0) {
      try {
        amapMap.setFitView(amapMarkers)
        console.log('✅ 地图视野已调整')
      } catch (viewError) {
        console.warn('调整地图视野失败:', viewError)
      }
    }
    
    // 更新地图中心
    if (res.list.length > 0 && !locationStore.currentLocation) {
      mapCenter.value = {
        latitude: res.list[0].latitude,
        longitude: res.list[0].longitude,
      }
    }
    
    // 确保loading状态关闭
    mapLoading.value = false
    
  } catch (error: any) {
    console.error('❌ 加载地图站点失败:', error)
    mapLoading.value = false
    uni.showToast({
      title: '加载站点失败: ' + (error.message || '未知错误'),
      icon: 'none',
      duration: 2000
    })
  }
}

// 创建信息窗体内容（参考admin端实现，简化版）
function createInfoWindowContent(station: Station): string {
  const distanceText = station.distance ? `${formatDistance(station.distance)} | ` : ''
  const hasFree = station.fastFree > 0 || station.slowFree > 0
  const statusColor = hasFree ? '#5A8F7B' : '#999999'
  const statusText = hasFree ? '有可用桩' : '暂无可用桩'
  
  return `
    <div style="padding: 16px; min-width: 280px; max-width: 350px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 12px;">
        <div style="font-size: 18px; font-weight: 600; color: #1A1A1A; margin-bottom: 6px;">
          ${station.name}
        </div>
        <div style="font-size: 13px; color: ${statusColor}; font-weight: 500; margin-bottom: 4px;">
          ${statusText}
        </div>
        <div style="font-size: 13px; color: #666;">
          ${distanceText}${station.address || station.city || ''}
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
        <div style="padding: 6px 12px; background: rgba(90, 143, 123, 0.1); border-radius: 12px; font-size: 12px; color: #5A8F7B; font-weight: 500;">
          ⚡ 快充 ${station.fastFree}/${station.fast}
        </div>
        <div style="padding: 6px 12px; background: rgba(184, 153, 111, 0.1); border-radius: 12px; font-size: 12px; color: #B8996F; font-weight: 500;">
          🔋 慢充 ${station.slowFree}/${station.slow}
        </div>
      </div>
      ${station.price ? `
        <div style="font-size: 16px; font-weight: 600; color: #1A1A1A; margin-bottom: 12px;">
          ¥${station.price.toFixed(2)}/度起
        </div>
      ` : ''}
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button onclick="window.navigateToDetail && window.navigateToDetail(${station.id})" style="flex: 1; padding: 8px; background: linear-gradient(135deg, #5A8F7B 0%, #3D6B5A 100%); border: none; border-radius: 16px; font-size: 13px; color: #FFFFFF; font-weight: 500; cursor: pointer;">
          查看详情
        </button>
      </div>
    </div>
  `
}

// 注册全局导航函数供信息窗体调用
// #ifdef H5
if (typeof window !== 'undefined') {
  ;(window as any).navigateToDetail = (stationId: number) => {
    uni.navigateTo({ url: `${PAGE_PATH.STATION_DETAIL}?id=${stationId}` })
  }
}
// #endif

// 清理地图资源
onUnmounted(() => {
  // #ifdef H5
  if (amapMap) {
    // 清除所有标记（参考admin端实现）
    amapMarkers.forEach(marker => {
      try {
        amapMap.remove(marker)
      } catch (e) {
        console.warn('移除标记失败:', e)
      }
    })
    amapMarkers = []
    
    // 销毁地图实例
    amapMap.destroy()
    amapMap = null
    amapInstance = null
  }
  // #endif
})
// #endif

onShow(() => {
  // 检查是否有从首页传来的搜索请求
  const pendingSearch = locationStore.consumePendingSearch()
  if (pendingSearch === '__FOCUS__') {
    // 聚焦搜索框
    showStationList.value = false
    selectedStation.value = null
  }

  // 刷新站点列表
  if (locationStore.currentLocation) {
    fetchNearbyStations()
  }
})

// 初始化定位
async function initLocation() {
  try {
    const location = await locationStore.getCurrentLocation()
    if (location) {
      mapCenter.value = {
        latitude: location.latitude,
        longitude: location.longitude,
      }
    }
    // 无论定位成功与否都尝试获取站点
    fetchNearbyStations()
  } catch (error) {
    console.error('定位失败', error)
    // 定位失败时使用默认位置并获取站点
    fetchNearbyStations()
  }
}

// 获取附近站点
async function fetchNearbyStations() {
  try {
    // 使用当前位置或默认位置（长沙）
    const location = locationStore.currentLocation || {
      latitude: 28.1963,
      longitude: 112.9822,
    }
    
    const res = await stationApi.getNearbyStations({
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 10000,
      type: currentFilter.value === 'all' ? undefined : currentFilter.value as 'fast' | 'slow',
      pageSize: 50,
    })
    stationList.value = res.list || []
    
    // #ifdef H5
    // H5平台刷新地图标记
    if (amapMap && typeof amapMap.add === 'function') {
      loadMapStations()
    }
    // #endif
    
    // 如果有站点且地图中心是默认位置，更新地图中心到第一个站点
    if (res.list.length > 0 && !locationStore.currentLocation) {
      mapCenter.value = {
        latitude: res.list[0].latitude,
        longitude: res.list[0].longitude,
      }
    }
  } catch (error) {
    console.error('获取站点失败', error)
    stationList.value = []
    uni.showToast({ title: '获取站点失败', icon: 'none' })
  }
}

// 搜索
async function handleSearch() {
  if (!keyword.value.trim()) {
    // 清空搜索时重新获取附近站点
    fetchNearbyStations()
    return
  }

  try {
    const { latitude, longitude } = locationStore.currentLocation || {}
    const res = await stationApi.searchStations({
      keyword: keyword.value.trim(),
      latitude,
      longitude,
      pageSize: 50,
    })
    stationList.value = res.list

    // 如果有搜索结果，地图移动到第一个结果
    if (res.list.length > 0) {
      mapCenter.value = {
        latitude: res.list[0].latitude,
        longitude: res.list[0].longitude,
      }
      uni.showToast({ title: `找到${res.list.length}个站点`, icon: 'none' })
    } else {
      uni.showToast({ title: '未找到相关站点', icon: 'none' })
    }
  } catch (error) {
    console.error('搜索站点失败', error)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  }
}

// 清除搜索
function clearSearch() {
  keyword.value = ''
  fetchNearbyStations()
}

// 切换筛选
function handleFilterChange(value: string) {
  currentFilter.value = value
  fetchNearbyStations()
  
  // #ifdef H5
  // H5平台刷新地图标记
  if (amapMap && typeof amapMap.add === 'function') {
    loadMapStations()
  }
  // #endif
}

// 重新定位
async function relocate() {
  const location = await locationStore.getCurrentLocation()
  if (location) {
    mapCenter.value = {
      latitude: location.latitude,
      longitude: location.longitude,
    }
    mapScale.value = 14
  }
}

// 点击标记点
function handleMarkerTap(e: { markerId: number }) {
  const station = stationList.value.find((s) => s.id === e.markerId)
  if (station) {
    selectedStation.value = station
    mapCenter.value = {
      latitude: station.latitude,
      longitude: station.longitude,
    }
  }
}

// 地图区域变化
function handleRegionChange(e: { type: string }) {
  if (e.type === 'end') {
    // 可以在这里根据新的中心点重新加载站点
  }
}

// 切换站点列表显示
function toggleStationList() {
  showStationList.value = !showStationList.value
  if (showStationList.value) {
    selectedStation.value = null
  }
}

// 关闭站点卡片
function closeStationCard() {
  selectedStation.value = null
}

// 导航
function handleNavigation(station: Station) {
  openNavigation(station.latitude, station.longitude, station.name, station.address)
}

// 跳转站点详情
function goToStationDetail(station: Station) {
  uni.navigateTo({ url: `${PAGE_PATH.STATION_DETAIL}?id=${station.id}` })
}
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  /* 确保页面本身不能滚动，但允许地图区域交互 */
}

/* H5平台：确保body和html也不滚动 */
// #ifdef H5
:deep(body),
:deep(html) {
  overflow: hidden !important;
  height: 100% !important;
  width: 100% !important;
}

/* 阻止页面在H5平台上的默认滚动行为 */
:deep(body) {
  /* 不设置 position: fixed，因为这可能导致其他问题 */
  /* 通过 overflow: hidden 和事件阻止来处理滚动问题 */
}
// #endif

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #FFFFFF;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}

.search-wrap {
  padding: 16rpx 24rpx;
}

.search-box {
  display: flex;
  align-items: center;
  height: 76rpx;
  background: #F5F5F5;
  border-radius: 38rpx;
  padding: 0 28rpx;

  .search-input {
    flex: 1;
    height: 100%;
    margin: 0 16rpx;
    font-size: 28rpx;
    color: #1A1A1A;
  }

  .search-icon {
    font-size: 32rpx;
  }

  .clear-icon {
    font-size: 28rpx;
    color: #999999;
    padding: 8rpx;
  }
}

.filter-tabs {
  display: flex;
  padding: 0 24rpx 16rpx;
  gap: 16rpx;
}

.filter-tab {
  padding: 12rpx 28rpx;
  font-size: 26rpx;
  color: #666666;
  background: #F5F5F5;
  border-radius: 28rpx;
  transition: all 0.2s;

  &.active {
    color: #FFFFFF;
    background: #1A1A1A;
  }
}

/* H5平台高德地图容器 */
// #ifdef H5
.map-wrapper {
  width: 100%;
  /* 高度 = 100vh - 导航栏高度（导航栏大约占100px） */
  height: calc(100vh - 100px);
  position: fixed;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
  /* 阻止滚轮事件冒泡 */
  overflow: hidden;
  /* 允许地图容器内的触摸操作 */
  touch-action: auto;
  z-index: 1;
}

.amap-container {
  width: 100%;
  height: 100%;
  /* 确保地图容器可以接收鼠标和触摸事件 */
  touch-action: pan-x pan-y pinch-zoom;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  /* 确保容器可见且可交互 */
  position: relative;
  overflow: hidden;
  /* 确保地图可以响应交互 */
  cursor: default;
  /* 阻止事件冒泡到父元素 */
  pointer-events: auto;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24rpx 48rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #666666;
  z-index: 1000;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 32rpx 48rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #C4554A;
  z-index: 1000;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  text-align: center;
  max-width: 80%;
  white-space: pre-line;
  line-height: 1.6;
}

.retry-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #5A8F7B 0%, #3D6B5A 100%);
  color: #FFFFFF;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  cursor: pointer;
}
// #endif

// #ifndef H5
.map {
  width: 100%;
  height: 100%;
}
// #endif

.location-btn {
  position: fixed;
  right: 24rpx;
  bottom: 320rpx;
  width: 96rpx;
  height: 96rpx;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
  z-index: 50;

  .btn-icon {
    font-size: 40rpx;
  }
}

/* 站点列表弹窗 */
.station-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  transform: translateY(calc(100% - 140rpx));
  transition: transform 0.3s ease;
  z-index: 200;
  box-shadow: 0 -8rpx 30rpx rgba(0, 0, 0, 0.1);

  &.show {
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 24rpx 16rpx;
}

.popup-handle {
  width: 80rpx;
  height: 8rpx;
  background: #E0E0E0;
  border-radius: 4rpx;
  margin-bottom: 16rpx;
}

.popup-title {
  font-size: 30rpx;
  color: #666666;
  font-weight: 500;
}

.popup-content {
  height: calc(60vh - 120rpx);
  padding: 0 24rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.station-item {
  display: flex;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.station-info {
  flex: 1;
  min-width: 0;
}

.station-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.station-address {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.station-meta {
  display: flex;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666666;
}

.meta-icon {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;

  &.fast {
    background: #5A8F7B;
  }

  &.slow {
    background: #B8996F;
  }
}

.station-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  margin-left: 16rpx;
}

.station-distance {
  font-size: 26rpx;
  color: #5A8F7B;
  font-weight: 500;
}

.nav-btn {
  display: flex;
  align-items: center;
  padding: 14rpx 24rpx;
  font-size: 24rpx;
  color: #1A1A1A;
  background: #F5F5F5;
  border-radius: 28rpx;
  gap: 6rpx;
  font-weight: 500;
}

/* 站点详情卡片 */
.station-card {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 180rpx;
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
  z-index: 150;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;

  .station-name {
    font-size: 36rpx;
    font-weight: 600;
    color: #1A1A1A;
    flex: 1;
    margin-bottom: 0;
  }

  .close-icon {
    font-size: 36rpx;
    color: #CCCCCC;
    padding: 8rpx;
    margin: -8rpx;
  }
}

.card-body {
  .station-address {
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 24rpx;
  }
}

.station-status {
  display: flex;
  gap: 48rpx;
}

.status-item {
  display: flex;
  align-items: baseline;
}

.status-label {
  font-size: 26rpx;
  color: #999999;
  margin-right: 12rpx;
}

.status-value {
  font-size: 40rpx;
  font-weight: 600;

  &.success {
    color: #5A8F7B;
  }
}

.status-divider {
  color: #CCCCCC;
  margin: 0 4rpx;
  font-size: 28rpx;
}

.status-total {
  font-size: 28rpx;
  color: #999999;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid #F0F0F0;
}

.price-info {
  .price-value {
    font-size: 40rpx;
    font-weight: 600;
    color: #1A1A1A;
  }

  .price-unit {
    font-size: 24rpx;
    color: #999999;
  }
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  padding: 0 36rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
  gap: 8rpx;
  font-weight: 500;

  &.outline {
    color: #1A1A1A;
    border: 2rpx solid #E0E0E0;
    background: #FFFFFF;
  }

  &.primary {
    color: #FFFFFF;
    background: #1A1A1A;
  }
}
</style>
