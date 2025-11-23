import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import './models/index.js'; // 导入所有模型
import { User } from './models/index.js';
import { initDefaultUser } from './utils/initData.js';
import { initMockData } from './utils/initMockData.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 处理末尾斜杠的中间件（可选，但建议保留）
app.use((req, res, next) => {
  // 移除末尾斜杠（除了根路径）
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
    return;
  }
  next();
});

// 挂载路由
import userRoutes from './routes/userRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
app.use('/api', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api', revenueRoutes);

const PORT = process.env.PORT || 3001;

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('✅ 数据库连接成功！');
    
    // 同步表结构（如果表不存在则创建，存在则不修改）
    return sequelize.sync({ alter: false, force: false });
  })
  .then(async () => {
    console.log('✅ 数据库表结构同步成功！');
    
    // 初始化默认管理员账号
    await initDefaultUser();
    
    // 初始化Mock数据（如果数据库为空）
    const userCount = await User.count();
    if (userCount <= 1) {
      await initMockData();
    } else {
      console.log('ℹ️  数据库已有数据，跳过Mock数据初始化');
    }
    
    // 启动服务器
app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📝 API 文档: http://localhost:${PORT}/api`);
    });
  })
  .catch((err: any) => {
    console.error('❌ 启动失败：');
    console.error('错误详情：', err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 提示：请检查：');
      console.error('   1. MySQL 服务是否已启动');
      console.error('   2. 数据库连接配置是否正确（.env 文件）');
      console.error('   3. 数据库 charging_station 是否已创建');
    } else if (err.message.includes('Access denied')) {
      console.error('\n💡 提示：数据库用户名或密码错误，请检查 .env 文件');
    } else if (err.message.includes('Unknown database')) {
      console.error('\n💡 提示：数据库不存在，请先创建数据库：');
      console.error('   CREATE DATABASE charging_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    }
    
    process.exit(1);
});