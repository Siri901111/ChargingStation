# 会员卡管理接口文档

## 接口总览

会员卡管理模块包含 **2个接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/member` | POST | 获取会员卡列表（分页、搜索） | ✅ |
| 2 | `/api/member/:cardNo` | GET | 获取会员卡详情 | ✅ |

---

## 通用说明

### 请求头

所有接口都需要在请求头中携带认证令牌：

```
Authorization: Bearer <token>
或
token: <token>
```

### 响应格式

所有接口统一使用以下响应格式：

```typescript
{
  code: number;        // 状态码：200成功，400参数错误，401未认证，404不存在，500服务器错误
  message: string;      // 提示信息
  data: any;           // 响应数据
}
```

---

## 1. 获取会员卡列表

### 接口信息

- **URL**: `/api/member`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| no | string | 否 | 会员卡号（模糊搜索） | - |
| tel | string | 否 | 手机号（模糊搜索） | - |
| name | string | 否 | 姓名（模糊搜索） | - |

### 请求示例

```json
POST /api/member
Authorization: Bearer <token>
Content-Type: application/json

{
  "page": 1,
  "pageSize": 10,
  "no": "MC001",
  "tel": "138",
  "name": "张"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取会员卡列表成功",
  "data": {
    "list": [
      {
        "memberCardNumber": "MC001234567",
        "cardType": "VIP卡",
        "issueDate": "2024-01-15",
        "holderName": "张三",
        "holderPhone": "13800138001",
        "cardBalance": "5000.00",
        "transactionRecords": [
          {
            "transactionDate": "2024-11-20",
            "transactionAmount": "150.00",
            "transactionType": "充电扣款"
          },
          {
            "transactionDate": "2024-11-18",
            "transactionAmount": "50.00",
            "transactionType": "服务费扣款"
          }
        ],
        "validUntil": "2025-01-15"
      }
    ],
    "total": 53
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| memberCardNumber | string | 会员卡号 |
| cardType | string | 卡类型：普通卡、VIP卡、季卡 |
| issueDate | string | 开卡日期（格式：YYYY-MM-DD） |
| holderName | string | 持有人姓名 |
| holderPhone | string | 持有人电话 |
| cardBalance | string | 卡余额（保留2位小数） |
| transactionRecords | array | 消费记录（最近5条） |
| transactionRecords[].transactionDate | string | 消费日期 |
| transactionRecords[].transactionAmount | string | 消费金额 |
| transactionRecords[].transactionType | string | 消费类型：充电扣款、服务费扣款、停车费扣款、其他 |
| validUntil | string | 有效期至（格式：YYYY-MM-DD） |
| total | number | 总记录数 |

---

## 2. 获取会员卡详情

### 接口信息

- **URL**: `/api/member/:cardNo`
- **Method**: `GET`
- **需要认证**: 是

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| cardNo | string | 会员卡号 |

### 请求示例

```
GET /api/member/MC001234567
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取会员卡详情成功",
  "data": {
    "memberCardNumber": "MC001234567",
    "cardType": "VIP卡",
    "issueDate": "2024-01-15",
    "holderName": "张三",
    "holderPhone": "13800138001",
    "cardBalance": "5000.00",
    "transactionRecords": [
      {
        "transactionDate": "2024-11-20",
        "transactionAmount": "150.00",
        "transactionType": "充电扣款",
        "orderNo": "ORD20241120143025"
      },
      {
        "transactionDate": "2024-11-18",
        "transactionAmount": "50.00",
        "transactionType": "服务费扣款",
        "orderNo": "ORD20241118102015"
      }
    ],
    "validUntil": "2025-01-15",
    "idNo": "110101199001011234",
    "status": 1
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| memberCardNumber | string | 会员卡号 |
| cardType | string | 卡类型 |
| issueDate | string | 开卡日期 |
| holderName | string | 持有人姓名 |
| holderPhone | string | 持有人电话 |
| cardBalance | string | 卡余额 |
| transactionRecords | array | 所有消费记录（按时间倒序） |
| transactionRecords[].orderNo | string | 订单号（详情接口特有） |
| validUntil | string | 有效期至 |
| idNo | string | 身份证号（详情接口特有） |
| status | number | 状态：1正常，0禁用（详情接口特有） |

---

## 数据来源说明

### 会员卡数据来源

- 基于 `charging_user` 表存储的会员卡信息
- 会员卡号存储在 `member_card_no` 字段
- 卡余额存储在 `balance` 字段
- 卡类型存储在 `card_type` 字段（普通卡、VIP卡、季卡）
- 开卡日期：优先使用 `issue_date`，若无则使用 `created_at`
- 有效期至：存储在 `valid_until` 字段

### 消费记录数据来源

- 基于 `order` 表存储的订单信息
- 通过 `user_id` 关联 `charging_user` 表
- 只统计状态为"已完成(3)"的订单
- 消费类型根据订单的 `pay` 字段判断：
  - `pay === '会员卡'` → 充电扣款
  - `pay` 包含"服务费" → 服务费扣款
  - `pay` 包含"停车" → 停车费扣款
  - 其他 → 其他

---

## 错误响应

### 通用错误响应

```json
{
  "code": 500,
  "message": "操作失败",
  "data": null
}
```

### 参数错误响应

```json
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

### 资源不存在响应

```json
{
  "code": 404,
  "message": "会员卡不存在",
  "data": null
}
```

---

## 注意事项

1. **数据完整性**: 会员卡号在 `charging_user` 表中是唯一标识
2. **权限控制**: 所有接口都需要认证
3. **搜索功能**: 支持按会员卡号、手机号、姓名进行模糊搜索
4. **消费记录**: 列表接口返回最近5条消费记录，详情接口返回所有消费记录
5. **数据关联**: 消费记录通过订单表关联，只统计已完成的订单
6. **日期格式**: 所有日期字段统一使用 `YYYY-MM-DD` 格式
7. **金额格式**: 所有金额字段统一保留2位小数

---

## 前端集成说明

### 会员卡管理页面功能对应

1. **会员卡列表展示**: 使用 `POST /api/member` 接口
2. **搜索功能**: 通过 `no`、`tel`、`name` 参数进行搜索
3. **分页功能**: 通过 `page` 和 `pageSize` 参数控制分页
4. **消费记录查看**: 列表接口已包含最近5条消费记录，详情接口包含所有消费记录
5. **会员卡详情**: 使用 `GET /api/member/:cardNo` 接口

### 数据展示建议

- **卡类型**: 可使用不同颜色标签区分（普通卡-灰色，VIP卡-金色，季卡-蓝色）
- **卡余额**: 建议使用货币格式显示（如：¥5,000.00）
- **消费记录**: 使用时间轴或表格形式展示
- **有效期**: 接近过期时显示警告（如：30天内过期显示黄色，已过期显示红色）

