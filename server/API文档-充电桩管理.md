# 充电桩管理接口文档

## 接口总览

充电桩管理模块包含 **1个核心接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/currentList` | POST | 获取充电桩实时监控列表 | ✅ |

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

## 1. 获取充电桩实时监控列表

### 接口信息

- **URL**: `/api/currentList`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

无参数，直接发送空对象或省略body。

### 请求示例

```json
POST /api/currentList
Authorization: Bearer <token>
Content-Type: application/json

{}
```

### 响应示例

#### 成功响应 (200)

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

### 字段说明

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

### 业务逻辑

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

### 错误响应

```json
{
  "code": 500,
  "message": "获取充电桩监控列表失败",
  "data": null
}
```

---

## 充电桩状态详解

### 状态枚举

| 状态值 | 状态名称 | 说明 | 显示颜色建议 |
|--------|----------|------|--------------|
| 1 | 空闲中 | 充电桩可用，等待用户使用 | 绿色 |
| 2 | 充电中 | 正在为车辆充电 | 蓝色 |
| 3 | 连接中 | 充电枪已连接，但未开始充电 | 黄色 |
| 4 | 排队中 | 有用户排队等待使用 | 橙色 |
| 5 | 已预约 | 用户已预约，等待到达 | 紫色 |
| 6 | 故障/离线 | 设备故障或网络断开 | 红色 |

### 状态转换流程

```
空闲中(1) → 连接中(3) → 充电中(2) → 空闲中(1)
    ↓           ↑
已预约(5) → 排队中(4)
    ↓
故障/离线(6) ← → 任何状态
```

---

## 使用记录说明

### 记录来源

使用记录来自 `order` 表，通过 `equipment_no` 字段关联充电桩：

```sql
SELECT * FROM order 
WHERE equipment_no = '充电桩ID' 
ORDER BY date DESC 
LIMIT 6
```

### 记录格式

- **时间格式**: `HH:MM:SS`（24小时制）
- **消息格式**: `充电XX度，消费XX元`
- **排序**: 按时间倒序（最新的在前）
- **数量限制**: 最多返回6条记录

### 记录示例

```json
{
  "record": [
    {
      "time": "18:08:33",
      "msg": "充电100度，消费100元"
    },
    {
      "time": "17:27:17",
      "msg": "充电90度，消费90元"
    },
    {
      "time": "16:22:33",
      "msg": "充电70度，消费70元"
    }
  ]
}
```

---

---

## 数据模型说明

### 充电桩表结构

充电桩数据来自 `pile` 表，主要字段包括：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 充电桩ID |
| station_id | BIGINT | 所属充电站ID |
| type | STRING(16) | 充电桩类型（快充/慢充） |
| status | TINYINT | 充电桩状态（1-6） |
| percent | INTEGER | 充电百分比（0-100） |
| voltage | FLOAT | 电压值 |
| current | FLOAT | 电流值 |
| power | FLOAT | 功率值 |
| temperature | FLOAT | 温度值 |
| install_date | DATE | 安装日期 |

### 订单表关联

使用记录来自 `order` 表，关联字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| order_no | STRING(64) | 订单号（主键） |
| user_id | BIGINT | 充电用户ID |
| equipment_no | STRING(64) | 设备编号（充电桩ID） |
| station_id | BIGINT | 充电站ID |
| date | DATE | 订单日期 |
| start_time | DATE | 开始时间 |
| end_time | DATE | 结束时间 |
| money | DECIMAL(10,2) | 消费金额 |
| pay | STRING(20) | 支付方式 |
| status | TINYINT | 订单状态 |

---

## 注意事项

1. **实时数据**: 接口返回的是当前数据库中的实时数据
2. **状态显示**: `percent` 字段仅在充电中（status=2）时显示
3. **使用记录**: 记录数量最多返回6条，按时间倒序排列
4. **数据格式**: 电压、电流、功率、温度等字段已格式化为字符串，包含单位
5. **空数据**: 如果充电站下没有充电桩，`list` 为空数组
6. **性能考虑**: 该接口会查询所有充电站和充电桩数据，建议添加缓存机制
7. **数据一致性**: 充电桩状态应与实际设备状态保持同步
8. **错误处理**: 如果某个充电桩数据异常，不应影响其他充电桩数据的返回

