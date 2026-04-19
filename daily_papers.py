#!/usr/bin/env python3
"""
获取 Hugging Face Daily Papers API 数据
提取 id, title, summary, upvotes, projectPage, ai_keywords 字段
"""

import requests
import json
from datetime import datetime
from typing import List, Dict, Any


def get_daily_papers(date: str = None) -> List[Dict[str, Any]]:
    """
    获取指定日期的 Hugging Face Daily Papers

    Args:
        date: 日期字符串，格式为 YYYY-MM-DD，默认为今天

    Returns:
        提取后的论文信息列表
    """
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    url = f"https://huggingface.co/api/daily_papers?date={date}"

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()

        # 提取所需字段
        papers = []
        for item in data:
            # 从 paper 子对象或顶层获取字段
            paper_obj = item.get("paper", {}) if isinstance(item.get("paper"), dict) else {}

            paper = {
                "id": paper_obj.get("id") or item.get("id"),
                "title": item.get("title") or paper_obj.get("title"),
                "summary": item.get("summary") or paper_obj.get("summary"),
                "upvotes": paper_obj.get("upvotes") or item.get("upvotes"),
                "projectPage": paper_obj.get("projectPage") or item.get("projectPage"),
                "ai_keywords": paper_obj.get("ai_keywords") or item.get("ai_keywords", [])
            }
            papers.append(paper)

        return papers

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"JSON 解析失败: {e}")
        return []


def main():
    """主函数"""
    # 获取今天的日期
    today = datetime.now().strftime("%Y-%m-%d")
    print(f"正在获取 {today} 的 Daily Papers...\n")

    papers = get_daily_papers()

    if not papers:
        print("未获取到任何论文数据")
        return

    print(f"成功获取 {len(papers)} 篇论文:\n")

    # 打印每篇论文的信息
    for i, paper in enumerate(papers, 1):
        print(f"[{i}] {paper['title']}")
        print(f"    ID: {paper['id']}")
        print(f"    Upvotes: {paper['upvotes']}")
        print(f"    Project Page: {paper['projectPage']}")
        print(f"    AI Keywords: {', '.join(paper['ai_keywords']) if paper['ai_keywords'] else 'None'}")
        print(f"    Summary: {paper['summary'][:200]}..." if paper['summary'] and len(paper['summary']) > 200 else f"    Summary: {paper['summary']}")
        print()

    # 可选：保存到 JSON 文件
    output_file = f"daily_papers_{today}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(papers, f, ensure_ascii=False, indent=2)
    print(f"数据已保存到: {output_file}")


if __name__ == "__main__":
    main()
