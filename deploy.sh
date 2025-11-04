#!/bin/bash

# GitHub 部署脚本
# 使用前请确保已经设置了正确的 GitHub 用户名和仓库名

GITHUB_USERNAME="jasoft"
REPO_NAME="claprun"

echo "🚀 开始部署到 GitHub Pages..."

# 检查是否已经在 git 仓库中
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    git add .
    git commit -m "Initial commit"

    # 添加远程仓库
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
    git branch -M main
else
    echo "📝 提交当前更改..."
    git add .
    git commit -m "Update for deployment"
fi

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
git push -u origin main

echo "✅ 代码已推送到 GitHub！"
echo ""
echo "📋 接下来的步骤："
echo "1. 访问 https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "2. 进入 Settings > Pages"
echo "3. 在 Source 中选择 'GitHub Actions'"
echo "4. 等待部署完成（大约 2-3 分钟）"
echo ""
echo "🌐 部署完成后，你的网站将可以通过以下地址访问："
echo "https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
