# 报警管理接口文档

## 接口总览

报警管理模块包含 **10个接口**，分为核心接口和任务管理接口：

### 核心接口

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/alarms` | GET | 获取报警列表（分页、筛选） | ✅ |
| 2 | `/api/alarms/:id` | GET | 获取报警详情 | ✅ |
| 3 | `/api/alarms` | POST | 创建报警记录 | ✅ |
| 4 | `/api/alarms/:id/status` | PUT | 更新报警处理状态（通用接口） | ✅ |
| 5 | `/api/alarms/stats` | GET | 获取报警统计数据 | ✅ |

### 任务管理接口

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 6 | `/api/alarms/:id/assign` | POST | 指派报警任务（三步表单） | ✅ |
| 7 | `/api/alarms/:id/urge` | POST | 催办报警任务 | ✅ |
| 8 | `/api/alarms/:id/exception` | POST | 标记报警任务为处理异常 | ✅ |
| 9 | `/api/alarms/:id/complete` | POST | 完成报警任务 | ✅ |
| 10 | `/api/alarms/:id/urge-count` | GET | 获取报警催办次数 | ✅ |

**兼容接口**：
- `GET /api/alarmList` - 兼容前端的报警列表接口（等同于 `/api/alarms`）

**接口说明**：
- **接口4（更新状态）** 是通用接口，可以更新为任意状态（1-4），适合批量操作或特殊场景
- **接口6-9** 是专用业务接口，提供更严格的业务逻辑验证和更清晰的语义
  - 接口8（标记异常）与接口4功能有重叠，但提供了更严格的验证（只能从"处理中"状态标记）
  - 建议优先使用专用接口（6-9），通用接口（4）用于特殊场景

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

## 1. 获取报警列表

### 接口信息

- **URL**: `/api/alarms`
- **Method**: `GET`
- **需要认证**: 是

### 请求参数（Query Parameters）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| level | number | 否 | 报警级别：1严重，2紧急，3重要，4一般 | - |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| status | number | 否 | 处理状态：1待指派，2处理中，3已处理，4处理异常 | - |

### 请求示例

```
GET /api/alarms?level=1&page=1&pageSize=10
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取报警列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "description": "充电桩电压异常，超出安全范围",
        "address": "北京市朝阳充电站",
        "equNo": "1",
        "level": 1,
        "time": "2024-11-24 14:30:25",
        "code": 1001,
        "status": 1,
        "stationId": 1,
        "pileId": 1,
        "title": "电压异常报警",
        "detail": "充电桩电压异常，超出安全范围"
      }
    ],
    "total": 15
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 报警记录ID |
| description | string | 故障描述 |
| address | string | 设备地址 |
| equNo | string | 设备编号 |
| level | number | 报警级别：1严重，2紧急，3重要，4一般 |
| time | string | 故障时间 |
| code | number | 故障代码 |
| status | number | 处理状态：1待指派，2处理中，3已处理，4处理异常 |
| stationId | number | 充电站ID |
| pileId | number | 充电桩ID（可能为空） |
| title | string | 报警标题 |
| detail | string | 报警详情 |

---

## 2. 获取报警详情

### 接口信息

- **URL**: `/api/alarms/:id`
- **Method**: `GET`
- **需要认证**: 是

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 报警记录ID |

### 请求示例

```
GET /api/alarms/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取报警详情成功",
  "data": {
    "id": 1,
    "title": "电压异常报警",
    "detail": "充电桩电压异常，超出安全范围",
    "level": 1,
    "fault_time": "2024-11-24T14:30:25.000Z",
    "station": {
      "id": 1,
      "name": "北京朝阳充电站",
      "city": "北京市",
      "person": "张站长",
      "tel": "13800138001"
    },
    "pile": {
      "id": 1,
      "type": "快充",
      "status": 6
    }
  }
}
```

---

## 3. 创建报警记录

### 接口信息

- **URL**: `/api/alarms`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| station_id | number | 是 | 充电站ID |
| pile_id | number | 否 | 充电桩ID（站点级别报警可不填） |
| title | string | 是 | 报警标题 |
| detail | string | 是 | 报警详情 |
| level | number | 是 | 报警级别：1严重，2紧急，3重要，4一般 |

### 请求示例

```json
POST /api/alarms
Authorization: Bearer <token>
Content-Type: application/json

{
  "station_id": 1,
  "pile_id": 1,
  "title": "电压异常报警",
  "detail": "充电桩电压异常，超出安全范围",
  "level": 1
}
```

### 响应示例

#### 成功响应 (201)

```json
{
  "code": 201,
  "message": "报警记录创建成功",
  "data": {
    "id": 15
  }
}
```

---

## 4. 更新报警处理状态

### 接口信息

- **URL**: `/api/alarms/:id/status`
- **Method**: `PUT`
- **需要认证**: 是
- **说明**: 通用状态更新接口，可以更新为任意状态（1-4）。对于特定业务操作，建议使用专用接口：
  - 指派任务：使用 `POST /api/alarms/:id/assign`（接口6）
  - 标记异常：使用 `POST /api/alarms/:id/exception`（接口8）
  - 完成任务：使用 `POST /api/alarms/:id/complete`（接口9）

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 报警记录ID |

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 处理状态：1待指派，2处理中，3已处理，4处理异常 |
| handler | string | 否 | 处理人员 |
| handle_note | string | 否 | 处理备注 |

### 请求示例

```json
PUT /api/alarms/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 2,
  "handler": "维修工程师张三",
  "handle_note": "已安排维修人员前往现场处理"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "报警状态更新成功",
  "data": null
}
```

---

## 5. 获取报警统计数据

### 接口信息

- **URL**: `/api/alarms/stats`
- **Method**: `GET`
- **需要认证**: 是

### 请求示例

```
GET /api/alarms/stats
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取报警统计成功",
  "data": {
    "severe": 5,
    "urgent": 12,
    "important": 8,
    "general": 3
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| severe | number | 严重报警数量（最近30天） |
| urgent | number | 紧急报警数量（最近30天） |
| important | number | 重要报警数量（最近30天） |
| general | number | 一般报警数量（最近30天） |

---

## 报警级别说明

| 级别值 | 级别名称 | 说明 | 处理优先级 |
|--------|----------|------|------------|
| 1 | 严重 | 影响设备安全运行，需立即处理 | 最高 |
| 2 | 紧急 | 影响正常充电服务，需尽快处理 | 高 |
| 3 | 重要 | 可能影响设备性能，需及时处理 | 中 |
| 4 | 一般 | 轻微异常，可延后处理 | 低 |

## 处理状态说明

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 1 | 待指派 | 报警已记录，等待指派处理人员 |
| 2 | 处理中 | 已指派处理人员，正在处理中 |
| 3 | 已处理 | 报警任务已完成处理 |
| 4 | 处理异常 | 处理过程中遇到问题，需要协调或重新指派 |

---

## 数据来源说明

### 报警数据来源
- 基于 `alarm` 表存储的报警记录
- 关联 `station` 表获取充电站信息
- 关联 `pile` 表获取充电桩信息
- 按故障时间倒序排列

### 统计数据计算
- 统计最近30天的各级别报警数量
- 实时反映设备异常情况
- 用于报警趋势分析

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
  "message": "报警记录不存在",
  "data": null
}
```

---

## 注意事项

1. **数据完整性**: 创建报警时需验证充电站和充电桩的存在性
2. **权限控制**: 所有接口都需要认证，重要操作需要管理员权限
3. **实时性**: 报警数据需要与设备状态保持同步
4. **处理流程**: 建议按照 待指派 → 处理中 → 已完成 的流程处理报警
5. **数据关联**: 报警记录与充电站、充电桩数据关联，删除时需要考虑数据一致性

---

## 6. 指派报警任务（三步表单）

### 接口信息

- **URL**: `/api/alarms/:id/assign`
- **方法**: `POST`
- **权限**: 需要认证
- **说明**: 通过三步表单指派报警任务给处理人员。可以从"待指派"或"处理异常"状态进行指派，指派时会清零催办次数（新的处理周期）

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| basicInfo | object | 是 | 基本信息 |
| basicInfo.name | string | 是 | 处理人员姓名 |
| basicInfo.email | string | 是 | 邮箱地址 |
| basicInfo.tel | string | 是 | 联系电话 |
| basicInfo.no | string | 是 | 工号 |
| basicInfo.urgent | boolean | 否 | 是否加急，默认false |
| basicInfo.other | array | 否 | 其他选项：["1"更换设备, "2"仅维修, "3"需拍照片, "4"需报备] |
| basicInfo.remarks | string | 否 | 备注信息 |
| approvalInfo | object | 否 | 审批信息 |
| approvalInfo.approvalDept | string | 否 | 审批部门：1总裁办,2运营部,3维修部,4市场部,5财务部 |
| approvalInfo.ccDept | string | 否 | 抄送部门 |
| responsibleInfo | object | 是 | 负责人信息 |
| responsibleInfo.person | string | 是 | 负责人姓名 |
| responsibleInfo.tel | string | 是 | 负责人电话 |

### 请求示例

```json
POST /api/alarms/1/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "basicInfo": {
    "name": "张工程师",
    "email": "zhang@example.com",
    "tel": "13800138001",
    "no": "ENG001",
    "urgent": true,
    "other": ["2", "3"],
    "remarks": "设备异常，需要现场检查"
  },
  "approvalInfo": {
    "approvalDept": "3",
    "ccDept": "2"
  },
  "responsibleInfo": {
    "person": "李主管",
    "tel": "13800138002"
  }
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "报警任务指派成功",
  "data": {
    "handler": "张工程师",
    "urgent": true,
    "responsible": "李主管"
  }
}
```

---

## 7. 催办报警任务

### 接口信息

- **URL**: `/api/alarms/:id/urge`
- **方法**: `POST`
- **权限**: 需要认证
- **说明**: 对处理中的报警任务进行催办

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| urgeNote | string | 否 | 催办备注 |

### 请求示例

```json
POST /api/alarms/1/urge
Authorization: Bearer <token>
Content-Type: application/json

{
  "urgeNote": "该任务已超时，请加快处理进度"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "催办成功，已通知处理人员（第2次催办）",
  "data": {
    "urgeTime": "2024-11-24 14:30:00",
    "urgeCount": 2
  }
}
```

---

## 8. 标记报警任务为处理异常

### 接口信息

- **URL**: `/api/alarms/:id/exception`
- **方法**: `POST`
- **权限**: 需要认证
- **说明**: 将处理中的报警任务标记为处理异常，需要协调或重新指派
- **注意**: 此接口与"更新报警处理状态"接口（接口4）功能有重叠，但提供了更严格的业务逻辑验证：
  - 只能从"处理中(2)"状态标记为"处理异常(4)"
  - 自动记录异常时间和备注
  - 保留催办次数作为历史记录
  - 如需更灵活的状态更新，可使用 `PUT /api/alarms/:id/status` 接口

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| exceptionNote | string | 否 | 异常说明备注 |

### 请求示例

```json
POST /api/alarms/1/exception
Authorization: Bearer <token>
Content-Type: application/json

{
  "exceptionNote": "现场设备故障严重，需要更换配件，等待配件到货"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "报警任务已标记为处理异常",
  "data": {
    "exceptionTime": "2024-11-24 16:20:00"
  }
}
```

---

## 9. 完成报警任务

### 接口信息

- **URL**: `/api/alarms/:id/complete`
- **方法**: `POST`
- **权限**: 需要认证
- **说明**: 标记报警任务为已完成

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| completionNote | string | 否 | 完成备注 |

### 请求示例

```json
POST /api/alarms/1/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "completionNote": "设备故障已修复，测试正常"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "报警任务处理完成",
  "data": {
    "completionTime": "2024-11-24 15:45:00"
  }
}
```

---

## 10. 获取报警催办次数

### 接口信息

- **URL**: `/api/alarms/:id/urge-count`
- **方法**: `GET`
- **权限**: 需要认证
- **说明**: 获取报警任务的催办次数和相关信息

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取催办信息成功",
  "data": {
    "alarmId": 1,
    "urgeCount": 2,
    "canUrge": true,
    "lastUrgeTime": "2024-11-24 14:30:00"
  }
}
```

---

## 前端集成说明

### 报警管理页面功能对应

1. **报警列表展示**: 使用 `GET /api/alarmList` 或 `GET /api/alarms`
2. **按级别筛选**: 通过 `level` 参数筛选（1严重，2紧急，3重要，4一般）
3. **指派按钮**: 调用 `POST /api/alarms/:id/assign` 接口
4. **催办按钮**: 调用 `POST /api/alarms/:id/urge` 接口
5. **标记异常按钮**: 调用 `POST /api/alarms/:id/exception` 接口
6. **完成按钮**: 调用 `POST /api/alarms/:id/complete` 接口
7. **查看详情**: 调用 `GET /api/alarms/:id` 接口
8. **催办次数显示**: 调用 `GET /api/alarms/:id/urge-count` 接口

### 状态流转

```
待指派(1) 
  ↓ [指派]
处理中(2) → [催办] → 处理中(2) (催办次数+1)
  ↓ [完成]                    ↓ [标记异常]
已处理(3) (保留催办次数)      处理异常(4) (保留催办次数)
                                      ↓ [重新指派]
                                  处理中(2) (清零催办次数)
```

### 催办次数处理逻辑

| 操作 | 状态变更 | 催办次数处理 | 说明 |
|------|---------|------------|------|
| **指派任务** | 待指派(1) → 处理中(2) | **清零** | 新的处理周期，重新开始 |
| **指派任务** | 处理异常(4) → 处理中(2) | **清零** | 重新指派，新的处理周期 |
| **催办任务** | 处理中(2) → 处理中(2) | **递增** | 催办次数+1，记录时间 |
| **完成任务** | 处理中(2) → 已处理(3) | **保留** | 保留历史记录，不清零 |
| **标记异常** | 处理中(2) → 处理异常(4) | **保留** | 保留历史记录，不清零（使用标记异常接口） |
| **更新状态** | 任意 → 待指派(1) | **清零** | 可能重新开始处理 |
| **更新状态** | 任意 → 处理中(2) | **清零** | 新的处理周期 |
| **更新状态** | 任意 → 已处理(3)/处理异常(4) | **保留** | 保留历史记录 |

**关键原则**：
- ✅ **清零时机**：新的处理周期开始时（指派、状态变为待指派或处理中）
- ✅ **保留时机**：任务完成或异常时，保留催办次数作为历史记录
- ✅ **递增时机**：仅在"处理中"状态时可以进行催办操作

---

## 接口选择指南

### 状态更新接口的选择

报警管理提供了两种方式更新状态：

#### 1. 专用业务接口（推荐）

| 业务操作 | 使用接口 | 优势 |
|---------|---------|------|
| 指派任务 | `POST /api/alarms/:id/assign` | 三步表单验证、自动清零催办次数、记录完整指派信息 |
| 标记异常 | `POST /api/alarms/:id/exception` | 严格验证（只能从处理中状态标记）、自动记录异常信息 |
| 完成任务 | `POST /api/alarms/:id/complete` | 严格验证（只能从处理中状态完成）、自动记录完成信息 |
| 催办任务 | `POST /api/alarms/:id/urge` | 自动递增催办次数、记录催办时间 |

**适用场景**：常规业务流程操作，需要严格的业务逻辑验证

#### 2. 通用状态更新接口

| 接口 | `PUT /api/alarms/:id/status` |
|------|---------------------------|
| **功能** | 可以更新为任意状态（1-4） |
| **优势** | 灵活、支持批量操作、适合特殊场景 |
| **劣势** | 需要手动处理业务逻辑（如催办次数清零） |

**适用场景**：
- 批量状态更新
- 特殊业务场景（如管理员直接调整状态）
- 系统自动化操作

### 推荐使用方式

1. **前端业务操作**：优先使用专用业务接口（接口6-9）
2. **后台管理/批量操作**：可使用通用状态更新接口（接口4）
3. **标记异常操作**：
   - 推荐使用 `POST /api/alarms/:id/exception`（接口8）- 更安全、语义更清晰
   - 也可使用 `PUT /api/alarms/:id/status`（接口4）- 需要手动设置 `status: 4`
