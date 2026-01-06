# 智能充电 - 用户端小程序

基于 uni-app + Vue 3 + TypeScript 的充电站用户端应用。

## 项目结构

```
user-app/
├── src/
│   ├── api/                 # API 接口
│   │   ├── user.ts         # 用户相关
│   │   ├── station.ts      # 充电站相关
│   │   ├── charging.ts     # 充电相关
│   │   ├── order.ts        # 订单相关
│   │   └── wallet.ts       # 钱包相关
│   │
│   ├── components/          # 公共组件
│   │
│   ├── config/              # 配置文件
│   │   └── index.ts        # 环境配置
│   │
│   ├── constants/           # 常量定义
│   │   └── index.ts        # 状态码、存储键等
│   │
│   ├── hooks/               # 组合式函数
│   │   ├── useLoading.ts   # 加载状态
│   │   ├── usePagination.ts # 分页
│   │   └── useCountdown.ts # 倒计时
│   │
│   ├── pages/               # 主包页面
│   │   ├── index/          # 首页
│   │   ├── map/            # 地图
│   │   ├── scan/           # 扫码
│   │   ├── charging/       # 充电中
│   │   ├── order/          # 订单
│   │   ├── mine/           # 我的
│   │   ├── station/        # 站点详情
│   │   └── wallet/         # 钱包
│   │
│   ├── pages-sub/           # 分包页面
│   │   ├── auth/           # 登录相关
│   │   └── settings/       # 设置相关
│   │
│   ├── static/              # 静态资源
│   │   ├── tabbar/         # TabBar 图标
│   │   ├── marker/         # 地图标记
│   │   ├── empty/          # 空状态图
│   │   └── avatar/         # 头像
│   │
│   ├── store/               # 状态管理
│   │   ├── index.ts
│   │   └── modules/
│   │       ├── user.ts     # 用户状态
│   │       ├── charging.ts # 充电状态
│   │       └── location.ts # 位置状态
│   │
│   ├── styles/              # 全局样式
│   │   └── index.scss
│   │
│   ├── utils/               # 工具函数
│   │   ├── http.ts         # 请求封装
│   │   ├── storage.ts      # 存储工具
│   │   └── index.ts        # 通用工具
│   │
│   ├── App.vue              # 根组件
│   ├── main.ts              # 入口文件
│   ├── manifest.json        # 应用配置
│   └── pages.json           # 页面配置
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 功能模块

### 已实现
- [x] 首页 - 快捷入口、附近站点
- [x] 地图 - 附近站点地图展示、筛选
- [x] 扫码充电 - 扫码识别、充电桩信息
- [x] 充电监控 - 实时充电数据、WebSocket
- [x] 订单管理 - 订单列表、详情、支付
- [x] 我的 - 个人信息、钱包、设置
- [x] 站点详情 - 站点信息、充电桩列表
- [x] 登录注册 - 手机号登录、微信登录
- [x] 钱包 - 余额、充值

### 待实现
- [ ] 充电预约
- [ ] 站点收藏
- [ ] 优惠券
- [ ] 发票管理
- [ ] 消息通知

## 开发指南

### 安装依赖

```bash
# 在项目根目录执行
pnpm install
```

### 开发模式

```bash
# H5 开发
pnpm --filter @charging/user-app dev:h5

# 微信小程序开发
pnpm --filter @charging/user-app dev:mp-weixin
```

### 构建

```bash
# 构建 H5
pnpm --filter @charging/user-app build:h5

# 构建微信小程序
pnpm --filter @charging/user-app build:mp-weixin
```

## 配置说明

### 高德地图配置

在 `src/manifest.json` 中配置高德地图 Key：

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

在 `src/manifest.json` 中配置微信小程序 AppID：

```json
{
  "mp-weixin": {
    "appid": "YOUR_WECHAT_APPID"
  }
}
```

### API 地址配置

在 `src/config/index.ts` 中配置 API 地址：

```typescript
const envMap = {
  development: {
    baseUrl: 'http://localhost:3000/api',
    wsUrl: 'ws://localhost:3000',
  },
  production: {
    baseUrl: 'https://api.example.com/api',
    wsUrl: 'wss://api.example.com',
  },
}
```

## 静态资源

请在 `src/static` 目录下添加以下资源：

### TabBar 图标 (80x80px)
- `tabbar/home.png` - 首页
- `tabbar/home-active.png` - 首页（选中）
- `tabbar/map.png` - 地图
- `tabbar/map-active.png` - 地图（选中）
- `tabbar/scan.png` - 扫码
- `tabbar/scan-active.png` - 扫码（选中）
- `tabbar/order.png` - 订单
- `tabbar/order-active.png` - 订单（选中）
- `tabbar/mine.png` - 我的
- `tabbar/mine-active.png` - 我的（选中）

### 地图标记图标
- `marker/marker-green.png` - 可用站点
- `marker/marker-gray.png` - 不可用站点

### 其他
- `logo.png` - 应用 Logo
- `empty/order.png` - 订单空状态图
- `avatar/default.png` - 默认头像

## 技术栈

- **框架**: uni-app + Vue 3
- **语言**: TypeScript
- **状态管理**: Pinia
- **样式**: SCSS
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

## 注意事项

1. 微信小程序需要在微信公众平台配置服务器域名
2. 地图功能需要申请高德地图/腾讯地图 Key
3. 支付功能需要申请微信支付商户号
4. WebSocket 需要配置 wss 域名（生产环境）
