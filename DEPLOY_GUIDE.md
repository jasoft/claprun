# GitHub Pages 部署指南

## 快速部署

1. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 创建名为 `claprun` 的仓库
   - 不要初始化 README、.gitignore 或 license

2. **运行部署脚本**
   ```bash
   ./deploy.sh
   ```

3. **配置 GitHub Pages**
   - 访问 https://github.com/jasoft/claprun/settings/pages
   - 在 Source 中选择 "GitHub Actions"
   - 等待部署完成

4. **访问网站**
   部署完成后，访问：https://jasoft.github.io/claprun/

## 手动部署步骤

如果部署脚本无法运行，可以手动执行以下命令：

```bash
# 初始化 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/jasoft/claprun.git
git branch -M main

# 推送到 GitHub
git push -u origin main
```

## 部署说明

- 项目已配置 GitHub Actions 自动部署
- 每次推送到 main 分支时会自动构建并部署
- 构建产物位于 `dist` 目录
- 部署过程大约需要 2-3 分钟

## 故障排除

如果部署失败，请检查：

1. **Vite 配置**：确保 `vite.config.js` 中的 `base` 设置为 `/claprun/`
2. **GitHub Actions 权限**：确保仓库启用了 Actions
3. **构建错误**：查看 Actions 日志中的错误信息

## 本地测试

在部署前，可以本地测试构建：

```bash
npm run build
npm run preview
```

然后在浏览器中访问 http://localhost:4173/claprun/
