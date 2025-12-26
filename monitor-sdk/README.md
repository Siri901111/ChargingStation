# 前端监控SDK (Monitor SDK)

一个轻量级的前端服务监控SDK，支持多项目监控，可以监控错误、性能、用户行为和网络请求。

## 特性

- **错误监控**: JS运行时错误、Promise未捕获错误、资源加载错误、Vue组件错误
- **性能监控**: 页面加载性能、Web Vitals (LCP, FID, CLS)
- **用户行为监控**: 页面访问、页面停留时间、点击事件、路由变化
- **网络请求监控**: XHR/Fetch请求监控、接口耗时、错误率统计
- **数据上报**: 批量上报、失败重试、页面关闭时可靠上报
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
  appId: 'your-app-id',           // 应用唯一标识
  reportUrl: 'https://your-server.com/api/report', // 上报地址
  userId: 'user-123',             // 用户ID（可选）
  debug: true,                    // 开启调试模式
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

const app = createApp(App);

// 创建监控实例
const monitor = createMonitor({
  appId: 'charging-station-admin',
  reportUrl: 'http://localhost:3001/api/monitor/report',
});

// 添加Vue错误监控插件
const vuePlugin = createVuePlugin(app);
monitor.use(vuePlugin);

app.mount('#app');
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| appId | string | (必填) | 应用唯一标识 |
| reportUrl | string | (必填) | 数据上报地址 |
| userId | string | '' | 用户ID |
| enableError | boolean | true | 是否开启错误监控 |
| enablePerformance | boolean | true | 是否开启性能监控 |
| enableBehavior | boolean | true | 是否开启用户行为监控 |
| enableNetwork | boolean | true | 是否开启网络请求监控 |
| sampleRate | number | 1 | 采样率 (0-1) |
| maxCache | number | 20 | 最大缓存数量 |
| reportInterval | number | 5000 | 上报间隔(毫秒) |
| debug | boolean | false | 是否开启调试模式 |
| extra | object | {} | 额外的全局数据 |

## 上报数据格式

### 通用字段

所有上报数据都包含以下通用字段：

```typescript
interface BaseReportData {
  id: string;              // 数据唯一ID
  appId: string;           // 应用ID
  userId: string;          // 用户ID
  type: ReportType;        // 上报类型
  timestamp: number;       // 时间戳
  pageUrl: string;         // 页面URL
  pageTitle: string;       // 页面标题
  userAgent: string;       // 用户代理
  screenResolution: string; // 屏幕分辨率
  language: string;        // 语言
  extra: object;           // 额外数据
}
```

### 上报类型

| 类型 | 说明 |
|------|------|
| js_error | JS运行时错误 |
| promise_error | Promise未捕获错误 |
| resource_error | 资源加载错误 |
| http_error | HTTP请求错误 |
| vue_error | Vue组件错误 |
| performance | 页面性能数据 |
| page_view | 页面访问 |
| page_leave | 页面离开 |
| click | 点击事件 |
| route_change | 路由变化 |
| custom_event | 自定义事件 |
| http_request | HTTP请求 |

## 自定义插件

你可以创建自定义插件来扩展SDK功能：

```typescript
import { MonitorPlugin, MonitorCore } from 'monitor-sdk';

class MyCustomPlugin implements MonitorPlugin {
  name = 'my-custom-plugin';

  init(monitor: MonitorCore): void {
    console.log('Custom plugin initialized');

    // 在这里添加你的监控逻辑
    window.addEventListener('custom-event', (event) => {
      monitor.report({
        type: 'custom_event',
        eventName: 'my-custom-event',
        eventData: event.detail,
      });
    });
  }

  destroy(): void {
    console.log('Custom plugin destroyed');
  }
}

// 使用自定义插件
const monitor = createMonitor({ appId: 'app', reportUrl: '/api/report' });
monitor.use(new MyCustomPlugin());
```

## 后端接口规范

上报接口应接收POST请求，请求体为JSON数组：

```
POST /api/monitor/report
Content-Type: application/json

[
  { /* 上报数据1 */ },
  { /* 上报数据2 */ },
  ...
]
```

## 目录结构

```
monitor-sdk/
├── src/
│   ├── core/           # 核心模块
│   │   ├── monitor.ts  # 监控核心类
│   │   └── reporter.ts # 数据上报器
│   ├── plugins/        # 插件模块
│   │   ├── error.ts    # 错误监控插件
│   │   ├── performance.ts # 性能监控插件
│   │   ├── behavior.ts # 用户行为监控插件
│   │   ├── network.ts  # 网络请求监控插件
│   │   └── vue.ts      # Vue专用插件
│   ├── types/          # 类型定义
│   │   └── index.ts
│   ├── utils/          # 工具函数
│   │   └── index.ts
│   └── index.ts        # 入口文件
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
```

## License

MIT
