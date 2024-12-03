from langchain_core.chat_history import BaseChatMessageHistory
from pathlib import Path
import re
from typing import Callable, Union
from fastapi import HTTPException
from langchain_community.chat_message_histories import FileChatMessageHistory


def is_it_related_question(llm, user_input):
	prompt = f"""
	주어진 userInput 이 it관련 직무 상담을 받기 위한 본격적인 질문으로 보이면 True를 반환하고, 그렇지 않으면 False를 반환해주세요.
	예시: [("userInput": "안녕 반가워", "answer": "False"), ("userInput": "너가 직무 추천을 잘해?", "answer": "False"), ("userInput": "나는 컴퓨터공학부 4학년인데 코딩을 하고싶어, 어떤 직업이 좋을까?", "answer": "True")]
	userInput: {user_input} 
	"""
	return llm.invoke(prompt).content == 'True'

def format_docs(docs):
	return {'\n'.join([doc.page_content for doc in docs])}

def _is_valid_identifier(value: str) -> bool:
    """Check if the session ID is in a valid format."""
    # Use a regular expression to match the allowed characters
    valid_characters = re.compile(r"^[a-zA-Z0-9-_]+$")
    return bool(valid_characters.match(value))


def create_session_factory(
    base_dir: Union[str, Path],
) -> Callable[[str], BaseChatMessageHistory]:
    """Create a session ID factory that creates session IDs from a base dir.

    Args:
        base_dir: Base directory to use for storing the chat histories.

    Returns:
        A session ID factory that creates session IDs from a base path.
    """
    base_dir_ = Path(base_dir) if isinstance(base_dir, str) else base_dir
    if not base_dir_.exists():
        base_dir_.mkdir(parents=True)

    def get_chat_history(session_id: str) -> FileChatMessageHistory:
        """Get a chat history from a session ID."""
        if not _is_valid_identifier(session_id):
            raise HTTPException(
                status_code=400,
                detail=f"Session ID `{session_id}` is not in a valid format. "
                "Session ID must only contain alphanumeric characters, "
                "hyphens, and underscores.",
            )
        file_path = base_dir_ / f"{session_id}.json"
        return FileChatMessageHistory(str(file_path))

    return get_chat_history