# 🎵 拍巴掌舞蹈 - 安装和使用指南

## 系统要求

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 麦克风设备
- 网络连接（用于加载 Teachable Machine 模型）
- Python 3.6+ （用于启动本地服务器）

## 快速开始

### 方法 1: 使用启动脚本（推荐）

#### macOS / Linux

```bash
cd src/claprun
chmod +x start.sh
./start.sh
```

#### Windows

```bash
cd src\claprun
start.bat
```

### 方法 2: 手动启动 Python 服务器

```bash
cd src/claprun
python3 server.py 8000
```

### 方法 3: 使用 Python 内置服务器

```bash
cd src/claprun
python3 -m http.server 8000
```

### 方法 4: 使用 Node.js http-server

```bash
# 首先安装 http-server
npm install -g http-server

# 启动服务器
cd src/claprun
http-server -p 8000
```

## 访问应用

启动服务器后，在浏览器中访问：

```
http://localhost:8000/index.html
```

## 首次使用

1. **允许麦克风权限**: 浏览器会请求麦克风访问权限，点击"允许"
2. **等待模型加载**: 第一次加载时会下载 Teachable Machine 模型（约 10-20MB）
3. **点击"开始游戏"**: 开始游戏并开始拍巴掌

## 使用说明

### 游戏界面

- **拍巴掌次数**: 显示识别到的拍巴掌总数
- **舞蹈速度**: 小人舞蹈的速度倍数（1.0x = 正常速度）
- **音乐速度**: 背景音乐的速度倍数

### 游戏玩法

1. 点击"开始游戏"按钮
2. 对着麦克风拍巴掌
3. 观看小人随着您的拍巴掌节奏跳舞
4. 拍得越快，小人跳得越快，音乐也越快
5. 点击"停止游戏"结束游戏

## 常见问题

### Q: 浏览器提示"需要 HTTPS"

A: 某些浏览器在非 HTTPS 环境下限制麦克风访问。解决方案：
- 使用 localhost（本地访问）
- 使用 HTTPS 服务器
- 在浏览器设置中允许 HTTP 麦克风访问

### Q: 模型加载失败

A: 可能的原因和解决方案：
1. 检查网络连接
2. 检查 Teachable Machine 模型 URL 是否正确
3. 尝试刷新页面
4. 检查浏览器控制台是否有错误信息

### Q: 无法识别拍巴掌

A: 可能的原因和解决方案：
1. 检查麦克风是否正常工作
2. 确保麦克风音量足够大
3. 调整 `clapThreshold` 参数（降低阈值使识别更敏感）
4. 使用 Teachable Machine 重新训练模型

### Q: 游戏运行缓慢

A: 可能的原因和解决方案：
1. 关闭其他浏览器标签页
2. 更新浏览器到最新版本
3. 检查 CPU 使用率
4. 尝试降低游戏分辨率

## 自定义配置

### 修改游戏参数

编辑 `js/main.js` 中的 `AudioRecognizer` 配置：

```javascript
audioRecognizer = new AudioRecognizer({
    modelURL: "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/",
    clapThreshold: 0.7,      // 降低此值使识别更敏感
    clapLabel: "clap",       // 拍巴掌的标签
    clapCooldown: 200,       // 防止重复检测的时间间隔
});
```

### 修改游戏外观

编辑 `index.html` 中的 CSS 样式：

```css
/* 修改背景颜色 */
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 修改按钮样式 */
button {
    padding: 12px 24px;
    /* ... 其他样式 ... */
}
```

### 修改舞蹈动画

编辑 `js/game.js` 中的 `updateDanceAnimation()` 方法：

```javascript
updateDanceAnimation() {
    this.danceTimer += 1;
    
    // 调整这些值来改变舞蹈效果
    const scale = 1 + this.danceIntensity * 0.2;
    const rotation = Math.sin(this.danceTimer * 0.05 * this.danceSpeed) * this.danceIntensity * 0.3;
    
    this.dancer.setScale(scale);
    this.dancer.setRotation(rotation);
}
```

## 训练自己的模型

1. 访问 [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
2. 选择"音频"项目
3. 创建两个类别：
   - "clap": 录制拍巴掌的声音（至少 20 个样本）
   - "background": 录制背景噪音（至少 10 个样本）
4. 训练模型
5. 导出模型并复制 URL
6. 在 `js/main.js` 中更新 `modelURL`

## 部署到网络

### 使用 GitHub Pages

1. 创建 GitHub 仓库
2. 将 `src/claprun` 目录推送到仓库
3. 在仓库设置中启用 GitHub Pages
4. 访问 `https://yourusername.github.io/repository/src/claprun/`

### 使用 Netlify

1. 连接 GitHub 仓库
2. 设置构建命令为空
3. 设置发布目录为 `src/claprun`
4. 部署

### 使用 Vercel

1. 导入 GitHub 仓库
2. 设置根目录为 `src/claprun`
3. 部署

## 技术支持

如有问题，请检查：
1. 浏览器控制台（F12）的错误信息
2. 网络标签页中的请求状态
3. 麦克风权限设置

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024)
- 初始版本发布
- 支持 Teachable Machine 音频识别
- 集成 Phaser.js 游戏引擎
- 实时舞蹈动画和音乐同步

