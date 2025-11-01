import { WS_BASE_URL, USE_MOCK_BACKEND } from '../config'
import type { CoopStatus, LeaderboardEntry, VirtualShakerRealtimeMessage } from '../types'

type EventHandler = (message: VirtualShakerRealtimeMessage) => void

interface RealtimeOptions {
  token?: string
  onMessage?: EventHandler
  onConnect?: () => void
  onDisconnect?: (event: CloseEvent) => void
  onReconnectAttempt?: (attempt: number, delayMs: number) => void
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

interface RealtimeConnection {
  close: () => void
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void
}

const mockRealtimeState: {
  leaderboard: LeaderboardEntry[]
  rushSeconds: number
  coopStatus: CoopStatus
} = {
  leaderboard: [],
  rushSeconds: 180,
  coopStatus: {
    roomId: 'mock-room',
    bartenderReady: true,
    barbackReady: false,
    tasks: [
      { id: 'prep-garnishes', description: 'Prep 6 lime wedges', completed: false },
      { id: 'restock-ice', description: 'Restock the ice bin', completed: true },
      { id: 'polish-glassware', description: 'Polish coupe glasses', completed: false }
    ],
    updatedAt: Date.now()
  }
}

const startMockStream = (onMessage?: EventHandler) => {
  const leaderboardTimer = window.setInterval(() => {
    if (mockRealtimeState.leaderboard.length === 0) return
    onMessage?.({ type: 'leaderboard:snapshot', payload: { entries: mockRealtimeState.leaderboard } })
  }, 5000)

  const rushTimer = window.setInterval(() => {
    mockRealtimeState.rushSeconds = mockRealtimeState.rushSeconds > 0 ? mockRealtimeState.rushSeconds - 1 : 180
    onMessage?.({ type: 'rush:clock', payload: { secondsRemaining: mockRealtimeState.rushSeconds } })
  }, 1000)

  const coopTimer = window.setInterval(() => {
    const tasks = mockRealtimeState.coopStatus.tasks.map((task) =>
      Math.random() > 0.7 ? { ...task, completed: !task.completed } : task
    )
    mockRealtimeState.coopStatus = {
      ...mockRealtimeState.coopStatus,
      barbackReady: Math.random() > 0.5,
      tasks,
      updatedAt: Date.now()
    }
    onMessage?.({ type: 'coop:update', payload: mockRealtimeState.coopStatus })
  }, 8000)

  return () => {
    window.clearInterval(leaderboardTimer)
    window.clearInterval(rushTimer)
    window.clearInterval(coopTimer)
  }
}

export const createRealtimeConnection = ({
  token,
  onMessage,
  onConnect,
  onDisconnect,
  onReconnectAttempt,
  maxRetries = 8,
  baseDelayMs = 1000,
  maxDelayMs = 10000
}: RealtimeOptions): RealtimeConnection => {
  if (USE_MOCK_BACKEND) {
    const stopMock = startMockStream(onMessage)
    onConnect?.()
    return {
      close: () => {
        stopMock()
        onDisconnect?.(new CloseEvent('close'))
      },
      send: () => undefined
    }
  }

  let socket: WebSocket | null = null
  let reconnectAttempts = 0
  let reconnectTimer: number | undefined
  let manuallyClosed = false

  const connect = () => {
    const url = new URL(WS_BASE_URL)
    if (token) {
      url.searchParams.set('token', token)
    }

    socket = new WebSocket(url.toString())

    socket.addEventListener('open', () => {
      reconnectAttempts = 0
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
      if (manuallyClosed) {
        return
      }
      if (reconnectAttempts >= maxRetries) {
        return
      }
      const delay = Math.min(baseDelayMs * 2 ** reconnectAttempts, maxDelayMs)
      reconnectAttempts += 1
      onReconnectAttempt?.(reconnectAttempts, delay)
      reconnectTimer = window.setTimeout(connect, delay)
    })

    socket.addEventListener('error', () => {
      socket?.close()
    })
  }

  connect()

  return {
    close: () => {
      manuallyClosed = true
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer)
      }
      socket?.close()
    },
    send: (data) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(data)
      }
    }
  }
}

export const updateMockLeaderboard = (entries: LeaderboardEntry[]) => {
  mockRealtimeState.leaderboard = entries
}
