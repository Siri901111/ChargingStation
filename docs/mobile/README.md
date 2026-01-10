# 移动端用户应用 (user-app)

## 概述

基于 uni-app + Vue 3 + TypeScript 的充电桩用户端小程序，支持微信小程序和 H5。

## 技术栈

| 模块 | 技术 |
|------|------|
| 框架 | uni-app + Vue 3 + TypeScript |
| 状态管理 | Pinia |
| 样式 | SCSS |
| 构建工具 | Vite |

## 核心功能

| 功能 | 说明 |
|------|------|
| 用户认证 | 手机号验证码登录、微信登录 |
| 充电站查询 | 附近站点、搜索、详情、距离计算 |
| 站点收藏 | 收藏/取消收藏站点、查看收藏列表 |
| 扫码充电 | 扫码识别充电桩、开始/停止充电 |
| 订单管理 | 订单列表、订单详情、充电记录 |
| 钱包充值 | 余额查询、套餐充值、测试充值 |
| 个人资料 | 编辑昵称、头像、性别、生日 |
| 会员卡 | 查看会员卡信息、余额、消费记录 |
| 个人中心 | 用户信息、会员信息、设置 |

---

## 快速开始

### 安装依赖

```bash
cd apps/user-app
pnpm install
```

### 开发模式

```bash
# H5 开发
pnpm dev:h5

# 微信小程序
pnpm dev:mp-weixin
```

### 构建

```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin
```

---

## 测试账号

| 类型 | 值 | 说明 |
|------|-----|------|
| 手机号 | `19282249442` | 测试用户账号 |
| 验证码 | `666666` | 开发环境固定验证码 |
| 初始余额 | 500元 | 自动创建时的默认余额 |

---

## 测试功能

### 测试充值

开发环境下，充值页面会显示"测试充值"选项，选择后直接增加余额，无需真实支付。

### 初始化测试数据

启动服务器后调用以下接口初始化数据：

```bash
# 初始化所有测试数据（充电站 + 订单）
curl -X POST http://localhost:3001/api/mobile/test/init-all

# 单独初始化充电站（长沙8个 + 天津8个）
curl -X POST http://localhost:3001/api/mobile/test/init-stations

# 单独初始化测试用户订单
curl -X POST http://localhost:3001/api/mobile/test/init-orders
```

---

## 项目结构

```
apps/user-app/
├── src/
│   ├── api/              # API 接口
│   ├── pages/            # 主包页面
│   │   ├── index/        # 首页
│   │   ├── mine/         # 个人中心
│   │   └── wallet/       # 钱包
│   ├── pages-sub/        # 分包页面
│   │   ├── login/        # 登录
│   │   ├── charging/     # 充电
│   │   ├── order/        # 订单
│   │   └── settings/     # 设置
│   ├── store/            # Pinia 状态管理
│   ├── utils/            # 工具函数
│   └── styles/           # 全局样式
├── pages.json            # 页面配置
└── manifest.json         # 应用配置
```

---

## 相关文档

- [移动端 API 文档](../api/API文档-移动端.md)
- [快速启动指南](../guides/快速启动指南.md)
