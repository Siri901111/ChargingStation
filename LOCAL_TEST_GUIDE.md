# 本地测试指南

在部署到 Vercel 之前，请在本地运行以下命令确保代码无误：

## 方法一：运行类型检查（推荐）

在项目根目录执行：

```bash
# 检查所有包的类型
pnpm typecheck

# 或者只检查 server 包
pnpm --filter @charging/server typecheck
```

## 方法二：运行构建命令（模拟 Vercel 构建）

在项目根目录执行：

```bash
# 构建所有包
pnpm build

# 或者只构建 server 包
pnpm build:server
```

## 方法三：在 server 目录下直接运行

```bash
# 进入 server 目录
cd apps/server

# 运行类型检查
pnpm typecheck

# 运行构建
pnpm build
```

## 预期结果

如果所有修复都正确，你应该看到：
- ✅ 类型检查通过，没有 TypeScript 错误
- ✅ 构建成功，生成 `dist` 目录

## 如果还有错误

如果仍然有类型错误，请：
1. 查看错误信息中的文件路径和行号
2. 检查对应的类型定义
3. 修复类型不匹配的问题

## 已修复的问题

1. ✅ `monitorDataController.ts` - 添加了缺失的参数类型（pagePath, platform 等）
2. ✅ `mobileStationService.ts` - 在 StationInfo 接口中添加了 isFavorite 属性
3. ✅ `mapService.ts` - 修复了 Station 查询结果的类型问题
4. ✅ `monitorDataService.ts` - 修复了 Sequelize literal 类型问题
5. ✅ `orderService.ts` - 修复了 Order 模型的类型问题
6. ✅ `revenueService.ts` - 修复了 Revenue 模型的类型问题
7. ✅ `stationService.ts` - 修复了 Station 模型的类型问题

## 测试结果

✅ 类型检查已通过！所有 TypeScript 错误已修复。
