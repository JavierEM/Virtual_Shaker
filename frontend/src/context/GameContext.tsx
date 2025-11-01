import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import {
  type CompletedOrder,
  type GameMode,
  type OrderTicket,
  type Technique,
  type WorkspaceState,
  type LeaderboardEntry,
  type PlayerProfile,
  type MatchmakingState,
  type MatchmakingMode,
  type PlayerSession,
  type CoopStatus
} from '../types'
import { GLASSWARE, INGREDIENT_MAP, TOOLS } from '../data/ingredients'
import { RECIPES, RECIPES_BY_ID } from '../data/recipes'
import { evaluateWorkspace } from '../utils/scoring'
import { api } from '../services/api'
import { createRealtimeConnection, updateMockLeaderboard } from '../services/realtime'

interface CreativeCreation {
  id: string
  name: string
  flavorProfile: string
  ingredients: string[]
  createdAt: number
}

interface GameContextValue {
  mode: GameMode
  setMode: (mode: GameMode) => void
  score: number
  xp: number
  profile: PlayerProfile | null
  session: PlayerSession | null
  backendError: string | null
  leaderboard: LeaderboardEntry[]
  leaderboardStatus: 'idle' | 'loading' | 'error'
  realtimeConnected: boolean
  matchmaking: MatchmakingState | null
  coopStatus: CoopStatus | null
  orderQueue: OrderTicket[]
  activeTicket: OrderTicket | null
  activeRecipeName?: string
  workspace: WorkspaceState
  selectedTool: string | null
  completedOrders: CompletedOrder[]
  creativeArchive: CreativeCreation[]
  rushTimeRemaining: number | null
  availableVenues: string[]
  refreshLeaderboard: () => Promise<void>
  startMatchmaking: (mode: MatchmakingMode) => Promise<void>
  cancelMatchmaking: (mode: MatchmakingMode) => Promise<void>
  selectGlass: (glassId: string) => void
  addIngredient: (ingredientId: string) => void
  addGarnish: (garnishId: string) => void
  setRim: (rim: 'salt' | 'sugar' | undefined) => void
  toggleTool: (toolId: string) => void
  recordTechnique: (technique: Technique) => void
  addIce: () => void
  undoLastAction: () => void
  clearWorkspace: () => void
  serveDrink: () => void
  focusTicket: (ticketId: string) => void
}

const initialWorkspace = (): WorkspaceState => ({
  ingredients: [],
  garnishes: [],
  techniques: [],
  hasIce: false,
  rim: undefined,
  startedAt: Date.now()
})

const GameContext = createContext<GameContextValue | undefined>(undefined)

const id = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10))

const CAREER_THRESHOLDS = [
  { xp: 0, venues: ['dive'] },
  { xp: 250, venues: ['dive', 'tiki'] },
  { xp: 500, venues: ['dive', 'tiki', 'lounge'] },
  { xp: 750, venues: ['dive', 'tiki', 'lounge', 'speakeasy'] }
]

const getUnlockedVenues = (xp: number) => {
  let unlocked = CAREER_THRESHOLDS[0].venues
  for (const threshold of CAREER_THRESHOLDS) {
    if (xp >= threshold.xp) {
      unlocked = threshold.venues
    }
  }
  return unlocked
}

const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

const recipeIdsForVenues = (venues: string[]) =>
  RECIPES.filter((recipe) => venues.includes(recipe.venueUnlock)).map((recipe) => recipe.id)

const createTicketForRecipes = (recipeIds: string[]): OrderTicket => ({
  id: `ticket-${id()}`,
  recipeId: pickRandom(recipeIds),
  createdAt: Date.now()
})

interface GameProviderProps {
  children: ReactNode
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [mode, setModeState] = useState<GameMode>('career')
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => initialWorkspace())
  const [orderQueue, setOrderQueue] = useState<OrderTicket[]>(() => {
    const initialRecipeIds = recipeIdsForVenues(getUnlockedVenues(0))
    return initialRecipeIds.length ? [createTicketForRecipes(initialRecipeIds)] : []
  })
  const [activeTicketId, setActiveTicketId] = useState<string | null>(() => orderQueue[0]?.id ?? null)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([])
  const [creativeArchive, setCreativeArchive] = useState<CreativeCreation[]>([])
  const [score, setScore] = useState(0)
  const [xp, setXp] = useState(0)
  const [rushTimeRemaining, setRushTimeRemaining] = useState<number | null>(null)
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [session, setSession] = useState<PlayerSession | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardStatus, setLeaderboardStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [matchmaking, setMatchmaking] = useState<MatchmakingState | null>(null)
  const [coopStatus, setCoopStatus] = useState<CoopStatus | null>(null)
  const realtimeRef = useRef<{ close: () => void } | null>(null)

  const unlockedVenues = useMemo(() => getUnlockedVenues(xp), [xp])

  const activeTicket = useMemo(() => {
    if (mode === 'creative') {
      return null
    }
    if (!activeTicketId) {
      return orderQueue[0] ?? null
    }
    return orderQueue.find((ticket) => ticket.id === activeTicketId) ?? orderQueue[0] ?? null
  }, [activeTicketId, mode, orderQueue])

  const activeRecipeName = useMemo(() => {
    if (!activeTicket) return undefined
    return RECIPES_BY_ID[activeTicket.recipeId]?.name
  }, [activeTicket])

  const resetWorkspace = useCallback(() => {
    setWorkspace(initialWorkspace())
    setSelectedTool(null)
  }, [])

  const ensureQueue = useCallback(
    (currentMode: GameMode, currentQueue: OrderTicket[], venuePool: string[]): OrderTicket[] => {
      if (currentMode === 'creative') {
        return []
      }

      const recipeIds = recipeIdsForVenues(venuePool)
      if (recipeIds.length === 0) {
        return currentQueue
      }

      const targetLength = currentMode === 'rush' ? 4 : 3
      if (currentQueue.length >= targetLength) {
        return currentQueue
      }

      const updatedQueue = [...currentQueue]
      while (updatedQueue.length < targetLength) {
        updatedQueue.push(createTicketForRecipes(recipeIds))
      }
      return updatedQueue
    },
    []
  )

  useEffect(() => {
    setOrderQueue((prev) => ensureQueue(mode, prev, unlockedVenues))
  }, [ensureQueue, mode, unlockedVenues])

  useEffect(() => {
    if (mode === 'creative') {
      resetWorkspace()
      return
    }

    if (!activeTicketId && orderQueue.length > 0) {
      setActiveTicketId(orderQueue[0].id)
      resetWorkspace()
      return
    }

    if (activeTicketId && !orderQueue.some((ticket) => ticket.id === activeTicketId)) {
      const nextTicket = orderQueue[0]
      setActiveTicketId(nextTicket ? nextTicket.id : null)
      resetWorkspace()
    }
  }, [activeTicketId, mode, orderQueue, resetWorkspace])

  useEffect(() => {
    if (mode === 'rush') {
      setRushTimeRemaining(180)
      resetWorkspace()
      return
    }
    setRushTimeRemaining(null)
  }, [mode, resetWorkspace])

  useEffect(() => {
    if (rushTimeRemaining === null) return
    if (rushTimeRemaining <= 0) return

    const timer = window.setInterval(() => {
      setRushTimeRemaining((prev) => {
        if (prev === null) return prev
        if (prev <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [rushTimeRemaining])

  const refreshLeaderboard = useCallback(async () => {
    setLeaderboardStatus('loading')
    try {
      const response = await api.fetchLeaderboard(session?.token)
      setLeaderboard(response.entries)
      updateMockLeaderboard(response.entries)
      setLeaderboardStatus('idle')
      setBackendError((prev) => (prev && prev.includes('leaderboard') ? null : prev))
    } catch (error) {
      setLeaderboardStatus('error')
      const message = error instanceof Error ? error.message : 'Unable to load leaderboard'
      setBackendError(message)
    }
  }, [session?.token])

  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      try {
        const guestSession = await api.signInGuest()
        if (cancelled) return
        setSession(guestSession)
        setProfile(guestSession.profile)
        setXp(guestSession.profile.xp)
        setBackendError(null)
        try {
          const leaderboardResponse = await api.fetchLeaderboard(guestSession.token)
          if (!cancelled) {
            setLeaderboard(leaderboardResponse.entries)
            updateMockLeaderboard(leaderboardResponse.entries)
            setLeaderboardStatus('idle')
          }
        } catch (leaderboardError) {
          if (!cancelled) {
            const message =
              leaderboardError instanceof Error
                ? leaderboardError.message
                : 'Unable to load leaderboard'
            setBackendError(message)
            setLeaderboardStatus('error')
          }
        }
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Unable to connect to backend'
        setBackendError(message)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!session) return

    const connection = createRealtimeConnection({
      token: session.token,
      onConnect: () => setRealtimeConnected(true),
      onDisconnect: () => setRealtimeConnected(false),
      onMessage: (message) => {
        if (message.type === 'leaderboard:snapshot') {
          const payload = message.payload as { entries: LeaderboardEntry[] }
          setLeaderboard(payload.entries)
          updateMockLeaderboard(payload.entries)
        }
        if (message.type === 'match:status') {
          const payload = message.payload as MatchmakingState
          setMatchmaking(payload)
        }
        if (message.type === 'rush:clock') {
          const payload = message.payload as { secondsRemaining: number }
          setRushTimeRemaining(Math.max(0, Math.round(payload.secondsRemaining)))
        }
        if (message.type === 'coop:update') {
          const payload = message.payload as CoopStatus
          setCoopStatus(payload)
        }
      }
    })

    realtimeRef.current = connection as unknown as { close: () => void }

    return () => {
      setRealtimeConnected(false)
      setCoopStatus(null)
      realtimeRef.current?.close()
      realtimeRef.current = null
    }
  }, [session])

  const setMode = useCallback((nextMode: GameMode) => {
    setModeState(nextMode)
    if (nextMode === 'creative') {
      setOrderQueue([])
      setActiveTicketId(null)
      resetWorkspace()
      return
    }

    setOrderQueue((prev) => {
      const updated = ensureQueue(nextMode, prev, unlockedVenues)
      setActiveTicketId(updated[0]?.id ?? null)
      return updated
    })
    resetWorkspace()
  }, [ensureQueue, resetWorkspace, unlockedVenues])

  const focusTicket = useCallback((ticketId: string) => {
    if (mode === 'creative') return
    setActiveTicketId(ticketId)
    resetWorkspace()
  }, [mode, resetWorkspace])

  const selectGlass = useCallback((glassId: string) => {
    if (!GLASSWARE.some((glass) => glass.id === glassId)) return
    setWorkspace((prev) => ({
      ...prev,
      glassId,
      startedAt: prev.startedAt ?? Date.now()
    }))
  }, [])

  const addIngredient = useCallback((ingredientId: string) => {
    if (!INGREDIENT_MAP[ingredientId]) return
    setWorkspace((prev) => {
      const next: WorkspaceState = {
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            id: `pour-${id()}`,
            ingredientId,
            toolId: selectedTool ?? undefined,
            timestamp: Date.now()
          }
        ],
        startedAt: prev.startedAt ?? Date.now()
      }

      if (ingredientId === 'ice-cubes') {
        next.hasIce = true
      }

      return next
    })
  }, [selectedTool])

  const addGarnish = useCallback((garnishId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      garnishes: prev.garnishes.includes(garnishId)
        ? prev.garnishes
        : [...prev.garnishes, garnishId],
      startedAt: prev.startedAt ?? Date.now()
    }))
  }, [])

  const setRim = useCallback((rim: 'salt' | 'sugar' | undefined) => {
    setWorkspace((prev) => ({
      ...prev,
      rim,
      startedAt: prev.startedAt ?? Date.now()
    }))
  }, [])

  const toggleTool = useCallback((toolId: string) => {
    const tool = TOOLS.find((t) => t.id === toolId)
    if (!tool) return

    if (tool.type === 'measure') {
      setSelectedTool((prev) => (prev === toolId ? null : toolId))
      return
    }

    if (tool.technique) {
      setWorkspace((prev) => ({
        ...prev,
        techniques: prev.techniques.includes(tool.technique!)
          ? prev.techniques
          : [...prev.techniques, tool.technique!],
        startedAt: prev.startedAt ?? Date.now()
      }))
    }
  }, [])

  const recordTechnique = useCallback((technique: Technique) => {
    setWorkspace((prev) => ({
      ...prev,
      techniques: prev.techniques.includes(technique)
        ? prev.techniques
        : [...prev.techniques, technique],
      startedAt: prev.startedAt ?? Date.now()
    }))
  }, [])

  const addIce = useCallback(() => {
    addIngredient('ice-cubes')
  }, [addIngredient])

  const undoLastAction = useCallback(() => {
    setWorkspace((prev) => {
      if (prev.garnishes.length > 0) {
        return {
          ...prev,
          garnishes: prev.garnishes.slice(0, -1)
        }
      }

      if (prev.ingredients.length > 0) {
        const removed = prev.ingredients[prev.ingredients.length - 1]
        const remaining = prev.ingredients.slice(0, -1)
        return {
          ...prev,
          ingredients: remaining,
          hasIce:
            removed.ingredientId === 'ice-cubes'
              ? remaining.some((entry) => entry.ingredientId === 'ice-cubes')
              : prev.hasIce
        }
      }

      return prev
    })
  }, [])

  const clearWorkspace = useCallback(() => {
    resetWorkspace()
  }, [resetWorkspace])

  const describeFlavorProfile = useCallback((ingredients: string[]): string => {
    const profileParts: string[] = []
    if (ingredients.some((id) => INGREDIENT_MAP[id]?.category === 'spirit')) {
      profileParts.push('Spirit-Forward')
    }
    if (ingredients.some((id) => ['lime-juice', 'lemon-juice'].includes(id))) {
      profileParts.push('Citrusy')
    }
    if (ingredients.some((id) => ['simple-syrup', 'orgeat', 'agave-syrup', 'coconut-cream'].includes(id))) {
      profileParts.push('Sweet')
    }
    if (ingredients.some((id) => id === 'campari')) {
      profileParts.push('Bitter')
    }
    if (ingredients.some((id) => ['pineapple-juice', 'coconut-cream', 'dark-rum'].includes(id))) {
      profileParts.push('Tropical')
    }
    if (profileParts.length === 0) {
      profileParts.push('Balanced')
    }
    return profileParts.join(', ')
  }, [])

  const generateCreativeName = useCallback((ingredients: string[]) => {
    if (ingredients.length === 0) return 'Glass of Mystery'
    const spirit = ingredients.find((id) => INGREDIENT_MAP[id]?.category === 'spirit')
    const base = spirit ? INGREDIENT_MAP[spirit]?.name.split(' ')[0] ?? 'Spirit' : 'Zero-Proof'
    const vibePool = ['Whisper', 'Dream', 'Storm', 'Echo', 'Rush', 'Serenade', 'Mirage']
    return `${base} ${pickRandom(vibePool)}`
  }, [])

  const serveDrink = useCallback(() => {
    if (mode === 'creative') {
      const ingredientIds = workspace.ingredients.map((entry) => entry.ingredientId)
      const uniqueIngredients = Array.from(new Set(ingredientIds))
      const creation: CreativeCreation = {
        id: `creative-${id()}`,
        name: generateCreativeName(uniqueIngredients),
        flavorProfile: describeFlavorProfile(uniqueIngredients),
        ingredients: uniqueIngredients,
        createdAt: Date.now()
      }
      setCreativeArchive((prev) => [creation, ...prev].slice(0, 15))
      void (async () => {
        if (!session?.token) return
        try {
          await api.publishCreation(session.token, {
            name: creation.name,
            flavorProfile: creation.flavorProfile,
            ingredients: creation.ingredients
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to publish creation'
          setBackendError(message)
        }
      })()
      resetWorkspace()
      return
    }

    if (!activeTicket) {
      return
    }

    const recipe = RECIPES_BY_ID[activeTicket.recipeId]
    if (!recipe) return

    const servedAt = Date.now()
    const timeTakenSeconds = workspace.startedAt ? (servedAt - workspace.startedAt) / 1000 : 0
    const { breakdown, mistakes } = evaluateWorkspace(workspace, recipe, timeTakenSeconds)

    setScore((prev) => prev + breakdown.total)
    setXp((prev) => prev + breakdown.total)
    setProfile((prev) => (prev ? { ...prev, xp: prev.xp + breakdown.total } : prev))
    const completed: CompletedOrder = {
      ticket: activeTicket,
      recipe,
      servedAt,
      score: breakdown,
      mistakes
    }
    setCompletedOrders((prev) => [completed, ...prev])

    setOrderQueue((prev) => {
      const remaining = prev.filter((ticket) => ticket.id !== activeTicket.id)
      return ensureQueue(mode, remaining, unlockedVenues)
    })

    void (async () => {
      try {
        if (session?.token) {
          await api.submitCompletedOrder(session.token, completed)
          if (mode === 'rush' && profile) {
            await api.submitLeaderboardScore(session.token, {
              playerId: profile.id,
              score: breakdown.total,
              venue: recipe.venueUnlock,
              mode
            })
            await refreshLeaderboard()
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sync with backend'
        setBackendError(message)
      }
    })()

    resetWorkspace()
  }, [activeTicket, describeFlavorProfile, ensureQueue, generateCreativeName, mode, profile, refreshLeaderboard, resetWorkspace, session, unlockedVenues, workspace])

  const startMatchmaking = useCallback(
    async (matchMode: MatchmakingMode) => {
      if (!session?.token) {
        setBackendError('Sign-in required for matchmaking')
        return
      }
      try {
        const state = await api.startMatchmaking(session.token, matchMode)
        setMatchmaking(state)
        setBackendError(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start matchmaking'
        setBackendError(message)
      }
    },
    [session]
  )

  const cancelMatchmaking = useCallback(
    async (matchMode: MatchmakingMode) => {
      if (!session?.token) return
      try {
        await api.cancelMatchmaking(session.token, matchMode)
        setMatchmaking((prev) =>
          prev && prev.mode === matchMode
            ? { ...prev, status: 'idle', startedAt: undefined, opponentName: undefined }
            : prev
        )
        setBackendError(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to cancel matchmaking'
        setBackendError(message)
      }
    },
    [session]
  )

  const value: GameContextValue = {
    mode,
    setMode,
    score,
    xp,
    profile,
    session,
    backendError,
    leaderboard,
    leaderboardStatus,
    realtimeConnected,
    matchmaking,
    coopStatus,
    orderQueue,
    activeTicket,
    activeRecipeName,
    workspace,
    selectedTool,
    completedOrders,
    creativeArchive,
    rushTimeRemaining,
    availableVenues: unlockedVenues,
    refreshLeaderboard,
    startMatchmaking,
    cancelMatchmaking,
    selectGlass,
    addIngredient,
    addGarnish,
    setRim,
    toggleTool,
    recordTechnique,
    addIce,
    undoLastAction,
    clearWorkspace,
    serveDrink,
    focusTicket
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = (): GameContextValue => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}
