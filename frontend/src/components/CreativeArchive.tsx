import { useGame } from '../context/GameContext'
import { INGREDIENT_MAP } from '../data/ingredients'

export const CreativeArchive = () => {
  const { creativeArchive, mode } = useGame()

  if (mode !== 'creative' && creativeArchive.length === 0) {
    return null
  }

  return (
    <section className="creative-archive">
      <h2>Community Lab Log</h2>
      {creativeArchive.length === 0 ? (
        <p>Invent something unforgettable and publish it.</p>
      ) : (
        <ul>
          {creativeArchive.map((creation) => (
            <li key={creation.id}>
              <div className="creative-header">
                <span className="creative-name">{creation.name}</span>
                <span className="creative-profile">{creation.flavorProfile}</span>
              </div>
              <p className="creative-ingredients">
                {creation.ingredients
                  .map((id) => INGREDIENT_MAP[id]?.name ?? id)
                  .join(', ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
