/**
 * 游戏常量配置文件
 * 所有可调整的参数都在这里定义
 */

// ============ 速度配置 ============
export const SPEED_CONFIG = {
    BASE_SPEED: 1.0, // 基础速度
    MAX_SPEED: 10.0, // 最大速度
    MIN_SPEED: 1.0, // 最小速度
}

// ============ 鼓掌烈度配置 ============
export const CLAP_INTENSITY_CONFIG = {
    // 加速度参数
    ACCELERATION_PER_CLAP: 0.15, // 每次鼓掌的加速度增量
    ACCELERATION_FROM_FREQUENCY: 0.05, // 频率贡献的加速度
    
    // 衰减参数
    DECAY_RATE: 0.02, // 速度衰减率 (每 100ms)
    DECAY_INTERVAL: 100, // 衰减检查间隔 (ms)
    DECAY_DELAY: 500, // 开始衰减的延迟 (ms)
    
    // 历史记录窗口
    CLAP_HISTORY_WINDOW: 2000, // 时间窗口 (ms)
    
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
    CHEER_SOUND_URL: "/music/applause-cheer-236786.mp3",
    
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
    MUSIC_URL: "/music/1762243276279213039-330481002180723.mp3",
    VOLUME: 0.5,
    LOOP: true,
}

// ============ 游戏配置 ============
export const GAME_CONFIG = {
    // 舞蹈强度范围
    MIN_DANCE_INTENSITY: 0.2, // 最小舞蹈强度
    MAX_DANCE_INTENSITY: 1.0, // 最大舞蹈强度
    
    // 游戏循环间隔
    GAME_LOOP_INTERVAL: 1200, // 游戏循环间隔 (ms)
}

// ============ 音频识别配置 ============
export const AUDIO_RECOGNIZER_CONFIG = {
    // 模型 URL
    MODEL_URL: "https://teachablemachine.withgoogle.com/models/Yd0Yd0Yd0/model.json",
    METADATA_URL: "https://teachablemachine.withgoogle.com/models/Yd0Yd0Yd0/metadata.json",
    
    // 识别参数
    INCLUDE_SPECTROGRAM: false,
    PROBABILITY_THRESHOLD: 0.5,
    INVOKE_CALLBACK_ON_NOISE_AND_UNKNOWN: true,
    OVERLAP_FACTOR: 0.8,
}

