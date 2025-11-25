# 环境变量配置说明

## 环境变量文件

项目使用 Vite 的环境变量系统，支持以下环境变量文件：

- `.env` - 所有环境都会加载
- `.env.development` - 开发环境加载
- `.env.production` - 生产环境加载
- `.env.example` - 环境变量示例文件（已提交到git）

## 配置步骤

### 1. 创建环境变量文件

在 `admin` 目录下创建 `.env` 文件（如果不存在）：

```env
# 后端API地址
VITE_API_URL=http://localhost:3001
```

### 2. 根据环境修改配置

#### 开发环境
```env
# .env.development
VITE_API_URL=http://localhost:3001
```

#### 生产环境
```env
# .env.production
VITE_API_URL=https://your-production-api.com
```

## 环境变量说明

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| VITE_API_URL | 后端API服务地址 | http://localhost:3001 | http://localhost:3001 |

## 注意事项

1. **环境变量必须以 `VITE_` 开头**，才能在客户端代码中访问
2. 修改环境变量后需要**重启开发服务器**才能生效
3. `.env` 文件包含敏感信息，**不要提交到git**
4. `.env.example` 文件是示例文件，可以提交到git

## 验证配置

启动前端项目后，可以在浏览器控制台查看：

```javascript
console.log(import.meta.env.VITE_API_URL)
```

应该输出配置的API地址。

## 后端服务地址

默认后端服务运行在 `http://localhost:3001`，如果后端服务运行在其他地址或端口，请相应修改 `VITE_API_URL`。

