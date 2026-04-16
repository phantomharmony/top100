import asyncio
import logging
import os
from datetime import datetime, timezone

import aiosqlite
from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import CommandStart
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
    waiting_for_photo = State()
    waiting_for_location = State()


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
            await db.commit()
        logger.info("Database initialized at %s", self.path)

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
    greeting = (
        "👋 Сәлем! Добро пожаловать в *Smart-Order*.\n\n"
        "Бұл жоба *Таза Қазақстан* идеясын қолдайды.\n"
        "Этот бот помогает оперативно сообщать о проблемах: мусор, вандализм, "
        "повреждения инфраструктуры.\n\n"
        "📷 1-қадам / Шаг 1: Отправьте фото проблемы."
    )
    await message.answer(greeting, parse_mode="Markdown")
    await state.set_state(IncidentFSM.waiting_for_photo)


@router.message(IncidentFSM.waiting_for_photo, F.photo)
async def process_photo(message: Message, state: FSMContext) -> None:
    # Choose highest resolution photo
    photo_id = message.photo[-1].file_id
    await state.update_data(photo_id=photo_id)

    location_keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📍 Отправить геолокацию", request_location=True)]
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )

    await message.answer(
        "✅ Фото принято.\n"
        "📍 2-қадам / Шаг 2: Отправьте вашу геолокацию кнопкой ниже.",
        reply_markup=location_keyboard,
    )
    await state.set_state(IncidentFSM.waiting_for_location)


@router.message(IncidentFSM.waiting_for_photo)
async def photo_required(message: Message) -> None:
    await message.answer("Пожалуйста, отправьте *фото* проблемы.", parse_mode="Markdown")


@router.message(IncidentFSM.waiting_for_location, F.location)
async def process_location(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    photo_id = data.get("photo_id")

    if not photo_id:
        await message.answer("Ошибка сессии. Пожалуйста, начните снова: /start")
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
        f"✅ Өтініш қабылданды / Заявка принята!\n\n"
        f"🎫 Ticket ID: *{ticket_id}*\n"
        f"Рақмет! Спасибо за вклад в *Таза Қазақстан*.",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )
    await state.clear()


@router.message(IncidentFSM.waiting_for_location)
async def location_required(message: Message) -> None:
    await message.answer(
        "Пожалуйста, отправьте *геолокацию* через кнопку «📍 Отправить геолокацию».",
        parse_mode="Markdown",
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
