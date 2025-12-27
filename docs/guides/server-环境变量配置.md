# 环境变量配置说明

## .env 文件配置

在 `server` 目录下创建或编辑 `.env` 文件，包含以下配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_DATABASE=charging_station

# JWT配置
JWT_SECRET=super_secret_jwt_key_change_in_production

# 服务端口
PORT=3001

# Mock数据初始化控制
# 设置为 true 时，即使数据库已有数据，也会强制重新初始化所有Mock数据
# 设置为 false 或不设置时，只有在数据库为空时才会初始化Mock数据
FORCE_INIT_MOCK=false
```

## FORCE_INIT_MOCK 参数说明

### 默认行为（FORCE_INIT_MOCK=false 或不设置）

- 如果数据库为空（用户数 <= 1）→ 自动初始化所有Mock数据
- 如果数据库已有用户但无充电用户 → 只初始化充电用户数据
- 如果数据库已有完整数据 → 跳过Mock数据初始化

### 强制初始化（FORCE_INIT_MOCK=true）

设置 `FORCE_INIT_MOCK=true` 后，无论数据库是否已有数据，都会强制重新初始化所有Mock数据。

**使用场景：**
- 需要重新生成测试数据
- 数据库数据不完整，需要补充
- 开发测试时重置数据

**注意：** 
- 强制初始化会跳过已存在检查，可能会创建重复数据
- 建议在开发环境使用，生产环境请谨慎使用

## 使用方法

1. **编辑 .env 文件**
   ```bash
   # 在 server 目录下
   # Windows: 使用记事本或编辑器打开 .env
   # Linux/Mac: nano .env 或 vim .env
   ```

2. **添加或修改 FORCE_INIT_MOCK**
   ```env
   FORCE_INIT_MOCK=true   # 强制初始化
   # 或
   FORCE_INIT_MOCK=false  # 默认行为（或不设置）
   ```

3. **重启服务器**
   ```bash
   npm run dev
   ```

4. **查看日志**
   - 如果设置了 `FORCE_INIT_MOCK=true`，会看到：`🔄 强制初始化Mock数据（FORCE_INIT_MOCK=true）...`
   - 如果未设置或为 `false`，会看到：`ℹ️  数据库已有数据，跳过Mock数据初始化`

## 示例

### 场景1：首次启动（数据库为空）
```env
# .env 文件
FORCE_INIT_MOCK=false  # 或不设置
```
结果：自动初始化所有Mock数据

### 场景2：数据库已有数据，需要重新初始化
```env
# .env 文件
FORCE_INIT_MOCK=true
```
结果：强制重新初始化所有Mock数据

### 场景3：数据库已有数据，不需要初始化
```env
# .env 文件
FORCE_INIT_MOCK=false  # 或不设置
```
结果：跳过Mock数据初始化

