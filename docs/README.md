# 充电站管理系统 - 文档中心

## 项目概述

本项目是一个充电站管理系统，采用 Monorepo 架构，包含前端管理后台、后端服务和监控 SDK。

## 文档目录

### 快速开始

- [项目文档总览](./项目文档总览.md)
- [快速启动指南](./guides/快速启动指南.md)

### 环境配置

- [Admin 环境变量配置](./guides/admin-环境变量配置.md)
- [Server 环境变量配置](./guides/server-环境变量配置.md)
- [前后端对接说明](./guides/前后端对接说明.md)

### API 文档

- [用户管理](./api/API文档-用户管理.md)
- [充电站管理](./api/API文档-充电站管理.md)
- [充电桩管理](./api/API文档-充电桩管理.md)
- [订单管理](./api/API文档-订单管理.md)
- [会员卡管理](./api/API文档-会员卡管理.md)
- [计费模板管理](./api/API文档-计费模板管理.md)
- [报警管理](./api/API文档-报警管理.md)
- [营收统计](./api/API文档-营收统计.md)
- [数据看板](./api/API文档-数据看板.md)
- [电子地图](./api/API文档-电子地图.md)
- [个人中心](./api/API文档-个人中心.md)
- [招商管理](./api/API文档-招商管理.md)

### 系统设计

- [数据库设计文档](./design/数据库设计文档.md)
- [系统功能分析与扩展建议](./design/系统功能分析与扩展建议.md)

## 项目结构

```
chargingStation/
├── apps/
│   ├── admin/          # Vue 3 前端管理系统
│   └── server/         # Express 后端服务
├── packages/
│   ├── monitor-sdk/    # 前端监控 SDK
│   ├── shared-types/   # 共享类型定义
│   ├── shared-utils/   # 共享工具函数
│   ├── tsconfig/       # 统一 TS 配置
│   └── eslint-config/  # 统一 ESLint 配置
└── docs/               # 文档中心
    ├── api/            # API 接口文档
    ├── guides/         # 使用指南
    └── design/         # 设计文档
```

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动所有项目
pnpm dev

# 只启动前端
pnpm dev:admin

# 只启动后端
pnpm dev:server

# 构建所有项目
pnpm build
```
