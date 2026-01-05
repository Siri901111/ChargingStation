<template>
    <div class="page" ref="pageRef" @mousemove="onMouseMove">
        <!-- 背景 -->
        <div class="bg">
            <div class="line" v-for="i in 5" :key="i"></div>
        </div>

        <!-- 装饰元素 -->
        <div class="decor decor-1" ref="decor1">
            <svg viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="20" stroke="currentColor" stroke-width="0.5"/>
            </svg>
        </div>
        <div class="decor decor-2" ref="decor2">
            <svg viewBox="0 0 60 60" fill="none">
                <rect x="1" y="1" width="58" height="58" stroke="currentColor" stroke-width="0.5"/>
                <rect x="10" y="10" width="40" height="40" stroke="currentColor" stroke-width="0.5"/>
                <rect x="20" y="20" width="20" height="20" stroke="currentColor" stroke-width="0.5"/>
            </svg>
        </div>
        <div class="decor decor-3" ref="decor3">
            <span class="decor-text">POWER</span>
        </div>
        <div class="decor decor-4" ref="decor4">
            <span class="decor-text">PORT</span>
        </div>

        <!-- 角落数字 -->
        <div class="corner corner-tl" ref="cornerTL">01</div>
        <div class="corner corner-br" ref="cornerBR">2024</div>

        <!-- 主内容 -->
        <div class="container" ref="containerRef">
            <div class="brand">
                <div class="brand-label" ref="labelRef">
                    <span class="label-line"></span>
                    <span>Energy Platform</span>
                    <span class="label-line"></span>
                </div>
                <h1 class="brand-title">
                    <span class="char" v-for="(c, i) in '动力港'" :key="i">{{ c }}</span>
                </h1>
                <p class="brand-sub" ref="subRef">Smart · Efficient · Reliable</p>
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
                    <span class="btn-bg"></span>
                    <span class="btn-text">{{ loading ? '登录中' : '登录' }}</span>
                    <span class="btn-arrow">→</span>
                </button>
            </form>

            <div class="footer" ref="footerRef">
                <div class="footer-line"></div>
                <span>智慧能源管理系统</span>
                <div class="footer-line"></div>
            </div>
        </div>

        <!-- 侧边标签 -->
        <div class="side-tag side-left" ref="sideLeft">
            <span>CHARGING STATION</span>
        </div>
        <div class="side-tag side-right" ref="sideRight">
            <span>MANAGEMENT SYSTEM</span>
        </div>

        <!-- 鼠标跟随 -->
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
const labelRef = ref<HTMLElement | null>(null)
const subRef = ref<HTMLElement | null>(null)
const formRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
const btnRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const line0 = ref<HTMLElement | null>(null)
const line1 = ref<HTMLElement | null>(null)
const decor1 = ref<HTMLElement | null>(null)
const decor2 = ref<HTMLElement | null>(null)
const decor3 = ref<HTMLElement | null>(null)
const decor4 = ref<HTMLElement | null>(null)
const cornerTL = ref<HTMLElement | null>(null)
const cornerBR = ref<HTMLElement | null>(null)
const sideLeft = ref<HTMLElement | null>(null)
const sideRight = ref<HTMLElement | null>(null)

const lines = [line0, line1]
let ctx: gsap.Context | null = null

const showMessage = (msg: string) => {
    message.value = msg
    setTimeout(() => { message.value = '' }, 2500)
}

const onFocus = (i: number) => {
    gsap.to(lines[i].value, { scaleX: 1, duration: 0.4, ease: 'power3.out' })
}

const onBlur = (i: number) => {
    const val = i === 0 ? form.username : form.password
    if (!val) gsap.to(lines[i].value, { scaleX: 0, duration: 0.3, ease: 'power2.in' })
}

const onBtnEnter = () => {
    if (loading.value) return
    gsap.to('.btn-bg', { scaleX: 1, duration: 0.4, ease: 'power3.out' })
    gsap.to('.btn-text', { color: '#1a1a1a', duration: 0.3 })
    gsap.to('.btn-arrow', { x: 4, opacity: 1, color: '#1a1a1a', duration: 0.3 })
}

const onBtnLeave = () => {
    gsap.to('.btn-bg', { scaleX: 0, duration: 0.3, ease: 'power2.in' })
    gsap.to('.btn-text', { color: '#fff', duration: 0.2 })
    gsap.to('.btn-arrow', { x: 0, opacity: 0, color: '#fff', duration: 0.2 })
}

const onMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = (clientX / innerWidth - 0.5) * 2
    const y = (clientY / innerHeight - 0.5) * 2

    gsap.to(cursorRef.value, {
        x: clientX,
        y: clientY,
        duration: 0.8,
        ease: 'power3.out'
    })

    // 装饰元素视差
    gsap.to(decor1.value, { x: x * 20, y: y * 20, duration: 1, ease: 'power2.out' })
    gsap.to(decor2.value, { x: x * -15, y: y * -15, duration: 1, ease: 'power2.out' })
    gsap.to(decor3.value, { x: x * 10, duration: 1, ease: 'power2.out' })
    gsap.to(decor4.value, { x: x * -10, duration: 1, ease: 'power2.out' })
}

const shake = () => {
    gsap.to(formRef.value, {
        keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 }],
        duration: 0.35
    })
}

const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
        showMessage('请输入账号和密码')
        shake()
        return
    }

    loading.value = true
    try {
        await userStore.login(form)

        gsap.to('.char', {
            y: -40, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power2.in'
        })
        gsap.to([formRef.value, footerRef.value, '.decor', '.corner', '.side-tag'], {
            opacity: 0, duration: 0.4, delay: 0.15,
            onComplete: () => { router.push('/') }
        })
    } catch (error: any) {
        showMessage(error.message || '登录失败')
        shake()
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (!pageRef.value) return

    ctx = gsap.context(() => {
        // 初始状态
        gsap.set('.line', { scaleY: 0, transformOrigin: 'top' })
        gsap.set('.label-line', { scaleX: 0 })
        gsap.set(labelRef.value, { opacity: 0 })
        gsap.set('.char', { opacity: 0, y: 60 })
        gsap.set(subRef.value, { opacity: 0, y: 20 })
        gsap.set('.input-wrap', { opacity: 0, y: 30 })
        gsap.set(btnRef.value, { opacity: 0, y: 20 })
        gsap.set(footerRef.value, { opacity: 0 })
        gsap.set('.footer-line', { scaleX: 0 })
        gsap.set('.input-line', { scaleX: 0, transformOrigin: 'left' })
        gsap.set('.btn-bg', { scaleX: 0, transformOrigin: 'left' })
        gsap.set([decor1.value, decor2.value], { opacity: 0, scale: 0.8 })
        gsap.set([decor3.value, decor4.value], { opacity: 0, x: (i) => i === 0 ? -30 : 30 })
        gsap.set([cornerTL.value, cornerBR.value], { opacity: 0 })
        gsap.set([sideLeft.value, sideRight.value], { opacity: 0 })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl
            .to('.line', { scaleY: 1, duration: 1.2, stagger: 0.08 })
            .to([decor1.value, decor2.value], { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 }, '-=0.8')
            .to([decor3.value, decor4.value], { opacity: 1, x: 0, duration: 0.6, stagger: 0.1 }, '-=0.6')
            .to([cornerTL.value, cornerBR.value], { opacity: 1, duration: 0.5 }, '-=0.5')
            .to([sideLeft.value, sideRight.value], { opacity: 1, duration: 0.5 }, '-=0.4')
            .to(labelRef.value, { opacity: 1, duration: 0.4 }, '-=0.6')
            .to('.label-line', { scaleX: 1, duration: 0.5 }, '-=0.3')
            .to('.char', { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, '-=0.4')
            .to(subRef.value, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
            .to('.input-wrap', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.3')
            .to(btnRef.value, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
            .to(footerRef.value, { opacity: 1, duration: 0.4 }, '-=0.2')
            .to('.footer-line', { scaleX: 1, duration: 0.5 }, '-=0.3')

        // 装饰元素持续动画
        gsap.to(decor1.value, {
            rotation: 360,
            duration: 60,
            repeat: -1,
            ease: 'none'
        })
        gsap.to(decor2.value, {
            rotation: -360,
            duration: 80,
            repeat: -1,
            ease: 'none'
        })

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
    background: linear-gradient(to bottom, transparent, #e8e8e8 20%, #e8e8e8 80%, transparent);
}

/* 装饰元素 */
.decor {
    position: absolute;
    pointer-events: none;
    color: #e0e0e0;
}

.decor-1 {
    top: 10%;
    left: 8%;
    width: 120px;
    height: 120px;
}

.decor-2 {
    bottom: 15%;
    right: 10%;
    width: 80px;
    height: 80px;
}

.decor-3 {
    top: 20%;
    right: 8%;
    font-size: 72px;
    font-weight: 800;
    color: #f0f0f0;
    letter-spacing: -0.02em;
}

.decor-4 {
    bottom: 20%;
    left: 8%;
    font-size: 72px;
    font-weight: 800;
    color: #f0f0f0;
    letter-spacing: -0.02em;
}

/* 角落数字 */
.corner {
    position: absolute;
    font-size: 12px;
    font-weight: 500;
    color: #ccc;
    letter-spacing: 0.1em;
}

.corner-tl {
    top: 32px;
    left: 32px;
}

.corner-br {
    bottom: 32px;
    right: 32px;
}

/* 侧边标签 */
.side-tag {
    position: absolute;
    font-size: 10px;
    font-weight: 500;
    color: #ccc;
    letter-spacing: 0.3em;
    text-transform: uppercase;
}

.side-left {
    left: 32px;
    top: 50%;
    transform: rotate(-90deg) translateX(-50%);
    transform-origin: left center;
}

.side-right {
    right: 32px;
    top: 50%;
    transform: rotate(90deg) translateX(50%);
    transform-origin: right center;
}

/* 鼠标光点 */
.cursor-glow {
    position: fixed;
    top: 0;
    left: 0;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(0,0,0,0.025) 0%, transparent 70%);
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 16px;
}

.label-line {
    width: 32px;
    height: 1px;
    background: #ddd;
}

.brand-title {
    font-size: 52px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 12px;
    letter-spacing: 0.05em;
    display: flex;
    justify-content: center;
    gap: 4px;
}

.char {
    display: inline-block;
}

.brand-sub {
    font-size: 12px;
    color: #bbb;
    letter-spacing: 0.15em;
    margin: 0;
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
    border-color: #ddd;
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
    border: none;
    border-radius: 8px;
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

.btn-bg {
    position: absolute;
    inset: 0;
    background: #fff;
    transform: scaleX(0);
    transform-origin: left;
}

.btn-text {
    position: relative;
    z-index: 1;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    transition: color 0.3s;
}

.btn-arrow {
    position: relative;
    z-index: 1;
    font-size: 16px;
    color: #fff;
    opacity: 0;
}

/* 底部 */
.footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 48px;
    font-size: 12px;
    color: #bbb;
    letter-spacing: 0.5px;
}

.footer-line {
    width: 24px;
    height: 1px;
    background: #ddd;
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
@media (max-width: 768px) {
    .decor-3, .decor-4 {
        font-size: 48px;
    }

    .decor-1 {
        width: 80px;
        height: 80px;
    }

    .decor-2 {
        width: 60px;
        height: 60px;
    }

    .side-tag {
        display: none;
    }
}

@media (max-width: 480px) {
    .brand-title {
        font-size: 44px;
    }

    .decor-3, .decor-4 {
        display: none;
    }

    .corner {
        display: none;
    }
}
</style>
