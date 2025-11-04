/**
 * 主程序 - 整合音频识别和游戏
 */

import { AudioRecognizer } from "./audio-recognizer.js"
import { DanceGame } from "./game.js"
import { ClapIntensity } from "./clap-intensity.js"
import { MP3Player } from "./mp3-player.js"
import { IntensityVisualizer } from "./intensity-visualizer.js"
import CheerManager from "./cheer-manager.js"
import { SPEED_CONFIG } from "./constants.js"

let audioRecognizer = null
let danceGame = null
let clapIntensity = null
let mp3Player = null
let intensityVisualizer = null
let cheerManager = null
let clapCount = 0
let isInitialized = false

/**
 * 加载模型（不初始化 AudioContext）
 */
async function loadModel() {
    try {
        console.log("[Main] 开始加载模型...")
        updateStatus("正在加载模型...", "loading")

        // 创建音频识别器
        audioRecognizer = new AudioRecognizer({
            modelURL: "https://teachablemachine.withgoogle.com/models/7xwSK62zg/",
            clapThreshold: 0.8,
            clapLabel: "clap",
            clapCooldown: 200,

            onClapDetected: (clapData) => {
                console.log("[Main] 收到拍巴掌事件")
                handleClap(clapData)
            },

            onStatusChange: (status) => {
                console.log("[Main] 状态变化:", status.message)
                updateStatus(status.message, status.type)
            },

            onError: (error) => {
                console.error("[Main] 音频识别错误:", error)
                updateStatus("错误: " + error.message, "error")
            },
        })

        console.log("[Main] 音频识别器已创建，开始初始化模型...")

        // 初始化模型
        const modelLoaded = await audioRecognizer.init()
        if (!modelLoaded) {
            throw new Error("模型加载失败")
        }

        console.log("[Main] 模型加载成功！")
        updateStatus("✅ 模型加载成功！点击【开始游戏】按钮开始", "ready")

        // 启用开始按钮
        const startBtn = document.getElementById("startBtn")
        if (startBtn) {
            startBtn.disabled = false
            startBtn.onclick = initAndStartGame
        }
    } catch (error) {
        console.error("[Main] 模型加载失败:", error)
        updateStatus("模型加载失败: " + error.message, "error")
    }
}

/**
 * 初始化游戏组件（在用户点击后）
 */
async function initAndStartGame() {
    if (isInitialized) {
        // 已经初始化过，直接启动游戏
        startGame()
        return
    }

    try {
        console.log("[Main] 用户点击开始，初始化游戏组件...")
        updateStatus("正在初始化游戏...", "loading")

        // 禁用开始按钮
        const startBtn = document.getElementById("startBtn")
        if (startBtn) {
            startBtn.disabled = true
        }

        // 创建游戏
        console.log("[Main] 创建游戏...")
        danceGame = new DanceGame("gameContainer")
        danceGame.init()

        console.log("[Main] 初始化鼓掌烈度计算...")

        // 创建鼓掌烈度计算器
        clapIntensity = new ClapIntensity({
            baseSpeed: SPEED_CONFIG.BASE_SPEED,
            maxSpeed: SPEED_CONFIG.MAX_SPEED,
            minSpeed: SPEED_CONFIG.MIN_SPEED,
            onSpeedChange: (data) => {
                // 更新游戏速度
                if (danceGame) {
                    danceGame.setSpeedFromIntensity(data.speed)
                }
                // 更新 MP3 播放速度
                if (mp3Player) {
                    mp3Player.setSpeed(data.speed)
                }
                // 更新欢呼声
                if (cheerManager) {
                    cheerManager.updateSpeed(data.speed)
                }
                // 更新可视化
                if (intensityVisualizer) {
                    intensityVisualizer.update(data)
                }
            },
        })

        console.log("[Main] 初始化 MP3 播放器...")

        // 创建 MP3 播放器（音乐速度最大 2 倍）
        // 在用户交互后创建 AudioContext
        mp3Player = new MP3Player({
            maxSpeed: 2.0,
        })

        const playerInitialized = await mp3Player.init()
        if (!playerInitialized) {
            console.warn("[Main] MP3 播放器初始化失败，将使用合成音乐")
        }

        console.log("[Main] 初始化烈度可视化...")

        // 创建烈度可视化
        intensityVisualizer = new IntensityVisualizer({
            containerId: "intensityContainer",
            baseSpeed: SPEED_CONFIG.BASE_SPEED,
            maxSpeed: SPEED_CONFIG.MAX_SPEED,
            minSpeed: SPEED_CONFIG.MIN_SPEED,
        })

        const visualizerInitialized = intensityVisualizer.init()
        if (!visualizerInitialized) {
            console.warn("[Main] 烈度可视化初始化失败")
        }

        console.log("[Main] 初始化欢呼声管理器...")

        // 创建欢呼声管理器
        cheerManager = new CheerManager()
        const cheerInitialized = cheerManager.init()
        if (!cheerInitialized) {
            console.warn("[Main] 欢呼声管理器初始化失败")
        }

        console.log("[Main] 游戏组件初始化完成！")
        isInitialized = true

        // 启动游戏
        startGame()
    } catch (error) {
        console.error("[Main] 初始化失败:", error)
        updateStatus("初始化失败: " + error.message, "error")

        // 重新启用开始按钮
        const startBtn = document.getElementById("startBtn")
        if (startBtn) {
            startBtn.disabled = false
        }
    }
}

/**
 * 开始游戏
 */
async function startGame() {
    try {
        console.log("[Main] 开始游戏...")

        if (!audioRecognizer || !danceGame) {
            console.error("[Main] 应用未初始化")
            updateStatus("应用未初始化", "error")
            return
        }

        // 重置计数
        clapCount = 0
        updateStats()

        console.log("[Main] 启动游戏...")

        // 启动游戏
        danceGame.start()

        // 重置鼓掌烈度
        if (clapIntensity) {
            clapIntensity.reset()
        }

        // 重置烈度可视化
        if (intensityVisualizer) {
            intensityVisualizer.reset()
        }

        // 启动 MP3 播放
        if (mp3Player) {
            mp3Player.play()
        }

        // 启动音频监听
        console.log("[Main] 启动音频监听...")
        const listening = audioRecognizer.startListening()
        if (!listening) {
            throw new Error("无法启动音频监听")
        }

        console.log("[Main] 游戏已启动，等待拍巴掌...")
        updateStatus("🎉 游戏已开始！尽情拍巴掌吧！", "ready")

        // 更新按钮状态
        const startBtn = document.getElementById("startBtn")
        if (startBtn) {
            startBtn.textContent = "🔄 重新开始"
            startBtn.disabled = false
        }
    } catch (error) {
        console.error("[Main] 启动游戏失败:", error)
        updateStatus("启动游戏失败: " + error.message, "error")
    }
}

/**
 * 停止游戏
 */
function stopGame() {
    try {
        if (audioRecognizer) {
            audioRecognizer.stopListening()
        }

        if (danceGame) {
            danceGame.stop()
        }

        if (mp3Player) {
            mp3Player.stop()
        }

        if (cheerManager) {
            cheerManager.stopAllCheers()
        }

        if (clapIntensity) {
            clapIntensity.reset()
        }

        if (intensityVisualizer) {
            intensityVisualizer.reset()
        }

        // 更新按钮状态
        document.getElementById("startBtn").disabled = false
        document.getElementById("stopBtn").disabled = true

        updateStatus("游戏已停止", "ready")
    } catch (error) {
        console.error("停止游戏失败:", error)
        updateStatus("停止游戏失败: " + error.message, "error")
    }
}

/**
 * 处理拍巴掌事件
 */
function handleClap(clapData) {
    clapCount++
    console.log("[Main] 拍巴掌计数:", clapCount, "置信度:", clapData.confidence.toFixed(2))

    // 记录鼓掌烈度
    if (clapIntensity) {
        clapIntensity.recordClap(clapData)
    }

    // 通知游戏处理拍巴掌（保留用于舞蹈动画）
    if (danceGame) {
        danceGame.onClap(clapData)
    }

    // 更新统计信息
    updateStats()

    // 播放反馈效果
    playFeedback()
}

/**
 * 更新统计信息
 */
function updateStats() {
    const clapCounterDisplay = document.getElementById("clapCounterDisplay")

    if (clapCounterDisplay) {
        clapCounterDisplay.textContent = clapCount
    }
}

/**
 * 更新状态显示
 */
function updateStatus(message, type = "ready") {
    const statusEl = document.getElementById("status")
    if (statusEl) {
        statusEl.textContent = message
        statusEl.className = "status " + type
    }
}

/**
 * 播放反馈效果和音乐
 */
function playFeedback() {
    // 已禁用合成音效反馈，使用 MP3 播放器代替
    // 如果需要恢复，取消下面代码的注释
    /*
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()

        // 获取当前的音乐速度
        const musicSpeed = danceGame ? danceGame.getMusicSpeed() : 1.0

        // 根据音乐速度调整音符时长
        const noteDuration = 0.2 / musicSpeed

        // 播放一个简单的音乐序列
        const notes = [523.25, 659.25, 783.99] // C5, E5, G5 (C major chord)

        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = frequency
            oscillator.type = "sine"

            const startTime = audioContext.currentTime + index * noteDuration * 0.3
            const endTime = startTime + noteDuration

            gainNode.gain.setValueAtTime(0.2, startTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)

            oscillator.start(startTime)
            oscillator.stop(endTime)
        })

        console.log("[Main] 播放音乐，速度倍数:", musicSpeed.toFixed(2))
    } catch (error) {
        console.log("[Main] 无法播放音效:", error)
    }
    */
}

/**
 * 页面加载完成后加载模型
 */
document.addEventListener("DOMContentLoaded", () => {
    loadModel()
})

/**
 * 页面卸载时清理资源
 */
window.addEventListener("beforeunload", () => {
    if (audioRecognizer) {
        audioRecognizer.destroy()
    }

    if (danceGame) {
        danceGame.destroy()
    }

    if (mp3Player) {
        mp3Player.destroy()
    }

    if (clapIntensity) {
        clapIntensity.destroy()
    }
})
