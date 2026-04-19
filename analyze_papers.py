import os
from openai import OpenAI

# 从环境变量中获取您的API KEY，配置方法见：https://www.volcengine.com/docs/82379/1399008
api_key = "d60126c2-fccf-45ad-8a7a-48076d16c32d"


client = OpenAI(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=api_key,
)

response = client.responses.create(
    model="doubao-seed-2-0-pro-260215",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "1+1=?，直接返回json结果 {\"result\": 2}，不要任何多余的文本"
                },
            ],
        }
    ]
)

print(response)