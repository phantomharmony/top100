import asyncio
import logging
import os
from datetime import datetime, timezone
from typing import Dict

import aiosqlite
from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
)

# -----------------------------
# Configuration
# -----------------------------
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
DB_PATH = os.getenv("DB_PATH", "/data/smart_order.db")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("smart-order-bot")

router = Router()


# -----------------------------
# FSM States
# -----------------------------
class IncidentFSM(StatesGroup):
    waiting_for_language = State()
    waiting_for_photo = State()
    waiting_for_location = State()


LANGUAGE_BUTTONS: Dict[str, str] = {
    "🇰🇿 Қазақша": "kz",
    "🇷🇺 Русский": "ru",
    "🇬🇧 English": "en",
}


TEXTS: Dict[str, Dict[str, str]] = {
    "ru": {
        "language_prompt": "Выберите язык / Тілді таңдаңыз / Select language:",
        "language_saved": "✅ Язык обновлен: Русский.",
        "start_greeting": (
            "👋 Добро пожаловать в *Smart-Order*.\n\n"
            "Миссия проекта — поддержка инициатив *Таза Қазақстан*, "
            "*Адал Азамат* и принципов *Law & Order*.\n\n"
            "📷 Шаг 1: Отправьте фото проблемы (мусор, вандализм, повреждения).\n"
            "🌐 Для смены языка: /language"
        ),
        "photo_received": "✅ Фото принято.\n📍 Шаг 2: Отправьте геолокацию кнопкой ниже.",
        "photo_required": "Пожалуйста, отправьте *фото* проблемы.",
        "location_required": "Пожалуйста, отправьте *геолокацию* кнопкой ниже.",
        "send_location_btn": "📍 Отправить геолокацию",
        "session_error": "Ошибка сессии. Пожалуйста, начните снова: /start",
        "ticket_message": (
            "✅ Заявка принята!\n\n"
            "🎫 Ticket ID: *{ticket_id}*\n"
            "Спасибо за вклад в *Таза Қазақстан*!"
        ),
    },
    "kz": {
        "language_prompt": "Тілді таңдаңыз / Выберите язык / Select language:",
        "language_saved": "✅ Тіл жаңартылды: Қазақша.",
        "start_greeting": (
            "👋 *Smart-Order* жүйесіне қош келдіңіз.\n\n"
            "Жобаның миссиясы — *Таза Қазақстан*, *Адал Азамат* және "
            "*Law & Order* қағидаттарын қолдау.\n\n"
            "📷 1-қадам: Мәселенің фотосын жіберіңіз (қоқыс, вандализм, зақымдану).\n"
            "🌐 Тілді өзгерту үшін: /language"
        ),
        "photo_received": "✅ Фото қабылданды.\n📍 2-қадам: Төмендегі батырмамен геолокацияны жіберіңіз.",
        "photo_required": "Өтінеміз, мәселенің *фотосын* жіберіңіз.",
        "location_required": "Өтінеміз, төмендегі батырмамен *геолокацияны* жіберіңіз.",
        "send_location_btn": "📍 Геолокацияны жіберу",
        "session_error": "Сессия қатесі. Қайта бастаңыз: /start",
        "ticket_message": (
            "✅ Өтініш қабылданды!\n\n"
            "🎫 Ticket ID: *{ticket_id}*\n"
            "*Таза Қазақстанға* үлесіңіз үшін рақмет!"
        ),
    },
    "en": {
        "language_prompt": "Select language / Выберите язык / Тілді таңдаңыз:",
        "language_saved": "✅ Language updated: English.",
        "start_greeting": (
            "👋 Welcome to *Smart-Order*.\n\n"
            "Our mission supports *Taza Qazaqstan*, *Adal Azamat*, "
            "and *Law & Order* values.\n\n"
            "📷 Step 1: Send a photo of the issue (trash, vandalism, damage).\n"
            "🌐 To change language: /language"
        ),
        "photo_received": "✅ Photo received.\n📍 Step 2: Share your location using the button below.",
        "photo_required": "Please send a *photo* of the issue.",
        "location_required": "Please share your *location* using the button below.",
        "send_location_btn": "📍 Share location",
        "session_error": "Session error. Please restart: /start",
        "ticket_message": (
            "✅ Report submitted!\n\n"
            "🎫 Ticket ID: *{ticket_id}*\n"
            "Thank you for supporting *Taza Qazaqstan*!"
        ),
    },
}


# -----------------------------
# Database Layer
# -----------------------------
class Database:
    def __init__(self, path: str):
        self.path = path

    async def init(self) -> None:
        async with aiosqlite.connect(self.path) as db:
            await db.execute("PRAGMA journal_mode=WAL;")
            await db.execute("PRAGMA foreign_keys=ON;")
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS incidents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    photo_id TEXT NOT NULL,
                    lat REAL NOT NULL,
                    lon REAL NOT NULL,
                    status TEXT NOT NULL DEFAULT 'new',
                    timestamp TEXT NOT NULL
                );
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS user_settings (
                    user_id INTEGER PRIMARY KEY,
                    language TEXT NOT NULL DEFAULT 'ru'
                );
                """
            )
            await db.commit()
        logger.info("Database initialized at %s", self.path)

    async def get_user_language(self, user_id: int) -> str | None:
        async with aiosqlite.connect(self.path) as db:
            cursor = await db.execute(
                "SELECT language FROM user_settings WHERE user_id = ?",
                (user_id,),
            )
            row = await cursor.fetchone()
            return row[0] if row else None

    async def set_user_language(self, user_id: int, language: str) -> None:
        async with aiosqlite.connect(self.path) as db:
            await db.execute(
                """
                INSERT INTO user_settings (user_id, language)
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET language = excluded.language
                """,
                (user_id, language),
            )
            await db.commit()

    async def insert_incident(
        self,
        user_id: int,
        photo_id: str,
        lat: float,
        lon: float,
        status: str = "new",
    ) -> int:
        ts = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.path) as db:
            cursor = await db.execute(
                """
                INSERT INTO incidents (user_id, photo_id, lat, lon, status, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (user_id, photo_id, lat, lon, status, ts),
            )
            await db.commit()
            return cursor.lastrowid


db = Database(DB_PATH)


def tr(lang: str, key: str) -> str:
    safe_lang = lang if lang in TEXTS else "ru"
    return TEXTS[safe_lang][key]


def detect_default_language(telegram_lang_code: str | None) -> str:
    if not telegram_lang_code:
        return "ru"
    normalized = telegram_lang_code.lower()
    if normalized.startswith("kk"):
        return "kz"
    if normalized.startswith("en"):
        return "en"
    return "ru"


def language_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🇰🇿 Қазақша"), KeyboardButton(text="🇷🇺 Русский")],
            [KeyboardButton(text="🇬🇧 English")],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def location_keyboard(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=tr(lang, "send_location_btn"), request_location=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


async def resolve_user_language(message: Message) -> str:
    user_id = message.from_user.id
    stored = await db.get_user_language(user_id)
    if stored in TEXTS:
        return stored
    default_lang = detect_default_language(getattr(message.from_user, "language_code", None))
    await db.set_user_language(user_id, default_lang)
    return default_lang


def generate_ticket_id(incident_id: int) -> str:
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"SO-{date_part}-{incident_id:06d}"


async def notify_admin_placeholder(
    ticket_id: str, user_id: int, lat: float, lon: float
) -> None:
    """
    Placeholder for admin notification.
    Later you can send this to:
    - admin Telegram chat
    - email
    - Streamlit notification queue
    """
    logger.info(
        "ADMIN_NOTIFY_PLACEHOLDER | ticket=%s user_id=%s lat=%.6f lon=%.6f",
        ticket_id,
        user_id,
        lat,
        lon,
    )


# -----------------------------
# Handlers
# -----------------------------
@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    lang = await resolve_user_language(message)
    await message.answer(tr(lang, "start_greeting"), parse_mode="Markdown")
    await state.set_state(IncidentFSM.waiting_for_photo)


@router.message(Command("language"))
async def cmd_language(message: Message, state: FSMContext) -> None:
    current_lang = await resolve_user_language(message)
    await state.set_state(IncidentFSM.waiting_for_language)
    await message.answer(
        tr(current_lang, "language_prompt"),
        reply_markup=language_keyboard(),
    )


@router.message(IncidentFSM.waiting_for_language)
async def process_language_choice(message: Message, state: FSMContext) -> None:
    selected = LANGUAGE_BUTTONS.get((message.text or "").strip())
    if not selected:
        current_lang = await resolve_user_language(message)
        await message.answer(
            tr(current_lang, "language_prompt"),
            reply_markup=language_keyboard(),
        )
        return

    await db.set_user_language(message.from_user.id, selected)
    await message.answer(
        tr(selected, "language_saved"),
        reply_markup=ReplyKeyboardRemove(),
    )
    await message.answer(tr(selected, "start_greeting"), parse_mode="Markdown")
    await state.set_state(IncidentFSM.waiting_for_photo)


@router.message(IncidentFSM.waiting_for_photo, F.photo)
async def process_photo(message: Message, state: FSMContext) -> None:
    lang = await resolve_user_language(message)
    # Choose highest resolution photo
    photo_id = message.photo[-1].file_id
    await state.update_data(photo_id=photo_id)

    await message.answer(
        tr(lang, "photo_received"),
        reply_markup=location_keyboard(lang),
    )
    await state.set_state(IncidentFSM.waiting_for_location)


@router.message(IncidentFSM.waiting_for_photo)
async def photo_required(message: Message) -> None:
    lang = await resolve_user_language(message)
    await message.answer(tr(lang, "photo_required"), parse_mode="Markdown")


@router.message(IncidentFSM.waiting_for_location, F.location)
async def process_location(message: Message, state: FSMContext) -> None:
    lang = await resolve_user_language(message)
    data = await state.get_data()
    photo_id = data.get("photo_id")

    if not photo_id:
        await message.answer(tr(lang, "session_error"))
        await state.clear()
        return

    user_id = message.from_user.id
    lat = float(message.location.latitude)
    lon = float(message.location.longitude)

    incident_id = await db.insert_incident(
        user_id=user_id,
        photo_id=photo_id,
        lat=lat,
        lon=lon,
        status="new",
    )

    ticket_id = generate_ticket_id(incident_id)
    await notify_admin_placeholder(ticket_id, user_id, lat, lon)

    await message.answer(
        tr(lang, "ticket_message").format(ticket_id=ticket_id),
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )
    await state.clear()


@router.message(IncidentFSM.waiting_for_location)
async def location_required(message: Message) -> None:
    lang = await resolve_user_language(message)
    await message.answer(
        tr(lang, "location_required"),
        parse_mode="Markdown",
        reply_markup=location_keyboard(lang),
    )


# -----------------------------
# App Entry Point
# -----------------------------
async def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN is not set. Please provide BOT_TOKEN environment variable.")

    await db.init()

    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)

    logger.info("Smart-Order bot started")
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()
        logger.info("Smart-Order bot stopped")


if __name__ == "__main__":
    asyncio.run(main())
