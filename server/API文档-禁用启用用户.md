# 禁用/启用用户接口文档

## 接口信息

- **URL**: `/api/toggleUserStatus`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **需要认证**: 是（需要在请求头中携带 token）
- **权限要求**: 仅管理员可以禁用/启用用户

## 请求头

```
Authorization: Bearer <token>
或
token: <token>
```

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 要禁用/启用的用户账号 |

## 请求示例

```json
{
  "account": "user1"
}
```

## 响应示例

### 成功响应 (200)

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

### 错误响应

#### 1. 参数缺失 (400)

```json
{
  "code": 400,
  "message": "账号不能为空",
  "data": null
}
```

#### 2. 不能修改自己 (400)

```json
{
  "code": 400,
  "message": "不能修改自己的账号状态",
  "data": null
}
```

#### 3. 不能禁用系统管理员 (400)

```json
{
  "code": 400,
  "message": "不能禁用系统管理员账号",
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
  "message": "只有管理员可以禁用/启用用户",
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

## 状态说明

| status 值 | 说明 |
|-----------|------|
| 0 | 已禁用（用户无法登录） |
| 1 | 已启用（用户可以正常登录） |

## 使用示例

### 使用 Apifox 测试

1. 使用管理员账号登录获取 token
2. 创建新接口：`POST /api/toggleUserStatus`
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
curl -X POST http://localhost:3001/api/toggleUserStatus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <管理员token>" \
  -d '{
    "account": "user1"
  }'
```

## 功能说明

### 禁用用户
- 用户状态变为 `0`（禁用）
- 用户无法登录系统
- 用户数据保留，只是无法访问

### 启用用户
- 用户状态变为 `1`（启用）
- 用户可以正常登录系统
- 恢复所有功能访问

### 切换逻辑
- 如果用户当前是启用状态（status = 1），调用后变为禁用（status = 0）
- 如果用户当前是禁用状态（status = 0），调用后变为启用（status = 1）

## 安全限制

1. **权限要求**: 只有管理员（admin）可以禁用/启用用户
2. **不能修改自己**: 不能修改当前登录账号的状态
3. **不能禁用系统管理员**: 不能禁用账号为 `admin` 的系统管理员
4. **操作可逆**: 禁用后可以再次启用，数据不会丢失

## 注意事项

1. **禁用用户**: 禁用后用户立即无法登录，但数据保留
2. **启用用户**: 启用后用户可以立即登录
3. **建议流程**: 建议先禁用用户，确认无误后再考虑删除
4. **系统管理员保护**: 系统管理员账号（account = 'admin'）受保护，无法禁用

## 使用场景

1. **临时禁用**: 用户违规或需要调查时，临时禁用账号
2. **恢复访问**: 问题解决后，重新启用用户账号
3. **账号管理**: 定期清理长期不活跃的账号（先禁用，后删除）

