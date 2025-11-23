import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        account: string;
        roles: string[];
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers.token as string;

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
      data: null
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      account: decoded.account,
      roles: decoded.roles
    };
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌',
      data: null
    });
  }
}

