<template>
    <div class="login-container">
        <!-- 左侧装饰区域 -->
        <div class="left-section" ref="leftSectionRef">
            <div class="logo-container" ref="logoRef">
                <div class="logo-wrapper">
                    <img :src="logo" alt="Logo" class="logo-image" />
                    <div class="logo-glow"></div>
                </div>
                <h1 class="platform-title" ref="titleRef">动力港能源管理平台</h1>
                <p class="platform-subtitle" ref="subtitleRef">Power Port Energy Management Platform</p>
            </div>
            <div class="features" ref="featuresRef">
                <div class="feature-item" v-for="(feature, index) in features" :key="index">
                    <el-icon class="feature-icon"><component :is="feature.icon" /></el-icon>
                    <span>{{ feature.text }}</span>
                </div>
            </div>
        </div>

        <!-- 右侧登录表单区域 -->
        <div class="right-section" ref="rightSectionRef">
            <div class="login-card" ref="loginCardRef">
                <div class="card-header">
                    <h2 class="welcome-title">欢迎回来</h2>
                    <p class="welcome-subtitle">请登录您的账户以继续</p>
                </div>
                
                <el-form 
                    :model="ruleForm" 
                    :rules="rules" 
                    ref="formRef"
                    class="login-form"
                    @submit.prevent="handleLogin"
                >
                    <el-form-item prop="username" class="form-item">
                        <div class="input-wrapper" ref="usernameWrapperRef">
                            <el-icon class="input-icon"><User /></el-icon>
                            <el-input
                                v-model="ruleForm.username"
                                placeholder="请输入用户名"
                                size="large"
                                class="custom-input"
                                @focus="handleInputFocus"
                                @blur="handleInputBlur"
                            />
                        </div>
                    </el-form-item>
                    
                    <el-form-item prop="password" class="form-item">
                        <div class="input-wrapper" ref="passwordWrapperRef">
                            <el-icon class="input-icon"><Lock /></el-icon>
                            <el-input
                                v-model="ruleForm.password"
                                placeholder="请输入密码"
                                type="password"
                                size="large"
                                class="custom-input"
                                show-password
                                @focus="handleInputFocus"
                                @blur="handleInputBlur"
                                @keyup.enter="handleLogin"
                            />
                        </div>
                    </el-form-item>
                    
                    <el-form-item class="form-item">
                        <el-button
                            type="primary"
                            size="large"
                            class="login-button"
                            :loading="loading"
                            @click="handleLogin"
                            ref="loginButtonRef"
                        >
                            <span v-if="!loading">登录</span>
                            <span v-else>登录中...</span>
                        </el-button>
                    </el-form-item>
                </el-form>

                <!-- <div class="card-footer">
                    <div class="divider">
                        <span>或</span>
                    </div>
                    <div class="footer-links">
                        <a href="#" class="link" @click.prevent="showForgotPasswordDialog">忘记密码？</a>
                        <a href="#" class="link" @click.prevent="showRegisterDialog">注册账户</a>
                    </div>
                </div> -->
            </div>
        </div>
        
        <!-- 忘记密码对话框 -->
        <el-dialog
            v-model="forgotPasswordVisible"
            title="忘记密码"
            width="500px"
            :close-on-click-modal="false"
            class="forgot-password-dialog"
        >
            <el-form
                :model="forgotPasswordForm"
                :rules="forgotPasswordRules"
                ref="forgotPasswordFormRef"
                label-width="100px"
            >
                <el-form-item label="账号" prop="account">
                    <el-input
                        v-model="forgotPasswordForm.account"
                        placeholder="请输入您的账号"
                        size="large"
                    />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input
                        v-model="forgotPasswordForm.phone"
                        placeholder="请输入注册时的手机号"
                        size="large"
                    />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input
                        v-model="forgotPasswordForm.newPassword"
                        type="password"
                        placeholder="请输入新密码（至少6位）"
                        size="large"
                        show-password
                    />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input
                        v-model="forgotPasswordForm.confirmPassword"
                        type="password"
                        placeholder="请再次输入新密码"
                        size="large"
                        show-password
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="forgotPasswordVisible = false">取消</el-button>
                <el-button type="primary" :loading="forgotPasswordLoading" @click="handleForgotPassword">
                    重置密码
                </el-button>
            </template>
        </el-dialog>
        
        <!-- 注册对话框 -->
        <el-dialog
            v-model="registerVisible"
            title="注册账户"
            width="600px"
            :close-on-click-modal="false"
            class="register-dialog"
        >
            <el-form
                :model="registerForm"
                :rules="registerRules"
                ref="registerFormRef"
                label-width="100px"
            >
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="账号" prop="account">
                            <el-input
                                v-model="registerForm.account"
                                placeholder="4-20位字母、数字或下划线"
                                size="large"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="姓名" prop="name">
                            <el-input
                                v-model="registerForm.name"
                                placeholder="请输入真实姓名"
                                size="large"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="密码" prop="password">
                            <el-input
                                v-model="registerForm.password"
                                type="password"
                                placeholder="至少6位"
                                size="large"
                                show-password
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="确认密码" prop="confirmPassword">
                            <el-input
                                v-model="registerForm.confirmPassword"
                                type="password"
                                placeholder="请再次输入密码"
                                size="large"
                                show-password
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="手机号" prop="phone">
                            <el-input
                                v-model="registerForm.phone"
                                placeholder="11位手机号"
                                size="large"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="身份证号" prop="idNo">
                            <el-input
                                v-model="registerForm.idNo"
                                placeholder="18位身份证号（可选）"
                                size="large"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="职位" prop="position">
                            <el-input
                                v-model="registerForm.position"
                                placeholder="职位（可选）"
                                size="large"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门" prop="department">
                            <el-input
                                v-model="registerForm.department"
                                placeholder="部门（可选）"
                                size="large"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="registerVisible = false">取消</el-button>
                <el-button type="primary" :loading="registerLoading" @click="handleRegister">
                    注册
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import type { FormRules, FormInstance } from 'element-plus'
import { useUserStore } from "@/store/auth.ts"
import { useRouter } from "vue-router"
import { User, Lock, Lightning, DataLine, Setting, CircleCheck } from '@element-plus/icons-vue'
import logo from "@/assets/logo.png"
import { ElMessage } from 'element-plus'
import { registerApi, forgotPasswordApi } from '@/api/user'

interface RuleForm {
    username: string
    password: string
}

const ruleForm: RuleForm = reactive({
    username: "",
    password: ""
})

const rules = reactive<FormRules<RuleForm>>({
    username: [
        { required: true, message: "用户名不能为空", trigger: "blur" },
        { min: 4, max: 8, message: "用户名要求4-8位数字字母组合", trigger: "blur" }
    ],
    password: [
        { required: true, message: "密码不能为空", trigger: "blur" }
    ]
})

const formRef = ref<FormInstance>()
const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)

// 忘记密码相关
const forgotPasswordVisible = ref(false)
const forgotPasswordLoading = ref(false)
const forgotPasswordFormRef = ref<FormInstance>()
const forgotPasswordForm = reactive({
    account: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
    if (value !== forgotPasswordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const forgotPasswordRules = reactive<FormRules>({
    account: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        { min: 4, max: 20, message: '账号长度为4-20位', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
})

// 注册相关
const registerVisible = ref(false)
const registerLoading = ref(false)
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
    account: '',
    password: '',
    name: '',
    phone: '',
    idNo: '',
    position: '',
    department: '',
    confirmPassword: ''
})

const validateRegisterConfirmPassword = (_rule: any, value: any, callback: any) => {
    if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const validateAccount = (_rule: any, value: any, callback: any) => {
    if (!value) {
        callback(new Error('请输入账号'))
    } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
        callback(new Error('账号格式不正确，应为4-20位字母、数字或下划线'))
    } else {
        callback()
    }
}

const validatePhone = (_rule: any, value: any, callback: any) => {
    if (!value) {
        callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
    } else {
        callback()
    }
}

const validateIdNo = (_rule: any, value: any, callback: any) => {
    if (value && !/^\d{17}[\dXx]$/.test(value)) {
        callback(new Error('请输入正确的18位身份证号'))
    } else {
        callback()
    }
}

const registerRules = reactive<FormRules>({
    account: [
        { validator: validateAccount, trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    phone: [
        { validator: validatePhone, trigger: 'blur' }
    ],
    idNo: [
        { validator: validateIdNo, trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateRegisterConfirmPassword, trigger: 'blur' }
    ]
})

// 动画引用
const leftSectionRef = ref<HTMLElement | null>(null)
const rightSectionRef = ref<HTMLElement | null>(null)
const loginCardRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const featuresRef = ref<HTMLElement | null>(null)
const loginButtonRef = ref<HTMLElement | null>(null)
const usernameWrapperRef = ref<HTMLElement | null>(null)
const passwordWrapperRef = ref<HTMLElement | null>(null)

// 特性列表
const features = [
    { icon: Lightning, text: '高效能源管理' },
    { icon: DataLine, text: '实时数据监控' },
    { icon: Setting, text: '智能运维系统' },
    { icon: CircleCheck, text: '安全可靠保障' }
]

// 输入框聚焦动画
// const handleInputFocus = (event: Event) => {
//     const inputWrapper = (event.target as HTMLElement)?.closest('.input-wrapper')
//     if (inputWrapper) {
//         gsap.to(inputWrapper, {
//             scale: 1.02,
//             y: -3,
//             duration: 0.4,
//             ease: "back.out(1.7)"
//         })
//         const icon = inputWrapper.querySelector('.input-icon')
//         if (icon) {
//             gsap.to(icon, {
//                 scale: 1.3,
//                 rotation: 360,
//                 color: "#409eff",
//                 duration: 0.6,
//                 ease: "power2.out"
//             })
//         }
//         // 添加边框光晕效果
//         gsap.to(inputWrapper, {
//             boxShadow: "0 0 0 4px rgba(64, 158, 255, 0.15)",
//             duration: 0.3,
//             ease: "power2.out"
//         })
//     }
// }

// 输入框失焦动画
// const handleInputBlur = (event: Event) => {
//     const inputWrapper = (event.target as HTMLElement)?.closest('.input-wrapper')
//     if (inputWrapper) {
//         gsap.to(inputWrapper, {
//             scale: 1,
//             y: 0,
//             duration: 0.3,
//             ease: "power2.out"
//         })
//         const icon = inputWrapper.querySelector('.input-icon')
//         if (icon) {
//             gsap.to(icon, {
//                 scale: 1,
//                 rotation: 0,
//                 color: "#909399",
//                 duration: 0.3,
//                 ease: "power2.out"
//             })
//         }
//         gsap.to(inputWrapper, {
//             boxShadow: "0 0 0 0px rgba(64, 158, 255, 0)",
//             duration: 0.3,
//             ease: "power2.out"
//         })
//     }
// }

// 登录处理
const handleLogin = async () => {
    if (!formRef.value) return
    
    formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true
            
            // 按钮加载动画
            if (loginButtonRef.value) {
                gsap.to(loginButtonRef.value, {
                    scale: 0.96,
                    duration: 0.15,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                })
                // 添加脉冲效果
                gsap.to(loginButtonRef.value, {
                    boxShadow: "0 0 0 0 rgba(102, 126, 234, 0.7)",
                    duration: 0.6,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                })
            }
            
            try {
                await userStore.login(ruleForm)
                
                // 成功动画
                if (loginCardRef.value) {
                    gsap.to(loginCardRef.value, {
                        scale: 0.9,
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.in",
                        onComplete: () => {
                            router.push("/")
                        }
                    })
                } else {
                    router.push("/")
                }
            } catch (error: any) {
                ElMessage.error(error.message || '登录失败，请检查用户名和密码')
                
                // 错误震动动画
                if (loginCardRef.value) {
                    gsap.to(loginCardRef.value, {
                        x: -10,
                        duration: 0.1,
                        yoyo: true,
                        repeat: 5,
                        ease: "power2.inOut"
                    })
                }
            } finally {
                loading.value = false
            }
        }
    })
}

// 初始化动画
// const initAnimations = () => {
//     const tl = gsap.timeline()
    
//     // 左侧区域动画
//     if (leftSectionRef.value) {
//         gsap.set(leftSectionRef.value, { x: -100, opacity: 0 })
//         tl.to(leftSectionRef.value, {
//             x: 0,
//             opacity: 1,
//             duration: 1,
//             ease: "power3.out"
//         })
//     }
    
//     // Logo动画
//     if (logoRef.value) {
//         gsap.set(logoRef.value, { scale: 0, rotation: -180, opacity: 0 })
//         tl.to(logoRef.value, {
//             scale: 1,
//             rotation: 0,
//             opacity: 1,
//             duration: 0.8,
//             ease: "back.out(1.7)"
//         }, "-=0.5")
//     }
    
//     // 标题动画
//     if (titleRef.value) {
//         gsap.set(titleRef.value, { y: 30, opacity: 0 })
//         tl.to(titleRef.value, {
//             y: 0,
//             opacity: 1,
//             duration: 0.6,
//             ease: "power2.out"
//         }, "-=0.3")
//     }
    
//     // 副标题动画
//     if (subtitleRef.value) {
//         gsap.set(subtitleRef.value, { y: 20, opacity: 0 })
//         tl.to(subtitleRef.value, {
//             y: 0,
//             opacity: 1,
//             duration: 0.6,
//             ease: "power2.out"
//         }, "-=0.2")
//     }
    
//     // 特性列表动画
//     if (featuresRef.value) {
//         const featureItems = featuresRef.value.querySelectorAll('.feature-item')
//         gsap.set(featureItems, { x: -50, opacity: 0 })
//         tl.to(featureItems, {
//             x: 0,
//             opacity: 1,
//             duration: 0.5,
//             stagger: 0.1,
//             ease: "power2.out"
//         }, "-=0.2")
//     }
    
//     // 右侧区域动画
//     if (rightSectionRef.value) {
//         gsap.set(rightSectionRef.value, { x: 100, opacity: 0 })
//         tl.to(rightSectionRef.value, {
//             x: 0,
//             opacity: 1,
//             duration: 1,
//             ease: "power3.out"
//         }, "-=0.8")
//     }
    
//     // 登录卡片动画
//     if (loginCardRef.value) {
//         gsap.set(loginCardRef.value, { y: 50, opacity: 0, scale: 0.9 })
//         tl.to(loginCardRef.value, {
//             y: 0,
//             opacity: 1,
//             scale: 1,
//             duration: 0.8,
//             ease: "back.out(1.2)"
//         }, "-=0.5")
//     }
    
//     // 卡片头部动画
//     const cardHeader = loginCardRef.value?.querySelector('.card-header')
//     if (cardHeader) {
//         gsap.set(cardHeader, { y: -20, opacity: 0 })
//         tl.to(cardHeader, {
//             y: 0,
//             opacity: 1,
//             duration: 0.6,
//             ease: "power2.out"
//         }, "-=0.2")
//     }
    
//     // 输入框依次出现动画
//     if (usernameWrapperRef.value && passwordWrapperRef.value) {
//         gsap.set([usernameWrapperRef.value, passwordWrapperRef.value], { 
//             y: 30, 
//             opacity: 0,
//             scale: 0.95
//         })
//         tl.to([usernameWrapperRef.value, passwordWrapperRef.value], {
//             y: 0,
//             opacity: 1,
//             scale: 1,
//             duration: 0.7,
//             stagger: 0.2,
//             ease: "back.out(1.4)"
//         }, "-=0.3")
//     }
    
//     // 登录按钮动画
//     if (loginButtonRef.value) {
//         gsap.set(loginButtonRef.value, { 
//             scale: 0.8, 
//             opacity: 0,
//             y: 30
//         })
//         tl.to(loginButtonRef.value, {
//             scale: 1,
//             opacity: 1,
//             y: 0,
//             duration: 0.7,
//             ease: "back.out(1.7)"
//         }, "-=0.2")
//     }
    
//     // 底部链接动画
//     const cardFooter = loginCardRef.value?.querySelector('.card-footer')
//     if (cardFooter) {
//         gsap.set(cardFooter, { y: 20, opacity: 0 })
//         tl.to(cardFooter, {
//             y: 0,
//             opacity: 1,
//             duration: 0.6,
//             ease: "power2.out"
//         }, "-=0.1")
//     }
    
//     // 持续动画：Logo呼吸效果
//     if (logoRef.value) {
//         gsap.to(logoRef.value.querySelector('.logo-glow'), {
//             scale: 1.2,
//             opacity: 0.6,
//             duration: 2,
//             repeat: -1,
//             yoyo: true,
//             ease: "sine.inOut"
//         })
//     }
    
//     // 特性项悬停动画准备
//     if (featuresRef.value) {
//         const featureItems = featuresRef.value.querySelectorAll('.feature-item')
//         featureItems.forEach((item, index) => {
//             // 添加初始动画延迟
//             gsap.set(item, { opacity: 0, x: -20 })
//             gsap.to(item, {
//                 opacity: 1,
//                 x: 0,
//                 duration: 0.5,
//                 delay: 0.8 + index * 0.1,
//                 ease: "power2.out"
//             })
            
//             item.addEventListener('mouseenter', () => {
//                 gsap.to(item, {
//                     x: 15,
//                     scale: 1.05,
//                     duration: 0.3,
//                     ease: "back.out(1.7)"
//                 })
//                 const icon = item.querySelector('.feature-icon')
//                 if (icon) {
//                     gsap.to(icon, {
//                         rotation: 360,
//                         scale: 1.2,
//                         duration: 0.5,
//                         ease: "power2.out"
//                     })
//                 }
//             })
//             item.addEventListener('mouseleave', () => {
//                 gsap.to(item, {
//                     x: 0,
//                     scale: 1,
//                     duration: 0.3,
//                     ease: "power2.out"
//                 })
//                 const icon = item.querySelector('.feature-icon')
//                 if (icon) {
//                     gsap.to(icon, {
//                         rotation: 0,
//                         scale: 1,
//                         duration: 0.3,
//                         ease: "power2.out"
//                     })
//                 }
//             })
//         })
//     }
    
//     // Logo持续动画
//     if (logoRef.value) {
//         const logoImage = logoRef.value.querySelector('.logo-image')
//         if (logoImage) {
//             gsap.to(logoImage, {
//                 y: -5,
//                 duration: 2,
//                 repeat: -1,
//                 yoyo: true,
//                 ease: "sine.inOut"
//             })
//         }
//     }
// }

// 鼠标移动视差效果（更轻微）
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null

const initParallax = () => {
    mouseMoveHandler = (e: MouseEvent) => {
        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window
        
        const xPercent = (clientX / innerWidth - 0.5) * 10
        const yPercent = (clientY / innerHeight - 0.5) * 10
        
        if (loginCardRef.value) {
            gsap.to(loginCardRef.value, {
                x: xPercent,
                y: yPercent,
                duration: 1.5,
                ease: "power1.out"
            })
        }
        
        if (logoRef.value) {
            gsap.to(logoRef.value, {
                x: -xPercent * 0.3,
                y: -yPercent * 0.3,
                duration: 1.5,
                ease: "power1.out"
            })
        }
    }
    
    window.addEventListener('mousemove', mouseMoveHandler)
}

onMounted(() => {
    // initAnimations()
    initParallax()
})

onUnmounted(() => {
    if (mouseMoveHandler) {
        window.removeEventListener('mousemove', mouseMoveHandler)
    }
})

// 显示忘记密码对话框
const showForgotPasswordDialog = () => {
    forgotPasswordVisible.value = true
    // 重置表单
    Object.assign(forgotPasswordForm, {
        account: '',
        phone: '',
        newPassword: '',
        confirmPassword: ''
    })
    forgotPasswordFormRef.value?.clearValidate()
}

// 处理忘记密码
const handleForgotPassword = async () => {
    if (!forgotPasswordFormRef.value) return
    
    await forgotPasswordFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            forgotPasswordLoading.value = true
            try {
                const res = await forgotPasswordApi({
                    account: forgotPasswordForm.account,
                    phone: forgotPasswordForm.phone,
                    newPassword: forgotPasswordForm.newPassword
                })
                
                if (res.code === 200) {
                    ElMessage.success('密码重置成功，请使用新密码登录')
                    forgotPasswordVisible.value = false
                } else {
                    ElMessage.error(res.message || '密码重置失败')
                }
            } catch (error: any) {
                ElMessage.error(error.response?.data?.message || error.message || '密码重置失败')
            } finally {
                forgotPasswordLoading.value = false
            }
        }
    })
}

// 显示注册对话框
const showRegisterDialog = () => {
    registerVisible.value = true
    // 重置表单
    Object.assign(registerForm, {
        account: '',
        password: '',
        name: '',
        phone: '',
        idNo: '',
        position: '',
        department: '',
        confirmPassword: ''
    })
    registerFormRef.value?.clearValidate()
}

// 处理注册
const handleRegister = async () => {
    if (!registerFormRef.value) return
    
    await registerFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            registerLoading.value = true
            try {
                const res = await registerApi({
                    account: registerForm.account,
                    password: registerForm.password,
                    name: registerForm.name,
                    phone: registerForm.phone,
                    idNo: registerForm.idNo || undefined,
                    position: registerForm.position || undefined,
                    department: registerForm.department || undefined
                })
                
                if (res.code === 200) {
                    ElMessage.success('注册成功，请使用新账号登录')
                    registerVisible.value = false
                } else {
                    ElMessage.error(res.message || '注册失败')
                }
            } catch (error: any) {
                ElMessage.error(error.response?.data?.message || error.message || '注册失败')
            } finally {
                registerLoading.value = false
            }
        }
    })
}
</script>

<style lang="less" scoped>
.login-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(135deg, #e8ecf1 0%, #d1d9e6 50%, #f0f4f8 100%);
    display: flex;
    
    // 简约的几何装饰
    &::before {
        content: '';
        position: absolute;
        top: -40%;
        right: -15%;
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.12) 0%, transparent 70%);
        border-radius: 50%;
        animation: floatCircle 20s ease-in-out infinite;
    }
    
    &::after {
        content: '';
        position: absolute;
        bottom: -25%;
        left: -8%;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        animation: floatCircle 25s ease-in-out infinite reverse;
    }
}

@keyframes floatCircle {
    0%, 100% {
        transform: translate(0, 0) scale(1);
    }
    50% {
        transform: translate(40px, -40px) scale(1.15);
    }
}

// 左侧区域
.left-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px;
    color: #303133;
    z-index: 1;
    position: relative;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
}

.logo-container {
    text-align: center;
    margin-bottom: 60px;
}

.logo-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 30px;
}

.logo-image {
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
    position: relative;
    z-index: 2;
}

.logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 1;
}

.platform-title {
    font-size: 42px;
    font-weight: 700;
    margin: 0 0 15px 0;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.platform-subtitle {
    font-size: 16px;
    color: #606266;
    letter-spacing: 3px;
    font-weight: 300;
    text-transform: uppercase;
}

.features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 400px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 25px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .feature-icon {
        font-size: 24px;
        color: #667eea;
        transition: all 0.3s;
        flex-shrink: 0;
    }
    
    span {
        color: #303133;
    }
}

// 右侧区域
.right-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px;
    z-index: 1;
    position: relative;
}

.login-card {
    width: 100%;
    max-width: 450px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 50px 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(102, 126, 234, 0.1) inset;
    position: relative;
    overflow: hidden;
}

.card-header {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
}

.welcome-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.welcome-subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
}

.login-form {
    position: relative;
    z-index: 1;
}

.form-item {
    margin-bottom: 25px;
    width: 100%;
    
    :deep(.el-form-item__content) {
        width: 100%;
    }
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 12px;
    padding: 0;
    transition: all 0.3s;
    border: 2px solid transparent;
    min-height: 50px;
    width: 100%;
    
    &:hover {
        background: #ecf5ff;
        border-color: #b3d8ff;
    }
    
    &:focus-within {
        background: #ffffff;
        border-color: #409eff;
    }
    
    .input-icon {
        font-size: 20px;
        color: #909399;
        margin-left: 18px;
        margin-right: 12px;
        flex-shrink: 0;
        transition: all 0.3s;
        display: flex;
        align-items: center;
    }
    
    &:focus-within .input-icon {
        color: #409eff;
    }
    
    :deep(.el-input) {
        flex: 1;
        height: 100%;
        
        .el-input__wrapper {
            box-shadow: none;
            background: transparent;
            padding: 0;
            height: 100%;
            min-height: 46px;
            display: flex;
            align-items: center;
        }
        
        .el-input__inner {
            border: none;
            background: transparent;
            font-size: 15px;
            height: 100%;
            line-height: 46px;
            padding: 0;
            
            &::placeholder {
                color: #c0c4cc;
            }
        }
    }
}


.login-button {
    width: 100%;
    height: 50px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.6s;
    }
    
    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
        
        &::before {
            left: 100%;
        }
        
        &::after {
            width: 300px;
            height: 300px;
        }
    }
    
    &:active {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
    
    :deep(.el-button__text) {
        position: relative;
        z-index: 1;
    }
}

.card-footer {
    margin-top: 30px;
    position: relative;
    z-index: 1;
}

.divider {
    position: relative;
    text-align: center;
    margin: 25px 0;
    
    &::before,
    &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 40%;
        height: 1px;
        background: #e4e7ed;
    }
    
    &::before {
        left: 0;
    }
    
    &::after {
        right: 0;
    }
    
    span {
        color: #909399;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.95);
        padding: 0 15px;
        position: relative;
        z-index: 1;
    }
}

.footer-links {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    
    .link {
        color: #409eff;
        text-decoration: none;
        transition: all 0.3s;
        
        &:hover {
            color: #66b1ff;
            text-decoration: underline;
        }
    }
}

// 响应式设计
@media (max-width: 1024px) {
    .login-container {
        flex-direction: column;
    }
    
    .left-section {
        padding: 40px 20px;
    }
    
    .platform-title {
        font-size: 32px;
    }
    
    .right-section {
        padding: 20px;
    }
    
    .login-card {
        max-width: 100%;
        padding: 40px 30px;
    }
}

@media (max-width: 768px) {
    .platform-title {
        font-size: 28px;
    }
    
    .features {
        gap: 15px;
    }
    
    .feature-item {
        padding: 12px 20px;
        font-size: 14px;
    }
}

// 对话框样式
:deep(.forgot-password-dialog),
:deep(.register-dialog) {
    .el-dialog {
        border-radius: 16px;
        overflow: hidden;
    }
    
    .el-dialog__header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px 24px;
        margin: 0;
        
        .el-dialog__title {
            color: #fff;
            font-weight: 600;
            font-size: 18px;
        }
        
        .el-dialog__headerbtn {
            .el-dialog__close {
                color: #fff;
                font-size: 20px;
                
                &:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
            }
        }
    }
    
    .el-dialog__body {
        padding: 30px 24px;
    }
    
    .el-dialog__footer {
        padding: 20px 24px;
        border-top: 1px solid #e4e7ed;
    }
    
    .el-form-item {
        margin-bottom: 22px;
    }
    
    .el-input__wrapper {
        border-radius: 8px;
    }
}
</style>
