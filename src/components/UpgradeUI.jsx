import { useStore } from '../store'

export function UpgradeUI() {
    const applyUpgrade = useStore((state) => state.applyUpgrade)
    const startNextWave = useStore((state) => state.startNextWave)
    const wave = useStore((state) => state.wave)

    const upgrades = [
        { id: 'SPEED', name: 'Speed Demon', desc: '+10% Movement Speed' },
        { id: 'HEALTH', name: 'Iron Skin', desc: '+50 Max HP & Full Heal' },
        { id: 'CUCUMBER', name: 'Big Pickle', desc: 'Larger Cucumber' },
        { id: 'VAMPIRISM', name: 'Vampire', desc: '+5% Lifesteal' },
        { id: 'KNOCKBACK', name: 'Yeet', desc: '+50% Knockback' },
        { id: 'THORNS', name: 'Cactus', desc: '10 Thorns Damage' },
    ]

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto z-50">
            <div className="text-center max-w-4xl w-full p-8">
                <h1 className="text-5xl font-bold text-yellow-400 mb-2 font-serif">Wave {wave} Complete!</h1>
                <p className="text-xl text-white/70 mb-12">Choose your upgrade</p>

                <div className="grid grid-cols-3 gap-8">
                    {upgrades.sort(() => 0.5 - Math.random()).slice(0, 3).map((u) => (
                        <button
                            key={u.id}
                            onClick={() => {
                                applyUpgrade(u.id)
                                startNextWave()
                            }}
                            className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-yellow-400 p-8 rounded-xl transition-all transform hover:-translate-y-2 group"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400">{u.name}</h3>
                            <p className="text-gray-400">{u.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
