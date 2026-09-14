"""Minimal built-in translations for English and Russian.

Kept as a plain dict instead of a full i18n framework (gettext, fluent, ...)
because ShopMate only ever needs a handful of short strings — pulling in a
translation framework would be pure overhead for two supported languages.

Bot messages use aiogram's HTML parse mode (see bot/main.py), so these
templates freely use <b>, <i>, and <blockquote> — Telegram renders all
three natively in message bubbles.
"""

TEXTS: dict[str, dict[str, str]] = {
    "choose_language": {
        "en": "🌐 Please choose your language:",
        "ru": "🌐 Пожалуйста, выберите язык:",
    },
    "welcome": {
        "en": "✨ <b>Welcome to {store_name}!</b> ✨\n\n"
        "🛍️ Browse real products, get instant answers, and order — "
        "all right here in the chat. No app, no waiting. 🚀\n\n"
        "<blockquote>💬 Tap a button below to get started</blockquote>",
        "ru": "✨ <b>Добро пожаловать в {store_name}!</b> ✨\n\n"
        "🛍️ Смотрите товары, получайте мгновенные ответы и оформляйте "
        "заказ — прямо здесь, в чате. Без приложений и ожидания. 🚀\n\n"
        "<blockquote>💬 Нажмите на кнопку ниже, чтобы начать</blockquote>",
    },
    "menu_products": {"en": "🛍️ Products", "ru": "🛍️ Товары"},
    "menu_faq": {"en": "💡 FAQ", "ru": "💡 Вопросы"},
    "menu_orders": {"en": "📦 My Orders", "ru": "📦 Мои заказы"},
    "menu_contact": {"en": "💬 Contact", "ru": "💬 Связаться"},
    "back_to_menu": {"en": "⬅️ Back to menu", "ru": "⬅️ Назад в меню"},
    "no_products": {
        "en": "😅 No products available right now — check back soon!",
        "ru": "😅 Пока нет доступных товаров — загляните позже!",
    },
    "product_card": {
        "en": "{badge}✨ <b>{name}</b> ✨\n\n"
        "<blockquote>{description}</blockquote>\n\n"
        "💰 <b>${price}</b>\n"
        "📄 <i>Item {index} of {total}</i>",
        "ru": "{badge}✨ <b>{name}</b> ✨\n\n"
        "<blockquote>{description}</blockquote>\n\n"
        "💰 <b>${price}</b>\n"
        "📄 <i>Товар {index} из {total}</i>",
    },
    "bestseller_badge": {
        "en": "🔥🏆 <b>BESTSELLER</b> 🏆🔥\n",
        "ru": "🔥🏆 <b>ХИТ ПРОДАЖ</b> 🏆🔥\n",
    },
    "order_button": {"en": "✅ Order this now", "ru": "✅ Заказать сейчас"},
    "prev_button": {"en": "◀️ Prev", "ru": "◀️ Назад"},
    "next_button": {"en": "▶️ Next", "ru": "▶️ Далее"},
    "choose_quantity": {"en": "🔢 How many would you like?", "ru": "🔢 Сколько штук?"},
    "ask_name": {"en": "✍️ What's your full name?", "ru": "✍️ Как вас зовут?"},
    "ask_phone": {
        "en": "📱 What's your phone number? <i>(e.g. +998901234567)</i>",
        "ru": "📱 Ваш номер телефона? <i>(например +998901234567)</i>",
    },
    "ask_address": {
        "en": "📍 What's your delivery address?",
        "ru": "📍 Укажите адрес доставки:",
    },
    "order_summary": {
        "en": "🧾 <b>Please confirm your order</b> 🧾\n\n"
        "<blockquote>{item}\n💰 Total: <b>${total}</b></blockquote>\n\n"
        "👤 <b>Name:</b> {full_name}\n"
        "📱 <b>Phone:</b> {phone}\n"
        "📍 <b>Address:</b> {address}",
        "ru": "🧾 <b>Подтвердите заказ</b> 🧾\n\n"
        "<blockquote>{item}\n💰 Итого: <b>${total}</b></blockquote>\n\n"
        "👤 <b>Имя:</b> {full_name}\n"
        "📱 <b>Телефон:</b> {phone}\n"
        "📍 <b>Адрес:</b> {address}",
    },
    "confirm_button": {"en": "✅ Confirm order", "ru": "✅ Подтвердить"},
    "cancel_button": {"en": "❌ Cancel", "ru": "❌ Отмена"},
    "choose_payment": {
        "en": "💳 <b>How would you like to pay?</b>\n"
        "<i>(Or skip this — we'll also confirm by phone 📞)</i>",
        "ru": "💳 <b>Как вы хотите оплатить?</b>\n"
        "<i>(Или пропустите — мы подтвердим по телефону 📞)</i>",
    },
    "pay_with_click": {"en": "💳 Pay with Click", "ru": "💳 Оплатить через Click"},
    "pay_with_payme": {"en": "💳 Pay with Payme", "ru": "💳 Оплатить через Payme"},
    "pay_with_card": {"en": "💳 Pay with card", "ru": "💳 Оплатить картой"},
    "pay_with_stars": {
        "en": "⭐ Pay with Telegram Stars",
        "ru": "⭐ Оплатить через Telegram Stars",
    },
    "payment_link_ready": {
        "en": "🔗 Tap below to complete payment:",
        "ru": "🔗 Нажмите ниже, чтобы завершить оплату:",
    },
    "order_created": {
        "en": "🎉🎊 <b>Thank you!</b> 🎊🎉\n\n"
        "Your order <b>#{order_id}</b> has been placed!\n\n"
        "<blockquote>{progress}</blockquote>\n\n"
        "📞 We'll contact you shortly to confirm delivery. ✨",
        "ru": "🎉🎊 <b>Спасибо!</b> 🎊🎉\n\n"
        "Ваш заказ <b>№{order_id}</b> принят!\n\n"
        "<blockquote>{progress}</blockquote>\n\n"
        "📞 Мы скоро свяжемся с вами для подтверждения доставки. ✨",
    },
    "order_cancelled": {"en": "❌ Order cancelled.", "ru": "❌ Заказ отменён."},
    "no_orders": {
        "en": "📭 You don't have any orders yet.",
        "ru": "📭 У вас пока нет заказов.",
    },
    "order_list_item": {
        "en": "🧾 <b>#{id}</b> — 💰 ${total} — 🕓 {date}\n{progress}",
        "ru": "🧾 <b>№{id}</b> — 💰 ${total} — 🕓 {date}\n{progress}",
    },
    "order_progress_new": {
        "en": "🟢 Placed  ⚪ Processing  ⚪ Completed",
        "ru": "🟢 Оформлен  ⚪ В обработке  ⚪ Завершён",
    },
    "order_progress_processing": {
        "en": "✅ Placed  🟢 Processing  ⚪ Completed",
        "ru": "✅ Оформлен  🟢 В обработке  ⚪ Завершён",
    },
    "order_progress_completed": {
        "en": "✅ Placed  ✅ Processing  🟢 Completed 🎉",
        "ru": "✅ Оформлен  ✅ В обработке  🟢 Завершён 🎉",
    },
    "order_progress_cancelled": {"en": "❌ Cancelled", "ru": "❌ Отменён"},
    "ask_faq_question": {
        "en": "💡 <b>Ask me anything!</b>\n\n"
        "Type your question and I'll do my best to answer instantly ⚡ "
        'Tap "Back to menu" when you\'re done.',
        "ru": "💡 <b>Спрашивайте что угодно!</b>\n\n"
        "Напишите вопрос, и я постараюсь ответить мгновенно ⚡ "
        "Нажмите «Назад в меню», когда закончите.",
    },
    "faq_no_match": {
        "en": "🤔 I couldn't find an answer to that. Try rephrasing, or tap "
        '"Contact" in the main menu to reach us directly. 💬',
        "ru": "🤔 Не смог найти ответ. Попробуйте переформулировать вопрос "
        "или нажмите «Связаться» в главном меню. 💬",
    },
    "ask_contact_message": {
        "en": "✍️ Type your message and we'll get back to you ASAP! ⚡",
        "ru": "✍️ Напишите ваше сообщение, и мы ответим как можно скорее! ⚡",
    },
    "contact_message_sent": {
        "en": "✅ <b>Message sent!</b> We'll reply soon 💬",
        "ru": "✅ <b>Сообщение отправлено!</b> Мы скоро ответим 💬",
    },
    "unsubscribed": {
        "en": "👋 You've been unsubscribed. Send /start anytime to come back!",
        "ru": "👋 Вы отписаны от сообщений. Отправьте /start, чтобы вернуться!",
    },
    "referral_intro": {
        "en": "🎁 <b>Share your personal link and invite friends:</b>\n\n"
        "<blockquote>🔗 {link}</blockquote>",
        "ru": "🎁 <b>Поделитесь своей ссылкой и приглашайте друзей:</b>\n\n"
        "<blockquote>🔗 {link}</blockquote>",
    },
    "cart_abandonment_reminder": {
        "en": "👀✨ Still thinking about <b>{product_name}</b>?\n\n"
        "It's still available — don't miss out! Tap below to order. 🛍️",
        "ru": "👀✨ Всё ещё думаете о <b>{product_name}</b>?\n\n"
        "Товар пока в наличии — не упустите! Нажмите ниже, чтобы заказать. 🛍️",
    },
    "welcome_series_day1": {
        "en": "👋 Just checking in! ✨ Check out our best-selling products "
        "with the 🛍️ Products button.",
        "ru": "👋 Просто напоминаем! ✨ Посмотрите наши популярные товары — кнопка 🛍️ Товары.",
    },
    "welcome_series_day3": {
        "en": "🎁 Still deciding? Use /invite to get your referral link — "
        "ask us about rewards for inviting friends! 🤝",
        "ru": "🎁 Еще не решили? Используйте /invite, чтобы получить "
        "реферальную ссылку — спросите про награды за приглашения! 🤝",
    },
    "error_generic": {
        "en": "⚠️ Something went wrong on our side. Please try again in a moment.",
        "ru": "⚠️ Что-то пошло не так. Пожалуйста, попробуйте снова через минуту.",
    },
}


def t(key: str, lang: str, **kwargs) -> str:
    entry = TEXTS.get(key, {})
    template = entry.get(lang) or entry.get("en") or key
    return template.format(**kwargs) if kwargs else template
