# 个人中心接口文档

## 接口总览

个人中心模块包含 **5个接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/personal/info` | GET | 获取个人信息 | ✅ |
| 2 | `/api/personal/info` | PUT | 更新个人信息 | ✅ |
| 3 | `/api/personal/stats` | GET | 获取个人统计数据 | ✅ |
| 4 | `/api/personal/notices` | GET | 获取通知列表 | ✅ |
| 5 | `/api/personal/change-password` | POST | 修改密码 | ✅ |

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

## 1. 获取个人信息

### 接口信息

- **URL**: `/api/personal/info`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取当前登录用户的个人信息

### 请求示例

```
GET /api/personal/info
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取个人信息成功",
  "data": {
    "id": 1,
    "account": "admin",
    "name": "系统管理员",
    "phone": "13800138000",
    "address": "北京市朝阳区",
    "position": "管理员",
    "department": "总裁办",
    "tags": ["认真", "工作狂", "与人和善", "代码洁癖"],
    "workStatus": 1,
    "avatar": "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
    "status": 1,
    "createdAt": "2024-11-24 14:30:25"
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 用户ID |
| account | string | 账号 |
| name | string | 姓名 |
| phone | string | 电话 |
| address | string | 地址 |
| position | string | 职位 |
| department | string | 部门 |
| tags | array | 个人标签数组 |
| workStatus | number | 在职状态：1工作中，2请假中，3出差中，4年假中 |
| avatar | string | 头像URL |
| status | number | 账号状态：1启用，0禁用 |
| createdAt | string | 创建时间 |

---

## 2. 更新个人信息

### 接口信息

- **URL**: `/api/personal/info`
- **Method**: `PUT`
- **需要认证**: 是
- **说明**: 更新当前登录用户的个人信息

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 姓名 |
| phone | string | 否 | 电话 |
| address | string | 否 | 地址 |
| workStatus | number | 否 | 在职状态：1工作中，2请假中，3出差中，4年假中 |
| tags | array | 否 | 个人标签数组 |

### 请求示例

```json
PUT /api/personal/info
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张三",
  "phone": "13800138001",
  "address": "北京市海淀区",
  "workStatus": 1,
  "tags": ["认真", "工作狂", "与人和善"]
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "个人信息更新成功",
  "data": null
}
```

#### 错误响应 (400)

```json
{
  "code": 400,
  "message": "手机号格式不正确",
  "data": null
}
```

---

## 3. 获取个人统计数据

### 接口信息

- **URL**: `/api/personal/stats`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取当前用户的统计数据（待办事项、指派给我、部门公告、站内信、我指派的）

### 请求示例

```
GET /api/personal/stats
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取统计数据成功",
  "data": {
    "todoCount": 12,
    "assignedToMeCount": 3,
    "noticeCount": 12,
    "messageCount": 3,
    "myAssignedCount": 1
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| todoCount | number | 待办事项数量（待指派的报警） |
| assignedToMeCount | number | 指派给我的数量（处理中且处理人为当前用户） |
| noticeCount | number | 部门公告数量 |
| messageCount | number | 站内信数量 |
| myAssignedCount | number | 我指派的数量（当前用户指派的报警） |

---

## 4. 获取通知列表

### 接口信息

- **URL**: `/api/personal/notices`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取当前用户的通知列表

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |

### 请求示例

```
GET /api/personal/notices?page=1&pageSize=10
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取通知列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "账号注销通知！",
        "content": "员工离职，账号需要注销，请及时处理！",
        "type": "通知",
        "createdAt": "2024-11-24 14:30:25"
      }
    ],
    "total": 10
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 通知ID |
| title | string | 通知标题 |
| content | string | 通知内容 |
| type | string | 通知类型 |
| createdAt | string | 创建时间 |
| total | number | 总记录数 |

---

## 5. 修改密码

### 接口信息

- **URL**: `/api/personal/change-password`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 修改当前登录用户的密码

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | string | 是 | 旧密码 |
| newPassword | string | 是 | 新密码（长度不少于6位） |

### 请求示例

```json
POST /api/personal/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "admin123",
  "newPassword": "newPassword123"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

#### 错误响应 (400)

```json
{
  "code": 400,
  "message": "旧密码不正确",
  "data": null
}
```

---

## 在职状态说明

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 1 | 工作中 | 正常工作中 |
| 2 | 请假中 | 正在请假 |
| 3 | 出差中 | 正在出差 |
| 4 | 年假中 | 正在休年假 |

---

## 数据来源说明

### 个人信息数据来源

- 基于 `user` 表存储的用户信息
- 包含基本信息（姓名、电话、地址等）和扩展信息（个人标签、在职状态、头像等）

### 统计数据来源

- **待办事项**: 从 `alarm` 表统计 `status = 1`（待指派）的报警数量
- **指派给我**: 从 `alarm` 表统计 `status = 2`（处理中）且 `handler` 为当前用户姓名的报警数量
- **部门公告**: 从 `notice` 表统计通知数量（可根据部门筛选）
- **站内信**: 从 `notice` 表统计个人通知数量（可根据用户筛选）
- **我指派的**: 从 `alarm` 表统计当前用户指派的报警数量

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
  "message": "参数错误",
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

1. **权限控制**: 所有接口都需要认证，用户ID从JWT中获取
2. **数据安全**: 修改密码需要验证旧密码，新密码长度不少于6位
3. **手机号验证**: 更新手机号时会验证格式（11位数字，1开头）
4. **在职状态**: 状态值必须在1-4之间
5. **个人标签**: 支持多个标签，以数组形式存储
6. **头像**: 如果没有设置头像，会使用默认头像URL（基于用户ID生成）

---

## 前端集成说明

### 个人中心页面功能对应

1. **个人信息展示**: 使用 `GET /api/personal/info` 接口获取个人信息
2. **完善个人资料**: 使用 `PUT /api/personal/info` 接口更新个人信息
   - 基本信息：姓名、电话、地址
   - 在职信息：在职状态
3. **统计数据展示**: 使用 `GET /api/personal/stats` 接口获取统计数据
4. **通知列表**: 使用 `GET /api/personal/notices` 接口获取通知列表
5. **修改密码**: 使用 `POST /api/personal/change-password` 接口修改密码

### 数据展示建议

- **个人信息**: 使用描述列表（Descriptions）组件展示
- **个人标签**: 使用标签（Tag）组件展示
- **统计数据**: 使用徽章（Badge）组件显示数量
- **通知列表**: 使用折叠面板（Collapse）组件展示
- **在职状态**: 使用下拉选择器（Select）组件选择

### 业务逻辑说明

1. **个人信息更新流程**:
   - 用户填写基本信息（姓名、电话、地址）
   - 选择在职状态
   - 提交后更新个人信息

2. **密码修改流程**:
   - 用户输入旧密码和新密码
   - 验证旧密码是否正确
   - 验证新密码长度（不少于6位）
   - 更新密码

3. **统计数据更新**:
   - 统计数据实时从数据库获取
   - 可以根据实际业务需求调整统计逻辑

