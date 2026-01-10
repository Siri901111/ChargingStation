<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { initMonitor, setMonitorUserId, getMonitor } from '@/monitor'
import config from '@/config'

onLaunch(() => {
  console.log('App Launch')
  
  // 初始化监控SDK
  initMonitor({
    appId: 'charging-station-user-app',
    debug: config.debug,
  })
  
  // 检查登录状态（会从存储中恢复用户信息）
  const userStore = useUserStore()
  userStore.checkLoginStatus()
  
  // 等待用户信息恢复后，设置用户ID到监控SDK
  // 使用 setTimeout 确保 userStore.checkLoginStatus() 执行完成
  setTimeout(() => {
    if (userStore.userInfo?.id) {
      setMonitorUserId(String(userStore.userInfo.id))
      
      // 设置用户额外信息（包含用户名称，用于监控展示）
      const monitor = getMonitor()
      if (monitor && userStore.userInfo) {
        monitor.setExtra({
          userId: String(userStore.userInfo.id),
          userName: userStore.userInfo.name || userStore.userInfo.phone || `用户${userStore.userInfo.id}`,
          name: userStore.userInfo.name,
          phone: userStore.userInfo.phone,
        })
      }
    }
  }, 0)
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
  // 页面隐藏时不销毁监控，保持监控实例活跃
  // 只有在应用退出时才销毁
})
</script>

<style lang="scss">
@use '@/styles/index.scss' as *;
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
*{
    font-family: 'Noto Serif SC', serif;
}
</style>
