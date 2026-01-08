<template>
  <view class="page">
    <view class="content">
      <view class="title">隐私政策</view>
      <view class="update-time">更新日期：2024年1月1日</view>

      <view class="section">
        <view class="section-title">引言</view>
        <view class="section-content">
          <text>智充（以下简称"我们"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用我们的服务前，仔细阅读并了解本政策。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">一、我们收集的信息</view>
        <view class="section-content">
          <text>为了向您提供服务，我们可能会收集以下信息：</text>
          <view class="list">
            <text class="list-item">1. 账户信息：手机号码、用户名、密码</text>
            <text class="list-item">2. 身份信息：姓名、身份证号（用于实名认证）</text>
            <text class="list-item">3. 位置信息：用于查找附近充电站</text>
            <text class="list-item">4. 车辆信息：车牌号、车型（可选）</text>
            <text class="list-item">5. 交易信息：充电记录、支付记录</text>
            <text class="list-item">6. 设备信息：设备型号、操作系统版本</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">二、信息使用目的</view>
        <view class="section-content">
          <text>我们收集的信息将用于：</text>
          <view class="list">
            <text class="list-item">1. 提供充电服务和账户管理</text>
            <text class="list-item">2. 处理支付和退款</text>
            <text class="list-item">3. 发送服务通知和营销信息</text>
            <text class="list-item">4. 改善和优化服务体验</text>
            <text class="list-item">5. 保障服务安全和防范风险</text>
            <text class="list-item">6. 遵守法律法规要求</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">三、信息存储与保护</view>
        <view class="section-content">
          <text>1. 我们采用行业标准的安全技术保护您的个人信息。</text>
          <text>2. 个人信息存储在中国境内的安全服务器上。</text>
          <text>3. 我们会在法律要求的期限内保留您的信息。</text>
          <text>4. 当您注销账户后，我们将删除或匿名化处理您的个人信息。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">四、信息共享</view>
        <view class="section-content">
          <text>我们不会向第三方出售您的个人信息。以下情况除外：</text>
          <view class="list">
            <text class="list-item">1. 获得您的明确同意</text>
            <text class="list-item">2. 法律法规要求</text>
            <text class="list-item">3. 与关联公司共享（受本政策约束）</text>
            <text class="list-item">4. 与授权合作伙伴共享（如支付机构）</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">五、您的权利</view>
        <view class="section-content">
          <text>您对您的个人信息享有以下权利：</text>
          <view class="list">
            <text class="list-item">1. 访问和查看个人信息</text>
            <text class="list-item">2. 更正不准确的信息</text>
            <text class="list-item">3. 删除个人信息（部分情况）</text>
            <text class="list-item">4. 撤回授权同意</text>
            <text class="list-item">5. 注销账户</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">六、未成年人保护</view>
        <view class="section-content">
          <text>我们的服务主要面向成年人。如果您是未成年人，请在监护人指导下使用我们的服务，并由监护人阅读本政策。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">七、政策更新</view>
        <view class="section-content">
          <text>我们可能会不时更新本隐私政策。重大变更将通过应用内通知或其他方式告知您。继续使用我们的服务即表示您同意更新后的政策。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">八、联系我们</view>
        <view class="section-content">
          <text>如有任何隐私相关问题，请联系我们：</text>
          <text>客服电话：400-888-8888</text>
          <text>邮箱：privacy@charging.com</text>
          <text>地址：北京市朝阳区科技园区xxx号</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-page);
}

.content {
  padding: var(--space-5);
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  text-align: center;
  margin-bottom: var(--space-2);
}

.update-time {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--space-6);
}

.section {
  margin-bottom: var(--space-5);
}

.section-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.section-content {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.8;

  text {
    display: block;
    margin-bottom: var(--space-2);
  }
}

.list {
  padding-left: var(--space-3);
}

.list-item {
  display: block;
  margin-bottom: var(--space-1);
}
</style>
