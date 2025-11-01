import { BITTERS, MIXERS, MODIFIERS } from '../data/ingredients'
import { useGame } from '../context/GameContext'

export const TopShelf = () => {
  const { addIngredient } = useGame()

  return (
    <section className="station top-shelf">
      <header>
        <h2>Top Shelf</h2>
        <p>Premium modifiers, liqueurs, and mixers</p>
      </header>
      <div className="station-grid grouped">
        <div className="top-shelf-column">
          <h3>Liqueurs</h3>
          {MODIFIERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="ingredient-card"
              onClick={() => addIngredient(item.id)}
            >
              <span className="ingredient-name">{item.name}</span>
              <span className="ingredient-detail">{item.defaultAmount ?? 1} {item.unit ?? 'oz'}</span>
            </button>
          ))}
        </div>
        <div className="top-shelf-column">
          <h3>Mixers</h3>
          {MIXERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="ingredient-card"
              onClick={() => addIngredient(item.id)}
            >
              <span className="ingredient-name">{item.name}</span>
              <span className="ingredient-detail">{item.defaultAmount ?? 1} {item.unit ?? 'oz'}</span>
            </button>
          ))}
        </div>
        <div className="top-shelf-column">
          <h3>Bitters</h3>
          {BITTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="ingredient-card"
              onClick={() => addIngredient(item.id)}
            >
              <span className="ingredient-name">{item.name}</span>
              <span className="ingredient-detail">{item.defaultAmount ?? 1} {item.unit ?? ''}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
