import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken, type TokenPayload } from '../utils/jwt.js';
import { validateAccount, validatePassword, validatePhone, validateIdNo } from '../utils/validator.js';
import { Op } from 'sequelize';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: number;
    username: string;
    roles: string[];
  };
  menulist: any[];
  btnAuth?: string[]; // 按钮权限
}

export interface RegisterParams {
  account: string;
  password: string;
  name: string;
  phone?: string;
  id_no?: string;
  position?: string;
  department?: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  department?: string;
}

// 根据权限获取菜单和按钮权限
const getMenuAndBtnAuthByRole = (pageAuthority: string): { menulist: any[], btnAuth: string[] } => {
  // 管理员权限 - 全部菜单和全部按钮权限 (updated)
  if (pageAuthority === 'admin') {
    return {
      menulist: [
        {
          name: '数据看板',
          url: '/dashboard',
          icon: 'DataLine'
        },
        {
          name: '充电站管理',
          url: '/chargingstation',
          icon: 'Lightning',
          children: [
            {
              name: '充电站监控',
              url: '/chargingstation/monitor',
              icon: 'VideoCamera'
            },
            {
              name: '营收统计',
              url: '/chargingstation/revenue',
              icon: 'DataAnalysis'
            },
            {
              name: '充电桩管理',
              url: '/chargingstation/fault',
              icon: 'Warning'
            }
          ]
        },
        {
          name: '电子地图',
          url: '/map',
          icon: 'MapLocation'
        },
        {
          name: '运营管理',
          url: '/operations',
          icon: 'Files',
          children: [
            {
              name: '订单管理',
              url: '/operations/orders',
              icon: 'DocumentCopy',
            },
            {
              name: '订单详情',
              url: '/operations/detail',
              icon: 'Share'
            },
            {
              name: '计费管理',
              url: '/operations/total',
              icon: 'Money'
            },
          ]
        },
        {
          name: '报警管理',
          url: '/alarm',
          icon: 'Phone'
        },
        {
          name: '会员卡管理',
          url: '/equipment',
          icon: 'Magnet'
        },
        {
          name: '招商管理',
          url: '/document',
          icon: 'Document'
        },
        {
          name: '系统设置',
          url: '/system',
          icon: 'Setting'
        },
        {
          name: '服务监控',
          url: '/web-monitor',
          icon: 'Files',
          children: [
            {
              name: '监控总览',
              url: '/web-monitor/overview',
              icon: 'DocumentCopy',
            },
            {
              name: '行为监控',
              url: '/web-monitor/behavior',
              icon: 'Flag',
            },
            {
              name: '网络监控',
              url: '/web-monitor/network',
              icon: 'MagicStick',
            },
            {
              name: '错误监控',
              url: '/web-monitor/errors',
              icon: 'CloseBold',
            },
            {
              name: '性能指标监控',
              url: '/web-monitor/performance',
              icon: 'ChromeFilled',
            },
          ]
        },
        // {
        //   name: 'AI智能体',
        //   url: '/ai-agent',
        //   icon: 'MagicStick'
        // },
        {
          name: '个人中心',
          url: '/personal',
          icon: 'User'
        },
      ],
      btnAuth: ['all', 'add', 'edit', 'delete']
    };
  }
  
  // 运营专员权限 - 大部分菜单，无系统设置 服务监控
  if (pageAuthority === 'manager') {
    return {
      menulist: [
        {
          name: '数据看板',
          url: '/dashboard',
          icon: 'DataLine'
        },
        {
          name: '充电站管理',
          url: '/chargingstation',
          icon: 'Lightning',
          children: [
            {
              name: '充电站监控',
              url: '/chargingstation/monitor',
              icon: 'VideoCamera'
            },
            {
              name: '营收统计',
              url: '/chargingstation/revenue',
              icon: 'DataAnalysis'
            },
            {
              name: '充电桩管理',
              url: '/chargingstation/fault',
              icon: 'Warning'
            }
          ]
        },
        {
          name: '电子地图',
          url: '/map',
          icon: 'MapLocation'
        },
        {
          name: '运营管理',
          url: '/operations',
          icon: 'Files',
          children: [
            {
              name: '订单管理',
              url: '/operations/orders',
              icon: 'DocumentCopy',
            },
            {
              name: '订单详情',
              url: '/operations/detail',
              icon: 'Share'
            },
            {
              name: '计费管理',
              url: '/operations/total',
              icon: 'Money'
            },
          ]
        },
        {
          name: '报警管理',
          url: '/alarm',
          icon: 'Phone'
        },
        {
          name: '会员卡管理',
          url: '/equipment',
          icon: 'Magnet'
        },
        {
          name: 'AI智能体',
          url: '/ai-agent',
          icon: 'MagicStick'
        },
        {
          name: '个人中心',
          url: '/personal',
          icon: 'User'
        },
      ],
      btnAuth: ['add', 'edit']
    };
  }

  // 普通用户权限 - 基础菜单，只有查看权限
  return {
    menulist: [
      {
        name: '数据看板',
        url: '/dashboard',
        icon: 'DataLine'
      },
      {
        name: '充电站管理',
        url: '/chargingstation',
        icon: 'Lightning',
        children: [
          {
            name: '充电站监控',
            url: '/chargingstation/monitor',
            icon: 'VideoCamera'
          },
          {
            name: '充电桩管理',
            url: '/chargingstation/pile-management',
            icon: 'Warning'
          }
        ]
      },
      {
        name: '电子地图',
        url: '/map',
        icon: 'MapLocation'
      },
      {
        name: '报警管理',
        url: '/alarm',
        icon: 'Phone'
      },
      {
        name: '会员卡管理',
        url: '/equipment',
        icon: 'Magnet'
      },
      {
        name: '个人中心',
        url: '/personal',
        icon: 'User'
      },
    ],
    btnAuth: ['add']
  };
};

export async function loginService(params: LoginParams): Promise<LoginResult> {
  const { username, password } = params;

  // 查找用户
  const user = await User.findOne({
    where: { account: username }
  });

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, (user as any).password);
  if (!isPasswordValid) {
    throw new Error('用户名或密码错误');
  }

  // 检查用户状态
  if ((user as any).status !== 1) {
    throw new Error('账号已被禁用');
  }

  // 解析角色（从 page_authority 获取）
  const pageAuthority = (user as any).page_authority || 'user';
  const roles = [pageAuthority];
  
  // 生成 token
  const tokenPayload: TokenPayload = {
    userId: (user as any).id,
    account: (user as any).account,
    roles: roles
  };
  const token = generateToken(tokenPayload);

  // 根据权限获取菜单和按钮权限
  const { menulist, btnAuth } = getMenuAndBtnAuthByRole(pageAuthority);

  return {
    token,
    user: {
      id: (user as any).id,
      username: (user as any).name || (user as any).account,
      roles: roles
    },
    menulist,
    btnAuth
  };
}

// 用户注册服务
export async function registerService(params: RegisterParams) {
  const { account, password, name, phone, id_no, position, department } = params;

  // 1. 数据验证
  if (!account || !password || !name) {
    throw new Error('账号、密码和姓名不能为空');
  }

  // 验证账号格式
  if (!validateAccount(account)) {
    throw new Error('账号格式不正确，应为4-20位字母、数字或下划线');
  }

  // 验证密码强度
  if (!validatePassword(password)) {
    throw new Error('密码长度至少6位');
  }

  // 验证手机号格式（如果提供）
  if (phone && !validatePhone(phone)) {
    throw new Error('手机号格式不正确');
  }

  // 验证身份证号格式（如果提供）
  if (id_no && !validateIdNo(id_no)) {
    throw new Error('身份证号格式不正确');
  }

  // 2. 检查账号是否已存在
  const existingAccount = await User.findOne({
    where: { account }
  });
  if (existingAccount) {
    throw new Error('该账号已被注册');
  }

  // 3. 检查手机号是否已注册（如果提供）
  if (phone) {
    const existingPhone = await User.findOne({
      where: { phone }
    });
    if (existingPhone) {
      throw new Error('该手机号已被注册');
    }
  }

  // 4. 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. 创建用户（默认权限为普通用户）
  const newUser = await User.create({
    account,
    password: hashedPassword,
    name,
    phone: phone || null,
    id_no: id_no || null,
    position: position || '普通用户',
    department: department || '客服部',
    status: 1, // 默认启用
    page_authority: 'user', // 默认普通用户权限
    btn_authority: 'add', // 默认只有添加权限
    role_id: 3, // 普通用户角色ID
  });

  // 6. 返回用户信息（不包含密码）
  return {
    id: (newUser as any).id,
    account: (newUser as any).account,
    name: (newUser as any).name,
    phone: (newUser as any).phone,
    position: (newUser as any).position,
    department: (newUser as any).department,
    page_authority: (newUser as any).page_authority,
  };
}

// 获取用户列表
export async function getUserListService(params: UserListParams) {
  const { page = 1, pageSize = 10, name, department } = params;
  
  const where: any = {};
  
  // 姓名搜索
  if (name) {
    where.name = {
      [Op.like]: `%${name}%`
    };
  }
  
  // 部门筛选
  if (department) {
    where.department = department;
  }
  
  const { count, rows } = await User.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    attributes: { exclude: ['password'] }, // 排除密码字段
    order: [['created_at', 'DESC']]
  });
  
  // 格式化返回数据
  const list = rows.map((user: any) => ({
    account: user.account,
    name: user.name,
    phone: user.phone,
    idNo: user.id_no,
    position: user.position,
    department: user.department,
    pageAuthority: user.page_authority,
    btnAuthority: user.btn_authority,
    status: user.status, // 添加状态字段
  }));
  
  return {
    list,
    total: count
  };
}

// 获取用户权限（根据pageAuthority返回菜单）
export async function getUserAuthService(pageAuthority: string) {
  try {
    // 验证权限级别
    if (!pageAuthority || typeof pageAuthority !== 'string') {
      throw new Error('权限级别参数无效');
    }

    const { menulist, btnAuth } = getMenuAndBtnAuthByRole(pageAuthority);
    
    return {
      list: menulist,
      btn: btnAuth
    };
  } catch (error: any) {
    console.error('getUserAuthService 错误:', error);
    throw error;
  }
}

// 设置用户权限
export async function setUserAuthService(account: string, btnList: string[], pageList: string[]) {
  const user = await User.findOne({ where: { account } });
  
  if (!user) {
    throw new Error('用户不存在');
  }
  
  // 根据选择的菜单URL列表判断权限级别
  // 通过检查是否包含特定菜单来判断权限级别
  let pageAuthority = 'user';
  
  // 如果包含系统设置或招商管理，则为管理员
  if (pageList.includes('/system') || pageList.includes('/document')) {
    pageAuthority = 'admin';
  } 
  // 如果包含营收统计或计费管理，则为运营专员
  else if (pageList.includes('/chargingstation/revenue') || 
           pageList.includes('/operations/total') ||
           pageList.includes('/operations/orders')) {
    pageAuthority = 'manager';
  }
  // 否则为普通用户
  else {
    pageAuthority = 'user';
  }
  
  // 更新用户权限
  await User.update(
    {
      page_authority: pageAuthority,
      btn_authority: btnList.join(',')
    },
    { where: { account } }
  );
  
  return { message: '权限设置成功' };
}

// 删除用户
export async function deleteUserService(account: string) {
  const user = await User.findOne({ where: { account } });
  
  if (!user) {
    throw new Error('用户不存在');
  }
  
  // 不能删除管理员账号
  if ((user as any).page_authority === 'admin' && (user as any).account === 'admin') {
    throw new Error('不能删除系统管理员账号');
  }
  
  await User.destroy({ where: { account } });
  
  return { message: '用户删除成功' };
}

// 禁用/启用用户
export async function toggleUserStatusService(account: string) {
  const user = await User.findOne({ where: { account } });
  
  if (!user) {
    throw new Error('用户不存在');
  }
  
  // 不能禁用管理员账号
  if ((user as any).page_authority === 'admin' && (user as any).account === 'admin') {
    throw new Error('不能禁用系统管理员账号');
  }
  
  const newStatus = (user as any).status === 1 ? 0 : 1;
  
  await User.update(
    { status: newStatus },
    { where: { account } }
  );
  
  return { 
    message: newStatus === 1 ? '用户已启用' : '用户已禁用',
    status: newStatus
  };
}
