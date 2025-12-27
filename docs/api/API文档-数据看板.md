# 数据看板接口文档

## 接口总览

数据看板模块包含 **4个核心接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/dashboard/electricity-stats` | GET | 获取电量统计数据（折线图） | ✅ |
| 2 | `/api/dashboard/revenue-ratio` | GET | 获取营收占比数据（饼图） | ✅ |
| 3 | `/api/dashboard/device-overview` | GET | 获取设备总览数据（雷达图） | ✅ |
| 4 | `/api/dashboard/device-status` | GET | 获取设备运行状态统计 | ✅ |

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

## 1. 获取电量统计数据

### 接口信息

- **URL**: `/api/dashboard/electricity-stats`
- **Method**: `GET`
- **需要认证**: 是

### 请求示例

```
GET /api/dashboard/electricity-stats
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取电量统计数据成功",
  "data": {
    "xAxis": ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"],
    "series": [
      {
        "name": "总电量",
        "type": "line",
        "smooth": true,
        "data": [120, 132, 101, 134, 90, 230, 210, 145, 156]
      },
      {
        "name": "充电量",
        "type": "line", 
        "smooth": true,
        "data": [85, 95, 78, 98, 65, 180, 165, 110, 125]
      }
    ]
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| xAxis | string[] | X轴时间数据（最近9小时） |
| series | array | 图表系列数据 |
| series[].name | string | 系列名称（总电量/充电量） |
| series[].type | string | 图表类型（line） |
| series[].smooth | boolean | 是否平滑曲线 |
| series[].data | number[] | 电量数据（单位：kw） |

### 业务逻辑

- 返回最近9小时的电量统计数据
- 包含总电量和充电量两个系列
- 数据按小时统计，实时更新

---

## 2. 获取营收占比数据

### 接口信息

- **URL**: `/api/dashboard/revenue-ratio`
- **Method**: `GET`
- **需要认证**: 是

### 请求示例

```
GET /api/dashboard/revenue-ratio
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取营收占比数据成功",
  "data": {
    "list": [
      {
        "name": "电费收入",
        "value": 45000
      },
      {
        "name": "停车费收入",
        "value": 12000
      },
      {
        "name": "服务费收入",
        "value": 8000
      },
      {
        "name": "会员储值",
        "value": 15000
      }
    ]
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| list | array | 营收占比数据列表 |
| list[].name | string | 营收类型名称 |
| list[].value | number | 营收金额（单位：元） |

### 业务逻辑

- 统计最近一个月的各类营收数据
- 包含电费收入、停车费收入、服务费收入、会员储值四个类别
- 用于饼图展示营收结构

---

## 3. 获取设备总览数据

### 接口信息

- **URL**: `/api/dashboard/device-overview`
- **Method**: `GET`
- **需要认证**: 是

### 请求示例

```
GET /api/dashboard/device-overview
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取设备总览数据成功",
  "data": {
    "list": [45, 120, 15, 8, 12, 3]
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| list | number[] | 设备状态统计数据，按顺序为：[闲置数, 使用数, 故障数, 维修数, 更换数, 报废数] |

### 数据说明

数组中各位置对应的设备状态：
- `list[0]` - 闲置数（空闲中的充电桩）
- `list[1]` - 使用数（充电中和连接中的充电桩）
- `list[2]` - 故障数（故障/离线的充电桩）
- `list[3]` - 维修数（维护中的充电桩）
- `list[4]` - 更换数（待维修的充电桩）
- `list[5]` - 报废数（最近30天严重报警的设备数）

### 业务逻辑

- 统计各种状态的充电桩数量
- 用于雷达图展示设备状态分布
- 实时反映设备运行状况

---

## 4. 获取设备运行状态统计

### 接口信息

- **URL**: `/api/dashboard/device-status`
- **Method**: `GET`
- **需要认证**: 是

### 请求示例

```
GET /api/dashboard/device-status
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取设备状态统计成功",
  "data": {
    "totalPiles": 3398,
    "usingPiles": 2263,
    "faultPiles": 9,
    "todayRevenue": 125680.50
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| totalPiles | number | 充电桩总数 |
| usingPiles | number | 正在使用的充电桩数（充电中+连接中） |
| faultPiles | number | 异常设备数（故障/离线） |
| todayRevenue | number | 今日营收（单位：元） |

### 业务逻辑

- 统计充电桩使用率相关数据
- 显示设备异常情况
- 展示当日营收情况
- 用于首页设备运行状态展示

---

## 数据来源说明

### 电量统计数据
- 基于充电订单数据统计每小时电量消耗
- 区分总电量和实际充电量
- 数据按小时聚合，实时更新

### 营收占比数据
- 来源于 `revenue` 表的各类营收字段
- 统计最近一个月的累计数据
- 包含电费、停车费、服务费、会员储值四个维度

### 设备总览数据
- 基于 `pile` 表的设备状态统计
- 结合 `alarm` 表统计严重故障设备
- 实时反映设备运行状态分布

### 设备状态统计
- 充电桩总数和使用数来自 `pile` 表
- 异常设备数基于状态筛选
- 今日营收来自 `revenue` 表当日数据

---

## 错误响应

### 通用错误响应

```json
{
  "code": 500,
  "message": "获取数据失败",
  "data": null
}
```

### 认证错误响应

```json
{
  "code": 401,
  "message": "未提供认证令牌",
  "data": null
}
```

---

## 注意事项

1. **数据实时性**: 所有统计数据都是实时计算的，反映当前系统状态
2. **性能优化**: 建议对统计数据进行缓存，避免频繁查询数据库
3. **数据准确性**: 电量统计等数据需要与实际设备数据保持同步
4. **时区处理**: 时间相关统计需要考虑服务器时区设置
5. **异常处理**: 当数据库中没有数据时，返回合理的默认值
6. **权限控制**: 所有接口都需要认证，确保数据安全
