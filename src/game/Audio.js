class SoundManager {
    constructor() {
        this.ctx = null
        this.masterGain = null
    }

    init() {
        if (this.ctx) return
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 0.3
        this.masterGain.connect(this.ctx.destination)
    }

    playTone(freq, type, duration, vol = 1) {
        this.init()
        if (this.ctx.state === 'suspended') this.ctx.resume()

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = type
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

        gain.gain.setValueAtTime(vol, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start()
        osc.stop(this.ctx.currentTime + duration)
    }

    playWhack() {
        // Whoosh sound
        this.playTone(200, 'triangle', 0.1, 0.5)
        this.playTone(100, 'sine', 0.2, 0.5)
    }

    playHit() {
        // Crunch sound
        this.playTone(100, 'sawtooth', 0.1, 0.8)
        this.playTone(50, 'square', 0.1, 0.8)
    }

    playJump() {
        // Rising slide
        this.init()
        if (this.ctx.state === 'suspended') this.ctx.resume()
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.frequency.setValueAtTime(200, this.ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.2)

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.2)
    }

    playDamage() {
        this.playTone(150, 'sawtooth', 0.3, 0.8)
        this.playTone(100, 'square', 0.3, 0.8)
    }

    playLevelUp() {
        // Major Arpeggio
        const now = this.ctx.currentTime
        this.playTone(440, 'sine', 0.2, 0.3) // A4
        setTimeout(() => this.playTone(554, 'sine', 0.2, 0.3), 100) // C#5
        setTimeout(() => this.playTone(659, 'sine', 0.2, 0.3), 200) // E5
        setTimeout(() => this.playTone(880, 'sine', 0.4, 0.3), 300) // A5
    }

    playBossSpawn() {
        // Deep rumble
        this.init()
        if (this.ctx.state === 'suspended') this.ctx.resume()
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(50, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 2)

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start()
        osc.stop(this.ctx.currentTime + 2)
    }
}

export const audio = new SoundManager()
