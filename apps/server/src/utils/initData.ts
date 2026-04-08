import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role from '../models/Role.js';

// 初始化数据：创建默认角色和管理员账号
export async function initDefaultUser() {
  try {
    // 1. 先确保角色表有数据
    let adminRole = await Role.findOne({ where: { id: 1 } });
    if (!adminRole) {
      adminRole = await Role.create({
        id: 1,
        name: 'admin'
      });
      console.log('✅ 默认管理员角色创建成功！');
    }

    // 确保其他角色也存在
    const roles = [
      { id: 2, name: 'manager' },
      { id: 3, name: 'user' }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ where: { id: roleData.id } });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`✅ 角色 ${roleData.name} 创建成功！`);
      }
    }

    // 2. 检查是否已存在管理员
    const admin = await User.findOne({ where: { account: 'admin' } });
    
    if (!admin) {
      // 创建默认管理员账号
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        account: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        phone: '13800138000',
        id_no: '110101199001011234',
        position: '系统管理员',
        department: '总裁办',
        status: 1,
        page_authority: 'admin',
        btn_authority: 'all,add,edit,delete',
        role_id: 1,
        address: '北京市朝阳区建国路88号',
        tags: ['认真', '工作狂', '与人和善', '代码洁癖'],
        work_status: 1,
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=admin',
      });
      
      console.log('✅ 默认管理员账号创建成功！');
      console.log('   账号: admin');
      console.log('   密码: admin123');
    } else {
      // console.log('ℹ️  管理员账号已存在，跳过创建');
    }
  } catch (error) {
    console.error('❌ 初始化默认用户失败:', error);
    throw error; // 重新抛出错误，让调用者知道初始化失败
  }
}

