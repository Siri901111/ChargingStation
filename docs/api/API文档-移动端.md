# 移动端 API 接口文档

## 接口总览

移动端 API 路径前缀：`/api/mobile`

### 用户模块

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/user/sendCode` | POST | 发送验证码 | - |
| `/user/loginByPhone` | POST | 手机号登录 | - |
| `/user/loginByWechat` | POST | 微信登录 | - |
| `/user/info` | GET | 获取用户信息 | ✅ |
| `/user/info` | PUT | 更新用户信息 | ✅ |
| `/user/balance` | GET | 获取余额 | ✅ |
| `/user/recharge` | POST | 充值 | ✅ |

### 钱包模块

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/wallet/balance` | GET | 获取余额 | ✅ |
| `/wallet/packages` | GET | 获取充值套餐 | - |
| `/wallet/consume` | GET | 获取消费记录 | ✅ |
| `/wallet/records` | GET | 获取充值记录 | ✅ |
| `/wallet/recharge` | POST | 充值 | ✅ |

### 充电站模块

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/station/nearby` | GET | 获取附近站点 | - |
| `/station/search` | GET | 搜索站点 | - |
| `/station/hot` | GET | 获取热门站点 | - |
| `/station/:id` | GET | 站点详情 | - |
| `/station/:id/piles` | GET | 站点充电桩列表 | - |
| `/pile/:id` | GET | 充电桩详情 | - |
| `/station/favorite` | POST | 收藏站点 | ✅ |
| `/station/favorite/:id` | DELETE | 取消收藏 | ✅ |
| `/station/favorites` | GET | 获取收藏列表 | ✅ |

### 充电模块

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/charging/scan` | POST | 扫码获取充电桩 | ✅ |
| `/charging/start` | POST | 开始充电 | ✅ |
| `/charging/stop` | POST | 停止充电 | ✅ |
| `/charging/status` | GET | 当前充电状态 | ✅ |
| `/charging/history` | GET | 充电历史 | ✅ |

### 订单模块

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/order/list` | GET | 订单列表 | ✅ |
| `/order/statistics` | GET | 订单统计 | ✅ |
| `/order/:orderNo` | GET | 订单详情 | ✅ |
| `/order/pay` | POST | 支付订单 | ✅ |
| `/order/:orderNo/cancel` | POST | 取消订单 | ✅ |
| `/order/:orderNo/refund` | POST | 申请退款 | ✅ |

### 测试接口（仅开发环境）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/test/recharge` | POST | 测试充值 |
| `/test/init-stations` | POST | 初始化充电站数据 |
| `/test/init-orders` | POST | 初始化订单数据 |
| `/test/init-all` | POST | 初始化所有测试数据 |

---

## 通用说明

### 请求头

需要认证的接口携带 Token：

```
Authorization: Bearer <token>
```

### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 用户接口

### 发送验证码

```
POST /api/mobile/user/sendCode
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| type | string | 否 | 类型：login/register |

**开发环境**：返回固定验证码 `666666`

---

### 手机号登录

```
POST /api/mobile/user/loginByPhone
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码（开发环境固定 666666） |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "phone": "19282249442",
      "name": "测试用户",
      "balance": 500.00
    }
  }
}
```

---

### 获取用户信息

```
GET /api/mobile/user/info
```

**请求头**：需要 Token

**响应示例**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "phone": "19282249442",
    "name": "测试用户",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=19282249442",
    "gender": 1,
    "birthday": "1995-06-15",
    "memberCardNo": "M202401010001",
    "cardType": "普通卡",
    "balance": 500.00
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| gender | number | 性别：0未知 1男 2女 |
| birthday | string | 生日，格式 YYYY-MM-DD |

---

### 更新用户信息

```
PUT /api/mobile/user/info
```

**请求头**：需要 Token

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL |
| gender | number | 否 | 性别：0未知 1男 2女 |
| birthday | string | 否 | 生日，格式 YYYY-MM-DD |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "phone": "19282249442",
    "name": "新昵称",
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1,
    "birthday": "1995-06-15",
    "memberCardNo": "M202401010001",
    "cardType": "普通卡",
    "balance": 500.00
  }
}
```

---

## 充电站接口

### 获取附近站点

```
GET /api/mobile/station/nearby
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| latitude | number | 否 | 纬度 |
| longitude | number | 否 | 经度 |
| radius | number | 否 | 搜索半径(km)，默认5 |
| type | string | 否 | fast/slow |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

---

### 搜索站点

```
GET /api/mobile/station/search
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 关键词 |
| city | string | 否 | 城市 |
| latitude | number | 否 | 纬度 |
| longitude | number | 否 | 经度 |

---

## 收藏接口

### 收藏站点

```
POST /api/mobile/station/favorite
```

**请求头**：需要 Token

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stationId | number | 是 | 站点ID |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

---

### 取消收藏

```
DELETE /api/mobile/station/favorite/:id
```

**请求头**：需要 Token

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 站点ID |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

---

### 获取收藏列表

```
GET /api/mobile/station/favorites
```

**请求头**：需要 Token

**响应示例**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "长沙岳麓区充电站",
      "city": "长沙市",
      "address": "岳麓区xxx路",
      "latitude": 28.1963,
      "longitude": 112.9822,
      "fast": 8,
      "slow": 6,
      "fastFree": 5,
      "slowFree": 4,
      "price": 1.2
    }
  ]
}
```

---

## 订单接口

### 获取订单列表

```
GET /api/mobile/order/list
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | number | 否 | 状态筛选 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**订单状态**

| 状态值 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 充电中 |
| 2 | 待支付（充电完成） |
| 3 | 已完成 |
| 4 | 已取消 |

---

## 测试接口

### 测试充值

```
POST /api/mobile/test/recharge
```

**请求头**：需要 Token

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | number | 是 | 充值金额 |
| giftAmount | number | 否 | 赠送金额 |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "success": true,
    "amount": 100,
    "giftAmount": 5,
    "totalAdd": 105,
    "newBalance": 605.00
  }
}
```

---

### 初始化测试数据

```
POST /api/mobile/test/init-all
```

执行后会创建：
- 长沙市 8 个充电站（各区）
- 天津市 8 个充电站（各区）
- 每个站点 4-9 个快充桩 + 4-11 个慢充桩
- 测试用户 15 条历史订单

---

## 测试数据

### 充电站分布

**长沙市**：岳麓区、天心区、开福区、雨花区、芙蓉区、望城区、长沙县

**天津市**：和平区、南开区、河西区、河东区、河北区、红桥区、滨海新区、武清区

### 测试账号

- **手机号**：19282249442
- **验证码**：666666（开发环境固定）
- **初始余额**：500元
