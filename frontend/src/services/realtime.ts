import { WS_BASE_URL, isMockBackend } from '../config'
import type { LeaderboardEntry, VirtualShakerRealtimeMessage } from '../types'

type EventHandler = (message: VirtualShakerRealtimeMessage) => void

interface RealtimeOptions {
  token?: string
  onMessage?: EventHandler
  onConnect?: () => void
  onDisconnect?: (event: CloseEvent) => void
}

const mockLeaderboard: LeaderboardEntry[] = []

export const createRealtimeConnection = ({ token, onMessage, onConnect, onDisconnect }: RealtimeOptions) => {
  if (isMockBackend) {
    const interval = window.setInterval(() => {
      if (mockLeaderboard.length === 0) return
      onMessage?.({ type: 'leaderboard:snapshot', payload: { entries: mockLeaderboard } })
    }, 5000)

    onConnect?.()

    return {
      close: () => {
        window.clearInterval(interval)
        onDisconnect?.(new CloseEvent('close'))
      },
      send: () => undefined
    }
  }

  const url = new URL(WS_BASE_URL)
  if (token) {
    url.searchParams.set('token', token)
  }

  const socket = new WebSocket(url.toString())

  socket.addEventListener('open', () => {
    onConnect?.()
  })

  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data) as VirtualShakerRealtimeMessage
      onMessage?.(data)
    } catch (error) {
      console.error('Failed to parse realtime message', error)
    }
  })

  socket.addEventListener('close', (event) => {
    onDisconnect?.(event)
  })

  return socket
}

export const updateMockLeaderboard = (entries: LeaderboardEntry[]) => {
  mockLeaderboard.length = 0
  mockLeaderboard.push(...entries)
}
