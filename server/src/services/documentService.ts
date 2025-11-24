import { Op } from 'sequelize';
import Document from '../models/Document.js';
import User from '../models/User.js';

// 获取文章类型、重要程度、发布渠道列表
export async function getDocumentTypeListService() {
  try {
    // 从数据库获取所有已使用的类型（可选，也可以硬编码）
    // 这里先返回固定的类型列表，后续可以从数据库配置表读取
    return {
      type: ['招商类', '广告类', '公告类', '提示类', '日常类', '告警类', '其他'],
      important: ['一级', '二级', '三级', '四级'],
      publish: ['站内信', '公众号', '小程序', 'H5', '官网'],
    };
  } catch (error) {
    console.error('获取文章类型列表失败:', error);
    throw new Error('获取文章类型列表失败');
  }
}

export interface CreateDocumentParams {
  type: string; // 文章类型
  important: string; // 重要程度
  publish: string; // 发布渠道
  content: string; // 富文本内容
  title?: string; // 文章标题（可选）
  author_id: number; // 作者ID
}

// 创建文章
export async function createDocumentService(params: CreateDocumentParams) {
  const { type, important, publish, content, title, author_id } = params;

  // 验证必填字段
  if (!type || !important || !publish || !content) {
    throw new Error('文章类型、重要程度、发布渠道和内容不能为空');
  }

  // 验证作者是否存在
  const author = await User.findByPk(author_id);
  if (!author) {
    throw new Error('作者不存在');
  }

  // 验证类型是否在允许的列表中
  const allowedTypes = ['招商类', '广告类', '公告类', '提示类', '日常类', '告警类', '其他'];
  if (!allowedTypes.includes(type)) {
    throw new Error('无效的文章类型');
  }

  const allowedImportant = ['一级', '二级', '三级', '四级'];
  if (!allowedImportant.includes(important)) {
    throw new Error('无效的重要程度');
  }

  const allowedPublish = ['站内信', '公众号', '小程序', 'H5', '官网'];
  if (!allowedPublish.includes(publish)) {
    throw new Error('无效的发布渠道');
  }

  try {
    const document = await Document.create({
      type,
      important,
      publish,
      content,
      title: title || null,
      author_id,
      status: 1, // 默认草稿状态
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: (document as any).id,
      message: '文章创建成功',
    };
  } catch (error) {
    console.error('创建文章失败:', error);
    throw new Error('创建文章失败');
  }
}

export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  important?: string;
  publish?: string;
  status?: number;
  keyword?: string; // 搜索关键词（标题或内容）
}

// 获取文章列表
export async function getDocumentListService(params: DocumentListParams) {
  const {
    page = 1,
    pageSize = 10,
    type,
    important,
    publish,
    status,
    keyword,
  } = params;

  const where: any = {};

  if (type) {
    where.type = type;
  }
  if (important) {
    where.important = important;
  }
  if (publish) {
    where.publish = publish;
  }
  if (status !== undefined) {
    where.status = status;
  } else {
    // 默认不显示已删除的文章
    where.status = { [Op.ne]: 3 };
  }

  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { content: { [Op.like]: `%${keyword}%` } },
    ];
  }

  try {
    const { rows: documents, count: total } = await Document.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'account'],
        },
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['created_at', 'DESC']],
    });

    const list = documents.map((doc: any) => ({
      id: doc.id,
      type: doc.type,
      important: doc.important,
      publish: doc.publish,
      title: doc.title || '无标题',
      content: doc.content,
      status: doc.status,
      authorName: doc.author?.name || '未知',
      authorAccount: doc.author?.account || '',
      createdAt: doc.created_at
        ? new Date(doc.created_at).toLocaleString('zh-CN', { hour12: false })
        : '',
      updatedAt: doc.updated_at
        ? new Date(doc.updated_at).toLocaleString('zh-CN', { hour12: false })
        : '',
    }));

    return {
      list,
      total,
    };
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw new Error('获取文章列表失败');
  }
}

// 获取文章详情
export async function getDocumentDetailService(documentId: number) {
  const document = await Document.findOne({
    where: { id: documentId },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'account'],
      },
    ],
  });

  if (!document) {
    throw new Error('文章不存在');
  }

  return {
    id: (document as any).id,
    type: (document as any).type,
    important: (document as any).important,
    publish: (document as any).publish,
    title: (document as any).title || '无标题',
    content: (document as any).content,
    status: (document as any).status,
    authorId: (document as any).author_id,
    authorName: (document as any).author?.name || '未知',
    authorAccount: (document as any).author?.account || '',
    createdAt: (document as any).created_at
      ? new Date((document as any).created_at).toLocaleString('zh-CN', {
          hour12: false,
        })
      : '',
    updatedAt: (document as any).updated_at
      ? new Date((document as any).updated_at).toLocaleString('zh-CN', {
          hour12: false,
        })
      : '',
  };
}

// 更新文章
export async function updateDocumentService(
  documentId: number,
  params: Partial<CreateDocumentParams>
) {
  const document = await Document.findByPk(documentId);
  if (!document) {
    throw new Error('文章不存在');
  }

  const updateData: any = {
    updated_at: new Date(),
  };

  if (params.type !== undefined) {
    updateData.type = params.type;
  }
  if (params.important !== undefined) {
    updateData.important = params.important;
  }
  if (params.publish !== undefined) {
    updateData.publish = params.publish;
  }
  if (params.content !== undefined) {
    updateData.content = params.content;
  }
  if (params.title !== undefined) {
    updateData.title = params.title;
  }

  try {
    await (document as any).update(updateData);
    return {
      message: '文章更新成功',
    };
  } catch (error) {
    console.error('更新文章失败:', error);
    throw new Error('更新文章失败');
  }
}

// 删除文章（软删除）
export async function deleteDocumentService(documentId: number) {
  const document = await Document.findByPk(documentId);
  if (!document) {
    throw new Error('文章不存在');
  }

  try {
    await (document as any).update({
      status: 3, // 已删除
      updated_at: new Date(),
    });
    return {
      message: '文章删除成功',
    };
  } catch (error) {
    console.error('删除文章失败:', error);
    throw new Error('删除文章失败');
  }
}

// 发布文章
export async function publishDocumentService(documentId: number) {
  const document = await Document.findByPk(documentId);
  if (!document) {
    throw new Error('文章不存在');
  }

  try {
    await (document as any).update({
      status: 2, // 已发布
      updated_at: new Date(),
    });
    return {
      message: '文章发布成功',
    };
  } catch (error) {
    console.error('发布文章失败:', error);
    throw new Error('发布文章失败');
  }
}

