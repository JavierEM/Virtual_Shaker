import { useMemo } from 'react'
import { useGame } from '../context/GameContext'

const VENUE_LABELS: Record<string, string> = {
  dive: 'Dive Bar',
  tiki: 'Tiki Bar',
  lounge: 'Hotel Lounge',
  speakeasy: 'Speakeasy'
}

const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const GameHud = () => {
  const { mode, score, xp, rushTimeRemaining, activeRecipeName, availableVenues } = useGame()

  const venueBadges = useMemo(
    () =>
      availableVenues.map((venue) => (
        <span key={venue} className="venue-badge">
          {VENUE_LABELS[venue] ?? venue}
        </span>
      )),
    [availableVenues]
  )

  return (
    <header className="game-hud">
      <div className="hud-group">
        <h1>Virtual Shaker</h1>
        <p className="hud-subtitle">Craft cocktails. Beat the rush. Build a legend.</p>
      </div>
      <div className="hud-group metrics">
        <div>
          <span className="metric-label">Score</span>
          <span className="metric-value">{score}</span>
        </div>
        <div>
          <span className="metric-label">Career XP</span>
          <span className="metric-value">{xp}</span>
        </div>
        {mode === 'rush' && rushTimeRemaining !== null && (
          <div className={`rush-timer ${rushTimeRemaining <= 30 ? 'warning' : ''}`}>
            <span className="metric-label">Rush Clock</span>
            <span className="metric-value">{formatTimer(rushTimeRemaining)}</span>
          </div>
        )}
      </div>
      <div className="hud-group active-order">
        <span className="metric-label">Current Ticket</span>
        <span className="metric-value">{activeRecipeName ?? (mode === 'creative' ? 'Creative Session' : 'Loading...')}</span>
      </div>
      <div className="hud-group venues">
        <span className="metric-label">Unlocked Venues</span>
        <div className="venue-badges">{venueBadges}</div>
      </div>
    </header>
  )
}
