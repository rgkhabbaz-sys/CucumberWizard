import { useMemo, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Enemy } from './Enemy'
import { useStore } from '../store'
import { DamageTextOverlay } from './DamageText'

function CastleTile({ position, type }) {
    return (
        <group position={position}>
            {/* Floor */}
            <RigidBody type="fixed" friction={1}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
                    <boxGeometry args={[20, 20, 0.2]} />
                    <meshStandardMaterial color="#616161" />
                </mesh>
            </RigidBody>

            {/* Walls based on type */}
            {type === 'hall' && (
                <>
                    <RigidBody type="fixed">
                        <mesh position={[-9, 2, 0]}>
                            <boxGeometry args={[2, 4, 20]} />
                            <meshStandardMaterial color="#424242" />
                        </mesh>
                        <mesh position={[9, 2, 0]}>
                            <boxGeometry args={[2, 4, 20]} />
                            <meshStandardMaterial color="#424242" />
                        </mesh>
                    </RigidBody>
                    {/* Torches */}
                    <pointLight position={[-8, 3, 0]} intensity={5} color="orange" distance={10} castShadow />
                    <pointLight position={[8, 3, 0]} intensity={5} color="orange" distance={10} castShadow />
                </>
            )}

            {type === 'room' && (
                <>
                    <RigidBody type="fixed">
                        <mesh position={[-9, 2, 0]}>
                            <boxGeometry args={[2, 4, 20]} />
                            <meshStandardMaterial color="#424242" />
                        </mesh>
                        <mesh position={[9, 2, 0]}>
                            <boxGeometry args={[2, 4, 20]} />
                            <meshStandardMaterial color="#424242" />
                        </mesh>
                        <mesh position={[0, 2, -9]}>
                            <boxGeometry args={[20, 4, 2]} />
                            <meshStandardMaterial color="#424242" />
                        </mesh>
                    </RigidBody>
                </>
            )}
        </group>
    )
}

export function World({ playerRef }) {
    const enemies = useStore((state) => state.enemies)
    const startNextWave = useStore((state) => state.startNextWave)
    const gameStarted = useStore((state) => state.gameStarted)
    const wave = useStore((state) => state.wave)

    // Start first wave when game starts
    useEffect(() => {
        if (gameStarted && wave === 0 && enemies.length === 0) {
            startNextWave()
        }
    }, [gameStarted, wave, enemies.length, startNextWave])

    // ... checking previous file content ...
    // It has `import { useMemo } from 'react'`

    // I will use a separate replace for imports.

    // Here I replace the useMemo block.
    useMemo(() => {
        // This was the old code
    }, [])

    // New code:
    // useEffect(() => {
    //    if (enemies.length === 0) {
    //        spawnEnemies(5)
    //    }
    // }, [enemies.length])

    // Wait, I should use `useEffect` instead of `useMemo`.
    // And I need to make sure `useEffect` is imported.


    const tiles = useMemo(() => {
        const arr = []
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                arr.push({
                    x: x * 20,
                    z: z * 20,
                    type: Math.random() > 0.5 ? 'hall' : 'room'
                })
            }
        }
        return arr
    }, [])

    return (
        <group>
            {tiles.map((tile, i) => (
                <CastleTile key={i} position={[tile.x, 0, tile.z]} type={tile.type} />
            ))}

            {enemies.map((enemy) => (
                <Enemy
                    key={enemy.id}
                    id={enemy.id}
                    type={enemy.type}
                    position={enemy.position}
                    playerRef={playerRef}
                    hp={enemy.hp}
                    maxHp={enemy.maxHp}
                    isBoss={enemy.isBoss}
                    scale={enemy.scale}
                />
            ))}

            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
            <DamageTextOverlay />
        </group>
    )
}
