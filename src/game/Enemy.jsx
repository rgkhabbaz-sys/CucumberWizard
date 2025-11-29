import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { Vector3, Quaternion, Matrix4 } from 'three'
import { useStore } from '../store'

const ENEMY_TYPES = {
    einstein: { color: '#E0E0E0', hair: true, mustache: true },
    newton: { color: '#8D6E63', wig: true, apple: true },
    plato: { color: '#F5F5F5', toga: true, beard: true },
    napoleon: { color: '#1A237E', hat: true, short: true },
    caesar: { color: '#7B1FA2', wreath: true },
    pythagoras: { color: '#FBC02D', triangle: true }
}

import { HealthBar } from '../components/HealthBar'

export function Enemy({ id, type = 'einstein', position = [0, 0, 0], playerRef, isBoss = false, scale = 1, hp, maxHp }) {
    const body = useRef()
    const config = ENEMY_TYPES[type]
    const takeDamage = useStore((state) => state.takeDamage)
    const lastAttackTime = useRef(0)

    useFrame((state, delta) => {
        if (!body.current || !playerRef?.current) return

        const playerPos = playerRef.current.translation()
        const myPos = body.current.translation()

        // Check distance
        const dist = new Vector3(playerPos.x, 0, playerPos.z).distanceTo(new Vector3(myPos.x, 0, myPos.z))

        if (dist < 20 && dist > 1.5) {
            const direction = new Vector3()
            direction.subVectors(playerPos, myPos).normalize()

            // Separation: Avoid other enemies
            // We can't easily query other enemies here without passing them all in.
            // But we can use a simple random jitter or noise to make them less robotic.
            // Or rely on physics collisions (which we have).

            // Let's add a "wobble" to the movement to make it look more organic
            const time = state.clock.getElapsedTime()
            const wobble = Math.sin(time * 5 + myPos.x) * 0.5

            direction.x += wobble * 0.2
            direction.z += Math.cos(time * 3 + myPos.z) * 0.2
            direction.normalize()

            // Move
            const wave = useStore.getState().wave
            const baseSpeed = 100
            const speed = (baseSpeed + (wave * 10)) * delta

            body.current.applyImpulse({ x: direction.x * speed, y: 0, z: direction.z * speed }, true)

            // Look at player
            const targetRotation = new Quaternion()
            const lookAtMatrix = new Matrix4()
            lookAtMatrix.lookAt(new Vector3(myPos.x, 0, myPos.z), new Vector3(playerPos.x, 0, playerPos.z), new Vector3(0, 1, 0))
            targetRotation.setFromRotationMatrix(lookAtMatrix)
            body.current.setRotation(targetRotation, true)
        }

        // Boss Abilities
        if (isBoss) {
            const time = state.clock.getElapsedTime()
            if (Math.floor(time) % 10 === 0 && Math.floor(time) !== lastAttackTime.current) {
                lastAttackTime.current = Math.floor(time)
                // Summon Minions
                useStore.getState().spawnEnemies(2)
                // Visual cue
                useParticleStore.getState().triggerExplosion(new Vector3(myPos.x, myPos.y + 2, myPos.z), '#FFD700', 50)
            }
        }
    })

    const handleCollision = (payload) => {
        if (payload.other.rigidBody === playerRef.current) {
            const now = Date.now()
            if (now - lastAttackTime.current > 1000) { // 1 second cooldown
                takeDamage(10)
                lastAttackTime.current = now

                // Knockback player?
                // payload.other.rigidBody.applyImpulse({ x: 0, y: 5, z: 0 }, true)
            }
        }
    }

    return (
        <RigidBody
            ref={body}
            position={position}
            colliders={false}
            name={`enemy-${id}`}
            linearDamping={2}
            angularDamping={2}
            enabledRotations={[true, true, true]} // Allow them to tumble when hit
            onCollisionEnter={handleCollision}
        >
            <CapsuleCollider args={[0.5 * scale, 0.5 * scale]} />

            <group position={[0, 0, 0]} scale={[scale, scale, scale]}>
                {/* Base Body */}
                <mesh castShadow receiveShadow>
                    <capsuleGeometry args={[0.5, 1, 8, 16]} />
                    <meshStandardMaterial color={config.color} />
                </mesh>

                {/* Face */}
                <mesh position={[0, 0.5, 0.4]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[-0.15, 0.55, 0.45]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[0.15, 0.55, 0.45]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="black" />
                </mesh>

                {/* Accessories */}
                {config.hair && (
                    <mesh position={[0, 0.8, 0]}>
                        <sphereGeometry args={[0.6, 16, 16]} />
                        <meshStandardMaterial color="white" roughness={1} />
                    </mesh>
                )}

                {config.mustache && (
                    <mesh position={[0, 0.4, 0.5]} rotation={[0, 0, 1.57]}>
                        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                )}

                {config.wig && (
                    <group position={[0, 0.8, 0]}>
                        <mesh>
                            <sphereGeometry args={[0.6, 16, 16]} />
                            <meshStandardMaterial color="#EEEEEE" />
                        </mesh>
                        <mesh position={[0.5, -0.2, 0]}>
                            <sphereGeometry args={[0.3, 16, 16]} />
                            <meshStandardMaterial color="#EEEEEE" />
                        </mesh>
                        <mesh position={[-0.5, -0.2, 0]}>
                            <sphereGeometry args={[0.3, 16, 16]} />
                            <meshStandardMaterial color="#EEEEEE" />
                        </mesh>
                    </group>
                )}

                {config.apple && (
                    <mesh position={[0.4, 0, 0.4]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshStandardMaterial color="red" metalness={0.5} roughness={0.1} />
                    </mesh>
                )}

                {config.hat && (
                    <mesh position={[0, 0.8, 0]} rotation={[0, 1.57, 0]}>
                        <cylinderGeometry args={[0.8, 0.8, 0.3, 3]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                )}

                {config.wreath && (
                    <mesh position={[0, 0.8, 0]} rotation={[1.57, 0, 0]}>
                        <torusGeometry args={[0.5, 0.05, 8, 16]} />
                        <meshStandardMaterial color="green" />
                    </mesh>
                )}

                {config.triangle && (
                    <mesh position={[0, 0.8, 0]}>
                        <coneGeometry args={[0.6, 1, 3]} />
                        <meshStandardMaterial color="#FBC02D" />
                    </mesh>
                )}

                <HealthBar hp={hp} maxHp={maxHp} isBoss={isBoss} />
            </group>
        </RigidBody>
    )
}
