const defaultApiBase = 'https://api.virtualshaker.com/v1'
const defaultWsBase = 'wss://realtime.virtualshaker.com/ws'

const rawApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
const rawWsBase = import.meta.env.VITE_WS_BASE_URL as string | undefined
const rawUseMock = (import.meta.env.VITE_USE_MOCK_BACKEND as string | undefined)?.toLowerCase()

export const API_BASE_URL = rawApiBase ?? defaultApiBase
export const WS_BASE_URL = rawWsBase ?? defaultWsBase

export const USE_MOCK_BACKEND = rawUseMock === 'true' || API_BASE_URL.includes('.local') || WS_BASE_URL.includes('.local')
