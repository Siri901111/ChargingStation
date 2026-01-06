<template>
  <view class="page">
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

    <view class="btn btn-primary btn-block mt-40" @click="handleBind">
      绑定手机号
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useCountdown } from '@/hooks'
import { userApi } from '@/api/user'

// Store
const userStore = useUserStore()

// Hooks
const countdown = useCountdown(60)

// 状态
const phone = ref('')
const code = ref('')

// 发送验证码
async function handleSendCode() {
  if (countdown.isCounting.value) return

  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await userApi.sendCode({ phone: phone.value, type: 'bindPhone' })
    countdown.start()
    uni.showToast({ title: '验证码已发送', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '发送失败，请重试', icon: 'none' })
  }
}

// 绑定手机号
async function handleBind() {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  if (!code.value || code.value.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }

  try {
    const userInfo = await userApi.bindPhone({ phone: phone.value, code: code.value })
    userStore.setUserInfo(userInfo)
    uni.showToast({ title: '绑定成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({ title: '绑定失败，请重试', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding: 48rpx;
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
</style>
