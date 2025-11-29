import { useStore } from '../store'

export function VictoryScreen() {
    const reset = useStore((state) => state.reset)
    const score = useStore((state) => state.score)

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-auto z-50">
            <div className="text-center max-w-4xl w-full p-8">
                <h1 className="text-6xl font-bold text-yellow-400 mb-4 font-serif tracking-wider">VICTORY!</h1>
                <p className="text-2xl text-white/90 mb-8">You have defended the garden from the intellectual elite!</p>

                <div className="bg-white/10 p-8 rounded-xl mb-8 border border-white/20 inline-block">
                    <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Final Score</p>
                    <p className="text-5xl font-bold text-green-400">{score}</p>
                </div>

                <div>
                    <button
                        onClick={() => {
                            reset()
                            window.location.reload()
                        }}
                        className="px-12 py-6 bg-yellow-500 hover:bg-yellow-400 text-black text-2xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50"
                    >
                        PLAY AGAIN
                    </button>
                </div>
            </div>
        </div>
    )
}
