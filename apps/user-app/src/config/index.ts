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

const envMap: Record<string, EnvConfig> = {
  development: {
    baseUrl: 'http://localhost:3001/api/mobile',
    wsUrl: 'ws://localhost:3001',
    amapKey: 'YOUR_AMAP_KEY',
    debug: true,
  },
  production: {
    baseUrl: 'https://api.example.com/api/mobile',
    wsUrl: 'wss://api.example.com',
    amapKey: 'YOUR_AMAP_KEY',
    debug: false,
  },
}

const env = import.meta.env.MODE || 'development'

export const config: EnvConfig = envMap[env] || envMap.development

export default config
