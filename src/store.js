import { create } from 'zustand'
import { audio } from './game/Audio'

export const useStore = create((set) => ({
  score: 0,
  health: 100,
  cucumberLevel: 1,
  cucumberLevel: 1,
  gameOver: false,
  gameWon: false,
  enemies: [],

  // Wave System
  wave: 0,
  waveStatus: 'active', // 'active', 'cleared', 'selecting_upgrade'
  enemiesRemaining: 0,
  difficultyMultiplier: 1,
  upgrades: [],

  // Player Stats
  playerSpeed: 5,
  maxHealth: 100,
  vampirism: 0, // 0-1 (percentage heal)
  knockbackMultiplier: 1,
  thornsDamage: 0,

  // Game Stats
  enemiesKilled: 0,
  totalDamageDealt: 0,

  startGame: () => set({ gameStarted: true }),

  // Actions
  addScore: (points) => set((state) => ({ score: state.score + points })),

  takeDamage: (amount) => set((state) => {
    const newHealth = Math.max(0, state.health - amount)
    if (newHealth === 0) {
      return { health: 0, gameOver: true }
    }
    return { health: newHealth }
  }),

  upgradeCucumber: () => set((state) => ({ cucumberLevel: state.cucumberLevel + 1 })),

  startNextWave: () => set((state) => {
    const nextWave = state.wave + 1

    // Victory Condition
    if (nextWave > 20) {
      return { gameWon: true, waveStatus: 'cleared' }
    }

    // Check for Boss Wave
    const isBossWave = nextWave % 5 === 0
    const count = isBossWave ? 1 : 5 + Math.floor(nextWave * 1.5)

    // Generate enemies for the new wave
    const newEnemies = []
    const types = ['einstein', 'newton', 'plato', 'napoleon', 'caesar', 'pythagoras']
    const baseHp = 100 * (1 + (nextWave * 0.1)) // HP scales with wave

    if (isBossWave) {
      // Boss Spawn
      audio.playBossSpawn()
      newEnemies.push({
        id: `BOSS-${nextWave}`,
        type: types[Math.floor(Math.random() * types.length)],
        position: [0, 2, 0], // Center spawn
        hp: baseHp * 10,
        maxHp: baseHp * 10,
        isBoss: true,
        scale: 2.5
      })
    } else {
      // Normal Wave
      for (let i = 0; i < count; i++) {
        newEnemies.push({
          id: Math.random().toString(36).substr(2, 9),
          type: types[Math.floor(Math.random() * types.length)],
          position: [(Math.random() - 0.5) * 40, 2, (Math.random() - 0.5) * 40],
          hp: baseHp,
          maxHp: baseHp,
          isBoss: false,
          scale: 1
        })
      }
    }

    return {
      wave: nextWave,
      waveStatus: 'active',
      enemies: newEnemies,
      enemiesRemaining: count,
      difficultyMultiplier: 1 + (nextWave * 0.1),
      showUpgrades: false
    }
  }),

  damageEnemy: (id, amount) => set((state) => {
    const enemyIndex = state.enemies.findIndex(e => e.id === id)
    if (enemyIndex === -1) return {}

    const enemy = state.enemies[enemyIndex]
    const newHp = enemy.hp - amount

    // Track damage
    // Actually, let's count effective damage

    const newState = { totalDamageDealt: state.totalDamageDealt + amount }

    if (newHp <= 0) {
      // Enemy died
      const remaining = Math.max(0, state.enemiesRemaining - 1)
      const newEnemies = state.enemies.filter(e => e.id !== id)

      newState.enemiesKilled = state.enemiesKilled + 1
      newState.score = state.score + 100 + (enemy.isBoss ? 1000 : 0)

      // Trigger wave clear if last enemy
      if (remaining === 0) {
        return {
          ...newState,
          enemies: newEnemies,
          enemiesRemaining: 0,
          waveStatus: 'selecting_upgrade',
          showUpgrades: true,
        }
      }
      return {
        ...newState,
        enemies: newEnemies,
        enemiesRemaining: remaining,
      }
    }

    // Enemy took damage but lived
    const newEnemies = [...state.enemies]
    newEnemies[enemyIndex] = { ...enemy, hp: newHp }
    return { ...newState, enemies: newEnemies }
  }),

  enemyDefeated: (id) => set((state) => {
    // Deprecated in favor of damageEnemy, but kept for safety
    const remaining = Math.max(0, state.enemiesRemaining - 1)
    const newEnemies = state.enemies.filter(e => e.id !== id)

    if (remaining === 0) {
      return {
        enemies: newEnemies,
        enemiesRemaining: 0,
        waveStatus: 'selecting_upgrade',
        showUpgrades: true
      }
    }
    return {
      enemies: newEnemies,
      enemiesRemaining: remaining
    }
  }),

  applyUpgrade: (type) => set((state) => {
    audio.playLevelUp()
    const updates = {
      upgrades: [...state.upgrades, type],
      showUpgrades: false,
      waveStatus: 'cleared' // Ready for next wave
    }

    switch (type) {
      case 'SPEED':
        updates.playerSpeed = state.playerSpeed * 1.1
        break
      case 'HEALTH':
        updates.maxHealth = state.maxHealth + 50
        updates.health = state.maxHealth + 50
        break
      case 'CUCUMBER':
        updates.cucumberLevel = state.cucumberLevel + 1
        break
      case 'VAMPIRISM':
        updates.vampirism = Math.min(1, state.vampirism + 0.05) // +5% lifesteal
        break
      case 'KNOCKBACK':
        updates.knockbackMultiplier = state.knockbackMultiplier + 0.5
        break
      case 'THORNS':
        updates.thornsDamage = state.thornsDamage + 10
        break
    }
    return updates
  }),

  spawnEnemies: (count = 5) => set((state) => {
    // Legacy support or initial spawn
    const newEnemies = []
    const types = ['einstein', 'newton', 'plato', 'napoleon', 'caesar']
    for (let i = 0; i < count; i++) {
      newEnemies.push({
        id: Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        position: [(Math.random() - 0.5) * 40, 2, (Math.random() - 0.5) * 40],
        hp: 100,
        maxHp: 100
      })
    }
    return { enemies: [...state.enemies, ...newEnemies] }
  }),

  removeEnemy: (id) => set((state) => ({ enemies: state.enemies.filter(e => e.id !== id) })),

  reset: () => set({
    score: 0,
    health: 100,
    maxHealth: 100,
    cucumberLevel: 1,
    gameOver: false,
    gameWon: false,
    enemies: [],
    wave: 1,
    waveStatus: 'active',
    enemiesRemaining: 0,
    difficultyMultiplier: 1,
    upgrades: [],
    showUpgrades: false,
    playerSpeed: 5,
    vampirism: 0,
    knockbackMultiplier: 1,
    thornsDamage: 0,
    enemiesKilled: 0,
    totalDamageDealt: 0
  })
}))
