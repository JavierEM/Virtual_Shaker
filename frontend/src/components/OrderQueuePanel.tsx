import { useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { RECIPES_BY_ID } from '../data/recipes'

export const OrderQueuePanel = () => {
  const { orderQueue, activeTicket, focusTicket, mode } = useGame()

  const tickets = useMemo(() => {
    if (mode === 'creative') return []
    return orderQueue.map((ticket) => {
      const recipe = RECIPES_BY_ID[ticket.recipeId]
      return {
        ticket,
        recipe
      }
    })
  }, [mode, orderQueue])

  if (mode === 'creative') {
    return (
      <section className="order-queue creative-empty">
        <h2>The Lab</h2>
        <p>No orders?experiment freely!</p>
      </section>
    )
  }

  return (
    <section className="order-queue">
      <h2>Tickets</h2>
      <ul>
        {tickets.map(({ ticket, recipe }) => {
          const isActive = activeTicket?.id === ticket.id
          return (
            <li key={ticket.id} className={isActive ? 'active' : ''}>
              <button type="button" onClick={() => focusTicket(ticket.id)}>
                <span className="ticket-title">{recipe?.name ?? 'Unknown Order'}</span>
                <span className="ticket-meta">
                  {recipe ? `${recipe.method.toUpperCase()} ? ${recipe.venueUnlock}` : '??'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
