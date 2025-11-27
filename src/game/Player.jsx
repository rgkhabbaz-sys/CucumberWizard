import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import { Vector3, Quaternion, Euler, MathUtils } from 'three'
import { useKeyboardControls, PerspectiveCamera, PointerLockControls, Trail } from '@react-three/drei'
import { useStore } from '../store'
import { audio } from './Audio'
import { useParticleStore } from './Particles'
import { useJoystickStore } from './Joystick'
import { useDamageStore } from './DamageText'

const JUMP_FORCE = 5
const ROTATION_SPEED = 2

export function Player({ outerRef }) {
    const body = useRef()
    const weaponRef = useRef()
    // const [subscribeKeys, getKeys] = useKeyboardControls()
    const { camera } = useThree()
    const [isAttacking, setIsAttacking] = useState(false)
    const cucumberLevel = useStore((state) => state.cucumberLevel)

    // Simple keyboard state
    const keys = useRef({ forward: false, backward: false, left: false, right: false, jump: false })

    useEffect(() => {
        if (outerRef && body.current) {
            outerRef.current = body.current
        }

        const handleKeyDown = (e) => {
            switch (e.code) {
                case 'KeyW': keys.current.forward = true; break;
                case 'KeyS': keys.current.backward = true; break;
                case 'KeyA': keys.current.left = true; break;
                case 'KeyD': keys.current.right = true; break;
                case 'Space': keys.current.jump = true; break;
            }
        }
        const handleKeyUp = (e) => {
            switch (e.code) {
                case 'KeyW': keys.current.forward = false; break;
                case 'KeyS': keys.current.backward = false; break;
                case 'KeyA': keys.current.left = false; break;
                case 'KeyD': keys.current.right = false; break;
                case 'Space': keys.current.jump = false; break;
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        const handleMouseDown = () => {
            if (useStore.getState().gameOver) return
            if (!isAttacking) {
                setIsAttacking(true)
                attackTime.current = 0
                audio.playWhack()
            }
        }

        window.addEventListener('mousedown', handleMouseDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.removeEventListener('mousedown', handleMouseDown)
        }
    }, [isAttacking, outerRef]) // Added outerRef to dep array

    // Attack animation state
    const attackTime = useRef(0)
    const shakeTime = useRef(0)

    const jump = () => {
        if (body.current) {
            const origin = body.current.translation()
            origin.y -= 0.1
            // Simple ground check could be added here using raycast
            body.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true)
            audio.playJump()
        }
    }


    // Touch Camera Logic
    const touchStart = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleTouchStart = (e) => {
            // Ignore if touching joystick area (bottom left) or buttons (bottom right)
            const touch = e.touches[0]
            const w = window.innerWidth
            const h = window.innerHeight
            if (touch.clientX < w * 0.4 && touch.clientY > h * 0.5) return
            if (touch.clientX > w * 0.6 && touch.clientY > h * 0.5) return

            touchStart.current = { x: touch.clientX, y: touch.clientY }
        }

        const handleTouchMove = (e) => {
            const touch = e.touches[0]
            const w = window.innerWidth
            const h = window.innerHeight
            if (touch.clientX < w * 0.4 && touch.clientY > h * 0.5) return
            if (touch.clientX > w * 0.6 && touch.clientY > h * 0.5) return

            const dx = touch.clientX - touchStart.current.x
            const dy = touch.clientY - touchStart.current.y

            // Rotate camera
            // const camera = state.camera // Error here

            // Simple manual rotation
            camera.rotation.y -= dx * 0.005
            // camera.rotation.x -= dy * 0.005 // Pitch is harder to get right without gimbal lock

            touchStart.current = { x: touch.clientX, y: touch.clientY }
        }

        window.addEventListener('touchstart', handleTouchStart)
        window.addEventListener('touchmove', handleTouchMove)

        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
        }
    }, [camera])

    useFrame((state, delta) => {
        if (!body.current) return

        // Game Over Check
        const gameOver = useStore.getState().gameOver
        if (gameOver) return

        const { forward, backward, left, right } = getKeys()
        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const linvel = body.current.linvel()
        const translation = body.current.translation()

        // Movement relative to camera direction
        // We want the player to move in the direction they are pressing, relative to the camera's look direction (flat on XZ)

        // Actually, for a 3rd person shooter style, usually W is forward relative to camera.
        // But since we are using PointerLock, the camera rotates.

        // Let's keep it simple:
        // Camera follows player.
        // Player rotation matches camera rotation? Or WASD moves relative to camera view.

        // Let's do: Mouse rotates camera around player (Orbit) or FPS style?
        // The prompt says "Standard WASD third-person movement".
        // Usually this means: Mouse rotates camera. W moves forward relative to camera. Player model rotates to face movement direction.
        // BUT, for "The Whack", aiming is important. So maybe "Over the shoulder" is better, where player always faces forward (crosshair).
        // Let's go with Over-the-shoulder / Crosshair style since we need to aim the cucumber.

        // Sync camera to player position
        const cameraOffset = new Vector3(0, 2, 5)
        // We need to rotate the offset by the camera's horizontal rotation
        // Actually, let's use PointerLockControls to rotate the camera, and we just position the camera relative to player.

        // Better approach:
        // Player Body (RigidBody)
        //   -> Visuals
        //   -> Camera (mounted on a pivot?)

        // If we use PointerLockControls, it controls the camera directly.
        // We just need to move the player body based on camera direction.

        const frontVector = new Vector3(0, 0, 0)
        const sideVector = new Vector3(0, 0, 0)
        const direction = new Vector3(0, 0, 0)

        if (forward || joyY < -0.1) frontVector.set(0, 0, -1)
        if (backward || joyY > 0.1) frontVector.set(0, 0, 1)
        if (left || joyX < -0.1) sideVector.set(-1, 0, 0)
        if (right || joyX > 0.1) sideVector.set(1, 0, 0)

        // Analog movement
        if (joyY !== 0) frontVector.set(0, 0, joyY)
        if (joyX !== 0) sideVector.set(joyX, 0, 0)

        const playerSpeed = useStore.getState().playerSpeed
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(playerSpeed)

        // Apply camera rotation to direction
        const euler = new Euler(0, camera.rotation.y, 0)
        direction.applyEuler(euler)

        // Apply velocity
        body.current.setLinvel({ x: direction.x, y: linvel.y, z: direction.z }, true)

        // Jump
        if ((jumpKey || joyJump) && Math.abs(linvel.y) < 0.1) {
            jump()
        }

        // Attack (Joystick Button)
        if (joyAttack && !isAttacking) {
            // We need to call the handleMouseDown logic here
            if (useStore.getState().gameOver) return
            if (!isAttacking) {
                setIsAttacking(true)
                attackTime.current = 0
                audio.playWhack()
            }
        }
        // Or maybe rotate to face movement?
        // Let's rotate to face camera direction for aiming.
        const playerRotation = new Quaternion()
        playerRotation.setFromEuler(new Euler(0, camera.rotation.y, 0))
        body.current.setRotation(playerRotation, true)

        // Update Camera Position to follow player
        // We don't want to make the camera a child of the physics body because it will jitter.
        // We smoothly interpolate camera position to player position + offset.

        const targetCamPos = new Vector3(translation.x, translation.y + 2, translation.z)
        // Offset behind player based on camera rotation
        const offset = new Vector3(0, 1, 4)
        offset.applyEuler(euler)
        targetCamPos.add(offset)

        // Smooth lerp camera
        state.camera.position.lerp(targetCamPos, 0.1)

        // Camera Shake
        if (shakeTime.current > 0) {
            shakeTime.current -= delta
            const shakeIntensity = shakeTime.current * 0.5
            state.camera.position.x += (Math.random() - 0.5) * shakeIntensity
            state.camera.position.y += (Math.random() - 0.5) * shakeIntensity
            state.camera.position.z += (Math.random() - 0.5) * shakeIntensity
        }

        // Weapon Animation (The Whack)
        if (isAttacking && weaponRef.current) {
            attackTime.current += delta * 10
            const swingAngle = Math.sin(attackTime.current) * 2
            weaponRef.current.rotation.x = swingAngle

            if (attackTime.current > Math.PI) {
                setIsAttacking(false)
                weaponRef.current.rotation.x = 0
            }
        }
    })

    return (
        <>
            <RigidBody
                ref={body}
                colliders={false}
                position={[0, 5, 0]}
                enabledRotations={[false, true, false]}
                friction={0}
                onCollisionEnter={(payload) => {
                    // Thorns Logic
                    const thornsDamage = useStore.getState().thornsDamage
                    if (thornsDamage > 0 && payload.other.rigidBodyObject?.name?.startsWith('enemy-')) {
                        const enemyId = payload.other.rigidBodyObject.name.split('enemy-')[1];

                        // Apply damage
                        useStore.getState().damageEnemy(enemyId, thornsDamage);

                        // Visual feedback (small number)
                        const enemyPos = payload.other.rigidBody.translation()
                        useDamageStore.getState().addText([enemyPos.x, enemyPos.y + 2, enemyPos.z], thornsDamage)

                        // Audio feedback?
                        // Maybe a small "prick" sound
                    }
                }}
            >
                <CapsuleCollider args={[0.75, 0.5]} />

                {/* Visuals Group */}
                <group position={[0, -0.75, 0]}>
                    {/* Body */}
                    <mesh position={[0, 0.75, 0]} castShadow>
                        <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
                        <meshStandardMaterial color="#5D4037" roughness={0.8} />
                    </mesh>

                    {/* Robe (Cylinder bottom) */}
                    <mesh position={[0, 0.2, 0]} castShadow>
                        <cylinderGeometry args={[0.55, 0.7, 1, 16]} />
                        <meshStandardMaterial color="#1A237E" />
                    </mesh>

                    {/* Head */}
                    <mesh position={[0, 1.6, 0]} castShadow>
                        <sphereGeometry args={[0.6, 16, 16]} />
                        <meshStandardMaterial color="#5D4037" />
                    </mesh>

                    {/* Snout */}
                    <mesh position={[0, 1.6, 0.5]} rotation={[1.5, 0, 0]} castShadow>
                        <coneGeometry args={[0.2, 0.4, 16]} />
                        <meshStandardMaterial color="#4E342E" />
                    </mesh>

                    {/* Eyes */}
                    <mesh position={[-0.2, 1.8, 0.45]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[0.2, 1.8, 0.45]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[-0.2, 1.8, 0.58]}>
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                    <mesh position={[0.2, 1.8, 0.58]}>
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshStandardMaterial color="black" />
                    </mesh>

                    {/* Hat */}
                    <group position={[0, 2.1, 0]} rotation={[-0.2, 0, 0]}>
                        <mesh castShadow>
                            <coneGeometry args={[0.7, 1.5, 16]} />
                            <meshStandardMaterial color="#1A237E" emissive="#1A237E" emissiveIntensity={0.2} />
                        </mesh>
                        <mesh position={[0, -0.7, 0]}>
                            <cylinderGeometry args={[1, 1, 0.1, 16]} />
                            <meshStandardMaterial color="#1A237E" />
                        </mesh>
                    </group>

                    {/* Weapon Arm */}
                    <group position={[0.6, 1.0, 0.2]}>
                        <group ref={weaponRef}>
                            {/* The Cucumber */}
                            <Trail
                                width={1}
                                length={5}
                                color={'#4CAF50'}
                                attenuation={(t) => t * t}
                            >
                                <mesh position={[0, 0.5, 0.5]} rotation={[0.5, 0, 0]} castShadow>
                                    <capsuleGeometry args={[0.15, 1.5 * (1 + cucumberLevel * 0.2), 8, 16]} />
                                    <meshStandardMaterial
                                        color="#43A047"
                                        roughness={0.2}
                                        metalness={0.1}
                                        emissive="#2E7D32"
                                        emissiveIntensity={0.2 + cucumberLevel * 0.1}
                                    />
                                </mesh>
                            </Trail>

                            {/* Collider for the weapon (Sensor) */}
                            {/* We only enable this during attack? Or always check overlap? */}
                            {/* For simplicity, we can use a sensor collider that is always there, but we only process hits if attacking */}
                            <CuboidCollider
                                args={[0.2, 1, 0.2]}
                                position={[0, 0.5, 0.5]}
                                rotation={[0.5, 0, 0]}
                                sensor
                                onIntersectionEnter={(payload) => {
                                    if (isAttacking && payload.other.rigidBodyObject?.name?.startsWith('enemy-')) {
                                        // Apply impulse to enemy
                                        const enemyBody = payload.other.rigidBody;
                                        const knockbackMult = useStore.getState().knockbackMultiplier
                                        const force = new Vector3(0, 5, 10).applyEuler(new Euler(0, camera.rotation.y, 0)).multiplyScalar(knockbackMult);
                                        enemyBody.applyImpulse(force, true);
                                        enemyBody.applyTorqueImpulse({ x: Math.random(), y: Math.random(), z: Math.random() }, true);

                                        // Calculate damage
                                        const cucumberLevel = useStore.getState().cucumberLevel
                                        const damage = 35 + (cucumberLevel * 10)

                                        // Vampirism
                                        const vampirism = useStore.getState().vampirism
                                        if (vampirism > 0) {
                                            const healAmount = damage * vampirism
                                            useStore.setState(state => ({
                                                health: Math.min(state.maxHealth, state.health + healAmount)
                                            }))
                                        }

                                        // Visual feedback
                                        audio.playHit()
                                        shakeTime.current = 0.5

                                        // Trigger explosion
                                        const enemyPos = payload.other.rigidBody.translation()
                                        useParticleStore.getState().triggerExplosion(new Vector3(enemyPos.x, enemyPos.y, enemyPos.z), '#FF0000', 10)

                                        // Show Damage Number
                                        useDamageStore.getState().addText([enemyPos.x, enemyPos.y + 2, enemyPos.z], damage)

                                        // Apply damage
                                        const enemyId = payload.other.rigidBodyObject.name.split('enemy-')[1];
                                        useStore.getState().damageEnemy(enemyId, damage);
                                    }
                                }}
                            />
                        </group>
                    </group>

                </group>
            </RigidBody>
        </>
    )
}
