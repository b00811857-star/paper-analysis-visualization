# 论文分类处理脚本使用说明

## 脚本功能

该脚本用于批量处理JSON论文数据文件，使用大模型对论文进行自动分类。

### 处理流程

1. **输入文件夹路径** - 指定包含JSON文件的文件夹
2. **遍历JSON文件** - 自动找到所有 `daily_papers_*.json` 文件
3. **提取前3条数据** - 从每个JSON文件中提取前3篇论文
4. **调用大模型** - 将论文的title和summary发送给大模型进行分类
5. **添加category字段** - 将分类结果添加回原JSON结构体
6. **保存更新** - 修改后的JSON文件自动覆盖原文件

## 使用方法

### 方式一：直接运行（使用当前目录）

```bash
python process_papers_with_category.py
```

### 方式二：指定文件夹路径

```bash
python process_papers_with_category.py "c:\路径\到\你的\文件夹"
```

例如：

```bash
python process_papers_with_category.py "c:\Users\lsz\Downloads\hf-dailpypaper-collect-main\hf-dailpypaper-collect-main"
```

## 自定义提示词

在脚本中找到 `SYSTEM_PROMPT` 和 `USER_PROMPT_TEMPLATE` 变量：

### 1. 修改分类标签

编辑 `SYSTEM_PROMPT` 中的分类标签部分：

```python
分类标签可以从以下选项中选择：
- Computer Vision（计算机视觉）
- NLP（自然语言处理）
- Reinforcement Learning（强化学习）
- Multimodal（多模态学习）
- Robotics（机器人）
- Healthcare（医疗健康）
- Other（其他）
```

### 2. 修改分类规则

编辑 `SYSTEM_PROMPT` 中的分类规则部分，根据需要调整分类逻辑。

例如，可以添加具体的分类示例：

```python
分类规则示例：
- 涉及图像、视频、目标检测、姿态估计等 -> Computer Vision
- 涉及文本处理、语言理解、对话系统等 -> NLP
- 涉及代理、策略学习、奖励函数等 -> Reinforcement Learning
```

## 输出示例

运行脚本后，你会看到类似的输出：

```
处理文件: c:\path\daily_papers_2026-02-24.json
  - 找到 30 篇论文，提取前3篇...
  - 调用大模型进行分类...
  - 处理完成，已添加category字段
    1. A Very Big Video Reasoning Suite -> Computer Vision
    2. TOPReward: Token Probabilities as Hidden Zero-Shot Rewards -> Reinforcement Learning
    3. Mobile-O: Unified Multimodal Understanding and Generation -> Multimodal
```

## 修改后的JSON格式

原始JSON结构：

```json
{
  "id": "2602.20159",
  "title": "A Very Big Video Reasoning Suite",
  "summary": "...",
  "upvotes": 52,
  "projectPage": "...",
  "ai_keywords": [...]
}
```

修改后添加了 `category` 字段：

```json
{
  "id": "2602.20159",
  "title": "A Very Big Video Reasoning Suite",
  "summary": "...",
  "upvotes": 52,
  "projectPage": "...",
  "ai_keywords": [...],
  "category": "Computer Vision"
}
```

## 配置大模型

脚本中的大模型配置部分（可根据需要修改）：

```python
API_KEY = "d60126c2-fccf-45ad-8a7a-48076d16c32d"
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seed-2-0-pro-260215"
```

## 常见问题

### Q: 脚本只处理前3篇论文吗？

A: 是的，根据需求，脚本只提取并分类每个JSON文件中的前3篇论文，其他论文保持不变。如需修改，可改变 `extract_paper_info()` 函数中的 `limit` 参数。

### Q: 可以修改分类标签吗？

A: 可以。在 `SYSTEM_PROMPT` 中修改分类标签列表，并根据需要调整分类规则。

### Q: 大模型返回的结果出错怎么办？

A: 脚本有错误处理，会输出警告信息并跳过失败的文件。可以检查大模型响应的格式是否符合JSON要求。

### Q: 如何处理大量文件？

A: 脚本自动批量处理所有 `daily_papers_*.json` 文件，会按顺序逐个处理。处理进度会实时显示。

## 提示

- 首次运行时建议对一个小的JSON文件进行测试
- 脚本会覆盖原JSON文件，建议提前备份
- 大模型API调用会产生费用，请根据实际需求调整处理的文件数量
