
import json
from pathlib import Path
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

# Constants
# BASE_MODEL = "gpt-3.5-turbo"
BASE_MODEL = "gpt-4o-mini"
RETRIEVER_K = 7
RETRIEVER_WEIGHTS = [0.5, 0.5]

# Initialize components
llm = ChatOpenAI(model=BASE_MODEL)
embedding = OpenAIEmbeddings()

# Load data
def load_document_data() -> list[str]:
    data_path = Path('../../../jsonDataFolder/final_result_chunking.json')
    with open(data_path, 'r', encoding='utf-8') as f:
        return json.load(f)