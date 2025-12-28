/**
 * 工作区管理工具函数
 * 参考字节跳动/腾讯中后台设计规范
 */

export interface Workspace {
    id: string
    name: string
    layout: any
    createdAt: string
}

const WORKSPACES_KEY = 'workspaces'
const CURRENT_WORKSPACE_KEY = 'current-workspace'

/**
 * 获取所有工作区
 */
export function getWorkspaces(): Workspace[] {
    const workspaces = localStorage.getItem(WORKSPACES_KEY)
    return workspaces ? JSON.parse(workspaces) : []
}

/**
 * 保存工作区
 */
export function saveWorkspace(workspace: Workspace) {
    const workspaces = getWorkspaces()
    const index = workspaces.findIndex(w => w.id === workspace.id)
    
    if (index >= 0) {
        workspaces[index] = workspace
    } else {
        workspaces.push(workspace)
    }
    
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces))
}

/**
 * 删除工作区
 */
export function deleteWorkspace(id: string) {
    const workspaces = getWorkspaces().filter(w => w.id !== id)
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces))
}

/**
 * 设置当前工作区
 */
export function setCurrentWorkspace(id: string) {
    localStorage.setItem(CURRENT_WORKSPACE_KEY, id)
}

/**
 * 获取当前工作区
 */
export function getCurrentWorkspace(): Workspace | null {
    const id = localStorage.getItem(CURRENT_WORKSPACE_KEY)
    if (!id) return null
    
    const workspaces = getWorkspaces()
    return workspaces.find(w => w.id === id) || null
}

