# 设置用户权限接口文档

## 接口信息

- **URL**: `/api/setAuth`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **需要认证**: 是（需要在请求头中携带 token）
- **权限要求**: 仅管理员可以设置用户权限

## 请求头

```
Authorization: Bearer <token>
或
token: <token>
```

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 要设置权限的用户账号 |
| btnList | string[] | 是 | 按钮权限列表，如：["add", "edit", "delete"] |
| pageList | string[] | 是 | 页面权限列表（菜单URL数组），如：["/dashboard", "/system"] |

## 请求示例

```json
{
  "account": "manager1",
  "btnList": ["add", "edit"],
  "pageList": [
    "/dashboard",
    "/chargingstation",
    "/chargingstation/monitor",
    "/chargingstation/revenue",
    "/map",
    "/operations",
    "/operations/orders",
    "/alarm",
    "/equipment",
    "/personal"
  ]
}
```

## 响应示例

### 成功响应 (200)

```json
{
  "code": 200,
  "message": "权限设置成功",
  "data": null
}
```

### 错误响应

#### 1. 参数缺失 (400)

```json
{
  "code": 400,
  "message": "账号不能为空",
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

#### 3. 权限不足 (403)

```json
{
  "code": 403,
  "message": "只有管理员可以设置用户权限",
  "data": null
}
```

#### 4. 用户不存在 (404)

```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

## 权限级别判断规则

系统会根据 `pageList` 中包含的菜单URL自动判断权限级别：

### admin（管理员）
- 包含 `/system`（系统设置）
- 或包含 `/document`（招商管理）

### manager（运营专员）
- 包含 `/chargingstation/revenue`（营收统计）
- 或包含 `/operations/total`（计费管理）
- 或包含 `/operations/orders`（订单管理）
- 且不包含系统设置和招商管理

### user（普通用户）
- 不包含上述特殊菜单
- 只有基础功能菜单

## 按钮权限说明

| 值 | 说明 |
|----|------|
| all | 全部权限（包含 add、edit、delete） |
| add | 添加权限 |
| edit | 编辑权限 |
| delete | 删除权限 |

## 使用示例

### 使用 Apifox 测试

1. 使用管理员账号登录获取 token
2. 创建新接口：`POST /api/setAuth`
3. 设置请求头：
   - `Authorization: Bearer <管理员token>`
4. 设置请求体：
```json
{
  "account": "manager1",
  "btnList": ["add", "edit"],
  "pageList": [
    "/dashboard",
    "/chargingstation",
    "/chargingstation/monitor",
    "/chargingstation/revenue",
    "/map",
    "/operations",
    "/operations/orders",
    "/alarm",
    "/equipment",
    "/personal"
  ]
}
```
5. 发送请求

### 使用 curl 测试

```bash
curl -X POST http://localhost:3001/api/setAuth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <管理员token>" \
  -d '{
    "account": "manager1",
    "btnList": ["add", "edit"],
    "pageList": ["/dashboard", "/chargingstation", "/chargingstation/monitor"]
  }'
```

## 注意事项

1. **权限要求**: 只有管理员（admin）可以设置用户权限
2. **权限级别自动判断**: 系统会根据选择的菜单自动判断权限级别
3. **按钮权限**: 按钮权限列表会直接保存，用逗号分隔
4. **不能设置自己**: 虽然接口不限制，但建议前端限制不能设置自己的权限
5. **权限生效**: 设置后，用户需要重新登录才能看到新的菜单和权限

## 常见菜单URL列表

### 管理员菜单
- `/dashboard` - 数据看板
- `/chargingstation` - 充电站管理
- `/chargingstation/monitor` - 充电站监控
- `/chargingstation/revenue` - 营收统计
- `/chargingstation/fault` - 充电桩管理
- `/map` - 电子地图
- `/operations` - 运营管理
- `/operations/orders` - 订单管理
- `/operations/detail` - 订单详情
- `/operations/total` - 计费管理
- `/alarm` - 报警管理
- `/equipment` - 会员卡管理
- `/document` - 招商管理（仅管理员）
- `/system` - 系统设置（仅管理员）
- `/personal` - 个人中心

