# 获取用户权限接口文档

## 接口信息

- **URL**: `/api/userAuth`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **需要认证**: 是（需要在请求头中携带 token）

## 请求头

```
Authorization: Bearer <token>
或
token: <token>
```

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageAuthority | string | 否 | 页面权限类型（admin/manager/user）。如果不提供，则返回当前登录用户的权限菜单。如果提供，只有管理员可以预览其他权限级别，普通用户只能查看自己的权限。 |

## 请求示例

```json
{
  "pageAuthority": "admin"
}
```

## 响应示例

### 成功响应 (200)

#### admin 权限响应

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "name": "数据看板",
        "url": "/dashboard",
        "icon": "DataLine"
      },
      {
        "name": "充电站管理",
        "url": "/chargingstation",
        "icon": "Lightning",
        "children": [
          {
            "name": "充电站监控",
            "url": "/chargingstation/monitor",
            "icon": "VideoCamera"
          },
          {
            "name": "营收统计",
            "url": "/chargingstation/revenue",
            "icon": "DataAnalysis"
          },
          {
            "name": "充电桩管理",
            "url": "/chargingstation/fault",
            "icon": "Warning"
          }
        ]
      },
      {
        "name": "电子地图",
        "url": "/map",
        "icon": "MapLocation"
      },
      {
        "name": "运营管理",
        "url": "/operations",
        "icon": "Files",
        "children": [
          {
            "name": "订单管理",
            "url": "/operations/orders",
            "icon": "DocumentCopy"
          },
          {
            "name": "订单详情",
            "url": "/operations/detail",
            "icon": "Share"
          },
          {
            "name": "计费管理",
            "url": "/operations/total",
            "icon": "Money"
          }
        ]
      },
      {
        "name": "报警管理",
        "url": "/alarm",
        "icon": "Phone"
      },
      {
        "name": "会员卡管理",
        "url": "/equipment",
        "icon": "Magnet"
      },
      {
        "name": "招商管理",
        "url": "/document",
        "icon": "Document"
      },
      {
        "name": "系统设置",
        "url": "/system",
        "icon": "Setting"
      },
      {
        "name": "个人中心",
        "url": "/personal",
        "icon": "User"
      }
    ],
    "btn": ["all", "add", "edit", "delete"]
  }
}
```

#### manager 权限响应

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "name": "数据看板",
        "url": "/dashboard",
        "icon": "DataLine"
      },
      {
        "name": "充电站管理",
        "url": "/chargingstation",
        "icon": "Lightning",
        "children": [
          {
            "name": "充电站监控",
            "url": "/chargingstation/monitor",
            "icon": "VideoCamera"
          },
          {
            "name": "营收统计",
            "url": "/chargingstation/revenue",
            "icon": "DataAnalysis"
          },
          {
            "name": "充电桩管理",
            "url": "/chargingstation/fault",
            "icon": "Warning"
          }
        ]
      },
      {
        "name": "电子地图",
        "url": "/map",
        "icon": "MapLocation"
      },
      {
        "name": "运营管理",
        "url": "/operations",
        "icon": "Files",
        "children": [
          {
            "name": "订单管理",
            "url": "/operations/orders",
            "icon": "DocumentCopy"
          },
          {
            "name": "订单详情",
            "url": "/operations/detail",
            "icon": "Share"
          },
          {
            "name": "计费管理",
            "url": "/operations/total",
            "icon": "Money"
          }
        ]
      },
      {
        "name": "报警管理",
        "url": "/alarm",
        "icon": "Phone"
      },
      {
        "name": "会员卡管理",
        "url": "/equipment",
        "icon": "Magnet"
      },
      {
        "name": "个人中心",
        "url": "/personal",
        "icon": "User"
      }
    ],
    "btn": ["add", "edit"]
  }
}
```

#### user 权限响应

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "name": "数据看板",
        "url": "/dashboard",
        "icon": "DataLine"
      },
      {
        "name": "充电站管理",
        "url": "/chargingstation",
        "icon": "Lightning",
        "children": [
          {
            "name": "充电站监控",
            "url": "/chargingstation/monitor",
            "icon": "VideoCamera"
          },
          {
            "name": "充电桩管理",
            "url": "/chargingstation/fault",
            "icon": "Warning"
          }
        ]
      },
      {
        "name": "电子地图",
        "url": "/map",
        "icon": "MapLocation"
      },
      {
        "name": "报警管理",
        "url": "/alarm",
        "icon": "Phone"
      },
      {
        "name": "会员卡管理",
        "url": "/equipment",
        "icon": "Magnet"
      },
      {
        "name": "个人中心",
        "url": "/personal",
        "icon": "User"
      }
    ],
    "btn": ["add"]
  }
}
```

### 错误响应

#### 1. 参数缺失 (400)

```json
{
  "code": 400,
  "message": "权限参数不能为空",
  "data": null
}
```

#### 2. 未认证 (401)

```json
{
  "code": 401,
  "message": "未提供认证令牌",
  "data": null
}
```

#### 3. 服务器错误 (500)

```json
{
  "code": 500,
  "message": "获取用户权限失败",
  "data": null
}
```

## 响应字段说明

### list 数组（菜单列表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| name | string | 菜单名称 |
| url | string | 菜单路由地址 |
| icon | string | 菜单图标 |
| children | array | 子菜单（可选） |

### btn 数组（按钮权限）

| 值 | 说明 |
|----|------|
| all | 全部权限 |
| add | 添加权限 |
| edit | 编辑权限 |
| delete | 删除权限 |

## 权限级别说明

### admin（管理员）
- **菜单数量**: 9个主菜单（包含系统设置、招商管理等）
- **按钮权限**: `["all", "add", "edit", "delete"]`
- **说明**: 拥有全部功能权限

### manager（运营专员）
- **菜单数量**: 7个主菜单（无系统设置、招商管理）
- **按钮权限**: `["add", "edit"]`
- **说明**: 可以添加和编辑，但不能删除

### user（普通用户）
- **菜单数量**: 6个主菜单（基础功能）
- **按钮权限**: `["add"]`
- **说明**: 只能查看和添加，不能编辑和删除

## 使用示例

### 使用 Apifox 测试

1. 先登录获取 token
2. 创建新接口：`POST /api/userAuth`
3. 设置请求头：
   - `Authorization: Bearer <你的token>`
   - 或 `token: <你的token>`
4. 设置请求体：
```json
{
  "pageAuthority": "admin"
}
```
5. 发送请求

### 使用 curl 测试

```bash
curl -X POST http://localhost:3001/api/userAuth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <你的token>" \
  -d '{
    "pageAuthority": "admin"
  }'
```

## 使用场景

1. **登录后获取菜单**: 不传 pageAuthority 参数，返回当前登录用户的菜单和权限
2. **权限设置页面**: 管理员可以传入 pageAuthority 预览不同权限级别的菜单
3. **菜单渲染**: 根据返回的菜单动态渲染侧边栏

## 安全说明

### 权限控制规则

1. **不传 pageAuthority**: 返回当前登录用户自己的权限菜单（所有用户都可以）
2. **传入 pageAuthority**:
   - **管理员（admin）**: 可以预览任何权限级别的菜单（用于权限设置页面）
   - **非管理员**: 只能查看自己的权限级别，如果传入其他权限级别会返回 403 错误

### 示例场景

#### 场景1: 普通用户登录后获取菜单
```json
// 请求（不传 pageAuthority）
POST /api/userAuth
{}
// 返回当前用户的菜单（user 权限）
```

#### 场景2: 管理员预览不同权限级别
```json
// 请求（管理员 token）
POST /api/userAuth
{
  "pageAuthority": "manager"
}
// 返回 manager 权限的菜单（管理员可以预览）
```

#### 场景3: 普通用户尝试查看其他权限（会被拒绝）
```json
// 请求（普通用户 token，但传入 admin）
POST /api/userAuth
{
  "pageAuthority": "admin"
}
// 返回 403 错误：无权查看其他权限级别的菜单
```

## 注意事项

1. 该接口用于获取指定权限级别对应的菜单和按钮权限
2. 主要用于权限设置功能，展示不同权限级别的菜单结构
3. 返回的菜单结构与前端路由配置保持一致
4. 需要认证才能访问

