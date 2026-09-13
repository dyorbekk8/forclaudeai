"""Minimal built-in translations for English and Russian.

Kept as a plain dict instead of a full i18n framework (gettext, fluent, ...)
because ShopMate only ever needs a handful of short strings — pulling in a
translation framework would be pure overhead for two supported languages.
"""

TEXTS: dict[str, dict[str, str]] = {
    "choose_language": {
        "en": "Please choose your language:",
        "ru": "Пожалуйста, выберите язык:",
    },
    "welcome": {
        "en": "👋 Welcome to {store_name}! I can show you our products, "
        "answer questions, and take your order — right here in Telegram.",
        "ru": "👋 Добро пожаловать в {store_name}! Я покажу товары, отвечу "
        "на вопросы и приму заказ — прямо здесь, в Telegram.",
    },
    "menu_products": {"en": "🛍 Products", "ru": "🛍 Товары"},
    "menu_faq": {"en": "❓ FAQ", "ru": "❓ Вопросы"},
    "menu_orders": {"en": "📦 My Orders", "ru": "📦 Мои заказы"},
    "menu_contact": {"en": "📞 Contact", "ru": "📞 Связаться"},
    "back_to_menu": {"en": "⬅️ Back to menu", "ru": "⬅️ Назад в меню"},
    "no_products": {
        "en": "No products available right now — check back soon!",
        "ru": "Пока нет доступных товаров — загляните позже!",
    },
    "product_card": {
        "en": "<b>{name}</b>\n{description}\n\n💵 Price: ${price}\n\n({index}/{total})",
        "ru": "<b>{name}</b>\n{description}\n\n💵 Цена: ${price}\n\n({index}/{total})",
    },
    "order_button": {"en": "✅ Order this", "ru": "✅ Заказать"},
    "prev_button": {"en": "◀️ Prev", "ru": "◀️ Назад"},
    "next_button": {"en": "▶️ Next", "ru": "▶️ Далее"},
    "choose_quantity": {"en": "How many would you like?", "ru": "Сколько штук?"},
    "ask_name": {"en": "What's your full name?", "ru": "Как вас зовут?"},
    "ask_phone": {
        "en": "What's your phone number? (e.g. +998901234567)",
        "ru": "Ваш номер телефона? (например +998901234567)",
    },
    "ask_address": {
        "en": "What's your delivery address?",
        "ru": "Укажите адрес доставки:",
    },
    "order_summary": {
        "en": "<b>Please confirm your order:</b>\n\n{item}\nTotal: ${total}\n\n"
        "Name: {full_name}\nPhone: {phone}\nAddress: {address}",
        "ru": "<b>Подтвердите заказ:</b>\n\n{item}\nИтого: ${total}\n\n"
        "Имя: {full_name}\nТелефон: {phone}\nАдрес: {address}",
    },
    "confirm_button": {"en": "✅ Confirm order", "ru": "✅ Подтвердить"},
    "cancel_button": {"en": "❌ Cancel", "ru": "❌ Отмена"},
    "order_created": {
        "en": "🎉 Thank you! Your order #{order_id} has been placed. "
        "We'll contact you shortly to confirm delivery.",
        "ru": "🎉 Спасибо! Ваш заказ №{order_id} принят. Мы скоро свяжемся "
        "с вами для подтверждения доставки.",
    },
    "order_cancelled": {"en": "Order cancelled.", "ru": "Заказ отменён."},
    "no_orders": {
        "en": "You don't have any orders yet.",
        "ru": "У вас пока нет заказов.",
    },
    "order_list_item": {
        "en": "#{id} — {status} — ${total} — {date}",
        "ru": "№{id} — {status} — ${total} — {date}",
    },
    "ask_faq_question": {
        "en": "Type your question and I'll try to answer it. Tap "
        "\"Back to menu\" when you're done.",
        "ru": "Напишите свой вопрос, и я постараюсь на него ответить. "
        "Нажмите «Назад в меню», когда закончите.",
    },
    "faq_no_match": {
        "en": "I couldn't find an answer to that. Try rephrasing, or tap "
        "\"Contact\" in the main menu to reach us directly.",
        "ru": "Не смог найти ответ. Попробуйте переформулировать вопрос "
        "или нажмите «Связаться» в главном меню.",
    },
    "ask_contact_message": {
        "en": "Type your message and we'll get back to you as soon as possible.",
        "ru": "Напишите ваше сообщение, и мы ответим как можно скорее.",
    },
    "contact_message_sent": {
        "en": "✅ Your message has been sent. We'll reply soon!",
        "ru": "✅ Сообщение отправлено. Мы скоро ответим!",
    },
    "unsubscribed": {
        "en": "You've been unsubscribed from messages. Send /start anytime to come back.",
        "ru": "Вы отписаны от сообщений. Отправьте /start, чтобы вернуться.",
    },
    "referral_intro": {
        "en": "Share your personal link and invite friends:\n{link}",
        "ru": "Поделитесь своей ссылкой и приглашайте друзей:\n{link}",
    },
    "cart_abandonment_reminder": {
        "en": "👀 Still thinking about <b>{product_name}</b>? It's still "
        "available — tap below to order.",
        "ru": "👀 Всё ещё думаете о <b>{product_name}</b>? Товар пока в "
        "наличии — нажмите ниже, чтобы заказать.",
    },
    "welcome_series_day1": {
        "en": "👋 Just checking in! Have a look at our best-selling products "
        "with the 🛍 Products button.",
        "ru": "👋 Просто напоминаем! Посмотрите наши популярные товары — "
        "кнопка 🛍 Товары.",
    },
    "welcome_series_day3": {
        "en": "🎁 Still deciding? Use /invite to get a referral link — "
        "ask us about rewards for inviting friends!",
        "ru": "🎁 Еще не решили? Используйте /invite, чтобы получить "
        "реферальную ссылку — спросите нас о наградах за приглашения!",
    },
    "error_generic": {
        "en": "Something went wrong on our side. Please try again in a moment.",
        "ru": "Что-то пошло не так. Пожалуйста, попробуйте снова через минуту.",
    },
}


def t(key: str, lang: str, **kwargs) -> str:
    entry = TEXTS.get(key, {})
    template = entry.get(lang) or entry.get("en") or key
    return template.format(**kwargs) if kwargs else template
