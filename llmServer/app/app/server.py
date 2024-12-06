from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from chain import full_chain
from langchain_teddynote import logging


# 프로젝트 이름을 입력합니다.
logging.langsmith("DATASUMMERIZING")

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="Spin up a simple api server using Langchain's Runnable interfaces",
)


# 우리 서비스만 할 수 있또록 CORS 설정 필요함!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인을 허용하거나 특정 도메인을 설정
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)
add_routes(
    app,
    # chain_with_history,
    full_chain,
    path="/llm",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)

# 사용법
#     curl -X POST "http://localhost:8000/llm/invoke" \
#      -H "Content-Type: application/json" \
#      -d '{"input": {
#     "human_input": "컴퓨터공학부 4학년인데 하고싶은게 없어, 추천해줘"
#   },
#   "config": {
#     "configurable": {
#       "session_id": "ddddd"
#     }
#   },
#   "kwargs": {}
# }'

# grok 배포할 때 사용법
# curl -X POST "https://skylark-fast-certainly.ngrok-free.app/llm/invoke" \
#      -H "Content-Type: application/json" \
#      -d '{"input": {
#     "human_input": "컴퓨터공학부 4학년인데 하고싶은게 없어, 추천해줘"
#   },
#   "config": {
#     "configurable": {
#       "session_id": "ddddd"
#     }
#   },
#   "kwargs": {}
# }'