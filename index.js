require('dotenv').config();
const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TIMEZONE = process.env.TIMEZONE || 'Europe/Kyiv';
const SEND_TIME = process.env.SEND_TIME || '08:00';

const [TARGET_HOUR, TARGET_MINUTE] = SEND_TIME.split(':').map(Number);

const GROUPS_DATA = [
    {
        group: "Баракуда",
        address: "вул. Лариси Руденко, 3 (приміщення клініки), кабiнет 008 (сходи вниз, зліва від ресепшена)",
        description: "",
        schedule: { "1": "20:00-21:00", "6": "16.00-17.15" },
        directions: ""
    },
    {
        group: "На Позняках",
        address: "Харківське шосе 57, приміщення соц. служби на другому поверсі.",
        description: "",
        schedule: {
            "0": "19:00-20:15", "1": "19:00-20:15", "2": "19:00-20:15",
            "3": "19:00-20:15", "4": "19:00-20:15", "5": "13:00-14:00, 19:00-20:15", "6": "19:00-20:15"
        },
        directions: ""
    },
    {
        group: "Вінтаж",
        address: "Івана Миколайчука, 11",
        description: "Другий поверх",
        schedule: { "3": "19:00", "4": "19:00", "5": "19:00" },
        directions: ""
    },
    {
        group: "Вишня",
        address: "м. Вишневе, вул. Святошинська 42 ( вхід від проїзджої частини, двері з написом 'Коло сили')",
        description: "",
        schedule: { "6": "18.00-19.00" },
        directions: ""
    },
    {
        group: "Тiльки Сьогоднi",
        address: "https://t.me/+rAqy7n9GjfQ3MjYy",
        description: "Telegram",
        schedule: {
            "0": "08:00, 17:00, 21:00",
            "1": "08:00, 17:00, 21:00",
            "2": "08:00, 17:00, 21:00",
            "3": "08:00, 17:00, 21:00",
            "4": "08:00, 17:00, 21:00",
            "5": "08:00, 17:00, 21:00, 1:00 (Нічна група)",
            "6": "08:00, 17:00, 21:00, 1:00 (Нічна група)"
        },
        directions: ""
    },
    {
        group: "На часі",
        address: "вул. Межигірська 22 (вхід у дворі, под’їзд з цифрою п’ять)",
        description: "Якщо не можете знайти, зателефонуйте за номером:  380984170324,",
        schedule: {
            "0": "13:00-14:00", 
            "1": "13:00-14:00", 
            "2": "13:00-14:00",
            "3": "13:00-14:00", 
            "4": "13:00-14:00, 19:00-20:15",
            "5": "13:00-14:00", 
            "6": "13:00-14:00"
        },
        directions: "https://youtube.com/shorts/Q7RRhGDwpTw?feature=share"
    },
    {
        group: "Мayday",
        address: "вул.Круглоуніверситетська, 7 р-н Бессарабської пл. м.Хрещатик (напівпідвальне приміщення на розі)",
        description: "По суботах зібрання є открытими, можуть приходити незалежні гості.",
        schedule: {
            "0": "19:00-20:15", "1": "19:00-20:15", "2": "19:00-20:15",
            "3": "19:00-20:15", "4": "19:00-20:15", "5": "19:00-20:15", "6": "19:00-20:15"
        },
        directions: ""
    },
    {
        group: "Мayday online",
        address: "https://t.me/maydayonline",
        description: "Telegram",
        schedule: {
            "0": "8:00, 12:00-13:00, 21:00-22:15",
            "1": "8:00, 12:00-13:00, 21:00-22:15",
            "2": "8:00, 12:00-13:00, 21:00-22:15",
            "3": "8:00, 12:00-13:00, 21:00-22:15",
            "4": "8:00, 12:00-13:00, 21:00-22:15, 23:00",
            "5": "8:00, 12:00-13:00, 21:00-22:15, 23:00",
            "6": "8:00, 12:00-13:00, 21:00-22:15, 23:00"
        },
        directions: ""
    },
    {
        group: "NA Троєщині",
        address: "вул. Сержа Лифаря (Сабурова) 20, приміщення жека 313",
        description: "",
        schedule: {
            "0": "19:00", "1": "19:00", "2": "19:00", "3": "19:00-20:00",
            "4": "19:00", "5": "19:00", "6": "19:00"
        },
        directions: ""
    },
    {
        group: "Парус",
        address: "вул. Довженка, 2. М. Шулявська (у підвалі)",
        description: "Контактний телефон: 066 16 65 149",
        schedule: {
            "0": "19:00-20:30", "1": "19:00-20:30", "3": "19:00-20:30",
            "4": "19:00-20:30", "5": "19:00-20:30", "6": "19:00-20:30"
        },
        directions: "https://youtu.be/RR4sWOMn-AM"
    },
    {
        group: "Сталь",
        address: "вул. Маричанська 5",
        description: "",
        schedule: { "1": "19:00", "3": "19:00", "5": "17:00" },
        directions: "https://youtu.be/KSnhnQy936M"
    },
    {
        group: "Буч-АН-ка",
        address: "м. Буча. вул. Жовтнева 66 ТРЦ Буча - Пассаж 3 поверх. Кімната 136А",
        description: "",
        schedule: { "0": "19:30-20:30", "2": "19:30-20:30", "4": "19:30-20:30" },
        directions: ""
    },
    {
        group: "Нам не все одно",
        address: "пр. Гонгадзе 20 (за Екомаркет маленька будівля з ветклінікою на розі)",
        description: "",
        schedule: {
            "0": "19:00-20:00", "1": "19:00-20:00", "2": "19:00-20:00",
            "3": "19:00-20:00", "4": "19:00-20:00", "5": "19:00-20:00", "6": "19:00-20:00"
        },
        directions: ""
    },
    {
        group: "Воскрєсєнка",
        address: "вулиця Микільсько-Слобідська, 5",
        description: "Для уточнення інформації про зібрання групи звертайтеся до представників групи, телефон для зв'язку: 067 325 11 77",
        schedule: { "2": "17.30", "4": "17.30" },
        directions: ""
    },
    {
        group: "Солом'янка",
        address: "вул. Максима Кривоноса 21",
        description: "",
        schedule: { "0": "19.00-20.00", "4": "19.00-20.00", "6": "17.00-18.00" },
        directions: ""
    },
    {
        group: "В Броварах",
        address: "м. Бровари, вулиця Героїв України 26, 4 поверх, приміщення ліворуч (каб.401)",
        description: "Телефон для довідок: 0636239058",
        schedule: {
            "0": "19.00-20.00", "1": "19.00-20.00", "2": "19.00-20.00",
            "3": "19.00-20.00", "4": "19.00-20.00", "5": "13.00-14.00", "6": "13.00-14.00"
        },
        directions: ""
    },
    {
        group: "Боярка",
        address: "м.Боярка, вул Ярослава мудрого (Дежнева), 62",
        description: "Приміщення соціальної служби (сіра будівля), Номер для зв'язку  380992851660",
        schedule: { "5": "16:00" },
        directions: ""
    },
    {
        group: "Вишгород",
        address: "м.Вишгород, проспект Шевченка 6",
        description: "Контактний телефон: 067-219-40-61 Олександр",
        schedule: { "0": "19:00" },
        directions: ""
    },
    {
        group: "ВУАН (Ветерани України Анонімні Наркомани)",
        address: "Вул. Рогнидинська, 3 (код 236) кім.4",
        description: "Контактний телефон: 096-788-64-90 Евгеній",
        schedule: { "5": "13:00-14:00" },
        directions: ""
    }
];

function formatSchedule(weekdayIdx) {
    const dayStr = String(weekdayIdx);

    // Вс: 0, Пн: 1, ... Сб: 6 (в JS)
    // В Python: Пн: 0, Вт: 1, ... Вс: 6
    // Python weekday() returns 0 for Monday and 6 for Sunday.
    // Luxon weekday returns 1 for Monday and 7 for Sunday.
    // Converting Luxon weekday (1-7) to Python format (0-6):
    const pythonWeekday = weekdayIdx === 7 ? 6 : weekdayIdx - 1;
    const pythonDayStr = String(pythonWeekday);

    const greeting = pythonWeekday === 2 ? "🌞 Добрий день!" : "🌞 Добрий ранок!";
    let message = `${greeting}\nРозклад зібраннь на сьогодні:\n\n`;
    let body = "";

    for (const item of GROUPS_DATA) {
        const time = item.schedule[pythonDayStr];
        if (time) {
            body += `🔹 Група: <b>${item.group}</b>\n`;

            if (item.description === "Telegram") {
                body += `Telegram: ${item.address}\n`;
            } else {
                body += `Адреса: ${item.address}\n`;
            }

            body += `Час: ${time}\n`;

            if (item.description && item.description !== "Telegram") {
                body += `${item.description}\n`;
            }

            if (item.directions) {
                body += `Як пройти до нас: ${item.directions}\n`;
            }

            body += "\n";
        }
    }

    if (!body) {
        return message + "Сьогодні заходів немає.";
    }

    return message + body;
}

async function main() {
    if (!TOKEN || !CHAT_ID) {
        console.error("Ошибка: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы!");
        process.exit(1);
    }

    const bot = new Telegraf(TOKEN);
    const now = DateTime.now().setZone(TIMEZONE);

    // Целевое время отправки сегодня
    const targetTime = now.set({
        hour: TARGET_HOUR,
        minute: TARGET_MINUTE,
        second: 0,
        millisecond: 0
    });

    console.log(`Текущее время в ${TIMEZONE}: ${now.toFormat('HH:mm:ss')}`);
    console.log(`Ожидаемое время отправки: ${SEND_TIME}`);

    if (now < targetTime) {
        const waitMs = targetTime.diff(now).as('milliseconds');
        console.log(`Ждем ${Math.round(waitMs / 1000)} секунд до ${SEND_TIME}...`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
    } else {
        console.log("Время отправки уже наступило или прошло. Отправляем сразу.");
    }

    const finalNow = DateTime.now().setZone(TIMEZONE);
    const weekdayIdx = finalNow.weekday; // 1 (Mon) - 7 (Sun)
    const message = formatSchedule(weekdayIdx);

    console.log(`Отправка расписания (день недели: ${weekdayIdx})...`);

    try {
        await bot.telegram.sendMessage(CHAT_ID, message, {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true }
        });
        console.log("Сообщение успешно отправлено!");
    } catch (error) {
        console.error("Ошибка при отправке:", error);
        process.exit(1);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
