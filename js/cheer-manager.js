/**
 * 欢呼声管理器 - 根据音乐速度动态播放欢呼声
 *
 * 功能:
 * - 根据速度计算欢呼声播放频率
 * - 管理多个欢呼声的并发播放
 * - 动态调整音量
 */

import { CHEER_CONFIG, SPEED_CONFIG } from "./constants.js"

class CheerManager {
    constructor(options = {}) {
        this.cheerSoundUrl = options.cheerSoundUrl || CHEER_CONFIG.CHEER_SOUND_URL
        this.minVolume = options.minVolume || CHEER_CONFIG.MIN_VOLUME
        this.maxVolume = options.maxVolume || CHEER_CONFIG.MAX_VOLUME
        this.minSpeedForCheer = options.minSpeedForCheer || CHEER_CONFIG.MIN_SPEED_FOR_CHEER
        this.baseInterval = options.baseInterval || CHEER_CONFIG.BASE_INTERVAL
        this.baseSpeedForInterval = options.baseSpeedForInterval || CHEER_CONFIG.BASE_SPEED_FOR_INTERVAL
        this.maxConcurrentCheers = options.maxConcurrentCheers || CHEER_CONFIG.MAX_CONCURRENT_CHEERS

        // 状态
        this.currentSpeed = SPEED_CONFIG.BASE_SPEED
        this.cheerAudioPool = [] // 欢呼声音频对象池
        this.lastCheerTime = 0
        this.cheerTimer = null
        this.isEnabled = true
    }

    /**
     * 初始化欢呼声管理器
     */
    init() {
        try {
            console.log("[CheerManager] 初始化欢呼声管理器...")

            // 预加载欢呼声音频对象
            for (let i = 0; i < this.maxConcurrentCheers; i++) {
                const audio = new Audio()
                audio.src = this.cheerSoundUrl
                audio.preload = "auto"
                this.cheerAudioPool.push({
                    audio: audio,
                    isPlaying: false,
                })
            }

            console.log("[CheerManager] 欢呼声管理器初始化完成")
            return true
        } catch (error) {
            console.error("[CheerManager] 初始化失败:", error)
            return false
        }
    }

    /**
     * 更新速度
     */
    updateSpeed(speed) {
        this.currentSpeed = speed

        // 如果速度低于阈值，停止欢呼声
        if (speed < this.minSpeedForCheer) {
            this.stopAllCheers()
            if (this.cheerTimer) {
                clearInterval(this.cheerTimer)
                this.cheerTimer = null
            }
        } else {
            // 启动欢呼声计时器
            if (!this.cheerTimer) {
                this.startCheerTimer()
            }
        }
    }

    /**
     * 启动欢呼声计时器
     */
    startCheerTimer() {
        this.cheerTimer = setInterval(() => {
            if (this.currentSpeed >= this.minSpeedForCheer && this.isEnabled) {
                this.playCheer()
            }
        }, this.calculateCheerInterval())
    }

    /**
     * 计算欢呼声播放间隔
     */
    calculateCheerInterval() {
        // 根据速度计算间隔
        // 速度越快，间隔越短
        const speedRatio = this.currentSpeed / this.baseSpeedForInterval
        const interval = Math.max(300, this.baseInterval / speedRatio)
        return Math.round(interval)
    }

    /**
     * 播放欢呼声
     */
    playCheer() {
        const now = Date.now()

        // 找到一个空闲的音频对象
        const availableAudio = this.cheerAudioPool.find((item) => !item.isPlaying)

        if (!availableAudio) {
            return // 所有音频都在播放
        }

        try {
            // 计算音量（基于速度）
            const volume = this.calculateVolume()

            // 设置音频属性
            availableAudio.audio.volume = volume
            availableAudio.audio.currentTime = 0

            // 播放
            availableAudio.isPlaying = true
            const playPromise = availableAudio.audio.play()

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // 播放成功
                    })
                    .catch((error) => {
                        console.warn("[CheerManager] 播放欢呼声失败:", error)
                        availableAudio.isPlaying = false
                    })
            }

            // 监听播放结束
            availableAudio.audio.onended = () => {
                availableAudio.isPlaying = false
            }

            this.lastCheerTime = now
        } catch (error) {
            console.error("[CheerManager] 播放欢呼声出错:", error)
        }
    }

    /**
     * 计算音量（基于速度）
     */
    calculateVolume() {
        // 速度越快，音量越大
        const speedRange = SPEED_CONFIG.MAX_SPEED - this.minSpeedForCheer
        const speedAboveMin = Math.max(0, this.currentSpeed - this.minSpeedForCheer)
        const volumeRatio = speedAboveMin / speedRange
        const volume = this.minVolume + (this.maxVolume - this.minVolume) * volumeRatio
        return Math.min(this.maxVolume, Math.max(this.minVolume, volume))
    }

    /**
     * 停止所有欢呼声
     */
    stopAllCheers() {
        this.cheerAudioPool.forEach((item) => {
            try {
                item.audio.pause()
                item.audio.currentTime = 0
                item.isPlaying = false
            } catch (error) {
                console.warn("[CheerManager] 停止欢呼声失败:", error)
            }
        })
    }

    /**
     * 启用/禁用欢呼声
     */
    setEnabled(enabled) {
        this.isEnabled = enabled
        if (!enabled) {
            this.stopAllCheers()
        }
    }

    /**
     * 销毁欢呼声管理器
     */
    destroy() {
        this.stopAllCheers()
        if (this.cheerTimer) {
            clearInterval(this.cheerTimer)
            this.cheerTimer = null
        }
        this.cheerAudioPool = []
    }
}

export default CheerManager

