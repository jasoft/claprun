/**
 * Phaser.js 游戏模块 - 小人舞蹈游戏
 */

import { GAME_CONFIG, SPEED_CONFIG } from "./constants.js"

class DanceGame {
    constructor(containerId = "gameContainer") {
        this.config = {
            type: Phaser.CANVAS,
            width: 800,
            height: 600,
            parent: containerId,
            render: {
                canvas: {
                    willReadFrequently: true,
                },
            },
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 300 },
                    debug: false,
                },
            },
            scene: {
                preload: () => this.preload(),
                create: () => this.create(),
                update: () => this.update(),
            },
        }

        this.game = null
        this.dancer = null
        this.danceSpeed = 1.0
        this.musicSpeed = 1.0
        this.isPlaying = false

        // 舞蹈动画状态
        this.danceState = "idle"
        this.danceTimer = 0
        this.danceIntensity = 0 // 0-1，表示舞蹈强度

        // 音乐相关
        this.music = null
        this.audioContext = null
        this.analyser = null
        this.dataArray = null
        this.musicLoopTimer = null
        this.speedDecayTimer = null
    }

    /**
     * 初始化游戏
     */
    init() {
        this.game = new Phaser.Game(this.config)
    }

    /**
     * 预加载资源
     */
    preload() {
        // 这里可以加载图片、音乐等资源
        // 为了演示，我们使用 Phaser 的图形绘制功能
    }

    /**
     * 创建游戏场景
     */
    create() {
        const scene = this.game.scene.scenes[0]

        // 创建背景
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false })
        graphics.fillStyle(0x667eea, 1)
        graphics.fillRect(0, 0, 800, 600)
        graphics.generateTexture("background", 800, 600)
        graphics.destroy()

        scene.add.image(400, 300, "background")

        // 创建舞者（简单的小人）
        this.createDancer(scene)

        // 创建音乐可视化
        this.createVisualization(scene)

        // 初始化音频上下文
        this.initAudioContext()
    }

    /**
     * 创建舞者角色
     */
    createDancer(scene) {
        // 使用 Phaser 的图形绘制创建简单的小人
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false })

        // 绘制小人（头、身体、四肢）
        graphics.fillStyle(0xffdbac, 1) // 肤色
        graphics.fillCircle(400, 150, 30) // 头
        graphics.fillRect(385, 185, 30, 60) // 身体
        graphics.fillRect(370, 245, 15, 80) // 左腿
        graphics.fillRect(415, 245, 15, 80) // 右腿
        graphics.fillRect(360, 190, 15, 50) // 左臂
        graphics.fillRect(425, 190, 15, 50) // 右臂

        graphics.generateTexture("dancer", 800, 400)
        graphics.destroy()

        this.dancer = scene.add.sprite(400, 300, "dancer")
        this.dancer.setScale(1)
    }

    /**
     * 创建音乐可视化
     */
    createVisualization(scene) {
        // 创建音乐可视化条
        this.visualBars = []
        const barCount = 32
        const barWidth = 800 / barCount

        for (let i = 0; i < barCount; i++) {
            const bar = scene.add.rectangle(i * barWidth + barWidth / 2, 550, barWidth - 2, 10, 0x764ba2)
            // 存储初始高度用于动画
            bar.initialHeight = 10
            this.visualBars.push(bar)
        }
        console.log("[Game] 音乐可视化条已创建:", barCount, "个")
    }

    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            this.analyser = this.audioContext.createAnalyser()
            this.analyser.fftSize = 256
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
        }
    }

    /**
     * 更新游戏
     */
    update() {
        if (!this.isPlaying) return

        // 更新舞蹈动画
        this.updateDanceAnimation()

        // 更新可视化
        this.updateVisualization()
    }

    /**
     * 更新舞蹈动画
     */
    updateDanceAnimation() {
        this.danceTimer += 1

        // 根据舞蹈强度调整动画
        const scale = 1 + this.danceIntensity * 0.3
        const rotation = Math.sin(this.danceTimer * 0.05 * this.danceSpeed) * this.danceIntensity * 0.5

        this.dancer.setScale(scale)
        this.dancer.setRotation(rotation)

        // 逐渐降低舞蹈强度，但保持最小值 0.15（保持缓慢跳舞）
        const minIntensity = 0.15
        this.danceIntensity = Math.max(minIntensity, this.danceIntensity - 0.005)
    }

    /**
     * 更新可视化
     */
    updateVisualization() {
        if (!this.visualBars) return

        // 根据舞蹈强度和速度生成可视化条高度
        for (let i = 0; i < this.visualBars.length; i++) {
            // 基于舞蹈强度、速度和时间的组合
            const baseHeight = Math.sin((this.danceTimer + i) * 0.1 * this.danceSpeed) * 50 + 50
            const height = baseHeight * this.danceIntensity * this.musicSpeed
            const newHeight = Math.max(10, Math.min(150, height))
            // 使用 setScale 来改变高度
            const scaleY = newHeight / this.visualBars[i].initialHeight
            this.visualBars[i].setScale(1, scaleY)
        }
    }

    /**
     * 处理拍巴掌事件
     */
    onClap(clapData) {
        // 增加舞蹈强度（基于置信度，80% 以上才触发）
        // 置信度 0.8-1.0 映射到 0.3-1.0 的舞蹈强度
        const confidenceBoost = Math.max(0.3, clapData.confidence * 1.2)
        this.danceIntensity = Math.min(1, this.danceIntensity + confidenceBoost)

        // 增加舞蹈速度（基于拍巴掌的频率）
        this.danceSpeed = Math.min(3, this.danceSpeed + 0.2)

        // 增加音乐速度
        const oldMusicSpeed = this.musicSpeed
        this.musicSpeed = Math.min(2, this.musicSpeed + 0.1)

        // 如果音乐速度改变，重新启动背景音乐循环
        if (Math.abs(this.musicSpeed - oldMusicSpeed) > 0.01) {
            this.startBackgroundMusic()
        }

        // 重置速度衰减
        this.resetSpeedDecay()

        // 仅在高置信度时打印日志，减少控制台输出延迟
        if (clapData.confidence > 0.85) {
            console.log("[Game] 拍巴掌事件:", {
                confidence: (clapData.confidence * 100).toFixed(1) + "%",
                danceIntensity: this.danceIntensity.toFixed(2),
                danceSpeed: this.danceSpeed.toFixed(2),
                musicSpeed: this.musicSpeed.toFixed(2),
            })
        }
    }

    /**
     * 重置速度衰减
     */
    resetSpeedDecay() {
        // 舞蹈速度和音乐速度逐渐恢复到正常
        if (this.speedDecayTimer) {
            clearInterval(this.speedDecayTimer)
        }

        this.speedDecayTimer = setInterval(() => {
            this.danceSpeed = Math.max(1, this.danceSpeed - 0.01)
            this.musicSpeed = Math.max(1, this.musicSpeed - 0.005)

            if (this.danceSpeed <= 1 && this.musicSpeed <= 1) {
                clearInterval(this.speedDecayTimer)
            }
        }, 100)
    }

    /**
     * 开始游戏
     */
    start() {
        this.isPlaying = true
        this.danceSpeed = 1.0
        this.musicSpeed = 1.0
        this.danceIntensity = 0.2 // 初始舞蹈强度，使小人缓慢跳舞
        this.danceTimer = 0

        // 启动背景音乐循环
        this.startBackgroundMusic()

        console.log("[Game] 游戏开始，初始舞蹈强度:", this.danceIntensity)
    }

    /**
     * 停止游戏
     */
    stop() {
        this.isPlaying = false
        this.danceIntensity = 0
        this.danceSpeed = 1.0
        this.musicSpeed = 1.0

        if (this.speedDecayTimer) {
            clearInterval(this.speedDecayTimer)
        }

        if (this.musicLoopTimer) {
            clearInterval(this.musicLoopTimer)
        }
    }

    /**
     * 启动背景音乐循环
     */
    startBackgroundMusic() {
        // 清除旧的音乐循环
        if (this.musicLoopTimer) {
            clearInterval(this.musicLoopTimer)
        }

        // 根据音乐速度计算循环间隔
        const loopInterval = 1200 / this.musicSpeed // 1.2 秒的基础间隔

        this.musicLoopTimer = setInterval(() => {
            if (this.isPlaying) {
                this.playBackgroundMusic()
            }
        }, loopInterval)

        // 立即播放第一次
        this.playBackgroundMusic()

        console.log("[Game] 背景音乐已启动，循环间隔:", loopInterval.toFixed(0), "ms")
    }

    /**
     * 播放背景音乐
     */
    playBackgroundMusic() {
        // 已禁用合成音效，使用 MP3 播放器代替
        // 如果需要恢复，取消下面代码的注释
        /*
        try {
            // 使用单一的 audioContext 实例以减少延迟
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            }

            const audioContext = this.audioContext

            // 根据音乐速度调整音符时长
            const noteDuration = 0.3 / this.musicSpeed

            // 播放一个简单的音乐序列 (C major scale)
            const notes = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5

            notes.forEach((frequency, index) => {
                const oscillator = audioContext.createOscillator()
                const gainNode = audioContext.createGain()

                oscillator.connect(gainNode)
                gainNode.connect(audioContext.destination)

                oscillator.frequency.value = frequency
                oscillator.type = "sine"

                const startTime = audioContext.currentTime + index * noteDuration * 0.25
                const endTime = startTime + noteDuration * 0.8

                gainNode.gain.setValueAtTime(0.1, startTime)
                gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)

                oscillator.start(startTime)
                oscillator.stop(endTime)
            })
        } catch (error) {
            // 静默处理错误以减少延迟
        }
        */
    }

    /**
     * 获取舞蹈速度
     */
    getDanceSpeed() {
        return this.danceSpeed
    }

    /**
     * 获取音乐速度
     */
    getMusicSpeed() {
        return this.musicSpeed
    }

    /**
     * 从烈度计算器设置速度
     * @param {number} speed - 新的速度（1.0 - 10.0）
     */
    setSpeedFromIntensity(speed) {
        // 跳舞速度：1.0 - 10.0
        this.danceSpeed = speed

        // 音乐速度映射：跳舞速度 1.0-5.0 映射到音乐速度 1.0-2.0
        // 跳舞速度 > 5.0 时，音乐速度保持在 2.0
        // 公式：musicSpeed = 1.0 + (danceSpeed - 1.0) / 4.0
        if (speed <= 5.0) {
            this.musicSpeed = 1.0 + (speed - 1.0) / 4.0
        } else {
            this.musicSpeed = 2.0
        }

        // 根据速度调整舞蹈强度
        const speedRange = 10.0 - 1.0
        const speedOffset = speed - 1.0
        this.danceIntensity = 0.2 + (speedOffset / speedRange) * 0.8 // 0.2 - 1.0
    }

    /**
     * 销毁游戏
     */
    destroy() {
        if (this.game) {
            this.game.destroy(true)
            this.game = null
        }

        if (this.speedDecayTimer) {
            clearInterval(this.speedDecayTimer)
        }
    }
}

export { DanceGame }
