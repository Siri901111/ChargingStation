# 删除用户接口文档

## 接口信息

- **URL**: `/api/deleteUser`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **需要认证**: 是（需要在请求头中携带 token）
- **权限要求**: 仅管理员可以删除用户

## 请求头

```
Authorization: Bearer <token>
或
token: <token>
```

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 要删除的用户账号 |

## 请求示例

```json
{
  "account": "user1"
}
```

## 响应示例

### 成功响应 (200)

```json
{
  "code": 200,
  "message": "用户删除成功",
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

#### 2. 不能删除自己 (400)

```json
{
  "code": 400,
  "message": "不能删除自己的账号",
  "data": null
}
```

#### 3. 不能删除系统管理员 (400)

```json
{
  "code": 400,
  "message": "不能删除系统管理员账号",
  "data": null
}
```

#### 4. 未认证 (401)

```json
{
  "code": 401,
  "message": "未提供认证令牌",
  "data": null
}
```

#### 5. 权限不足 (403)

```json
{
  "code": 403,
  "message": "只有管理员可以删除用户",
  "data": null
}
```

#### 6. 用户不存在 (404)

```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

## 使用示例

### 使用 Apifox 测试

1. 使用管理员账号登录获取 token
2. 创建新接口：`POST /api/deleteUser`
3. 设置请求头：
   - `Authorization: Bearer <管理员token>`
4. 设置请求体：
```json
{
  "account": "user1"
}
```
5. 发送请求

### 使用 curl 测试

```bash
curl -X POST http://localhost:3001/api/deleteUser \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <管理员token>" \
  -d '{
    "account": "user1"
  }'
```

## 安全限制

1. **权限要求**: 只有管理员（admin）可以删除用户
2. **不能删除自己**: 不能删除当前登录的账号
3. **不能删除系统管理员**: 不能删除账号为 `admin` 的系统管理员
4. **删除操作不可逆**: 删除后用户数据将永久删除，请谨慎操作

## 注意事项

1. 删除用户是**不可逆操作**，请确认后再执行
2. 删除用户后，该用户的所有数据将被清除
3. 建议在删除前先禁用用户，确认无误后再删除
4. 系统管理员账号（account = 'admin'）受保护，无法删除

