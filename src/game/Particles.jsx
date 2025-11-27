import { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, Color, MathUtils } from 'three'
import { create } from 'zustand'

const MAX_PARTICLES = 1000

// Global store for particle triggers to avoid passing refs everywhere
export const useParticleStore = create((set) => ({
    explosions: [],
    triggerExplosion: (position, color = '#4CAF50', count = 20) => set((state) => ({
        explosions: [...state.explosions, { position, color, count, id: Math.random() }]
    })),
    clearExplosions: () => set({ explosions: [] })
}))

export function Particles() {
    const mesh = useRef()
    const { explosions, clearExplosions } = useParticleStore()

    // Particle state
    const particles = useMemo(() => {
        return new Array(MAX_PARTICLES).fill(0).map(() => ({
            time: 0,
            life: 0,
            position: new Object3D(),
            velocity: { x: 0, y: 0, z: 0 },
            color: new Color(),
            scale: 1,
            active: false
        }))
    }, [])

    const dummy = useMemo(() => new Object3D(), [])

    useFrame((state, delta) => {
        if (!mesh.current) return

        // Spawn new particles from explosions
        if (explosions.length > 0) {
            explosions.forEach(exp => {
                let spawned = 0
                for (let i = 0; i < MAX_PARTICLES; i++) {
                    if (!particles[i].active && spawned < exp.count) {
                        particles[i].active = true
                        particles[i].life = 1.0 // 1 second life
                        particles[i].time = 0

                        // Position
                        particles[i].position.position.copy(exp.position)

                        // Velocity (random explosion)
                        particles[i].velocity.x = (Math.random() - 0.5) * 10
                        particles[i].velocity.y = (Math.random() * 5) + 2 // Upward bias
                        particles[i].velocity.z = (Math.random() - 0.5) * 10

                        // Color
                        particles[i].color.set(exp.color)

                        // Scale
                        particles[i].scale = Math.random() * 0.5 + 0.2

                        spawned++
                    }
                }
            })
            clearExplosions()
        }

        // Update particles
        particles.forEach((p, i) => {
            if (p.active) {
                p.life -= delta
                p.time += delta

                if (p.life <= 0) {
                    p.active = false
                    p.scale = 0
                } else {
                    // Physics
                    p.velocity.y -= 20 * delta // Gravity

                    p.position.position.x += p.velocity.x * delta
                    p.position.position.y += p.velocity.y * delta
                    p.position.position.z += p.velocity.z * delta

                    // Rotation
                    p.position.rotation.x += p.velocity.z * delta
                    p.position.rotation.y += p.velocity.x * delta

                    // Scale down
                    p.scale = MathUtils.lerp(p.scale, 0, delta * 2)
                }

                // Update Instance
                p.position.updateMatrix()
                mesh.current.setMatrixAt(i, p.position.matrix)
                mesh.current.setColorAt(i, p.color)
            } else {
                // Hide inactive
                mesh.current.setMatrixAt(i, new Object3D().matrix)
            }
        })

        mesh.current.instanceMatrix.needsUpdate = true
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[null, null, MAX_PARTICLES]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial vertexColors roughness={0.5} />
        </instancedMesh>
    )
}
