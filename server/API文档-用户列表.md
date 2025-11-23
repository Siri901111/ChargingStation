# 用户列表接口文档

## 接口信息

- **URL**: `/api/permissionList`
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

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| name | string | 否 | 姓名（模糊搜索） | - |
| department | string | 否 | 部门（精确匹配） | - |

## 请求示例

```json
{
  "page": 1,
  "pageSize": 10,
  "name": "张",
  "department": "运营部"
}
```

## 响应示例

### 成功响应 (200)

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
      },
      {
        "account": "manager1",
        "name": "张运营",
        "phone": "13800138001",
        "idNo": "110101199002021234",
        "position": "运营经理",
        "department": "运营部",
        "pageAuthority": "manager",
        "btnAuthority": "add,edit"
      }
    ],
    "total": 5
  }
}
```

### 错误响应

#### 1. 未认证 (401)

```json
{
  "code": 401,
  "message": "未提供认证令牌",
  "data": null
}
```

#### 2. Token 无效 (401)

```json
{
  "code": 401,
  "message": "无效的认证令牌",
  "data": null
}
```

#### 3. 服务器错误 (500)

```json
{
  "code": 500,
  "message": "获取用户列表失败",
  "data": null
}
```

## 响应字段说明

### list 数组中的用户对象

| 字段名 | 类型 | 说明 |
|--------|------|------|
| account | string | 账号 |
| name | string | 姓名 |
| phone | string | 手机号 |
| idNo | string | 身份证号 |
| position | string | 职位 |
| department | string | 部门 |
| pageAuthority | string | 页面权限（admin/manager/user） |
| btnAuthority | string | 按钮权限（逗号分隔） |

### 分页信息

| 字段名 | 类型 | 说明 |
|--------|------|------|
| list | array | 用户列表 |
| total | number | 总记录数 |

## 使用示例

### 使用 Apifox 测试

1. 先登录获取 token
2. 创建新接口：`POST /api/permissionList`
3. 设置请求头：
   - `Authorization: Bearer <你的token>`
   - 或 `token: <你的token>`
4. 设置请求体：
```json
{
  "page": 1,
  "pageSize": 10,
  "name": "张",
  "department": "运营部"
}
```
5. 发送请求

### 使用 curl 测试

```bash
curl -X POST http://localhost:3001/api/permissionList \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <你的token>" \
  -d '{
    "page": 1,
    "pageSize": 10,
    "name": "张"
  }'
```

## 搜索功能说明

### 姓名搜索
- 支持模糊匹配
- 例如：搜索 "张" 会匹配 "张运营"、"张站长" 等

### 部门筛选
- 精确匹配
- 例如：`"department": "运营部"` 只会返回运营部的用户

### 组合搜索
- 可以同时使用姓名和部门进行筛选
- 例如：搜索姓名包含 "张" 且部门为 "运营部" 的用户

## 注意事项

1. 返回的用户列表不包含密码字段
2. 列表按创建时间倒序排列（最新的在前）
3. 需要管理员或运营专员权限才能访问
4. 分页从 1 开始，不是从 0 开始

