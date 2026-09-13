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

    llm_api_key: str = ""
    llm_api_base: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"

    click_merchant_id: str = ""
    click_service_id: str = ""
    payme_merchant_id: str = ""
    stripe_key: str = ""

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
