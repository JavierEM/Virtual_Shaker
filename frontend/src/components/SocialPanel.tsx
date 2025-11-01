const sampleLeaderboard = [
  { player: 'NovaMix', score: 18750 },
  { player: 'ShakerAce', score: 17420 },
  { player: 'CitrusQueen', score: 16610 }
]

export const SocialPanel = () => {
  return (
    <section className="social-panel">
      <h2>Community Buzz</h2>
      <div className="leaderboard">
        <h3>This Week&apos;s Rush Leaders</h3>
        <ol>
          {sampleLeaderboard.map((entry) => (
            <li key={entry.player}>
              <span className="player">{entry.player}</span>
              <span className="score">{entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
        <button type="button">View Global Leaderboard</button>
      </div>
      <div className="multiplayer-hooks">
        <h3>Coming Soon</h3>
        <ul>
          <li>Head-to-Head Bar Battles with live ghost progress</li>
          <li>Co-op Bar Brigade mode with bartender &amp; barback roles</li>
          <li>Share recipe cards directly to your community feed</li>
        </ul>
        <button type="button">Invite Friends</button>
      </div>
    </section>
  )
}
