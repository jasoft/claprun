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
        this.progressBarBg = null
        this.emotionBadge = null
        this.highIntensityActive = false
        this.fullGlowActive = false
        this.progressBoostActive = false

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
                <div class="intensity-overlay">
                    <div class="progress-wrapper">
                        <div class="progress-track">
                            <div class="progress-bar-fill" id="progressBar"></div>
                            <div class="progress-bar-glow" id="progressGlow"></div>
                        </div>
                        <div class="emotion-row">
                            <span class="level-badge" id="intensityLevel">基础</span>
                            <span class="intensity-emotion" id="intensityEmotion">🔥 热度待命</span>
                        </div>
                    </div>

                    <div class="overlay-top">
                        <div class="stat-panel">
                            <span class="panel-title">舞台状态</span>
                            <div class="stat-grid">
                                <div class="stat-row">
                                    <span class="label">舞蹈速度</span>
                                    <span class="value" id="danceSpeedDisplay">1.00x</span>
                                </div>
                                <div class="stat-row">
                                    <span class="label">音乐速度</span>
                                    <span class="value" id="musicSpeedDisplay">1.00x</span>
                                </div>
                                <div class="stat-row">
                                    <span class="label">鼓掌频率</span>
                                    <span class="value" id="frequencyDisplay">0.0 次/秒</span>
                                </div>
                                <div class="stat-row">
                                    <span class="label">鼓掌次数</span>
                                    <span class="value" id="clapCounterDisplay">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="overlay-bottom">
                        <div class="motivation-text" id="motivationText">🎉 开始鼓掌吧！</div>
                    </div>
                </div>
            `

            // 获取元素引用
            this.progressBar = document.getElementById("progressBar")
            this.progressGlow = document.getElementById("progressGlow")
            this.danceSpeedDisplay = document.getElementById("danceSpeedDisplay")
            this.musicSpeedDisplay = document.getElementById("musicSpeedDisplay")
            this.frequencyDisplay = document.getElementById("frequencyDisplay")
            this.motivationText = document.getElementById("motivationText")
            this.intensityLevel = document.getElementById("intensityLevel")
            this.progressBarBg = this.container.querySelector(".progress-track")
            this.emotionBadge = document.getElementById("intensityEmotion")

            // 添加样式
            this.addStyles()

            if (this.intensityLevel) {
                this.intensityLevel.style.background = "linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))"
                this.intensityLevel.style.color = "#101327"
            }

            if (this.progressBar) {
                this.progressBar.style.width = "0%"
            }

            if (this.progressGlow) {
                this.progressGlow.style.width = "0%"
                this.progressGlow.style.opacity = 0
            }

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
            .intensity-overlay {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: clamp(24px, 5vw, 80px);
                pointer-events: none;
                color: #f4f6ff;
                font-family: "Orbitron", "Arial", sans-serif;
            }

            .progress-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                margin-top: clamp(32px, 8vh, 80px);
            }

            .overlay-top {
                display: flex;
                align-items: flex-start;
                gap: 24px;
                margin-top: clamp(16px, 4vh, 48px);
            }

            .progress-track {
                position: relative;
                width: min(80vw, 1100px);
                height: 52px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 999px;
                overflow: hidden;
                box-shadow: 0 24px 56px rgba(12, 16, 48, 0.55);
                border: 1px solid rgba(255, 255, 255, 0.1);
                --scale-x: 1;
                --scale-y: 1;
                transform: scale(var(--scale-x), var(--scale-y));
                transition: transform 0.28s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            }

            .progress-bar-fill {
                position: absolute;
                inset: 0;
                width: 0%;
                background: linear-gradient(90deg,
                    #42f1ff 0%,
                    #42ffb6 18%,
                    #ffe66b 48%,
                    #ff934a 70%,
                    #ff3370 100%);
                border-radius: inherit;
                transition: width 0.12s ease-out, filter 0.3s ease;
                box-shadow: 0 20px 46px rgba(255, 133, 142, 0.45);
            }

            .progress-bar-glow {
                position: absolute;
                inset: 0;
                width: 0%;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.6), transparent 70%);
                filter: blur(18px);
                opacity: 0.65;
                transition: width 0.12s ease-out, opacity 0.12s ease-out;
            }

            .progress-track.power-mode {
                --scale-x: 1.08;
                --scale-y: 1.3;
                box-shadow: 0 36px 76px rgba(255, 120, 90, 0.65);
                border-color: rgba(255, 240, 200, 0.65);
            }

            .progress-bar-fill.power-mode {
                filter: brightness(1.2) saturate(1.18);
            }

            .progress-track.boost-mode {
                --scale-x: 1.06;
                --scale-y: 1.28;
                box-shadow: 0 32px 72px rgba(250, 242, 220, 0.6);
                border-color: rgba(255, 248, 230, 0.65);
            }

            .progress-track.power-mode.boost-mode,
            .progress-track.power-mode.rhythm-surge {
                --scale-x: 1.1;
                --scale-y: 1.36;
            }

            .progress-bar-fill.boost-mode {
                filter: brightness(1.45) saturate(1.35);
                box-shadow: 0 28px 64px rgba(255, 255, 255, 0.55), 0 24px 52px rgba(255, 173, 102, 0.45);
            }

            .progress-bar-glow.boost-mode {
                opacity: 0.85;
            }

            .progress-bar-fill.power-mode.boost-mode,
            .progress-bar-fill.power-mode.rhythm-surge {
                filter: brightness(1.8) saturate(1.45);
                box-shadow: 0 36px 74px rgba(255, 255, 255, 0.7), 0 28px 64px rgba(255, 173, 102, 0.6);
            }

            .progress-track.rhythm-surge {
                --scale-x: 1.08;
                --scale-y: 1.32;
                box-shadow: 0 34px 90px rgba(66, 241, 255, 0.75);
                border-color: rgba(66, 241, 255, 0.85);
                animation: surgePulse 0.9s ease-in-out infinite;
            }

            .progress-bar-fill.rhythm-surge {
                filter: brightness(1.75) saturate(1.4);
                box-shadow: 0 34px 64px rgba(255, 255, 255, 0.65), 0 28px 58px rgba(66, 241, 255, 0.7);
                animation: surgeFlow 1.2s linear infinite;
            }

            .progress-bar-glow.rhythm-surge {
                opacity: 0.95 !important;
                animation: surgeGlow 0.9s ease-in-out infinite;
            }

            .emotion-row {
                display: flex;
                align-items: center;
                gap: 18px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-size: 0.95em;
            }

            .level-badge {
                padding: 10px 18px;
                border-radius: 999px;
                background: linear-gradient(135deg, rgba(255, 194, 82, 0.8), rgba(255, 87, 51, 0.8));
                color: #1b1025;
                font-weight: 800;
                box-shadow: 0 12px 26px rgba(255, 136, 77, 0.45);
            }

            .intensity-emotion {
                font-size: 1.1em;
                font-weight: 700;
                color: #ffe48b;
                text-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
                transition: transform 0.25s ease, color 0.25s ease;
            }

            .intensity-emotion.level-rise {
                color: #ffd95a;
            }

            .intensity-emotion.level-burn {
                color: #ffb74d;
                transform: scale(1.04);
            }

            .intensity-emotion.level-explode {
                color: #ffe066;
                transform: scale(1.12);
                animation: emotionSwell 0.8s ease-in-out infinite;
            }

            .stat-panel {
                background: linear-gradient(145deg, rgba(10, 14, 40, 0.7), rgba(24, 28, 68, 0.55));
                padding: 18px 22px;
                border-radius: 20px;
                box-shadow: 0 18px 38px rgba(7, 9, 32, 0.55);
                backdrop-filter: blur(16px);
                min-width: 220px;
            }

            .panel-title {
                font-size: 0.7em;
                letter-spacing: 0.4em;
                text-transform: uppercase;
                color: rgba(196, 201, 255, 0.75);
                display: block;
                margin-bottom: 14px;
            }

            .stat-grid {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 24px;
            }

            .stat-row .label {
                font-size: 0.68em;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(198, 204, 255, 0.6);
            }

            .stat-row .value {
                font-size: 1.05em;
                font-weight: 700;
                letter-spacing: 0.05em;
                color: #f9fbff;
                text-shadow: 0 2px 8px rgba(11, 16, 48, 0.5);
            }

            .overlay-bottom {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                margin-bottom: clamp(24px, 6vh, 60px);
            }

            .motivation-text {
                text-align: center;
                font-size: 1.05em;
                font-weight: 600;
                color: #ffe082;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
                animation: pulse 0.5s ease-out;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            @keyframes pulse {
                0% { transform: scale(0.85); opacity: 0; }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }

            @keyframes emotionSwell {
                0% { transform: scale(1.05); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1.05); }
            }

            body.shake-active {
                animation: screenShake 0.54s ease-in-out infinite;
                overflow: hidden;
            }

            @keyframes screenShake {
                0% { transform: translate(0px, 0px) rotate(0deg); }
                20% { transform: translate(-5px, 3px) rotate(-0.6deg); }
                40% { transform: translate(5px, -3px) rotate(0.7deg); }
                60% { transform: translate(-3px, -5px) rotate(-0.4deg); }
                80% { transform: translate(4px, 2px) rotate(0.5deg); }
                100% { transform: translate(0px, 0px) rotate(0deg); }
            }

            @keyframes surgeFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes surgePulse {
                0% { box-shadow: 0 24px 48px rgba(66, 241, 255, 0.35); }
                50% { box-shadow: 0 30px 60px rgba(66, 241, 255, 0.6); }
                100% { box-shadow: 0 24px 48px rgba(66, 241, 255, 0.35); }
            }

            @keyframes surgeGlow {
                0% { opacity: 0.65; }
                40% { opacity: 0.95; }
                100% { opacity: 0.7; }
            }

            @media (max-width: 640px) {
                .intensity-overlay {
                    padding: 24px;
                    gap: 16px;
                }

                .overlay-top {
                    margin-top: 72px;
                }

                .progress-track {
                    width: 92vw;
                }

                .emotion-row {
                    flex-direction: column;
                    gap: 12px;
                }
            }
        `
        document.head.appendChild(style)
    }

    /**
     * 根据进度触发特效
     */
    handleProgressEffects(progressRatio) {
        if (isNaN(progressRatio)) {
            return
        }

        const highThreshold = 0.75
        const highRelease = 0.7
        const fullThreshold = 1.0
        const fullRelease = 0.98

        const boostActive = progressRatio >= highThreshold
        if (boostActive !== this.progressBoostActive) {
            this.setProgressBoost(boostActive)
        }

        if (progressRatio >= highThreshold) {
            if (!this.highIntensityActive) {
                this.activateHighIntensity()
            }
        } else if (this.highIntensityActive && progressRatio < highRelease) {
            this.deactivateHighIntensity()
        }

        if (progressRatio >= fullThreshold) {
            if (!this.fullGlowActive) {
                this.activateFullGlow()
            }
        } else if (this.fullGlowActive && progressRatio < fullRelease) {
            this.deactivateFullGlow()
        }
    }

    activateHighIntensity() {
        this.highIntensityActive = true

        if (document.body && !document.body.classList.contains("shake-active")) {
            document.body.classList.add("shake-active")
        }
    }

    deactivateHighIntensity() {
        this.highIntensityActive = false

        if (document.body) {
            document.body.classList.remove("shake-active")
        }
    }

    activateFullGlow() {
        this.fullGlowActive = true

        if (this.progressBarBg) {
            this.progressBarBg.classList.add("power-mode")
        }

        if (this.progressBar) {
            this.progressBar.classList.add("power-mode")
        }

        if (this.progressGlow) {
            this.progressGlow.style.opacity = 0.95
        }
    }

    deactivateFullGlow() {
        this.fullGlowActive = false

        if (this.progressBarBg) {
            this.progressBarBg.classList.remove("power-mode")
        }

        if (this.progressBar) {
            this.progressBar.classList.remove("power-mode")
        }

        if (this.progressGlow) {
            this.progressGlow.style.opacity = ""
        }
    }

    setProgressBoost(active) {
        this.progressBoostActive = active

        if (this.progressBarBg) {
            this.progressBarBg.classList.toggle("boost-mode", active)
        }

        if (this.progressBar) {
            this.progressBar.classList.toggle("boost-mode", active)
        }

        if (this.progressGlow) {
            this.progressGlow.classList.toggle("boost-mode", active)
        }
    }

    /**
     * 更新烈度显示
     * @param {Object} data - { speed, acceleration, clapFrequency, musicSpeed, danceSpeed, progressRatio }
     */
    update(data) {
        const { speed, acceleration, clapFrequency, musicSpeed, danceSpeed, progressRatio } = data

        // 使用传入的舞蹈速度，如果没有则使用通用速度
        const currentDanceSpeed = Number.isFinite(danceSpeed) ? danceSpeed : (Number.isFinite(speed) ? speed : this.baseSpeed)

        // 计算进度百分比 (相对于基础速度的增量)
        // 使用进度比例或基于舞蹈速度计算
        let progress = 0
        if (progressRatio !== undefined) {
            progress = Math.max(0, Math.min(100, progressRatio * 100))
        } else {
            const speedAboveBase = currentDanceSpeed - this.baseSpeed
            const maxSpeedAboveBase = this.maxSpeed - this.baseSpeed
            progress = Math.max(0, Math.min(100, (speedAboveBase / maxSpeedAboveBase) * 100))
        }

        const progressRatioValue = progress / 100

        // 更新进度条
        if (this.progressBar) {
            this.progressBar.style.width = progress + "%"
        }

        if (this.progressGlow) {
            const glowWidth = Math.max(0, progress - 4)
            this.progressGlow.style.width = glowWidth + "%"
            const baseGlow = progressRatioValue > 0.15 ? 0.85 : (progressRatioValue > 0 ? 0.4 : 0)
            const glowOpacity = this.fullGlowActive ? 0.95 : baseGlow
            this.progressGlow.style.opacity = glowOpacity
        }

        // 更新舞蹈速度显示
        if (this.danceSpeedDisplay) {
            this.danceSpeedDisplay.textContent = currentDanceSpeed.toFixed(2) + "x"
        }

        // 更新音乐速度显示
        if (this.musicSpeedDisplay) {
            const musicCandidate = Number.isFinite(musicSpeed) ? musicSpeed : Math.min(2.0, Math.max(1.0, currentDanceSpeed * 0.3))
            const currentMusicSpeed = Number.isFinite(musicCandidate) ? musicCandidate : 1
            this.musicSpeedDisplay.textContent = currentMusicSpeed.toFixed(2) + "x"
        }

        // 更新频率显示
        const freqValue = Number.isFinite(clapFrequency) ? clapFrequency : 0
        if (this.frequencyDisplay) {
            this.frequencyDisplay.textContent = freqValue.toFixed(1) + " 次/秒"
        }

        const surgeActive = freqValue >= 3

        this.handleProgressEffects(progressRatioValue)
        if (this.progressBarBg) {
            const surgeClass = surgeActive || this.fullGlowActive
            this.progressBarBg.classList.toggle("rhythm-surge", surgeClass)
        }

        if (this.progressBar) {
            const surgeClass = surgeActive || this.fullGlowActive
            this.progressBar.classList.toggle("rhythm-surge", surgeClass)
        }

        this.updateEmotionBadge(progressRatioValue)

        // 更新烈度等级
        this.updateIntensityLevel(currentDanceSpeed)

        // 更新鼓励文案
        this.updateMotivation(currentDanceSpeed, clapFrequency)
    }

    /**
     * 更新烈度等级
     */
    updateIntensityLevel(speed) {
        const safeSpeed = Number.isFinite(speed) ? speed : this.baseSpeed
        let level = "基础"
        let badgeBackground = "linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))"
        let textColor = "#101327"

        if (safeSpeed <= this.baseSpeed) {
            level = "基础"
            badgeBackground = "linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))"
            textColor = "#101327"
        } else if (safeSpeed >= INTENSITY_LEVEL_CONFIG.LEVEL_EXTREME) {
            level = "极限"
            badgeBackground = "linear-gradient(135deg, rgba(255, 120, 180, 0.9), rgba(255, 68, 131, 0.9))"
            textColor = "#1b0c1d"
        } else if (safeSpeed >= INTENSITY_LEVEL_CONFIG.LEVEL_HIGH) {
            level = "高烈度"
            badgeBackground = "linear-gradient(135deg, rgba(255, 150, 92, 0.9), rgba(255, 82, 64, 0.9))"
            textColor = "#1a0d12"
        } else if (safeSpeed >= INTENSITY_LEVEL_CONFIG.LEVEL_MEDIUM) {
            level = "中等"
            badgeBackground = "linear-gradient(135deg, rgba(255, 220, 120, 0.9), rgba(255, 186, 90, 0.9))"
            textColor = "#20130a"
        }

        if (this.intensityLevel) {
            this.intensityLevel.textContent = level
            this.intensityLevel.style.background = badgeBackground
            this.intensityLevel.style.color = textColor
        }
    }

    /**
     * 更新情绪徽章
     */
    updateEmotionBadge(progressRatio) {
        if (!this.emotionBadge) return

        let text = "🔥 热度待命"
        let levelClass = ""

        if (progressRatio >= 1) {
            text = "💥 爆燃极限！"
            levelClass = "level-explode"
        } else if (progressRatio >= 0.75) {
            text = "🔥 火力全开！"
            levelClass = "level-burn"
        } else if (progressRatio >= 0.45) {
            text = "⚡ 节奏上升！"
            levelClass = "level-rise"
        } else if (progressRatio >= 0.2) {
            text = "🎶 节奏渐起"
            levelClass = ""
        }

        this.emotionBadge.textContent = text
        this.emotionBadge.classList.remove("level-rise", "level-burn", "level-explode")
        if (levelClass) {
            this.emotionBadge.classList.add(levelClass)
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
        this.setProgressBoost(false)

        if (this.progressBar) {
            this.progressBar.style.width = "0%"
            this.progressBar.classList.remove("power-mode", "rhythm-surge", "boost-mode")
        }

        if (this.progressGlow) {
            this.progressGlow.style.width = "0%"
            this.progressGlow.style.opacity = 0
            this.progressGlow.classList.remove("boost-mode", "rhythm-surge")
        }

        if (this.danceSpeedDisplay) {
            this.danceSpeedDisplay.textContent = this.baseSpeed.toFixed(1) + "x"
        }

        if (this.musicSpeedDisplay) {
            this.musicSpeedDisplay.textContent = this.baseSpeed.toFixed(1) + "x"
        }

        if (this.frequencyDisplay) {
            this.frequencyDisplay.textContent = "0 次/秒"
        }

        const clapCounter = document.getElementById("clapCounterDisplay")
        if (clapCounter) {
            clapCounter.textContent = "0"
        }

        if (this.intensityLevel) {
            this.intensityLevel.textContent = "基础"
            this.intensityLevel.style.background = "linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))"
            this.intensityLevel.style.color = "#101327"
        }

        if (this.progressBarBg) {
            this.progressBarBg.classList.remove("power-mode", "rhythm-surge", "boost-mode")
        }

        if (this.emotionBadge) {
            this.emotionBadge.textContent = "🔥 热度待命"
            this.emotionBadge.classList.remove("level-rise", "level-burn", "level-explode")
        }

        if (this.motivationText) {
            this.motivationText.textContent = "🎉 开始鼓掌吧！"
        }

        this.deactivateFullGlow()
        this.deactivateHighIntensity()
    }
}

export { IntensityVisualizer }
