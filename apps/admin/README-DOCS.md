# 文档查看器使用说明

## 功能说明

文档查看器功能允许用户在顶部栏查看项目文档。文档内容来自项目根目录的 `docs` 文件夹。

## 设置步骤

### 1. 复制文档到public目录

文档需要复制到 `apps/admin/public/docs` 目录才能被访问。有两种方式：

#### 方式一：自动复制（推荐）

运行以下命令会自动复制docs文件夹：

```bash
cd apps/admin
npm run copy-docs
```

或者在启动开发服务器前，文档会自动复制（已配置predev钩子）。

#### 方式二：手动复制

手动将项目根目录的 `docs` 文件夹复制到 `apps/admin/public/docs`。

### 2. 验证文档

确保 `apps/admin/public/docs` 目录包含以下结构：

```
public/
  docs/
    README.md
    项目文档总览.md
    api/
      API接口文档.md
      ...
    guides/
      快速启动指南.md
      ...
    design/
      数据库设计文档.md
      ...
```

### 3. 使用文档查看器

1. 点击顶部栏的文档图标
2. 选择要查看的文档分类
3. 文档内容会在对话框中显示

## 故障排除

如果文档无法加载：

1. **检查文件是否存在**
   - 确认 `apps/admin/public/docs` 目录存在
   - 确认文档文件在正确的位置

2. **重新复制文档**
   ```bash
   npm run copy-docs
   ```

3. **检查控制台错误**
   - 打开浏览器开发者工具
   - 查看Console标签页的错误信息
   - 查看Network标签页，确认文档请求是否成功

4. **手动验证路径**
   - 在浏览器中访问 `http://localhost:5173/docs/README.md`
   - 应该能看到文档内容

## 开发说明

- 文档加载器位于 `src/utils/document/documentLoader.ts`
- 文档查看器组件位于 `src/components/TopHeader/components/DocumentViewer.vue`
- 文档通过fetch从 `/docs/` 路径加载
- Markdown会自动转换为HTML显示

