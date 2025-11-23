import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// 初始化数据：创建默认管理员账号
export async function initDefaultUser() {
  try {
    // 检查是否已存在管理员
    const admin = await User.findOne({ where: { account: 'admin' } });
    
    if (!admin) {
      // 创建默认管理员账号
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        account: 'admin',
        password: hashedPassword,
        name: '管理员',
        phone: '13800138000',
        position: '管理员',
        department: '总裁办',
        status: 1,
        page_authority: 'admin',
        btn_authority: 'admin',
        role_id: 1,
      });
      
      console.log('✅ 默认管理员账号创建成功！');
      console.log('   账号: admin');
      console.log('   密码: admin123');
    } else {
      console.log('ℹ️  管理员账号已存在，跳过创建');
    }
  } catch (error) {
    console.error('❌ 初始化默认用户失败:', error);
  }
}

