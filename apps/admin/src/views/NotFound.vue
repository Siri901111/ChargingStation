<template>
    <div class="page" ref="page" @mousemove="onMove" @mouseleave="onLeave">
      <!-- 背景线条 -->
      <div class="bg">
        <span v-for="i in 14" :key="i" class="line"></span>
      </div>
  
      <!-- 主体 -->
      <div class="content" ref="content">
        <div class="num" ref="num404">
          <span>4</span>
          <span>0</span>
          <span>4</span>
        </div>
  
        <div class="text" ref="text">
          PAGE NOT FOUND
        </div>
  
        <button class="btn" @click="goHome">
          BACK HOME
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import gsap from 'gsap'

  const router = useRouter()
  const page = ref(null)
  const content = ref(null)
  const num404 = ref(null)
  const text = ref(null)
  
  let introTL = null
  
  /* ================= 初始化动画 ================= */
  onMounted(() => {
    gsap.set(num404.value.children, {
      rotationX: -90,
      opacity: 0,
      transformOrigin: '50% 50% -140'
    })
  
    gsap.set(text.value, { opacity: 0, y: 16 })
  
    gsap.set('.bg .line', {
      scaleY: 0,
      transformOrigin: 'top'
    })
  
    introTL = gsap.timeline({ defaults: { ease: 'power3.out' } })
  
    introTL
      .addLabel('start')
      .to('.bg .line', {
        scaleY: 1,
        duration: 1.8,
        stagger: 0.08,
        ease: 'power2.out'
      }, 'start')
      .to(num404.value.children, {
        rotationX: 0,
        opacity: 1,
        duration: 1.3,
        stagger: 0.15
      }, 'start+=0.3')
      .to(text.value, {
        opacity: 1,
        y: 0,
        duration: 1
      }, 'start+=1')
  
    // 呼吸感
    gsap.to(num404.value, {
      y: -10,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  })
  
  /* ================= 鼠标 3D 视差 ================= */
  const onMove = (e) => {
    const { innerWidth, innerHeight } = window
    const x = (e.clientX / innerWidth - 0.5) * 2
    const y = (e.clientY / innerHeight - 0.5) * 2
  
    gsap.to(content.value, {
      rotationY: x * 8,
      rotationX: -y * 8,
      x: x * 20,
      y: y * 20,
      duration: 0.8,
      ease: 'power3.out'
    })
  
    gsap.to('.bg .line', {
      x: x * 40,
      duration: 1.2,
      ease: 'power3.out'
    })
  }
  
  const onLeave = () => {
    gsap.to([content.value, '.bg .line'], {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
  }
  
  /* ================= 离开 ================= */
  onBeforeUnmount(() => {
    introTL && introTL.kill()
  })
  
  const goHome = () => {
    router.back()
    console.log('go home')
  }
  </script>
  
  <style scoped>
  .page {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #0b0b0b;
    color: #ffffff;
    overflow: hidden;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro Display",
      "Inter",
      "Segoe UI",
      sans-serif;
  }
  
  /* 背景线条 */
  .bg {
    position: absolute;
    inset: 0;
    display: flex;
    gap: 4vw;
    justify-content: center;
    opacity: 0.12;
  }
  
  .bg .line {
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, #fff, transparent);
  }
  
  /* 主体 */
  .content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    perspective: 1200px;
  }
  
  .num {
    display: flex;
    font-size: 25vw;
    font-weight: 800;
    letter-spacing: -1.4vw;
    line-height: 1;
  }
  
  .num span {
    display: inline-block;
  }
  
  .text {
    margin-top: 18px;
    font-size: 18px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
  }
  
  .btn {
    margin-top: 42px;
    padding: 10px 26px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.35);
    color: #fff;
    cursor: pointer;
    letter-spacing: 0.25em;
    font-size: 12px;
    transition: all 0.35s;
  }
  
  .btn:hover {
    background: #fff;
    color: #000;
  }
  </style>
  