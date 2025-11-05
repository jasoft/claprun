/**
 * Phaser.js 游戏模块 - 小人舞蹈游戏
 */

import { SPEED_CONFIG } from "./constants.js"

class DanceGame {
    constructor(containerId = "gameContainer") {
        this.config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: containerId,
            backgroundColor: "#0a1026",
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            render: {
                pixelArt: false,
                antialias: true,
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
        this.scene = null
        this.dancers = []
        this.activeDancerCount = 1
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
        this.background = null
        this.floorGlow = null
        this.viewportWidth = window.innerWidth
        this.viewportHeight = window.innerHeight
        this.resizeHandler = null
        this.progressRatio = 0
        this.celebrationParticles = null
        this.celebrationEmitter = null
        this.celebrationActive = false
        this.shineOverlay = null
        this.shineFx = null
        this.shineAlphaTween = null
        this.shineScanTween = null
        this.shineScanBounds = { left: 0, right: 0, y: 0 }
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
        const scene = this.game && this.game.scene && this.game.scene.scenes && this.game.scene.scenes[0]
        if (!scene) {
            return
        }

        if (!scene.textures.exists("stage-bg")) {
            scene.load.image("stage-bg", "images/bg.png")
        }
    }

    /**
     * 创建游戏场景
     */
    create() {
        const scene = this.game.scene.scenes[0]
        this.scene = scene
        scene.cameras.main.setBackgroundColor("#080d1d")

        // 创建舞者和可视化
        this.createDancers(scene)
        this.createVisualization(scene)
        this.createCelebration(scene)
        this.createShineEffect(scene)

        // 初始化音频上下文
        this.initAudioContext()

        // 初始布局
        this.applyLayout(scene.scale.width, scene.scale.height)

        // 监听尺寸变化
        this.resizeHandler = (gameSize) => {
            this.applyLayout(gameSize.width, gameSize.height)
        }
        scene.scale.on("resize", this.resizeHandler, this)
    }

    /**
     * 创建舞者角色
     */
    createDancers(scene) {
        this.scene = scene

        const palettes = [
            { body: 0xf9858b, limb: 0xf06177, leg: 0x2f3e9e },
            { body: 0x80b7ff, limb: 0x4878d1, leg: 0x1f1535 },
            { body: 0xffd071, limb: 0xffa64f, leg: 0x2c5f2d },
        ]

        const width = this.viewportWidth
        const height = this.viewportHeight
        const centerX = width / 2
        const spacing = Math.min(width * 0.16, 220)
        const baseY = height * 0.6
        const baseScale = Phaser.Math.Clamp(width / 1400, 0.9, 1.4)

        this.dancers = [centerX - spacing, centerX, centerX + spacing].map((x, index) => {
            const dancer = this.buildDancer(scene, x, baseY, palettes[index % palettes.length], index)
            dancer.container.visible = index === 1
            dancer.isActive = index === 1
            dancer.defaultScale = baseScale
            dancer.baseScale = baseScale
            dancer.container.setScale(baseScale)
            return dancer
        })

        this.activeDancerCount = 1
    }

    /**
     * 构建单个舞者
     */
    buildDancer(scene, x, y, palette, index) {
        const container = scene.add.container(x, y)

        const head = scene.add.circle(0, -130, 26, 0xffe7d4)
        const body = scene.add.rectangle(0, -110, 34, 110, palette.body)
        body.setOrigin(0.5, 0)

        const leftArm = scene.add.rectangle(-22, -100, 16, 90, palette.limb)
        leftArm.setOrigin(0.5, 0)
        const rightArm = scene.add.rectangle(22, -100, 16, 90, palette.limb)
        rightArm.setOrigin(0.5, 0)

        const leftLeg = scene.add.rectangle(-12, 0, 18, 110, palette.leg)
        leftLeg.setOrigin(0.5, 0)
        const rightLeg = scene.add.rectangle(12, 0, 18, 110, palette.leg)
        rightLeg.setOrigin(0.5, 0)

        const shadow = scene.add.ellipse(0, 190, 120, 26, 0x0b0512, 0.3)

        // 设置初始角度，便于后续在基础上叠加动画
        leftArm.baseRotation = Phaser.Math.DegToRad(-25)
        rightArm.baseRotation = Phaser.Math.DegToRad(25)
        leftLeg.baseRotation = Phaser.Math.DegToRad(10)
        rightLeg.baseRotation = Phaser.Math.DegToRad(-10)

        leftArm.setRotation(leftArm.baseRotation)
        rightArm.setRotation(rightArm.baseRotation)
        leftLeg.setRotation(leftLeg.baseRotation)
        rightLeg.setRotation(rightLeg.baseRotation)

        leftArm.baseY = leftArm.y
        rightArm.baseY = rightArm.y
        head.baseY = head.y
        body.baseY = body.y

        container.add([shadow, leftLeg, rightLeg, body, leftArm, rightArm, head])
        container.setDepth(10 + index)

        return {
            container,
            parts: {
                head,
                body,
                leftArm,
                rightArm,
                leftLeg,
                rightLeg,
                shadow,
            },
            baseX: x,
            baseY: y,
            baseScale: 1,
            defaultScale: 1,
            phaseOffset: index * Math.PI * 0.5,
            isActive: true,
        }
    }

    /**
     * 创建音乐可视化
     */
    createVisualization(scene) {
        this.visualBars = []
        this.visualBarCount = 36

        for (let i = 0; i < this.visualBarCount; i++) {
            const bar = scene.add.rectangle(0, 0, 10, 18, 0x6f7bff, 0.85)
            bar.setOrigin(0.5, 1)
            bar.initialHeight = 18
            bar.baseWidth = 10
            bar.setDepth(-1)
            this.visualBars.push(bar)
        }
        console.log("[Game] 音乐可视化条已创建:", this.visualBarCount, "个")
    }

    createCelebration(scene) {
        if (!scene) return

        if (!scene.textures.exists("confetti-pixel")) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false })
            graphics.fillStyle(0xffffff, 1)
            graphics.fillCircle(4, 4, 4)
            graphics.generateTexture("confetti-pixel", 8, 8)
            graphics.destroy()
        }

        if (this.celebrationParticles) {
            this.celebrationParticles.destroy()
            this.celebrationParticles = null
            this.celebrationEmitter = null
        }

        this.celebrationParticles = scene.add.particles("confetti-pixel").setDepth(-2)
        this.celebrationEmitter = this.celebrationParticles.createEmitter({
            on: false,
            speedX: { min: -180, max: 180 },
            speedY: { min: -80, max: 220 },
            angle: { min: -15, max: 195 },
            gravityY: 230,
            lifespan: { min: 2600, max: 3400 },
            quantity: 32,
            frequency: 70,
            alpha: { start: 1, end: 0 },
            scale: { start: 6.4, end: 1.2 },
            rotate: { min: -260, max: 260 },
            tint: [
                0xffffff,
                0xfff3c4,
                0xffe47d,
                0xffc2f9,
                0x9fd8ff,
                0xb8ff9e,
                0xff9b85,
                0xccabff,
            ],
            blendMode: "SCREEN",
            emitZone: { type: "random", source: new Phaser.Geom.Rectangle(-scene.scale.width * 0.6, -scene.scale.height * 0.2, scene.scale.width * 1.2, scene.scale.height * 1.4) },
        })

        this.celebrationEmitter.stop()
        this.celebrationActive = false
    }

    createShineEffect(scene) {
        if (!scene) return

        const textureKey = "celebration-shine"
        const width = scene.scale.width
        const height = scene.scale.height

        if (!scene.textures.exists(textureKey)) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false })
            const gradientHeight = 512
            graphics.fillStyle(0xffffff, 0.9)
            graphics.fillRect(0, 0, 64, gradientHeight)
            graphics.generateTexture(textureKey, 64, gradientHeight)
            graphics.destroy()
        }

        const beamWidth = Math.max(width * 0.32, 220)
        const beamHeight = height * 1.35
        this.shineScanBounds = {
            left: width * 0.25,
            right: width * 0.75,
            y: height * 0.46,
        }

        this.shineOverlay = scene.add.image(this.shineScanBounds.left, this.shineScanBounds.y, textureKey)
        this.shineOverlay.setDepth(80)
        this.shineOverlay.setBlendMode(Phaser.BlendModes.ADD)
        this.shineOverlay.setVisible(false)
        this.shineOverlay.setAlpha(0)
        this.shineOverlay.setScrollFactor(0)
        this.shineOverlay.setDisplaySize(beamWidth, beamHeight)
        this.shineOverlay.setAngle(-12)

        if (this.shineOverlay.preFX) {
            this.shineFx = this.shineOverlay.preFX.addShine(0.55, 0.35, 3.5, false)
            this.shineFx.speed = 1.1
            this.shineFx.lineWidth = 0.28
            this.shineFx.gradient = 4.5
            this.shineFx.setActive(false)
        } else {
            this.shineFx = null
        }
    }

    applyLayout(width, height) {
        if (!width || !height) {
            return
        }

        this.viewportWidth = width
        this.viewportHeight = height

        if (!this.scene) return

        if (this.background) {
            this.background.destroy()
            this.background = null
        }

        if (this.scene.textures.exists("stage-bg")) {
            this.background = this.scene.add.image(width / 2, height / 2, "stage-bg").setDepth(-40)
            const scaleX = width / this.background.width
            const scaleY = height / this.background.height
            const scale = Math.max(scaleX, scaleY)
            this.background.setScale(scale)
        } else {
            if (this.scene.textures.exists("stage-fallback")) {
                this.scene.textures.remove("stage-fallback")
            }
        const graphics = this.scene.add.graphics({ x: 0, y: 0 })
        graphics.fillGradientStyle(0x1a2253, 0x252f6f, 0x0c1129, 0x131a38, 1, 1, 1, 1)
        graphics.fillRect(0, 0, width, height)
        graphics.generateTexture("stage-fallback", width, height)
        graphics.destroy()
        this.background = this.scene.add.image(width / 2, height / 2, "stage-fallback").setDepth(-40)
        }

        const floorWidth = Math.max(width * 0.55, 420)
        const floorHeight = Math.max(height * 0.18, 160)
        const floorY = height * 0.78
        if (!this.floorGlow) {
            this.floorGlow = this.scene.add.ellipse(width / 2, floorY, floorWidth, floorHeight, 0x4f5dff, 0.18)
            this.floorGlow.setDepth(-5)
        } else {
            this.floorGlow.setPosition(width / 2, floorY)
        }
        if (this.floorGlow) {
            this.floorGlow.setDisplaySize(floorWidth, floorHeight)
        }

        const centerX = width / 2
        const spacing = Math.min(width * 0.16, 220)
        const baseY = height * 0.6
        const baseScale = Phaser.Math.Clamp(width / 1400, 0.9, 1.4)

        this.dancers.forEach((dancer, index) => {
            const offset = (index - 1) * spacing
            dancer.baseX = centerX + offset
            dancer.baseY = baseY
            dancer.defaultScale = baseScale
            dancer.baseScale = baseScale
            dancer.container.setPosition(dancer.baseX, dancer.baseY)
            dancer.container.setScale(dancer.baseScale)

            if (dancer.parts && dancer.parts.shadow) {
                dancer.parts.shadow.setDisplaySize(floorWidth * 0.25, Math.max(floorHeight * 0.25, 40))
            }
        })

        if (this.visualBars && this.visualBars.length) {
            const usableWidth = width * 0.75
            const startX = (width - usableWidth) / 2
            const barSpacing = usableWidth / this.visualBars.length
            const baseHeight = Math.max(16, height * 0.08)

            this.visualBars.forEach((bar, index) => {
                bar.baseWidth = Math.max(10, barSpacing * 0.45)
                bar.initialHeight = baseHeight
                bar.setPosition(startX + barSpacing * index + barSpacing / 2, height * 0.94)
                bar.setDisplaySize(bar.baseWidth, bar.initialHeight)
            })
        }

        if (this.celebrationEmitter) {
            const zone = new Phaser.Geom.Rectangle(-width * 0.6, -height * 0.2, width * 1.2, height * 1.4)
            this.celebrationEmitter.setPosition(centerX, height * 0.08)
            this.celebrationEmitter.setEmitZone({ type: "random", source: zone })
        }

        if (this.shineOverlay) {
            const beamWidth = Math.max(width * 0.32, 220)
            const beamHeight = height * 1.35
            this.shineScanBounds = {
                left: width * 0.25,
                right: width * 0.75,
                y: height * 0.46,
            }

            this.shineOverlay.setDisplaySize(beamWidth, beamHeight)
            this.shineOverlay.setPosition(this.shineScanBounds.left, this.shineScanBounds.y)
            this.shineOverlay.setAngle(-12)

            if (this.shineScanTween) {
                this.stopShineScanTween()
                if (this.celebrationActive) {
                    this.startShineScanTween()
                }
            }
        }

        this.setActiveDancerCount(this.activeDancerCount)
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
        if (!this.dancers.length) return

        this.danceTimer += this.danceSpeed * 0.6
        const swayFrequency = 0.025 * this.danceSpeed
        const minIntensity = 0.12

        this.dancers.forEach((dancer, index) => {
            if (!dancer.isActive || !dancer.container.visible) {
                return
            }

            const time = (this.danceTimer + index * 25) * swayFrequency + dancer.phaseOffset
            const wave = Math.sin(time)
            const waveSecondary = Math.sin(time * 0.8 + Math.PI / 3)
            const bounce = Math.abs(Math.sin(time * 0.55)) * (0.8 + 0.4 * this.danceIntensity)
            const liftPhase = Math.sin(time * 0.5 + dancer.phaseOffset * 0.5)
            const liftAmount = Phaser.Math.Clamp((liftPhase + 1) / 2 * this.danceIntensity, 0, 1)

            const armSwing = Phaser.Math.DegToRad(30 + 20 * this.danceIntensity) * waveSecondary
            const armLift = Phaser.Math.DegToRad(110) * liftAmount
            const armClapPulse = Phaser.Math.DegToRad(10) * Math.sin(time * 1.6)
            const legSwing = Phaser.Math.DegToRad(32 + 12 * this.danceIntensity) * wave * (0.6 + liftAmount * 0.4)
            const bodyLean = Phaser.Math.DegToRad(8) * Math.sin(time * 0.6) * this.danceIntensity
            const torsoRise = Phaser.Math.Linear(0, -24, liftAmount) - bounce * 10

            dancer.parts.leftArm.setRotation(
                dancer.parts.leftArm.baseRotation - armLift + armSwing + armClapPulse
            )
            dancer.parts.rightArm.setRotation(
                dancer.parts.rightArm.baseRotation + armLift - armSwing + armClapPulse
            )
            dancer.parts.leftArm.y = dancer.parts.leftArm.baseY + Phaser.Math.Linear(0, -58, liftAmount)
            dancer.parts.rightArm.y = dancer.parts.rightArm.baseY + Phaser.Math.Linear(0, -58, liftAmount)

            dancer.parts.leftLeg.setRotation(dancer.parts.leftLeg.baseRotation - legSwing)
            dancer.parts.rightLeg.setRotation(dancer.parts.rightLeg.baseRotation + legSwing)
            dancer.parts.body.setRotation(bodyLean)
            dancer.parts.head.setRotation(bodyLean * 0.65)
            dancer.parts.body.y = dancer.parts.body.baseY + torsoRise
            dancer.parts.head.y = dancer.parts.head.baseY + torsoRise * 0.7

            dancer.container.setRotation(Math.sin(time * 0.4) * Phaser.Math.DegToRad(5) * this.danceIntensity)
            const scalePulse = Math.sin(time * 0.9 + Math.PI / 4)
            dancer.container.setScale(
                dancer.baseScale * (1 + 0.16 * this.danceIntensity * scalePulse - 0.05 * liftAmount)
            )
            const hopHeight = bounce * 24 + liftAmount * 18
            dancer.container.y = dancer.baseY - hopHeight - this.danceIntensity * 4
            const sway = Math.sin(time * 0.4 + dancer.phaseOffset) * this.danceIntensity * 12
            dancer.container.x = dancer.baseX + sway

            dancer.parts.shadow.setScale(
                1 + 0.24 * this.danceIntensity * (1 - Math.abs(Math.sin(time))),
                1 + 0.12 * this.danceIntensity * Math.abs(Math.sin(time))
            )
        })

        this.danceIntensity = Math.max(minIntensity, this.danceIntensity - 0.004)
    }

    /**
     * 根据热度切换舞者数量
     */
    updateCrowdMode(progressRatio = 0) {
        if (!this.dancers.length) return

        this.progressRatio = progressRatio
        const desiredCount = progressRatio > 0.5 ? 3 : 1

        if (desiredCount !== this.activeDancerCount) {
            this.setActiveDancerCount(desiredCount)
        }
    }

    /**
     * 设置当前舞者数量
     */
    setActiveDancerCount(count) {
        if (!this.dancers.length) return

        this.activeDancerCount = count

        this.dancers.forEach((dancer, index) => {
            const shouldShow = count === 3 ? true : index === 1

            if (shouldShow) {
                const scaleFactor = count === 3 ? (index === 1 ? 1 : 0.88) : 1
                dancer.baseScale = dancer.defaultScale * scaleFactor

                if (!dancer.isActive) {
                    dancer.parts.leftArm.setRotation(dancer.parts.leftArm.baseRotation)
                    dancer.parts.rightArm.setRotation(dancer.parts.rightArm.baseRotation)
                    dancer.parts.leftLeg.setRotation(dancer.parts.leftLeg.baseRotation)
                    dancer.parts.rightLeg.setRotation(dancer.parts.rightLeg.baseRotation)
                    dancer.parts.leftArm.y = dancer.parts.leftArm.baseY
                    dancer.parts.rightArm.y = dancer.parts.rightArm.baseY
                    dancer.parts.body.y = dancer.parts.body.baseY
                    dancer.parts.head.y = dancer.parts.head.baseY
                    dancer.parts.shadow.setScale(1, 1)
                }

                dancer.container.visible = true
                dancer.container.alpha = index === 1 ? 1 : (count === 3 ? 0 : 1)
                dancer.container.x = dancer.baseX
                dancer.container.y = dancer.baseY
                dancer.container.setScale(dancer.baseScale)
                dancer.container.setRotation(0)
                dancer.isActive = true

                if (count === 3 && index !== 1 && this.scene) {
                    this.scene.tweens.add({
                        targets: dancer.container,
                        alpha: 1,
                        duration: 280,
                        ease: "Sine.easeOut",
                    })
                }
            } else {
                if (dancer.container.visible && this.scene) {
                    this.scene.tweens.add({
                        targets: dancer.container,
                        alpha: 0,
                        duration: 200,
                        ease: "Sine.easeIn",
                        onComplete: () => {
                            dancer.container.visible = false
                            dancer.container.alpha = 1
                        },
                    })
                } else {
                    dancer.container.visible = false
                    dancer.container.alpha = 1
                }

                dancer.baseScale = dancer.defaultScale
                dancer.isActive = false
            }
        })
    }

    /**
     * 更新可视化
     */
    updateVisualization() {
        if (!this.visualBars) return

        // 根据舞蹈强度和速度生成可视化条高度
        for (let i = 0; i < this.visualBars.length; i++) {
            // 基于舞蹈强度、速度和时间的组合
            const bar = this.visualBars[i]
            const wave = Math.sin((this.danceTimer + i) * 0.12 * this.danceSpeed)
            const heightFactor = (wave + 1) * 0.5 + this.danceIntensity * 0.6
            const rawHeight = bar.initialHeight * heightFactor * (0.8 + this.musicSpeed * 0.2)
            const minHeight = Math.max(16, this.viewportHeight * 0.05)
            const maxHeight = Math.max(50, this.viewportHeight * 0.14)
            const displayHeight = Phaser.Math.Clamp(rawHeight, minHeight, maxHeight)
            bar.setDisplaySize(bar.baseWidth, displayHeight)
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
    setSpeedFromIntensity(speed, progressRatio = 0) {
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

        this.updateCrowdMode(progressRatio)
        this.setCelebrationActive(progressRatio >= 1)
    }

    setCelebrationActive(active) {
        if (active && !this.celebrationActive) {
            if (this.celebrationEmitter) {
                this.celebrationEmitter.start()
            }
            this.enableShineEffect()
        } else if (!active && this.celebrationActive) {
            if (this.celebrationEmitter) {
                this.celebrationEmitter.stop()
            }
            this.disableShineEffect()
        }

        this.celebrationActive = active
    }

    startShineScanTween() {
        if (!this.scene || !this.shineOverlay) return

        this.stopShineScanTween()

        this.shineOverlay.setPosition(this.shineScanBounds.left, this.shineScanBounds.y)
        this.shineOverlay.setAngle(-12)

        this.shineScanTween = this.scene.tweens.timeline({
            targets: this.shineOverlay,
            loop: -1,
            tweens: [
                {
                    x: this.shineScanBounds.right,
                    angle: 18,
                    duration: 2000,
                    ease: "Sine.easeInOut",
                },
                {
                    x: this.shineScanBounds.left,
                    angle: -18,
                    duration: 2000,
                    ease: "Sine.easeInOut",
                },
            ],
        })
    }

    stopShineScanTween() {
        if (this.shineScanTween) {
            this.shineScanTween.stop()
            this.shineScanTween.destroy()
            this.shineScanTween = null
        }
    }

    enableShineEffect() {
        if (!this.shineOverlay || !this.scene) return

        if (this.shineAlphaTween) {
            this.shineAlphaTween.stop()
        }

        this.shineOverlay.setVisible(true)
        this.startShineScanTween()

        if (this.shineFx) {
            this.shineFx.setActive(true)
        }

        this.shineAlphaTween = this.scene.tweens.add({
            targets: this.shineOverlay,
            alpha: 0.55,
            duration: 420,
            ease: "Sine.easeOut",
        })
    }

    disableShineEffect() {
        if (!this.shineOverlay || !this.scene) return

        if (this.shineAlphaTween) {
            this.shineAlphaTween.stop()
        }

        if (this.shineFx) {
            this.shineFx.setActive(false)
        }

        this.stopShineScanTween()

        this.shineAlphaTween = this.scene.tweens.add({
            targets: this.shineOverlay,
            alpha: 0,
            duration: 480,
            ease: "Sine.easeIn",
            onComplete: () => {
                if (this.shineOverlay) {
                    this.shineOverlay.setVisible(false)
                    this.shineOverlay.setPosition(this.shineScanBounds.left, this.shineScanBounds.y)
                    this.shineOverlay.setAngle(-12)
                }
            },
        })
    }

    /**
     * 销毁游戏
     */
    destroy() {
        if (this.scene && this.resizeHandler) {
            this.scene.scale.off("resize", this.resizeHandler, this)
            this.resizeHandler = null
        }

        if (this.background) {
            this.background.destroy()
            this.background = null
        }

        if (this.floorGlow) {
            this.floorGlow.destroy()
            this.floorGlow = null
        }

        if (this.celebrationParticles) {
            this.celebrationParticles.destroy()
            this.celebrationParticles = null
            this.celebrationEmitter = null
            this.celebrationActive = false
        }

        if (this.shineAlphaTween) {
            this.shineAlphaTween.stop()
            this.shineAlphaTween = null
        }

        this.stopShineScanTween()

        if (this.shineOverlay) {
            this.shineOverlay.destroy()
            this.shineOverlay = null
            this.shineFx = null
        }

        if (this.game) {
            this.game.destroy(true)
            this.game = null
        }

        this.scene = null

        if (this.speedDecayTimer) {
            clearInterval(this.speedDecayTimer)
        }
    }
}

export { DanceGame }
