const defaultApiBase = 'https://api.virtualshaker.local/v1'
const defaultWsBase = 'wss://api.virtualshaker.local/realtime'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? defaultApiBase
export const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL as string | undefined) ?? defaultWsBase

export const isMockBackend = API_BASE_URL.includes('virtualshaker.local')
