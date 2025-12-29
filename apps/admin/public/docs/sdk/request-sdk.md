# HTTP Request SDK 文档

## 概述

这是一个企业级的 HTTP 请求库，基于 Axios 封装，提供了完整的请求管理能力。参考了阿里、字节等大厂的最佳实践。

## 目录结构

```
src/request/
├── core/                    # 核心模块
│   ├── types.ts             # 类型定义
│   ├── constants.ts         # 常量定义
│   ├── utils.ts             # 工具函数
│   └── index.ts             # 模块导出
├── managers/                # 管理器模块
│   ├── idempotency.ts       # 幂等性管理器
│   ├── dedupe.ts            # 去重/防抖/节流管理器
│   ├── token.ts             # Token 管理器
│   ├── queue.ts             # 请求队列管理器
│   ├── offline.ts           # 离线队列管理器
│   ├── sign.ts              # 签名管理器
│   ├── cache.ts             # 缓存管理器
│   ├── cancel.ts            # 取消管理器
│   ├── retry.ts             # 重试管理器
│   └── index.ts             # 模块导出
├── interceptors/            # 拦截器模块
│   └── index.ts             # 请求/响应拦截器
├── sdk/                     # SDK 核心
│   ├── client.ts            # HTTP 客户端
│   ├── define.ts            # API 定义工具
│   └── index.ts             # 模块导出
├── api/                     # API 定义（示例）
│   ├── user.ts              # 用户 API
│   └── index.ts             # 模块导出
└── index.ts                 # 统一入口
```

## 功能特性

### 1. 请求幂等性控制

幂等性保证同一个请求执行多次与执行一次效果相同，防止重复提交。

```typescript
import { http, apiConfig } from '@/request'

// 方式一：自动生成幂等键
const result = await http.post('/api/order', orderData, {
  // POST 请求默认会生成幂等键
})

// 方式二：自定义幂等键
const result = await http.post('/api/order', orderData, {
  idempotencyKey: `order_${userId}_${Date.now()}`
})

// 方式三：使用配置工厂
const result = await http.post('/api/order', orderData,
  apiConfig.idempotent(`order_${orderId}`)
)
```

**工作原理：**
- 对于 POST、PATCH 等非幂等方法，SDK 会自动生成幂等键
- 相同幂等键的请求会返回缓存的结果，不会重复发送
- 幂等键默认有效期 24 小时

### 2. 请求去重/防抖/节流

#### 请求去重

相同的请求在进行中时，后续请求会复用同一个 Promise。

```typescript
// 配置 allowDuplicate: false 开启去重（默认开启）
const result = await http.get('/api/users', null, {
  allowDuplicate: false
})
```

#### 防抖请求

适用于搜索输入等场景，在指定时间内只发送最后一次请求。

```typescript
// 300ms 内的重复请求会被合并
const result = await http.get('/api/search', { keyword }, {
  debounceTime: 300
})

// 或使用配置工厂
const result = await http.get('/api/search', { keyword },
  apiConfig.debounced(300)
)
```

#### 节流请求

适用于滚动加载等场景，在指定时间间隔内只发送一次请求。

```typescript
// 1秒内只发送一次请求
const result = await http.get('/api/list', { page }, {
  throttleTime: 1000
})

// 或使用配置工厂
const result = await http.get('/api/list', { page },
  apiConfig.throttled(1000)
)
```

### 3. Token 自动刷新

SDK 支持 Token 自动刷新，在 Token 即将过期时自动刷新。

```typescript
import { http } from '@/request'

// 初始化时设置 Token 刷新函数
http.setTokenRefreshFn(async (refreshToken) => {
  const response = await fetch('/api/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })
  const data = await response.json()
  return {
    accessToken: data.token,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + data.expiresIn * 1000
  }
})

// 设置登出处理函数
http.setLogoutFn(() => {
  window.location.href = '/login'
})

// 登录后设置 Token
http.setToken({
  accessToken: 'xxx',
  refreshToken: 'xxx',
  expiresAt: Date.now() + 3600 * 1000
})
```

**工作原理：**
- Token 在过期前 5 分钟（可配置）自动刷新
- 刷新期间的请求会等待刷新完成后继续
- 刷新失败会触发登出处理

### 4. 请求队列和并发控制

控制同时进行的请求数量，防止服务器过载。

```typescript
import { http } from '@/request'

// 更新最大并发数
http.updateConfig({
  maxConcurrent: 6  // 默认 6
})

// 高优先级请求
const result = await http.get('/api/important', null, {
  priority: 'critical'  // 'critical' | 'high' | 'normal' | 'low'
})

// 或使用配置工厂
const result = await http.get('/api/important', null,
  apiConfig.critical()
)
```

**优先级说明：**
- `critical`: 100 权重，立即执行
- `high`: 75 权重
- `normal`: 50 权重（默认）
- `low`: 25 权重

### 5. 离线请求队列

在离线时缓存请求，恢复网络后自动重发。

```typescript
// 开启离线队列
const result = await http.post('/api/sync', data, {
  offlineQueue: true
})

// 或使用配置工厂
const result = await http.post('/api/sync', data,
  apiConfig.offlineEnabled()
)

// 手动触发离线队列处理
await http.processOfflineQueue()
```

**工作原理：**
- 离线时请求被存储到 localStorage
- 网络恢复时自动按顺序重发
- 支持最大重试次数配置

### 6. 请求签名

用于接口安全，防止请求被篡改和重放攻击。

```typescript
import { http } from '@/request'

// 设置签名密钥
http.setSignSecret('your-secret-key')

// 更新配置开启签名
http.updateConfig({
  enableSign: true
})

// 单个请求启用签名
const result = await http.post('/api/secure', data, {
  sign: true
})
```

**签名算法：**
1. 将请求参数按字母排序
2. 拼接 method、path、timestamp、nonce
3. 使用 HMAC-SHA256 计算签名
4. 签名信息添加到请求头

### 7. 请求缓存

缓存 GET 请求的响应，减少重复请求。

```typescript
// 启用缓存
const result = await http.get('/api/config', null, {
  cache: true,
  cacheTime: 5 * 60 * 1000  // 5分钟
})

// 或使用配置工厂
const result = await http.get('/api/config', null,
  apiConfig.cached(5 * 60 * 1000)
)

// 清除缓存
http.clearCache()

// 按模式清除缓存
http.clearCacheByPattern(/\/api\/user/)
```

**缓存策略：**
- `cache-first`: 优先使用缓存
- `network-first`: 优先使用网络（默认）
- `cache-only`: 仅使用缓存
- `network-only`: 仅使用网络
- `stale-while-revalidate`: 返回缓存同时更新

### 8. 请求重试

请求失败时自动重试。

```typescript
// 配置重试
const result = await http.get('/api/unstable', null, {
  retryCount: 3,
  retryDelay: 1000
})

// 或使用配置工厂
const result = await http.get('/api/unstable', null,
  apiConfig.withRetry(3, 1000)
)
```

**重试策略：**
- 使用指数退避算法
- 添加抖动避免请求风暴
- 默认只重试幂等请求

### 9. 请求取消

取消正在进行的请求。

```typescript
// 发送请求时指定 requestId
const requestId = 'my-request'
http.get('/api/data', null, { requestId })

// 取消单个请求
http.cancelRequest(requestId)

// 批量取消
http.cancelRequests(['req1', 'req2'])

// 按模式取消
http.cancelByPattern(/\/api\/search/)

// 取消所有请求
http.cancelAllRequests()
```

### 10. 性能监控

监控请求性能和状态。

```typescript
import { http } from '@/request'

// 添加监控回调
http.onMonitor((metrics) => {
  console.log('Request metrics:', {
    url: metrics.url,
    method: metrics.method,
    duration: metrics.duration,
    success: metrics.success,
    status: metrics.status
  })

  // 上报到监控平台
  reportToMonitor(metrics)
})

// 获取统计信息
const stats = http.getStats()
console.log('SDK Stats:', stats)
```

## API 定义最佳实践

### 使用 createXxxApi 定义 API

```typescript
import {
  createGetApi,
  createPostApi,
  createPaginatedApi,
  defineApi
} from '@/request'

// 定义接口参数和响应类型
interface User {
  id: string
  name: string
  email: string
}

interface CreateUserParams {
  name: string
  email: string
}

// 创建 API
const getUser = createGetApi<{ id: string }, User>('/api/user/:id')
const createUser = createPostApi<CreateUserParams, User>('/api/user')
const getUserList = createPaginatedApi<{ keyword?: string }, User>('/api/users')

// 模块化导出
export const userApi = defineApi({
  get: getUser,
  create: createUser,
  list: getUserList
})
```

### 使用 createResourceApi 快速创建 RESTful API

```typescript
import { createResourceApi } from '@/request'

interface Product {
  id: string
  name: string
  price: number
}

export const productApi = createResourceApi<Product>('/api/products')

// 自动包含以下方法：
// productApi.list(params)    - GET /api/products/list
// productApi.get({ id })     - GET /api/products/:id
// productApi.create(data)    - POST /api/products
// productApi.update(data)    - PUT /api/products/:id
// productApi.delete({ id })  - DELETE /api/products/:id
// productApi.batchDelete({ ids }) - POST /api/products/batch-delete
```

### 使用配置工厂

```typescript
import { http, apiConfig } from '@/request'

// 组合多个配置
const result = await http.post('/api/order', data,
  apiConfig.combine(
    apiConfig.idempotent(`order_${orderId}`),
    apiConfig.withLoading('提交订单中...'),
    apiConfig.withSuccessMessage('订单提交成功'),
    apiConfig.withRetry(3)
  )
)
```

## 请求配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| requestId | string | 自动生成 | 请求唯一标识 |
| idempotencyKey | string | - | 幂等键 |
| showLoading | boolean | false | 是否显示 Loading |
| loadingText | string | '加载中...' | Loading 提示文字 |
| showError | boolean | true | 是否显示错误提示 |
| errorMessage | string | - | 自定义错误提示 |
| showSuccess | boolean | false | 是否显示成功提示 |
| successMessage | string | - | 自定义成功提示 |
| retryCount | number | 0 | 重试次数 |
| retryDelay | number | 1000 | 重试延迟（毫秒） |
| skipAuth | boolean | false | 是否跳过 Token |
| cache | boolean | false | 是否启用缓存 |
| cacheTime | number | 300000 | 缓存时间（毫秒） |
| cacheStrategy | string | 'network-first' | 缓存策略 |
| allowDuplicate | boolean | true | 是否允许重复请求 |
| timeout | number | 15000 | 请求超时（毫秒） |
| silent | boolean | false | 静默模式 |
| priority | string | 'normal' | 请求优先级 |
| debounceTime | number | - | 防抖时间（毫秒） |
| throttleTime | number | - | 节流时间（毫秒） |
| offlineQueue | boolean | false | 是否加入离线队列 |
| sign | boolean | false | 是否签名 |

## 业务状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 未找到 |
| 10001 | Token 过期 |
| 10002 | Token 无效 |
| 10003 | 权限不足 |
| 10004 | 幂等性冲突 |
| 10005 | 请求限流 |
| 10006 | 签名无效 |

## 最佳实践

### 1. 使用类型安全的 API 定义

```typescript
// 好的做法
const loginApi = createPostApi<LoginParams, LoginResult>('/api/login')
const result = await loginApi({ username, password })
// result.data 有完整的类型提示

// 避免
const result = await http.post('/api/login', { username, password })
// result.data 类型为 any
```

### 2. 合理使用幂等性

```typescript
// 创建订单等关键操作，必须使用幂等性
const result = await http.post('/api/order', orderData, {
  idempotencyKey: `order_${userId}_${orderId}`
})

// 查询类操作不需要幂等性
const result = await http.get('/api/orders')
```

### 3. 使用请求钩子统一处理

```typescript
http.setHooks({
  beforeRequest: (config) => {
    // 添加公共参数
    config.headers['X-App-Version'] = '1.0.0'
    return config
  },
  afterResponse: (response) => {
    // 统一处理响应
    return response
  },
  onError: (error) => {
    // 统一错误上报
    reportError(error)
  }
})
```

### 4. 合理使用缓存

```typescript
// 不经常变化的配置数据，使用较长的缓存时间
const config = await http.get('/api/app-config', null, {
  cache: true,
  cacheTime: 60 * 60 * 1000  // 1小时
})

// 频繁变化的数据，使用 stale-while-revalidate
const data = await http.get('/api/dashboard', null, {
  cache: true,
  cacheStrategy: 'stale-while-revalidate'
})
```

### 5. 错误处理

```typescript
try {
  const result = await http.post('/api/order', orderData)
  // 处理成功
} catch (error) {
  if (error.code === 'IDEMPOTENCY_CONFLICT') {
    // 处理重复提交
  } else if (error.code === 'OFFLINE') {
    // 处理离线
  } else if (error.code === 'TOKEN_EXPIRED') {
    // Token 过期，SDK 会自动处理
  } else {
    // 其他错误
  }
}
```

## 迁移指南

从旧版 request 迁移到新 SDK：

```typescript
// 旧版
import { post } from '@/utils/http'
const result = await post('/api/login', data)

// 新版
import { http } from '@/request'
const result = await http.post('/api/login', data)

// 或使用类型安全的 API
import { userApi } from '@/request/api'
const result = await userApi.login(data)
```
