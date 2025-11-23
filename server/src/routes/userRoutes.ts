import { Router } from 'express';
import { loginController, registerController } from '../controllers/userController.js';
import { 
  getUserListController, 
  getUserAuthController,
  setUserAuthController,
  deleteUserController,
  toggleUserStatusController
} from '../controllers/userManagementController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// 用户登录
router.post('/login', loginController);

// 用户注册
router.post('/register', registerController);

// 用户管理接口（需要认证）
// 获取用户列表（分页、搜索）
router.post('/permissionList', authMiddleware, getUserListController);

// 获取用户权限（根据权限返回菜单）
router.post('/userAuth', authMiddleware, getUserAuthController);

// 设置用户权限
router.post('/setAuth', authMiddleware, setUserAuthController);

// 删除用户
router.post('/deleteUser', authMiddleware, deleteUserController);

// 禁用/启用用户
router.post('/toggleUserStatus', authMiddleware, toggleUserStatusController);

export default router;

