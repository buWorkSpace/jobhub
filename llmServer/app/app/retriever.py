from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS
from config import embedding, RETRIEVER_K, RETRIEVER_WEIGHTS

def create_ensemble_retriever(documents: list[str]) -> EnsembleRetriever:
    bm25_retriever = BM25Retriever.from_texts(
        documents,
        k=RETRIEVER_K
    )
    
    faiss_vectorstore = FAISS.from_texts(
        documents,
        embedding
    )
    faiss_retriever = faiss_vectorstore.as_retriever(
        search_kwargs={"k": RETRIEVER_K}
    )
    
    return EnsembleRetriever(
        retrievers=[bm25_retriever, faiss_retriever],
        weights=RETRIEVER_WEIGHTS
    )