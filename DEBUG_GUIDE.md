# 🐛 拍巴掌舞蹈游戏 - 调试指南

## 问题修复总结

### 1. Phaser 错误修复
**问题**: `this.visualBars[i].setHeight is not a function`

**原因**: Phaser 的 `rectangle` 对象没有 `setHeight` 方法

**解决方案**: 改用 `setDisplayHeight` 方法
```javascript
// 错误的方式
this.visualBars[i].setHeight(height)

// 正确的方式
this.visualBars[i].setDisplayHeight(height)
```

### 2. 音频采样率警告
**问题**: `Mismatch in sampling rate: Expected: 44100; Actual: 48000`

**原因**: 系统音频采样率与模型期望不匹配

**解决方案**: 这是正常的警告，不影响功能。Speech Commands 库会自动处理采样率转换。

### 3. 缺少调试日志
**问题**: 无法判断是否正确识别了拍巴掌

**解决方案**: 添加了详细的日志信息

## 📊 调试日志说明

### 打开浏览器控制台
1. 按 `F12` 打开开发者工具
2. 点击 "Console" 标签页
3. 查看日志信息

### 日志前缀说明

| 前缀 | 含义 | 示例 |
|------|------|------|
| `[Main]` | 主程序日志 | 应用初始化、游戏启动 |
| `[AudioRecognizer]` | 音频识别日志 | 模型加载、音频识别结果 |
| `[Game]` | 游戏引擎日志 | 舞蹈动画、可视化更新 |

### 关键日志信息

#### 应用初始化
```
[Main] 开始初始化应用...
[Main] 音频识别器已创建，开始初始化模型...
[AudioRecognizer] 开始初始化...
[AudioRecognizer] 模型 URL: https://teachablemachine.withgoogle.com/models/7xwSK62zg/
[AudioRecognizer] 识别器已创建，正在加载模型...
[AudioRecognizer] 模型加载成功！
[AudioRecognizer] 类别标签: ["clap", "background", "_background_noise_", "_unknown_"]
[AudioRecognizer] 拍巴掌标签: clap
[AudioRecognizer] 置信度阈值: 0.7
[Main] 模型加载成功，创建游戏...
[Game] 音乐可视化条已创建: 32 个
[Main] 应用初始化完成！
```

#### 游戏启动
```
[Main] 开始游戏...
[Main] 启动游戏...
[Main] 启动音频监听...
[AudioRecognizer] 开始监听音频...
[AudioRecognizer] 音频监听已启动
[Main] 游戏已启动，等待拍巴掌...
```

#### 拍巴掌识别
```
[AudioRecognizer] 识别结果: {
  "clap": "45.2%",
  "background": "30.1%",
  "_background_noise_": "15.3%",
  "_unknown_": "9.4%"
}
[AudioRecognizer] ✅ 检测到拍巴掌: clap (85.3%)
[Main] 收到拍巴掌事件
[Main] 拍巴掌计数: 1 置信度: 0.85
[Game] 拍巴掌事件: {
  "confidence": 0.85,
  "danceIntensity": "0.85",
  "danceSpeed": "1.10",
  "musicSpeed": "1.05"
}
```

## 🔍 常见问题排查

### Q: 模型加载失败
**检查项**:
1. 网络连接是否正常
2. Teachable Machine 模型 URL 是否正确
3. 浏览器控制台是否有 CORS 错误

**日志特征**:
```
[AudioRecognizer] 模型加载失败: ...
```

### Q: 无法识别拍巴掌
**检查项**:
1. 麦克风是否正常工作
2. 麦克风音量是否足够大
3. 查看识别结果中 "clap" 的置信度是否低于 0.7

**日志特征**:
```
[AudioRecognizer] 识别结果: {
  "clap": "25.3%",  // 低于 70% 阈值
  ...
}
```

**解决方案**:
- 降低置信度阈值（在 `main.js` 中修改 `clapThreshold`）
- 使用 Teachable Machine 重新训练模型
- 确保麦克风音量足够大

### Q: 舞蹈没有反应
**检查项**:
1. 是否收到拍巴掌事件（查看 `[Main] 拍巴掌计数` 日志）
2. 游戏是否正常启动（查看 `[Game]` 日志）

**日志特征**:
```
[Main] 拍巴掌计数: 0  // 没有收到拍巴掌事件
```

### Q: 可视化条不动
**检查项**:
1. 查看是否有 Phaser 错误
2. 检查 `[Game] 音乐可视化条已创建` 日志

**日志特征**:
```
[Game] 音乐可视化条已创建: 32 个
```

## 🛠️ 调试技巧

### 1. 修改置信度阈值
编辑 `main.js` 中的 `clapThreshold`:
```javascript
audioRecognizer = new AudioRecognizer({
    clapThreshold: 0.5,  // 降低到 0.5 使识别更敏感
    ...
});
```

### 2. 修改冷却时间
编辑 `main.js` 中的 `clapCooldown`:
```javascript
audioRecognizer = new AudioRecognizer({
    clapCooldown: 100,  // 降低到 100ms 使识别更频繁
    ...
});
```

### 3. 查看所有识别结果
在浏览器控制台中，所有识别结果都会被打印出来，包括低于阈值的结果。

### 4. 测试麦克风
在浏览器控制台中运行:
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        console.log("麦克风可用");
        stream.getTracks().forEach(track => track.stop());
    })
    .catch(err => console.error("麦克风错误:", err));
```

## 📝 日志输出示例

### 完整的成功流程
```
[Main] 开始初始化应用...
[Main] 音频识别器已创建，开始初始化模型...
[AudioRecognizer] 开始初始化...
[AudioRecognizer] 模型 URL: https://teachablemachine.withgoogle.com/models/7xwSK62zg/
[AudioRecognizer] 识别器已创建，正在加载模型...
[AudioRecognizer] 模型加载成功！
[AudioRecognizer] 类别标签: ["clap", "background", "_background_noise_", "_unknown_"]
[AudioRecognizer] 拍巴掌标签: clap
[AudioRecognizer] 置信度阈值: 0.7
[Main] 模型加载成功，创建游戏...
[Game] 音乐可视化条已创建: 32 个
[Main] 应用初始化完成！
[Main] 开始游戏...
[Main] 启动游戏...
[Main] 启动音频监听...
[AudioRecognizer] 开始监听音频...
[AudioRecognizer] 音频监听已启动
[Main] 游戏已启动，等待拍巴掌...
[AudioRecognizer] 识别结果: {"clap": "85.3%", "background": "10.2%", ...}
[AudioRecognizer] ✅ 检测到拍巴掌: clap (85.3%)
[Main] 收到拍巴掌事件
[Main] 拍巴掌计数: 1 置信度: 0.85
[Game] 拍巴掌事件: {"confidence": 0.85, "danceIntensity": "0.85", ...}
```

## 🎯 下一步

如果问题仍未解决，请:
1. 收集完整的浏览器控制台日志
2. 检查网络标签页中的请求状态
3. 尝试使用不同的浏览器
4. 检查麦克风权限设置

## 📞 获取帮助

查看以下文件获取更多帮助:
- `README.md` - 项目概述和使用说明
- `SETUP.md` - 安装和配置指南
- `PROJECT_SUMMARY.md` - 技术细节

