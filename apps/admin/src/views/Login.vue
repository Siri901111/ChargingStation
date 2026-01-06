<template>
    <div class="page" ref="pageRef" @mousemove="onMouseMove">
        <!-- 背景 -->
        <div class="bg">
            <div class="line" v-for="i in 5" :key="i"></div>
        </div>

        <!-- 粒子网格背景 -->
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>

        <!-- 扫描线效果 -->
        <div class="scan-line"></div>
        <div class="scan-line scan-line-2"></div>

        <!-- 动态能量圈 -->
        <div class="energy-ring energy-ring-1">
            <svg viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="98" stroke="url(#gradient1)" stroke-width="0.5" stroke-dasharray="8 4"/>
                <circle cx="100" cy="100" r="80" stroke="url(#gradient1)" stroke-width="0.3" stroke-dasharray="4 8"/>
                <circle cx="100" cy="100" r="60" stroke="url(#gradient1)" stroke-width="0.5" stroke-dasharray="12 6"/>
                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ddd" stop-opacity="0"/>
                        <stop offset="50%" stop-color="#999" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#ddd" stop-opacity="0"/>
                    </linearGradient>
                </defs>
            </svg>
        </div>
        <div class="energy-ring energy-ring-2">
            <svg viewBox="0 0 160 160" fill="none">
                <circle cx="80" cy="80" r="78" stroke="url(#gradient2)" stroke-width="0.5" stroke-dasharray="6 3"/>
                <circle cx="80" cy="80" r="55" stroke="url(#gradient2)" stroke-width="0.3" stroke-dasharray="3 6"/>
                <defs>
                    <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#ccc" stop-opacity="0"/>
                        <stop offset="50%" stop-color="#888" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#ccc" stop-opacity="0"/>
                    </linearGradient>
                </defs>
            </svg>
        </div>

        <!-- 浮动几何图形 -->
        <div class="float-geo float-geo-1">
            <svg viewBox="0 0 40 40" fill="none">
                <polygon points="20,2 38,38 2,38" stroke="currentColor" stroke-width="0.5"/>
            </svg>
        </div>
        <div class="float-geo float-geo-2">
            <svg viewBox="0 0 30 30" fill="none">
                <polygon points="15,0 30,15 15,30 0,15" stroke="currentColor" stroke-width="0.5"/>
            </svg>
        </div>
        <div class="float-geo float-geo-3">
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="0.5"/>
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/>
            </svg>
        </div>
        <div class="float-geo float-geo-4">
            <svg viewBox="0 0 36 36" fill="none">
                <line x1="0" y1="18" x2="36" y2="18" stroke="currentColor" stroke-width="0.5"/>
                <line x1="18" y1="0" x2="18" y2="36" stroke="currentColor" stroke-width="0.5"/>
                <circle cx="18" cy="18" r="8" stroke="currentColor" stroke-width="0.5"/>
            </svg>
        </div>

        <!-- 流动光线 -->
        <div class="flow-line flow-line-h flow-line-1"></div>
        <div class="flow-line flow-line-h flow-line-2"></div>
        <div class="flow-line flow-line-v flow-line-3"></div>
        <div class="flow-line flow-line-v flow-line-4"></div>

        <!-- 装饰元素 -->
        <div class="decor decor-1" ref="decor1">
            <svg viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="0.5"/>
                <circle cx="50" cy="50" r="20" stroke="currentColor" stroke-width="0.5"/>
                <line x1="50" y1="2" x2="50" y2="20" stroke="currentColor" stroke-width="0.5"/>
                <line x1="50" y1="80" x2="50" y2="98" stroke="currentColor" stroke-width="0.5"/>
                <line x1="2" y1="50" x2="20" y2="50" stroke="currentColor" stroke-width="0.5"/>
                <line x1="80" y1="50" x2="98" y2="50" stroke="currentColor" stroke-width="0.5"/>
            </svg>
        </div>
        <div class="decor decor-2" ref="decor2">
            <svg viewBox="0 0 60 60" fill="none">
                <rect x="1" y="1" width="58" height="58" stroke="currentColor" stroke-width="0.5"/>
                <rect x="10" y="10" width="40" height="40" stroke="currentColor" stroke-width="0.5"/>
                <rect x="20" y="20" width="20" height="20" stroke="currentColor" stroke-width="0.5"/>
                <line x1="0" y1="0" x2="60" y2="60" stroke="currentColor" stroke-width="0.3" opacity="0.5"/>
                <line x1="60" y1="0" x2="0" y2="60" stroke="currentColor" stroke-width="0.3" opacity="0.5"/>
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
        <div class="container">
            <div class="brand">
                <div class="brand-label" ref="labelRef">
                    <span class="label-line"></span>
                    <span>Energy Platform</span>
                    <span class="label-line"></span>
                </div>
                <h1 class="brand-title">
                    <span class="char" v-for="(c, i) in '新能源充电站管理平台'" :key="i">{{ c }}</span>
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
const particleCanvas = ref<HTMLCanvasElement | null>(null)
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
let animationId: number | null = null
let particles: Array<{x: number, y: number, vx: number, vy: number, size: number, opacity: number}> = []

// 粒子动画初始化
const initParticles = () => {
    const canvas = particleCanvas.value
    if (!canvas) return

    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) return

    const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 创建粒子
    const particleCount = 50
    particles = []
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.1
        })
    }

    const animate = () => {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

        // 更新和绘制粒子
        particles.forEach((p, i) => {
            p.x += p.vx
            p.y += p.vy

            // 边界检测
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1

            // 绘制粒子
            canvasCtx.beginPath()
            canvasCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            canvasCtx.fillStyle = `rgba(180, 180, 180, ${p.opacity})`
            canvasCtx.fill()

            // 绘制连线
            particles.forEach((p2, j) => {
                if (i >= j) return
                const dx = p.x - p2.x
                const dy = p.y - p2.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < 150) {
                    canvasCtx.beginPath()
                    canvasCtx.moveTo(p.x, p.y)
                    canvasCtx.lineTo(p2.x, p2.y)
                    canvasCtx.strokeStyle = `rgba(200, 200, 200, ${0.15 * (1 - dist / 150)})`
                    canvasCtx.lineWidth = 0.5
                    canvasCtx.stroke()
                }
            })
        })

        animationId = requestAnimationFrame(animate)
    }

    animate()
}

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
        duration: 0.5,
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

    // 初始化粒子动画
    initParticles()

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
            .to('.line', { scaleY: 1, duration: 0.2, stagger: 0.08 })
            .to([decor1.value, decor2.value], { opacity: 1, scale: 1, duration: 0.2, stagger: 0.1 }, '-=0.8')
            .to([decor3.value, decor4.value], { opacity: 1, x: 0, duration: 0.3, stagger: 0.1 }, '-=0.7')
            .to([cornerTL.value, cornerBR.value], { opacity: 1, duration: 0.4 }, '-=0.5')
            .to([sideLeft.value, sideRight.value], { opacity: 1, duration: 0.4 }, '-=0.4')
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
    if (animationId) {
        cancelAnimationFrame(animationId)
    }
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

/* 粒子画布 */
.particle-canvas {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

/* 扫描线 */
.scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(150, 150, 150, 0.3), transparent);
    animation: scanMove 8s linear infinite;
    pointer-events: none;
}

.scan-line-2 {
    animation: scanMove 12s linear infinite reverse;
    animation-delay: -4s;
}

@keyframes scanMove {
    0% { top: -2px; opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
}

/* 能量圈 */
.energy-ring {
    position: absolute;
    pointer-events: none;
    opacity: 0.6;
}

.energy-ring-1 {
    top: 5%;
    right: 5%;
    width: 200px;
    height: 200px;
    animation: energySpin 30s linear infinite, energyPulse 4s ease-in-out infinite;
}

.energy-ring-2 {
    bottom: 8%;
    left: 5%;
    width: 160px;
    height: 160px;
    animation: energySpin 40s linear infinite reverse, energyPulse 5s ease-in-out infinite;
    animation-delay: -2s;
}

@keyframes energySpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes energyPulse {
    0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
    50% { opacity: 0.7; transform: scale(1.05) rotate(180deg); }
}

/* 浮动几何图形 */
.float-geo {
    position: absolute;
    pointer-events: none;
    color: #d0d0d0;
    opacity: 0;
    animation: floatIn 1s ease-out forwards, floatMove 6s ease-in-out infinite;
}

.float-geo-1 {
    top: 25%;
    left: 15%;
    width: 40px;
    height: 40px;
    animation-delay: 0.5s, 0s;
}

.float-geo-2 {
    top: 60%;
    right: 12%;
    width: 30px;
    height: 30px;
    animation-delay: 0.7s, -1s;
}

.float-geo-3 {
    bottom: 30%;
    left: 20%;
    width: 24px;
    height: 24px;
    animation-delay: 0.9s, -2s;
}

.float-geo-4 {
    top: 15%;
    right: 20%;
    width: 36px;
    height: 36px;
    animation-delay: 1.1s, -3s;
}

@keyframes floatIn {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 0.6; transform: scale(1); }
}

@keyframes floatMove {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(5deg); }
    50% { transform: translateY(-5px) rotate(-3deg); }
    75% { transform: translateY(-15px) rotate(3deg); }
}

/* 流动光线 */
.flow-line {
    position: absolute;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(180, 180, 180, 0.5), transparent);
}

.flow-line-h {
    height: 1px;
    width: 100px;
    animation: flowH 6s linear infinite;
}

.flow-line-v {
    width: 1px;
    height: 100px;
    background: linear-gradient(180deg, transparent, rgba(180, 180, 180, 0.5), transparent);
    animation: flowV 8s linear infinite;
}

.flow-line-1 {
    top: 20%;
    animation-delay: 0s;
}

.flow-line-2 {
    bottom: 25%;
    animation-delay: -3s;
}

.flow-line-3 {
    left: 10%;
    animation-delay: -2s;
}

.flow-line-4 {
    right: 10%;
    animation-delay: -5s;
}

@keyframes flowH {
    0% { left: -100px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { left: 100%; opacity: 0; }
}

@keyframes flowV {
    0% { top: -100px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
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
    background: radial-gradient(circle, rgba(206, 17, 17, 0.0425) 0%, transparent 15%);
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

    .energy-ring-1 {
        width: 120px;
        height: 120px;
    }

    .energy-ring-2 {
        width: 100px;
        height: 100px;
    }

    .float-geo {
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

    .energy-ring {
        display: none;
    }

    .flow-line {
        display: none;
    }

    .scan-line {
        display: none;
    }
}
</style>
