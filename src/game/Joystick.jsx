import { useState, useRef, useEffect } from 'react'
import { create } from 'zustand'

// Global store for joystick input
export const useJoystickStore = create((set) => ({
    curX: 0,
    curY: 0,
    isMoving: false,
    setJoystick: (x, y, moving) => set({ curX: x, curY: y, isMoving: moving }),

    // Button states
    isJumping: false,
    isAttacking: false,
    setJumping: (val) => set({ isJumping: val }),
    setAttacking: (val) => set({ isAttacking: val })
}))

export function Joystick() {
    const setJoystick = useJoystickStore((state) => state.setJoystick)
    const setJumping = useJoystickStore((state) => state.setJumping)
    const setAttacking = useJoystickStore((state) => state.setAttacking)

    const wrapperRef = useRef(null)
    const knobRef = useRef(null)
    const [active, setActive] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const center = useRef({ x: 0, y: 0 })

    const handleStart = (e) => {
        // Prevent default to stop scrolling
        // e.preventDefault() 
        setActive(true)
        const touch = e.touches[0]
        const rect = wrapperRef.current.getBoundingClientRect()
        center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        handleMove(e)
    }

    const handleMove = (e) => {
        if (!active) return
        const touch = e.touches[0]

        const maxDist = 40
        let dx = touch.clientX - center.current.x
        let dy = touch.clientY - center.current.y

        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > maxDist) {
            const angle = Math.atan2(dy, dx)
            dx = Math.cos(angle) * maxDist
            dy = Math.sin(angle) * maxDist
        }

        setPosition({ x: dx, y: dy })

        // Normalize output -1 to 1
        setJoystick(dx / maxDist, dy / maxDist, true)
    }

    const handleEnd = () => {
        setActive(false)
        setPosition({ x: 0, y: 0 })
        setJoystick(0, 0, false)
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-50 select-none touch-none">
            {/* Movement Joystick (Left) */}
            <div
                ref={wrapperRef}
                className="absolute bottom-12 left-12 w-32 h-32 bg-white/10 rounded-full border-2 border-white/30 backdrop-blur-sm pointer-events-auto"
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            >
                <div
                    ref={knobRef}
                    className="absolute w-12 h-12 bg-white/50 rounded-full shadow-lg"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
                    }}
                />
            </div>

            {/* Action Buttons (Right) */}
            <div className="absolute bottom-12 right-12 flex gap-4 pointer-events-auto">
                <button
                    className="w-20 h-20 bg-red-500/50 rounded-full border-2 border-white/30 active:bg-red-500/80 backdrop-blur-sm flex items-center justify-center"
                    onTouchStart={() => setAttacking(true)}
                    onTouchEnd={() => setAttacking(false)}
                >
                    <span className="text-2xl">⚔️</span>
                </button>
                <button
                    className="w-20 h-20 bg-blue-500/50 rounded-full border-2 border-white/30 active:bg-blue-500/80 backdrop-blur-sm flex items-center justify-center mb-12"
                    onTouchStart={() => setJumping(true)}
                    onTouchEnd={() => setJumping(false)}
                >
                    <span className="text-2xl">⬆️</span>
                </button>
            </div>
        </div>
    )
}
