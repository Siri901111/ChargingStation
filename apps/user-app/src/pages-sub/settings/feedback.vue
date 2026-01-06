<template>
  <view class="page">
    <view class="card">
      <view class="form-item">
        <text class="label">问题类型</text>
        <picker :value="typeIndex" :range="typeOptions" @change="handleTypeChange">
          <view class="picker-value">
            {{ typeOptions[typeIndex] || '请选择' }}
            <text class="iconfont icon-arrow-down"></text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">问题描述</text>
        <textarea
          v-model="content"
          class="textarea"
          placeholder="请详细描述您遇到的问题..."
          maxlength="500"
        />
        <text class="word-count">{{ content.length }}/500</text>
      </view>

      <view class="form-item">
        <text class="label">联系方式</text>
        <input
          v-model="contact"
          class="input"
          placeholder="请输入手机号或邮箱"
        />
      </view>
    </view>

    <view class="btn btn-primary btn-block" @click="handleSubmit">
      提交反馈
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 状态
const typeOptions = ['功能建议', '系统问题', '充电问题', '支付问题', '其他']
const typeIndex = ref(0)
const content = ref('')
const contact = ref('')

// 选择类型
function handleTypeChange(e: { detail: { value: number } }) {
  typeIndex.value = e.detail.value
}

// 提交反馈
function handleSubmit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入问题描述', icon: 'none' })
    return
  }

  uni.showLoading({ title: '提交中...' })

  // 模拟提交
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 24rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  height: 240rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: var(--text-placeholder);
  margin-top: 10rpx;
}

.input {
  height: 88rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.btn {
  margin-top: 40rpx;
}
</style>
