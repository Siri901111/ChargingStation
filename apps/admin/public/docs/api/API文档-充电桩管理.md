# 充电桩管理接口文档

## 接口总览

充电桩管理模块包含 **11个接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/piles` | GET | 获取充电桩列表（分页、搜索） | ✅ |
| 2 | `/api/piles/:id` | GET | 获取充电桩详情 | ✅ |
| 3 | `/api/piles` | POST | 创建充电桩 | ✅ |
| 4 | `/api/piles/:id` | PUT | 更新充电桩 | ✅ |
| 5 | `/api/piles/:id` | DELETE | 删除充电桩 | ✅ |
| 6 | `/api/piles/:id/status` | PUT | 更新充电桩状态 | ✅ |
| 7 | `/api/piles/:id/usage-records` | GET | 获取充电桩使用记录 | ✅ |
| 8 | `/api/piles/:id/maintenance` | GET | 获取充电桩维保记录 | ✅ |
| 9 | `/api/piles/:id/maintenance` | POST | 创建维保记录 | ✅ |
| 10 | `/api/piles/:id/maintenance/:maintenanceId` | PUT | 更新维保记录 | ✅ |
| 11 | `/api/piles/:id/qrcode` | GET | 生成充电桩二维码 | ✅ |

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

**注意**：`GET /api/piles/:id/qrcode` 接口返回的是PNG图片，不是JSON格式，响应头为 `Content-Type: image/png`。

---

## 1. 获取充电桩列表

### 接口信息

- **URL**: `/api/piles`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取充电桩列表，支持分页和多条件筛选

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| stationId | number | 否 | 充电站ID筛选 | - |
| status | number | 否 | 状态筛选：1空闲，2充电中，3连接中，4排队中，5已预约，6故障/离线 | - |
| type | string | 否 | 类型筛选：快充、慢充 | - |
| keyword | string | 否 | 搜索关键词（充电桩ID或类型） | - |

### 请求示例

```
GET /api/piles?page=1&pageSize=10&stationId=1&status=1&type=快充
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取充电桩列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "stationId": 1,
        "stationName": "北京西单充电站",
        "city": "北京市",
        "type": "快充",
        "status": 1,
        "percent": 0,
        "voltage": 380,
        "current": 50,
        "power": 60,
        "temperature": 32,
        "installDate": "2024-01-15"
      }
    ],
    "total": 50
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |
| stationId | number | 所属充电站ID |
| stationName | string | 所属充电站名称 |
| city | string | 所属城市 |
| type | string | 充电桩类型：快充、慢充 |
| status | number | 状态：1空闲，2充电中，3连接中，4排队中，5已预约，6故障/离线 |
| percent | number | 充电进度百分比（0-100） |
| voltage | number | 电压（V） |
| current | number | 电流（A） |
| power | number | 功率（KW） |
| temperature | number | 温度（°C） |
| installDate | string | 安装日期 |
| total | number | 总记录数 |

---

## 2. 获取充电桩详情

### 接口信息

- **URL**: `/api/piles/:id`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取指定充电桩的详细信息

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求示例

```
GET /api/piles/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取充电桩详情成功",
  "data": {
    "id": 1,
    "stationId": 1,
    "stationName": "北京西单充电站",
    "city": "北京市",
    "type": "快充",
    "status": 1,
    "percent": 0,
    "voltage": 380,
    "current": 50,
    "power": 60,
    "temperature": 32,
    "installDate": "2024-01-15"
  }
}
```

---

## 3. 创建充电桩

### 接口信息

- **URL**: `/api/piles`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 创建新的充电桩，会自动更新充电站的快充/慢充数量

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| station_id | number | 是 | 所属充电站ID |
| type | string | 是 | 充电桩类型：快充、慢充 |
| status | number | 否 | 状态：1空闲，2充电中，3连接中，4排队中，5已预约，6故障/离线 | 1 |
| voltage | number | 否 | 电压（V） | - |
| current | number | 否 | 电流（A） | - |
| power | number | 否 | 功率（KW） | - |
| temperature | number | 否 | 温度（°C） | - |
| install_date | string | 否 | 安装日期（格式：YYYY-MM-DD） | - |

### 请求示例

```json
POST /api/piles
Authorization: Bearer <token>
Content-Type: application/json

{
  "station_id": 1,
  "type": "快充",
  "status": 1,
  "voltage": 380,
  "current": 50,
  "power": 60,
  "temperature": 32,
  "install_date": "2024-01-15"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "充电桩创建成功",
  "data": {
    "id": 51
  }
}
```

---

## 4. 更新充电桩

### 接口信息

- **URL**: `/api/piles/:id`
- **Method**: `PUT`
- **需要认证**: 是
- **说明**: 更新充电桩信息，如果类型改变会自动更新充电站的快充/慢充数量

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 充电桩类型：快充、慢充 |
| status | number | 否 | 状态 |
| voltage | number | 否 | 电压（V） |
| current | number | 否 | 电流（A） |
| power | number | 否 | 功率（KW） |
| temperature | number | 否 | 温度（°C） |
| percent | number | 否 | 充电进度百分比（0-100） |
| install_date | string | 否 | 安装日期 |

### 请求示例

```json
PUT /api/piles/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "慢充",
  "status": 2,
  "voltage": 220,
  "current": 32,
  "power": 7,
  "temperature": 30,
  "percent": 50
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "充电桩更新成功",
  "data": null
}
```

---

## 5. 删除充电桩

### 接口信息

- **URL**: `/api/piles/:id`
- **Method**: `DELETE`
- **需要认证**: 是
- **说明**: 删除充电桩，如果存在关联订单则不允许删除

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求示例

```
DELETE /api/piles/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "充电桩删除成功",
  "data": null
}
```

#### 错误响应 (400)

```json
{
  "code": 400,
  "message": "该充电桩存在关联订单，无法删除",
  "data": null
}
```

---

## 6. 更新充电桩状态

### 接口信息

- **URL**: `/api/piles/:id/status`
- **Method**: `PUT`
- **需要认证**: 是
- **说明**: 更新充电桩状态，如果状态不是充电中，会自动清空进度

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 状态：1空闲，2充电中，3连接中，4排队中，5已预约，6故障/离线 |

### 请求示例

```json
PUT /api/piles/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 2
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "充电桩状态更新成功",
  "data": null
}
```

---

## 7. 获取充电桩使用记录

### 接口信息

- **URL**: `/api/piles/:id/usage-records`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取充电桩的使用记录（订单记录）

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |

### 请求示例

```
GET /api/piles/1/usage-records?page=1&pageSize=10
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取使用记录成功",
  "data": {
    "list": [
      {
        "id": "ORD20241120143025",
        "orderNo": "ORD20241120143025",
        "stationName": "北京西单充电站",
        "startTime": "2024-11-20 14:30:25",
        "endTime": "2024-11-20 16:45:30",
        "money": "150.00",
        "pay": "微信支付",
        "status": 3,
        "date": "2024-11-20"
      }
    ],
    "total": 25
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| orderNo | string | 订单号 |
| stationName | string | 充电站名称 |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |
| money | string | 订单金额 |
| pay | string | 支付方式 |
| status | number | 订单状态 |
| date | string | 订单日期 |
| total | number | 总记录数 |

---

## 8. 获取充电桩维保记录

### 接口信息

- **URL**: `/api/piles/:id/maintenance`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取充电桩的维保记录列表

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |

### 请求示例

```
GET /api/piles/1/maintenance?page=1&pageSize=10
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取维保记录成功",
  "data": {
    "list": [
      {
        "id": 1,
        "maintenanceType": "日常维护",
        "maintenancePerson": "张工程师",
        "maintenanceTime": "2024-11-20 10:30:00",
        "maintenanceContent": "检查充电桩各项功能正常，清洁设备表面",
        "maintenanceCost": "500.00",
        "nextMaintenanceTime": "2024-12-20 10:30:00",
        "status": 1,
        "createdAt": "2024-11-20 10:30:00"
      }
    ],
    "total": 5
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 维保记录ID |
| maintenanceType | string | 维保类型：日常维护、故障维修、定期检查 |
| maintenancePerson | string | 维保人员 |
| maintenanceTime | string | 维保时间 |
| maintenanceContent | string | 维保内容 |
| maintenanceCost | string | 维保费用 |
| nextMaintenanceTime | string | 下次维保时间 |
| status | number | 状态：1已完成，2进行中，3已计划 |
| createdAt | string | 创建时间 |
| total | number | 总记录数 |

---

## 9. 创建维保记录

### 接口信息

- **URL**: `/api/piles/:id/maintenance`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 为充电桩创建维保记录

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| maintenance_type | string | 是 | 维保类型：日常维护、故障维修、定期检查 |
| maintenance_person | string | 是 | 维保人员 |
| maintenance_time | string | 是 | 维保时间（格式：YYYY-MM-DD HH:mm:ss） |
| maintenance_content | string | 否 | 维保内容 |
| maintenance_cost | number | 否 | 维保费用 |
| next_maintenance_time | string | 否 | 下次维保时间（格式：YYYY-MM-DD HH:mm:ss） |
| status | number | 否 | 状态：1已完成，2进行中，3已计划 | 1 |

### 请求示例

```json
POST /api/piles/1/maintenance
Authorization: Bearer <token>
Content-Type: application/json

{
  "maintenance_type": "日常维护",
  "maintenance_person": "张工程师",
  "maintenance_time": "2024-11-20 10:30:00",
  "maintenance_content": "检查充电桩各项功能正常，清洁设备表面",
  "maintenance_cost": 500,
  "next_maintenance_time": "2024-12-20 10:30:00",
  "status": 1
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "维保记录创建成功",
  "data": {
    "id": 1
  }
}
```

---

## 10. 更新维保记录

### 接口信息

- **URL**: `/api/piles/:id/maintenance/:maintenanceId`
- **Method**: `PUT`
- **需要认证**: 是
- **说明**: 更新充电桩的维保记录

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |
| maintenanceId | number | 维保记录ID |

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| maintenance_type | string | 否 | 维保类型 |
| maintenance_person | string | 否 | 维保人员 |
| maintenance_time | string | 否 | 维保时间 |
| maintenance_content | string | 否 | 维保内容 |
| maintenance_cost | number | 否 | 维保费用 |
| next_maintenance_time | string | 否 | 下次维保时间 |
| status | number | 否 | 状态 |

### 请求示例

```json
PUT /api/piles/1/maintenance/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "maintenance_content": "更新后的维保内容",
  "status": 1
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "维保记录更新成功",
  "data": null
}
```

---

## 11. 生成充电桩二维码

### 接口信息

- **URL**: `/api/piles/:id/qrcode`
- **Method**: `GET`
- **需要认证**: 是
- **响应类型**: `image/png`
- **说明**: 为指定充电桩生成二维码图片，二维码内容格式为 `PILE_{pileId}`，用于用户扫码充电

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 充电桩ID |

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| token | string | 否 | 认证令牌（URL参数形式，备用） | - |

### 请求示例

```
GET /api/piles/1/qrcode?token=xxx
Authorization: Bearer <token>
```

或

```
GET /api/piles/1/qrcode
Authorization: Bearer <token>
```

### 响应说明

**成功响应 (200)**:

- **Content-Type**: `image/png`
- **Content-Disposition**: `attachment; filename="pile_{id}_qrcode.png"`
- **响应体**: PNG格式的二维码图片二进制数据（Buffer）

**二维码内容格式**:
- 格式：`PILE_{pileId}`
- 示例：`PILE_1`、`PILE_123`

**二维码规格**:
- 尺寸：300x300 像素
- 格式：PNG
- 纠错级别：M（中等）
- 边距：2
- 前景色：#000000（黑色）
- 背景色：#FFFFFF（白色）

### 错误响应

#### 充电桩不存在 (404)

```json
{
  "code": 404,
  "message": "充电桩不存在",
  "data": null
}
```

#### 参数错误 (400)

```json
{
  "code": 400,
  "message": "充电桩ID无效",
  "data": null
}
```

#### 服务器错误 (500)

```json
{
  "code": 500,
  "message": "生成二维码失败",
  "data": null
}
```

### 使用说明

1. **生成二维码**: 调用接口获取二维码图片
2. **下载二维码**: 前端可以通过 `<img>` 标签显示，或通过 `download` 属性下载
3. **打印二维码**: 将二维码图片打印后粘贴到充电桩上
4. **用户扫码**: 用户使用移动端应用扫描二维码，识别格式为 `PILE_{pileId}`
5. **扫码充电**: 移动端识别二维码后，自动跳转到扫码充电页面并开始充电流程

### 前端集成示例

#### 显示二维码

```typescript
// 获取二维码URL
const qrCodeUrl = generatePileQRCodeApi(pileId);

// 在img标签中显示
<img :src="qrCodeUrl" alt="充电桩二维码" />
```

#### 下载二维码

```typescript
// 下载二维码文件
await downloadPileQRCode(pileId);
```

#### 打印二维码

```typescript
// 打开新窗口打印
const printWindow = window.open('', '_blank');
printWindow.document.write(`
  <html>
    <head><title>充电桩二维码</title></head>
    <body>
      <img src="${qrCodeUrl}" alt="充电桩二维码" />
    </body>
  </html>
`);
printWindow.print();
```

### 业务场景

1. **管理端生成**: 管理员在充电桩管理页面点击"生成二维码"按钮
2. **预览下载**: 弹出对话框显示二维码预览，支持下载和打印
3. **现场粘贴**: 将下载的二维码打印后粘贴到对应充电桩上
4. **用户扫码**: 用户到达充电站后，使用手机扫描充电桩上的二维码
5. **自动识别**: 应用识别二维码内容（`PILE_{pileId}`），自动获取充电桩信息
6. **开始充电**: 用户确认后开始充电流程

### 注意事项

1. **二维码格式**: 二维码内容必须严格按照 `PILE_{pileId}` 格式生成
2. **充电桩ID**: 必须是有效的充电桩ID，充电桩必须存在于数据库中
3. **认证要求**: 生成二维码需要管理员权限（已登录且认证通过）
4. **图片格式**: 返回的是PNG格式的二进制数据，不是JSON格式
5. **缓存控制**: 建议在URL中添加时间戳参数防止缓存（前端处理）
6. **错误处理**: 如果充电桩不存在或生成失败，会返回JSON格式的错误信息

### 二维码内容解析规则（移动端）

移动端扫码后，支持以下格式的二维码内容识别：

1. **格式1（推荐）**: `PILE_123` → 解析得到 `pileId = 123`
2. **格式2**: `123`（纯数字） → 直接作为 `pileId`
3. **格式3**: `{"pileId": 123}` 或 `{"id": 123}`（JSON格式） → 解析JSON获取ID

移动端扫码接口会根据上述规则自动识别充电桩ID。

---

## 充电桩状态说明

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 1 | 空闲中 | 充电桩空闲，可以使用 |
| 2 | 充电中 | 正在充电 |
| 3 | 连接中 | 已连接但未开始充电 |
| 4 | 排队中 | 等待充电 |
| 5 | 已预约 | 已被预约 |
| 6 | 故障/离线 | 故障或离线状态 |

---

## 维保类型说明

| 类型 | 说明 |
|------|------|
| 日常维护 | 日常的清洁、检查等维护工作 |
| 故障维修 | 设备故障后的维修工作 |
| 定期检查 | 定期的设备检查和保养 |

---

## 维保状态说明

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 1 | 已完成 | 维保工作已完成 |
| 2 | 进行中 | 维保工作正在进行 |
| 3 | 已计划 | 维保工作已计划但未开始 |

---

## 数据来源说明

### 充电桩数据来源

- 基于 `pile` 表存储的充电桩信息
- 关联 `station` 表获取充电站信息
- 创建/删除/更新类型时会自动更新充电站的快充/慢充数量

### 使用记录数据来源

- 基于 `order` 表，通过 `equipment_no` 字段关联充电桩ID
- 只统计该充电桩的订单记录

### 维保记录数据来源

- 基于 `pile_maintenance` 表存储的维保记录
- 关联 `pile` 表获取充电桩信息

---

## 业务逻辑说明

### 1. 充电桩创建逻辑

- 创建充电桩时，会根据类型（快充/慢充）自动更新充电站的 `fast` 或 `slow` 字段
- 默认状态为1（空闲中）
- 默认进度为0

### 2. 充电桩更新逻辑

- 如果更新类型（快充/慢充），会自动调整充电站的快充/慢充数量
- 更新状态时，如果状态不是充电中（2），会自动清空进度

### 3. 充电桩删除逻辑

- 删除前会检查是否存在关联订单
- 如果存在关联订单，不允许删除
- 删除成功后会更新充电站的快充/慢充数量

### 4. 维保记录管理

- 维保记录与充电桩关联
- 支持记录维保类型、人员、时间、内容、费用等信息
- 可以设置下次维保时间，便于维保计划管理

### 5. 二维码生成逻辑

- 为每个充电桩生成唯一的二维码
- 二维码内容格式：`PILE_{pileId}`
- 使用 `qrcode` 库生成PNG格式图片
- 尺寸：300x300像素，中等纠错级别
- 生成的二维码用于粘贴到充电桩上，供用户扫码充电

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
  "message": "充电桩不存在",
  "data": null
}
```

---

## 注意事项

1. **数据完整性**: 删除充电桩前会检查关联订单，存在订单时不允许删除
2. **自动更新**: 创建/删除/更新充电桩类型时会自动更新充电站的快充/慢充数量
3. **状态管理**: 更新状态为非充电中时，会自动清空充电进度
4. **类型限制**: 充电桩类型必须为"快充"或"慢充"
5. **状态范围**: 充电桩状态必须在1-6之间
6. **维保必填**: 创建维保记录时，维保类型、维保人员和维保时间为必填项
7. **二维码格式**: 二维码内容格式为 `PILE_{pileId}`，必须严格按照此格式生成

---

## 前端集成说明

### 充电桩管理页面功能对应

1. **充电桩列表**: 使用 `GET /api/piles` 接口
2. **充电桩详情**: 使用 `GET /api/piles/:id` 接口
3. **创建充电桩**: 使用 `POST /api/piles` 接口
4. **更新充电桩**: 使用 `PUT /api/piles/:id` 接口
5. **删除充电桩**: 使用 `DELETE /api/piles/:id` 接口
6. **更新状态**: 使用 `PUT /api/piles/:id/status` 接口
7. **使用记录**: 使用 `GET /api/piles/:id/usage-records` 接口
8. **维保记录**: 使用 `GET /api/piles/:id/maintenance` 接口
9. **创建维保**: 使用 `POST /api/piles/:id/maintenance` 接口
10. **更新维保**: 使用 `PUT /api/piles/:id/maintenance/:maintenanceId` 接口
11. **生成二维码**: 使用 `GET /api/piles/:id/qrcode` 接口

### 数据展示建议

- **状态标识**: 使用不同颜色标签区分不同状态
- **类型标识**: 使用标签区分快充和慢充
- **实时数据**: 电压、电流、功率、温度等实时数据显示
- **进度显示**: 充电中时显示充电进度百分比
- **记录展示**: 使用时间线组件展示使用记录和维保记录
- **二维码管理**: 在充电桩卡片上提供"生成二维码"按钮，方便生成和下载二维码

### 二维码功能集成

#### 页面位置

在充电桩监控页面（`apps/admin/src/views/chargingstation/Fault.vue`）中，每个充电桩卡片的操作区域添加"生成二维码"按钮。

#### 功能实现

1. **点击按钮**: 调用 `openQRCodeDialog(pileId)` 函数
2. **显示对话框**: 弹出二维码预览对话框
3. **加载二维码**: 使用 `generatePileQRCodeApi(pileId)` 获取二维码URL
4. **预览显示**: 在对话框中显示二维码图片
5. **下载功能**: 点击"下载二维码"按钮，调用 `downloadPileQRCode(pileId)` 函数
6. **打印功能**: 点击"打印二维码"按钮，打开新窗口打印二维码

#### 实现文件

- **后端服务**: `apps/server/src/services/pileService.ts` - `generatePileQRCodeService` 函数
- **后端控制器**: `apps/server/src/controllers/pileController.ts` - `generatePileQRCodeController` 函数
- **后端路由**: `apps/server/src/routes/pileRoutes.ts` - `/api/piles/:id/qrcode` 路由
- **前端API**: `apps/admin/src/api/pile.ts` - `generatePileQRCodeApi` 和 `downloadPileQRCode` 函数
- **前端页面**: `apps/admin/src/views/chargingstation/Fault.vue` - 二维码对话框和相关逻辑

---

## 更新日志

### 2024-11-20

- **新增**: 添加第11个接口 - 生成充电桩二维码（`GET /api/piles/:id/qrcode`）
- **功能**: 支持为充电桩生成二维码，二维码内容格式为 `PILE_{pileId}`
- **用途**: 二维码用于粘贴到充电桩上，供用户扫码充电
- **前端**: 在充电桩监控页面添加"生成二维码"按钮和预览对话框
- **文档**: 更新API文档，添加二维码生成接口的详细说明