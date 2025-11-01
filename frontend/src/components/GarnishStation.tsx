import { GARNISHES } from '../data/ingredients'
import { useGame } from '../context/GameContext'

const utilityOptions = [
  { id: 'sugar-cube', label: 'Sugar Cube', type: 'ingredient' as const },
  { id: 'salt', label: 'Salt Rim', type: 'rim' as const }
]

export const GarnishStation = () => {
  const { addGarnish, setRim, addIngredient, workspace } = useGame()

  return (
    <section className="station garnish-station">
      <header>
        <h2>Garnish & Prep</h2>
        <p>Finishing touches and prep essentials</p>
      </header>
      <div className="station-grid">
        {GARNISHES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="ingredient-card"
            onClick={() => addGarnish(item.id)}
          >
            <span className="ingredient-name">{item.name}</span>
          </button>
        ))}
      </div>
      <div className="station-grid utilities">
        {utilityOptions.map((utility) => {
          if (utility.type === 'ingredient') {
            return (
              <button
                key={utility.id}
                type="button"
                className="ingredient-card"
                onClick={() => addIngredient(utility.id)}
              >
                <span className="ingredient-name">{utility.label}</span>
              </button>
            )
          }

          return (
            <button
              key={utility.id}
              type="button"
              className={`ingredient-card ${workspace.rim === utility.id ? 'active' : ''}`}
              onClick={() => setRim(workspace.rim === utility.id ? undefined : (utility.id as 'salt' | 'sugar'))}
            >
              <span className="ingredient-name">{utility.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
