# 前端监控接口文档

## 接口总览

前端监控模块提供 **16个核心接口**，分为四类：

### 数据上报接口

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/monitor/report` | POST | SDK数据上报 | ❌ |

### 数据查询接口

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 2 | `/api/monitor/list` | GET | 获取监控数据列表 | ✅ |
| 3 | `/api/monitor/errors` | GET | 获取错误列表 | ✅ |
| 4 | `/api/monitor/performance` | GET | 获取性能数据列表 | ✅ |
| 5 | `/api/monitor/behaviors` | GET | 获取行为数据列表 | ✅ |
| 6 | `/api/monitor/networks` | GET | 获取网络请求列表 | ✅ |

### 统计分析接口

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 7 | `/api/monitor/overview` | GET | 获取统计概览 | ✅ |
| 8 | `/api/monitor/trend` | GET | 获取趋势数据 | ✅ |
| 9 | `/api/monitor/performance-metrics` | GET | 获取性能指标统计 | ✅ |
| 10 | `/api/monitor/error-stats` | GET | 获取错误统计 | ✅ |
| 11 | `/api/monitor/behavior-stats` | GET | 获取用户行为统计 | ✅ |
| 12 | `/api/monitor/user-tracking` | GET | 用户行为追踪 | ✅ |
| 13 | `/api/monitor/active-users` | GET | 获取活跃用户列表 | ✅ |
| 14 | `/api/monitor/error-context` | GET | 获取错误行为上下文 | ✅ |

### 数据管理接口

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 15 | `/api/monitor/delete` | DELETE | 删除监控数据 | ✅ |
| 16 | `/api/monitor/clean` | POST | 清理过期数据 | ✅ |

---

## 通用说明

### 数据类别（category）

| 类别 | 说明 | 包含类型 |
|------|------|----------|
| error | 错误数据 | js_error, promise_error, resource_error, http_error, vue_error, console_error |
| performance | 性能数据 | performance, resource_timing, long_task, first_paint, first_contentful_paint, largest_contentful_paint, first_input_delay, cumulative_layout_shift, time_to_first_byte |
| behavior | 行为数据 | page_view, page_leave, click, route_change, custom_event, behavior_stack |
| network | 网络数据 | http_request |

### 响应格式

```typescript
{
  code: number;       // 状态码：200成功，400参数错误，500服务器错误
  message?: string;   // 提示信息
  data: any;          // 响应数据
}
```

---

## 1. SDK数据上报

### 接口信息

- **URL**: `/api/monitor/report`
- **Method**: `POST`
- **需要认证**: 否
- **说明**: 接收前端 SDK 上报的监控数据，支持单条和批量上报

### 请求参数（Body）

支持单个对象或对象数组：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 否 | 上报ID，不提供则自动生成 |
| appId | string | 是 | 应用标识 |
| userId | string | 否 | 用户ID |
| type | string | 是 | 数据类型 |
| timestamp | number | 否 | 时间戳，不提供则使用服务器时间 |
| pageUrl | string | 否 | 页面URL |
| pageTitle | string | 否 | 页面标题 |
| deviceInfo | object | 否 | 设备信息 |
| environmentInfo | object | 否 | 环境信息 |
| sessionInfo | object | 否 | 会话信息 |
| extra | object | 否 | 额外数据 |

### 请求示例

```json
POST /api/monitor/report
Content-Type: application/json

[
  {
    "appId": "charging-station-admin",
    "userId": "1",
    "type": "page_view",
    "timestamp": 1703664000000,
    "pageUrl": "/dashboard",
    "pageTitle": "数据看板"
  },
  {
    "appId": "charging-station-admin",
    "userId": "1",
    "type": "js_error",
    "timestamp": 1703664001000,
    "message": "Uncaught TypeError",
    "stack": "TypeError: Cannot read property..."
  }
]
```

### 响应示例

```json
{
  "code": 200,
  "message": "上报成功",
  "count": 2
}
```

---

## 2. 获取监控数据列表

### 接口信息

- **URL**: `/api/monitor/list`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| category | string | 否 | 数据类别（error/performance/behavior/network） | - |
| type | string | 否 | 具体类型 | - |
| appId | string | 否 | 应用ID | - |
| startTime | number | 否 | 开始时间戳（毫秒） | - |
| endTime | number | 否 | 结束时间戳（毫秒） | - |

### 响应示例

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "report_id": "1703664000000-abc123",
        "app_id": "charging-station-admin",
        "user_id": "1",
        "user_name": "系统管理员",
        "type": "page_view",
        "category": "behavior",
        "timestamp": 1703664000000,
        "page_url": "/dashboard",
        "page_title": "数据看板",
        "data": {},
        "created_at": "2024-12-27T10:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

---

## 3. 获取错误列表

### 接口信息

- **URL**: `/api/monitor/errors`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| type | string | 否 | 错误类型（js_error/promise_error/vue_error等） |
| startTime | number | 否 | 开始时间戳 |
| endTime | number | 否 | 结束时间戳 |

---

## 4. 获取性能数据列表

### 接口信息

- **URL**: `/api/monitor/performance`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数

同"获取错误列表"，type 可选值为性能相关类型。

---

## 5. 获取行为数据列表

### 接口信息

- **URL**: `/api/monitor/behaviors`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数

同"获取错误列表"，type 可选值为行为相关类型。

---

## 6. 获取网络请求列表

### 接口信息

- **URL**: `/api/monitor/networks`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| startTime | number | 否 | 开始时间戳 |
| endTime | number | 否 | 结束时间戳 |

---

## 7. 获取统计概览

### 接口信息

- **URL**: `/api/monitor/overview`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startTime | number | 否 | 开始时间戳 |
| endTime | number | 否 | 结束时间戳 |
| appId | string | 否 | 应用ID |

### 响应示例

```json
{
  "code": 200,
  "data": {
    "total": 10000,
    "errorCount": 50,
    "todayCount": 500,
    "uv": 100,
    "pv": 2000,
    "categoryStats": {
      "error": 50,
      "performance": 1000,
      "behavior": 8000,
      "network": 950
    },
    "typeStats": [
      { "type": "page_view", "count": 5000 },
      { "type": "click", "count": 2000 },
      { "type": "http_request", "count": 950 }
    ]
  }
}
```

---

## 8. 获取趋势数据

### 接口信息

- **URL**: `/api/monitor/trend`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startTime | number | **是** | 开始时间戳 |
| endTime | number | **是** | 结束时间戳 |
| groupBy | string | 否 | 分组方式：hour（按小时）/ day（按天），默认 hour |
| category | string | 否 | 数据类别 |
| appId | string | 否 | 应用ID |

### 响应示例

```json
{
  "code": 200,
  "data": [
    { "time": "2024-12-27 10:00:00", "count": 120 },
    { "time": "2024-12-27 11:00:00", "count": 150 },
    { "time": "2024-12-27 12:00:00", "count": 180 }
  ]
}
```

---

## 9. 获取性能指标统计

### 接口信息

- **URL**: `/api/monitor/performance-metrics`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startTime | number | 否 | 开始时间戳 |
| endTime | number | 否 | 结束时间戳 |
| appId | string | 否 | 应用ID |

### 响应示例

```json
{
  "code": 200,
  "data": {
    "avgFCP": 1200,
    "avgLCP": 2500,
    "avgTTFB": 300,
    "avgFID": 50,
    "avgCLS": "0.05",
    "avgLoadComplete": 3000,
    "sampleCount": 100
  }
}
```

### 指标说明

| 指标 | 说明 | 良好标准 |
|------|------|----------|
| FCP | First Contentful Paint 首次内容绘制 | < 1800ms |
| LCP | Largest Contentful Paint 最大内容绘制 | < 2500ms |
| TTFB | Time To First Byte 首字节时间 | < 800ms |
| FID | First Input Delay 首次输入延迟 | < 100ms |
| CLS | Cumulative Layout Shift 累积布局偏移 | < 0.1 |

---

## 10. 获取错误统计

### 接口信息

- **URL**: `/api/monitor/error-stats`
- **Method**: `GET`
- **需要认证**: 是

### 响应示例

```json
{
  "code": 200,
  "data": {
    "total": 50,
    "byType": [
      { "type": "js_error", "count": 30 },
      { "type": "promise_error", "count": 15 },
      { "type": "vue_error", "count": 5 }
    ],
    "byPage": [
      { "page": "/dashboard", "count": 20 },
      { "page": "/orders", "count": 15 }
    ]
  }
}
```

---

## 11. 获取用户行为统计

### 接口信息

- **URL**: `/api/monitor/behavior-stats`
- **Method**: `GET`
- **需要认证**: 是

### 响应示例

```json
{
  "code": 200,
  "data": {
    "pv": 5000,
    "uv": 200,
    "clickCount": 10000,
    "routeChangeCount": 3000,
    "topPages": [
      { "page": "/dashboard", "count": 1500 },
      { "page": "/orders", "count": 1200 },
      { "page": "/stations", "count": 800 }
    ]
  }
}
```

---

## 12. 用户行为追踪

### 接口信息

- **URL**: `/api/monitor/user-tracking`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 根据用户名查询该用户的所有行为数据

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userName | string | **是** | 用户名 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| startTime | number | 否 | 开始时间戳 |
| endTime | number | 否 | 结束时间戳 |
| category | string | 否 | 数据类别 |

### 响应示例

```json
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 500,
    "page": 1,
    "pageSize": 20,
    "totalPages": 25,
    "userInfo": {
      "id": 1,
      "name": "系统管理员",
      "account": "admin"
    },
    "stats": {
      "totalBehaviors": 500,
      "firstVisit": 1703577600000,
      "lastVisit": 1703664000000,
      "behaviorTypes": [
        { "type": "page_view", "count": 200 },
        { "type": "click", "count": 250 }
      ],
      "topPages": [
        { "page": "/dashboard", "count": 50 }
      ]
    }
  }
}
```

---

## 13. 获取活跃用户列表

### 接口信息

- **URL**: `/api/monitor/active-users`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startTime | number | 否 | 开始时间戳 |
| endTime | number | 否 | 结束时间戳 |

### 响应示例

```json
{
  "code": 200,
  "data": [
    {
      "userId": "1",
      "userName": "系统管理员",
      "account": "admin",
      "behaviorCount": 500
    },
    {
      "userId": "2",
      "userName": "运营专员",
      "account": "operator1",
      "behaviorCount": 300
    }
  ]
}
```

---

## 14. 获取错误行为上下文

### 接口信息

- **URL**: `/api/monitor/error-context`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取错误发生前的用户行为轨迹，用于错误回放分析

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| errorId | number | **是** | 错误记录ID |
| seconds | number | 否 | 错误发生前的秒数，默认 10 |

### 响应示例

```json
{
  "code": 200,
  "data": {
    "error": {
      "id": 123,
      "type": "js_error",
      "message": "Uncaught TypeError",
      "timestamp": 1703664000000
    },
    "behaviors": [
      {
        "type": "page_view",
        "page_url": "/orders",
        "timestamp": 1703663995000
      },
      {
        "type": "click",
        "data": { "target": "button.submit" },
        "timestamp": 1703663998000
      }
    ],
    "userInfo": {
      "id": 1,
      "name": "系统管理员",
      "account": "admin"
    },
    "timeRange": {
      "start": 1703663990000,
      "end": 1703664000000,
      "seconds": 10
    }
  }
}
```

---

## 15. 删除监控数据

### 接口信息

- **URL**: `/api/monitor/delete`
- **Method**: `DELETE`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | number[] | 是 | 要删除的数据ID列表 |

### 请求示例

```json
DELETE /api/monitor/delete
Content-Type: application/json

{
  "ids": [1, 2, 3, 4, 5]
}
```

### 响应示例

```json
{
  "code": 200,
  "message": "删除成功",
  "deletedCount": 5
}
```

---

## 16. 清理过期数据

### 接口信息

- **URL**: `/api/monitor/clean`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 清理指定天数之前的数据

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| days | number | 否 | 保留天数，默认 30 天 |

### 请求示例

```json
POST /api/monitor/clean
Content-Type: application/json

{
  "days": 7
}
```

### 响应示例

```json
{
  "code": 200,
  "message": "已清理7天前的数据",
  "deletedCount": 1000
}
```

---

## 数据模型

### MonitorData 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| report_id | VARCHAR(64) | 上报ID |
| app_id | VARCHAR(64) | 应用ID |
| user_id | VARCHAR(64) | 用户ID |
| type | VARCHAR(32) | 数据类型 |
| category | VARCHAR(16) | 数据类别 |
| timestamp | BIGINT | 时间戳（毫秒） |
| page_url | VARCHAR(512) | 页面URL |
| page_title | VARCHAR(256) | 页面标题 |
| device_info | JSON | 设备信息 |
| environment_info | JSON | 环境信息 |
| session_info | JSON | 会话信息 |
| data | JSON | 核心数据 |
| extra | JSON | 额外数据 |
| ip_address | VARCHAR(64) | IP地址 |
| user_agent | TEXT | User Agent |
| created_at | DATETIME | 创建时间 |
