import type { Glassware, Ingredient, Tool } from '../types'

export const SPIRITS: Ingredient[] = [
  { id: 'vodka', name: 'Vodka', category: 'spirit', defaultAmount: 2, unit: 'oz' },
  { id: 'gin', name: 'Gin', category: 'spirit', defaultAmount: 2, unit: 'oz' },
  { id: 'white-rum', name: 'Rum (White)', category: 'spirit', defaultAmount: 2, unit: 'oz' },
  { id: 'tequila', name: 'Tequila', category: 'spirit', defaultAmount: 2, unit: 'oz' },
  { id: 'whiskey', name: 'Whiskey', category: 'spirit', defaultAmount: 2, unit: 'oz' },
  { id: 'bourbon', name: 'Bourbon', category: 'spirit', defaultAmount: 2, unit: 'oz' },
  { id: 'rye-whiskey', name: 'Rye Whiskey', category: 'spirit', defaultAmount: 2, unit: 'oz' },
  { id: 'dark-rum', name: 'Rum (Dark)', category: 'spirit', defaultAmount: 2, unit: 'oz' }
]

export const MODIFIERS: Ingredient[] = [
  { id: 'triple-sec', name: 'Triple Sec', category: 'modifier', defaultAmount: 1, unit: 'oz' },
  { id: 'sweet-vermouth', name: 'Sweet Vermouth', category: 'modifier', defaultAmount: 1, unit: 'oz' },
  { id: 'dry-vermouth', name: 'Dry Vermouth', category: 'modifier', defaultAmount: 1, unit: 'oz' },
  { id: 'campari', name: 'Campari', category: 'modifier', defaultAmount: 1, unit: 'oz' },
  { id: 'orgeat', name: 'Orgeat', category: 'modifier', defaultAmount: 0.75, unit: 'oz' },
  { id: 'cointreau', name: 'Cointreau', category: 'modifier', defaultAmount: 1, unit: 'oz' }
]

export const BITTERS: Ingredient[] = [
  { id: 'angostura-bitters', name: 'Angostura Bitters', category: 'bitter', defaultAmount: 2, unit: 'dash' },
  { id: 'orange-bitters', name: 'Orange Bitters', category: 'bitter', defaultAmount: 1, unit: 'dash' }
]

export const MIXERS: Ingredient[] = [
  { id: 'lime-juice', name: 'Lime Juice', category: 'mixer', defaultAmount: 1, unit: 'oz' },
  { id: 'lemon-juice', name: 'Lemon Juice', category: 'mixer', defaultAmount: 1, unit: 'oz' },
  { id: 'simple-syrup', name: 'Simple Syrup', category: 'mixer', defaultAmount: 0.5, unit: 'oz' },
  { id: 'agave-syrup', name: 'Agave Syrup', category: 'mixer', defaultAmount: 0.25, unit: 'oz' },
  { id: 'pineapple-juice', name: 'Pineapple Juice', category: 'mixer', defaultAmount: 2, unit: 'oz' },
  { id: 'coconut-cream', name: 'Coconut Cream', category: 'mixer', defaultAmount: 1, unit: 'oz' },
  { id: 'soda-water', name: 'Soda Water', category: 'mixer', defaultAmount: 2, unit: 'oz' },
  { id: 'cola', name: 'Cola', category: 'mixer', defaultAmount: 3, unit: 'oz' }
]

export const GARNISHES: Ingredient[] = [
  { id: 'lime-wheel', name: 'Lime Wheel', category: 'garnish', unit: 'piece' },
  { id: 'lime-wedge', name: 'Lime Wedge', category: 'garnish', unit: 'piece' },
  { id: 'lemon-twist', name: 'Lemon Twist', category: 'garnish', unit: 'piece' },
  { id: 'orange-peel', name: 'Orange Peel', category: 'garnish', unit: 'piece' },
  { id: 'maraschino-cherry', name: 'Cherry', category: 'garnish', unit: 'piece' },
  { id: 'olive', name: 'Olive', category: 'garnish', unit: 'piece' },
  { id: 'mint-sprig', name: 'Mint Sprig', category: 'garnish', unit: 'piece' }
]

export const UTILITIES: Ingredient[] = [
  { id: 'ice-cubes', name: 'Ice', category: 'utility', unit: 'cube' },
  { id: 'sugar-cube', name: 'Sugar Cube', category: 'utility', unit: 'cube' }
]

export const TOOLS: Tool[] = [
  { id: 'jigger', name: 'Jigger', category: 'tool', type: 'measure', description: 'Measures accurate pours.' },
  { id: 'shaker', name: 'Shaker', category: 'tool', type: 'mix', technique: 'shake', description: 'Shake ingredients with ice.' },
  { id: 'mixing-glass', name: 'Mixing Glass', category: 'tool', type: 'mix', technique: 'stir', description: 'Stir spirits for clarity.' },
  { id: 'bar-spoon', name: 'Bar Spoon', category: 'tool', type: 'mix', technique: 'stir', description: 'Stir directly in the glass.' },
  { id: 'muddler', name: 'Muddler', category: 'tool', type: 'prep', technique: 'muddle', description: 'Crush ingredients gently.' },
  { id: 'hawthorne-strainer', name: 'Strainer', category: 'tool', type: 'serve', technique: 'strain', description: 'Strain shaken cocktails.' }
]

export const GLASSWARE: Glassware[] = [
  { id: 'rocks-glass', name: 'Rocks Glass', category: 'glassware' },
  { id: 'highball-glass', name: 'Highball Glass', category: 'glassware' },
  { id: 'coupe-glass', name: 'Coupe', category: 'glassware' },
  { id: 'martini-glass', name: 'Martini Glass', category: 'glassware' },
  { id: 'tiki-mug', name: 'Tiki Mug', category: 'glassware' }
]

export const ALL_INGREDIENTS: Ingredient[] = [
  ...SPIRITS,
  ...MODIFIERS,
  ...BITTERS,
  ...MIXERS,
  ...GARNISHES,
  ...UTILITIES
]

export const INGREDIENT_MAP: Record<string, Ingredient> = ALL_INGREDIENTS.reduce(
  (acc, ingredient) => {
    acc[ingredient.id] = ingredient
    return acc
  },
  {} as Record<string, Ingredient>
)

export const GLASSWARE_MAP: Record<string, Glassware> = GLASSWARE.reduce(
  (acc, glass) => {
    acc[glass.id] = glass
    return acc
  },
  {} as Record<string, Glassware>
)
