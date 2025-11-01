import { INGREDIENT_MAP } from '../data/ingredients'
import { RECIPES_BY_ID } from '../data/recipes'

interface RecipeReferenceProps {
  recipeId?: string
}

export const RecipeReference = ({ recipeId }: RecipeReferenceProps) => {
  if (!recipeId) {
    return (
      <div className="recipe-reference empty">
        <p>No ticket selected.</p>
      </div>
    )
  }

  const recipe = RECIPES_BY_ID[recipeId]

  if (!recipe) {
    return (
      <div className="recipe-reference empty">
        <p>Recipe missing from the book.</p>
      </div>
    )
  }

  return (
    <div className="recipe-reference">
      <h3>{recipe.name}</h3>
      <p className="recipe-meta">
        {recipe.method.toUpperCase()} ? {recipe.glassId.replace('-', ' ')} ? Difficulty {recipe.difficulty}
      </p>
      <ul className="ingredient-list">
        {recipe.ingredientRequirements.map((req) => {
          const ingredient = INGREDIENT_MAP[req.ingredientId]
          return (
            <li key={req.ingredientId}>
              <span className="ingredient-name">{ingredient?.name ?? req.ingredientId}</span>
              <span className="ingredient-detail">
                {req.amount ? `${req.amount} ${req.unit ?? ''}` : ''}
                {req.optional ? ' (optional)' : ''}
              </span>
            </li>
          )
        })}
      </ul>
      {recipe.garnishIds && recipe.garnishIds.length > 0 && (
        <p className="recipe-garnish">
          Garnish: {recipe.garnishIds.map((id) => INGREDIENT_MAP[id]?.name ?? id).join(', ')}
        </p>
      )}
      {recipe.notes && (
        <ul className="recipe-notes">
          {recipe.notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
