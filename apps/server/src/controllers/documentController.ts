import type { Request, Response } from 'express';
import {
  getDocumentTypeListService,
  createDocumentService,
  getDocumentListService,
  getDocumentDetailService,
  updateDocumentService,
  deleteDocumentService,
  publishDocumentService,
} from '../services/documentService.js';

// GET /api/document - 获取文章类型列表
export async function getDocumentTypeListController(
  req: Request,
  res: Response
) {
  try {
    const result = await getDocumentTypeListService();
    return res.json({
      code: 200,
      message: '操作成功',
      data: result,
    });
  } catch (error: any) {
    console.error('获取文章类型列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取文章类型列表失败',
      data: null,
    });
  }
}

// POST /api/document - 创建文章
export async function createDocumentController(req: Request, res: Response) {
  try {
    const { type, important, publish, content, title } = req.body;
    const userId = req.user?.userId; // 从JWT中获取用户ID

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null,
      });
    }

    if (!type || !important || !publish || !content) {
      return res.status(400).json({
        code: 400,
        message: '文章类型、重要程度、发布渠道和内容不能为空',
        data: null,
      });
    }

    const result = await createDocumentService({
      type,
      important,
      publish,
      content,
      title: title || undefined,
      author_id: userId,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error: any) {
    const statusCode =
      error.message.includes('不存在') ||
      error.message.includes('不能为空') ||
      error.message.includes('无效')
        ? 400
        : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '创建文章失败',
      data: null,
    });
  }
}

// GET /api/document/list - 获取文章列表
export async function getDocumentListController(req: Request, res: Response) {
  try {
    const {
      page,
      pageSize,
      type,
      important,
      publish,
      status,
      keyword,
    } = req.query;

    const params: any = {
      page: page && !isNaN(Number(page)) ? Number(page) : 1,
      pageSize: pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10,
    };

    if (type && typeof type === 'string') {
      params.type = type;
    }
    if (important && typeof important === 'string') {
      params.important = important;
    }
    if (publish && typeof publish === 'string') {
      params.publish = publish;
    }
    if (status && !isNaN(Number(status))) {
      params.status = Number(status);
    }
    if (keyword && typeof keyword === 'string') {
      params.keyword = keyword;
    }

    const result = await getDocumentListService(params);

    return res.json({
      code: 200,
      message: '获取文章列表成功',
      data: result,
    });
  } catch (error: any) {
    console.error('获取文章列表控制器错误:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '获取文章列表失败',
      data: null,
    });
  }
}

// GET /api/document/:id - 获取文章详情
export async function getDocumentDetailController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '文章ID无效',
        data: null,
      });
    }

    const result = await getDocumentDetailService(Number(id));

    return res.json({
      code: 200,
      message: '获取文章详情成功',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '获取文章详情失败',
      data: null,
    });
  }
}

// PUT /api/document/:id - 更新文章
export async function updateDocumentController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { type, important, publish, content, title } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '文章ID无效',
        data: null,
      });
    }

    const result = await updateDocumentService(Number(id), {
      type,
      important,
      publish,
      content,
      title,
    });

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '更新文章失败',
      data: null,
    });
  }
}

// DELETE /api/document/:id - 删除文章
export async function deleteDocumentController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '文章ID无效',
        data: null,
      });
    }

    const result = await deleteDocumentService(Number(id));

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '删除文章失败',
      data: null,
    });
  }
}

// POST /api/document/:id/publish - 发布文章
export async function publishDocumentController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        code: 400,
        message: '文章ID无效',
        data: null,
      });
    }

    const result = await publishDocumentService(Number(id));

    return res.json({
      code: 200,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('不存在') ? 404 : 500;
    return res.status(statusCode).json({
      code: statusCode,
      message: error.message || '发布文章失败',
      data: null,
    });
  }
}

