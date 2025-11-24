# 充电站管理接口文档

## 接口总览

充电站管理模块采用 RESTful 风格的 API 设计，共 **5个核心接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/stations` | GET | 获取充电站列表（分页、搜索、筛选） | ✅ |
| 2 | `/api/stations/:id` | GET | 获取单个充电站详情 | ✅ |
| 3 | `/api/stations` | POST | 创建充电站 | ✅ |
| 4 | `/api/stations/:id` | PUT | 更新充电站 | ✅ |
| 5 | `/api/stations/:id` | DELETE | 删除充电站 | ✅ |

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

