import { useState } from 'react'
import Scene from './components/Scene'
import NewScene from './components/NewScene'

function App() {
  const [currentScene, setCurrentScene] = useState('original')

  return (
    <div className="App">
      {/* Remove or comment out the scene switcher buttons if you don't want them */}
      {/*<div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <button 
          onClick={() => setCurrentScene('original')}
          style={{ marginRight: '10px' }}
        >
          Original Scene
        </button>
        <button 
          onClick={() => setCurrentScene('new')}
        >
          New Scene
        </button>
      </div>*/}

      {currentScene === 'original' ? (
        <Scene onSceneSwitch={setCurrentScene} />
      ) : (
        <NewScene />
      )}
    </div>
  )
}

export default App
