import './App.css'
import { GameProvider } from './context/GameContext'
import { GameHud } from './components/GameHud'
import { ModeSelector } from './components/ModeSelector'
import { OrderQueuePanel } from './components/OrderQueuePanel'
import { CompletedOrdersLog } from './components/CompletedOrdersLog'
import { CreativeArchive } from './components/CreativeArchive'
import { SocialPanel } from './components/SocialPanel'
import { WorkspaceView } from './components/WorkspaceView'
import { GlassRack } from './components/GlassRack'
import { WellStation } from './components/WellStation'
import { TopShelf } from './components/TopShelf'
import { GarnishStation } from './components/GarnishStation'
import { ToolTray } from './components/ToolTray'

function App() {
  return (
    <GameProvider>
      <div className="app-shell">
        <GameHud />
        <ModeSelector />
        <main className="gameplay-area">
          <div className="panel left-column">
            <OrderQueuePanel />
            <CompletedOrdersLog />
            <CreativeArchive />
            <SocialPanel />
          </div>
          <div className="panel center-column">
            <WorkspaceView />
          </div>
          <div className="panel right-column">
            <GlassRack />
            <WellStation />
            <TopShelf />
            <GarnishStation />
            <ToolTray />
          </div>
        </main>
      </div>
    </GameProvider>
  )
}

export default App
