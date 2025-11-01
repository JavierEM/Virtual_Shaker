import { API_BASE_URL, isMockBackend } from '../config'
import { updateMockLeaderboard } from './realtime'
import type {
  CompletedOrder,
  LeaderboardEntry,
  MatchmakingMode,
  MatchmakingState,
  PlayerProfile
} from '../types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ApiOptions<TBody> {
  method?: HttpMethod
  body?: TBody
  token?: string
  signal?: AbortSignal
}

interface ApiErrorShape {
  error: string
  message?: string
  statusCode?: number
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const request = async <TResponse, TBody = unknown>(
  path: string,
  { method = 'GET', body, token, signal }: ApiOptions<TBody> = {}
): Promise<TResponse> => {
  if (isMockBackend) {
    await mockDelay(150)
    return mockRequest<TResponse>(path, { method, body })
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data: ApiErrorShape = await response.json()
      message = data.message ?? data.error ?? message
    } catch (error) {
      // ignore
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

// Mock backend responses so the front end is functional without a server
interface MockState {
  profile: PlayerProfile
  leaderboard: LeaderboardEntry[]
}

const mockState: MockState = {
  profile: {
    id: 'guest-001',
    displayName: 'Guest Bartender',
    xp: 0,
    favoriteVenue: 'dive'
  },
  leaderboard: [
    { player: 'NovaMix', score: 18750, mode: 'rush', achievedAt: Date.now() - 86_400_000, venue: 'speakeasy', rank: 1 },
    { player: 'ShakerAce', score: 17420, mode: 'rush', achievedAt: Date.now() - 172_800_000, venue: 'lounge', rank: 2 },
    { player: 'CitrusQueen', score: 16610, mode: 'rush', achievedAt: Date.now() - 90_000_000, venue: 'tiki', rank: 3 }
  ]
}

const mockRequest = async <TResponse, TBody = unknown>(
  path: string,
  options: ApiOptions<TBody>
): Promise<TResponse> => {
  switch (path) {
    case '/auth/guest':
      return mockState.profile as unknown as TResponse
    case '/leaderboard/rush':
      return mockState.leaderboard as unknown as TResponse
    case '/leaderboard/submit': {
      const body = options.body as { score: number; player: string; venue: string }
      const newEntry: LeaderboardEntry = {
        player: body.player,
        score: body.score,
        mode: 'rush',
        achievedAt: Date.now(),
        venue: body.venue
      }
      mockState.leaderboard = [newEntry, ...mockState.leaderboard]
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
        .slice(0, 20)
      updateMockLeaderboard(mockState.leaderboard)
      return { success: true } as unknown as TResponse
    }
    case '/orders/complete': {
      const body = options.body as CompletedOrder
      mockState.profile = {
        ...mockState.profile,
        xp: mockState.profile.xp + body.score.total
      }
      return { success: true } as unknown as TResponse
    }
    case '/lab/publish':
      return { success: true } as unknown as TResponse
    case '/matchmaking/search':
      return {
        mode: (options.body as { mode: MatchmakingMode }).mode,
        status: 'searching'
      } as unknown as TResponse
    case '/matchmaking/cancel':
      return { success: true } as unknown as TResponse
    default:
      return {} as TResponse
  }
}

export const api = {
  signInGuest: () => request<PlayerProfile>('/auth/guest', { method: 'POST' }),
  fetchLeaderboard: () => request<LeaderboardEntry[]>('/leaderboard/rush'),
  submitLeaderboardScore: (entry: { player: string; score: number; venue: string }) =>
    request<{ success: boolean }>('/leaderboard/submit', { method: 'POST', body: entry }),
  submitCompletedOrder: (order: CompletedOrder) =>
    request<{ success: boolean }>('/orders/complete', { method: 'POST', body: order }),
  publishCreation: (payload: { name: string; flavorProfile: string; ingredients: string[] }) =>
    request<{ success: boolean }>('/lab/publish', { method: 'POST', body: payload }),
  startMatchmaking: (mode: MatchmakingMode) =>
    request<MatchmakingState>('/matchmaking/search', { method: 'POST', body: { mode } }),
  cancelMatchmaking: (mode: MatchmakingMode) =>
    request<{ success: boolean }>('/matchmaking/cancel', { method: 'POST', body: { mode } })
}
