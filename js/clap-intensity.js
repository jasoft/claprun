/**
 * 鼓掌强度计算模块 - 真正的汽车物理模型
 *
 * 物理模型:
 * - 鼓掌频率 = 油门深度 (0-1)
 * - 加速度 = 油门深度 * 最大加速度 - 摩擦阻力 - 发动机制动
 * - 速度通过积分加速度计算，严格限制在最大速度内
 * - 松开油门立即开始减速，无延迟
 */

import { CLAP_INTENSITY_CONFIG, SPEED_CONFIG } from "./constants.js"

class ClapIntensity {
    constructor(options = {}) {
        // 基础参数
        this.baseSpeed = options.baseSpeed || SPEED_CONFIG.BASE_SPEED
        this.maxSpeed = options.maxSpeed || SPEED_CONFIG.MAX_SPEED
        this.minSpeed = options.minSpeed || SPEED_CONFIG.MIN_SPEED

        // 物理状态
        this.currentSpeed = this.baseSpeed
        this.currentAcceleration = 0 // 当前加速度 (m/s²)
        this.throttle = 0 // 油门深度 (0-1)

        // 鼓掌历史记录（用于计算频率=油门深度）
        this.clapHistory = [] // 存储最近的鼓掌时间戳
        this.clapForces = [] // 存储鼓掌产生的推力 {timestamp, force, endTime}

        // 物理参数
        this.maxAcceleration = options.maxAcceleration || CLAP_INTENSITY_CONFIG.MAX_ACCELERATION

        // 非线性阻力系统参数
        this.baseFriction = options.baseFriction || CLAP_INTENSITY_CONFIG.BASE_FRICTION
        this.airResistanceFactor = options.airResistanceFactor || CLAP_INTENSITY_CONFIG.AIR_RESISTANCE_FACTOR
        this.engineBrake = options.engineBrake || CLAP_INTENSITY_CONFIG.ENGINE_BRAKE
        this.lowSpeedFriction = options.lowSpeedFriction || CLAP_INTENSITY_CONFIG.LOW_SPEED_FRICTION
        this.highSpeedMultiplier = options.highSpeedMultiplier || CLAP_INTENSITY_CONFIG.HIGH_SPEED_MULTIPLIER
        this.physicsUpdateInterval = options.physicsUpdateInterval || CLAP_INTENSITY_CONFIG.PHYSICS_UPDATE_INTERVAL
        this.clapForceDuration = options.clapForceDuration || CLAP_INTENSITY_CONFIG.CLAP_FORCE_DURATION
        this.frequencyWindow = options.frequencyWindow || CLAP_INTENSITY_CONFIG.FREQUENCY_WINDOW
        this.clapForceMultiplier = options.clapForceMultiplier || CLAP_INTENSITY_CONFIG.CLAP_FORCE_MULTIPLIER
        this.speedHoldDuration = options.speedHoldDuration || CLAP_INTENSITY_CONFIG.SPEED_HOLD_DURATION
        this.speedHoldActivationThreshold =
            options.speedHoldActivationThreshold ||
            CLAP_INTENSITY_CONFIG.SPEED_HOLD_ACTIVATION_THRESHOLD ||
            0.25

        // 计时器
        this.physicsTimer = null
        this.lastUpdateTime = Date.now()

        // 回调函数
        this.onSpeedChange = options.onSpeedChange || (() => {})

        // 最大速度保持
        this.speedHoldActive = false
        this.speedHoldUntil = 0
        this.lastSpeed = this.currentSpeed
    }

    /**
     * 记录一次鼓掌事件 - 添加推力
     * @param {Object} clapData - 鼓掌数据 { confidence, label, timestamp }
     */
    recordClap(clapData) {
        const now = Date.now()

        // 添加到历史记录
        this.clapHistory.push(now)

        // 清理过期的历史记录（保留1秒内用于计算频率）
        this.clapHistory = this.clapHistory.filter((time) => now - time < this.frequencyWindow)

        // 添加鼓掌推力（相当于踩油门）
        const force = clapData.confidence * this.clapForceMultiplier
        this.clapForces.push({
            timestamp: now,
            force: force,
            endTime: now + this.clapForceDuration
        })

        // 启动物理模拟（如果还没启动）
        this.startPhysicsSimulation()

        console.log("[ClapIntensity] 鼓掌事件:", {
            force: force.toFixed(3),
            currentSpeed: this.currentSpeed.toFixed(2) + "x",
            activeForces: this.clapForces.length,
        })
    }

    /**
     * 启动物理模拟 - 真正的汽车物理引擎
     */
    startPhysicsSimulation() {
        // 如果物理引擎已在运行，不重复启动
        if (this.physicsTimer) {
            return
        }

        this.physicsTimer = setInterval(() => {
            this.updatePhysics()
        }, this.physicsUpdateInterval)

        console.log("[ClapIntensity] 物理引擎已启动")
    }

    /**
     * 物理更新 - 汽车动力学模拟
     */
    updatePhysics() {
        const now = Date.now()
        const deltaTime = (now - this.lastUpdateTime) / 1000.0 // 转换为秒
        this.lastUpdateTime = now

        if (this.speedHoldActive && now >= this.speedHoldUntil) {
            this.speedHoldActive = false
        }

        // 1. 计算当前油门深度（基于1秒内的鼓掌频率）
        const recentClaps = this.clapHistory.filter(time => now - time < this.frequencyWindow)
        const clapFrequency = recentClaps.length / (this.frequencyWindow / 1000.0) // 次/秒
        this.throttle = Math.min(1.0, clapFrequency / 3.0) // 假设3次/秒为满油门

        // 2. 计算当前推力（来自仍在持续作用的鼓掌）
        let currentThrottleForce = 0
        this.clapForces = this.clapForces.filter(force => {
            if (now < force.endTime) {
                currentThrottleForce += force.force
                return true
            }
            return false
        })

        // 3. 计算加速度 (F = ma, 这里 m=1)
        // 加速度 = 油门推力 + 持续推力 - 非线性阻力
        let engineForce = this.throttle * this.maxAcceleration
        let totalForce = engineForce + currentThrottleForce

        // 非线性阻力计算 - 实现指数衰减减速
        let totalResistance = this.calculateNonLinearResistance()

        // 发动机制动（松油门时额外阻力）
        let engineBrakeForce = this.throttle < 0.1 ? this.engineBrake : 0
        if (this.speedHoldActive) {
            engineBrakeForce = 0
        }
        totalResistance += engineBrakeForce

        if (this.speedHoldActive) {
            totalResistance = 0
        }

        this.currentAcceleration = totalForce - totalResistance

        // 4. 更新速度 (v = v0 + a * dt)
        this.currentSpeed += this.currentAcceleration * deltaTime

        // 5. 严格限制速度范围
        this.currentSpeed = Math.max(this.minSpeed, Math.min(this.maxSpeed, this.currentSpeed))
        if (this.speedHoldActive) {
            this.currentSpeed = this.maxSpeed
        }

        const activationThreshold = Math.max(0, this.maxSpeed - this.speedHoldActivationThreshold)
        const crossedActivation =
            !this.speedHoldActive &&
            this.lastSpeed < activationThreshold &&
            this.currentSpeed >= activationThreshold

        if (crossedActivation) {
            this.activateSpeedHold(now)
        }

        // 6. 如果速度接近基础速度且没有推力，停止物理引擎
        if (Math.abs(this.currentSpeed - this.baseSpeed) < 0.01 &&
            this.throttle < 0.01 &&
            this.clapForces.length === 0) {
            this.currentSpeed = this.baseSpeed
            this.stopPhysicsSimulation()
            return
        }

        // 7. 触发回调
        const progressRatio = Math.min(1.0, (this.currentSpeed - this.baseSpeed) / (this.maxSpeed - this.baseSpeed))
        this.onSpeedChange({
            speed: this.currentSpeed,
            acceleration: this.currentAcceleration,
            clapFrequency: clapFrequency,
            progressRatio: progressRatio,
            throttle: this.throttle,
            isSpeedHoldActive: this.speedHoldActive,
        })

        this.lastSpeed = this.currentSpeed
    }

    /**
     * 停止物理模拟
     */
    stopPhysicsSimulation() {
        if (this.physicsTimer) {
            clearInterval(this.physicsTimer)
            this.physicsTimer = null
            console.log("[ClapIntensity] 物理引擎已停止")
        }
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
     * 计算非线性阻力 - 实现真实汽车指数衰减减速
     * 高速时阻力大（快速减速），低速时阻力小（缓慢减速）
     */
    calculateNonLinearResistance() {
        const speedRatio = this.currentSpeed / this.maxSpeed // 速度比例 (0-1)

        // 1. 基础阻力（线性部分）
        let baseResistance = this.baseFriction

        // 2. 空气阻力（二次方增长，高速时显著增大）
        // 真实汽车：空气阻力 = 0.5 * ρ * Cd * A * v²
        // 简化版本：随速度平方增长
        let airResistance = this.airResistanceFactor * Math.pow(speedRatio, 2)

        // 3. 速度相关的非线性阻力
        let speedDependentResistance
        if (speedRatio > 0.7) {
            // 高速区域（>70%最大速度）：阻力急剧增大
            speedDependentResistance = this.lowSpeedFriction + (speedRatio - 0.7) * this.highSpeedMultiplier
        } else {
            // 中低速区域：基础阻力
            speedDependentResistance = this.lowSpeedFriction
        }

        // 4. 总阻力 = 基础阻力 + 空气阻力 + 速度相关阻力
        let totalResistance = baseResistance + airResistance + speedDependentResistance

        // 5. 确保阻力不会导致负向加速度过大（防止过于剧烈的减速）
        totalResistance = Math.min(totalResistance, this.currentSpeed * 0.5) // 最多每秒减速50%

        return totalResistance
    }

    /**
     * 获取当前油门深度
     */
    getThrottle() {
        return this.throttle
    }

    /**
     * 获取鼓掌频率 (次/秒)
     */
    getClapFrequency() {
        const now = Date.now()
        const recentClaps = this.clapHistory.filter(time => now - time < this.frequencyWindow)
        return recentClaps.length / (this.frequencyWindow / 1000.0)
    }

    /**
     * 重置状态
     */
    reset() {
        // 停止物理引擎
        this.stopPhysicsSimulation()

        // 重置状态
        this.currentSpeed = this.baseSpeed
        this.currentAcceleration = 0
        this.throttle = 0

        // 清空数据
        this.clapHistory = []
        this.clapForces = []
        this.lastUpdateTime = Date.now()
        this.speedHoldActive = false
        this.speedHoldUntil = 0
        this.lastSpeed = this.currentSpeed

        console.log("[ClapIntensity] 状态已重置")
    }

    activateSpeedHold(now) {
        this.speedHoldActive = true
        this.speedHoldUntil = now + this.speedHoldDuration
        this.currentSpeed = this.maxSpeed
    }

    /**
     * 销毁
     */
    destroy() {
        this.stopPhysicsSimulation()
        console.log("[ClapIntensity] 已销毁")
    }
}

export { ClapIntensity }
