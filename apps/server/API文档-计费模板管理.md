# 计费模板管理接口文档

## 接口总览

计费模板管理模块包含 **5个接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/cityList` | GET | 获取城市列表（树形结构） | ✅ |
| 2 | `/api/billing-template/:stationId` | GET | 获取站点的计费模板 | ✅ |
| 3 | `/api/billing-template` | POST | 创建或更新计费模板 | ✅ |
| 4 | `/api/billing-template/:stationId` | DELETE | 删除计费模板 | ✅ |
| 5 | `/api/billing-template/list` | GET | 获取所有计费模板列表 | ✅ |

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

## 1. 获取城市列表（树形结构）

### 接口信息

- **URL**: `/api/cityList`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取城市和站点的树形结构，用于计费模板页面左侧树形选择

### 请求示例

```
GET /api/cityList
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取城市列表成功",
  "data": [
    {
      "label": "全部城市",
      "children": [
        {
          "label": "北京市",
          "children": [
            { "label": "北京朝阳充电站", "id": 1 },
            { "label": "北京西单充电站", "id": 2 }
          ]
        },
        {
          "label": "上海市",
          "children": [
            { "label": "上海浦东充电站", "id": 3 }
          ]
        }
      ]
    }
  ]
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| label | string | 节点名称 |
| children | array | 子节点数组 |
| id | number | 站点ID（叶子节点才有） |

---

## 2. 获取站点的计费模板

### 接口信息

- **URL**: `/api/billing-template/:stationId`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取指定站点的计费模板，如果不存在则返回空模板结构

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| stationId | number | 充电站ID |

### 请求示例

```
GET /api/billing-template/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取计费模板成功",
  "data": {
    "id": 1,
    "stationId": 1,
    "name": "北京朝阳充电站计费模板",
    "service": "5.00",
    "parking": "2.00",
    "remarks": "高峰时段费用为2.3元/度，停车费2元/小时，服务费5元/次",
    "date": [
      {
        "date1": "08:00:00",
        "date2": "18:00:00",
        "electricity": "2.30"
      },
      {
        "date1": "18:00:00",
        "date2": "22:00:00",
        "electricity": "1.80"
      },
      {
        "date1": "22:00:00",
        "date2": "08:00:00",
        "electricity": "1.20"
      }
    ],
    "stationName": "北京朝阳充电站"
  }
}
```

#### 模板不存在时（返回空结构）

```json
{
  "code": 200,
  "message": "获取计费模板成功",
  "data": {
    "id": null,
    "stationId": 1,
    "name": "",
    "service": "",
    "parking": "",
    "remarks": "",
    "date": [
      {
        "date1": "",
        "date2": "",
        "electricity": ""
      }
    ]
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number \| null | 模板ID（null表示不存在） |
| stationId | number | 充电站ID |
| name | string | 模板名称 |
| service | string | 服务费（元，保留2位小数） |
| parking | string | 停车费（元，保留2位小数） |
| remarks | string | 备注信息 |
| date | array | 时间段配置数组 |
| date[].date1 | string | 开始时间（格式：HH:mm:ss） |
| date[].date2 | string | 结束时间（格式：HH:mm:ss） |
| date[].electricity | string | 电费（元/度） |
| stationName | string | 站点名称（仅当模板存在时返回） |

---

## 3. 创建或更新计费模板

### 接口信息

- **URL**: `/api/billing-template`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 创建新的计费模板或更新已存在的模板。如果该站点已有模板则更新，否则创建新模板

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| station_id | number | 是 | 充电站ID |
| name | string | 是 | 模板名称 |
| service | string | 是 | 服务费（元） |
| parking | string | 是 | 停车费（元） |
| remarks | string | 否 | 备注信息 |
| date | array | 是 | 时间段配置数组 |
| date[].date1 | string | 是 | 开始时间（格式：HH:mm:ss） |
| date[].date2 | string | 是 | 结束时间（格式：HH:mm:ss） |
| date[].electricity | string | 是 | 电费（元/度） |

### 请求示例

```json
POST /api/billing-template
Authorization: Bearer <token>
Content-Type: application/json

{
  "station_id": 1,
  "name": "北京朝阳充电站计费模板",
  "service": "5.00",
  "parking": "2.00",
  "remarks": "高峰时段费用为2.3元/度，停车费2元/小时，服务费5元/次",
  "date": [
    {
      "date1": "08:00:00",
      "date2": "18:00:00",
      "electricity": "2.30"
    },
    {
      "date1": "18:00:00",
      "date2": "22:00:00",
      "electricity": "1.80"
    },
    {
      "date1": "22:00:00",
      "date2": "08:00:00",
      "electricity": "1.20"
    }
  ]
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "计费模板创建成功",
  "data": {
    "id": 1
  }
}
```

或

```json
{
  "code": 200,
  "message": "计费模板更新成功",
  "data": {
    "id": 1
  }
}
```

#### 错误响应 (400)

```json
{
  "code": 400,
  "message": "时间段配置不完整，请填写开始时间、结束时间和电费",
  "data": null
}
```

---

## 4. 删除计费模板

### 接口信息

- **URL**: `/api/billing-template/:stationId`
- **Method**: `DELETE`
- **需要认证**: 是
- **说明**: 删除指定站点的计费模板

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| stationId | number | 充电站ID |

### 请求示例

```
DELETE /api/billing-template/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "计费模板删除成功",
  "data": null
}
```

#### 错误响应 (404)

```json
{
  "code": 404,
  "message": "计费模板不存在",
  "data": null
}
```

---

## 5. 获取所有计费模板列表

### 接口信息

- **URL**: `/api/billing-template/list`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取所有站点的计费模板列表

### 请求示例

```
GET /api/billing-template/list
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取计费模板列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "stationId": 1,
        "stationName": "北京朝阳充电站",
        "city": "北京市",
        "name": "北京朝阳充电站计费模板",
        "serviceFee": "5.00",
        "parkingFee": "2.00",
        "timeSlotCount": 3,
        "createdAt": "2024-11-24 14:30:25"
      }
    ]
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 模板ID |
| stationId | number | 充电站ID |
| stationName | string | 站点名称 |
| city | string | 所属城市 |
| name | string | 模板名称 |
| serviceFee | string | 服务费 |
| parkingFee | string | 停车费 |
| timeSlotCount | number | 时间段数量 |
| createdAt | string | 创建时间 |

---

## 数据来源说明

### 计费模板数据来源

- 基于 `billing_template` 表存储的计费模板信息
- 关联 `station` 表获取充电站信息
- 每个站点只能有一个计费模板（通过 `station_id` 唯一约束）
- 时间段配置存储在 `time_slots` JSON字段中

### 时间段配置说明

- **时间段数组**: 支持配置多个时间段，每个时间段包含开始时间、结束时间和对应的电费
- **时间格式**: 使用 `HH:mm:ss` 格式（24小时制）
- **跨天时间段**: 支持跨天时间段（如：22:00:00 - 08:00:00）
- **电费单位**: 元/度

### 费用说明

- **服务费**: 每次充电的服务费用（固定金额）
- **停车费**: 每小时停车费用
- **电费**: 根据时间段不同，电费价格不同（分时电价）

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
  "message": "计费模板不存在",
  "data": null
}
```

---

## 注意事项

1. **数据完整性**: 每个站点只能有一个计费模板，创建新模板时会自动更新已存在的模板
2. **权限控制**: 所有接口都需要认证
3. **时间段验证**: 
   - 至少需要配置一个时间段
   - 时间格式必须为 `HH:mm:ss`
   - 电费必须为非负数
4. **费用验证**: 服务费和停车费必须为非负数
5. **站点关联**: 计费模板必须关联到已存在的充电站
6. **时间格式**: 所有时间字段使用24小时制，格式为 `HH:mm:ss`

---

## 前端集成说明

### 计费模板管理页面功能对应

1. **城市/站点树形选择**: 使用 `GET /api/cityList` 接口
2. **获取站点模板**: 点击树节点后，调用 `GET /api/billing-template/:stationId` 接口
3. **创建/更新模板**: 提交表单时，调用 `POST /api/billing-template` 接口
4. **删除模板**: 调用 `DELETE /api/billing-template/:stationId` 接口（如需要）
5. **模板列表**: 使用 `GET /api/billing-template/list` 接口（如需要）

### 数据展示建议

- **时间段**: 使用时间选择器组件，格式化为 `HH:mm:ss`
- **费用**: 建议使用货币格式显示（如：¥5.00）
- **时间段列表**: 支持动态添加/删除时间段
- **表单验证**: 前端应验证时间格式、费用格式等

### 业务逻辑说明

1. **模板创建/更新**: 
   - 如果站点已有模板，POST请求会自动更新
   - 如果站点没有模板，POST请求会创建新模板
   - 无需区分创建和更新操作

2. **时间段配置**:
   - 支持配置多个时间段，实现分时电价
   - 时间段可以重叠（由业务逻辑决定优先级）
   - 支持跨天时间段（如夜间时段）

3. **费用计算**:
   - 电费 = 充电量 × 当前时间段的电价
   - 服务费 = 固定金额（每次充电）
   - 停车费 = 停车时长（小时）× 停车费单价

