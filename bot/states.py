from aiogram.fsm.state import State, StatesGroup


class OrderStates(StatesGroup):
    choosing_quantity = State()
    waiting_name = State()
    waiting_phone = State()
    waiting_address = State()
    confirming = State()


class FAQStates(StatesGroup):
    asking = State()


class ContactStates(StatesGroup):
    waiting_message = State()
