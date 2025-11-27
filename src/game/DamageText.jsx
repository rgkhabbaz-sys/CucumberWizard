import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { create } from 'zustand'

// Simple store for damage numbers
export const useDamageStore = create((set) => ({
    texts: [],
    addText: (position, amount) => set((state) => ({
        texts: [...state.texts, {
            id: Math.random(),
            position: [...position],
            amount,
            createdAt: Date.now()
        }]
    })),
    removeText: (id) => set((state) => ({
        texts: state.texts.filter(t => t.id !== id)
    }))
}))

function DamageNumber({ id, position, amount }) {
    const ref = useRef()
    const removeText = useDamageStore((state) => state.removeText)

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.y += delta * 2 // Float up
            ref.current.material.opacity -= delta * 0.5 // Fade out

            if (ref.current.material.opacity <= 0) {
                removeText(id)
            }
        }
    })

    return (
        <Text
            ref={ref}
            position={position}
            fontSize={1}
            color="#FFD700" // Gold
            outlineWidth={0.05}
            outlineColor="#000000"
            characters="0123456789"
        >
            {Math.round(amount)}
        </Text>
    )
}

export function DamageTextOverlay() {
    const texts = useDamageStore((state) => state.texts)
    return (
        <group>
            {texts.map((t) => (
                <DamageNumber key={t.id} {...t} />
            ))}
        </group>
    )
}
