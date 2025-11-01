import { INGREDIENT_MAP } from '../data/ingredients'
import { useGame } from '../context/GameContext'
import { RecipeReference } from './RecipeReference'

export const WorkspaceView = () => {
  const {
    workspace,
    undoLastAction,
    clearWorkspace,
    serveDrink,
    activeTicket,
    mode
  } = useGame()

  return (
    <section className="workspace">
      <div className="workspace-board">
        <header>
          <h2>Prep Area</h2>
          <p>Build, shake, stir, garnish, and serve</p>
        </header>
        <div className="workspace-status">
          <div className="workspace-section">
            <h3>Glass</h3>
            <p>{workspace.glassId ? workspace.glassId.replace('-', ' ') : 'Select glassware from the rack'}</p>
            {workspace.rim && <p className="workspace-note">Rim: {workspace.rim}</p>}
          </div>
          <div className="workspace-section">
            <h3>Ingredients</h3>
            {workspace.ingredients.length === 0 ? (
              <p>No pours yet.</p>
            ) : (
              <ol>
                {workspace.ingredients.map((entry) => {
                  const ingredient = INGREDIENT_MAP[entry.ingredientId]
                  return (
                    <li key={entry.id}>
                      <span className="ingredient-name">{ingredient?.name ?? entry.ingredientId}</span>
                      {entry.toolId && <span className="ingredient-detail"> via {entry.toolId}</span>}
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
          <div className="workspace-section">
            <h3>Techniques</h3>
            {workspace.techniques.length === 0 ? (
              <p>Use tools to record your technique.</p>
            ) : (
              <ul>
                {workspace.techniques.map((technique) => (
                  <li key={technique}>{technique.toUpperCase()}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="workspace-section">
            <h3>Garnish</h3>
            {workspace.garnishes.length === 0 ? (
              <p>Ready for flair.</p>
            ) : (
              <ul>
                {workspace.garnishes.map((garnish) => (
                  <li key={garnish}>{INGREDIENT_MAP[garnish]?.name ?? garnish}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="workspace-controls">
          <button type="button" onClick={undoLastAction}>
            Undo Last Step
          </button>
          <button type="button" onClick={clearWorkspace}>
            Clear Station
          </button>
          <button type="button" className="primary" onClick={serveDrink}>
            {mode === 'creative' ? 'Publish Creation' : 'Serve to Rail'}
          </button>
        </div>
      </div>
      <aside className="workspace-reference">
        <h2>Recipe Book</h2>
        {mode === 'creative' ? (
          <p>Creative sessions have no recipe. Follow your instincts.</p>
        ) : (
          <RecipeReference recipeId={activeTicket?.recipeId} />
        )}
      </aside>
    </section>
  )
}
