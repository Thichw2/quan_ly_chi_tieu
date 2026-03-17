# app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    MONGODB_URI: str = Field(default="mongodb://localhost:27017")
    MONGODB_DB_NAME: str = Field(default="family_expense_db")
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24)
    EMAIL_SERVER: str = Field(..., env="EMAIL_SERVER")
    EMAIL_PORT: int = Field(..., env="EMAIL_PORT")
    EMAIL_USER: str = Field(..., env="EMAIL_USER")
    EMAIL_PASSWORD: str = Field(..., env="EMAIL_PASSWORD")

    class Config:
        env_file = ".env"

settings = Settings()
