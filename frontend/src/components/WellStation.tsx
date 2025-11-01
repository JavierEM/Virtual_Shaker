import { SPIRITS } from '../data/ingredients'
import { useGame } from '../context/GameContext'

export const WellStation = () => {
  const { addIngredient, addIce } = useGame()

  return (
    <section className="station well">
      <header>
        <h2>The Well</h2>
        <p>House spirits and ice bin</p>
      </header>
      <div className="station-grid">
        {SPIRITS.map((spirit) => (
          <button
            key={spirit.id}
            type="button"
            onClick={() => addIngredient(spirit.id)}
            className="ingredient-card"
          >
            <span className="ingredient-name">{spirit.name}</span>
            <span className="ingredient-detail">{spirit.defaultAmount ?? 2} {spirit.unit ?? 'oz'}</span>
          </button>
        ))}
      </div>
      <div className="station-actions">
        <button type="button" className="primary" onClick={addIce}>
          Scoop Ice
        </button>
      </div>
    </section>
  )
}
