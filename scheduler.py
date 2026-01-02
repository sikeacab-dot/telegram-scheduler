import os
import datetime
import pytz
import logging
import asyncio
from telegram import Bot
from dotenv import load_dotenv

# Загружаем переменные из .env
load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
SEND_TIME = os.getenv("SEND_TIME", "08:00")
TIMEZONE_STR = os.getenv("TIMEZONE", "Europe/Kyiv")

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Расписание на каждый день
SCHEDULE = {
    0: "📅 Понедельник:\n1. Утренняя разминка\n2. Работа с документами\n3. Английский язык",
    1: "📅 Вторник:\n1. Планерка\n2. Техническое обслуживание\n3. Чтение книги",
    2: "📅 Среда:\n1. Вебинар\n2. Подготовка отчета\n3. Прогулка",
    3: "📅 Четверг:\n1. Написание кода\n2. Ревью проекта\n3. Поход в спортзал",
    4: "📅 Пятница:\n1. Аналитика за неделю\n2. Завершение задач\n3. Киновечер",
    5: "📅 Суббота:\n1. Отдых на природе\n2. Уборка\n3. Хобби",
    6: "📅 Воскресенье:\n1. Планирование следующей недели\n2. Медитация\n3. Семейный ужин"
}

async def send_message(bot, message):
    try:
        await bot.send_message(chat_id=CHAT_ID, text=message)
        logging.info("Сообщение успешно отправлено!")
    except Exception as e:
        logging.error(f"Ошибка при отправке: {e}")

async def main():
    if not TOKEN or not CHAT_ID:
        print("Ошибка: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы!")
        return

    bot = Bot(token=TOKEN)
    tz = pytz.timezone(TIMEZONE_STR)
    
    print(f"Бот запущен. Ожидаем время {SEND_TIME} ({TIMEZONE_STR}).")
    
    last_sent_date = None

    while True:
        now = datetime.datetime.now(tz)
        current_time_str = now.strftime("%H:%M")
        current_date = now.date()



        # Проверяем, наступило ли время отправки и не отправляли ли мы уже сегодня
        if current_time_str == SEND_TIME and last_sent_date != current_date:
            weekday = now.weekday()
            message = SCHEDULE.get(weekday, "На сегодня расписание не задано!")
            await send_message(bot, message)
            last_sent_date = current_date
            
        # Спим 30 секунд перед следующей проверкой
        await asyncio.sleep(30)

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nБот остановлен.")
