import { useMemo } from 'react'
import { useGame } from '../context/GameContext'

export const SocialPanel = () => {
  const {
    leaderboard,
    leaderboardStatus,
    refreshLeaderboard,
    matchmaking,
    startMatchmaking,
    cancelMatchmaking,
    coopStatus
  } = useGame()

  const isSearching = matchmaking?.status === 'searching'

  const topEntries = useMemo(() => leaderboard.slice(0, 5), [leaderboard])

  const handleMatchmakingToggle = async () => {
    if (isSearching && matchmaking) {
      await cancelMatchmaking(matchmaking.mode)
    } else {
      await startMatchmaking('head-to-head')
    }
  }

  return (
    <section className="social-panel">
      <h2>Community Buzz</h2>
      <div className="leaderboard">
        <h3>This Week&apos;s Rush Leaders</h3>
        {leaderboardStatus === 'error' && (
          <p className="leaderboard-status">Unable to load leaderboard.</p>
        )}
        {leaderboardStatus === 'loading' && (
          <p className="leaderboard-status">Updating leaderboard...</p>
        )}
        <ol>
          {topEntries.map((entry) => (
            <li key={`${entry.player}-${entry.achievedAt}`}>
              <span className="player">
                {entry.rank ? `#${entry.rank} ` : ''}
                {entry.player}
              </span>
              <span className="score">{entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => void refreshLeaderboard()}>
          Refresh Leaderboard
        </button>
      </div>
      <div className="multiplayer-hooks">
        <h3>Matchmaking</h3>
        <ul>
          <li>Queue up for a 10-drink Bar Battle against a live opponent.</li>
          <li>Co-op Bar Brigade matchmaking opens soon.</li>
          <li>Share high scores and lab creations to the community book.</li>
        </ul>
        <div className="matchmaking-status">
          <span>
            {matchmaking?.status === 'matched'
              ? `Matched with ${matchmaking.opponentName ?? 'opponent'} - get ready!`
              : matchmaking?.status === 'searching'
              ? 'Searching for the next challenger...'
              : 'Ready when you are.'}
          </span>
          <button type="button" onClick={() => void handleMatchmakingToggle()}>
            {isSearching ? 'Cancel Search' : 'Find Bar Battle'}
          </button>
        </div>
        {coopStatus && (
          <div className="coop-status">
            <h4>Bar Brigade Room</h4>
            <p>
              Room {coopStatus.roomId} - Bartender {coopStatus.bartenderReady ? 'ready' : 'not ready'} - Barback{' '}
              {coopStatus.barbackReady ? 'ready' : 'not ready'}
            </p>
            <ul>
              {coopStatus.tasks.map((task) => (
                <li key={task.id} className={task.completed ? 'done' : ''}>
                  {task.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
