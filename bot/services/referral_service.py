import secrets
import string

_ALPHABET = string.ascii_uppercase + string.digits


def generate_referral_code(length: int = 8) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(length))


def build_referral_link(bot_username: str, referral_code: str) -> str:
    return f"https://t.me/{bot_username}?start=ref_{referral_code}"


def parse_start_payload(payload: str | None) -> str | None:
    """Extract a referral code from a /start deep-link payload, e.g. 'ref_AB12CD34'."""
    if not payload or not payload.startswith("ref_"):
        return None
    code = payload.removeprefix("ref_").strip()
    return code or None
