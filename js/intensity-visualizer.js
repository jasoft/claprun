/**
 * 鼓掌烈度可视化模块 - 显示动态进度条和烈度指示
 *
 * 功能:
 * - 渐变进度条显示当前烈度
 * - 实时更新速度和加速度
 * - 鼓励文案动态变化
 * - 烈度等级显示
 */

import { SPEED_CONFIG, INTENSITY_LEVEL_CONFIG } from "./constants.js"

class IntensityVisualizer {
    constructor(options = {}) {
        this.containerId = options.containerId || "intensityContainer"
        this.container = null
        this.progressBar = null
        this.speedDisplay = null
        this.frequencyDisplay = null
        this.motivationText = null
        this.intensityLevel = null

        // 配置
        this.minSpeed = options.minSpeed || SPEED_CONFIG.MIN_SPEED
        this.maxSpeed = options.maxSpeed || SPEED_CONFIG.MAX_SPEED
        this.baseSpeed = options.baseSpeed || SPEED_CONFIG.BASE_SPEED

        // 鼓励文案
        this.motivations = [
            "🎉 开始鼓掌吧！",
            "👏 继续加油！",
            "🔥 越来越快了！",
            "⚡ 太棒了！",
            "🚀 飞起来了！",
            "💥 爆炸性的节奏！",
            "🌟 你是明星！",
            "🎵 节奏感十足！",
            "🎊 太嗨了！",
            "👑 鼓掌之王！",
        ]

        this.currentMotivationIndex = 0
    }

    /**
     * 初始化可视化
     */
    init() {
        try {
            console.log("[IntensityVisualizer] 初始化可视化...")

            // 获取容器
            this.container = document.getElementById(this.containerId)
            if (!this.container) {
                console.error("[IntensityVisualizer] 容器不存在:", this.containerId)
                return false
            }

            // 创建 HTML 结构
            this.container.innerHTML = `
                <div class="intensity-wrapper">
                    <div class="intensity-header">
                        <h3>🎵 鼓掌烈度</h3>
                        <div class="intensity-stats">
                            <div class="stat">
                                <span class="label">速度:</span>
                                <span class="value" id="speedDisplay">1.0x</span>
                            </div>
                            <div class="stat">
                                <span class="label">频率:</span>
                                <span class="value" id="frequencyDisplay">0 次/秒</span>
                            </div>
                        </div>
                    </div>

                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" id="progressBar"></div>
                            <div class="progress-bar-glow" id="progressGlow"></div>
                        </div>
                        <div class="intensity-level" id="intensityLevel">基础</div>
                    </div>

                    <div class="motivation-text" id="motivationText">🎉 开始鼓掌吧！</div>

                    <div class="intensity-info">
                        <div class="info-item">
                            <span class="level-badge" style="background: #4CAF50;">基础</span>
                            <span>0.5x - 1.0x</span>
                        </div>
                        <div class="info-item">
                            <span class="level-badge" style="background: #FFC107;">中等</span>
                            <span>1.0x - 1.5x</span>
                        </div>
                        <div class="info-item">
                            <span class="level-badge" style="background: #FF5722;">高烈度</span>
                            <span>1.5x - 2.0x</span>
                        </div>
                        <div class="info-item">
                            <span class="level-badge" style="background: #E91E63;">极限</span>
                            <span>2.0x - 3.0x</span>
                        </div>
                    </div>
                </div>
            `

            // 获取元素引用
            this.progressBar = document.getElementById("progressBar")
            this.progressGlow = document.getElementById("progressGlow")
            this.speedDisplay = document.getElementById("speedDisplay")
            this.frequencyDisplay = document.getElementById("frequencyDisplay")
            this.motivationText = document.getElementById("motivationText")
            this.intensityLevel = document.getElementById("intensityLevel")

            // 添加样式
            this.addStyles()

            console.log("[IntensityVisualizer] 可视化初始化完成")
            return true
        } catch (error) {
            console.error("[IntensityVisualizer] 初始化失败:", error)
            return false
        }
    }

    /**
     * 添加 CSS 样式
     */
    addStyles() {
        const style = document.createElement("style")
        style.textContent = `
            .intensity-wrapper {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }

            .intensity-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }

            .intensity-header h3 {
                margin: 0;
                font-size: 1.3em;
                color: #fff;
            }

            .intensity-stats {
                display: flex;
                gap: 20px;
                font-size: 0.9em;
            }

            .stat {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .stat .label {
                opacity: 0.7;
            }

            .stat .value {
                font-weight: bold;
                color: #FFD700;
                font-size: 1.1em;
            }

            .progress-container {
                position: relative;
                margin: 20px 0;
            }

            .progress-bar-bg {
                position: relative;
                width: 100%;
                height: 40px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 20px;
                overflow: hidden;
                border: 2px solid rgba(255, 255, 255, 0.1);
            }

            .progress-bar-fill {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg,
                    #4CAF50 0%,
                    #8BC34A 25%,
                    #FFC107 50%,
                    #FF5722 75%,
                    #E91E63 100%);
                transition: width 0.1s ease-out;
                border-radius: 18px;
            }

            .progress-bar-glow {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0%;
                background: radial-gradient(ellipse at right, rgba(255, 255, 255, 0.5), transparent);
                transition: width 0.1s ease-out;
                border-radius: 18px;
                filter: blur(2px);
            }

            .intensity-level {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                font-weight: bold;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                font-size: 0.9em;
                z-index: 10;
            }

            .motivation-text {
                text-align: center;
                font-size: 1.3em;
                font-weight: bold;
                color: #FFD700;
                margin: 15px 0;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                animation: pulse 0.5s ease-out;
            }

            @keyframes pulse {
                0% {
                    transform: scale(0.8);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .intensity-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin-top: 15px;
                font-size: 0.85em;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border-left: 3px solid rgba(255, 255, 255, 0.2);
            }

            .level-badge {
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                font-size: 0.7em;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }

            @media (max-width: 600px) {
                .intensity-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .intensity-stats {
                    width: 100%;
                    justify-content: space-between;
                }

                .intensity-info {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `
        document.head.appendChild(style)
    }

    /**
     * 更新烈度显示
     * @param {Object} data - { speed, acceleration, clapFrequency }
     */
    update(data) {
        const { speed, acceleration, clapFrequency } = data

        // 计算进度百分比 (相对于基础速度的增量)
        // baseSpeed (1.0x) → 0%
        // maxSpeed (3.0x) → 100%
        const speedAboveBase = speed - this.baseSpeed
        const maxSpeedAboveBase = this.maxSpeed - this.baseSpeed
        const progress = Math.max(0, Math.min(100, (speedAboveBase / maxSpeedAboveBase) * 100))

        // 更新进度条
        if (this.progressBar) {
            this.progressBar.style.width = progress + "%"
        }

        if (this.progressGlow) {
            this.progressGlow.style.width = progress + "%"
        }

        // 更新速度显示
        if (this.speedDisplay) {
            this.speedDisplay.textContent = speed.toFixed(2) + "x"
        }

        // 更新频率显示
        if (this.frequencyDisplay) {
            this.frequencyDisplay.textContent = clapFrequency.toFixed(1) + " 次/秒"
        }

        // 更新烈度等级
        this.updateIntensityLevel(speed)

        // 更新鼓励文案
        this.updateMotivation(speed, clapFrequency)
    }

    /**
     * 更新烈度等级
     */
    updateIntensityLevel(speed) {
        let level = "基础"
        let color = "#4CAF50"

        if (speed <= this.baseSpeed) {
            level = "基础"
            color = "#4CAF50"
        } else if (speed >= INTENSITY_LEVEL_CONFIG.LEVEL_EXTREME) {
            level = "极限"
            color = "#E91E63"
        } else if (speed >= INTENSITY_LEVEL_CONFIG.LEVEL_HIGH) {
            level = "高烈度"
            color = "#FF5722"
        } else if (speed >= INTENSITY_LEVEL_CONFIG.LEVEL_MEDIUM) {
            level = "中等"
            color = "#FFC107"
        }

        if (this.intensityLevel) {
            this.intensityLevel.textContent = level
            this.intensityLevel.style.color = color
        }
    }

    /**
     * 更新鼓励文案
     */
    updateMotivation(speed, clapFrequency) {
        if (!this.motivationText) return

        // 根据速度和频率选择文案
        let motivation = this.motivations[0]

        if (speed <= this.baseSpeed) {
            // 速度回到基础，显示开始提示
            motivation = "🎉 开始鼓掌吧！"
        } else if (clapFrequency > 5) {
            // 频率很高
            motivation = this.motivations[Math.floor(Math.random() * this.motivations.length)]
        } else if (speed >= INTENSITY_LEVEL_CONFIG.LEVEL_EXTREME) {
            motivation = this.motivations[Math.floor(Math.random() * (this.motivations.length - 2)) + 2]
        } else if (speed >= INTENSITY_LEVEL_CONFIG.LEVEL_HIGH) {
            motivation = this.motivations[Math.floor(Math.random() * (this.motivations.length - 4)) + 1]
        }

        // 只在文案改变时更新（避免频繁闪烁）
        if (this.motivationText.textContent !== motivation) {
            this.motivationText.textContent = motivation
            // 触发动画
            this.motivationText.style.animation = "none"
            setTimeout(() => {
                this.motivationText.style.animation = "pulse 0.5s ease-out"
            }, 10)
        }
    }

    /**
     * 重置显示
     */
    reset() {
        if (this.progressBar) {
            this.progressBar.style.width = "0%"
        }

        if (this.progressGlow) {
            this.progressGlow.style.width = "0%"
        }

        if (this.speedDisplay) {
            this.speedDisplay.textContent = this.baseSpeed.toFixed(1) + "x"
        }

        if (this.frequencyDisplay) {
            this.frequencyDisplay.textContent = "0 次/秒"
        }

        if (this.intensityLevel) {
            this.intensityLevel.textContent = "基础"
            this.intensityLevel.style.color = "#4CAF50"
        }

        if (this.motivationText) {
            this.motivationText.textContent = "🎉 开始鼓掌吧！"
        }
    }
}

export { IntensityVisualizer }
