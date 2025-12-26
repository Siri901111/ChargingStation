<template>
    <div class="sentry-test">
      <h2>Sentry 错误测试面板</h2>
      <!-- 1. 基础 JS 语法错误 -->
      <button @click="triggerSyntaxError">1. 未定义变量错误</button>
      <!-- 2. Promise 异步错误 -->
      <button @click="triggerPromiseError">2. 异步 Promise 错误</button>
      <!-- 3. Vue 模板语法错误 -->
      <button @click="showTemplateError = true">3. Vue 模板渲染错误</button>
      <div v-if="showTemplateError">{{ nullObj.name }}</div>
      <!-- 4. API 请求错误 -->
      <button @click="triggerApiError">4. Axios/Fetch 请求错误</button>
      <!-- 5. 自定义错误 + 面包屑 -->
      <button @click="triggerCustomErrorWithBreadcrumb">5. 自定义错误+面包屑</button>
      <!-- 6. 路由跳转错误 -->
      <button @click="triggerRouterError">6. 路由跳转错误</button>
      <!-- 7. 组件生命周期错误 -->
      <button @click="showLifecycleComp = true">7. 生命周期钩子错误</button>
      <LifecycleErrorComp v-if="showLifecycleComp" />
      <!-- 8. 会话重放测试（带用户输入） -->
      <div>
        <input v-model="userInput" placeholder="输入内容后点按钮触发错误" />
        <button @click="triggerReplayError">8. 会话重放测试</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import * as Sentry from '@sentry/vue'
  // 若用 Axios 需先安装：npm install axios
  import axios from 'axios'
  
  const router = useRouter()
  // 状态管理
  const showTemplateError = ref(false)
  const showLifecycleComp = ref(false)
  const userInput = ref('')
  
  // 1. 基础 JS 语法错误（未定义变量）
  const triggerSyntaxError = () => {
    // Sentry 会捕获：ReferenceError + 组件上下文 + 堆栈
    console.log(undefinedVariable)
  }
  
  // 2. 异步 Promise 错误（Sentry 默认捕获未处理的 Promise 拒绝）
  const triggerPromiseError = () => {
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('异步 Promise 执行失败'))
      }, 500)
    })
    // 故意不写 catch，触发未处理的 Promise 错误
  }
  
  // 3. Vue 模板渲染错误（访问 null/undefined 属性）
  // 点击按钮后渲染 {{ nullObj.name }}，触发模板错误
  
  // 4. API 请求错误（网络错误/404/500）
  const triggerApiError = async () => {
    try {
      // 访问不存在的接口，触发 404
      await axios.get('https://jsonplaceholder.typicode.com/nonexistent-api')
      // 或用 Fetch 测试：
      // await fetch('https://jsonplaceholder.typicode.com/nonexistent-api')
    } catch (err) {
      // 主动捕获并上报到 Sentry（也可让 Sentry 自动捕获）
      Sentry.captureException(err, {
        tags: { type: 'api_error' }, // 自定义标签，方便筛选
        extra: { url: 'https://jsonplaceholder.typicode.com/nonexistent-api' } // 附加信息
      })
    }
  }
  
  // 5. 自定义错误 + 面包屑（还原错误场景）
  const triggerCustomErrorWithBreadcrumb = () => {
    // 手动添加面包屑（记录错误前的操作）
    Sentry.addBreadcrumb({
      category: 'user_operation',
      message: '用户点击了「自定义错误+面包屑」按钮',
      level: Sentry.Severity.Info,
      data: { userInput: userInput.value } // 附加用户输入内容
    })
    // 抛出自定义错误
    const customErr = new Error('这是自定义业务错误：用户操作非法')
    customErr.code = 'BUSINESS_ERROR_001' // 自定义错误码
    Sentry.captureException(customErr) // 主动上报
  }
  
  // 6. 路由跳转错误（跳转到不存在的路由）
  const triggerRouterError = () => {
    router.push('/nonexistent-route') // 触发 Vue Router 导航失败
  }
  
  // 7. 组件生命周期错误（子组件 mounted 钩子报错）
  const LifecycleErrorComp = {
    template: '<div>生命周期错误组件</div>',
    setup() {
      onMounted(() => {
        // mounted 钩子中触发错误
        throw new Error('组件 mounted 钩子执行失败')
      })
    }
  }
  
  // 8. 会话重放测试（结合用户输入 + 错误）
  const triggerReplayError = () => {
    // Sentry Replay 会录制：用户输入内容 → 点击按钮 → 错误触发的全过程
    if (!userInput.value) {
      const err = new Error('用户输入不能为空！')
      Sentry.captureException(err)
      return
    }
    // 模拟输入后触发错误
    console.log(userInput.value.split('')[999].toUpperCase()) // 访问数组越界
  }
  
  // 可选：设置用户信息（关联错误到具体用户）
  onMounted(() => {
    Sentry.setUser({
      id: 'test_user_001',
      username: '测试用户',
      email: 'test@example.com'
    })
  })
  </script>
  
  <style scoped>
  .sentry-test {
    padding: 20px;
    gap: 10px;
    display: flex;
    flex-direction: column;
  }
  button {
    padding: 8px 16px;
    cursor: pointer;
  }
  input {
    padding: 8px;
    margin-right: 10px;
    width: 300px;
  }
  </style>