import type { Request, Response } from 'express';
import { loginService, registerService } from '../services/userService.js';

export async function loginController(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    const result = await loginService({ username, password });

    return res.json({
      code: 200,
      message: '登录成功',
      data: result
    });
  } catch (error: any) {
    return res.status(401).json({
      code: 401,
      message: error.message || '登录失败',
      data: null
    });
  }
}

export async function registerController(req: Request, res: Response) {
  try {
    const { account, password, name, phone, id_no, position, department } = req.body;

    // 基础验证
    if (!account || !password || !name) {
      return res.status(400).json({
        code: 400,
        message: '账号、密码和姓名不能为空',
        data: null
      });
    }

    const result = await registerService({
      account,
      password,
      name,
      phone,
      id_no,
      position,
      department
    });

    return res.json({
      code: 200,
      message: '注册成功',
      data: result
    });
  } catch (error: any) {
    // 根据错误类型返回不同的状态码
    const statusCode = error.message.includes('已被注册') || 
                      error.message.includes('格式不正确') ? 400 : 500;
    
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '注册失败',
      data: null
    });
  }
}

