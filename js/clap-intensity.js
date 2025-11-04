/**
 * 鼓掌强度计算模块 - 基于加速度公式实时计算速度
 *
 * 物理模型:
 * - 每次鼓掌是一个加速度脉冲
 * - 单位时间内鼓掌次数越多，加速度越大
 * - 速度 = 初始速度 + 加速度 * 时间
 * - 速度衰减: 没有新的鼓掌时，速度逐渐恢复到基础速度
 */

import { CLAP_INTENSITY_CONFIG, SPEED_CONFIG } from "./constants.js"

class ClapIntensity {
    constructor(options = {}) {
        // 基础参数
        this.baseSpeed = options.baseSpeed || SPEED_CONFIG.BASE_SPEED
        this.maxSpeed = options.maxSpeed || SPEED_CONFIG.MAX_SPEED
        this.minSpeed = options.minSpeed || SPEED_CONFIG.MIN_SPEED

        // 当前状态
        this.currentSpeed = this.baseSpeed
        this.currentAcceleration = 0 // 当前加速度

        // 鼓掌历史记录（用于计算频率）
        this.clapHistory = [] // 存储最近的鼓掌时间戳
        this.clapHistoryWindow = options.clapHistoryWindow || CLAP_INTENSITY_CONFIG.CLAP_HISTORY_WINDOW

        // 加速度参数
        this.accelerationPerClap = options.accelerationPerClap || CLAP_INTENSITY_CONFIG.ACCELERATION_PER_CLAP
        this.accelerationFromFrequency =
            options.accelerationFromFrequency || CLAP_INTENSITY_CONFIG.ACCELERATION_FROM_FREQUENCY

        // 衰减参数
        this.decayRate = options.decayRate || CLAP_INTENSITY_CONFIG.DECAY_RATE
        this.decayInterval = options.decayInterval || CLAP_INTENSITY_CONFIG.DECAY_INTERVAL
        this.decayDelay = options.decayDelay || CLAP_INTENSITY_CONFIG.DECAY_DELAY

        // 计时器
        this.decayTimer = null
        this.lastClapTime = 0

        // 回调函数
        this.onSpeedChange = options.onSpeedChange || (() => {})
    }

    /**
     * 记录一次鼓掌事件
     * @param {Object} clapData - 鼓掌数据 { confidence, label, timestamp }
     */
    recordClap(clapData) {
        const now = Date.now()
        this.lastClapTime = now

        // 添加到历史记录
        this.clapHistory.push(now)

        // 清理过期的历史记录
        this.clapHistory = this.clapHistory.filter((time) => now - time < this.clapHistoryWindow)

        // 计算当前的鼓掌频率 (次/秒)
        const clapFrequency = (this.clapHistory.length / this.clapHistoryWindow) * 1000

        // 计算加速度
        // 1. 基础加速度：每次鼓掌增加固定值
        let acceleration = this.accelerationPerClap

        // 2. 频率加速度：鼓掌越频繁，加速度越大
        // 频率范围: 0-10 次/秒，映射到 0-0.5 的加速度
        const frequencyAcceleration = Math.min(0.5, (clapFrequency / 10) * this.accelerationFromFrequency)
        acceleration += frequencyAcceleration

        // 3. 置信度加速度：置信度越高，加速度越大
        const confidenceAcceleration = clapData.confidence * 0.1
        acceleration += confidenceAcceleration

        // 更新当前加速度
        this.currentAcceleration = acceleration

        // 立即更新速度
        this.updateSpeed()

        console.log("[ClapIntensity] 鼓掌事件:", {
            frequency: clapFrequency.toFixed(2) + " 次/秒",
            acceleration: acceleration.toFixed(3),
            currentSpeed: this.currentSpeed.toFixed(2) + "x",
            clapCount: this.clapHistory.length,
        })

        // 启动衰减计时器
        this.startDecayTimer()
    }

    /**
     * 更新速度
     */
    updateSpeed() {
        // 速度 = 当前速度 + 加速度
        this.currentSpeed = Math.min(
            this.maxSpeed,
            Math.max(this.minSpeed, this.currentSpeed + this.currentAcceleration)
        )

        // 触发回调
        this.onSpeedChange({
            speed: this.currentSpeed,
            acceleration: this.currentAcceleration,
            clapFrequency: (this.clapHistory.length / this.clapHistoryWindow) * 1000,
        })
    }

    /**
     * 启动衰减计时器
     */
    startDecayTimer() {
        // 如果已有计时器，不重新启动
        if (this.decayTimer) {
            return
        }

        this.decayTimer = setInterval(() => {
            const now = Date.now()
            const timeSinceLastClap = now - this.lastClapTime

            // 如果距离上次鼓掌超过 500ms，开始衰减
            if (timeSinceLastClap > 500) {
                // 衰减加速度
                this.currentAcceleration = Math.max(0, this.currentAcceleration - this.decayRate)

                // 衰减速度（向基础速度靠近）
                const speedDiff = this.currentSpeed - this.baseSpeed
                if (Math.abs(speedDiff) > 0.01) {
                    this.currentSpeed -= speedDiff * 0.05 // 5% 的衰减
                } else {
                    this.currentSpeed = this.baseSpeed
                }

                // 清理过期的历史记录
                this.clapHistory = this.clapHistory.filter((time) => now - time < this.clapHistoryWindow)

                // 触发回调
                this.onSpeedChange({
                    speed: this.currentSpeed,
                    acceleration: this.currentAcceleration,
                    clapFrequency: (this.clapHistory.length / this.clapHistoryWindow) * 1000,
                })

                // 如果速度已恢复到基础速度，停止计时器
                if (this.currentSpeed === this.baseSpeed && this.currentAcceleration === 0) {
                    clearInterval(this.decayTimer)
                    this.decayTimer = null
                }
            }
        }, this.decayInterval)
    }

    /**
     * 获取当前速度
     */
    getSpeed() {
        return this.currentSpeed
    }

    /**
     * 获取当前加速度
     */
    getAcceleration() {
        return this.currentAcceleration
    }

    /**
     * 获取鼓掌频率 (次/秒)
     */
    getClapFrequency() {
        return (this.clapHistory.length / this.clapHistoryWindow) * 1000
    }

    /**
     * 重置状态
     */
    reset() {
        this.currentSpeed = this.baseSpeed
        this.currentAcceleration = 0
        this.clapHistory = []
        this.lastClapTime = 0

        if (this.decayTimer) {
            clearInterval(this.decayTimer)
            this.decayTimer = null
        }
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.decayTimer) {
            clearInterval(this.decayTimer)
            this.decayTimer = null
        }
    }
}

export { ClapIntensity }
