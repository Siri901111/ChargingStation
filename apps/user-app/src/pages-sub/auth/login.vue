<template>
  <view class="page">
    <view class="login-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="close-btn" @click="handleClose">
        <text class="iconfont icon-close"></text>
      </view>
      <view class="header-content">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">智能充电</text>
        <text class="slogan">让充电更简单</text>
      </view>
    </view>

    <view class="login-body">
      <!-- 手机号登录 -->
      <view class="form-item">
        <view class="input-wrap">
          <text class="prefix">+86</text>
          <input
            v-model="phone"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            class="input"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="input-wrap">
          <input
            v-model="code"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
            class="input"
          />
          <view
            :class="['code-btn', { disabled: countdown.isCounting.value }]"
            @click="handleSendCode"
          >
            {{ countdown.isCounting.value ? `${countdown.count.value}s` : '获取验证码' }}
          </view>
        </view>
      </view>

      <view class="btn btn-primary btn-block mt-40" @click="handleLogin">
        登录
      </view>

      <!-- 微信登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="divider-wrap">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>

      <view class="third-login">
        <button class="wechat-btn" open-type="getPhoneNumber" @getphonenumber="handleWechatLogin">
          <text class="iconfont icon-wechat"></text>
          <text>微信一键登录</text>
        </button>
      </view>
      <!-- #endif -->

      <!-- 协议 -->
      <view class="agreement">
        <view class="checkbox" :class="{ checked: agreed }" @click="agreed = !agreed">
          <text class="iconfont icon-check" v-if="agreed"></text>
        </view>
        <text class="agreement-text">
          登录即表示同意
          <text class="link" @click.stop="openAgreement('user')">《用户协议》</text>
          和
          <text class="link" @click.stop="openAgreement('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useCountdown } from '@/hooks'
import { userApi } from '@/api/user'

// Store
const userStore = useUserStore()

// Hooks
const countdown = useCountdown(60)

// 状态
const statusBarHeight = ref(0)
const phone = ref('')
const code = ref('')
const agreed = ref(false)

// 初始化
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})

// 关闭页面
function handleClose() {
  uni.navigateBack()
}

// 发送验证码
async function handleSendCode() {
  if (countdown.isCounting.value) return

  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await userApi.sendCode({ phone: phone.value, type: 'login' })
    countdown.start()
    uni.showToast({ title: '验证码已发送', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '发送失败，请重试', icon: 'none' })
  }
}

// 手机号登录
async function handleLogin() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  if (!code.value || code.value.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }

  try {
    await userStore.loginByPhone(phone.value, code.value)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  }
}

// 微信登录
async function handleWechatLogin(e: { detail: { code?: string; errMsg: string } }) {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    return
  }

  try {
    await userStore.loginByWechat()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  }
}

// 打开协议
function openAgreement(type: 'user' | 'privacy') {
  const url = type === 'user' ? '/pages-sub/settings/agreement' : '/pages-sub/settings/privacy'
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #FFFFFF;
}

.login-header {
  position: relative;
  background: linear-gradient(180deg, rgba(76, 175, 80, 0.1) 0%, #FFFFFF 100%);
  padding-bottom: 60rpx;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  left: 24rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 40rpx;
    color: var(--text-secondary);
  }
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 16rpx;
}

.slogan {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.login-body {
  padding: 60rpx 48rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.input-wrap {
  display: flex;
  align-items: center;
  height: 100rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.prefix {
  font-size: 30rpx;
  color: var(--text-primary);
  margin-right: 16rpx;
  padding-right: 16rpx;
  border-right: 1rpx solid var(--border-color);
}

.input {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
}

.code-btn {
  font-size: 28rpx;
  color: var(--primary-color);
  white-space: nowrap;

  &.disabled {
    color: var(--text-placeholder);
  }
}

.divider-wrap {
  display: flex;
  align-items: center;
  margin: 60rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background-color: var(--border-color);
}

.divider-text {
  padding: 0 24rpx;
  font-size: 26rpx;
  color: var(--text-placeholder);
}

.third-login {
  display: flex;
  justify-content: center;
}

.wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  background-color: #07C160;
  border-radius: 44rpx;
  color: #FFFFFF;
  font-size: 30rpx;

  .iconfont {
    font-size: 40rpx;
    margin-right: 16rpx;
  }

  &::after {
    border: none;
  }
}

.agreement {
  display: flex;
  align-items: flex-start;
  margin-top: 40rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid var(--border-color);
  border-radius: 50%;
  margin-right: 12rpx;
  margin-top: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }

  .iconfont {
    font-size: 24rpx;
    color: #FFFFFF;
  }
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.6;
}

.link {
  color: var(--primary-color);
}
</style>
