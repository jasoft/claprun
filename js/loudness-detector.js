import { LOUDNESS_DETECTION_CONFIG } from "./constants.js"

class LoudnessDetector {
    constructor(options = {}) {
        this.enabled = options.enabled ?? LOUDNESS_DETECTION_CONFIG.ENABLED
        this.threshold = options.threshold ?? LOUDNESS_DETECTION_CONFIG.LOUDNESS_THRESHOLD
        this.onLoudClap = options.onLoudClap || (() => {})

        const minSamples = LOUDNESS_DETECTION_CONFIG.MIN_SAMPLES_PER_SECOND
        const maxSamples = LOUDNESS_DETECTION_CONFIG.MAX_SAMPLES_PER_SECOND
        const defaultSamples = LOUDNESS_DETECTION_CONFIG.DEFAULT_SAMPLES_PER_SECOND

        const requestedSamples = options.samplesPerSecond ?? defaultSamples
        const boundedSamples = Math.min(Math.max(requestedSamples, minSamples), maxSamples)
        this.samplesPerSecond = boundedSamples
        this.sampleInterval = 1000 / this.samplesPerSecond

        this.cooldown = options.cooldown ?? LOUDNESS_DETECTION_CONFIG.SAMPLE_COOLDOWN_MS
        this.fftSize = options.fftSize ?? LOUDNESS_DETECTION_CONFIG.FFT_SIZE
        this.smoothing = options.smoothing ?? LOUDNESS_DETECTION_CONFIG.SMOOTHING_TIME_CONSTANT

        this.audioContext = null
        this.mediaStream = null
        this.mediaSource = null
        this.analyserNode = null
        this.timeDomainData = null
        this.intervalId = null
        this.lastTriggerTime = 0
        this.initialized = false
    }

    async init() {
        if (!this.enabled) {
            console.warn("[LoudnessDetector] 响度检测未启用")
            return false
        }

        if (this.initialized) {
            return true
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn("[LoudnessDetector] 当前浏览器不支持 getUserMedia")
            return false
        }

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            this.mediaSource = this.audioContext.createMediaStreamSource(this.mediaStream)

            this.analyserNode = this.audioContext.createAnalyser()
            this.analyserNode.fftSize = this.fftSize
            this.analyserNode.smoothingTimeConstant = this.smoothing

            this.timeDomainData = new Uint8Array(this.analyserNode.fftSize)
            this.mediaSource.connect(this.analyserNode)

            this.initialized = true
            console.log("[LoudnessDetector] 初始化完成，采样间隔", this.sampleInterval, "ms")
            return true
        } catch (error) {
            console.error("[LoudnessDetector] 初始化失败:", error)
            this.destroy()
            return false
        }
    }

    async start() {
        if (!this.enabled) {
            return false
        }

        const initResult = await this.init()
        if (!initResult) {
            return false
        }

        if (this.intervalId) {
            return true
        }

        this.intervalId = setInterval(() => this.checkLoudness(), this.sampleInterval)
        console.log("[LoudnessDetector] 已开始响度检测")
        return true
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
            console.log("[LoudnessDetector] 已停止响度检测")
        }
    }

    checkLoudness() {
        if (!this.analyserNode || !this.timeDomainData) {
            return
        }

        this.analyserNode.getByteTimeDomainData(this.timeDomainData)

        let sumSquares = 0
        for (let i = 0; i < this.timeDomainData.length; i++) {
            const deviation = this.timeDomainData[i] - 128
            sumSquares += deviation * deviation
        }

        const rms = Math.sqrt(sumSquares / this.timeDomainData.length) / 128

        if (rms >= this.threshold) {
            const now = Date.now()
            if (now - this.lastTriggerTime >= this.cooldown) {
                this.lastTriggerTime = now
                this.onLoudClap({
                    confidence: Math.min(1, rms),
                    timestamp: now,
                    source: "loudness",
                    label: "loudness",
                })
                console.log(
                    `[LoudnessDetector] ✅ 响度达标: ${(rms * 100).toFixed(1)}% (阈值 ${(this.threshold * 100).toFixed(0)}%)`
                )
            }
        }
    }

    destroy() {
        this.stop()

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop())
            this.mediaStream = null
        }

        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }

        this.mediaSource = null
        this.analyserNode = null
        this.timeDomainData = null
        this.initialized = false
        console.log("[LoudnessDetector] 资源已释放")
    }
}

export default LoudnessDetector
