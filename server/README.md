# 充电站管理平台 - 后端服务

## 项目简介

这是一个**新能源汽车充电站管理平台**的后端系统，采用 Node.js + Express + TypeScript + MySQL 技术栈开发。系统提供充电站管理、用户权限管理、营收统计、设备监控等功能的完整 API 服务。

## 技术栈

- **Node.js** + **Express** - 后端框架
- **TypeScript** - 类型安全的JavaScript
- **Sequelize** - ORM框架
- **MySQL** - 关系型数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

## 环境要求

- Node.js >= 18
- MySQL >= 5.7
- npm 或 yarn

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在 `server` 目录下创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_DATABASE=charging_station
JWT_SECRET=super_secret_jwt_key
PORT=3001
```

### 3. 数据库初始化

创建数据库：
```sql
CREATE DATABASE charging_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动项目

#### 开发模式（热重载）
```bash
npm run dev
```

#### 生产模式
```bash
npm run build
npm start
```

### 5. 默认管理员账号

首次启动会自动创建默认管理员账号：
- **账号**: `admin`
- **密码**: `admin123`

## 功能模块

### 🔐 用户管理
- 用户登录/注册
- 权限管理（admin/manager/user）
- 用户列表（分页、搜索）
- 用户状态管理（启用/禁用）

### ⚡ 充电站管理
- 充电站CRUD操作
- 实时数据统计
- 状态监控
- 地理位置管理

### 📊 营收统计
- 营收图表数据
- 分站点营收统计
- 收入分类统计
- 增长率分析

### 🔌 充电桩监控
- 实时状态监控
- 设备参数监控
- 使用记录查询
- 故障报警

## API接口

### 认证接口

**POST** `/api/login` - 用户登录

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### 充电站接口

- **GET** `/api/stations` - 获取充电站列表
- **GET** `/api/stations/:id` - 获取单个充电站
- **POST** `/api/stations` - 创建充电站
- **PUT** `/api/stations/:id` - 更新充电站
- **DELETE** `/api/stations/:id` - 删除充电站

### 营收统计接口

- **GET** `/api/revenueChart` - 获取营收图表数据
- **POST** `/api/revenueList` - 获取营收列表

### 充电桩监控接口

- **POST** `/api/currentList` - 获取充电桩实时监控数据

### 用户管理接口

- **POST** `/api/register` - 用户注册
- **POST** `/api/permissionList` - 获取用户列表
- **POST** `/api/userAuth` - 获取用户权限
- **POST** `/api/setAuth` - 设置用户权限
- **POST** `/api/deleteUser` - 删除用户
- **POST** `/api/toggleUserStatus` - 禁用/启用用户

## 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件（数据库连接等）
│   ├── controllers/     # 控制器（处理请求）
│   ├── middlewares/     # 中间件（认证、权限等）
│   ├── models/          # 数据模型（Sequelize）
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   └── app.ts           # 应用入口
├── .env                 # 环境变量配置
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 数据库设计

### 核心数据表

- **user** - 后台管理用户表
- **charging_user** - 充电用户表
- **station** - 充电站表
- **pile** - 充电桩表
- **order** - 充电订单表
- **revenue** - 营收统计表
- **alarm** - 报警记录表
- **role** - 角色表

详细的数据库设计请参考：[数据库设计文档](./数据库设计文档.md)

## 详细文档

### 📚 API接口文档

- **[用户管理接口文档](./API文档-用户管理.md)** - 用户登录、注册、权限管理等接口
- **[充电站管理接口文档](./API文档-充电站管理.md)** - 充电站CRUD操作接口
- **[营收统计接口文档](./API文档-营收统计.md)** - 营收图表和列表接口
- **[充电桩管理接口文档](./API文档-充电桩管理.md)** - 充电桩实时监控接口

### 📊 数据库文档

- **[数据库设计文档](./数据库设计文档.md)** - 完整的数据库表结构和关系设计

### 📖 项目文档

- **[项目文档总览](./项目文档总览.md)** - 项目完整介绍和开发指南
- **[快速启动指南](./快速启动.md)** - 项目快速启动和部署指南

## 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- 采用 ESM 模块系统
- 遵循 RESTful API 设计原则
- 统一的错误处理和响应格式

### 测试接口

推荐使用 **Apifox** 或 **Postman** 进行API测试：

1. 首先登录获取token
2. 在请求头中添加：`Authorization: Bearer <token>`
3. 测试各个业务接口

### 部署说明

1. **构建项目**
   ```bash
   npm run build
   ```

2. **启动服务**
   ```bash
   npm start
   ```

3. **配置反向代理**（可选）
   ```nginx
   location /api {
       proxy_pass http://localhost:3001;
   }
   ```

## 常见问题

### Q: 启动时报 ESM 相关错误？
A: 确保 `package.json` 中设置了 `"type": "module"`

### Q: 数据库连接失败？
A: 检查 `.env` 文件配置，确保MySQL服务已启动

### Q: 接口认证失败？
A: 确保请求头中携带了有效的JWT令牌

## 注意事项

1. 确保 MySQL 服务已启动
2. 确保数据库 `charging_station` 已创建
3. 首次启动会自动创建表结构和默认管理员账号
4. 前端需要配置 `VITE_API_URL=http://localhost:3001/api`

## 更新日志

### v1.0.0 (2024-11-24)

- ✅ 完成用户管理模块
- ✅ 完成充电站管理模块
- ✅ 完成营收统计模块
- ✅ 完成充电桩监控模块
- ✅ 完成权限控制系统
- ✅ 完成完整的API文档

## 许可证

本项目为毕业设计项目，仅供学习和参考使用。

---

如有问题或建议，请查看详细文档或提交Issue。