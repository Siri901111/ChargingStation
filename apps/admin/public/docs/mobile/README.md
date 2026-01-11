# 移动端用户应用 (user-app) 完整文档

## 📱 概述

基于 **uni-app + Vue 3 + TypeScript** 开发的充电站用户端应用，支持微信小程序、H5、APP 多平台。为用户提供便捷的充电服务，包括充电站查找、扫码充电、订单管理、钱包充值等功能。

## 🛠️ 技术栈

| 模块 | 技术 | 版本 |
|------|------|------|
| 框架 | uni-app + Vue 3 | Vue 3.4+ |
| 语言 | TypeScript | 5.0+ |
| 状态管理 | Pinia | 2.1+ |
| 样式 | SCSS | - |
| 构建工具 | Vite | 5.0+ |
| UI组件 | uni-ui（部分自定义） | - |
| 地图 | 高德地图（H5）/ 腾讯地图（小程序） | - |

## ✨ 核心功能

### 1. 用户认证 🔐

#### 1.1 手机号登录
- ✅ 手机号验证码登录
- ✅ 验证码发送（开发环境固定验证码：666666）
- ✅ 自动登录（Token持久化）
- ✅ 登录状态检查

#### 1.2 微信登录（小程序）
- ✅ 微信授权登录
- ✅ 微信用户信息获取
- ✅ 手机号绑定

**相关页面**:
- `pages-sub/auth/login.vue` - 登录页面
- `pages-sub/auth/bindPhone.vue` - 绑定手机号

**API接口**:
- `POST /api/mobile/user/sendCode` - 发送验证码
- `POST /api/mobile/user/loginByPhone` - 手机号登录
- `POST /api/mobile/user/loginByWechat` - 微信登录

---

### 2. 充电站查询 🗺️

#### 2.1 附近站点
- ✅ 基于GPS定位获取附近充电站
- ✅ 距离计算和排序
- ✅ 站点状态实时显示（可用/不可用）
- ✅ 快充/慢充数量显示
- ✅ 空闲桩数量显示

#### 2.2 站点搜索
- ✅ 关键词搜索（站点名称、地址）
- ✅ 城市筛选
- ✅ 分页加载

#### 2.3 站点详情
- ✅ 站点基本信息展示
- ✅ 站点图片轮播
- ✅ 充电桩列表（实时状态）
- ✅ 站点评分和评价
- ✅ 收藏/取消收藏功能
- ✅ 导航功能（调用地图APP）

#### 2.4 站点收藏
- ✅ 收藏站点
- ✅ 取消收藏
- ✅ 收藏列表查看
- ✅ 收藏站点快速导航

**相关页面**:
- `pages/index/index.vue` - 首页（附近站点）
- `pages/map/index.vue` - 地图页面（站点地图展示）
- `pages/station/detail.vue` - 站点详情页
- `pages/favorite/index.vue` - 收藏列表

**API接口**:
- `GET /api/mobile/station/nearby` - 获取附近站点
- `GET /api/mobile/station/search` - 搜索站点
- `GET /api/mobile/station/:id` - 站点详情
- `GET /api/mobile/station/:id/piles` - 站点充电桩列表
- `POST /api/mobile/station/favorite` - 收藏站点
- `DELETE /api/mobile/station/favorite/:id` - 取消收藏
- `GET /api/mobile/station/favorites` - 获取收藏列表

---

### 3. 扫码充电 ⚡

#### 3.1 扫码功能
- ✅ 扫描充电桩二维码
- ✅ 手动输入充电桩编号
- ✅ 二维码格式支持：`PILE_{id}`、纯数字、JSON格式
- ✅ H5平台扫码引导和输入优化

#### 3.2 充电桩信息展示
- ✅ 充电桩基本信息（名称、类型、功率、价格）
- ✅ 充电桩实时状态（空闲/充电中/故障）
- ✅ 所属站点信息
- ✅ 余额检查

#### 3.3 开始充电
- ✅ 余额验证
- ✅ 充电桩状态验证
- ✅ 重复订单检查
- ✅ 订单创建
- ✅ 跳转充电中页面

#### 3.4 充电中监控
- ✅ 实时充电数据（时长、电量、费用）
- ✅ 实时参数展示（电压、电流、功率）
- ✅ 圆形进度条动画
- ✅ WebSocket实时推送（可选）
- ✅ HTTP轮询备份机制
- ✅ 停止充电功能

#### 3.5 充电完成
- ✅ 充电结算
- ✅ 费用计算（电费、服务费、停车费）
- ✅ 自动扣款
- ✅ 订单详情展示

**相关页面**:
- `pages/scan/index.vue` - 扫码页面
- `pages/charging/index.vue` - 充电中页面

**API接口**:
- `POST /api/mobile/charging/scan` - 扫码获取充电桩信息
- `POST /api/mobile/charging/start` - 开始充电
- `POST /api/mobile/charging/stop` - 停止充电
- `GET /api/mobile/charging/status` - 获取充电状态
- `GET /api/mobile/charging/history` - 充电历史

**状态管理**:
- `store/modules/charging.ts` - 充电状态管理（订单信息、实时数据）

---

### 4. 订单管理 📋

#### 4.1 订单列表
- ✅ 订单列表展示（分页）
- ✅ 状态筛选（全部/进行中/已完成/异常）
- ✅ 下拉刷新
- ✅ 订单状态标签展示
- ✅ 订单基本信息（站点、时间、金额）

#### 4.2 订单详情
- ✅ 订单完整信息展示
- ✅ 充电数据详情（时长、电量、费用明细）
- ✅ 充电桩信息
- ✅ 站点信息
- ✅ 开发票功能（按钮，待实现）
- ✅ 评价功能（待实现）

#### 4.3 充电统计
- ✅ 累计充电次数
- ✅ 累计充电量（kWh）
- ✅ 累计消费金额
- ✅ 本月充电次数
- ✅ 本月消费金额
- ✅ 数据明细列表

**相关页面**:
- `pages/order/index.vue` - 订单列表
- `pages/order/detail.vue` - 订单详情
- `pages/statistics/index.vue` - 充电统计

**API接口**:
- `GET /api/mobile/order/list` - 订单列表
- `GET /api/mobile/order/:orderNo` - 订单详情
- `GET /api/mobile/order/statistics` - 订单统计
- `POST /api/mobile/order/pay` - 支付订单（待实现）
- `POST /api/mobile/order/:orderNo/cancel` - 取消订单
- `POST /api/mobile/order/:orderNo/refund` - 申请退款（待实现）

---

### 5. 钱包功能 💰

#### 5.1 余额查询
- ✅ 账户余额显示
- ✅ 余额变更提醒

#### 5.2 充值功能
- ✅ 充值套餐选择
- ✅ 自定义充值金额
- ✅ 支付方式选择（微信支付、支付宝、测试充值）
- ✅ 测试充值（开发环境直接到账）
- ✅ 充值记录查询

#### 5.3 消费记录
- ✅ 消费记录列表（分页）
- ✅ 记录类型分类（充电消费、服务费等）
- ✅ 记录详情展示

#### 5.4 充值记录
- ✅ 充值记录列表（分页）
- ✅ 充值金额、到账金额、赠送金额显示
- ✅ 支付方式显示

**相关页面**:
- `pages/wallet/index.vue` - 钱包首页
- `pages/wallet/recharge.vue` - 充值页面
- `pages/wallet/records.vue` - 充值/消费记录

**API接口**:
- `GET /api/mobile/wallet/balance` - 获取余额
- `GET /api/mobile/wallet/packages` - 获取充值套餐
- `POST /api/mobile/wallet/recharge` - 充值
- `GET /api/mobile/wallet/records` - 获取充值记录
- `GET /api/mobile/wallet/consume` - 获取消费记录
- `POST /api/mobile/test/recharge` - 测试充值（仅开发环境）

---

### 6. 会员卡功能 🎴

#### 6.1 会员卡信息
- ✅ 会员卡号展示
- ✅ 卡类型显示（普通卡、VIP卡、季卡）
- ✅ 开卡日期、有效期
- ✅ 账户余额显示
- ✅ 卡片状态显示

#### 6.2 消费记录
- ✅ 消费记录列表
- ✅ 记录详情（日期、金额、类型、订单号）

**相关页面**:
- `pages/member-card/index.vue` - 会员卡页面

**API接口**:
- `GET /api/mobile/member/card` - 获取会员卡详情

---

### 7. 个人中心 👤

#### 7.1 个人信息
- ✅ 用户头像展示和上传
- ✅ 昵称、手机号显示
- ✅ 个人信息编辑（昵称、头像、性别、生日）

#### 7.2 功能入口
- ✅ 我的订单
- ✅ 我的收藏
- ✅ 充电统计
- ✅ 会员卡
- ✅ 钱包
- ✅ 公告通知
- ✅ 设置

#### 7.3 数据统计
- ✅ 累计充电次数
- ✅ 累计充电量
- ✅ 累计消费金额
- ✅ 会员等级

**相关页面**:
- `pages/mine/index.vue` - 个人中心首页

**API接口**:
- `GET /api/mobile/user/info` - 获取用户信息
- `PUT /api/mobile/user/info` - 更新用户信息
- `POST /api/mobile/user/upload-avatar` - 上传头像

---

### 8. 公告通知 📢

#### 8.1 公告列表
- ✅ 公告列表展示（分页）
- ✅ 公告类型筛选（招商类、广告类、公告类等）
- ✅ 重要程度标识
- ✅ 发布渠道显示
- ✅ 发布时间显示

#### 8.2 公告详情
- ✅ 公告详情展示（富文本内容）
- ✅ 公告标题、类型、重要程度
- ✅ 发布时间、发布渠道

**相关页面**:
- `pages/announcement/index.vue` - 公告列表
- `pages/announcement/detail.vue` - 公告详情

**API接口**:
- `GET /api/mobile/announcement/list` - 获取公告列表
- `GET /api/mobile/announcement/:id` - 获取公告详情

---

### 9. 设置功能 ⚙️

#### 9.1 个人资料
- ✅ 昵称编辑
- ✅ 头像上传
- ✅ 性别选择
- ✅ 生日选择

#### 9.2 其他设置
- ✅ 关于我们
- ✅ 意见反馈
- ✅ 用户协议
- ✅ 隐私政策
- ✅ 退出登录

**相关页面**:
- `pages-sub/settings/profile.vue` - 个人资料
- `pages-sub/settings/index.vue` - 设置首页
- `pages-sub/settings/about.vue` - 关于我们
- `pages-sub/settings/feedback.vue` - 意见反馈
- `pages-sub/settings/agreement.vue` - 用户协议
- `pages-sub/settings/privacy.vue` - 隐私政策

---

## 📂 项目结构

```
apps/user-app/
├── src/
│   ├── api/                      # API 接口定义
│   │   ├── user.ts              # 用户相关
│   │   ├── station.ts           # 充电站相关
│   │   ├── charging.ts          # 充电相关
│   │   ├── order.ts             # 订单相关
│   │   ├── wallet.ts            # 钱包相关
│   │   ├── memberCard.ts        # 会员卡相关
│   │   └── announcement.ts      # 公告相关
│   │
│   ├── pages/                    # 主包页面
│   │   ├── index/               # 首页
│   │   ├── map/                 # 地图
│   │   ├── scan/                # 扫码
│   │   ├── charging/            # 充电中
│   │   ├── order/               # 订单
│   │   │   ├── index.vue       # 订单列表
│   │   │   └── detail.vue      # 订单详情
│   │   ├── mine/                # 我的
│   │   ├── station/             # 站点详情
│   │   ├── wallet/              # 钱包
│   │   │   ├── index.vue       # 钱包首页
│   │   │   ├── recharge.vue    # 充值
│   │   │   └── records.vue     # 记录
│   │   ├── favorite/            # 收藏列表
│   │   ├── statistics/          # 充电统计
│   │   ├── member-card/         # 会员卡
│   │   └── announcement/        # 公告
│   │       ├── index.vue       # 公告列表
│   │       └── detail.vue      # 公告详情
│   │
│   ├── pages-sub/                # 分包页面
│   │   ├── auth/                # 登录相关
│   │   │   ├── login.vue       # 登录页
│   │   │   └── bindPhone.vue   # 绑定手机号
│   │   └── settings/            # 设置相关
│   │       ├── index.vue       # 设置首页
│   │       ├── profile.vue     # 个人资料
│   │       ├── about.vue       # 关于我们
│   │       ├── feedback.vue    # 意见反馈
│   │       ├── agreement.vue   # 用户协议
│   │       └── privacy.vue     # 隐私政策
│   │
│   ├── components/               # 公共组件
│   │   └── PileQRCode.vue      # 充电桩二维码组件
│   │
│   ├── config/                   # 配置文件
│   │   └── index.ts             # 环境配置（API地址、WebSocket地址等）
│   │
│   ├── constants/                # 常量定义
│   │   └── index.ts             # 状态码、存储键、枚举等
│   │
│   ├── hooks/                    # 组合式函数
│   │   ├── useLoading.ts       # 加载状态
│   │   ├── usePagination.ts    # 分页
│   │   └── useCountdown.ts     # 倒计时
│   │
│   ├── store/                    # Pinia 状态管理
│   │   ├── index.ts
│   │   └── modules/
│   │       ├── user.ts          # 用户状态
│   │       ├── charging.ts      # 充电状态
│   │       └── location.ts      # 位置状态
│   │
│   ├── static/                   # 静态资源
│   │   ├── tabbar/              # TabBar 图标
│   │   │   ├── home.png
│   │   │   ├── home-active.png
│   │   │   ├── map.png
│   │   │   ├── map-active.png
│   │   │   ├── scan.png
│   │   │   ├── scan-active.png
│   │   │   ├── order.png
│   │   │   ├── order-active.png
│   │   │   ├── mine.png
│   │   │   └── mine-active.png
│   │   ├── marker/              # 地图标记图标
│   │   ├── empty/               # 空状态图
│   │   └── avatar/              # 默认头像
│   │
│   ├── styles/                   # 全局样式
│   │   ├── index.scss           # 主样式文件
│   │   ├── variables.scss       # 变量定义
│   │   ├── mixins.scss          # 混入
│   │   ├── icons.scss           # 图标样式
│   │   └── iconfont.scss        # 字体图标
│   │
│   ├── utils/                    # 工具函数
│   │   ├── http.ts              # HTTP请求封装（Axios封装）
│   │   ├── storage.ts           # 存储工具（localStorage封装）
│   │   └── index.ts             # 通用工具函数
│   │
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   ├── manifest.json             # 应用配置（uni-app配置）
│   └── pages.json                # 页面配置（路由配置）
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8（推荐）或 npm/yarn
- HBuilderX（可选，用于微信小程序开发）

### 安装依赖

```bash
# 在项目根目录执行
pnpm install

# 或单独安装移动端依赖
cd apps/user-app
pnpm install
```

### 开发模式

```bash
# H5 开发（推荐用于快速开发）
pnpm --filter @charging/user-app dev:h5

# 或
cd apps/user-app
pnpm dev:h5

# 访问 http://localhost:5173

# 微信小程序开发
pnpm --filter @charging/user-app dev:mp-weixin

# 或
cd apps/user-app
pnpm dev:mp-weixin

# 使用微信开发者工具打开 dist/dev/mp-weixin 目录
```

### 构建

```bash
# 构建 H5
pnpm --filter @charging/user-app build:h5

# 输出目录: apps/user-app/dist/build/h5

# 构建微信小程序
pnpm --filter @charging/user-app build:mp-weixin

# 输出目录: apps/user-app/dist/build/mp-weixin
```

---

## 🔧 配置说明

### API地址配置

在 `src/config/index.ts` 中配置：

```typescript
const envMap = {
  development: {
    baseUrl: 'http://localhost:3001/api/mobile',
    wsUrl: 'ws://localhost:3001',
  },
  production: {
    baseUrl: 'https://api.example.com/api/mobile',
    wsUrl: 'wss://api.example.com',
  },
}
```

### 高德地图配置（H5）

在 `src/manifest.json` 中配置：

```json
{
  "h5": {
    "sdkConfigs": {
      "maps": {
        "amap": {
          "key": "YOUR_AMAP_KEY",
          "securityJsCode": "YOUR_SECURITY_CODE"
        }
      }
    }
  }
}
```

### 微信小程序配置

在 `src/manifest.json` 中配置：

```json
{
  "mp-weixin": {
    "appid": "YOUR_WECHAT_APPID",
    "setting": {
      "urlCheck": false,  // 开发环境可设为false
      "es6": true,
      "minified": true
    }
  }
}
```

**注意事项**:
- 微信小程序需要在微信公众平台配置服务器域名
- 支付功能需要申请微信支付商户号
- 获取位置信息需要配置权限说明

---

## 🧪 测试功能

### 测试账号

| 类型 | 值 | 说明 |
|------|-----|------|
| 手机号 | `19282249442` | 测试用户账号 |
| 验证码 | `666666` | 开发环境固定验证码 |
| 初始余额 | 500元 | 自动创建时的默认余额 |

### 测试充值

开发环境下，充值页面会显示"测试充值"选项：
- 选择测试充值后，直接增加余额，无需真实支付
- 支持自定义充值金额（最低10元）
- 支持赠送金额配置

### 初始化测试数据

启动服务器后，可以调用以下接口初始化测试数据：

```bash
# 初始化所有测试数据（充电站 + 订单）
curl -X POST http://localhost:3001/api/mobile/test/init-all

# 单独初始化充电站（长沙8个 + 天津8个）
curl -X POST http://localhost:3001/api/mobile/test/init-stations

# 单独初始化测试用户订单
curl -X POST http://localhost:3001/api/mobile/test/init-orders

# 测试充值（直接增加余额）
curl -X POST http://localhost:3001/api/mobile/test/recharge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 100, "giftAmount": 10}'
```

---

## 📱 页面路由

### TabBar页面

| 路径 | 页面 | 说明 |
|------|------|------|
| `pages/index/index` | 首页 | 附近站点列表 |
| `pages/map/index` | 站点地图 | 地图展示充电站 |
| `pages/scan/index` | 扫码 | 扫码充电入口 |
| `pages/order/index` | 订单 | 订单列表 |
| `pages/mine/index` | 我的 | 个人中心 |

### 主包页面

| 路径 | 页面 | 说明 |
|------|------|------|
| `pages/station/detail` | 站点详情 | 充电站详情页 |
| `pages/charging/index` | 充电中 | 充电监控页面 |
| `pages/order/detail` | 订单详情 | 订单详情页 |
| `pages/wallet/index` | 钱包 | 钱包首页 |
| `pages/wallet/recharge` | 充值 | 充值页面 |
| `pages/wallet/records` | 记录 | 充值/消费记录 |
| `pages/favorite/index` | 收藏 | 收藏站点列表 |
| `pages/statistics/index` | 统计 | 充电统计 |
| `pages/member-card/index` | 会员卡 | 会员卡详情 |
| `pages/announcement/index` | 公告列表 | 公告列表 |
| `pages/announcement/detail` | 公告详情 | 公告详情 |

### 分包页面

#### 登录分包 (`pages-sub/auth`)

| 路径 | 页面 | 说明 |
|------|------|------|
| `pages-sub/auth/login` | 登录 | 登录页面 |
| `pages-sub/auth/bindPhone` | 绑定手机号 | 微信登录后绑定手机号 |

#### 设置分包 (`pages-sub/settings`)

| 路径 | 页面 | 说明 |
|------|------|------|
| `pages-sub/settings/index` | 设置 | 设置首页 |
| `pages-sub/settings/profile` | 个人资料 | 编辑个人信息 |
| `pages-sub/settings/about` | 关于我们 | 关于我们页面 |
| `pages-sub/settings/feedback` | 意见反馈 | 意见反馈页面 |
| `pages-sub/settings/agreement` | 用户协议 | 用户协议页面 |
| `pages-sub/settings/privacy` | 隐私政策 | 隐私政策页面 |

---

## 🔐 认证与授权

### Token管理

- Token存储在 `uni.getStorageSync('user_token')`
- 请求时自动携带：`Authorization: Bearer <token>`
- Token过期自动跳转登录页

### 权限控制

- 未登录用户：只能访问首页、地图、站点详情等公开页面
- 已登录用户：可以访问所有功能页面
- 需要登录的页面会自动检查登录状态

---

## 📦 状态管理

### User Store (`store/modules/user.ts`)

管理用户信息：
- `userInfo`: 用户基本信息
- `isLoggedIn`: 登录状态
- `token`: 用户Token
- `actions`: 登录、登出、更新用户信息等

### Charging Store (`store/modules/charging.ts`)

管理充电状态：
- `currentOrder`: 当前充电订单
- `chargingStatus`: 充电实时状态
- `isCharging`: 是否正在充电
- `actions`: 开始充电、停止充电、更新状态等

### Location Store (`store/modules/location.ts`)

管理位置信息：
- `latitude`: 纬度
- `longitude`: 经度
- `address`: 地址
- `actions`: 获取位置、更新位置等

---

## 🎨 UI/UX特性

### 设计规范

- **主色调**: `#5A8F7B`（绿色，代表新能源）
- **背景色**: `#FAF9F7`（浅灰）
- **字体**: 系统默认字体，支持自定义字体

### 交互特性

- ✅ 下拉刷新（订单列表、站点列表）
- ✅ 上拉加载更多（分页加载）
- ✅ 骨架屏加载（提升体验）
- ✅ 空状态展示（友好提示）
- ✅ 错误提示（Toast提示）
- ✅ 加载动画（Loading状态）

### 适配说明

- ✅ 支持不同屏幕尺寸适配（rpx单位）
- ✅ 支持暗黑模式（待完善）
- ✅ 支持横竖屏切换（部分页面）

---

## 🐛 常见问题

### 1. H5端扫码功能

**问题**: H5端无法直接调用摄像头扫码

**解决方案**: 
- 提供手动输入充电桩编号功能
- 优化输入体验（输入框提示、快速测试按钮）
- 引导用户使用小程序或APP扫码

### 2. 地图定位失败

**问题**: 定位失败导致无法获取附近站点

**解决方案**:
- 提供默认位置（北京）
- 允许手动选择位置
- 提供城市选择功能

### 3. WebSocket连接失败

**问题**: WebSocket连接失败导致充电数据无法实时更新

**解决方案**:
- 自动降级到HTTP轮询
- 显示连接状态提示
- 提供手动刷新按钮

### 4. 支付功能（开发环境）

**问题**: 开发环境无法进行真实支付

**解决方案**:
- 提供测试充值功能（直接到账）
- 支付相关功能仅在开发环境显示测试选项

---

## 📚 相关文档

- [移动端API文档](../api/API文档-移动端.md) - 完整的移动端API接口文档
- [快速启动指南](../guides/快速启动指南.md) - 项目快速启动指南
- [扫码充电功能实现总结](../design/扫码充电功能实现总结.md) - 扫码充电功能详细说明
- [移动端功能更新说明](../移动端功能更新说明.md) - 移动端功能更新记录

---

## 🔮 待实现功能

### 高优先级

- [ ] 充电预约功能（后端接口已规划，前端待实现）
- [ ] 订单评价功能（订单详情页有按钮，功能待实现）
- [ ] 发票管理功能（订单详情页有按钮，功能待实现）
- [ ] 消息推送功能（系统通知、订单提醒等）

### 中优先级

- [ ] 优惠券功能（UI已准备，功能待实现）
- [ ] 车辆管理功能（用户车辆信息管理）
- [ ] 充电记录详情优化（更多数据展示）
- [ ] 分享功能（分享站点、分享订单等）

### 低优先级

- [ ] 充电计划功能（定时充电）
- [ ] 充电报告生成（PDF导出）
- [ ] 离线功能支持（离线查看订单等）

---

## 📝 更新日志

### v1.0.0 (2024年)

- ✅ 完成用户认证功能（手机号登录、微信登录）
- ✅ 完成充电站查询功能（附近站点、搜索、详情）
- ✅ 完成站点收藏功能
- ✅ 完成扫码充电功能（扫码、开始、停止、监控）
- ✅ 完成订单管理功能（列表、详情、统计）
- ✅ 完成钱包功能（余额、充值、记录）
- ✅ 完成会员卡功能
- ✅ 完成个人中心功能
- ✅ 完成公告通知功能
- ✅ 完成设置功能

---

**文档版本**: v1.0.0  
**最后更新**: 2024年  
**维护者**: 项目开发团队
