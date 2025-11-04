/**
 * 音频识别模块 - 使用 Teachable Machine 识别拍巴掌声音
 */

class AudioRecognizer {
    constructor(options = {}) {
        // Teachable Machine 模型 URL
        // 这是一个示例 URL，您需要替换为自己训练的模型
        this.modelURL = options.modelURL || "https://teachablemachine.withgoogle.com/models/7xwSK62zg/"

        this.recognizer = null
        this.isListening = false
        this.classLabels = []

        // 回调函数
        this.onClapDetected = options.onClapDetected || (() => {})
        this.onStatusChange = options.onStatusChange || (() => {})
        this.onError = options.onError || (() => {})

        // 拍巴掌检测参数
        this.clapThreshold = options.clapThreshold || 0.8 // 置信度阈值
        this.clapLabel = options.clapLabel || "clap" // 拍巴掌的标签
        this.lastClapTime = 0
        this.clapCooldown = options.clapCooldown || 10 // 毫秒，防止重复检测
    }

    /**
     * 初始化模型
     */
    async init() {
        try {
            console.log("[AudioRecognizer] 开始初始化...")
            console.log("[AudioRecognizer] 模型 URL:", this.modelURL)
            this.updateStatus("正在加载模型...", "loading")

            const checkpointURL = this.modelURL + "model.json"
            const metadataURL = this.modelURL + "metadata.json"

            console.log("[AudioRecognizer] Checkpoint URL:", checkpointURL)
            console.log("[AudioRecognizer] Metadata URL:", metadataURL)

            this.recognizer = speechCommands.create("BROWSER_FFT", undefined, checkpointURL, metadataURL)

            console.log("[AudioRecognizer] 识别器已创建，正在加载模型...")
            await this.recognizer.ensureModelLoaded()
            this.classLabels = this.recognizer.wordLabels()

            console.log("[AudioRecognizer] 模型加载成功！")
            console.log("[AudioRecognizer] 类别标签:", this.classLabels)
            console.log("[AudioRecognizer] 拍巴掌标签:", this.clapLabel)
            console.log("[AudioRecognizer] 置信度阈值:", this.clapThreshold)

            this.updateStatus("模型加载成功！", "ready")
            return true
        } catch (error) {
            console.error("[AudioRecognizer] 模型加载失败:", error)
            this.updateStatus("模型加载失败: " + error.message, "error")
            this.onError(error)
            return false
        }
    }

    /**
     * 开始监听音频
     */
    startListening() {
        if (!this.recognizer) {
            console.error("[AudioRecognizer] 识别器未初始化")
            return false
        }

        try {
            console.log("[AudioRecognizer] 开始监听音频...")
            this.recognizer.listen(
                (result) => {
                    this.handleAudioResult(result)
                },
                {
                    includeSpectrogram: false, // 禁用频谱图以减少处理时间
                    probabilityThreshold: 0.5, // 降低阈值以加快响应
                    invokeCallbackOnNoiseAndUnknown: true,
                    overlapFactor: 0.8, // 90% 重叠以实现实时级别的响应（与 Teachable Machine 一致）
                }
            )

            this.isListening = true
            console.log("[AudioRecognizer] 音频监听已启动")
            this.updateStatus("正在监听音频...", "ready")
            return true
        } catch (error) {
            console.error("[AudioRecognizer] 启动监听失败:", error)
            this.updateStatus("启动监听失败: " + error.message, "error")
            this.onError(error)
            return false
        }
    }

    /**
     * 停止监听音频
     */
    stopListening() {
        if (this.recognizer && this.isListening) {
            this.recognizer.stopListening()
            this.isListening = false
            this.updateStatus("已停止监听", "ready")
        }
    }

    /**
     * 处理音频识别结果
     */
    handleAudioResult(result) {
        const scores = result.scores
        const now = Date.now()

        // 打印所有分数用于调试
        const scoreDetails = {}
        let maxScore = 0
        let maxLabel = ""

        for (let i = 0; i < this.classLabels.length; i++) {
            scoreDetails[this.classLabels[i]] = (scores[i] * 100).toFixed(1) + "%"
            if (scores[i] > maxScore) {
                maxScore = scores[i]
                maxLabel = this.classLabels[i]
            }
        }

        // 只在有显著变化时打印日志，减少控制台输出延迟
        if (maxScore > 0.5) {
            console.log(
                "[AudioRecognizer] 识别结果:",
                scoreDetails,
                "| 最高分:",
                maxLabel,
                (maxScore * 100).toFixed(1) + "%"
            )
        }

        // 快速检查冷却时间 - 提前返回以减少延迟
        if (now - this.lastClapTime <= this.clapCooldown) {
            return
        }

        // 快速检查最高分是否超过阈值 - 如果不超过，直接返回
        if (maxScore <= this.clapThreshold) {
            return
        }

        // 检查最高分是否是拍巴掌标签
        const isClapLabelMax = maxLabel.toLowerCase().includes("clap") || maxLabel.includes("掌声")

        if (isClapLabelMax) {
            this.lastClapTime = now
            this.onClapDetected({
                confidence: maxScore,
                label: maxLabel,
                timestamp: now,
            })

            console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${maxLabel} (${(maxScore * 100).toFixed(1)}%)`)
            return
        }

        // 如果最高分不是拍巴掌，遍历所有类别查找拍巴掌
        for (let i = 0; i < this.classLabels.length; i++) {
            const label = this.classLabels[i]
            const score = scores[i]

            // 检查是否是拍巴掌且置信度足够高
            // 支持英文 "clap" 和中文 "掌声"
            const isClapLabel =
                label.toLowerCase().includes(this.clapLabel.toLowerCase()) ||
                label.includes("掌声") ||
                label.includes("clap")

            if (isClapLabel && score > this.clapThreshold) {
                this.lastClapTime = now
                this.onClapDetected({
                    confidence: score,
                    label: label,
                    timestamp: now,
                })

                console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${label} (${(score * 100).toFixed(1)}%)`)
                return
            }
        }
    }

    /**
     * 更新状态
     */
    updateStatus(message, type = "ready") {
        this.onStatusChange({
            message: message,
            type: type,
        })
    }

    /**
     * 获取类别标签
     */
    getLabels() {
        return this.classLabels
    }

    /**
     * 销毁识别器
     */
    destroy() {
        this.stopListening()
        if (this.recognizer) {
            this.recognizer = null
        }
    }
}

export { AudioRecognizer }
