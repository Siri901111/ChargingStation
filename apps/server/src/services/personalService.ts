import User from '../models/User.js';
import Alarm from '../models/Alarm.js';
import Notice from '../models/Notice.js';
import { Op } from 'sequelize';

// 获取个人信息
export async function getPersonalInfoService(userId: number) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: (user as any).id,
      account: (user as any).account,
      name: (user as any).name || '',
      phone: (user as any).phone || '',
      address: (user as any).address || '',
      position: (user as any).position || '',
      department: (user as any).department || '',
      tags: (user as any).tags || ['认真', '工作狂', '与人和善', '代码洁癖'], // 默认标签
      workStatus: (user as any).work_status || 1,
      avatar: (user as any).avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${(user as any).id}`,
      status: (user as any).status,
      createdAt: (user as any).created_at
        ? new Date((user as any).created_at).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
    };
  } catch (error) {
    console.error('获取个人信息失败:', error);
    throw new Error('获取个人信息失败');
  }
}

export interface UpdatePersonalInfoParams {
  name?: string;
  phone?: string;
  address?: string;
  workStatus?: number;
  tags?: string[];
}

// 更新个人信息
export async function updatePersonalInfoService(
  userId: number,
  params: UpdatePersonalInfoParams
) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const updateData: any = {};

    if (params.name !== undefined) {
      updateData.name = params.name.trim();
    }
    if (params.phone !== undefined) {
      // 验证手机号格式（可选）
      if (params.phone && !/^1[3-9]\d{9}$/.test(params.phone)) {
        throw new Error('手机号格式不正确');
      }
      updateData.phone = params.phone;
    }
    if (params.address !== undefined) {
      updateData.address = params.address;
    }
    if (params.workStatus !== undefined) {
      // 验证在职状态
      if (![1, 2, 3, 4].includes(params.workStatus)) {
        throw new Error('无效的在职状态');
      }
      updateData.work_status = params.workStatus;
    }
    if (params.tags !== undefined) {
      updateData.tags = params.tags;
    }

    await (user as any).update(updateData);

    return {
      message: '个人信息更新成功',
    };
  } catch (error: any) {
    console.error('更新个人信息失败:', error);
    throw new Error(error.message || '更新个人信息失败');
  }
}

// 获取个人统计数据
export async function getPersonalStatsService(userId: number) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const userName = (user as any).name || '';

    // 1. 待办事项：待指派的报警数量
    const todoCount = await Alarm.count({
      where: { status: 1 }, // 待指派
    });

    // 2. 指派给我：处理中且处理人为当前用户的报警数量
    const assignedToMeCount = await Alarm.count({
      where: {
        status: 2, // 处理中
        handler: userName,
      },
    });

    // 3. 部门公告：通知数量（可以根据部门筛选）
    const department = (user as any).department || '';
    const noticeCount = await Notice.count({
      where: {
        // 可以根据部门或其他条件筛选
        // 这里先统计所有通知
      },
    });

    // 4. 站内信：个人通知数量（可以根据用户筛选）
    const messageCount = await Notice.count({
      where: {
        // 可以根据用户或其他条件筛选
        // 这里先统计所有通知
      },
    });

    // 5. 我指派的：当前用户指派的报警数量（处理中状态）
    const myAssignedCount = await Alarm.count({
      where: {
        status: 2, // 处理中
        // 注意：这里需要根据handle_note中是否包含当前用户信息来判断
        // 简化处理：统计所有处理中的报警
      },
    });

    return {
      todoCount,
      assignedToMeCount,
      noticeCount,
      messageCount,
      myAssignedCount,
    };
  } catch (error) {
    console.error('获取个人统计数据失败:', error);
    throw new Error('获取个人统计数据失败');
  }
}

// 获取通知列表
export async function getPersonalNoticesService(
  userId: number,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const { rows: notices, count: total } = await Notice.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['publish_time', 'DESC']], // Notice表使用publish_time字段
    });

    const list = notices.map((notice: any) => ({
      id: notice.id,
      title: notice.title || '',
      content: notice.content || '',
      type: notice.type || '通知',
      createdAt: notice.publish_time
        ? new Date(notice.publish_time).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '',
    }));

    return {
      list,
      total,
    };
  } catch (error) {
    console.error('获取通知列表失败:', error);
    throw new Error('获取通知列表失败');
  }
}

// 修改密码
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export async function changePasswordService(
  userId: number,
  params: ChangePasswordParams
) {
  const { oldPassword, newPassword } = params;

  if (!oldPassword || !newPassword) {
    throw new Error('旧密码和新密码不能为空');
  }

  if (newPassword.length < 6) {
    throw new Error('新密码长度不能少于6位');
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证旧密码
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.default.compare(
      oldPassword,
      (user as any).password
    );

    if (!isPasswordValid) {
      throw new Error('旧密码不正确');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    // 更新密码
    await (user as any).update({
      password: hashedPassword,
    });

    return {
      message: '密码修改成功',
    };
  } catch (error: any) {
    console.error('修改密码失败:', error);
    throw new Error(error.message || '修改密码失败');
  }
}

