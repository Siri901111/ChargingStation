<template>
    <div class="page" ref="pageRef" @mousemove="onMouseMove">
        <!-- 背景 -->
        <div class="bg">
            <div class="line" v-for="i in 5" :key="i"></div>
        </div>

        <!-- 主内容 -->
        <div class="container" ref="containerRef">
            <div class="brand" ref="brandRef">
                <div class="brand-label" ref="labelRef">Energy Platform</div>
                <h1 class="brand-title">
                    <span class="char" v-for="(c, i) in '动力港'" :key="i">{{ c }}</span>
                </h1>
            </div>

            <form class="form" @submit.prevent="handleLogin" ref="formRef">
                <div class="input-wrap">
                    <input
                        v-model="form.username"
                        type="text"
                        class="input"
                        placeholder="账号"
                        autocomplete="username"
                        @focus="onFocus(0)"
                        @blur="onBlur(0)"
                    />
                    <div class="input-line" ref="line0"></div>
                </div>
                <div class="input-wrap">
                    <input
                        v-model="form.password"
                        type="password"
                        class="input"
                        placeholder="密码"
                        autocomplete="current-password"
                        @focus="onFocus(1)"
                        @blur="onBlur(1)"
                        @keyup.enter="handleLogin"
                    />
                    <div class="input-line" ref="line1"></div>
                </div>
                <button
                    type="submit"
                    class="btn"
                    ref="btnRef"
                    :disabled="loading"
                    @mouseenter="onBtnEnter"
                    @mouseleave="onBtnLeave"
                >
                    <span class="btn-text">{{ loading ? '登录中' : '登录' }}</span>
                    <span class="btn-arrow">→</span>
                </button>
            </form>

            <div class="footer" ref="footerRef">
                <span>智慧能源管理系统</span>
            </div>
        </div>

        <!-- 跟随鼠标的光点 -->
        <div class="cursor-glow" ref="cursorRef"></div>

        <!-- 提示 -->
        <Transition name="msg">
            <div v-if="message" class="message">{{ message }}</div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { useUserStore } from "@/store/auth.ts"
import { useRouter } from "vue-router"

const userStore = useUserStore()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const message = ref('')

const pageRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const brandRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)
const formRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
const btnRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const line0 = ref<HTMLElement | null>(null)
const line1 = ref<HTMLElement | null>(null)

const lines = [line0, line1]
let ctx: gsap.Context | null = null

// 消息提示
const showMessage = (msg: string) => {
    message.value = msg
    setTimeout(() => { message.value = '' }, 2500)
}

// 输入框动画
const onFocus = (i: number) => {
    gsap.to(lines[i].value, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
}
const onBlur = (i: number) => {
    const val = i === 0 ? form.username : form.password
    if (!val) gsap.to(lines[i].value, { scaleX: 0, duration: 0.3, ease: 'power2.in' })
}

// 按钮动画
const onBtnEnter = () => {
    if (loading.value) return
    gsap.to(btnRef.value, { scale: 1.02, duration: 0.3, ease: 'power2.out' })
    gsap.to('.btn-arrow', { x: 4, opacity: 1, duration: 0.3, ease: 'power2.out' })
}
const onBtnLeave = () => {
    gsap.to(btnRef.value, { scale: 1, duration: 0.2 })
    gsap.to('.btn-arrow', { x: 0, opacity: 0, duration: 0.2 })
}

// 鼠标跟随
const onMouseMove = (e: MouseEvent) => {
    gsap.to(cursorRef.value, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: 'power3.out'
    })
}

// 震动
const shake = () => {
    gsap.to(formRef.value, {
        keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 }],
        duration: 0.35
    })
}

// 登录
const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
        showMessage('请输入账号和密码')
        shake()
        return
    }

    loading.value = true
    try {
        await userStore.login(form)

        // 成功动画
        gsap.to('.char', {
            y: -40,
            opacity: 0,
            stagger: 0.05,
            duration: 0.4,
            ease: 'power2.in'
        })
        gsap.to([formRef.value, footerRef.value], {
            opacity: 0,
            y: -20,
            duration: 0.4,
            delay: 0.2,
            onComplete: () => { router.push('/') }
        })
    } catch (error: any) {
        showMessage(error.message || '登录失败')
        shake()
    } finally {
        loading.value = false
    }
}

// 入场动画
onMounted(() => {
    if (!pageRef.value) return

    ctx = gsap.context(() => {
        // 初始状态
        gsap.set('.line', { scaleY: 0, transformOrigin: 'top' })
        gsap.set(labelRef.value, { opacity: 0, y: 20 })
        gsap.set('.char', { opacity: 0, y: 60 })
        gsap.set('.input-wrap', { opacity: 0, y: 30 })
        gsap.set(btnRef.value, { opacity: 0, y: 20 })
        gsap.set(footerRef.value, { opacity: 0 })
        gsap.set('.input-line', { scaleX: 0, transformOrigin: 'left' })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl
            // 背景线
            .to('.line', {
                scaleY: 1,
                duration: 1.2,
                stagger: 0.1
            })
            // 标签
            .to(labelRef.value, {
                opacity: 1,
                y: 0,
                duration: 0.6
            }, '-=0.8')
            // 标题字符
            .to('.char', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.08
            }, '-=0.4')
            // 输入框
            .to('.input-wrap', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1
            }, '-=0.4')
            // 按钮
            .to(btnRef.value, {
                opacity: 1,
                y: 0,
                duration: 0.5
            }, '-=0.3')
            // 底部
            .to(footerRef.value, {
                opacity: 1,
                duration: 0.5
            }, '-=0.2')

    }, pageRef.value)
})

onBeforeUnmount(() => {
    ctx?.revert()
})
</script>

<style scoped>
.page {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    overflow: hidden;
}

/* 背景线条 */
.bg {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-around;
    padding: 0 15%;
    pointer-events: none;
}

.line {
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, #e0e0e0 20%, #e0e0e0 80%, transparent);
}

/* 鼠标光点 */
.cursor-glow {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 0;
}

/* 容器 */
.container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 360px;
    padding: 0 24px;
}

/* 品牌 */
.brand {
    text-align: center;
    margin-bottom: 56px;
}

.brand-label {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 12px;
}

.brand-title {
    font-size: 48px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: 0.05em;
    display: flex;
    justify-content: center;
    gap: 4px;
}

.char {
    display: inline-block;
}

/* 表单 */
.form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-wrap {
    position: relative;
}

.input {
    width: 100%;
    height: 52px;
    padding: 0 16px;
    border: none;
    border-bottom: 1px solid #e5e5e5;
    background: transparent;
    font-size: 15px;
    color: #1a1a1a;
    outline: none;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.input::placeholder {
    color: #bbb;
}

.input:focus {
    border-color: #ccc;
}

.input-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #1a1a1a;
    transform: scaleX(0);
    transform-origin: left;
}

/* 按钮 */
.btn {
    position: relative;
    height: 52px;
    margin-top: 12px;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    overflow: hidden;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-text {
    position: relative;
    z-index: 1;
}

.btn-arrow {
    position: relative;
    z-index: 1;
    font-size: 16px;
    opacity: 0;
    transform: translateX(0);
}

/* 底部 */
.footer {
    text-align: center;
    margin-top: 48px;
    font-size: 12px;
    color: #bbb;
    letter-spacing: 0.5px;
}

/* 消息 */
.message {
    position: fixed;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 14px 28px;
    background: #1a1a1a;
    color: #fff;
    font-size: 13px;
    border-radius: 8px;
    z-index: 100;
}

.msg-enter-active,
.msg-leave-active {
    transition: all 0.3s ease;
}

.msg-enter-from,
.msg-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
}

/* 响应式 */
@media (max-width: 480px) {
    .brand-title {
        font-size: 40px;
    }

    .container {
        padding: 0 20px;
    }
}
</style>
