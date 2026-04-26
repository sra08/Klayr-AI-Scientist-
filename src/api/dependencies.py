from functools import lru_cache
from src.infrastructure.llm.groq_client import GroqClient
from src.domain.ports.llm_client import ILLMClient
from src.infrastructure.search.combined_search import CombinedLitSearch
from src.domain.ports.lit_search import ILitSearch
from src.infrastructure.db.postgres_repo import PostgresRepo
from src.domain.ports.experiment_repo import IExperimentRepo
from src.infrastructure.cache.redis_adapter import RedisAdapter
from src.domain.ports.cache import ICache

from src.infrastructure.db.researcher_repo import ResearcherRepoImpl
from src.infrastructure.notifications.notification_repo import NotificationRepoImpl
from src.domain.ports.researcher_repo import IResearcherRepo
from src.domain.ports.notification_repo import INotificationRepo

@lru_cache
def get_llm_client() -> ILLMClient:
    return GroqClient()

@lru_cache
def get_lit_search() -> ILitSearch:
    return CombinedLitSearch(llm=get_llm_client())

@lru_cache
def get_repo() -> IExperimentRepo:
    return PostgresRepo()

@lru_cache
def get_cache() -> ICache:
    return RedisAdapter()

@lru_cache
def get_researcher_repo() -> IResearcherRepo:
    return ResearcherRepoImpl()

@lru_cache
def get_notification_repo() -> INotificationRepo:
    return NotificationRepoImpl()
