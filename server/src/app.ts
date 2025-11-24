import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import './models/index.js'; // 导入所有模型
import { User, ChargingUser } from './models/index.js';
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
import dashboardRoutes from './routes/dashboardRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import memberCardRoutes from './routes/memberCardRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import billingTemplateRoutes from './routes/billingTemplateRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
app.use('/api', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api', revenueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/member', memberCardRoutes);
app.use('/api', orderRoutes);
app.use('/api', billingTemplateRoutes);
app.use('/api', documentRoutes);

// 兼容前端的报警列表API路径
app.use('/api', alarmRoutes);

// 手动添加缺失的列（避免alter导致的索引问题）
async function addMissingColumnsIfNeeded() {
  try {
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'charging_user'
    `) as any[];
    
    const existingColumns = results.map((r: any) => r.COLUMN_NAME);
    const queries: string[] = [];
    
    // 检查并添加缺失的字段
    if (!existingColumns.includes('card_type')) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN card_type VARCHAR(20) DEFAULT '普通卡' COMMENT '卡类型：普通卡、VIP卡、季卡'`);
    }
    if (!existingColumns.includes('issue_date')) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN issue_date DATETIME COMMENT '开卡日期'`);
    }
    if (!existingColumns.includes('valid_until')) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN valid_until DATETIME COMMENT '有效期至'`);
    }
    
    // 执行所有添加字段的SQL
    for (const query of queries) {
      await sequelize.query(query);
    }
    
    if (queries.length > 0) {
      console.log(`✅ 已添加 ${queries.length} 个缺失的字段到 charging_user 表`);
    }
  } catch (error) {
    console.error('⚠️  添加缺失字段时出错（可能字段已存在）:', error);
  }
}

const PORT = process.env.PORT || 3001;

// 测试数据库连接
sequelize.authenticate()
  .then(async () => {
    console.log('✅ 数据库连接成功！');
    
    // 同步表结构（如果表不存在则创建，存在则不修改）
    // 注意：如需添加新字段，临时设置 alter: true，同步后改回 alter: false
    // 临时禁用外键检查，避免同步时的约束冲突
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      // 暂时使用 alter: false 避免索引过多的问题
      // 如需添加字段，请手动执行SQL或临时改为 alter: true
      const result = await sequelize.sync({ alter: false, force: false });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      
      // 手动添加新字段（如果表已存在但字段不存在）
      await addMissingColumnsIfNeeded();
      
      return result;
    } catch (syncError: any) {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      // 如果是索引相关的错误，给出提示
      if (syncError.message && syncError.message.includes('keys')) {
        console.error('⚠️  数据库索引错误，可能需要手动处理：');
        console.error('   1. 检查是否有重复的索引');
        console.error('   2. 检查索引数量是否超过限制');
        console.error('   3. 可以尝试删除表后重新创建（会丢失数据）');
      }
      throw syncError;
    }
  })
  .then(async () => {
    console.log('✅ 数据库表结构同步成功！');
    
    try {
      // 初始化默认角色和管理员账号
      await initDefaultUser();
      
      // 初始化Mock数据（如果数据库为空）
      const userCount = await User.count();
      const chargingUserCount = await ChargingUser.count();
      
      if (userCount <= 1) {
        // 完全初始化所有Mock数据
        await initMockData();
      } else if (chargingUserCount === 0) {
        // 如果后台用户已存在但充电用户不存在，只初始化充电用户
        console.log('📦 开始初始化充电用户数据...');
        const { initChargingUsers } = await import('./utils/initMockData.js');
        await initChargingUsers();
        console.log('✅ 充电用户数据初始化完成');
      } else {
        console.log('ℹ️  数据库已有数据，跳过Mock数据初始化');
      }
    } catch (error) {
      console.error('❌ 数据初始化失败:', error);
      console.log('⚠️  服务器将继续启动，但可能缺少初始数据');
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