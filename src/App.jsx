import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, PointerLockControls, Sky, Environment, Html, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { Suspense, useRef, useState, useEffect } from 'react'
import { Player } from './game/Player'
import { World } from './game/World'
import { Particles } from './game/Particles'
import { Joystick } from './game/Joystick'
import { useStore } from './store'
import { Leva } from 'leva'
import { ErrorBoundary } from './components/ErrorBoundary'

import { UpgradeUI } from './components/UpgradeUI'
import { VictoryScreen } from './components/VictoryScreen'

function StartScreen() {
  const startGame = useStore((state) => state.startGame)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-auto z-50">
      <div className="text-center max-w-2xl px-8">
        <h1 className="text-6xl font-bold text-green-500 mb-4 font-serif tracking-wider">CUCUMBER<br />WIZARD</h1>
        <p className="text-xl text-white/70 mb-8">Defend your garden from the intellectual elite using your magical cucumber!</p>

        <div className="grid grid-cols-2 gap-4 text-left bg-white/10 p-6 rounded-xl mb-8 border border-white/20">
          <div>
            <h3 className="text-yellow-400 font-bold mb-2">Desktop Controls</h3>
            <p className="text-sm text-gray-300">WASD - Move</p>
            <p className="text-sm text-gray-300">Space - Jump</p>
            <p className="text-sm text-gray-300">Click - Attack</p>
          </div>
          <div>
            <h3 className="text-yellow-400 font-bold mb-2">Mobile Controls</h3>
            <p className="text-sm text-gray-300">Left Stick - Move</p>
            <p className="text-sm text-gray-300">Right Buttons - Jump/Attack</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="px-12 py-6 bg-green-600 hover:bg-green-500 text-white text-2xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-green-900/50"
        >
          PLAY NOW
        </button>
      </div>
    </div>
  )
}

function UI() {
  const { score, health, cucumberLevel, gameOver, reset, showUpgrades, wave, gameStarted } = useStore()
  const [flash, setFlash] = useState(false)
  const prevHealth = useRef(health)

  useEffect(() => {
    if (health < prevHealth.current) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 200)
      return () => clearTimeout(timer)
    }
    prevHealth.current = health
  }, [health])

  if (!gameStarted) return <StartScreen />

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-8 flex flex-col justify-between z-10">
      <div className="flex justify-between items-start">
        <div className="bg-black/50 p-4 rounded-xl text-white backdrop-blur-sm border border-white/20">
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">Wizard-Wolf</h1>
          <div className="text-xl">Score: <span className="text-green-400">{score}</span></div>
          <div className="text-xl">Health: <span className={`${health < 30 ? 'text-red-600 animate-pulse' : 'text-red-400'}`}>{health}/{useStore.getState().maxHealth}</span></div>
        </div>
        <div className="bg-black/50 p-4 rounded-xl text-white backdrop-blur-sm border border-white/20 text-right">
          <h2 className="text-xl font-bold text-green-400">Wave {wave}</h2>
          <div className="text-sm text-white/50">Cucumber Lvl {cucumberLevel}</div>
        </div>
      </div>

      {/* Boss Health Bar */}
      {useStore.getState().enemies.find(e => e.isBoss) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-1/2 max-w-2xl">
          <div className="text-center text-red-500 font-bold text-xl mb-1 tracking-widest uppercase drop-shadow-lg">
            Grand Philosopher
          </div>
          <div className="h-6 bg-black/80 border-2 border-red-900 rounded-full overflow-hidden shadow-2xl shadow-red-900/50">
            <div
              className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-800 transition-all duration-200"
              style={{
                width: `${(useStore.getState().enemies.find(e => e.isBoss).hp / useStore.getState().enemies.find(e => e.isBoss).maxHp) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {showUpgrades && <UpgradeUI />}
      {useStore.getState().gameWon && <VictoryScreen />}

      {/* Mobile Controls */}
      <Joystick />

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto z-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600 mb-4 font-serif">YOU DIED</h1>
            <p className="text-2xl text-white mb-2">Final Score: <span className="text-yellow-400">{score}</span></p>
            <div className="grid grid-cols-2 gap-4 text-left bg-white/10 p-6 rounded-xl mb-8 border border-white/20">
              <div>
                <p className="text-gray-400 text-sm">Wave Reached</p>
                <p className="text-2xl font-bold text-white">{wave}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Enemies Defeated</p>
                <p className="text-2xl font-bold text-white">{useStore.getState().enemiesKilled}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Damage Dealt</p>
                <p className="text-2xl font-bold text-white">{Math.round(useStore.getState().totalDamageDealt)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Cucumber Level</p>
                <p className="text-2xl font-bold text-white">{cucumberLevel}</p>
              </div>
            </div>
            <button
              onClick={() => {
                reset()
                window.location.reload()
              }}
              className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-lg transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {!gameOver && !showUpgrades && (
        <div className="text-center text-white/50 text-sm">
          WASD to Move • Click to Whack • Mouse to Aim
        </div>
      )}

      {/* Crosshair */}
      {!gameOver && !showUpgrades && <div className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 border-2 border-white rounded-full opacity-50" />}

      {/* Damage Flash */}
      <div className={`absolute inset-0 bg-red-500 mix-blend-overlay transition-opacity duration-100 ${flash ? 'opacity-50' : 'opacity-0'}`} />
    </div>
  )
}

function GameScene() {
  const playerRef = useRef()
  const gameStarted = useStore((state) => state.gameStarted)
  const gameOver = useStore((state) => state.gameOver)
  const showUpgrades = useStore((state) => state.showUpgrades)

  return (
    <>
      {gameStarted && !gameOver && !showUpgrades && <PointerLockControls />}
      <World playerRef={playerRef} />
      <Player outerRef={playerRef} />
      <Particles />
    </>
  )
}

export default function App() {
  return (
    <div className="w-full h-screen bg-black">
      <ErrorBoundary>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }} style={{ width: '100vw', height: '100vh' }}>
          <Suspense fallback={null}>
            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />
            <color attach="background" args={['#87CEEB']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            <Suspense fallback={<Html center><div className="text-white text-2xl">Loading Physics Engine...</div></Html>}>
              {/* <Physics gravity={[0, -15, 0]} debug>
                <GameScene />
              </Physics> */}

              {/* Debug Mesh ONLY - No Physics */}
              <mesh position={[0, 0, -5]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="red" />
              </mesh>
            </Suspense>
            {/* <OrbitControls /> */}

            {/* <EffectComposer>
              <Bloom luminanceThreshold={1} intensity={1.5} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
              <Noise opacity={0.05} />
            </EffectComposer> */}
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      <UI />
      <Leva hidden />
    </div>
  )
}
