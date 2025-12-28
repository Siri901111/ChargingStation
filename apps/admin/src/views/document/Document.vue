<template>
    <div class="document-container">
        <!-- 顶部操作栏 -->
        <el-card class="header-card" shadow="never">
            <div class="header-content">
                <div class="header-left">
                    <h2 class="page-title">
                        <el-icon class="title-icon"><Document /></el-icon>
                        招商管理
                    </h2>
                    <el-tag type="info" size="small" class="count-tag">
                        共 {{ total }} 篇文章
                    </el-tag>
                </div>
                <div class="header-right">
                    <el-button type="primary" :icon="Plus" @click="handleCreate">
                        创建文章
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 筛选和搜索栏 -->
        <el-card class="filter-card" shadow="never">
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-input
                        v-model="searchParams.keyword"
                        placeholder="搜索文章标题或内容..."
                        clearable
                        @clear="handleSearch"
                        @keyup.enter="handleSearch"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                        <template #append>
                            <el-button :icon="Search" @click="handleSearch" />
                        </template>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-select
                        v-model="searchParams.type"
                        placeholder="文章类型"
                        clearable
                        @change="handleSearch"
                        style="width: 100%"
                    >
                        <el-option label="全部" value="" />
                        <el-option
                            v-for="item in typeList.type"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-select
                        v-model="searchParams.important"
                        placeholder="重要程度"
                        clearable
                        @change="handleSearch"
                        style="width: 100%"
                    >
                        <el-option label="全部" value="" />
                        <el-option
                            v-for="item in typeList.important"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-select
                        v-model="searchParams.publish"
                        placeholder="发布渠道"
                        clearable
                        @change="handleSearch"
                        style="width: 100%"
                    >
                        <el-option label="全部" value="" />
                        <el-option
                            v-for="item in typeList.publish"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-select
                        v-model="searchParams.status"
                        placeholder="发布状态"
                        clearable
                        @change="handleSearch"
                        style="width: 100%"
                    >
                        <el-option label="全部" value="" />
                        <el-option label="草稿" :value="0" />
                        <el-option label="已发布" :value="1" />
                    </el-select>
                </el-col>
                <el-col :span="2">
                    <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 文章列表 -->
        <div class="document-list" v-loading="loading">
            <el-empty v-if="!loading && documentList.length === 0" description="暂无文章" :image-size="120" />
            <el-row :gutter="20" v-else>
                <el-col
                    :span="8"
                    v-for="doc in documentList"
                    :key="doc.id"
                    class="document-col"
                >
                    <el-card
                        class="document-card"
                        shadow="hover"
                        :class="{ published: doc.status === 1, draft: doc.status === 0 }"
                    >
                        <div class="card-header">
                            <div class="card-title-section">
                                <h3 class="document-title" :title="doc.title">
                                    {{ doc.title || '无标题' }}
                                </h3>
                                <div class="card-tags">
                                    <el-tag
                                        :type="getTypeTagType(doc.type)"
                                        size="small"
                                        effect="plain"
                                    >
                                        {{ doc.type }}
                                    </el-tag>
                                    <el-tag
                                        :type="getImportantTagType(doc.important)"
                                        size="small"
                                        effect="plain"
                                    >
                                        {{ doc.important }}
                                    </el-tag>
                                    <el-tag
                                        :type="doc.status === 1 ? 'success' : 'info'"
                                        size="small"
                                    >
                                        {{ doc.status === 1 ? '已发布' : '草稿' }}
                                    </el-tag>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card-content">
                            <div class="content-preview" v-html="getContentPreview(doc.content)"></div>
                        </div>

                        <div class="card-footer">
                            <div class="card-meta">
                                <div class="meta-item">
                                    <el-icon><User /></el-icon>
                                    <span>{{ doc.authorName || '未知' }}</span>
                                </div>
                                <div class="meta-item">
                                    <el-icon><Calendar /></el-icon>
                                    <span>{{ formatDate(doc.createdAt) }}</span>
                                </div>
                                <div class="meta-item" v-if="doc.publish">
                                    <el-icon><Promotion /></el-icon>
                                    <span>{{ doc.publish }}</span>
                                </div>
                            </div>
                            <div class="card-actions">
                                <el-button
                                    text
                                    type="primary"
                                    size="small"
                                    :icon="View"
                                    @click="handleView(doc)"
                                >
                                    查看
                                </el-button>
                                <el-button
                                    text
                                    type="primary"
                                    size="small"
                                    :icon="Edit"
                                    @click="handleEdit(doc)"
                                >
                                    编辑
                                </el-button>
                                <el-button
                                    text
                                    type="success"
                                    size="small"
                                    :icon="Promotion"
                                    v-if="doc.status === 0"
                                    @click="handlePublish(doc)"
                                >
                                    发布
                                </el-button>
                                <el-button
                                    text
                                    type="danger"
                                    size="small"
                                    :icon="Delete"
                                    @click="handleDelete(doc)"
                                >
                                    删除
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 分页 -->
        <el-card class="pagination-card" shadow="never" v-if="total > 0">
            <el-pagination
                v-model:current-page="pageInfo.page"
                v-model:page-size="pageInfo.pageSize"
                :page-sizes="[12, 24, 36, 48]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </el-card>

        <!-- 创建/编辑文章对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="90%"
            :close-on-click-modal="false"
            class="document-dialog"
        >
            <el-form
                :model="documentForm"
                :rules="formRules"
                ref="formRef"
                label-width="100px"
                class="document-form"
            >
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="文章标题" prop="title">
                            <el-input
                                v-model="documentForm.title"
                                placeholder="请输入文章标题"
                                maxlength="100"
                                show-word-limit
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="文章类型" prop="type">
                            <el-select
                                v-model="documentForm.type"
                                placeholder="请选择"
                                style="width: 100%"
                            >
                                <el-option
                                    v-for="item in typeList.type"
                                    :key="item"
                                    :label="item"
                                    :value="item"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="重要程度" prop="important">
                            <el-select
                                v-model="documentForm.important"
                                placeholder="请选择"
                                style="width: 100%"
                            >
                                <el-option
                                    v-for="item in typeList.important"
                                    :key="item"
                                    :label="item"
                                    :value="item"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="24">
                        <el-form-item label="发布渠道" prop="publish">
                            <el-select
                                v-model="documentForm.publish"
                                placeholder="请选择发布渠道"
                                style="width: 100%"
                            >
                                <el-option
                                    v-for="item in typeList.publish"
                                    :key="item"
                                    :label="item"
                                    :value="item"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="文章内容" prop="content">
                    <Editor
                        v-model="documentForm.content"
                        api-key="xvbamfm2vokka8qoim9r801qtdlldskjschd51yha7zhuusp"
                        :init="editorConfig"
                        style="min-height: 500px"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="info" @click="handleSaveDraft" :loading="saving">
                        保存草稿
                    </el-button>
                    <el-button type="primary" @click="handleSubmit" :loading="saving">
                        {{ isEdit ? '更新' : '创建' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 查看文章详情对话框 -->
        <el-dialog
            v-model="viewDialogVisible"
            title="文章详情"
            width="80%"
            class="view-dialog"
        >
            <div class="view-content" v-if="viewDocument">
                <div class="view-header">
                    <h2>{{ viewDocument.title }}</h2>
                    <div class="view-tags">
                        <el-tag :type="getTypeTagType(viewDocument.type)" size="small">
                            {{ viewDocument.type }}
                        </el-tag>
                        <el-tag :type="getImportantTagType(viewDocument.important)" size="small">
                            {{ viewDocument.important }}
                        </el-tag>
                        <el-tag :type="viewDocument.status === 1 ? 'success' : 'info'" size="small">
                            {{ viewDocument.status === 1 ? '已发布' : '草稿' }}
                        </el-tag>
                    </div>
                </div>
                <el-divider />
                <div class="view-meta">
                    <div class="meta-row">
                        <span><el-icon><User /></el-icon> 作者：{{ viewDocument.authorName || '未知' }}</span>
                        <span><el-icon><Calendar /></el-icon> 创建时间：{{ formatDate(viewDocument.createdAt) }}</span>
                        <span v-if="viewDocument.updatedAt">
                            <el-icon><Edit /></el-icon> 更新时间：{{ formatDate(viewDocument.updatedAt) }}
                        </span>
                    </div>
                    <div class="meta-row" v-if="viewDocument.publish">
                        <span><el-icon><Promotion /></el-icon> 发布渠道：{{ viewDocument.publish }}</span>
                    </div>
                </div>
                <el-divider />
                <div class="view-body" v-html="viewDocument.content"></div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import Editor from '@tinymce/tinymce-vue'
import {
    Document, Plus, Search, Refresh, View, Edit, Delete, Promotion,
    User, Calendar
} from '@element-plus/icons-vue'
import {
    getDocumentTypeListApi,
    getDocumentListApi,
    getDocumentDetailApi,
    createDocumentApi,
    updateDocumentApi,
    deleteDocumentApi,
    publishDocumentApi
} from '@/api/document'

interface DocumentItem {
    id: number
    title: string
    content: string
    type: string
    important: string
    publish: string
    status: number
    authorName?: string
    createdAt: string
    updatedAt?: string
}

const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const documentList = ref<DocumentItem[]>([])
const typeList = ref({
    type: [] as string[],
    important: [] as string[],
    publish: [] as string[]
})

const searchParams = reactive({
    keyword: '',
    type: '',
    important: '',
    publish: '',
    status: ''
})

const pageInfo = reactive({
    page: 1,
    pageSize: 12
})

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const currentDocumentId = ref<number | null>(null)
const viewDocument = ref<DocumentItem | null>(null)
const formRef = ref<FormInstance>()

const documentForm = reactive({
    title: '',
    content: '',
    type: '',
    important: '',
    publish: [] as string[]
})

const formRules: FormRules = {
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择文章类型', trigger: 'change' }
    ],
    important: [
        { required: true, message: '请选择重要程度', trigger: 'change' }
    ],
    publish: [
        { required: true, message: '请选择发布渠道', trigger: 'change' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
    ]
}

const editorConfig = {
    language: 'zh_CN',
    height: 500,
    menubar: true,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
}

const dialogTitle = computed(() => {
    return isEdit.value ? '编辑文章' : '创建文章'
})

// 加载类型列表
const loadTypeList = async () => {
    try {
        const res = await getDocumentTypeListApi()
        if (res.code === 200 && res.data) {
            typeList.value = res.data
        }
    } catch (error) {
        console.error('加载类型列表失败:', error)
    }
}

// 加载文章列表
const loadDocumentList = async () => {
    loading.value = true
    try {
        const params: any = {
            page: pageInfo.page,
            pageSize: pageInfo.pageSize
        }
        
        if (searchParams.keyword) params.keyword = searchParams.keyword
        if (searchParams.type) params.type = searchParams.type
        if (searchParams.important) params.important = searchParams.important
        if (searchParams.publish) params.publish = searchParams.publish
        if (searchParams.status !== '') params.status = Number(searchParams.status)

        const res = await getDocumentListApi(params)
        if (res.code === 200 && res.data) {
            documentList.value = res.data.list || []
            total.value = res.data.total || 0
        } else {
            ElMessage.error(res.message || '加载文章列表失败')
        }
    } catch (error: any) {
        console.error('加载文章列表失败:', error)
        ElMessage.error(error.message || '加载文章列表失败')
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    pageInfo.page = 1
    loadDocumentList()
}

// 重置
const handleReset = () => {
    searchParams.keyword = ''
    searchParams.type = ''
    searchParams.important = ''
    searchParams.publish = ''
    searchParams.status = ''
    pageInfo.page = 1
    loadDocumentList()
}

// 分页
const handleSizeChange = (size: number) => {
    pageInfo.pageSize = size
    pageInfo.page = 1
    loadDocumentList()
}

const handleCurrentChange = (page: number) => {
    pageInfo.page = page
    loadDocumentList()
}

// 创建文章
const handleCreate = () => {
    isEdit.value = false
    currentDocumentId.value = null
    resetForm()
    dialogVisible.value = true
}

// 编辑文章
const handleEdit = async (doc: DocumentItem) => {
    isEdit.value = true
    currentDocumentId.value = doc.id
    try {
        const res = await getDocumentDetailApi(doc.id)
        if (res.code === 200 && res.data) {
            const data = res.data
            documentForm.title = data.title || ''
            documentForm.content = data.content || ''
            documentForm.type = data.type || ''
            documentForm.important = data.important || ''
            documentForm.publish = data.publish || ''
            dialogVisible.value = true
        } else {
            ElMessage.error(res.message || '获取文章详情失败')
        }
    } catch (error: any) {
        console.error('获取文章详情失败:', error)
        ElMessage.error(error.message || '获取文章详情失败')
    }
}

// 查看文章
const handleView = async (doc: DocumentItem) => {
    try {
        const res = await getDocumentDetailApi(doc.id)
        if (res.code === 200 && res.data) {
            viewDocument.value = res.data
            viewDialogVisible.value = true
        } else {
            ElMessage.error(res.message || '获取文章详情失败')
        }
    } catch (error: any) {
        console.error('获取文章详情失败:', error)
        ElMessage.error(error.message || '获取文章详情失败')
    }
}

// 发布文章
const handlePublish = async (doc: DocumentItem) => {
    try {
        await ElMessageBox.confirm('确定要发布这篇文章吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        
        const res = await publishDocumentApi(doc.id, {})
        
        if (res.code === 200) {
            ElMessage.success(res.message || '发布成功')
            loadDocumentList()
        } else {
            ElMessage.error(res.message || '发布失败')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('发布文章失败:', error)
            ElMessage.error(error.message || '发布失败')
        }
    }
}

// 删除文章
const handleDelete = async (doc: DocumentItem) => {
    try {
        await ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可恢复！', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        
        const res = await deleteDocumentApi(doc.id)
        if (res.code === 200) {
            ElMessage.success(res.message || '删除成功')
            loadDocumentList()
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('删除文章失败:', error)
            ElMessage.error(error.message || '删除失败')
        }
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return
    
    try {
        await formRef.value.validate()
        saving.value = true
        
        const params: any = {
            title: documentForm.title,
            content: documentForm.content,
            type: documentForm.type,
            important: documentForm.important,
            publish: documentForm.publish
        }
        
        let res
        if (isEdit.value && currentDocumentId.value) {
            res = await updateDocumentApi(currentDocumentId.value, params)
        } else {
            res = await createDocumentApi(params)
        }
        
        if (res.code === 200) {
            ElMessage.success(res.message || (isEdit.value ? '更新成功' : '创建成功'))
            dialogVisible.value = false
            loadDocumentList()
        } else {
            ElMessage.error(res.message || '操作失败')
        }
    } catch (error: any) {
        if (error !== false) {
            console.error('操作失败:', error)
            ElMessage.error(error.message || '操作失败')
        }
    } finally {
        saving.value = false
    }
}

// 保存草稿
const handleSaveDraft = async () => {
    if (!formRef.value) return
    
    try {
        await formRef.value.validate()
        saving.value = true
        
        const params: any = {
            title: documentForm.title,
            content: documentForm.content,
            type: documentForm.type,
            important: documentForm.important,
            publish: documentForm.publish
        }
        
        let res
        if (isEdit.value && currentDocumentId.value) {
            res = await updateDocumentApi(currentDocumentId.value, params)
        } else {
            res = await createDocumentApi(params)
        }
        
        if (res.code === 200) {
            ElMessage.success('草稿保存成功')
            dialogVisible.value = false
            loadDocumentList()
        } else {
            ElMessage.error(res.message || '保存失败')
        }
    } catch (error: any) {
        if (error !== false) {
            console.error('保存草稿失败:', error)
            ElMessage.error(error.message || '保存失败')
        }
    } finally {
        saving.value = false
    }
}

// 重置表单
const resetForm = () => {
    documentForm.title = ''
    documentForm.content = ''
    documentForm.type = ''
    documentForm.important = ''
    documentForm.publish = []
    formRef.value?.resetFields()
}

// 获取内容预览
const getContentPreview = (content: string) => {
    if (!content) return '暂无内容'
    // 移除HTML标签，只保留文本
    const text = content.replace(/<[^>]*>/g, '').trim()
    return text.length > 100 ? text.substring(0, 100) + '...' : text
}

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 获取类型标签类型
const getTypeTagType = (type: string) => {
    const typeMap: Record<string, string> = {
        '招商类': 'primary',
        '广告类': 'success',
        '公告类': 'warning',
        '提示类': 'info',
        '日常类': '',
        '告警类': 'danger',
        '其他': 'info'
    }
    return typeMap[type] || 'info'
}

// 获取重要程度标签类型
const getImportantTagType = (important: string) => {
    const importantMap: Record<string, string> = {
        '一级': 'danger',
        '二级': 'warning',
        '三级': 'info',
        '四级': ''
    }
    return importantMap[important] || 'info'
}

onMounted(() => {
    loadTypeList()
    loadDocumentList()
})
</script>

<style lang="less" scoped>
.document-container {
    padding: 20px;
    background-color: var(--bg-base);
    min-height: calc(100vh - 60px);
}

.header-card {
    margin-bottom: 20px;
    border-radius: 8px;
    
    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
            
            .page-title {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 10px;
                
                .title-icon {
                    color: var(--el-color-primary);
                }
            }
            
            .count-tag {
                font-size: 12px;
            }
        }
    }
}

.filter-card {
    margin-bottom: 20px;
    border-radius: 8px;
}

.document-list {
    min-height: 400px;
    
    .document-col {
        margin-bottom: 20px;
    }
    
    .document-card {
        height: 100%;
        border-radius: 12px;
        transition: all 0.3s;
        border: 1px solid #ebeef5;
        
        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        &.published {
            border-left: 4px solid #67c23a;
        }
        
        &.draft {
            border-left: 4px solid #909399;
        }
        
        .card-header {
            margin-bottom: 15px;
            
            .card-title-section {
                .document-title {
                    margin: 0 0 10px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .card-tags {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
            }
        }
        
        .card-content {
            margin-bottom: 15px;
            min-height: 80px;
            
            .content-preview {
                color: #606266;
                font-size: 14px;
                line-height: 1.6;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        }
        
        .card-footer {
            .card-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #ebeef5;
                flex-wrap: wrap;
                
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    color: #909399;
                    
                    .el-icon {
                        font-size: 14px;
                    }
                }
            }
            
            .card-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
        }
    }
}

.pagination-card {
    margin-top: 20px;
    border-radius: 8px;
    text-align: center;
}

.document-dialog {
    :deep(.el-dialog__body) {
        padding: 20px;
    }
    
    .document-form {
        .el-form-item {
            margin-bottom: 20px;
        }
    }
}

.view-dialog {
    .view-content {
        .view-header {
            margin-bottom: 20px;
            
            h2 {
                margin: 0 0 15px 0;
                font-size: 24px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .view-tags {
                display: flex;
                gap: 10px;
            }
        }
        
        .view-meta {
            margin-bottom: 20px;
            
            .meta-row {
                display: flex;
                gap: 30px;
                margin-bottom: 10px;
                font-size: 14px;
                color: #606266;
                
                span {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
            }
        }
        
        .view-body {
            padding: 20px;
            background: #f5f7fa;
            border-radius: 8px;
            line-height: 1.8;
            color: #303133;
            
            :deep(img) {
                max-width: 100%;
                height: auto;
            }
        }
    }
}
</style>
