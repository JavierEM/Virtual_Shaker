import type {
  CompletedOrder,
  GameMode,
  LeaderboardEntry,
  MatchmakingMode,
  MatchmakingState,
  PlayerProfile
} from '../types'

export interface AuthGuestResponse {
  token: string
  profile: PlayerProfile
  expiresAt?: number
}

export interface LeaderboardListResponse {
  entries: LeaderboardEntry[]
}

export interface LeaderboardSubmitRequest {
  playerId: string
  score: number
  venue: string
  mode: GameMode
}

export interface LeaderboardSubmitResponse {
  success: boolean
  rank?: number
}

export type OrdersCompleteRequest = CompletedOrder

export interface OrdersCompleteResponse {
  success: boolean
  awardedXp: number
}

export interface LabPublishRequest {
  name: string
  flavorProfile: string
  ingredients: string[]
}

export interface LabPublishResponse {
  success: boolean
  recipeId: string
  shareUrl?: string
}

export interface MatchmakingSearchRequest {
  mode: MatchmakingMode
}

export type MatchmakingSearchResponse = MatchmakingState

export interface MatchmakingCancelRequest {
  mode: MatchmakingMode
}

export interface MatchmakingCancelResponse {
  success: boolean
}
