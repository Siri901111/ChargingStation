# 营收统计接口文档

## 接口总览

营收统计模块包含 **2个核心接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/revenueChart` | GET | 获取营收统计图表数据 | ✅ |
| 2 | `/api/revenueList` | POST | 获取营收列表（分页、搜索） | ✅ |

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

## 1. 获取营收统计图表数据

### 接口信息

- **URL**: `/api/revenueChart`
- **Method**: `GET`
- **需要认证**: 是

### 请求示例

```
GET /api/revenueChart
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "name": "销售",
        "data": [60, 40, 120, 140, 160, 80, 140]
      },
      {
        "name": "访问量",
        "data": [600, 400, 600, 700, 800, 400, 700]
      }
    ]
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| list | array | 图表数据列表 |
| list[].name | string | 系列名称（如"销售"、"访问量"） |
| list[].data | number[] | 数据数组，长度为7，对应最近7个月的数据 |

### 业务逻辑

- 返回最近7个月的营收统计数据
- "销售"系列：每月总销售额（单位：万元）
- "访问量"系列：每月访问量（模拟数据，基于订单记录数计算）
- 数据按时间顺序排列，从最早到最新

---

## 2. 获取营收列表

### 接口信息

- **URL**: `/api/revenueList`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| name | string | 否 | 站点名称（模糊搜索） | "" |

### 请求示例

```json
POST /api/revenueList
Authorization: Bearer <token>
Content-Type: application/json

{
  "page": 1,
  "pageSize": 10,
  "name": "北京"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "name": "北京朝阳充电站",
        "id": "1",
        "city": "北京市",
        "count": 20,
        "day": 12500.50,
        "month": 125.50,
        "electricity": 8000,
        "parkingFee": 2000,
        "serviceFee": 1500,
        "member": 1000,
        "percent": 5.2,
        "mpercent": 3.8
      }
    ],
    "total": 1
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| list | array | 营收列表 |
| list[].name | string | 充电站名称 |
| list[].id | string | 充电站ID |
| list[].city | string | 所属城市 |
| list[].count | number | 充电桩总量（快充数+慢充数） |
| list[].day | number | 单日总收入（元），保留2位小数 |
| list[].month | number | 月度总收入（万元），保留2位小数 |
| list[].electricity | number | 电费营收（元） |
| list[].parkingFee | number | 停车费营收（元） |
| list[].serviceFee | number | 服务费营收（元） |
| list[].member | number | 会员储值金（元） |
| list[].percent | number | 日增长百分比（正数表示增长，负数表示下降） |
| list[].mpercent | number | 月增长百分比（正数表示增长，负数表示下降） |
| total | number | 总记录数 |

### 业务逻辑

- 支持按站点名称模糊搜索
- 支持分页查询
- 每个站点的营收数据来自该站点最新的营收记录（优先使用当天的，如果没有则使用最近的一条）
- `day` 字段 = `electricity` + `parkingFee` + `serviceFee` + `member`（单日总收入）
- `count` 字段 = `fast` + `slow`（充电桩总量）
- `percent` 和 `mpercent` 表示与上期相比的增长百分比

### 错误响应

```json
{
  "code": 500,
  "message": "获取营收列表失败",
  "data": null
}
```

---

---

## 数据来源说明

### 营收数据表结构

营收数据来自 `revenue` 表，主要字段包括：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键ID |
| station_id | BIGINT | 充电站ID |
| day_date | DATE | 营收日期 |
| day | DECIMAL(10,2) | 单日收入 |
| month | DECIMAL(10,2) | 月度收入 |
| electricity | DECIMAL(10,2) | 电费营收 |
| parking_fee | DECIMAL(10,2) | 停车费营收 |
| service_fee | DECIMAL(10,2) | 服务费营收 |
| member | DECIMAL(10,2) | 会员储值金 |
| percent | DECIMAL(5,2) | 日增长百分比 |
| mpercent | DECIMAL(5,2) | 月增长百分比 |

### 数据计算规则

#### 图表数据计算
1. **销售数据**: 统计每月所有充电站的月收入总和，单位转换为万元
2. **访问量数据**: 基于营收记录数量计算，乘以100作为模拟访问量
3. **时间范围**: 最近7个月的数据，按时间顺序排列

#### 营收列表计算
1. **单日总收入**: `electricity + parking_fee + service_fee + member`
2. **月度总收入**: 直接从 `month` 字段获取，单位转换为万元
3. **充电桩总量**: 从充电站表获取 `fast + slow`
4. **数据优先级**: 优先使用当天的营收记录，如果没有则使用最近的一条

---

## 注意事项

1. **数据来源**: 营收数据来自 `revenue` 表，每个站点的最新营收记录
2. **数据计算**: 
   - 单日总收入 = 电费 + 停车费 + 服务费 + 会员储值金
   - 月度总收入单位是万元（需要除以10000）
3. **图表数据**: 图表显示最近7个月的数据，按时间顺序排列
4. **增长百分比**: `percent` 和 `mpercent` 可以为正数（增长）或负数（下降）
5. **数据为空**: 如果站点没有营收记录，所有营收相关字段返回 0
6. **实时性**: 营收数据需要定期更新，建议每日凌晨自动生成当日营收记录
7. **数据精度**: 金额字段保留2位小数，百分比字段保留2位小数

