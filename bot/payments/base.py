from dataclasses import dataclass


@dataclass
class PaymentLink:
    provider: str
    url: str


class PaymentProvider:
    """Loose interface every URL-based payment provider follows: a `key`
    class attribute, an `enabled` property, and a `build_payment_link(order)`
    method returning a `PaymentLink` — sync for Click/Payme (no network call
    needed to build the link), async for Stripe (calls the Stripe API to
    create a Checkout Session). See click.py / payme.py / stripe_provider.py.

    Telegram Stars is not URL-based — it sends a native in-chat invoice — so
    it implements a different method (`send_invoice`) in stars.py instead.
    """

    key: str

    @property
    def enabled(self) -> bool:
        raise NotImplementedError


def enabled_url_providers() -> list[PaymentProvider]:
    from bot.payments.click import click_provider
    from bot.payments.payme import payme_provider
    from bot.payments.stripe_provider import stripe_provider

    providers = [click_provider, payme_provider, stripe_provider]
    return [p for p in providers if p.enabled]
