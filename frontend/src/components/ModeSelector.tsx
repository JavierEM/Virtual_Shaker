import { type GameMode } from '../types'
import { useGame } from '../context/GameContext'

const MODE_LABELS: Record<GameMode, string> = {
  career: 'Career: Rookie to Rock Star',
  rush: "8 O'Clock Rush",
  creative: 'The Lab'
}

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  career: 'Climb venues, unlock recipes, and build your legend behind the bar.',
  rush: 'Orders fly in for three intense minutes. Earn leaderboard bragging rights.',
  creative: 'No tickets, no timers. Invent and publish signature cocktails.'
}

export const ModeSelector = () => {
  const { mode, setMode } = useGame()

  return (
    <section className="mode-selector">
      {Object.entries(MODE_LABELS).map(([value, label]) => {
        const typedValue = value as GameMode
        const isActive = mode === typedValue
        return (
          <button
            key={value}
            type="button"
            className={isActive ? 'active' : ''}
            onClick={() => setMode(typedValue)}
          >
            <span className="mode-title">{label}</span>
            <span className="mode-description">{MODE_DESCRIPTIONS[typedValue]}</span>
          </button>
        )
      })}
    </section>
  )
}
