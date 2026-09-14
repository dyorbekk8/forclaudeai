from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    bot_token: str = "TEST:TOKEN"
    database_url: str = "sqlite+aiosqlite:///./shopmate.db"
    admin_secret_key: str = "dev-secret-change-me"
    admin_username: str = "admin"
    admin_password: str = "admin"
    owner_telegram_id: int = 0
    store_name: str = "My Shop"
    timezone: str = "Asia/Tashkent"

    bot_display_name: str = ""
    bot_description: str = ""
    bot_short_description: str = ""
    intro_video_url: str = ""

    stars_per_usd: float = 100.0

    llm_api_key: str = ""
    llm_api_base: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"

    click_merchant_id: str = ""
    click_service_id: str = ""
    click_secret_key: str = ""
    payme_merchant_id: str = ""
    payme_secret_key: str = ""
    stripe_key: str = ""
    stripe_webhook_secret: str = ""

    @field_validator("owner_telegram_id", mode="before")
    @classmethod
    def _blank_owner_id_means_unset(cls, value: object) -> object:
        if value == "":
            return 0
        return value

    @property
    def llm_enabled(self) -> bool:
        return bool(self.llm_api_key)

    @property
    def click_enabled(self) -> bool:
        return bool(self.click_merchant_id and self.click_service_id)

    @property
    def payme_enabled(self) -> bool:
        return bool(self.payme_merchant_id)

    @property
    def stripe_enabled(self) -> bool:
        return bool(self.stripe_key)


settings = Settings()
