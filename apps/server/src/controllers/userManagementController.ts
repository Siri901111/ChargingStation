import type { Request, Response } from 'express';
import { getUserListService, getUserAuthService, setUserAuthService, deleteUserService, toggleUserStatusService } from '../services/userService.js';

// 获取用户列表（分页、搜索）
export async function getUserListController(req: Request, res: Response) {
  try {
    const { page, pageSize, name, department } = req.body;

    const result = await getUserListService({
      page: page || 1,
      pageSize: pageSize || 10,
      name,
      department
    });

    return res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      code: 500,
      message: error.message || '获取用户列表失败',
      data: null
    });
  }
}

// 获取用户权限（根据权限返回菜单）
export async function getUserAuthController(req: Request, res: Response) {
  try {
    const { pageAuthority } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        code: 401,
        message: '未认证',
        data: null
      });
    }

    // 获取当前用户的权限级别（从 token 中）
    const currentUserRole = currentUser.roles?.[0] || 'user';

    // 确定要查询的权限级别
    let targetAuthority: string;
    
    // 如果请求指定了 pageAuthority，需要检查权限
    if (pageAuthority && typeof pageAuthority === 'string' && pageAuthority.trim()) {
      // 只有管理员可以预览其他权限级别的菜单（用于权限设置页面）
      if (currentUserRole !== 'admin') {
        // 非管理员只能查看自己的权限
        if (pageAuthority !== currentUserRole) {
          return res.status(403).json({
            code: 403,
            message: '无权查看其他权限级别的菜单',
            data: null
          });
        }
      }
      targetAuthority = pageAuthority.trim();
    } else {
      // 如果没有指定 pageAuthority，返回当前登录用户的权限菜单
      targetAuthority = currentUserRole;
    }

    // 验证权限级别是否有效
    if (!['admin', 'manager', 'user'].includes(targetAuthority)) {
      console.error('无效的权限级别:', targetAuthority);
      return res.status(400).json({
        code: 400,
        message: '无效的权限级别',
        data: null
      });
    }

    // 获取权限菜单
    const result = await getUserAuthService(targetAuthority);
    
    return res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取用户权限失败:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取用户权限失败',
      data: null
    });
  }
}

// 设置用户权限
export async function setUserAuthController(req: Request, res: Response) {
  try {
    const { account, btnList, pageList } = req.body;

    if (!account) {
      return res.status(400).json({
        code: 400,
        message: '账号不能为空',
        data: null
      });
    }

    if (!btnList || !Array.isArray(btnList)) {
      return res.status(400).json({
        code: 400,
        message: '按钮权限列表不能为空',
        data: null
      });
    }

    if (!pageList || !Array.isArray(pageList)) {
      return res.status(400).json({
        code: 400,
        message: '页面权限列表不能为空',
        data: null
      });
    }

    // 检查权限：只有管理员可以设置权限
    const currentUser = req.user;
    if (!currentUser || currentUser.roles[0] !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有管理员可以设置用户权限',
        data: null
      });
    }

    const result = await setUserAuthService(account, btnList, pageList);

    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '设置用户权限失败',
      data: null
    });
  }
}

// 删除用户
export async function deleteUserController(req: Request, res: Response) {
  try {
    const { account } = req.body;

    if (!account) {
      return res.status(400).json({
        code: 400,
        message: '账号不能为空',
        data: null
      });
    }

    // 检查权限：只有管理员可以删除用户
    const currentUser = req.user;
    if (!currentUser || currentUser.roles[0] !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有管理员可以删除用户',
        data: null
      });
    }

    // 不能删除自己
    if (account === currentUser.account) {
      return res.status(400).json({
        code: 400,
        message: '不能删除自己的账号',
        data: null
      });
    }

    const result = await deleteUserService(account);

    return res.json({
      code: 200,
      message: result.message,
      data: null
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 
                       error.message.includes('不能删除') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '删除用户失败',
      data: null
    });
  }
}

// 禁用/启用用户
export async function toggleUserStatusController(req: Request, res: Response) {
  try {
    const { account } = req.body;

    if (!account) {
      return res.status(400).json({
        code: 400,
        message: '账号不能为空',
        data: null
      });
    }

    // 检查权限：只有管理员可以禁用/启用用户
    const currentUser = req.user;
    if (!currentUser || currentUser.roles[0] !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有管理员可以禁用/启用用户',
        data: null
      });
    }

    // 不能禁用/启用自己
    if (account === currentUser.account) {
      return res.status(400).json({
        code: 400,
        message: '不能修改自己的账号状态',
        data: null
      });
    }

    const result = await toggleUserStatusService(account);

    return res.json({
      code: 200,
      message: result.message,
      data: {
        status: result.status
      }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 
                       error.message.includes('不能禁用') ? 400 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '操作失败',
      data: null
    });
  }
}

