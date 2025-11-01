import { INGREDIENT_MAP } from '../data/ingredients'
import type { Recipe, ScoreBreakdown, WorkspaceState } from '../types'

interface EvaluationResult {
  breakdown: ScoreBreakdown
  mistakes: string[]
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const evaluateWorkspace = (
  workspace: WorkspaceState,
  recipe: Recipe,
  timeTakenSeconds: number
): EvaluationResult => {
  let accuracy = 100
  let technique = 100
  let speed = 100
  const mistakes: string[] = []

  if (!workspace.glassId) {
    accuracy -= 30
    mistakes.push('No glass selected')
  } else if (workspace.glassId !== recipe.glassId) {
    accuracy -= 30
    mistakes.push('Incorrect glassware')
  }

  const usedIngredientIds = workspace.ingredients.map((entry) => entry.ingredientId)
  const usedSet = new Set(usedIngredientIds)

  const missingIngredients = recipe.ingredientRequirements.filter(
    (req) => !req.optional && !usedSet.has(req.ingredientId)
  )

  if (missingIngredients.length > 0) {
    const penalty = missingIngredients.length * 15
    accuracy -= penalty
    missingIngredients.forEach((req) => {
      const ingredientName = INGREDIENT_MAP[req.ingredientId]?.name ?? req.ingredientId
      mistakes.push(`Missing ${ingredientName}`)
    })
  }

  const extraIngredients = usedIngredientIds.filter(
    (id) => !recipe.ingredientRequirements.some((req) => req.ingredientId === id)
  )

  if (extraIngredients.length > 0) {
    const penalty = extraIngredients.length * 10
    accuracy -= penalty
    extraIngredients.forEach((id) => {
      const ingredientName = INGREDIENT_MAP[id]?.name ?? id
      mistakes.push(`Unnecessary ingredient: ${ingredientName}`)
    })
  }

  if (recipe.requiresIce && !workspace.hasIce) {
    accuracy -= 20
    mistakes.push('Drink should include ice')
  }

  if (recipe.garnishIds?.length) {
    const missingGarnish = recipe.garnishIds.filter((id) => !workspace.garnishes.includes(id))
    if (missingGarnish.length > 0) {
      accuracy -= 10
      missingGarnish.forEach((id) => {
        const garnishName = INGREDIENT_MAP[id]?.name ?? id
        mistakes.push(`Missing garnish: ${garnishName}`)
      })
    }
  }

  const usedTechniques = new Set(workspace.techniques)

  if (recipe.method === 'shake') {
    if (!usedTechniques.has('shake')) {
      technique -= 40
      mistakes.push('Recipe should be shaken')
    }
    if (usedTechniques.has('stir')) {
      technique -= 15
      mistakes.push('Shaken drink was stirred at some point')
    }
  }

  if (recipe.method === 'stir') {
    if (!usedTechniques.has('stir')) {
      technique -= 35
      mistakes.push('Recipe should be stirred')
    }
    if (usedTechniques.has('shake')) {
      technique -= 25
      mistakes.push('Stirred drink was shaken')
    }
  }

  if (recipe.method === 'muddle' && !usedTechniques.has('muddle')) {
    technique -= 25
    mistakes.push('Recipe requires muddling')
  }

  if (recipe.requiresJigger) {
    const measuredPours = workspace.ingredients.filter((entry) => entry.toolId === 'jigger').length
    if (measuredPours === 0) {
      technique -= 20
      mistakes.push('Use the jigger for accurate pours')
    }
  }

  // Speed scoring baseline
  const expectedWindow = 25 + recipe.difficulty * 5 // seconds
  if (timeTakenSeconds > expectedWindow) {
    const overtime = timeTakenSeconds - expectedWindow
    speed -= Math.min(80, overtime * 3)
    mistakes.push('Try to serve faster during the rush')
  }

  accuracy = clamp(accuracy, 0, 100)
  technique = clamp(technique, 0, 100)
  speed = clamp(speed, 0, 100)

  const total = Math.round(accuracy * 0.5 + technique * 0.3 + speed * 0.2)

  const breakdown: ScoreBreakdown = {
    accuracy,
    technique,
    speed,
    total
  }

  return { breakdown, mistakes }
}
