import type {
  CompletedOrder,
  GameMode,
  LeaderboardEntry,
  MatchmakingMode,
  MatchmakingState,
  PlayerProfile
} from '../types'

export namespace AuthContract {
  export interface GuestResponse {
    token: string
    profile: PlayerProfile
    expiresAt?: number
  }
}

export namespace LeaderboardContract {
  export interface ListResponse {
    entries: LeaderboardEntry[]
  }

  export interface SubmitRequest {
    playerId: string
    score: number
    venue: string
    mode: GameMode
  }

  export interface SubmitResponse {
    success: boolean
    rank?: number
  }
}

export namespace OrdersContract {
  export type CompleteRequest = CompletedOrder

  export interface CompleteResponse {
    success: boolean
    awardedXp: number
  }
}

export namespace LabContract {
  export interface PublishRequest {
    name: string
    flavorProfile: string
    ingredients: string[]
  }

  export interface PublishResponse {
    success: boolean
    recipeId: string
    shareUrl?: string
  }
}

export namespace MatchmakingContract {
  export interface SearchRequest {
    mode: MatchmakingMode
  }

  export type SearchResponse = MatchmakingState

  export interface CancelRequest {
    mode: MatchmakingMode
  }

  export interface CancelResponse {
    success: boolean
  }
}
