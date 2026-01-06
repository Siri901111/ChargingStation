<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

onLaunch(() => {
  console.log('App Launch')
  // 检查登录状态
  const userStore = useUserStore()
  userStore.checkLoginStatus()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import '@/styles/index.scss';
</style>
