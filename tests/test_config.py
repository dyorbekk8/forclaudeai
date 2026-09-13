from bot.config import Settings


def test_blank_owner_telegram_id_does_not_crash():
    """OWNER_TELEGRAM_ID='' in a real .env file (left blank on purpose) must
    not fail validation just because it's an empty string, not an int."""
    settings = Settings(owner_telegram_id="")
    assert settings.owner_telegram_id == 0


def test_real_owner_telegram_id_is_parsed():
    settings = Settings(owner_telegram_id="123456789")
    assert settings.owner_telegram_id == 123456789
