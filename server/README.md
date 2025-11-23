# 充电站管理平台 - 后端服务

## 技术栈

- Node.js + Express
- TypeScript
- Sequelize (ORM)
- MySQL
- JWT (身份认证)
- bcryptjs (密码加密)

## 环境要求

- Node.js >= 18
- MySQL >= 5.7

## 安装依赖

```bash
npm install
```

## 配置环境变量

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

## 数据库初始化

1. 创建数据库：
```sql
CREATE DATABASE charging_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 启动项目后，Sequelize 会自动创建所有表结构

3. 首次启动会自动创建默认管理员账号：
   - 账号: `admin`
   - 密码: `admin123`

## 启动项目

### 开发模式（热重载）
```bash
npm run dev
```

### 生产模式
```bash
npm run build
npm start
```

## API 接口

### 登录接口

**POST** `/api/login`

请求体：
```json
{
  "username": "admin",
  "password": "admin123"
}
```

响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "admin",
      "roles": ["admin"]
    },
    "menulist": [...]
  }
}
```

## 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件（数据库连接等）
│   ├── controllers/    # 控制器（处理请求）
│   ├── middlewares/     # 中间件（认证、权限等）
│   ├── models/          # 数据模型（Sequelize）
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   └── app.ts           # 应用入口
├── .env                 # 环境变量配置
├── package.json
└── tsconfig.json
```

## 注意事项

1. 确保 MySQL 服务已启动
2. 确保数据库 `charging_station` 已创建
3. 首次启动会自动创建表结构和默认管理员账号
4. 前端需要配置 `VITE_API_URL=http://localhost:3001/api`

