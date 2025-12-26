# 前端监控SDK (Monitor SDK)

一个功能完善的前端监控SDK，支持错误监控、性能监控、用户行为监控和网络请求监控。

## 特性

- **错误监控**: JS运行时错误、Promise未捕获错误、资源加载错误、Vue组件错误
- **性能监控**: Navigation Timing API Level 2、Web Vitals (FCP, LCP, FID, CLS, INP)、长任务监控
- **用户行为监控**: 行为栈追踪、页面访问、点击事件、路由变化、滚动深度
- **网络请求监控**: XHR/Fetch拦截、请求耗时统计、错误率监控
- **会话追踪**: 访客识别、会话管理、来源分析
- **数据上报**: 优先级队列、限流控制、失败重试、批量上报
- **插件化架构**: 灵活的插件系统，可自由扩展
- **TypeScript支持**: 完整的类型定义
- **Vue 3支持**: 专门的Vue错误处理插件

## 安装

```bash
# 使用npm
npm install monitor-sdk

# 使用yarn
yarn add monitor-sdk

# 使用pnpm
pnpm add monitor-sdk
```

## 快速开始

### 基本用法

```typescript
import { createMonitor } from 'monitor-sdk';

// 创建监控实例
const monitor = createMonitor({
  appId: 'your-app-id',           // 应用唯一标识（必填）
  reportUrl: '/api/monitor/report', // 上报地址（必填）
  userId: 'user-123',              // 用户ID（可选）
  debug: true,                     // 开启调试模式
});

// 设置用户ID（登录后）
monitor.setUserId('user-456');

// 添加全局额外数据
monitor.setExtra({
  version: '1.0.0',
  env: 'production',
});

// 手动上报自定义事件
monitor.trackEvent('button_click', {
  buttonName: 'submit',
  page: 'checkout',
});

// 立即上报所有缓存数据
monitor.flush();

// 销毁监控实例（页面卸载时）
monitor.destroy();
```

### Vue 3 集成

```typescript
import { createApp } from 'vue';
import { createMonitor, createVuePlugin } from 'monitor-sdk';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// 创建监控实例
const monitor = createMonitor({
  appId: 'charging-station-admin',
  reportUrl: 'http://localhost:3001/api/monitor/report',
  debug: import.meta.env.DEV,
});

// 添加Vue错误监控插件
const vuePlugin = createVuePlugin(app);
monitor.use(vuePlugin);

// 路由变化时更新上下文
router.afterEach((to) => {
  monitor.setExtra({
    routeName: to.name as string,
    routePath: to.path,
  });
});

app.use(router);
app.mount('#app');
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | string | (必填) | 应用唯一标识 |
| `reportUrl` | string | (必填) | 数据上报地址 |
| `userId` | string | `''` | 用户ID |
| `enableError` | boolean | `true` | 是否开启错误监控 |
| `enablePerformance` | boolean | `true` | 是否开启性能监控 |
| `enableBehavior` | boolean | `true` | 是否开启用户行为监控 |
| `enableNetwork` | boolean | `true` | 是否开启网络请求监控 |
| `sampleRate` | number | `1` | 采样率 (0-1) |
| `maxCache` | number | `20` | 最大缓存数量 |
| `reportInterval` | number | `5000` | 上报间隔(毫秒) |
| `debug` | boolean | `false` | 是否开启调试模式 |
| `extra` | object | `{}` | 额外的全局数据 |
| `maxBehaviorStack` | number | `30` | 行为栈最大长度 |
| `enableLongTask` | boolean | `true` | 是否上报长任务 |
| `longTaskThreshold` | number | `50` | 长任务阈值(毫秒) |
| `rateLimit` | object | - | 限流配置 |

### 限流配置

```typescript
const monitor = createMonitor({
  appId: 'my-app',
  reportUrl: '/api/monitor/report',
  rateLimit: {
    maxPerSecond: 20,      // 每秒最大上报数量
    bucketCapacity: 50,    // 令牌桶容量
    tokenRefillRate: 10,   // 令牌恢复速率（每秒）
  },
});
```

## API 参考

### Monitor 实例方法

| 方法 | 说明 |
|------|------|
| `setUserId(userId)` | 设置用户ID |
| `setExtra(extra)` | 设置额外的全局数据 |
| `trackEvent(eventName, eventData?)` | 手动上报自定义事件 |
| `reportBehaviorStack(trigger?)` | 手动上报行为栈 |
| `flush()` | 立即上报所有缓存数据 |
| `getDeviceInfo()` | 获取设备信息 |
| `getEnvironmentInfo()` | 获取环境信息 |
| `getSessionInfo()` | 获取会话信息 |
| `getBehaviorStack()` | 获取当前行为栈 |
| `getReferrerInfo()` | 获取来源信息 |
| `destroy()` | 销毁监控实例 |

## 插件系统

SDK 采用插件化架构，内置以下插件：

### ErrorPlugin - 错误监控

自动捕获：
- JS运行时错误 (`window.onerror`)
- Promise未捕获错误 (`unhandledrejection`)
- 资源加载错误 (script, link, img, video, audio)

### PerformancePlugin - 性能监控

自动收集 Web Vitals 核心指标：
- **FCP** (First Contentful Paint) - 首次内容绘制
- **LCP** (Largest Contentful Paint) - 最大内容绘制
- **FID** (First Input Delay) - 首次输入延迟
- **CLS** (Cumulative Layout Shift) - 累积布局偏移
- **INP** (Interaction to Next Paint) - 交互到下一次绘制
- **TTFB** (Time to First Byte) - 首字节时间

以及技术指标：
- DNS解析耗时、TCP连接耗时、SSL握手耗时
- 请求/响应耗时、DOM解析耗时
- 资源加载耗时、页面完全加载时间

### BehaviorPlugin - 行为监控

自动记录：
- 页面访问和离开（含停留时间）
- 点击事件（元素信息、位置）
- 路由变化（来源、目标、耗时）
- 滚动深度追踪
- 行为栈（最近30条用户行为）

### NetworkPlugin - 网络监控

自动拦截：
- XMLHttpRequest 请求
- Fetch 请求
- 记录请求耗时、状态码、请求/响应大小

### VuePlugin - Vue错误监控

专门捕获Vue组件错误，包含组件名称和生命周期信息。

### 自定义插件

```typescript
import type { MonitorPlugin, MonitorCore } from 'monitor-sdk';

const myPlugin: MonitorPlugin = {
  name: 'my-plugin',
  init(monitor: MonitorCore) {
    // 初始化逻辑
    console.log('My plugin initialized');
  },
  destroy() {
    // 清理逻辑
  },
};

monitor.use(myPlugin);
```

## 上报数据类型

| 类型 | 说明 | 类别 |
|------|------|------|
| `js_error` | JS运行时错误 | error |
| `promise_error` | Promise未捕获错误 | error |
| `resource_error` | 资源加载错误 | error |
| `http_error` | HTTP请求错误 | error |
| `vue_error` | Vue组件错误 | error |
| `performance` | 页面性能数据 | performance |
| `resource_timing` | 资源加载性能 | performance |
| `long_task` | 长任务 | performance |
| `page_view` | 页面访问 | behavior |
| `page_leave` | 页面离开 | behavior |
| `click` | 点击事件 | behavior |
| `route_change` | 路由变化 | behavior |
| `custom_event` | 自定义事件 | behavior |
| `http_request` | HTTP请求 | network |
| `session_start` | 会话开始 | session |
| `session_end` | 会话结束 | session |

## 后端API接口

SDK上报数据到后端的接口规范：

### 上报接口

```
POST /api/monitor/report
Content-Type: application/json

[
  { /* 上报数据1 */ },
  { /* 上报数据2 */ },
  ...
]
```

### 查询接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/monitor/list` | GET | 获取监控数据列表 |
| `/api/monitor/errors` | GET | 获取错误列表 |
| `/api/monitor/performance` | GET | 获取性能数据 |
| `/api/monitor/behaviors` | GET | 获取行为数据 |
| `/api/monitor/networks` | GET | 获取网络请求 |
| `/api/monitor/overview` | GET | 获取统计概览 |
| `/api/monitor/trend` | GET | 获取趋势数据 |
| `/api/monitor/performance-metrics` | GET | 获取性能指标统计 |
| `/api/monitor/error-stats` | GET | 获取错误统计 |
| `/api/monitor/behavior-stats` | GET | 获取行为统计 |

## 目录结构

```
monitor-sdk/
├── src/
│   ├── core/              # 核心模块
│   │   ├── monitor.ts     # 监控核心类
│   │   ├── reporter.ts    # 数据上报器（优先级队列、限流）
│   │   └── index.ts
│   ├── plugins/           # 插件模块
│   │   ├── error.ts       # 错误监控插件
│   │   ├── performance.ts # 性能监控插件（Web Vitals）
│   │   ├── behavior.ts    # 用户行为监控插件
│   │   ├── network.ts     # 网络请求监控插件
│   │   ├── vue.ts         # Vue专用插件
│   │   └── index.ts
│   ├── types/             # 类型定义
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   │   └── index.ts       # 设备检测、会话管理、限流器等
│   └── index.ts           # 入口文件
├── package.json
├── tsconfig.json
└── README.md
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 类型检查
npm run typecheck

# 运行测试
npm run test
```

## 最佳实践

### 1. 生产环境配置

```typescript
const monitor = createMonitor({
  appId: 'my-app',
  reportUrl: 'https://api.example.com/monitor/report',
  sampleRate: 0.1,        // 10% 采样率降低服务器压力
  debug: false,           // 关闭调试日志
});
```

### 2. 用户登录后设置用户ID

```typescript
async function onLoginSuccess(user) {
  monitor.setUserId(user.id);
  monitor.setExtra({
    userName: user.name,
    role: user.role,
  });
}
```

### 3. 页面卸载前确保数据上报

SDK已内置处理 `visibilitychange`、`beforeunload`、`pagehide` 事件，无需额外配置。

## License

MIT
