# 🎵 拍巴掌舞蹈 (Clap Run Dance)

一个基于 Teachable Machine 音频识别和 Phaser.js 游戏引擎的交互式舞蹈游戏。

## 功能特性

- 🎤 **实时音频识别**: 使用 Google Teachable Machine 识别拍巴掌声音
- 💃 **动态舞蹈**: 小人根据拍巴掌的频率和强度跳舞
- 🎵 **音乐同步**: 音乐速度随着拍巴掌的节奏变化
- 📊 **实时统计**: 显示拍巴掌次数、舞蹈速度、音乐速度
- 🎮 **Phaser.js 引擎**: 使用专业的游戏引擎实现流畅的动画

## 项目结构

```
src/claprun/
├── index.html              # 主 HTML 文件
├── js/
│   ├── audio-recognizer.js # 音频识别模块
│   ├── game.js             # Phaser.js 游戏模块
│   └── main.js             # 主程序
└── README.md               # 本文件
```

## 快速开始

### 1. 打开应用

直接在浏览器中打开 `index.html` 文件：

```bash
# 使用 Python 启动本地服务器
python -m http.server 8000

# 然后访问
http://localhost:8000/src/claprun/
```

### 2. 使用应用

1. 点击"开始游戏"按钮
2. 允许浏览器访问您的麦克风
3. 开始拍巴掌！
4. 观看小人随着您的拍巴掌节奏跳舞
5. 拍得越快，小人跳得越快，音乐也越快

## 配置说明

### 修改 Teachable Machine 模型

如果您想使用自己训练的模型，请修改 `js/audio-recognizer.js` 中的 `modelURL`：

```javascript
this.modelURL = options.modelURL || "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/";
```

### 调整拍巴掌检测参数

在 `js/main.js` 中修改 `AudioRecognizer` 的配置：

```javascript
audioRecognizer = new AudioRecognizer({
    modelURL: "...",
    clapThreshold: 0.7,      // 置信度阈值 (0-1)
    clapLabel: "clap",       // 拍巴掌的标签
    clapCooldown: 200,       // 防止重复检测的冷却时间 (毫秒)
    ...
});
```

## 技术栈

- **Phaser.js 3.55.2**: 游戏引擎
- **TensorFlow.js 1.3.1**: 机器学习框架
- **TensorFlow Models Speech Commands 0.4.0**: 音频识别模型
- **Web Audio API**: 音频处理和反馈

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

**注意**: 需要 HTTPS 或 localhost 来访问麦克风权限

## 如何训练自己的模型

1. 访问 [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
2. 选择"音频"项目
3. 录制"拍巴掌"和"背景噪音"的样本
4. 训练模型
5. 导出模型并获取 URL
6. 在 `js/audio-recognizer.js` 中更新 `modelURL`

## 文件说明

### index.html
主 HTML 文件，包含：
- UI 布局和样式
- 游戏容器
- 统计信息显示
- 控制按钮

### js/audio-recognizer.js
音频识别模块，负责：
- 加载 Teachable Machine 模型
- 监听麦克风输入
- 识别拍巴掌事件
- 触发回调函数

### js/game.js
Phaser.js 游戏模块，负责：
- 创建游戏场景
- 绘制舞者角色
- 管理舞蹈动画
- 处理音乐可视化
- 更新游戏状态

### js/main.js
主程序，负责：
- 初始化应用
- 整合音频识别和游戏
- 处理用户交互
- 更新 UI 统计信息

## 常见问题

### Q: 为什么没有声音？
A: 确保您的麦克风已连接并在浏览器中启用了麦克风权限。

### Q: 模型加载失败怎么办？
A: 检查网络连接，确保能访问 Teachable Machine 的模型 URL。

### Q: 如何改进识别准确度？
A: 使用 Teachable Machine 训练更多的拍巴掌样本，并调整 `clapThreshold` 参数。

## 许可证

MIT License

## 作者

Created with ❤️ using Phaser.js and Teachable Machine

