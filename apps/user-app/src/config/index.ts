/**
 * 环境配置
 */
interface EnvConfig {
  /** API 基础地址 */
  baseUrl: string
  /** WebSocket 地址 */
  wsUrl: string
  /** 高德地图 Key */
  amapKey: string
  /** 是否开启调试 */
  debug: boolean
}

/**
 * 获取API基础地址（用于局域网访问）
 * 在H5环境下，自动使用当前页面的hostname，支持通过IP访问
 */
function getBaseUrl(): string {
  // #ifdef H5
  if (typeof window !== 'undefined' && window.location) {
    // 在H5环境下，使用当前页面的hostname和协议
    // 如果通过 http://192.168.1.100:5174 访问，会自动使用 http://192.168.1.100:3001
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    
    // 使用当前访问的hostname，这样无论通过localhost还是IP访问都能正常工作
    return `${protocol}//${hostname}:3001/api/mobile`
  }
  // #endif
  
  // 默认使用localhost（非H5环境）
  return 'http://localhost:3001/api/mobile'
}

function getWsUrl(): string {
  // #ifdef H5
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${hostname}:3001`
  }
  // #endif
  
  return 'ws://localhost:3001'
}

const env = import.meta.env.MODE || 'development'

// 创建配置对象（使用getter确保在运行时获取正确的地址）
const createConfig = (): EnvConfig => {
  if (env === 'development') {
    return {
      // 在H5环境下自动使用当前hostname，支持局域网访问
      baseUrl: getBaseUrl(),
      wsUrl: getWsUrl(),
      amapKey: 'a862837e7b21b1d9e9ca11a4447524b9',
      debug: true,
    }
  } else {
    return {
      baseUrl: 'https://api.example.com/api/mobile',
      wsUrl: 'wss://api.example.com',
      amapKey: 'a862837e7b21b1d9e9ca11a4447524b9',
      debug: false,
    }
  }
}

export const config: EnvConfig = createConfig()

// 输出配置信息（用于调试）
if (config.debug) {
  console.log('🔧 [Config] 当前环境:', env)
  console.log('🔧 [Config] API地址:', config.baseUrl)
  console.log('🔧 [Config] WebSocket地址:', config.wsUrl)
  // #ifdef H5
  if (typeof window !== 'undefined' && window.location) {
    console.log('🔧 [Config] 当前访问地址:', window.location.href)
    console.log('🔧 [Config] 当前hostname:', window.location.hostname)
  }
  // #endif
}

export default config
