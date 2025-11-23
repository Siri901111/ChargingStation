# 充电站管理接口文档（RESTful 风格）

## 接口总览

充电站管理模块采用 RESTful 风格的 API 设计，共 **7个核心接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/stations` | GET | 获取充电站列表（分页、搜索、筛选） | ✅ |
| 2 | `/api/stations/:id` | GET | 获取单个充电站详情 | ✅ |
| 3 | `/api/stations` | POST | 创建充电站 | ✅ |
| 4 | `/api/stations/:id` | PUT | 更新充电站 | ✅ |
| 5 | `/api/stations/:id` | DELETE | 删除充电站 | ✅ |
| 6 | `/api/revenueChart` | GET | 获取营收统计图表数据 | ✅ |
| 7 | `/api/revenueList` | POST | 获取营收列表（分页、搜索） | ✅ |
| 8 | `/api/currentList` | POST | 获取充电桩实时监控列表 | ✅ |

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

## 1. 获取充电站列表

### 接口信息

- **URL**: `/api/stations`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query Parameters）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| name | string | 否 | 站点名称（模糊搜索） | - |
| id | string | 否 | 站点ID（精确搜索） | - |
| status | number | 否 | 状态筛选：1全部，2使用中，3空闲中，4维护中，5待维修 | - |

### 请求示例

```
GET /api/stations?page=1&pageSize=10&name=北京&status=2
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
        "id": "1",
        "name": "北京朝阳充电站",
        "city": "北京市",
        "fast": "12",
        "slow": "8",
        "status": 2,
        "now": "8",
        "fault": "1",
        "person": "张站长",
        "tel": "13800138010"
      }
    ],
    "total": 6
  }
}
```

#### 错误响应

```json
{
  "code": 500,
  "message": "获取充电站列表失败",
  "data": null
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 站点ID（字符串格式） |
| name | string | 站点名称 |
| city | string | 所属城市 |
| fast | string | 快充数 |
| slow | string | 慢充数 |
| status | number | 状态：2使用中，3空闲中，4维护中，5待维修 |
| now | string | 正在充电数（实时计算） |
| fault | string | 故障数（实时计算） |
| person | string | 站点负责人 |
| tel | string | 负责人电话 |

### 业务逻辑

- 支持按名称模糊搜索
- 支持按ID精确搜索
- 支持按状态筛选（status=1时返回全部）
- `now` 和 `fault` 为实时计算数据：
  - `now` = 该站点下状态为"充电中"（status=2）的充电桩数量
  - `fault` = 该站点下状态为"故障/离线"（status=6）的充电桩数量

---

## 2. 获取单个充电站详情

### 接口信息

- **URL**: `/api/stations/:id`
- **Method**: `GET`
- **需要认证**: 是

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电站ID |

### 请求示例

```
GET /api/stations/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "1",
    "name": "北京朝阳充电站",
    "city": "北京市",
    "fast": "12",
    "slow": "8",
    "status": 2,
    "now": "8",
    "fault": "1",
    "person": "张站长",
    "tel": "13800138010"
  }
}
```

#### 错误响应

##### 无效ID (400)

```json
{
  "code": 400,
  "message": "无效的站点ID",
  "data": null
}
```

##### 站点不存在 (404)

```json
{
  "code": 404,
  "message": "充电站不存在",
  "data": null
}
```

---

## 3. 创建充电站

### 接口信息

- **URL**: `/api/stations`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 站点名称 |
| city | string | 是 | 所属城市 |
| fast | number | 是 | 快充数 |
| slow | number | 是 | 慢充数 |
| status | number | 是 | 充电站状态：2使用中，3空闲中，4维护中，5待维修 |
| person | string | 是 | 站点负责人 |
| tel | string | 是 | 负责人电话 |
| longitude | number | 否 | 经度 |
| latitude | number | 否 | 纬度 |

### 请求示例

```json
POST /api/stations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "北京朝阳充电站",
  "city": "北京市",
  "fast": 12,
  "slow": 8,
  "status": 2,
  "person": "张站长",
  "tel": "13800138010",
  "longitude": 116.4074,
  "latitude": 39.9042
}
```

### 响应示例

#### 成功响应 (201)

```json
{
  "code": 201,
  "message": "充电站创建成功",
  "data": {
    "id": "7",
    "message": "充电站创建成功"
  }
}
```

#### 错误响应

##### 参数缺失 (400)

```json
{
  "code": 400,
  "message": "必填字段不能为空",
  "data": null
}
```

##### 名称已存在 (400)

```json
{
  "code": 400,
  "message": "站点名称已存在",
  "data": null
}
```

---

## 4. 更新充电站

### 接口信息

- **URL**: `/api/stations/:id`
- **Method**: `PUT`
- **需要认证**: 是

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电站ID |

### 请求参数（Body）

所有参数都是可选的，只传需要更新的字段：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 站点名称 |
| city | string | 否 | 所属城市 |
| fast | number | 否 | 快充数 |
| slow | number | 否 | 慢充数 |
| status | number | 否 | 充电站状态 |
| person | string | 否 | 站点负责人 |
| tel | string | 否 | 负责人电话 |
| longitude | number | 否 | 经度 |
| latitude | number | 否 | 纬度 |

### 请求示例

```json
PUT /api/stations/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "北京朝阳充电站（已更新）",
  "status": 3,
  "person": "李站长"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "充电站更新成功",
  "data": null
}
```

#### 错误响应

##### 站点不存在 (404)

```json
{
  "code": 404,
  "message": "充电站不存在",
  "data": null
}
```

##### 名称已存在 (400)

```json
{
  "code": 400,
  "message": "站点名称已存在",
  "data": null
}
```

---

## 5. 删除充电站

### 接口信息

- **URL**: `/api/stations/:id`
- **Method**: `DELETE`
- **需要认证**: 是

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电站ID |

### 请求示例

```
DELETE /api/stations/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "充电站删除成功",
  "data": null
}
```

#### 错误响应

##### 站点不存在 (404)

```json
{
  "code": 404,
  "message": "充电站不存在",
  "data": null
}
```

##### 有关联数据 (400)

```json
{
  "code": 400,
  "message": "该充电站下还有 5 个充电桩，无法删除",
  "data": null
}
```

或

```json
{
  "code": 400,
  "message": "该充电站下还有 10 个订单，无法删除",
  "data": null
}
```

### 业务逻辑

- 检查充电站是否存在
- 检查是否有关联的充电桩（如果有，不允许删除）
- 检查是否有关联的订单（如果有，不允许删除）
- 删除操作

---

## 状态枚举

### 充电站状态

| 值 | 说明 |
|----|------|
| 1 | 全部（仅用于筛选） |
| 2 | 使用中 |
| 3 | 空闲中 |
| 4 | 维护中 |
| 5 | 待维修 |

---

## 使用示例

### 使用 Apifox 测试

#### 1. 获取充电站列表

```
GET http://localhost:3001/api/stations?page=1&pageSize=10&status=2
Headers:
  Authorization: Bearer <token>
```

#### 2. 获取单个充电站

```
GET http://localhost:3001/api/stations/1
Headers:
  Authorization: Bearer <token>
```

#### 3. 创建充电站

```
POST http://localhost:3001/api/stations
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "name": "新充电站",
  "city": "北京市",
  "fast": 10,
  "slow": 5,
  "status": 2,
  "person": "王站长",
  "tel": "13800138000"
}
```

#### 4. 更新充电站

```
PUT http://localhost:3001/api/stations/1
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "status": 3,
  "person": "李站长"
}
```

#### 5. 删除充电站

```
DELETE http://localhost:3001/api/stations/1
Headers:
  Authorization: Bearer <token>
```

### 使用 curl 测试

```bash
# 获取列表
curl -X GET "http://localhost:3001/api/stations?page=1&pageSize=10" \
  -H "Authorization: Bearer <token>"

# 获取详情
curl -X GET "http://localhost:3001/api/stations/1" \
  -H "Authorization: Bearer <token>"

# 创建
curl -X POST "http://localhost:3001/api/stations" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新充电站",
    "city": "北京市",
    "fast": 10,
    "slow": 5,
    "status": 2,
    "person": "王站长",
    "tel": "13800138000"
  }'

# 更新
curl -X PUT "http://localhost:3001/api/stations/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": 3
  }'

# 删除
curl -X DELETE "http://localhost:3001/api/stations/1" \
  -H "Authorization: Bearer <token>"
```

---

## 注意事项

1. **ID格式**: 数据库使用 BIGINT，前端使用字符串，接口会自动转换
2. **实时数据**: `now` 和 `fault` 是实时计算的，不存储在数据库中
3. **删除限制**: 如果充电站下有关联的充电桩或订单，不允许删除
4. **名称唯一性**: 站点名称必须唯一，创建和更新时都会检查
5. **部分更新**: PUT 接口支持部分更新，只传需要修改的字段即可
6. **状态码**: 
   - 200: 成功
   - 201: 创建成功
   - 400: 参数错误或业务逻辑错误
   - 401: 未认证
   - 404: 资源不存在
   - 500: 服务器错误

---

## RESTful 设计说明

### 资源命名
- 使用复数形式：`/api/stations`（不是 `/api/station`）
- 使用名词：`stations`（不是动词）

### HTTP 方法
- `GET`: 获取资源（列表或单个）
- `POST`: 创建资源
- `PUT`: 更新资源（完整或部分）
- `DELETE`: 删除资源

### URL 设计
- 列表：`/api/stations`
- 单个：`/api/stations/:id`
- 不使用动词：❌ `/api/stations/create` ✅ `/api/stations` (POST)

### 状态码使用
- `200`: 成功（GET、PUT、DELETE）
- `201`: 创建成功（POST）
- `400`: 客户端错误（参数错误、业务逻辑错误）
- `401`: 未认证
- `404`: 资源不存在
- `500`: 服务器错误

---

## 6. 营收统计接口

### 6.1 获取营收统计图表数据

#### 接口信息

- **URL**: `/api/revenueChart`
- **Method**: `GET`
- **需要认证**: 是

#### 请求示例

```
GET /api/revenueChart
Authorization: Bearer <token>
```

#### 响应示例

##### 成功响应 (200)

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

#### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| list | array | 图表数据列表 |
| list[].name | string | 系列名称（如"销售"、"访问量"） |
| list[].data | number[] | 数据数组，长度为7，对应最近7个月的数据 |

#### 业务逻辑

- 返回最近7个月的营收统计数据
- "销售"系列：每月总销售额（单位：万元）
- "访问量"系列：每月访问量（模拟数据，基于订单记录数计算）
- 数据按时间顺序排列，从最早到最新

---

### 6.2 获取营收列表

#### 接口信息

- **URL**: `/api/revenueList`
- **Method**: `POST`
- **需要认证**: 是

#### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| name | string | 否 | 站点名称（模糊搜索） | "" |

#### 请求示例

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

#### 响应示例

##### 成功响应 (200)

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

#### 字段说明

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

#### 业务逻辑

- 支持按站点名称模糊搜索
- 支持分页查询
- 每个站点的营收数据来自该站点最新的营收记录（优先使用当天的，如果没有则使用最近的一条）
- `day` 字段 = `electricity` + `parkingFee` + `serviceFee` + `member`（单日总收入）
- `count` 字段 = `fast` + `slow`（充电桩总量）
- `percent` 和 `mpercent` 表示与上期相比的增长百分比

#### 错误响应

```json
{
  "code": 500,
  "message": "获取营收列表失败",
  "data": null
}
```

---

### 使用示例

#### 使用 Apifox 测试营收接口

##### 1. 获取营收统计图表

```
GET http://localhost:3001/api/revenueChart
Headers:
  Authorization: Bearer <token>
```

##### 2. 获取营收列表

```
POST http://localhost:3001/api/revenueList
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "page": 1,
  "pageSize": 10,
  "name": "北京"
}
```

#### 使用 curl 测试

```bash
# 获取营收图表
curl -X GET "http://localhost:3001/api/revenueChart" \
  -H "Authorization: Bearer <token>"

# 获取营收列表
curl -X POST "http://localhost:3001/api/revenueList" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "pageSize": 10,
    "name": "北京"
  }'
```

---

## 注意事项（营收统计）

1. **数据来源**: 营收数据来自 `revenue` 表，每个站点的最新营收记录
2. **数据计算**: 
   - 单日总收入 = 电费 + 停车费 + 服务费 + 会员储值金
   - 月度总收入单位是万元（需要除以10000）
3. **图表数据**: 图表显示最近7个月的数据，按时间顺序排列
4. **增长百分比**: `percent` 和 `mpercent` 可以为正数（增长）或负数（下降）
5. **数据为空**: 如果站点没有营收记录，所有营收相关字段返回 0

---

## 7. 充电桩实时监控接口

### 7.1 获取充电桩实时监控列表

#### 接口信息

- **URL**: `/api/currentList`
- **Method**: `POST`
- **需要认证**: 是

#### 请求参数（Body）

无参数，直接发送空对象或省略body。

#### 请求示例

```json
POST /api/currentList
Authorization: Bearer <token>
Content-Type: application/json

{}
```

#### 响应示例

##### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "1",
      "name": "北京朝阳充电站",
      "list": [
        {
          "id": "1",
          "voltage": "314V",
          "current": "212.2A",
          "power": "21KW",
          "tem": "32°c",
          "status": 1,
          "percent": null,
          "record": [
            {
              "time": "18:08:33",
              "msg": "充电100度，消费100元"
            },
            {
              "time": "17:27:17",
              "msg": "充电90度，消费90元"
            }
          ]
        },
        {
          "id": "2",
          "voltage": "314V",
          "current": "212.2A",
          "power": "21KW",
          "tem": "29°c",
          "status": 2,
          "percent": "70%",
          "record": []
        }
      ]
    }
  ]
}
```

#### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| data | array | 充电站列表 |
| data[].id | string | 充电站ID |
| data[].name | string | 充电站名称 |
| data[].list | array | 该充电站下的充电桩列表 |
| data[].list[].id | string | 充电桩ID |
| data[].list[].voltage | string | 电压（格式：XXXV） |
| data[].list[].current | string | 电流（格式：XXX.XA） |
| data[].list[].power | string | 功率（格式：XXKW） |
| data[].list[].tem | string | 温度（格式：XX°c） |
| data[].list[].status | number | 状态：1空闲中，2充电中，3连接中，4排队中，5已预约，6故障/离线 |
| data[].list[].percent | string \| null | 充电百分比（仅在status=2充电中时显示，格式：XX%） |
| data[].list[].record | array \| null | 使用记录列表（最近6条，如果没有则为null） |
| data[].list[].record[].time | string | 记录时间（格式：HH:MM:SS） |
| data[].list[].record[].msg | string | 记录信息（格式：充电XX度，消费XX元） |

#### 业务逻辑

- 返回所有充电站及其充电桩的实时监控数据
- 每个充电站包含其下所有充电桩的列表
- 充电桩状态说明：
  - `1`: 空闲中
  - `2`: 充电中（此时会显示 `percent` 字段）
  - `3`: 连接中
  - `4`: 排队中
  - `5`: 已预约
  - `6`: 故障/离线
- 使用记录：返回每个充电桩最近6条订单记录，按时间倒序排列
- 如果充电桩没有使用记录，`record` 字段为 `null`

#### 错误响应

```json
{
  "code": 500,
  "message": "获取充电桩监控列表失败",
  "data": null
}
```

---

### 使用示例

#### 使用 Apifox 测试监控接口

```
POST http://localhost:3001/api/currentList
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{}
```

#### 使用 curl 测试

```bash
curl -X POST "http://localhost:3001/api/currentList" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 注意事项（充电桩监控）

1. **实时数据**: 接口返回的是当前数据库中的实时数据
2. **状态显示**: `percent` 字段仅在充电中（status=2）时显示
3. **使用记录**: 记录数量最多返回6条，按时间倒序排列
4. **数据格式**: 电压、电流、功率、温度等字段已格式化为字符串，包含单位
5. **空数据**: 如果充电站下没有充电桩，`list` 为空数组

