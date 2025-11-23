# 用户注册接口文档

## 接口信息

- **URL**: `/api/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

## 请求参数

### 必填参数

| 参数名 | 类型 | 说明 | 验证规则 |
|--------|------|------|----------|
| account | string | 账号 | 4-20位字母、数字或下划线 |
| password | string | 密码 | 至少6位 |
| name | string | 姓名 | 不能为空 |

### 可选参数

| 参数名 | 类型 | 说明 | 验证规则 |
|--------|------|------|----------|
| phone | string | 手机号 | 11位手机号格式 |
| id_no | string | 身份证号 | 18位身份证格式 |
| position | string | 职位 | 无 |
| department | string | 部门 | 无 |

## 请求示例

```json
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

## 响应示例

### 成功响应 (200)

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

### 错误响应

#### 1. 参数验证失败 (400)

```json
{
  "code": 400,
  "message": "账号格式不正确，应为4-20位字母、数字或下划线",
  "data": null
}
```

#### 2. 账号已存在 (400)

```json
{
  "code": 400,
  "message": "该账号已被注册",
  "data": null
}
```

#### 3. 手机号已注册 (400)

```json
{
  "code": 400,
  "message": "该手机号已被注册",
  "data": null
}
```

## 验证规则

### 账号 (account)
- 长度：4-20位
- 格式：只能包含字母、数字、下划线
- 示例：`testuser`, `user123`, `test_user`

### 密码 (password)
- 长度：至少6位
- 建议：包含字母和数字

### 手机号 (phone)
- 格式：11位数字
- 规则：以1开头，第二位为3-9
- 示例：`13800138000`, `15912345678`

### 身份证号 (id_no)
- 格式：18位身份证号
- 规则：符合中国身份证号格式

## 默认设置

注册成功后，新用户将获得：
- **状态**: 启用 (status = 1)
- **权限**: 普通用户 (page_authority = 'user')
- **按钮权限**: 仅添加 (btn_authority = 'add')
- **角色ID**: 3 (普通用户)

## 使用示例

### 使用 Apifox 测试

1. 创建新接口：`POST /api/register`
2. 设置请求头：`Content-Type: application/json`
3. 设置请求体：
```json
{
  "account": "newuser",
  "password": "password123",
  "name": "新用户",
  "phone": "13900139000"
}
```
4. 发送请求

### 使用 curl 测试

```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "account": "newuser",
    "password": "password123",
    "name": "新用户",
    "phone": "13900139000"
  }'
```

## 注意事项

1. 密码会经过 bcrypt 加密存储，不会明文保存
2. 返回的用户信息不包含密码字段
3. 注册成功后，用户可以使用注册的账号和密码登录
4. 默认权限为普通用户，如需更高权限需要管理员在系统中修改

