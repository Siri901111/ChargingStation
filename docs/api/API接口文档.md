# 充电站管理系统 - 后端 API 文档

> 版本: v1.0.0
> 基础路径: `/api`
> 更新时间: 2024-12-27

## 目录

- [概述](#概述)
- [认证机制](#认证机制)
- [响应格式](#响应格式)
- [接口清单](#接口清单)
- [模块详情](#模块详情)

---

## 概述

本系统提供充电站管理相关的 RESTful API，涵盖用户管理、充电站运营、订单处理、数据分析等功能模块。

### 技术栈

- 运行时: Node.js + Express 5.x
- 数据库: MySQL 8.0 + Sequelize ORM
- 认证: JWT (JSON Web Token)
- 架构: Monorepo (pnpm + Turborepo)

---

## 认证机制

### Token 传递方式

```http
Authorization: Bearer <token>
# 或
token: <token>
```

### Token 有效期

- 有效期: 24 小时
- 获取方式: 调用 `/api/login` 接口

---

## 响应格式

### 统一响应结构

```typescript
interface Response<T = any> {
  code: number;       // 状态码
  message: string;    // 提示信息
  data: T;            // 响应数据
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 分页响应结构

```typescript
interface PaginatedResponse<T> {
  code: 200;
  message: string;
  data: {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}
```

---

## 接口清单

### 用户管理 (7个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/login` | 用户登录 | ❌ |
| POST | `/register` | 用户注册 | ❌ |
| POST | `/permissionList` | 获取用户列表 | ✅ |
| POST | `/userAuth` | 获取用户权限 | ✅ |
| POST | `/setAuth` | 设置用户权限 | ✅ |
| POST | `/deleteUser` | 删除用户 | ✅ |
| POST | `/toggleUserStatus` | 禁用/启用用户 | ✅ |

### 充电站管理 (5个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/chargingstations` | 获取充电站列表 | ✅ |
| POST | `/addchargingstation` | 新增充电站 | ✅ |
| POST | `/updatestation` | 更新充电站 | ✅ |
| POST | `/deletestation` | 删除充电站 | ✅ |
| POST | `/getstationdetail` | 获取充电站详情 | ✅ |

### 充电桩管理 (7个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/piles` | 获取充电桩列表 | ✅ |
| POST | `/addPile` | 新增充电桩 | ✅ |
| POST | `/updatePile` | 更新充电桩 | ✅ |
| POST | `/deletePile` | 删除充电桩 | ✅ |
| POST | `/getPileDetail` | 获取充电桩详情 | ✅ |
| POST | `/currentlist` | 获取实时监控列表 | ✅ |
| POST | `/faultlist` | 获取故障列表 | ✅ |

### 订单管理 (3个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/orderlist` | 获取订单列表 | ✅ |
| POST | `/ordertotal` | 获取订单统计 | ✅ |
| POST | `/orderdetail` | 获取订单详情 | ✅ |

### 会员卡管理 (4个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/memberCardList` | 获取会员卡列表 | ✅ |
| POST | `/addMemberCard` | 新增会员卡 | ✅ |
| POST | `/updateMemberCard` | 更新会员卡 | ✅ |
| POST | `/deleteMemberCard` | 删除会员卡 | ✅ |

### 计费模板管理 (5个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/billingTemplates` | 获取模板列表 | ✅ |
| POST | `/addBillingTemplate` | 新增模板 | ✅ |
| POST | `/updateBillingTemplate` | 更新模板 | ✅ |
| POST | `/deleteBillingTemplate` | 删除模板 | ✅ |
| POST | `/getBillingTemplateDetail` | 获取模板详情 | ✅ |

### 报警管理 (4个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/alarms` | 获取报警列表 | ✅ |
| POST | `/handleAlarm` | 处理报警 | ✅ |
| POST | `/deleteAlarm` | 删除报警 | ✅ |
| POST | `/alarmStats` | 报警统计 | ✅ |

### 营收统计 (2个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/revenuetotal` | 获取营收汇总 | ✅ |
| POST | `/revenuemonth` | 获取月度营收 | ✅ |

### 数据看板 (4个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/dashboardstats` | 获取统计数据 | ✅ |
| POST | `/dashboardtrend` | 获取趋势数据 | ✅ |
| POST | `/dashboardstatus` | 获取状态分布 | ✅ |
| POST | `/dashboardrank` | 获取排行榜 | ✅ |

### 电子地图 (2个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/mapstations` | 获取地图站点 | ✅ |
| POST | `/mapstats` | 获取地图统计 | ✅ |

### 个人中心 (5个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/getUserInfo` | 获取用户信息 | ✅ |
| POST | `/updateUserInfo` | 更新用户信息 | ✅ |
| POST | `/changePassword` | 修改密码 | ✅ |
| POST | `/getNotices` | 获取通知列表 | ✅ |
| POST | `/readNotice` | 标记通知已读 | ✅ |

### 招商管理 (4个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/chargingUsers` | 获取运营商列表 | ✅ |
| POST | `/addChargingUser` | 新增运营商 | ✅ |
| POST | `/updateChargingUser` | 更新运营商 | ✅ |
| POST | `/deleteChargingUser` | 删除运营商 | ✅ |

### 前端监控 (16个)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/monitor/report` | SDK数据上报 | ❌ |
| GET | `/monitor/list` | 获取监控数据列表 | ✅ |
| GET | `/monitor/errors` | 获取错误列表 | ✅ |
| GET | `/monitor/performance` | 获取性能数据列表 | ✅ |
| GET | `/monitor/behaviors` | 获取行为数据列表 | ✅ |
| GET | `/monitor/networks` | 获取网络请求列表 | ✅ |
| GET | `/monitor/overview` | 获取统计概览 | ✅ |
| GET | `/monitor/trend` | 获取趋势数据 | ✅ |
| GET | `/monitor/performance-metrics` | 获取性能指标 | ✅ |
| GET | `/monitor/error-stats` | 获取错误统计 | ✅ |
| GET | `/monitor/behavior-stats` | 获取行为统计 | ✅ |
| GET | `/monitor/user-tracking` | 用户行为追踪 | ✅ |
| GET | `/monitor/active-users` | 获取活跃用户 | ✅ |
| GET | `/monitor/error-context` | 获取错误上下文 | ✅ |
| DELETE | `/monitor/delete` | 删除监控数据 | ✅ |
| POST | `/monitor/clean` | 清理过期数据 | ✅ |

---

## 模块详情

### 用户管理

#### 登录

```http
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "username": "系统管理员", "roles": ["admin"] },
    "menulist": [...],
    "btnAuth": ["all", "add", "edit", "delete"]
  }
}
```

#### 权限级别

| 级别 | 说明 | 菜单权限 |
|------|------|----------|
| admin | 管理员 | 全部菜单 |
| manager | 运营专员 | 运营相关菜单 |
| user | 普通用户 | 基础菜单 |

---

### 充电站管理

#### 获取充电站列表

```http
POST /api/chargingstations
Content-Type: application/json

{
  "page": 1,
  "pageSize": 10,
  "stationName": "北京",
  "status": 1
}
```

#### 状态说明

| 状态值 | 说明 |
|--------|------|
| 0 | 离线 |
| 1 | 正常运营 |
| 2 | 故障 |

---

### 订单管理

#### 获取订单列表

```http
POST /api/orderlist
Content-Type: application/json

{
  "page": 1,
  "pageSize": 10,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "status": 1
}
```

#### 订单状态

| 状态值 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 已完成 |
| 2 | 已取消 |
| 3 | 退款中 |

---

### 前端监控

#### 数据类别

| 类别 | 说明 |
|------|------|
| error | 错误数据 (js_error, promise_error, vue_error 等) |
| performance | 性能数据 (FCP, LCP, TTFB, FID, CLS 等) |
| behavior | 行为数据 (page_view, click, route_change 等) |
| network | 网络请求 (http_request) |

#### SDK 上报

```http
POST /api/monitor/report
Content-Type: application/json

{
  "appId": "charging-station-admin",
  "userId": "1",
  "type": "page_view",
  "timestamp": 1703664000000,
  "pageUrl": "/dashboard"
}
```

#### 性能指标标准

| 指标 | 良好 | 需改进 | 较差 |
|------|------|--------|------|
| FCP | < 1.8s | 1.8s - 3s | > 3s |
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |

---

## 附录

### 详细文档

各模块详细接口文档请参考：

- [用户管理](./API文档-用户管理.md)
- [充电站管理](./API文档-充电站管理.md)
- [充电桩管理](./API文档-充电桩管理.md)
- [订单管理](./API文档-订单管理.md)
- [会员卡管理](./API文档-会员卡管理.md)
- [计费模板管理](./API文档-计费模板管理.md)
- [报警管理](./API文档-报警管理.md)
- [营收统计](./API文档-营收统计.md)
- [数据看板](./API文档-数据看板.md)
- [电子地图](./API文档-电子地图.md)
- [个人中心](./API文档-个人中心.md)
- [招商管理](./API文档-招商管理.md)
- [前端监控](./API文档-前端监控.md)

### 错误码速查

| 模块 | 错误码范围 |
|------|-----------|
| 通用 | 400-499 |
| 用户 | 1001-1099 |
| 充电站 | 2001-2099 |
| 订单 | 3001-3099 |
| 监控 | 4001-4099 |

---

> 文档维护: 开发团队
> 如有问题请联系后端开发人员
