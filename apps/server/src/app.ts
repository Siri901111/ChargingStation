import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import sequelize from './config/db.js';
import './models/index.js'; // 导入所有模型
import { User, ChargingUser } from './models/index.js';
import { initDefaultUser } from './utils/initData.js';
import { initMockData } from './utils/initMockData.js';
import { initAllTestData } from './utils/initTestData.js';

dotenv.config();

/**
 * 获取本机局域网IP地址
 */
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        // 跳过内部地址（如127.0.0.1）和非IPv4地址
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

const app = express();

// CORS配置 - 支持credentials模式和局域网访问
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // 开发环境：允许所有localhost、127.0.0.1和局域网IP访问
    if (isDevelopment) {
      // 允许没有origin的情况（如移动端或Postman）
      if (!origin) {
        return callback(null, true);
      }
      
      // 允许localhost和127.0.0.1
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // 允许局域网IP（192.168.x.x, 10.x.x.x, 172.16-31.x.x）
      const localNetworkRegex = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+)(:\d+)?$/;
      if (localNetworkRegex.test(origin)) {
        return callback(null, true);
      }
      
      // 允许所有开发环境的访问
      return callback(null, true);
    }
    
    // 生产环境：使用白名单
    const allowedOrigins = [
      'https://api.example.com',
      // 添加生产环境的前端域名
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域请求'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'token'],
}));
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
import personalRoutes from './routes/personalRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import pileRoutes from './routes/pileRoutes.js';
import monitorDataRoutes from './routes/monitorDataRoutes.js';
import aiAgentRoutes from './routes/aiAgentRoutes.js';
import mobileRoutes from './routes/mobileRoutes.js';
app.use('/api', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api', revenueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/member', memberCardRoutes);
app.use('/api', orderRoutes);
app.use('/api', billingTemplateRoutes);
app.use('/api', documentRoutes);
app.use('/api', personalRoutes);
app.use('/api', mapRoutes);
app.use('/api', pileRoutes);
app.use('/api/monitor', monitorDataRoutes);
app.use('/api/ai-agent', aiAgentRoutes);
app.use('/api/mobile', mobileRoutes); // 移动端API

// 兼容前端的报警列表API路径
app.use('/api', alarmRoutes);

// 更新现有用户的缺失字段
async function updateExistingUsersData() {
  try {
    const users = await User.findAll();
    const addresses = [
      '北京市朝阳区建国路88号',
      '北京市海淀区中关村大街1号',
      '北京市西城区西单北大街176号',
      '上海市浦东新区陆家嘴环路1000号',
      '上海市黄浦区南京东路100号',
      '广州市天河区天河路123号',
      '深圳市南山区科技园南路2号',
      '杭州市西湖区文三路259号',
    ];
    
    const tagOptions = [
      ['认真', '工作狂', '与人和善', '代码洁癖'],
      ['负责', '高效', '团队合作', '学习能力强'],
      ['细心', '专业', '沟通能力强', '执行力强'],
      ['创新', '积极', '乐观', '抗压能力强'],
      ['严谨', '专注', '有责任心', '技术过硬'],
    ];

    for (const user of users) {
      const updateData: any = {};
      let needUpdate = false;

      // 检查并补充缺失的字段
      if (!(user as any).address) {
        updateData.address = addresses[Math.floor(Math.random() * addresses.length)];
        needUpdate = true;
      }
      if (!(user as any).tags || (Array.isArray((user as any).tags) && (user as any).tags.length === 0)) {
        updateData.tags = tagOptions[Math.floor(Math.random() * tagOptions.length)];
        needUpdate = true;
      }
      if (!(user as any).work_status) {
        updateData.work_status = Math.floor(Math.random() * 4) + 1; // 1-4随机
        needUpdate = true;
      }
      if (!(user as any).avatar) {
        // 使用dicebear生成头像，基于用户ID或账号
        const seed = (user as any).account || (user as any).id;
        updateData.avatar = `https://api.dicebear.com/7.x/miniavs/svg?seed=${seed}`;
        needUpdate = true;
      }

      if (needUpdate) {
        await (user as any).update(updateData);
      }
    }

    if (users.length > 0) {
      console.log(`✅ 已更新 ${users.length} 个用户的个人信息字段`);
    }
  } catch (error) {
    console.error('⚠️  更新用户数据时出错:', error);
  }
}

// 手动添加缺失的列（避免alter导致的索引问题）
async function addMissingColumnsIfNeeded() {
  try {
    const queries: string[] = [];

    // 处理 charging_user 表
    const [chargingUserResults] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'charging_user'
    `) as any[];

    const chargingUserColumns = chargingUserResults.map((r: any) => r.COLUMN_NAME);

    // 检查并添加 charging_user 表缺失的字段
    if (!chargingUserColumns.includes('card_type')) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN card_type VARCHAR(20) DEFAULT '普通卡' COMMENT '卡类型：普通卡、VIP卡、季卡'`);
    }
    if (!chargingUserColumns.includes('issue_date')) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN issue_date DATETIME COMMENT '开卡日期'`);
    }
    if (!chargingUserColumns.includes('valid_until')) {
      queries.push(`ALTER TABLE charging_user ADD COLUMN valid_until DATETIME COMMENT '有效期至'`);
    }

    // 处理 user 表
    const [userResults] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
    `) as any[];

    const userColumns = userResults.map((r: any) => r.COLUMN_NAME);

    // 检查并添加 user 表缺失的字段
    if (!userColumns.includes('address')) {
      queries.push(`ALTER TABLE user ADD COLUMN address VARCHAR(200) COMMENT '地址'`);
    }
    if (!userColumns.includes('tags')) {
      queries.push(`ALTER TABLE user ADD COLUMN tags JSON COMMENT '个人标签（数组）'`);
    }
    if (!userColumns.includes('work_status')) {
      queries.push(`ALTER TABLE user ADD COLUMN work_status TINYINT DEFAULT 1 COMMENT '在职状态：1工作中，2请假中，3出差中，4年假中'`);
    }
    if (!userColumns.includes('avatar')) {
      queries.push(`ALTER TABLE user ADD COLUMN avatar VARCHAR(500) COMMENT '头像URL'`);
    }

    // 处理 order 表
    const [orderResults] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'order'
    `) as any[];

    const orderColumns = orderResults.map((r: any) => r.COLUMN_NAME);

    // 检查并添加 order 表缺失的字段
    if (!orderColumns.includes('pile_id')) {
      queries.push(`ALTER TABLE \`order\` ADD COLUMN pile_id BIGINT COMMENT '充电桩ID'`);
    }
    if (!orderColumns.includes('pay_time')) {
      queries.push(`ALTER TABLE \`order\` ADD COLUMN pay_time DATETIME COMMENT '支付时间'`);
    }

    // 处理 pile 表
    const [pileResults] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'pile'
    `) as any[];

    const pileColumns = pileResults.map((r: any) => r.COLUMN_NAME);

    // 检查并添加 pile 表缺失的字段
    if (!pileColumns.includes('name')) {
      queries.push(`ALTER TABLE pile ADD COLUMN name VARCHAR(50) COMMENT '充电桩名称'`);
    }
    if (!pileColumns.includes('price')) {
      queries.push(`ALTER TABLE pile ADD COLUMN price DECIMAL(10,2) COMMENT '价格 元/度'`);
    }

    // 处理 station 表
    const [stationResults] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'station'
    `) as any[];

    const stationColumns = stationResults.map((r: any) => r.COLUMN_NAME);

    // 检查并添加 station 表缺失的字段
    if (!stationColumns.includes('address')) {
      queries.push(`ALTER TABLE station ADD COLUMN address VARCHAR(200) COMMENT '详细地址'`);
    }

    // 执行所有添加字段的SQL
    for (const query of queries) {
      try {
        await sequelize.query(query);
      } catch (e: any) {
        // 忽略字段已存在的错误
        if (!e.message?.includes('Duplicate column')) {
          console.warn(`⚠️  执行失败: ${query}`, e.message);
        }
      }
    }

    if (queries.length > 0) {
      console.log(`✅ 已检查/添加 ${queries.length} 个字段`);
    }
  } catch (error) {
    console.error('⚠️  添加缺失字段时出错:', error);
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
      
      // 更新现有用户的缺失字段
      await updateExistingUsersData();
      
      // 初始化Mock数据（如果数据库为空或强制初始化）
      const FORCE_INIT_MOCK = process.env.FORCE_INIT_MOCK === 'true'; // 环境变量控制是否强制初始化
      const userCount = await User.count();
      const chargingUserCount = await ChargingUser.count();
      
      if (FORCE_INIT_MOCK) {
        // 强制初始化所有Mock数据（会跳过已存在检查）
        console.log('🔄 强制初始化Mock数据（FORCE_INIT_MOCK=true）...');
        await initMockData();
      } else if (userCount <= 1) {
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
        console.log('💡 提示：如需强制重新初始化，请在 .env 文件中设置 FORCE_INIT_MOCK=true');
      }

      // 初始化移动端测试数据（长沙天津充电站 + 测试用户订单）
      if (process.env.NODE_ENV === 'development') {
        try {
          await initAllTestData();
        } catch (e) {
          console.log('ℹ️  移动端测试数据已存在或初始化失败');
        }
      }
    } catch (error) {
      console.error('❌ 数据初始化失败:', error);
      console.log('⚠️  服务器将继续启动，但可能缺少初始数据');
    }
    
    // 启动服务器 - 监听所有网络接口，支持局域网访问
    const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 表示监听所有网络接口
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🌐 局域网访问: http://${getLocalIP()}:${PORT}`);
      console.log(`📝 API 文档: http://localhost:${PORT}/api`);
      console.log(`📱 移动端API: http://${getLocalIP()}:${PORT}/api/mobile`);
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