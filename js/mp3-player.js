/**
 * MP3 播放器模块 - 支持实时速度控制
 *
 * 功能:
 * - 加载和播放 MP3 文件
 * - 实时改变播放速度 (1.0x - 10.0x)
 * - 循环播放
 * - 音量控制
 */

import { MP3_PLAYER_CONFIG, SPEED_CONFIG } from "./constants.js"

class MP3Player {
    constructor(options = {}) {
        this.audioElement = null
        this.audioContext = null
        this.sourceNode = null
        this.gainNode = null

        // 配置
        this.musicUrl = options.musicUrl || MP3_PLAYER_CONFIG.MUSIC_URL
        this.volume = options.volume || MP3_PLAYER_CONFIG.VOLUME
        this.loop = options.loop !== false // 默认循环

        // 状态
        this.isPlaying = false
        this.currentSpeed = SPEED_CONFIG.BASE_SPEED
        this.minSpeed = options.minSpeed || SPEED_CONFIG.MIN_SPEED
        this.maxSpeed = options.maxSpeed || SPEED_CONFIG.MAX_SPEED

        // 回调
        this.onPlay = options.onPlay || (() => {})
        this.onPause = options.onPause || (() => {})
        this.onSpeedChange = options.onSpeedChange || (() => {})
    }

    /**
     * 初始化播放器
     */
    async init() {
        try {
            console.log("[MP3Player] 初始化播放器...")

            // 创建音频元素
            this.audioElement = new Audio()
            this.audioElement.src = this.musicUrl
            this.audioElement.loop = this.loop
            this.audioElement.volume = this.volume

            // 创建 Web Audio API 上下文
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            }

            // 恢复 AudioContext 如果被暂停
            if (this.audioContext.state === "suspended") {
                await this.audioContext.resume()
            }

            // 创建增益节点（用于音量控制）
            this.gainNode = this.audioContext.createGain()
            this.gainNode.gain.value = this.volume

            // 创建源节点
            try {
                this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement)
                this.sourceNode.connect(this.gainNode)
                this.gainNode.connect(this.audioContext.destination)
            } catch (error) {
                // 如果源节点已经存在，忽略错误
                console.warn("[MP3Player] 源节点创建警告:", error.message)
            }

            console.log("[MP3Player] 播放器初始化完成")
            return true
        } catch (error) {
            console.error("[MP3Player] 初始化失败:", error)
            return false
        }
    }

    /**
     * 播放音乐
     */
    play() {
        try {
            if (this.audioElement && !this.isPlaying) {
                // 恢复 AudioContext 如果被暂停
                if (this.audioContext.state === "suspended") {
                    this.audioContext.resume()
                }

                this.audioElement.play()
                this.isPlaying = true
                this.onPlay()
                console.log("[MP3Player] 开始播放")
            }
        } catch (error) {
            console.error("[MP3Player] 播放失败:", error)
        }
    }

    /**
     * 暂停音乐
     */
    pause() {
        try {
            if (this.audioElement && this.isPlaying) {
                this.audioElement.pause()
                this.isPlaying = false
                this.onPause()
                console.log("[MP3Player] 暂停播放")
            }
        } catch (error) {
            console.error("[MP3Player] 暂停失败:", error)
        }
    }

    /**
     * 停止播放并重置
     */
    stop() {
        try {
            if (this.audioElement) {
                this.audioElement.pause()
                this.audioElement.currentTime = 0
                this.isPlaying = false
                this.currentSpeed = 1.0
                this.onPause()
                console.log("[MP3Player] 停止播放")
            }
        } catch (error) {
            console.error("[MP3Player] 停止失败:", error)
        }
    }

    /**
     * 设置播放速度
     * @param {number} speed - 播放速度 (0.5 - 3.0)
     */
    setSpeed(speed) {
        try {
            // 限制速度范围
            const clampedSpeed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed))

            if (this.audioElement && Math.abs(clampedSpeed - this.currentSpeed) > 0.01) {
                this.audioElement.playbackRate = clampedSpeed
                this.currentSpeed = clampedSpeed

                this.onSpeedChange({
                    speed: clampedSpeed,
                })

                console.log("[MP3Player] 播放速度已改变:", clampedSpeed.toFixed(2) + "x")
            }
        } catch (error) {
            console.error("[MP3Player] 设置速度失败:", error)
        }
    }

    /**
     * 获取当前播放速度
     */
    getSpeed() {
        return this.currentSpeed
    }

    /**
     * 设置音量
     * @param {number} volume - 音量 (0 - 1)
     */
    setVolume(volume) {
        try {
            const clampedVolume = Math.max(0, Math.min(1, volume))
            if (this.audioElement) {
                this.audioElement.volume = clampedVolume
            }
            if (this.gainNode) {
                this.gainNode.gain.value = clampedVolume
            }
            this.volume = clampedVolume
            console.log("[MP3Player] 音量已改变:", (clampedVolume * 100).toFixed(0) + "%")
        } catch (error) {
            console.error("[MP3Player] 设置音量失败:", error)
        }
    }

    /**
     * 获取当前音量
     */
    getVolume() {
        return this.volume
    }

    /**
     * 获取当前播放时间
     */
    getCurrentTime() {
        return this.audioElement ? this.audioElement.currentTime : 0
    }

    /**
     * 获取总时长
     */
    getDuration() {
        return this.audioElement ? this.audioElement.duration : 0
    }

    /**
     * 销毁播放器
     */
    destroy() {
        try {
            if (this.audioElement) {
                this.audioElement.pause()
                this.audioElement.src = ""
                this.audioElement = null
            }

            if (this.sourceNode) {
                this.sourceNode.disconnect()
                this.sourceNode = null
            }

            if (this.gainNode) {
                this.gainNode.disconnect()
                this.gainNode = null
            }

            if (this.audioContext) {
                this.audioContext.close()
                this.audioContext = null
            }

            console.log("[MP3Player] 播放器已销毁")
        } catch (error) {
            console.error("[MP3Player] 销毁失败:", error)
        }
    }
}

export { MP3Player }
