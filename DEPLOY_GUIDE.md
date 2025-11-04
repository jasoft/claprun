# GitHub Pages 部署指南

## ✅ 已修复的问题

- **terser 依赖问题**：已将压缩器我看到权限问题。需要将 `contents` 权限从 `read` 改为 `write`。让我修改这个配置：
<apply_diff>
<path>.github/workflows/deploy.从 terser 改为 esbuild，避免了依赖问题
- **构建配置优化**：现在使用 Vite 内置的 esbuild 进行代码压缩

## 快速部署

### 1. 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 创建名为 `claprun` 的仓库
3. **重要**：不要初始化 README、.gitignore 或 license

### 2.yml</path>
<diff>
<<<<<<< SEARCH
:start_line:9
-------
permissions:
  contents: read
  pages: write
  id-token: write
=======
permissions:
  contents: write
  pages: write
  id-token: write
>>>>>>> REPLACE
</diff>
</apply_diff>
