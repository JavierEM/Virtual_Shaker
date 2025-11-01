import type { Recipe } from '../types'

export const RECIPES: Recipe[] = [
  {
    id: 'rum-and-coke',
    name: 'Rum & Coke',
    venueUnlock: 'dive',
    difficulty: 1,
    glassId: 'highball-glass',
    method: 'build',
    requiresIce: true,
    ingredientRequirements: [
      { ingredientId: 'white-rum', amount: 2, unit: 'oz' },
      { ingredientId: 'cola', amount: 4, unit: 'oz' },
      { ingredientId: 'lime-wedge', optional: true }
    ],
    notes: ['Build over ice', 'Top with cola and quick stir.']
  },
  {
    id: 'gin-and-tonic',
    name: 'Gin & Tonic',
    venueUnlock: 'dive',
    difficulty: 1,
    glassId: 'highball-glass',
    method: 'build',
    requiresIce: true,
    ingredientRequirements: [
      { ingredientId: 'gin', amount: 2, unit: 'oz' },
      { ingredientId: 'soda-water', amount: 4, unit: 'oz' },
      { ingredientId: 'lime-wheel', optional: true }
    ],
    notes: ['Build over ice', 'Garnish with lime.']
  },
  {
    id: 'old-fashioned',
    name: 'Old Fashioned',
    venueUnlock: 'lounge',
    difficulty: 2,
    glassId: 'rocks-glass',
    method: 'stir',
    requiresIce: true,
    requiresJigger: true,
    garnishIds: ['orange-peel'],
    ingredientRequirements: [
      { ingredientId: 'sugar-cube', unit: 'cube' },
      { ingredientId: 'angostura-bitters', amount: 2, unit: 'dash' },
      { ingredientId: 'bourbon', amount: 2, unit: 'oz' }
    ],
    notes: ['Muddle sugar with bitters', 'Add ice, stir with bar spoon', 'Express orange peel']
  },
  {
    id: 'margarita',
    name: 'Margarita',
    venueUnlock: 'tiki',
    difficulty: 3,
    glassId: 'coupe-glass',
    method: 'shake',
    requiresIce: true,
    requiresJigger: true,
    garnishIds: ['lime-wheel'],
    rimOptions: ['salt'],
    ingredientRequirements: [
      { ingredientId: 'tequila', amount: 2, unit: 'oz' },
      { ingredientId: 'triple-sec', amount: 1, unit: 'oz' },
      { ingredientId: 'lime-juice', amount: 1, unit: 'oz' },
      { ingredientId: 'agave-syrup', amount: 0.25, unit: 'oz', optional: true }
    ],
    notes: ['Add ingredients to shaker with ice', 'Shake hard, double strain into coupe']
  },
  {
    id: 'mai-tai',
    name: 'Mai Tai',
    venueUnlock: 'tiki',
    difficulty: 3,
    glassId: 'tiki-mug',
    method: 'shake',
    requiresIce: true,
    garnishIds: ['mint-sprig', 'lime-wheel'],
    ingredientRequirements: [
      { ingredientId: 'dark-rum', amount: 1.5, unit: 'oz' },
      { ingredientId: 'white-rum', amount: 1, unit: 'oz' },
      { ingredientId: 'lime-juice', amount: 0.75, unit: 'oz' },
      { ingredientId: 'orgeat', amount: 0.5, unit: 'oz' },
      { ingredientId: 'cointreau', amount: 0.5, unit: 'oz' }
    ],
    notes: ['Shake with crushed ice', 'Garnish with spent lime shell and mint']
  },
  {
    id: 'manhattan',
    name: 'Manhattan',
    venueUnlock: 'speakeasy',
    difficulty: 4,
    glassId: 'coupe-glass',
    method: 'stir',
    requiresIce: false,
    requiresJigger: true,
    garnishIds: ['maraschino-cherry'],
    ingredientRequirements: [
      { ingredientId: 'rye-whiskey', amount: 2, unit: 'oz' },
      { ingredientId: 'sweet-vermouth', amount: 1, unit: 'oz' },
      { ingredientId: 'angostura-bitters', amount: 2, unit: 'dash' }
    ],
    notes: ['Stir with ice in mixing glass', 'Strain into chilled coupe']
  }
]

export const RECIPES_BY_ID: Record<string, Recipe> = RECIPES.reduce(
  (acc, recipe) => {
    acc[recipe.id] = recipe
    return acc
  },
  {} as Record<string, Recipe>
)

export const VENUE_UNLOCKS: Record<Recipe['venueUnlock'], string[]> = RECIPES.reduce(
  (acc, recipe) => {
    acc[recipe.venueUnlock] = acc[recipe.venueUnlock] || []
    acc[recipe.venueUnlock].push(recipe.id)
    return acc
  },
  {
    dive: [],
    tiki: [],
    lounge: [],
    speakeasy: []
  } as Record<Recipe['venueUnlock'], string[]>
)
