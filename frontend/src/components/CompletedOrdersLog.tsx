import { useGame } from '../context/GameContext'

export const CompletedOrdersLog = () => {
  const { completedOrders } = useGame()

  return (
    <section className="completed-orders">
      <h2>Shift Log</h2>
      {completedOrders.length === 0 ? (
        <p>No drinks served yet.</p>
      ) : (
        <ul>
          {completedOrders.slice(0, 5).map((entry) => (
            <li key={entry.ticket.id}>
              <div className="order-summary">
                <span className="order-name">{entry.recipe.name}</span>
                <span className="order-score">+{entry.score.total}</span>
              </div>
              <div className="order-breakdown">
                <span>Accuracy {entry.score.accuracy}</span>
                <span>Technique {entry.score.technique}</span>
                <span>Speed {entry.score.speed}</span>
              </div>
              {entry.mistakes.length > 0 && (
                <ul className="order-mistakes">
                  {entry.mistakes.map((mistake, idx) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
