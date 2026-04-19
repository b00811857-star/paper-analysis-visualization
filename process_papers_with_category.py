import os
import json
import sys
from pathlib import Path
from openai import OpenAI

# ============== 配置部分 ==============
# 从环境变量中获取您的API KEY
API_KEY = "d60126c2-fccf-45ad-8a7a-48076d16c32d"
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seed-2-0-pro-260215"

# 自定义提示词 - 用户可以根据需要修改
SYSTEM_PROMPT = """你是一个学术论文分类专家。你需要根据所提供的论文标题和摘要，为每篇论文分配一个最合适的分类标签。

返回格式必须是JSON形式，每篇论文返回一个对象，包含原始title和新增的category字段。

分类标签可以从以下选项中选择：
| 分类标签                      | 核心问题                             | 典型关键词                                                           |
| ------------------------- | -------------------------------- | --------------------------------------------------------------- |
| 大模型推理                  | 模型能不能更稳定、更长链、更高效地推理              | reasoning, long CoT, verifier, search, test-time compute        |
| Agentic AI / 智能体       | 模型能不能自主规划、调工具、执行复杂任务             | agent, tool use, workflow, planning, browser agent, OS agent    |
| 多模态基础模型                | 模型能不能统一理解文本、图像、视频、语音、界面          | multimodal, VLM, MLLM, image-text, video-language, GUI agent    |
| World Models / 世界模型    | 模型能不能真正建模环境、状态变化、物理规律与可反事实预测     | world model, dynamics, latent state, simulation, counterfactual |
| Embodied / Physical AI | 模型能不能从“会说”变成“会做”，进入机器人和真实物理环境    | embodied AI, robotics, manipulation, VLA, physical AI           |
| 记忆、检索与外部认知             | 模型能不能长期记忆、调用知识、做持续任务             | memory, RAG, long-context, retrieval, external memory           |
| 对齐、安全与不确定性             | 模型能不能可信、可控、知道自己不确定               | alignment, safety, uncertainty, hallucination, red teaming      |
| 评测、环境与真实任务基准           | 模型到底是否真的“会做事”，而不是只会 benchmark 刷分 | benchmark, real-world tasks, agent evaluation, environment      |


返回的JSON格式示例：
[
  {"title": "论文标题", "category": "大模型推理"},
  {"title": "论文标题", "category": "Embodied / Physical AI"}
]"""

USER_PROMPT_TEMPLATE = """请为以下 {} 篇论文进行分类：

{}

请直接返回JSON数组，不要添加其他文字说明。"""


def initialize_client():
    """初始化OpenAI客户端"""
    return OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY,
    )


def extract_paper_info(papers, limit=3):
    """提取前N篇论文的信息"""
    extracted = []
    for paper in papers[:limit]:
        extracted.append({
            "id": paper.get("id"),
            "title": paper.get("title"),
            "summary": paper.get("summary")
        })
    return extracted


def call_model_for_categorization(client, papers_info):
    """调用大模型对论文进行分类"""
    # 构建提示词
    papers_text = ""
    for idx, paper in enumerate(papers_info, 1):
        papers_text += f"\n{idx}. 标题: {paper['title']}\n   摘要: {paper['summary']}\n"
    
    user_prompt = USER_PROMPT_TEMPLATE.format(len(papers_info), papers_text)
    
    try:
        response = client.responses.create(
            model=MODEL,
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": SYSTEM_PROMPT
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": user_prompt
                        }
                    ]
                }
            ]
        )
        
        # 提取响应内容
        # 豆包API的响应格式 - 遍历output列表找到message类型的响应
        content = ""
        if hasattr(response, 'output') and response.output:
            for item in response.output:
                # 查找类型为'message'的响应项
                if hasattr(item, 'type') and item.type == 'message':
                    if hasattr(item, 'content') and item.content:
                        for content_item in item.content:
                            if hasattr(content_item, 'type') and content_item.type == 'output_text':
                                if hasattr(content_item, 'text'):
                                    content = content_item.text
                                    break
                        if content:
                            break
                # 如果是字典格式
                elif isinstance(item, dict) and item.get('type') == 'message':
                    if 'content' in item and item['content']:
                        for content_item in item['content']:
                            if isinstance(content_item, dict) and content_item.get('type') == 'output_text':
                                content = content_item.get('text', '')
                                break
                        if content:
                            break
        else:
            content = str(response)
        
        # 尝试解析JSON
        try:
            # 查找JSON数组在响应中的位置
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                result = json.loads(json_str)
                return result
            else:
                print(f"警告: 无法在响应中找到JSON数组")
                print(f"响应内容: {content}")
                return None
        except json.JSONDecodeError as e:
            print(f"警告: 无法解析大模型返回的JSON: {e}")
            print(f"响应内容: {content}")
            return None
            
    except Exception as e:
        print(f"错误: 调用大模型失败: {e}")
        import traceback
        traceback.print_exc()
        return None


def add_category_to_papers(papers, categorized_data, papers_info):
    """将分类信息添加到原始JSON中"""
    if not categorized_data:
        return papers
    
    # 构建标题到分类的映射
    category_map = {}
    for item in categorized_data:
        if "title" in item and "category" in item:
            category_map[item["title"]] = item["category"]
    
    # 为前N篇论文添加category字段
    for idx, paper in enumerate(papers[:len(papers_info)]):
        title = paper.get("title")
        if title in category_map:
            paper["category"] = category_map[title]
    
    return papers


def process_json_file(file_path, client):
    """处理单个JSON文件"""
    print(f"\n处理文件: {file_path}")
    
    try:
        # 读取JSON文件
        with open(file_path, 'r', encoding='utf-8') as f:
            papers = json.load(f)
        
        if not isinstance(papers, list):
            print(f"警告: {file_path} 不是数组格式")
            return False
        
        if len(papers) == 0:
            print(f"警告: {file_path} 为空")
            return False
        
        print(f"  - 找到 {len(papers)} 篇论文，提取前3篇...")
        
        # 提取前3篇论文
        papers_info = extract_paper_info(papers, limit=3)
        
        # 调用大模型进行分类
        print(f"  - 调用大模型进行分类...")
        categorized_data = call_model_for_categorization(client, papers_info)
        
        if not categorized_data:
            print(f"  - 分类失败，跳过这个文件")
            return False
        
        # 将分类信息添加到原始JSON
        papers = add_category_to_papers(papers, categorized_data, papers_info)
        
        # 保存修改后的JSON文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(papers, f, ensure_ascii=False, indent=2)
        
        print(f"  - 处理完成，已添加category字段")
        
        # 打印前3篇的分类结果
        for idx, paper in enumerate(papers[:3], 1):
            category = paper.get("category", "未分类")
            print(f"    {idx}. {paper.get('title', 'N/A')[:50]}... -> {category}")
        
        return True
        
    except Exception as e:
        print(f"错误: 处理文件失败: {e}")
        return False


def process_folder(folder_path):
    """处理指定文件夹下的所有JSON文件"""
    # 验证文件夹
    if not os.path.isdir(folder_path):
        print(f"错误: 指定的路径不是文件夹: {folder_path}")
        return
    
    # 初始化客户端
    client = initialize_client()
    
    # 获取所有JSON文件
    json_files = sorted(Path(folder_path).glob("daily_papers_*.json"))
    
    if not json_files:
        print(f"警告: 在 {folder_path} 中未找到JSON文件")
        return
    
    print(f"找到 {len(json_files)} 个JSON文件")
    print("=" * 60)
    
    # 处理每个文件
    success_count = 0
    for json_file in json_files:
        if process_json_file(str(json_file), client):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"处理完成: 成功处理 {success_count}/{len(json_files)} 个文件")


def main():
    """主函数"""
    if len(sys.argv) > 1:
        folder_path = sys.argv[1]
    else:
        # 默认使用当前目录
        folder_path = os.getcwd()
    
    print(f"开始处理文件夹: {folder_path}")
    process_folder(folder_path)


if __name__ == "__main__":
    main()
