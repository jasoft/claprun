import { LOUDNESS_DETECTION_CONFIG } from "./constants.js"

class LoudnessDetector {
    constructor(options = {}) {
        this.enabled = options.enabled ?? LOUDNESS_DETECTION_CONFIG.ENABLED
        this.onLoudClap = options.onLoudClap || (() => {})
        this.peakThreshold = options.peakThreshold ?? LOUDNESS_DETECTION_CONFIG.PEAK_THRESHOLD

        const samplesPerSecond = options.samplesPerSecond ?? LOUDNESS_DETECTION_CONFIG.SAMPLES_PER_SECOND
        this.samplesPerSecond = samplesPerSecond
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
        this.sampleCount = 0
        this.lastDebugLogTime = 0
        this.debugLogInterval = options.debugLogInterval ?? 1000 // 默认每秒输出一次调试信息
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
            console.warn("[LoudnessDetector] start 被调用但未启用")
            return false
        }

        const initResult = await this.init()
        if (!initResult) {
            console.warn("[LoudnessDetector] start 初始化失败，无法进入检测循环")
            return false
        }

        if (this.intervalId) {
            console.log("[LoudnessDetector] 检测已在运行，跳过重复启动")
            return true
        }

        this.sampleCount = 0
        this.lastDebugLogTime = 0

        this.intervalId = setInterval(() => this.checkLoudness(), this.sampleInterval)
        console.log(
            `[LoudnessDetector] 已开始响度检测，峰值阈值 ${(this.peakThreshold * 100).toFixed(0)}%，采样间隔 ${this.sampleInterval.toFixed(0)}ms`
        )
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
            console.warn("[LoudnessDetector] 检测节点未准备好，跳过本次采样")
            return
        }

        this.analyserNode.getByteTimeDomainData(this.timeDomainData)

        let sumSquares = 0
        let maxDeviation = 0
        for (let i = 0; i < this.timeDomainData.length; i++) {
            const deviation = this.timeDomainData[i] - 128
            sumSquares += deviation * deviation
            if (Math.abs(deviation) > maxDeviation) {
                maxDeviation = Math.abs(deviation)
            }
        }

        const rms = Math.sqrt(sumSquares / this.timeDomainData.length) / 128
        const peakRatio = maxDeviation / 128
        const now = Date.now()
        this.sampleCount++

        const exceedsPeak = peakRatio >= this.peakThreshold

        if (!this.lastDebugLogTime || now - this.lastDebugLogTime >= this.debugLogInterval) {
            this.lastDebugLogTime = now
            console.log(
                `[LoudnessDetector] 采样#${this.sampleCount} RMS ${(rms * 100).toFixed(1)}%，峰值 ${(peakRatio * 100).toFixed(1)}%`
            )
        }

        if (exceedsPeak) {
            if (now - this.lastTriggerTime >= this.cooldown) {
                this.lastTriggerTime = now
                const confidence = Math.max(peakRatio, rms)
                this.onLoudClap({
                    confidence: Math.min(1, confidence),
                    timestamp: now,
                    source: "loudness",
                    label: "loudness",
                    peakRatio: peakRatio,
                })
                console.log(
                    `[LoudnessDetector] ✅ 峰值触发: RMS ${(rms * 100).toFixed(1)}%，峰值 ${(peakRatio * 100).toFixed(1)}%`
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
