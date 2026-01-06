<template>
  <view class="page">
    <view class="about-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">智能充电</text>
      <text class="version">版本 1.0.0</text>
    </view>

    <view class="about-content card">
      <view class="content-title">关于我们</view>
      <view class="content-text">
        智能充电是一款专注于新能源汽车充电服务的应用平台。我们致力于为用户提供便捷、高效、安全的充电体验。
      </view>
      <view class="content-text">
        通过智能化的站点推荐、实时充电监控、便捷支付等功能，让您的充电之旅更加轻松愉快。
      </view>
    </view>

    <view class="contact-card card">
      <view class="contact-title">联系我们</view>
      <view class="contact-item">
        <text class="iconfont icon-phone"></text>
        <text class="contact-text">客服热线：400-888-8888</text>
      </view>
      <view class="contact-item">
        <text class="iconfont icon-email"></text>
        <text class="contact-text">邮箱：support@charging.com</text>
      </view>
      <view class="contact-item">
        <text class="iconfont icon-location"></text>
        <text class="contact-text">地址：北京市朝阳区xxx大厦</text>
      </view>
    </view>

    <view class="copyright">
      <text>© 2024 智能充电 版权所有</text>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 24rpx;
}

.about-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 12rpx;
}

.version {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.about-content {
  margin-bottom: 24rpx;
}

.content-title,
.contact-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.contact-card {
  margin-bottom: 24rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;

  .iconfont {
    font-size: 36rpx;
    color: var(--primary-color);
    margin-right: 16rpx;
  }

  .contact-text {
    font-size: 28rpx;
    color: var(--text-secondary);
  }
}

.copyright {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: var(--text-placeholder);
}
</style>
