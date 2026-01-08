<template>
  <view class="page">
    <view class="content">
      <view class="title">用户协议</view>
      <view class="update-time">更新日期：2024年1月1日</view>

      <view class="section">
        <view class="section-title">一、服务条款的确认和接纳</view>
        <view class="section-content">
          <text>欢迎使用智充充电服务！在使用本服务之前，请您仔细阅读本协议的全部内容。如果您不同意本协议的任意内容，请不要使用本服务。如果您使用本服务，则表示您接受本协议的全部内容。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">二、服务内容</view>
        <view class="section-content">
          <text>智充平台为用户提供电动汽车充电服务，包括但不限于：</text>
          <view class="list">
            <text class="list-item">1. 充电站点查询与导航</text>
            <text class="list-item">2. 扫码充电服务</text>
            <text class="list-item">3. 充电费用支付</text>
            <text class="list-item">4. 充电记录查询</text>
            <text class="list-item">5. 账户余额管理</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">三、用户注册与账户安全</view>
        <view class="section-content">
          <text>1. 用户应提供真实、准确、完整的个人信息进行注册。</text>
          <text>2. 用户应妥善保管账户信息，对账户下的所有行为负责。</text>
          <text>3. 如发现账户被盗用，请立即联系客服处理。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">四、用户行为规范</view>
        <view class="section-content">
          <text>用户在使用本服务时，应遵守以下规范：</text>
          <view class="list">
            <text class="list-item">1. 遵守国家法律法规</text>
            <text class="list-item">2. 不得利用本服务从事非法活动</text>
            <text class="list-item">3. 不得干扰本服务的正常运行</text>
            <text class="list-item">4. 爱护充电设备，正确使用</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">五、费用说明</view>
        <view class="section-content">
          <text>1. 充电费用根据实际充电量和当地电价计算。</text>
          <text>2. 可能包含服务费、停车费等附加费用。</text>
          <text>3. 具体费用以充电时页面显示为准。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">六、免责声明</view>
        <view class="section-content">
          <text>1. 因不可抗力导致的服务中断，本平台不承担责任。</text>
          <text>2. 因用户自身原因造成的损失，本平台不承担责任。</text>
          <text>3. 第三方链接内容由相应第三方负责。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">七、协议修改</view>
        <view class="section-content">
          <text>本平台有权根据需要修改本协议，修改后的协议将在平台公布。如您继续使用本服务，即视为接受修改后的协议。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">八、联系方式</view>
        <view class="section-content">
          <text>如有任何问题，请联系我们：</text>
          <text>客服电话：400-888-8888</text>
          <text>邮箱：service@charging.com</text>
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
