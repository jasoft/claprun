/**
 * 游戏常量配置文件
 * 所有可调整的参数都在这里定义
 */

// ============ 速度配置 ============
export const SPEED_CONFIG = {
    BASE_SPEED: 1.0, // 基础速度
    MAX_SPEED: 10.0, // 最大速度（舞蹈速度）
    MIN_SPEED: 1.0, // 最小速度

    // 音乐速度配置（独立于舞蹈速度）
    MUSIC_MAX_SPEED: 2.0, // 音乐最大速度
    MUSIC_SPEED_PROGRESS_THRESHOLD: 0.75, // 进度达到75%时音乐速度达到最大
}

// ============ 鼓掌烈度配置 ============
export const CLAP_INTENSITY_CONFIG = {
    // 汽车物理模型参数 - 实现指数衰减减速
    MAX_ACCELERATION: 1.3, // 最大加速度

    // 非线性阻力系统 - 实现真实汽车减速
    BASE_FRICTION: 0.5, // 基础摩擦系数
    AIR_RESISTANCE_FACTOR: 0.15, // 空气阻力因子（二次方阻力）
    ENGINE_BRAKE: 0.05, // 发动机制动（松油门时的额外阻力）

    // 速度相关的阻力参数
    LOW_SPEED_FRICTION: 0.02, // 低速时的基础阻力
    HIGH_SPEED_MULTIPLIER: 0.3, // 高速时的阻力倍增器

    // 物理模拟参数
    PHYSICS_UPDATE_INTERVAL: 50, // 物理更新间隔 (ms)
    CLAP_FORCE_DURATION: 10, // 一次鼓掌产生的推力持续时间 (ms)

    // 鼓掌频率计算
    FREQUENCY_WINDOW: 1500, // 计算频率的时间窗口 (ms)
    CLAP_FORCE_MULTIPLIER: 0.35, // 鼓掌力度转换系数

    // 历史记录窗口
    CLAP_HISTORY_WINDOW: 3000, // 时间窗口 (ms)

    // 进度满值后的速度保持
    SPEED_HOLD_DURATION: 5000, // 维持最大速度的时间 (ms)
    SPEED_HOLD_ACTIVATION_THRESHOLD: 0.25, // 触发保速时距离最大速度的差值

    // 置信度阈值
    CLAP_THRESHOLD: 0.8, // 80% 置信度
    CLAP_COOLDOWN: 10, // 冷却时间 (ms)
}

// ============ 烈度等级配置 ============
export const INTENSITY_LEVEL_CONFIG = {
    // 烈度等级阈值
    LEVEL_BASIC: 1.0, // 基础
    LEVEL_MEDIUM: 3.0, // 中等
    LEVEL_HIGH: 5.0, // 高烈度
    LEVEL_EXTREME: 8.0, // 极限
}

// ============ 欢呼声配置 ============
export const CHEER_CONFIG = {
    // 欢呼声文件路径
    CHEER_SOUND_URL: "./music/applause-cheer-236786.mp3",

    // 欢呼声播放配置
    MIN_VOLUME: 0.3, // 最小音量
    MAX_VOLUME: 1.0, // 最大音量

    // 欢呼声播放频率（基于速度）
    // 速度 1.0x: 不播放
    // 速度 3.0x: 每 2000ms 播放一次
    // 速度 5.0x: 每 1000ms 播放一次
    // 速度 10.0x: 每 300ms 播放一次
    MIN_SPEED_FOR_CHEER: 2.0, // 最小速度才开始播放欢呼声

    // 欢呼声播放间隔计算
    // interval = BASE_INTERVAL / (speed / BASE_SPEED)
    BASE_INTERVAL: 2000, // 基础间隔 (ms)
    BASE_SPEED_FOR_INTERVAL: 3.0, // 基础速度参考点

    // 最大同时播放数
    MAX_CONCURRENT_CHEERS: 5, // 最多同时播放 5 个欢呼声
}

// ============ MP3 播放器配置 ============
export const MP3_PLAYER_CONFIG = {
    MUSIC_URL: "./music/legacy-of-brahms-hungarian-dance-no5-fun-background-dance-music-191255.mp3",
    VOLUME: 1,
    LOOP: true,
}

// ============ 游戏配置 ============
export const GAME_CONFIG = {
    // 舞蹈强度范围
    MIN_DANCE_INTENSITY: 0.2, // 最小舞蹈强度
    MAX_DANCE_INTENSITY: 1.0, // 最大舞蹈强度
}

// ============ 音频识别配置 ============
export const AUDIO_RECOGNIZER_CONFIG = {
    // 模型 URL
    MODEL_URL: "https://teachablemachine.withgoogle.com/models/Z4siyrF6g/model.json",
    METADATA_URL: "https://teachablemachine.withgoogle.com/models/Z4siyrF6g/metadata.json",

    // 识别参数
    INCLUDE_SPECTROGRAM: false,
    PROBABILITY_THRESHOLD: 0.8,
    INVOKE_CALLBACK_ON_NOISE_AND_UNKNOWN: true,
    OVERLAP_FACTOR: 0.8,
}

// ============ 响度检测配置 ============
export const LOUDNESS_DETECTION_CONFIG = {
    ENABLED: true, // 是否启用响度检测并将其视为鼓掌
    LOUDNESS_THRESHOLD: 0.8, // 响度达到 80% 视为一次鼓掌

    // 采样频率：每秒检测 2-5 次
    MIN_SAMPLES_PER_SECOND: 1,
    MAX_SAMPLES_PER_SECOND: 5,
    DEFAULT_SAMPLES_PER_SECOND: 1,

    // 分析参数
    FFT_SIZE: 2048,
    SMOOTHING_TIME_CONSTANT: 0.8,
    SAMPLE_COOLDOWN_MS: 300, // 一次触发后短暂冷却，避免重复计数
}
