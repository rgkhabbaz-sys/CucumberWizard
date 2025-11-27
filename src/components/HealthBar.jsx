import { Html } from '@react-three/drei'

export function HealthBar({ hp, maxHp, isBoss }) {
    const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100))

    // Don't show if full health (unless boss?) or dead
    if (hp <= 0) return null
    if (!isBoss && hp === maxHp) return null

    const width = isBoss ? 'w-64' : 'w-24'
    const height = isBoss ? 'h-4' : 'h-2'

    return (
        <Html position={[0, isBoss ? 3 : 2, 0]} center>
            <div className={`${width} ${height} bg-gray-900 border border-white/20 rounded-full overflow-hidden`}>
                <div
                    className="h-full bg-red-600 transition-all duration-200"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </Html>
    )
}
