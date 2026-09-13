from bot.services.referral_service import (
    build_referral_link,
    generate_referral_code,
    parse_start_payload,
)


def test_generate_referral_code_length_and_charset():
    code = generate_referral_code()
    assert len(code) == 8
    assert code.isalnum()
    assert code == code.upper()


def test_build_referral_link():
    link = build_referral_link("shopmate_bot", "AB12CD34")
    assert link == "https://t.me/shopmate_bot?start=ref_AB12CD34"


def test_parse_start_payload_valid():
    assert parse_start_payload("ref_AB12CD34") == "AB12CD34"


def test_parse_start_payload_invalid_or_missing():
    assert parse_start_payload(None) is None
    assert parse_start_payload("") is None
    assert parse_start_payload("something_else") is None
    assert parse_start_payload("ref_") is None
