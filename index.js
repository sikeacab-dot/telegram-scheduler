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
        group: "ВУАН (Ветерани України Анонімні Наркомани)",
        address: "вул. Рогнідинська, 3 (код 236) кім. 4",
        description: "Кожну 3-тю суботу місяця робоча зустріч групи о 14:00. Контактна особа: 096 788 64 90 (Євгеній)",
        schedule: { 
            "2": "19:00", 
            "5": "13:00 (Кожну 3-тю суботу робоча зустріч о 14:00)" 
        },
        directions: ""
    },
    {
        group: "Баракуда",
        address: "вул. Лариси Руденко, 3 (приміщення клініки), кабінет 008 (сходи вниз, зліва від ресепшена)",
        description: "3-тя неділя — Формат: Питання/відповіді, 4-та неділя — Формат: Спікерська + висловлювання",
        schedule: { 
            "1": "20:00-21:15 (Формат: Жити чистими)",
            "3": "20:00-21:15 (Формат: Тематичне зібрання)",
            "6": "16:00-17:15 (Формат: Інвентаризація тижня / 3-тя нд: Питання-відповіді / 4-та нд: Спікерська)"
        },
        directions: ""
    },
    {
        group: "На Позняках",
        address: "Харківське шосе 57, приміщення соц. служби на 2-му поверсі",
        description: "Субота — відкрита зустріч. Можуть прийти незалежні гості.",
        schedule: {
            "0": "19:00-20:15",
            "1": "13:00-14:00, 19:00-20:15",
            "2": "19:00-20:15",
            "3": "19:00-20:15",
            "4": "19:00-20:15",
            "5": "13:00-14:00 (Відкрита зустріч), 19:00-20:15",
            "6": "19:00-20:15 (В першу та третю неділю місяця до 20:00)"
        },
        directions: ""
    },
    {
        group: "Вінтаж",
        address: "вул. Івана Миколайчука, 11 (2-й поверх)",
        description: "Третя субота місяця — зібрання до 20:00 (Спікерська), після — робоча зустріч",
        schedule: { 
            "3": "19:00", 
            "4": "19:00", 
            "5": "19:00 (3-тя субота — Спікерська до 20:00, потім робоча)" 
        },
        directions: ""
    },
    {
        group: "Вишня",
        address: "м. Вишневе, вул. Святошинська 42 (вхід від проїжджої частини, двері з написом «Коло сили»)",
        description: "",
        schedule: { 
            "1": "19:30",
            "6": "18:00" 
        },
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
            "5": "08:00, 17:00, 21:00, 01:00 (Нічна група)",
            "6": "08:00, 17:00, 21:00, 01:00 (Нічна група)"
        },
        directions: ""
    },
    {
        group: "На часі",
        address: "вул. Межигірська 22 (вхід у дворі, під’їзд з цифрою 5)",
        description: "Якщо домофон не працює: +380984170324, пошта: nachasi.nagroup.kyivbased@gmail.com",
        schedule: {
            "0": "13:00-14:00",
            "1": "13:00-14:00",
            "2": "13:00-14:00",
            "3": "13:00-14:00",
            "4": "13:00-14:00, 19:00",
            "5": "13:00-14:00, 19:00",
            "6": "13:00-14:00, 19:00"
        },
        directions: "https://youtube.com/shorts/Q7RRhGDwpTw?feature=share"
    },
    {
        group: "Жіноча (від групи «На часі»)",
        address: "вул. Межигірська 22 (вхід у дворі, під’їзд з цифрою 5)",
        description: "Проводиться щонеділі",
        schedule: {
            "6": "15:00-16:00"
        },
        directions: "https://youtube.com/shorts/Q7RRhGDwpTw?feature=share"
    },
    {
        group: "Мayday",
        address: "вул. Круглоуніверситетська, 7 (напівпідвальне приміщення на розі, р-н Бессарабської пл. / м. Хрещатик)",
        description: "По суботах відкрите зібрання, можуть приходити незалежні гості.",
        schedule: {
            "0": "19:00-20:15",
            "1": "19:00-20:15",
            "2": "19:00-20:15",
            "3": "19:00-20:15",
            "4": "19:00-20:15",
            "5": "19:00-20:15 (Відкрите зібрання)",
            "6": "19:00-20:15"
        },
        directions: ""
    },
    {
        group: "Мayday online",
        address: "https://t.me/mayday_NA_online",
        description: "Telegram",
        schedule: {
            "0": "08:00-09:15, 12:00-13:15, 21:00-22:15",
            "1": "08:00-09:15, 12:00-13:15, 21:00-22:15",
            "2": "08:00-09:15, 12:00-13:15, 21:00-22:15",
            "3": "08:00-09:15, 12:00-13:15, 21:00-22:15",
            "4": "08:00-09:15, 12:00-13:15, 21:00-22:15, 23:00-00:15",
            "5": "08:00-09:15, 12:00-13:15, 21:00-22:15, 23:00-00:15",
            "6": "08:00-09:15, 12:00-13:15, 21:00-22:15, 23:00-00:15"
        },
        directions: ""
    },
    {
        group: "NA Троєщині",
        address: "вул. Сержа Лифаря (Сабурова) 20, приміщення ЖЕКу 313",
        description: "",
        schedule: {
            "0": "20:00-21:00 (Відкрите зібрання + бочонки)",
            "1": "19:00-20:00",
            "2": "19:00-20:00",
            "3": "19:00-20:00 (Тематична зустріч «Стосунки і Секс»)",
            "4": "19:00-20:00",
            "5": "19:00-20:00 (1-ша сб місяця — Спікерська; 4-та сб — робоча зустріч о 20:15)",
            "6": "19:00-20:00"
        },
        directions: ""
    },
    {
        group: "Парус",
        address: "вул. Довженка, 2, м. Шулявська (у підвалі)",
        description: "Контактний телефон: +380637291813",
        schedule: {
            "0": "19:00-20:30",
            "1": "19:00-20:30",
            "3": "19:00-20:30",
            "4": "19:00-20:30",
            "5": "19:00-20:30",
            "6": "19:00-20:30"
        },
        directions: "https://youtu.be/RR4sWOMn-AM"
    },
    {
        group: "Сталь",
        address: "вул. Маричанська 5",
        description: "",
        schedule: { 
            "1": "19:00", 
            "3": "19:00", 
            "5": "17:00" 
        },
        directions: "https://youtu.be/KSnhnQy936M"
    },
    {
        group: "Буч-АН-ка",
        address: "м. Буча, вул. Жовтнева 66, ТРЦ «Буча-Пасаж», 3 поверх, кімната 137",
        description: "",
        schedule: { 
            "0": "19:30-20:30",
            "2": "19:30-20:30",
            "4": "19:30-20:30" 
        },
        directions: ""
    },
    {
        group: "Нам не все одно",
        address: "пр. Гонгадзе 20 (за «Екомаркет» маленька будівля з ветклінікою на розі)",
        description: "По середах — відкриті зібрання. По вівторках зустрічі тимчасово не проводяться!",
        schedule: {
            "0": "19:00-20:00",
            "2": "19:00-20:00 (Відкрите зібрання)",
            "3": "19:00-20:00",
            "4": "19:00-20:00",
            "5": "19:00-20:00",
            "6": "19:00-20:00"
        },
        directions: ""
    },
    {
        group: "Воскрєсєнка",
        address: "вул. Микільсько-Слобідська, 5",
        description: "Телефон для зв’язку: 067 325 11 77",
        schedule: { 
            "2": "17:30", 
            "4": "17:30" 
        },
        directions: ""
    },
    {
        group: "Солом'янка",
        address: "вул. Максима Кривоноса 21",
        description: "",
        schedule: { 
            "2": "19:00-20:00", 
            "4": "19:00-20:00", 
            "6": "17:00-18:00" 
        },
        directions: ""
    },
    {
        group: "На Районі",
        address: "вул. Депутатська 32, під'їзд 5, код 77 (підвальне приміщення, спуск наліво по сходам)",
        description: "",
        schedule: {
            "0": "19:00-20:00", 
            "1": "19:00-20:00", 
            "2": "19:00-20:00", 
            "3": "19:00-20:00", 
            "4": "19:00-20:00", 
            "5": "19:00-20:00", 
            "6": "17:00-18:00"
        },
        directions: ""
    },
    {
        group: "В Броварах",
        address: "м. Бровари, вул. Героїв України 26, 4 поверх, каб. 401",
        description: "Телефон: 0636239058. Відкриті зібрання щосуботи. Робочі — 3-й четвер місяця після основного.",
        schedule: {
            "0": "19:00-20:00", 
            "1": "19:00-20:00", 
            "2": "19:00-20:00", 
            "3": "19:00-20:00", 
            "4": "19:00-20:00", 
            "5": "13:00-14:00 (Відкрите зібрання)", 
            "6": "13:00-14:00"
        },
        directions: ""
    },
    {
        group: "Боярка",
        address: "м. Боярка, вул. Ярослава Мудрого (Дєжньова), 62 (приміщення соц. служби, сіра будівля)",
        description: "Номер для зв'язку: +380992851660",
        schedule: { 
            "5": "16:00" 
        },
        directions: ""
    },
    {
        group: "Вишгород",
        address: "м. Вишгород, проспект Шевченка 6",
        description: "Контактний телефон: 067-219-40-61 (Олександр)",
        schedule: { 
            "0": "19:00" 
        },
        directions: ""
    }
];

// Вспомогательная функция для экранирования HTML
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatSchedule(weekdayIdx) {
    // Luxon weekday returns 1 for Monday and 7 for Sunday.
    // Python weekday() returns 0 for Monday and 6 for Sunday.
    const pythonWeekday = weekdayIdx === 7 ? 6 : weekdayIdx - 1;
    const pythonDayStr = String(pythonWeekday);

    const greeting = "🌞 Добрий ранок!";
    let message = `${greeting}\nРозклад зібрань на сьогодні:\n\n`;
    let body = "";

    for (const item of GROUPS_DATA) {
        const time = item.schedule[pythonDayStr];
        if (time) {
            body += `🔹 Група: <b>${escapeHTML(item.group)}</b>\n`;

            if (item.description === "Telegram") {
                body += `Telegram: ${item.address}\n`;
            } else {
                body += `Адреса: ${escapeHTML(item.address)}\n`;
            }

            body += `Час: ${escapeHTML(time)}\n`;

            if (item.description && item.description !== "Telegram") {
                body += `${escapeHTML(item.description)}\n`;
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

    const isManualRun = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';

    if (now < targetTime && !isManualRun) {
        const waitMs = targetTime.diff(now).as('milliseconds');
        console.log(`Ожидаем отправку...`);
        console.log(`- Сейчас: ${now.toFormat('HH:mm:ss')}`);
        console.log(`- Будет отправлено в: ${targetTime.toFormat('HH:mm:ss')}`);
        console.log(`- Нужно подождать: ${Math.round(waitMs / 1000 / 60)} минут`);

        await new Promise(resolve => setTimeout(resolve, waitMs));
    } else if (isManualRun && now < targetTime) {
        console.log(`Ручной запуск: отправляем немедленно, не дожидаясь ${SEND_TIME}.`);
    } else {
        console.log(`Время отправки (${SEND_TIME}) уже наступило или прошло. Отправляем немедленно.`);
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
