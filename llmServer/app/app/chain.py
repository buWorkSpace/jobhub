from typing import Dict, Any
from pydantic import BaseModel, Field
# from pydantic.v1 import BaseModel, Field
# from langchain_core.pydantic_v1 import BaseModel
from operator import itemgetter
from langchain.schema.runnable import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables.history import RunnableWithMessageHistory
from config import llm, load_document_data, selectIndexPrompt, prompt
from retriever import create_ensemble_retriever
from utils import format_docs, create_session_factory, convert_to_int, make_job_list, make_job_summary

# class InputChat(BaseModel):
#     human_input: str = Field(
#         ...,
#         description="The human input to the chat system.",
#         extra={"widget": {"type": "chat", "input": "human_input"}}
#     )

class InputChat(BaseModel):
    human_input: str = Field(
        ...,
        description="The human input to the chat system.",
        json_schema_extra={
            "widget": {
                "type": "chat",
                "input": "human_input"
            }
        }
    )


ensemble_retriever = create_ensemble_retriever(load_document_data())

def make_source(data: Dict[str, Any]) -> str:
    jobList = make_job_list(convert_to_int(data["index"]))
    result = format_docs(ensemble_retriever.invoke(jobList))
    return result

# 프로젝트 이름을 입력합니다.

chain = (
    selectIndexPrompt
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()  # 문자열 출력 파서를 사용합니다.
)

success_chain = (
    RunnablePassthrough().assign(source=make_source) 
    | RunnablePassthrough().assign(summary=make_job_summary) 
	| prompt
    | llm
)

fail_chain = (
    PromptTemplate.from_template(
        """다음에 나오는 문자열 그대로 출력하세요.
		"상담에 대한 질문을 해주세요!"
		"""
    )
    | ChatOpenAI(model="gpt-4o-mini")
)

chain_with_history = RunnableWithMessageHistory(
    success_chain,
    create_session_factory("chat_histories"),
    input_messages_key="human_input",
    history_messages_key="history",
)
# ).with_types(input_type=InputChat)

def route(info):
	result = convert_to_int(info["index"])
	if isinstance(result, list):
		return chain_with_history
	elif isinstance(result, int):
		return fail_chain
	else:
		return fail_chain

full_chain = (
    {"index": chain, "human_input": itemgetter("human_input")}
    | RunnableLambda(
        route
    )
    | StrOutputParser()
).with_types(input_type=InputChat)
