// Таблица базовых уровней заклинаний по путям
const pathLevels = {
    "пламени": 0,
    "грозы": 0,
    "дождя": 0,
    "мороза": 0,
    "цветения": 0,
    "камня": 0,
    "руды": 0,
    "ветра": 0,
    "звука": 0,
    "миража": 1,
    "жизни": 0,
    "смерти": 2,
    "души": 2
};

// Функция для склонения слова в зависимости от числа
function getPluralForm(number, one, two, five) {
    const lastDigit = number % 10;
    if (number % 100 >= 11 && number % 100 <= 14) {
        return five;
    }
    if (lastDigit === 1) {
        return one;
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return two;
    } else {
        return five;
    }
}

function calculateSpellLevel(spellData) {
    let level = 0;
    
    // Базовый уровень по пути
    if (spellData.path && pathLevels[spellData.path]) {
        level += pathLevels[spellData.path];
    }
    
    // Модификаторы за время накладывания
    if (spellData.castingTime === "instant") {
        level += 0.5;
    } else if (spellData.castingTime) {
        const castingTurns = parseInt(spellData.castingTime);
        level += 0.5 - castingTurns * 0.15;
    }
    
    // Модификаторы за длительность
    if (spellData.duration === "none") {
        level += 0;
    } else if (spellData.duration === "permanent") {
        level += 2.5;
    } else if (spellData.duration) {
        const durationTurns = parseInt(spellData.duration);
        level += durationTurns * 0.15;
    }
    
    // Модификаторы за дистанцию
    if (spellData.distance) {
        const distance = parseInt(spellData.distance);
        level += distance * 0.08;
    }
    
    // Модификаторы за радиус
    if (spellData.radius) {
        const radius = parseInt(spellData.radius);
        level += radius * 0.25;
    }
    
    // Модификаторы за урон
    if (spellData.damage && spellData.damage !== "none") {
        const damageModifiers = {
            "minor": 0.1,
            "small": 0.3,
            "medium": 0.8,
            "serious": 1.5,
            "lethal": 2.5,
            "disintegration": 4.0
        };
        level += damageModifiers[spellData.damage] || 0;
    }
    
    // Возвращаем нецелый уровень для расчета маны
    return level;
}

function calculateManaCost(level) {
    // Расчет маны на основе нецелого уровня
    let baseMana;
    if (level <= 1.9) {
        baseMana = 2 + (level - 1) * 3; // 2-5 для уровня 1
    } else if (level <= 2.9) {
        baseMana = 6 + (level - 2) * 9; // 6-15 для уровня 2
    } else if (level <= 3.9) {
        baseMana = 16 + (level - 3) * 9; // 16-25 для уровня 3
    } else if (level <= 4.9) {
        baseMana = 26 + (level - 4) * 14; // 26-40 для уровня 4
    } else {
        baseMana = 50 + (level - 5) * 50; // 50-100 для уровня 5+
    }
    
    return Math.floor(baseMana);
}

function toRoman(num) {
    const values = [5, 4, 1];
    const symbols = ['V', 'IV', 'I'];
    let result = '';
    
    for (let i = 0; i < values.length; i++) {
        while (num >= values[i]) {
            result += symbols[i];
            num -= values[i];
        }
    }
    
    return result;
}

function generateSpell(spellData) {
    // Проверки на заполненность обязательных полей
    if (!spellData.name) {
        return "Название заклинания обязательно!";
    }
    if (!spellData.path) {
        return "Выбери путь заклинания!";
    }
    if (!spellData.castingTime) {
        return "Укажи время накладывания!";
    }
    if (!spellData.duration) {
        return "Укажи длительность!";
    }
    
    const rawLevel = calculateSpellLevel(spellData);
    const manaCost = calculateManaCost(rawLevel);
    
    // Определяем уровень для отображения на основе диапазонов маны
    let displayLevel;
    if (rawLevel <= 1.9) {
        displayLevel = 1;
    } else if (rawLevel <= 2.9) {
        displayLevel = 2;
    } else if (rawLevel <= 3.9) {
        displayLevel = 3;
    } else if (rawLevel <= 4.9) {
        displayLevel = 4;
    } else {
        displayLevel = 5;
    }
    
    const romanLevel = toRoman(displayLevel);
    
    // Форматирование времени накладывания
    let castingTimeText = "";
    if (spellData.castingTime === "instant") {
        castingTimeText = "Мгновенно";
    } else {
        const turns = parseInt(spellData.castingTime);
        const turnText = getPluralForm(turns, "ход", "хода", "ходов");
        castingTimeText = `${turns} ${turnText}`;
    }
    
    // Форматирование длительности
    let durationText = "";
    if (spellData.duration === "none") {
        durationText = null; // Не показываем эту строку
    } else if (spellData.duration === "permanent") {
        durationText = "Постоянно";
    } else {
        const turns = parseInt(spellData.duration);
        const turnText = getPluralForm(turns, "ход", "хода", "ходов");
        durationText = `${turns} ${turnText}`;
    }
    
    // Форматирование дистанции и радиуса
    const distance = parseInt(spellData.distance) || 0;
    const radius = parseInt(spellData.radius) || 0;
    
    const distanceText = distance === 0 ? "Касание" : `${distance} м`;
    
    // Форматирование пути с правильными падежами
    const pathPhrases = {
        "пламени": "Путь Пламени",
        "грозы": "Путь Грозы",
        "дождя": "Путь Дождя",
        "мороза": "Путь Мороза",
        "цветения": "Путь Цветения",
        "камня": "Путь Камня",
        "руды": "Путь Руды",
        "ветра": "Путь Ветра",
        "звука": "Путь Звука",
        "миража": "Путь Миража",
        "жизни": "Путь Жизни",
        "смерти": "Путь Смерти",
        "души": "Путь Души"
    };
    
    const pathText = pathPhrases[spellData.path] || `Путь ${spellData.path}`;
    
    // Собираем результат
    let result = `
<div class="spell-result">
    <h3>${spellData.name} ${romanLevel}</h3>
    <p class="spell-path"><em>${pathText}</em></p>
    <p><strong>Время накладывания:</strong> ${castingTimeText}</p>`;
    
    if (durationText) {
        result += `<p><strong>Длительность:</strong> ${durationText}</p>`;
    }
    
    result += `<p><strong>Дистанция:</strong> ${distanceText}</p>`;
    
    if (radius > 0) {
        result += `<p><strong>Радиус действия:</strong> ${radius} м</p>`;
    }
    
    if (spellData.damage && spellData.damage !== "none") {
        const damageTexts = {
            "minor": "Незначительный",
            "small": "Малый", 
            "medium": "Средний",
            "serious": "Серьёзный",
            "lethal": "Смертельный",
            "disintegration": "Дезинтеграция"
        };
        result += `<p><strong>Урон:</strong> ${damageTexts[spellData.damage]}</p>`;
    }
    
    if (spellData.description) {
        result += `<p><strong>Описание:</strong> ${spellData.description}</p>`;
    }
    
    result += `<p><strong>Маназатратность:</strong> ${manaCost} ед. маны</p>
    <button onclick="copySpell()" class="copy-button">Копировать заклинание</button>
</div>`;
    
    return result;
}

function handlePathChange() {
    const pathSelect = document.getElementById("spellPath");
    const customPathInput = document.getElementById("customPath");
    
    if (pathSelect.value === "custom") {
        customPathInput.style.display = "block";
        customPathInput.required = true;
    } else {
        customPathInput.style.display = "none";
        customPathInput.required = false;
    }
}

function copySpell() {
    const spellText = document.querySelector('.spell-result').innerText;
    navigator.clipboard.writeText(spellText).then(() => {
        alert('Заклинание скопировано!');
    });
}

// Обработчик формы
document.getElementById("spellForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const pathSelect = document.getElementById("spellPath");
    const customPathInput = document.getElementById("customPath");
    
    // Определяем путь
    let selectedPath = pathSelect.value;
    if (selectedPath === "custom") {
        selectedPath = customPathInput.value.trim();
    }

    const spellData = {
        name: document.getElementById("spellName").value.trim(),
        path: selectedPath,
        castingTime: document.getElementById("castingTime").value,
        duration: document.getElementById("duration").value,
        distance: document.getElementById("distance").value,
        radius: document.getElementById("radius").value,
        damage: document.getElementById("damage").value,
        description: document.getElementById("description").value.trim()
    };

    const result = generateSpell(spellData);
     document.getElementById("result").innerHTML = result;
});