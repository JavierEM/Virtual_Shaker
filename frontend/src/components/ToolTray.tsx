import { TOOLS } from '../data/ingredients'
import { useGame } from '../context/GameContext'

export const ToolTray = () => {
  const { toggleTool, selectedTool } = useGame()

  return (
    <section className="station tool-tray">
      <header>
        <h2>Tools</h2>
        <p>Measure, shake, stir, and finish</p>
      </header>
      <div className="station-grid">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`ingredient-card ${selectedTool === tool.id ? 'active' : ''}`}
            onClick={() => toggleTool(tool.id)}
          >
            <span className="ingredient-name">{tool.name}</span>
            <span className="ingredient-detail">{tool.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
