# 数据库迁移说明

## 📋 执行步骤（3步搞定）

### 第 1 步：查看数据库名称

查看 `apps/server/.env` 文件，找到 `DB_DATABASE`：

```env
DB_DATABASE=你的数据库名称
```

### 第 2 步：修改 SQL 文件

打开 `add-monitor-dimensions-mysql.sql`，将第 9 行：

```sql
USE your_database_name;
```

改为你的实际数据库名称，例如：

```sql
USE charging_station;
```

### 第 3 步：执行迁移

**方式 A：命令行执行（推荐）**

```bash
# Windows (PowerShell)
mysql -u root -p 你的数据库名 < apps\server\src\migrations\add-monitor-dimensions-mysql.sql

# Windows (CMD)
mysql -u root -p 你的数据库名 < apps/server/src/migrations/add-monitor-dimensions-mysql.sql

# Mac/Linux
mysql -u root -p 你的数据库名 < apps/server/src/migrations/add-monitor-dimensions-mysql.sql
```

**方式 B：登录 MySQL 后执行**

```bash
# 1. 登录 MySQL
mysql -u root -p

# 2. 选择数据库
USE 你的数据库名;

# 3. 执行 SQL（复制下面的 SQL）
```

然后执行这个 SQL：

```sql
-- 添加页面路径字段
ALTER TABLE monitor_data 
  ADD COLUMN page_path VARCHAR(500) NULL COMMENT '页面路径（规范化后的路径）' AFTER page_url;

-- 添加用户显示名称字段
ALTER TABLE monitor_data 
  ADD COLUMN user_display_name VARCHAR(100) NULL COMMENT '用户显示名称（从extra等提取）' AFTER user_id;

-- 添加平台类型字段
ALTER TABLE monitor_data 
  ADD COLUMN platform VARCHAR(20) NULL COMMENT '平台类型（web、uniapp等）' AFTER page_title;

-- 添加环境标识字段
ALTER TABLE monitor_data 
  ADD COLUMN env VARCHAR(20) NULL COMMENT '环境标识（h5、mp-weixin等）' AFTER platform;

-- 添加索引
ALTER TABLE monitor_data 
  ADD INDEX idx_page_path (page_path),
  ADD INDEX idx_platform (platform),
  ADD INDEX idx_user_display_name (user_display_name);
```

**方式 C：使用数据库管理工具**

1. 打开 Navicat / DBeaver / phpMyAdmin
2. 连接到数据库
3. 打开 SQL 编辑器
4. 复制上面的 SQL 语句
5. 执行

## ✅ 验证是否成功

执行这个 SQL 查看结果：

```sql
SHOW COLUMNS FROM monitor_data;
```

应该能看到这 4 个新字段：
- ✅ `page_path` (varchar(500))
- ✅ `user_display_name` (varchar(100))
- ✅ `platform` (varchar(20))
- ✅ `env` (varchar(20))

## ⚠️ 注意事项

1. **执行前备份数据库**（重要！）
   ```bash
   mysqldump -u root -p 数据库名 > backup_$(date +%Y%m%d).sql
   ```

2. **如果字段已存在**：说明已经执行过迁移，无需重复执行

3. **如果报错**：查看 `执行迁移指南.md` 获取详细说明

## 📚 更多帮助

- 详细说明：查看 `执行迁移指南.md`
- 快速版本：查看 `执行迁移-快速版.md`
