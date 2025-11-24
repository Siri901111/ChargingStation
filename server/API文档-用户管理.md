# 用户管理接口文档

## 接口总览

用户管理模块包含 **7个核心接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 | 权限要求 |
|------|---------|------|----------|----------|----------|
| 1 | `/api/login` | POST | 用户登录 | ❌ | 无 |
| 2 | `/api/register` | POST | 用户注册 | ❌ | 无 |
| 3 | `/api/permissionList` | POST | 获取用户列表（分页、搜索） | ✅ | 无 |
| 4 | `/api/userAuth` | POST | 获取用户权限（菜单和按钮） | ✅ | 无 |
| 5 | `/api/setAuth` | POST | 设置用户权限 | ✅ | 仅管理员 |
| 6 | `/api/deleteUser` | POST | 删除用户 | ✅ | 仅管理员 |
| 7 | `/api/toggleUserStatus` | POST | 禁用/启用用户 | ✅ | 仅管理员 |

---

## 通用说明

### 请求头

需要认证的接口都需要在请求头中携带认证令牌：

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

## 1. 用户登录

### 接口信息

- **URL**: `/api/login`
- **Method**: `POST`
- **需要认证**: 否

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户账号 |
| password | string | 是 | 用户密码 |

### 请求示例

```json
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "系统管理员",
      "roles": ["admin"]
    },
    "menulist": [
      {
        "name": "数据看板",
        "url": "/dashboard",
        "icon": "DataLine"
      }
    ],
    "btnAuth": ["all", "add", "edit", "delete"]
  }
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "用户名或密码错误",
  "data": null
}
```

---

## 2. 用户注册

### 接口信息

- **URL**: `/api/register`
- **Method**: `POST`
- **需要认证**: 否

### 请求参数（Body）

#### 必填参数

| 参数名 | 类型 | 说明 | 验证规则 |
|--------|------|------|----------|
| account | string | 账号 | 4-20位字母、数字或下划线 |
| password | string | 密码 | 至少6位 |
| name | string | 姓名 | 不能为空 |

#### 可选参数

| 参数名 | 类型 | 说明 | 验证规则 |
|--------|------|------|----------|
| phone | string | 手机号 | 11位手机号格式 |
| id_no | string | 身份证号 | 18位身份证格式 |
| position | string | 职位 | 无 |
| department | string | 部门 | 无 |

### 请求示例

```json
POST /api/register
Content-Type: application/json

{
  "account": "testuser",
  "password": "123456",
  "name": "测试用户",
  "phone": "13800138000",
  "id_no": "110101199001011234",
  "position": "测试工程师",
  "department": "技术部"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 6,
    "account": "testuser",
    "name": "测试用户",
    "phone": "13800138000",
    "position": "测试工程师",
    "department": "技术部",
    "page_authority": "user"
  }
}
```

### 默认设置

注册成功后，新用户将获得：
- **状态**: 启用 (status = 1)
- **权限**: 普通用户 (page_authority = 'user')
- **按钮权限**: 仅添加 (btn_authority = 'add')
- **角色ID**: 3 (普通用户)

---

## 3. 获取用户列表

### 接口信息

- **URL**: `/api/permissionList`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| name | string | 否 | 姓名（模糊搜索） | - |
| department | string | 否 | 部门（精确匹配） | - |

### 请求示例

```json
POST /api/permissionList
Authorization: Bearer <token>
Content-Type: application/json

{
  "page": 1,
  "pageSize": 10,
  "name": "张",
  "department": "运营部"
}
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
        "account": "admin",
        "name": "系统管理员",
        "phone": "13800138000",
        "idNo": "110101199001011234",
        "position": "系统管理员",
        "department": "总裁办",
        "pageAuthority": "admin",
        "btnAuthority": "all,add,edit,delete"
      }
    ],
    "total": 5
  }
}
```

---

## 4. 获取用户权限

### 接口信息

- **URL**: `/api/userAuth`
- **Method**: `POST`
- **需要认证**: 是

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageAuthority | string | 否 | 页面权限类型（admin/manager/user）。如果不提供，则返回当前登录用户的权限菜单。如果提供，只有管理员可以预览其他权限级别。 |

### 请求示例

```json
POST /api/userAuth
Authorization: Bearer <token>
Content-Type: application/json

{
  "pageAuthority": "admin"
}
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
          }
        ]
      }
    ],
    "btn": ["all", "add", "edit", "delete"]
  }
}
```

### 权限级别说明

#### admin（管理员）
- **菜单数量**: 9个主菜单（包含系统设置、招商管理等）
- **按钮权限**: `["all", "add", "edit", "delete"]`

#### manager（运营专员）
- **菜单数量**: 7个主菜单（无系统设置、招商管理）
- **按钮权限**: `["add", "edit"]`

#### user（普通用户）
- **菜单数量**: 6个主菜单（基础功能）
- **按钮权限**: `["add"]`

---

## 5. 设置用户权限

### 接口信息

- **URL**: `/api/setAuth`
- **Method**: `POST`
- **需要认证**: 是
- **权限要求**: 仅管理员

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 要设置权限的用户账号 |
| btnList | string[] | 是 | 按钮权限列表，如：["add", "edit", "delete"] |
| pageList | string[] | 是 | 页面权限列表（菜单URL数组） |

### 请求示例

```json
POST /api/setAuth
Authorization: Bearer <token>
Content-Type: application/json

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

### 权限级别判断规则

系统会根据 `pageList` 中包含的菜单URL自动判断权限级别：

- **admin（管理员）**: 包含 `/system` 或 `/document`
- **manager（运营专员）**: 包含 `/chargingstation/revenue`、`/operations/total` 或 `/operations/orders`
- **user（普通用户）**: 不包含上述特殊菜单

---

## 6. 删除用户

### 接口信息

- **URL**: `/api/deleteUser`
- **Method**: `POST`
- **需要认证**: 是
- **权限要求**: 仅管理员

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 要删除的用户账号 |

### 请求示例

```json
POST /api/deleteUser
Authorization: Bearer <token>
Content-Type: application/json

{
  "account": "user1"
}
```

### 安全限制

1. **权限要求**: 只有管理员（admin）可以删除用户
2. **不能删除自己**: 不能删除当前登录的账号
3. **不能删除系统管理员**: 不能删除账号为 `admin` 的系统管理员
4. **删除操作不可逆**: 删除后用户数据将永久删除

---

## 7. 禁用/启用用户

### 接口信息

- **URL**: `/api/toggleUserStatus`
- **Method**: `POST`
- **需要认证**: 是
- **权限要求**: 仅管理员

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 要禁用/启用的用户账号 |

### 请求示例

```json
POST /api/toggleUserStatus
Authorization: Bearer <token>
Content-Type: application/json

{
  "account": "user1"
}
```

### 响应示例

#### 禁用用户

```json
{
  "code": 200,
  "message": "用户已禁用",
  "data": {
    "status": 0
  }
}
```

#### 启用用户

```json
{
  "code": 200,
  "message": "用户已启用",
  "data": {
    "status": 1
  }
}
```

### 状态说明

| status 值 | 说明 |
|-----------|------|
| 0 | 已禁用（用户无法登录） |
| 1 | 已启用（用户可以正常登录） |

---

---

## 注意事项

1. **密码安全**: 密码会经过 bcrypt 加密存储，不会明文保存
2. **权限控制**: 管理员操作需要验证当前用户权限
3. **数据验证**: 所有输入参数都会进行格式验证
4. **系统保护**: 系统管理员账号受保护，无法删除或禁用
5. **操作日志**: 建议记录重要操作的日志（如删除用户、修改权限等）

