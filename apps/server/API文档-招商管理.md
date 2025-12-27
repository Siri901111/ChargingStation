# 招商管理接口文档

## 接口总览

招商管理模块包含 **7个接口**：

| 序号 | 接口路径 | 方法 | 功能说明 | 需要认证 |
|------|---------|------|----------|----------|
| 1 | `/api/document` | GET | 获取文章类型列表 | ✅ |
| 2 | `/api/document` | POST | 创建文章 | ✅ |
| 3 | `/api/document/list` | GET | 获取文章列表（分页、筛选） | ✅ |
| 4 | `/api/document/:id` | GET | 获取文章详情 | ✅ |
| 5 | `/api/document/:id` | PUT | 更新文章 | ✅ |
| 6 | `/api/document/:id` | DELETE | 删除文章 | ✅ |
| 7 | `/api/document/:id/publish` | POST | 发布文章 | ✅ |

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

## 1. 获取文章类型列表

### 接口信息

- **URL**: `/api/document`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取文章类型、重要程度、发布渠道的选项列表

### 请求示例

```
GET /api/document
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "type": ["招商类", "广告类", "公告类", "提示类", "日常类", "告警类", "其他"],
    "important": ["一级", "二级", "三级", "四级"],
    "publish": ["站内信", "公众号", "小程序", "H5", "官网"]
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| type | array | 文章类型列表 |
| important | array | 重要程度列表 |
| publish | array | 发布渠道列表 |

---

## 2. 创建文章

### 接口信息

- **URL**: `/api/document`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 创建新的招商文章，作者ID从JWT中获取

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 文章类型：招商类、广告类、公告类、提示类、日常类、告警类、其他 |
| important | string | 是 | 重要程度：一级、二级、三级、四级 |
| publish | string | 是 | 发布渠道：站内信、公众号、小程序、H5、官网 |
| content | string | 是 | 富文本内容（HTML格式） |
| title | string | 否 | 文章标题（可选） |

### 请求示例

```json
POST /api/document
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "招商类",
  "important": "一级",
  "publish": "公众号",
  "content": "<p>这是文章内容</p>",
  "title": "招商合作公告"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "文章创建成功",
  "data": {
    "id": 1
  }
}
```

#### 错误响应 (400)

```json
{
  "code": 400,
  "message": "文章类型、重要程度、发布渠道和内容不能为空",
  "data": null
}
```

---

## 3. 获取文章列表

### 接口信息

- **URL**: `/api/document/list`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取文章列表，支持分页和多条件筛选

### 请求参数（Query）

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| type | string | 否 | 文章类型筛选 | - |
| important | string | 否 | 重要程度筛选 | - |
| publish | string | 否 | 发布渠道筛选 | - |
| status | number | 否 | 状态筛选：1草稿，2已发布，3已删除 | - |
| keyword | string | 否 | 搜索关键词（标题或内容） | - |

### 请求示例

```
GET /api/document/list?page=1&pageSize=10&type=招商类&important=一级&keyword=合作
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取文章列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "招商类",
        "important": "一级",
        "publish": "公众号",
        "title": "招商合作公告",
        "content": "<p>这是文章内容</p>",
        "status": 2,
        "authorName": "张三",
        "authorAccount": "admin",
        "createdAt": "2024-11-24 14:30:25",
        "updatedAt": "2024-11-24 14:30:25"
      }
    ],
    "total": 10
  }
}
```

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 文章ID |
| type | string | 文章类型 |
| important | string | 重要程度 |
| publish | string | 发布渠道 |
| title | string | 文章标题 |
| content | string | 文章内容（HTML） |
| status | number | 状态：1草稿，2已发布，3已删除 |
| authorName | string | 作者姓名 |
| authorAccount | string | 作者账号 |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |
| total | number | 总记录数 |

---

## 4. 获取文章详情

### 接口信息

- **URL**: `/api/document/:id`
- **Method**: `GET`
- **需要认证**: 是
- **说明**: 获取指定文章的详细信息

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 文章ID |

### 请求示例

```
GET /api/document/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取文章详情成功",
  "data": {
    "id": 1,
    "type": "招商类",
    "important": "一级",
    "publish": "公众号",
    "title": "招商合作公告",
    "content": "<p>这是文章内容</p>",
    "status": 2,
    "authorId": 1,
    "authorName": "张三",
    "authorAccount": "admin",
    "createdAt": "2024-11-24 14:30:25",
    "updatedAt": "2024-11-24 14:30:25"
  }
}
```

#### 错误响应 (404)

```json
{
  "code": 404,
  "message": "文章不存在",
  "data": null
}
```

---

## 5. 更新文章

### 接口信息

- **URL**: `/api/document/:id`
- **Method**: `PUT`
- **需要认证**: 是
- **说明**: 更新文章信息，所有字段都是可选的

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 文章ID |

### 请求参数（Body）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 文章类型 |
| important | string | 否 | 重要程度 |
| publish | string | 否 | 发布渠道 |
| content | string | 否 | 富文本内容 |
| title | string | 否 | 文章标题 |

### 请求示例

```json
PUT /api/document/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "<p>更新后的内容</p>"
}
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "文章更新成功",
  "data": null
}
```

---

## 6. 删除文章

### 接口信息

- **URL**: `/api/document/:id`
- **Method**: `DELETE`
- **需要认证**: 是
- **说明**: 软删除文章（将状态设置为已删除）

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 文章ID |

### 请求示例

```
DELETE /api/document/1
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "文章删除成功",
  "data": null
}
```

---

## 7. 发布文章

### 接口信息

- **URL**: `/api/document/:id/publish`
- **Method**: `POST`
- **需要认证**: 是
- **说明**: 将草稿状态的文章发布（状态改为已发布）

### 路径参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | number | 文章ID |

### 请求示例

```
POST /api/document/1/publish
Authorization: Bearer <token>
```

### 响应示例

#### 成功响应 (200)

```json
{
  "code": 200,
  "message": "文章发布成功",
  "data": null
}
```

---

## 文章状态说明

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 1 | 草稿 | 文章已创建但未发布 |
| 2 | 已发布 | 文章已发布 |
| 3 | 已删除 | 文章已删除（软删除） |

---

## 数据来源说明

### 文章数据来源

- 基于 `document` 表存储的文章信息
- 关联 `user` 表获取作者信息
- 支持富文本内容（HTML格式）
- 支持多条件筛选和关键词搜索

### 文章类型配置

当前文章类型、重要程度、发布渠道为固定配置，后续可以扩展为数据库配置表：

- **文章类型**: 招商类、广告类、公告类、提示类、日常类、告警类、其他
- **重要程度**: 一级、二级、三级、四级
- **发布渠道**: 站内信、公众号、小程序、H5、官网

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

### 资源不存在响应

```json
{
  "code": 404,
  "message": "文章不存在",
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

1. **权限控制**: 所有接口都需要认证，作者ID从JWT中获取
2. **数据完整性**: 创建文章时，文章类型、重要程度、发布渠道必须从允许的列表中选择
3. **软删除**: 删除文章采用软删除方式，不会真正删除数据
4. **富文本内容**: 文章内容支持HTML格式，前端使用TinyMCE编辑器
5. **状态管理**: 文章状态包括草稿、已发布、已删除三种
6. **搜索功能**: 支持在标题和内容中搜索关键词

---

## 前端集成说明

### 招商管理页面功能对应

1. **获取类型列表**: 使用 `GET /api/document` 接口获取文章类型、重要程度、发布渠道选项
2. **创建文章**: 使用富文本编辑器编辑内容后，调用 `POST /api/document` 接口提交
3. **文章列表**: 使用 `GET /api/document/list` 接口，支持多条件筛选和搜索
4. **文章详情**: 使用 `GET /api/document/:id` 接口获取文章详情进行编辑
5. **更新文章**: 使用 `PUT /api/document/:id` 接口更新文章
6. **删除文章**: 使用 `DELETE /api/document/:id` 接口删除文章
7. **发布文章**: 使用 `POST /api/document/:id/publish` 接口发布文章

### 数据展示建议

- **文章类型/重要程度/发布渠道**: 使用标签（Tag）组件展示，支持多选筛选
- **富文本内容**: 使用TinyMCE或其他富文本编辑器
- **文章列表**: 建议显示标题、类型、重要程度、发布渠道、作者、创建时间等信息
- **状态标识**: 使用不同颜色标签区分草稿、已发布、已删除状态

### 业务逻辑说明

1. **文章创建流程**:
   - 用户选择文章类型、重要程度、发布渠道
   - 使用富文本编辑器编辑内容
   - 提交后创建为草稿状态
   - 可以后续发布或继续编辑

2. **文章发布流程**:
   - 草稿状态的文章可以发布
   - 发布后状态变为已发布
   - 已发布的文章可以继续编辑

3. **文章删除流程**:
   - 删除采用软删除方式
   - 删除后状态变为已删除
   - 已删除的文章不会在列表中显示（除非明确筛选）

4. **筛选和搜索**:
   - 支持按文章类型、重要程度、发布渠道筛选
   - 支持关键词搜索（标题和内容）
   - 支持状态筛选

