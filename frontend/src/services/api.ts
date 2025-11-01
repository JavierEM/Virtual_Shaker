import { API_BASE_URL, USE_MOCK_BACKEND } from '../config'
import { updateMockLeaderboard } from './realtime'
import type {
  LeaderboardEntry,
  MatchmakingMode,
  PlayerSession
} from '../types'
import type {
  AuthGuestResponse,
  LabPublishRequest,
  LabPublishResponse,
  LeaderboardListResponse,
  LeaderboardSubmitRequest,
  LeaderboardSubmitResponse,
  MatchmakingCancelRequest,
  MatchmakingCancelResponse,
  MatchmakingSearchRequest,
  MatchmakingSearchResponse,
  OrdersCompleteRequest,
  OrdersCompleteResponse
} from './contracts'

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
  if (USE_MOCK_BACKEND) {
    await mockDelay(150)
    return mockRequest<TResponse>(path, { method, body, token })
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
    } catch {
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
  session: PlayerSession
  leaderboard: LeaderboardEntry[]
}

const mockState: MockState = {
  session: {
    token: 'mock-session-token',
    profile: {
      id: 'guest-001',
      displayName: 'Guest Bartender',
      xp: 0,
      favoriteVenue: 'dive'
    },
    expiresAt: Date.now() + 1000 * 60 * 60
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
      return mockState.session as unknown as TResponse
    case '/leaderboard/rush':
      return { entries: mockState.leaderboard } as unknown as TResponse
    case '/leaderboard/submit': {
      const body = options.body as LeaderboardSubmitRequest
      const newEntry: LeaderboardEntry = {
        player: mockState.session.profile.displayName,
        score: body.score,
        mode: body.mode,
        achievedAt: Date.now(),
        venue: body.venue
      }
      mockState.leaderboard = [newEntry, ...mockState.leaderboard]
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
        .slice(0, 20)
      updateMockLeaderboard(mockState.leaderboard)
      const rank = mockState.leaderboard.find((entry) => entry.player === newEntry.player && entry.score === newEntry.score)?.rank
      return { success: true, rank } as unknown as TResponse
    }
    case '/orders/complete': {
      const body = options.body as OrdersCompleteRequest
      mockState.session = {
        ...mockState.session,
        profile: {
          ...mockState.session.profile,
          xp: mockState.session.profile.xp + body.score.total
        }
      }
      return { success: true, awardedXp: body.score.total } as unknown as TResponse
    }
    case '/lab/publish':
      return {
        success: true,
        recipeId: `lab-${Date.now()}`,
        shareUrl: 'https://virtualshaker.com/community/recipes/lab-' + Date.now()
      } as unknown as TResponse
    case '/matchmaking/search':
      return {
        mode: (options.body as MatchmakingSearchRequest).mode,
        status: 'searching',
        startedAt: Date.now()
      } as unknown as TResponse
    case '/matchmaking/cancel':
      return { success: true } as unknown as TResponse
    default:
      return {} as TResponse
  }
}

export const api = {
  signInGuest: () => request<AuthGuestResponse>('/auth/guest', { method: 'POST' }),
  fetchLeaderboard: (token?: string) =>
    request<LeaderboardListResponse>('/leaderboard/rush', { method: 'GET', token }),
  submitLeaderboardScore: (token: string, entry: LeaderboardSubmitRequest) =>
    request<LeaderboardSubmitResponse>('/leaderboard/submit', { method: 'POST', body: entry, token }),
  submitCompletedOrder: (token: string, order: OrdersCompleteRequest) =>
    request<OrdersCompleteResponse>('/orders/complete', { method: 'POST', body: order, token }),
  publishCreation: (token: string, payload: LabPublishRequest) =>
    request<LabPublishResponse>('/lab/publish', { method: 'POST', body: payload, token }),
  startMatchmaking: (token: string, mode: MatchmakingMode) =>
    request<MatchmakingSearchResponse>('/matchmaking/search', {
      method: 'POST',
      body: { mode } satisfies MatchmakingSearchRequest,
      token
    }),
  cancelMatchmaking: (token: string, mode: MatchmakingMode) =>
    request<MatchmakingCancelResponse>('/matchmaking/cancel', {
      method: 'POST',
      body: { mode } satisfies MatchmakingCancelRequest,
      token
    })
}
