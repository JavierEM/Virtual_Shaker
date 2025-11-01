export type IngredientCategory =
  | 'spirit'
  | 'modifier'
  | 'bitter'
  | 'mixer'
  | 'garnish'
  | 'glassware'
  | 'tool'
  | 'utility'

export type Technique = 'shake' | 'stir' | 'muddle' | 'build' | 'strain'

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  description?: string
  icon?: string
  defaultAmount?: number
  unit?: 'oz' | 'dash' | 'cube' | 'piece'
}

export interface Tool {
  id: string
  name: string
  category: 'tool'
  technique?: Technique
  type: 'measure' | 'mix' | 'prep' | 'serve'
  description?: string
}

export interface Glassware {
  id: string
  name: string
  category: 'glassware'
  description?: string
}

export interface IngredientRequirement {
  ingredientId: string
  amount?: number
  unit?: 'oz' | 'dash' | 'cube' | 'piece'
  preparation?: string
  optional?: boolean
}

export interface Recipe {
  id: string
  name: string
  venueUnlock: 'dive' | 'tiki' | 'lounge' | 'speakeasy'
  difficulty: 1 | 2 | 3 | 4 | 5
  glassId: string
  method: Technique
  requiresIce: boolean
  requiresJigger?: boolean
  garnishIds?: string[]
  rimOptions?: Array<'salt' | 'sugar'>
  description?: string
  ingredientRequirements: IngredientRequirement[]
  notes?: string[]
}

export type GameMode = 'career' | 'rush' | 'creative'

export interface OrderTicket {
  id: string
  recipeId: string
  createdAt: number
  specialModifiers?: string[]
  deadline?: number
}

export interface WorkspaceIngredient {
  id: string
  ingredientId: string
  toolId?: string
  timestamp: number
}

export interface WorkspaceState {
  glassId?: string
  ingredients: WorkspaceIngredient[]
  garnishes: string[]
  techniques: Technique[]
  hasIce: boolean
  rim?: 'salt' | 'sugar'
  startedAt?: number
}

export interface ScoreBreakdown {
  accuracy: number
  technique: number
  speed: number
  total: number
}

export interface CompletedOrder {
  ticket: OrderTicket
  recipe: Recipe
  servedAt: number
  score: ScoreBreakdown
  mistakes: string[]
}

export interface LeaderboardEntry {
  player: string
  score: number
  mode: GameMode
  achievedAt: number
  venue: string
  rank?: number
}

export interface PlayerProfile {
  id: string
  displayName: string
  avatarUrl?: string
  xp: number
  favoriteVenue?: string
}

export interface PlayerSession {
  token: string
  profile: PlayerProfile
  expiresAt?: number
}

export type MatchmakingMode = 'rush' | 'head-to-head' | 'co-op'

export interface MatchmakingState {
  mode: MatchmakingMode
  status: 'idle' | 'searching' | 'matched' | 'in-progress'
  opponentName?: string
  matchId?: string
  startedAt?: number
}

export interface RealtimeMessage<TType extends string = string, TPayload = unknown> {
  type: TType
  payload: TPayload
}

export type LeaderboardSnapshotMessage = RealtimeMessage<'leaderboard:snapshot', {
  entries: LeaderboardEntry[]
}>

export type MatchStatusMessage = RealtimeMessage<'match:status', MatchmakingState>

export type RushClockMessage = RealtimeMessage<'rush:clock', {
  secondsRemaining: number
  matchId?: string
}>

export interface CoopTask {
  id: string
  description: string
  completed: boolean
}

export interface CoopStatus {
  roomId: string
  bartenderReady: boolean
  barbackReady: boolean
  tasks: CoopTask[]
  updatedAt: number
}

export type CoopUpdateMessage = RealtimeMessage<'coop:update', CoopStatus>

export type VirtualShakerRealtimeMessage =
  | LeaderboardSnapshotMessage
  | MatchStatusMessage
  | RushClockMessage
  | CoopUpdateMessage
  | RealtimeMessage
