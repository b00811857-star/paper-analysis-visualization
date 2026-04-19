# 论文数据趋势分析可视化

## 📖 功能说明

这是一个前端页面，用于可视化同目录下JSON文件中的论文数据。主要功能包括：

### 核心功能
- **5天周期分组**：将论文按照5天为一个周期进行时间分组
- **Category加权聚类**：每个周期内按Category分类，使用upvotes作为权重
- **多种聚合方式**：
  - **总点赞数（和）**：计算每个Category的总upvotes
  - **平均点赞数**：计算每个Category论文的平均upvotes
  - **论文数量**：统计每个Category的论文数
- **动态图表**：使用Chart.js绘制交互式条形图，展示趋势变化
- **详细数据**：显示每个周期内各Category的具体数值

### UI特点
- 📊 实时统计卡片（总论文数、总点赞、分类数、时间周期数）
- 📈 动态条形图，支持悬停查看详细数据
- 🎨 彩色图例，匹配图表颜色
- 📋 详细数据表格，显示每个周期的分类统计

## 🚀 使用方法

### 快速开始
1. 将 `index.html` 和 `app.js` 放在与JSON文件相同的目录中
2. 在浏览器中打开 `index.html`（推荐使用现代浏览器如Chrome、Firefox、Edge）
3. 页面会自动加载所有JSON文件并生成可视化

### 交互控件

#### 聚合方式选择
选择不同的数据聚合方式来改变图表显示内容：
- `总点赞数（和）`：每个Category的所有论文点赞总和
- `平均点赞数`：每个Category论文的平均点赞数
- `论文数量`：每个Category的论文数量

#### 显示前N个Category
输入数字（1-20）来控制图表上显示多少个Category。默认显示前10个。

#### 刷新数据
点击"刷新数据"按钮重新加载所有JSON文件。

## 📊 数据处理流程

### 1. 数据加载
- 自动加载所有 `daily_papers_YYYY-MM-DD.json` 文件
- 提取每个论文的：id、title、summary、upvotes、category等信息

### 2. 时间周期分组
- 以2026-02-24作为第一个5天周期的起点
- 每5天为一个周期进行分组
- 周期标签格式：`YYYY-MM-DD ~ YYYY-MM-DD (周期号)`

### 3. Category分类计算
对于每个5天周期：
- 按Category对论文进行分组
- 基于选择的聚合方式计算数值（总upvotes/平均upvotes/论文数）
- 保留所有Category但在图表中默认显示前10个（可调整）

### 4. 可视化展示
- 使用Chart.js库绘制条形图
- X轴：时间周期
- Y轴：聚合后的数值
- 每个Category用不同颜色表示
- 支持交互式悬停查看具体数值

## 🔍 数据示例

### JSON文件格式
```json
[
  {
    "id": "2602.20159",
    "title": "A Very Big Video Reasoning Suite",
    "summary": "...",
    "upvotes": 52,
    "projectPage": "https://...",
    "ai_keywords": [...],
    "category": "评测、环境与真实任务基准"
  },
  ...
]
```

### 处理后的周期数据结构
```
周期1 (2026-02-24 ~ 2026-02-28):
  Category A:
    - 论文数: 5
    - 总upvotes: 150
    - 平均upvotes: 30
  Category B:
    - 论文数: 3
    - 总upvotes: 80
    - 平均upvotes: 26.7
  ...

周期2 (2026-03-01 ~ 2026-03-05):
  ...
```

## 🛠️ 技术栈

- **前端框架**：纯HTML5 + CSS3 + JavaScript
- **图表库**：Chart.js v3.9.1（CDN引入）
- **数据加载**：Fetch API
- **样式**：Responsive Design（支持移动端）

## ⚙️ 配置信息

### 文件列表
代码中内置了以下JSON文件的加载列表：
- daily_papers_2026-02-24.json 至 daily_papers_2026-04-17.json

如需更新文件列表，编辑 `app.js` 中的 `fileNames` 数组。

### 颜色配置
默认调色板包含15种颜色，Category会循环使用这些颜色。可在 `generateColors()` 函数中自定义。

## 🐛 故障排除

### 无法加载数据
- 确保JSON文件与HTML在同一目录
- 检查浏览器console是否有CORS错误
- 使用本地服务器运行（如Python: `python -m http.server 8000`）

### 图表显示异常
- 确保浏览器支持Canvas
- 检查网络连接（Chart.js通过CDN加载）
- 刷新页面重试

### JSON文件不完整
- 检查JSON格式是否正确
- 确保包含必要字段：category、upvotes

## 📝 扩展建议

1. **添加时间范围选择器**：允许用户选择特定的时间段
2. **导出功能**：支持导出图表为图片或CSV数据
3. **对比分析**：比较不同Category的趋势
4. **深入钻取**：点击某个Category查看该周期的具体论文
5. **移动优化**：优化移动设备上的图表展示

## 📄 许可证

基于项目需求开发

---

**最后更新**：2026年4月
