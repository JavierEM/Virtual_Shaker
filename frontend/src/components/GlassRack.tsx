import { GLASSWARE } from '../data/ingredients'
import { useGame } from '../context/GameContext'

export const GlassRack = () => {
  const { selectGlass, workspace } = useGame()

  return (
    <section className="station glass-rack">
      <header>
        <h2>Glass Rack</h2>
        <p>Select the perfect vessel</p>
      </header>
      <div className="station-grid">
        {GLASSWARE.map((glass) => (
          <button
            key={glass.id}
            type="button"
            className={`ingredient-card ${workspace.glassId === glass.id ? 'active' : ''}`}
            onClick={() => selectGlass(glass.id)}
          >
            <span className="ingredient-name">{glass.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
