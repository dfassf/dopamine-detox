from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-prod"
    DATABASE_URL: str = "sqlite:///./restrainter.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ANTHROPIC_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
