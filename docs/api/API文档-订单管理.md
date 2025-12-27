# 订单管理接口文档

## 接口总览

订单管理模块包含 **3个接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/orderList` | POST | 获取订单列表（分页、搜索） | ✅ |
| 2 | `/api/batchDelete` | POST | 批量删除订单 | ✅ |
| 3 | `/api/orders/:orderNo` | GET | 获取订单详情 | ✅ |

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

## 1. 获取订单列表

### 接口信息

- **URL**: `/api/orderList`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| orderNo | string | 否 | 订单号（模糊搜索） | - |
| status | number | 否 | 订单状态：1全部，2进行中，3已完成，4异常 | 1 |
| no | string | 否 | 设备编号（模糊搜索） | - |
| name | string | 否 | 站点名称（模糊搜索） | - |
| startDate | string | 否 | 开始日期（格式：YYYY-MM-DD） | - |
| endDate | string | 否 | 结束日期（格式：YYYY-MM-DD） | - |

### 请求示例

```json
POST /api/orderList
Authorization: Bearer <token>
Content-Type: application/json

{
  "page": 1,
  "pageSize": 10,
  "orderNo": "ORD",
  "status": 3,
  "no": "PILE",
  "name": "北京",
  "startDate": "2024-11-01",
  "endDate": "2024-11-30"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取订单列表成功",
  "data": {
    "list": [
      {
        "orderNo": "ORD20241120143025",
        "equipmentNo": "PILE1-5",
        "date": "2024-11-20",
        "startTime": "14:30:25",
        "endTime": "16:45:30",
        "money": "150.00",
        "pay": "微信支付",
        "status": 3,
        "stationName": "北京朝阳充电站"
      }
    ],
    "total": 54
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| orderNo | string | 订单号 |
| equipmentNo | string | 设备编号 |
| date | string | 订单日期（格式：YYYY-MM-DD） |
| startTime | string | 开始时间（格式：HH:mm:ss） |
| endTime | string | 结束时间（格式：HH:mm:ss） |
| money | string | 订单金额（保留2位小数） |
| pay | string | 支付方式 |
| status | number | 订单状态：2进行中，3已完成，4异常 |
| stationName | string | 站点名称 |
| total | number | 总记录数 |

---

## 2. 批量删除订单

### 接口信息

- **URL**: `/api/batchDelete`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| order | array | 是 | 订单号数组 |

### 请求示例

```json
POST /api/batchDelete
Authorization: Bearer <token>
Content-Type: application/json

{
  "order": ["ORD20241120143025", "ORD20241118102015", "ORD20241115143025"]
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "成功删除 3 条订单",
  "data": "成功删除 3 条订单"
}
```

#### 错误响应 (400)

```json
{
  "code": 400,
  "message": "订单号列表不能为空",
  "data": null
}
```

#### 错误响应 (404)

```json
{
  "code": 404,
  "message": "没有找到要删除的订单",
  "data": null
}
```

---

## 3. 获取订单详情

### 接口信息

- **URL**: `/api/orders/:orderNo`
- **Method**: `GET`
- **需要认证**: 是

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| orderNo | string | 订单号 |

### 请求示例

```
GET /api/orders/ORD20241120143025
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取订单详情成功",
  "data": {
    "orderNo": "ORD20241120143025",
    "equipmentNo": "PILE1-5",
    "date": "2024-11-20",
    "startTime": "14:30:25",
    "endTime": "16:45:30",
    "money": "150.00",
    "pay": "微信支付",
    "status": 3,
    "stationName": "北京朝阳充电站",
    "city": "北京市",
    "chargeAmount": "159.38",
    "chargeDevice": "充电桩(快充)",
    "chargeDuration": "2.25",
    "person": "张站长",
    "tel": "13800138001",
    "maintenancePersonName": "刘来",
    "maintenancePersonTel": "17777777777",
    "serviceFee": "15.00",
    "parkingFee": "7.50",
    "electricityFee": "127.50",
    "feeInfo": "电费+服务费+停车费，高峰时段费用为2.3元/度，停车费2元/小时，服务费5元/次",
    "remark": "暂无"
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| orderNo | string | 订单号 |
| equipmentNo | string | 设备编号 |
| date | string | 订单日期 |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |
| money | string | 订单总金额 |
| pay | string | 支付方式 |
| status | number | 订单状态 |
| stationName | string | 站点名称 |
| city | string | 所属城市 |
| chargeAmount | string | 充电量（度） |
| chargeDevice | string | 充电设备 |
| chargeDuration | string | 充电总时长（小时） |
| person | string | 负责人姓名 |
| tel | string | 负责人电话 |
| maintenancePersonName | string | 维保人员姓名 |
| maintenancePersonTel | string | 维保人员电话 |
| serviceFee | string | 服务费（元） |
| parkingFee | string | 停车费（元） |
| electricityFee | string | 电费（元） |
| feeInfo | string | 收费信息说明 |
| remark | string | 备注 |

---

## 订单状态说明

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 2 | 进行中 | 充电正在进行中 |
| 3 | 已完成 | 充电已完成 |
| 4 | 异常 | 充电过程中出现异常 |

---

## 数据来源说明

### 订单数据来源

- 基于 `order` 表存储的订单信息
- 关联 `station` 表获取充电站信息（名称、城市、负责人等）
- 关联 `charging_user` 表获取用户信息（详情接口）
- 关联 `pile` 表获取充电桩信息（详情接口）

### 费用计算说明

订单详情中的费用分解基于以下规则（模拟计算）：
- **电费**：占总金额的85%
- **服务费**：占总金额的10%
- **停车费**：占总金额的5%
- **充电量**：根据电费和平均电价（0.8元/度）计算

**注意**：实际项目中，费用计算应该基于订单表中的详细费用字段，当前为模拟计算。

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
  "message": "订单不存在",
  "data": null
}
```

---

## 注意事项

1. **数据完整性**: 删除订单时需要考虑数据关联性
2. **权限控制**: 所有接口都需要认证
3. **搜索功能**: 支持多条件组合搜索，所有搜索字段支持模糊匹配
4. **日期范围**: 开始日期和结束日期需要同时提供才生效
5. **状态筛选**: 状态值为1表示查询全部，不添加状态筛选条件
6. **批量删除**: 批量删除会返回实际删除的订单数量
7. **费用计算**: 订单详情中的费用分解为模拟计算，实际应基于数据库中的详细费用字段

---

## 前端集成说明

### 订单管理页面功能对应

1. **订单列表展示**: 使用 `POST /api/orderList` 接口
2. **搜索功能**: 通过 `orderNo`、`status`、`no`、`name`、`startDate`、`endDate` 参数进行搜索
3. **分页功能**: 通过 `page` 和 `pageSize` 参数控制分页
4. **批量删除**: 调用 `POST /api/batchDelete` 接口
5. **订单详情**: 调用 `GET /api/orders/:orderNo` 接口
6. **导出Excel**: 前端实现，使用列表数据导出

### 数据展示建议

- **订单状态**: 使用不同颜色标签区分（进行中-蓝色，已完成-绿色，异常-橙色）
- **金额**: 建议使用货币格式显示（如：¥150.00）
- **时间**: 日期和时间分开显示，便于阅读
- **站点名称**: 可点击跳转到站点详情（如需要）

