# 电子地图接口文档

## 接口总览

电子地图模块包含 **3个接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/mapList` | POST | 获取地图上的充电站列表 | ✅ |
| 2 | `/api/map/stats` | GET | 获取地图统计信息 | ✅ |
| 3 | `/api/map/station` | POST | 通过地图创建充电站 | ✅ |

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
  code: number;        // 状态码：200成功，400参数错误，401未认证，500服务器错误
  message?: string;     // 提示信息
  success?: boolean;    // 成功标识（部分接口）
  data: any;           // 响应数据
}
```

---

## 1. 获取地图上的充电站列表

### 接口信息

- **URL**: `/api/mapList`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 获取所有有坐标信息的充电站列表，用于在地图上显示标记点

### 请求参数（Body）

无参数（可以为空对象）

### 请求示例

```json
POST /api/mapList
Authorization: Bearer <token>
Content-Type: application/json

{}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "success": true,
  "data": [
    {
      "position": [116.395645, 39.90923],
      "title": "北京西单充电站",
      "status": 1,
      "count": 135,
      "id": 1,
      "city": "北京市"
    },
    {
      "position": [121.491121, 31.236222],
      "title": "上海陆家嘴充电站",
      "status": 1,
      "count": 125,
      "id": 2,
      "city": "上海市"
    }
  ]
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| position | array | 位置坐标 [经度, 纬度] |
| title | string | 充电站名称 |
| status | number | 充电站状态：1正常，0禁用 |
| count | number | 充电桩数量 |
| id | number | 充电站ID |
| city | string | 所属城市 |

---

## 2. 获取地图统计信息

### 接口信息

- **URL**: `/api/map/stats`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取地图相关的统计数据

### 请求示例

```
GET /api/map/stats
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取地图统计信息成功",
  "data": {
    "totalStations": 34,
    "maxProvinceName": "北京市",
    "maxProvinceCount": 4,
    "provinceCount": 14,
    "noStationProvinces": 20,
    "accumulatedStation": "北京市(4个)",
    "maxRevenueStation": "北京西单充电站",
    "minRevenueStation": "南宁青秀山充电站",
    "maxFaultStation": "兰州黄河桥充电站"
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| totalStations | number | 累计充电站数量 |
| maxProvinceName | string | 单省份最多充电站的省份名称 |
| maxProvinceCount | number | 单省份最多充电站的数量 |
| provinceCount | number | 充电站遍及省份数量 |
| noStationProvinces | number | 暂无充电站省份数量 |
| accumulatedStation | string | 累计充电站（格式：省份名(数量个)） |
| maxRevenueStation | string | 单日营收最高的充电站名称 |
| minRevenueStation | string | 单日营收最低的充电站名称 |
| maxFaultStation | string | 故障率最高的充电站名称 |

---

## 3. 通过地图创建充电站

### 接口信息

- **URL**: `/api/map/station`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 通过地图表单创建新的充电站

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 站点名称 |
| region | string | 是 | 站点地址 |
| location1 | string | 是 | 经度（-180到180） |
| location2 | string | 是 | 纬度（-90到90） |
| now | boolean | 否 | 是否立即使用（true/false） |
| remarks | string | 否 | 备注信息 |

### 请求示例

```json
POST /api/map/station
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "北京朝阳充电站",
  "region": "北京市朝阳区建国路88号",
  "location1": "116.395645",
  "location2": "39.90923",
  "now": true,
  "remarks": "新建充电站"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "充电站创建成功",
  "data": {
    "id": 35
  }
}
```

#### 错误响应 (400)

```json
{
  "code": 400,
  "message": "经纬度格式不正确",
  "data": null
}
```

---

## 数据来源说明

### 地图充电站数据来源

- 基于 `station` 表存储的充电站信息
- 只返回有经纬度坐标的充电站（`longitude` 和 `latitude` 不为空）
- 关联 `pile` 表统计每个充电站的充电桩数量

### 统计数据来源

- **累计充电站数量**: 从 `station` 表统计总数
- **省份统计**: 按 `city` 字段分组统计
- **营收统计**: 从 `revenue` 表查询单日营收最高和最低的充电站
- **故障统计**: 从 `alarm` 表统计每个充电站的报警数量，找出故障率最高的

### 坐标系统

- 使用WGS84坐标系（GPS坐标系）
- 经度范围：-180 到 180
- 纬度范围：-90 到 90
- 中国境内大致范围：
  - 经度：73°E - 135°E
  - 纬度：18°N - 54°N

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
  "message": "站点名称、地址、经度、纬度不能为空",
  "data": null
}
```

### 未授权响应

```json
{
  "code": 401,
  "message": "未授权，请先登录",
  "data": null
}
```

---

## 注意事项

1. **坐标格式**: 经纬度必须是有效的数字，经度范围-180到180，纬度范围-90到90
2. **数据完整性**: 只有有坐标信息的充电站才会在地图上显示
3. **城市提取**: 创建充电站时会从地址中提取城市信息（简化处理，实际应使用地理编码API）
4. **状态设置**: 如果选择"立即使用"，充电站状态为1（正常），否则为0（禁用）
5. **统计准确性**: 统计数据基于现有数据，如果数据不足可能返回"暂无数据"

---

## 前端集成说明

### 电子地图页面功能对应

1. **地图标记点**: 使用 `POST /api/mapList` 接口获取充电站列表，在地图上显示标记
2. **统计信息展示**: 使用 `GET /api/map/stats` 接口获取统计数据，在右侧面板显示
3. **新增站点**: 使用 `POST /api/map/station` 接口创建新充电站

### 地图组件集成

- 前端使用高德地图（AMap）显示地图
- 标记点使用自定义图标
- 点击标记点显示充电站信息窗口（名称、充电桩数量、状态等）

### 数据展示建议

- **地图标记**: 根据充电站状态使用不同颜色的标记
- **信息窗口**: 显示充电站名称、充电桩数量、状态等信息
- **统计面板**: 使用文本和数字展示各项统计数据
- **表单验证**: 前端应验证经纬度格式和范围

### 业务逻辑说明

1. **地图加载流程**:
   - 页面加载时调用 `POST /api/mapList` 获取充电站列表
   - 在地图上为每个充电站创建标记点
   - 点击标记点显示详细信息

2. **统计信息更新**:
   - 页面加载时调用 `GET /api/map/stats` 获取统计数据
   - 在右侧面板展示各项统计信息

3. **新增站点流程**:
   - 用户在地图上选择位置或手动输入经纬度
   - 填写站点名称、地址等信息
   - 提交表单创建新充电站
   - 创建成功后刷新地图标记点

