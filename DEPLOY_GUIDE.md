# 📊 论文数据可视化 - 部署指南

## 🚀 快速部署到GitHub Pages

### 步骤1：创建GitHub仓库
1. 访问 [GitHub.com](https://github.com)
2. 点击右上角 **"New repository"**
3. 仓库名称：`paper-analysis-visualization`（或你喜欢的名称）
4. 选择 **Public**（公开仓库）
5. **不要**勾选"Add a README file"
6. 点击 **"Create repository"**

### 步骤2：推送代码到GitHub
```bash
# 添加远程仓库（替换为你的GitHub用户名和仓库名）
git remote add origin https://github.com/YOUR_USERNAME/paper-analysis-visualization.git

# 推送代码
git push -u origin master
```

### 步骤3：启用GitHub Pages
1. 在GitHub仓库页面，点击 **"Settings"** 标签
2. 在左侧菜单中找到 **"Pages"**
3. 在 **"Source"** 下拉菜单中选择 **"Deploy from a branch"**
4. 在 **"Branch"** 下拉菜单中选择 **"master"** 分支
5. 点击 **"Save"**

### 步骤4：获取访问链接
等待几分钟后，GitHub会显示你的网站链接：
```
https://YOUR_USERNAME.github.io/paper-analysis-visualization/
```

## 🎯 分享链接

现在你可以通过这个链接分享给任何人：
- ✅ 完全免费
- ✅ 无需服务器
- ✅ 自动更新（推送新代码后）
- ✅ 支持所有现代浏览器

## 🔄 更新数据

当你有新数据时：
```bash
# 添加新文件
git add .
git commit -m "Update data"
git push
```

GitHub Pages会自动重新部署！

## 🛠️ 故障排除

### 如果看不到数据
- 确保所有JSON文件都在仓库中
- 检查浏览器控制台是否有错误
- 等待几分钟让GitHub Pages完全部署

### 如果样式异常
- 确保 `index.html` 和 `app.js` 在仓库根目录
- 检查文件路径是否正确

---

**🎉 现在你的论文数据可视化已经可以在网上访问了！**</content>
<parameter name="filePath">c:\Users\lsz\Downloads\hf-dailpypaper-collect-main\hf-dailpypaper-collect-main\DEPLOY_GUIDE.md