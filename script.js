'use strict';

const RUS_TO_RUNE = new Map([
    ['а', '𐰀'], ['б', '𐰉'], ['в', '𐰉'], ['г', '𐰍'], ['д', '𐰑'],
    ['е', '𐰅'], ['ё', '𐰅'], ['ж', '𐰕'], ['з', '𐰔'], ['и', '𐰃'],
    ['й', '𐰘'], ['к', '𐰚'], ['л', '𐰞'], ['м', '𐰢'], ['н', '𐰤'],
    ['о', '𐰆'], ['п', '𐰯'], ['р', '𐰺'], ['с', '𐰽'], ['т', '𐱅'],
    ['у', '𐰆'], ['ф', '𐰯'], ['х', '𐰴'], ['ц', '𐰲'], ['ч', '𐰲'],
    ['ш', '𐰾'], ['щ', '𐰾𐰾'], ['ъ', ''], ['ы', '𐰃'], ['ь', ''],
    ['э', '𐰅'], ['ю', '𐰖𐰆'], ['я', '𐰖𐰀']
]);

const UNSUPPORTED = new Set(['ъ', 'ь']);

const TRANSLATION_DICT = {
    'кюль тегин': 'Кюль-Тегин (принц, великий воин)',
    'бильге каган': 'Бильге-каган (мудрый правитель)',
    'тоньюкук': 'Тоньюкук (мудрый советник)',
    'тенгри': 'Тенгри (Вечное Небо)',
    'тюрк': 'тюркский народ',
    'руна': 'руна', 'руны': 'руны',
    'добро': 'добро, благо',
    'пожаловать': 'приветствовать',
    'мир': 'мир, вселенная',
    'солнце': 'солнце (Күн)',
    'небо': 'небо (Тенгри)',
    'земля': 'земля (Йер-Суб)',
    'волк': 'волк (Бөрі)',
    'конь': 'конь (Йылкы)',
    'воин': 'воин (Бағатыр)',
    'каган': 'каган (верховный правитель)',
    'степь': 'степь (Қыр)',
    'отец': 'отец (Ата)',
    'мать': 'мать (Ана)',
    'сын': 'сын (Оғлан)',
    'дочь': 'дочь (Қыз)',
    'народ': 'народ (Бодун)',
    'язык': 'язык (Тіл)',
    'письмо': 'письменность (Жазу)',
    'память': 'память (Ес)',
    'история': 'история (Тарих)',
    'стела': 'каменная стела',
    'надпись': 'надпись (Жазу)',
    'рунаписьмо': 'РунаПисьмо — цифровой инструмент'
};

let rawRussianInput = '';

const runeOutput = document.getElementById('runeOutput');
const translationText = document.getElementById('translationText');
const copyToast = document.getElementById('copyToast');

function convertRussianToRunes(inputStr) {
    let result = '';
    for (const ch of inputStr) {
        if (ch === ' ') {
            result += ' ';
        } else if (/[0-9.,!?;:()\-–—[\]{}<>/\\|`~@#$%^&*+=]/.test(ch)) {
            result += ch;
        } else if (/[а-яё]/i.test(ch)) {
            const rune = RUS_TO_RUNE.get(ch.toLowerCase());
            result += (rune !== undefined) ? rune : ch;
        } else {
            result += ch;
        }
    }
    return result;
}

function getRussianTranslation(russianRaw) {
    const trimmed = russianRaw.trim();
    if (!trimmed) return '—';

    const lower = trimmed.toLowerCase();

    if (lower === 'добро пожаловать в рунаписьмо') {
        return 'Добро пожаловать в РунаПисьмо! Инструмент для возрождения древнетюркских рун.';
    }

    const words = lower.split(/\s+/).filter(Boolean);
    const parts = [];
    let knownCount = 0;

    for (const w of words) {
        if (TRANSLATION_DICT[w]) {
            parts.push(TRANSLATION_DICT[w]);
            knownCount++;
        } else if (w.length > 2 && TRANSLATION_DICT[w.slice(0, -1)]) {
            parts.push(TRANSLATION_DICT[w.slice(0, -1)] + (w.endsWith('и') ? ' (мн.ч.)' : ''));
            knownCount++;
        } else {
            parts.push(`«${w}»`);
        }
    }

    const base = parts.join(' ');

    if (lower.includes('кюль тегин') || lower.includes('бильге')) {
        return base + '. Слава древним воинам Орхона!';
    }
    if (lower.includes('тенгри')) {
        return base + ' — благословение Вечного Неба.';
    }
    if (knownCount === 0) {
        return `Буквальное отображение: «${trimmed}». Погрузитесь в мир древнетюркской письменности!`;
    }
    if (base.length < 50) {
        return base;
    }
    return 'Смысл надписи: ' + base;
}

let toastTimer = null;
let toastResetTimer = null;

function showToast(message, duration = 1500, resetAfter = false) {
    if (!copyToast) return;
    clearTimeout(toastTimer);
    clearTimeout(toastResetTimer);

    copyToast.textContent = message;
    copyToast.style.opacity = '1';

    toastTimer = setTimeout(() => {
        copyToast.style.opacity = '0';
        if (resetAfter) {
            toastResetTimer = setTimeout(() => {
                copyToast.textContent = '';
            }, 400);
        }
    }, duration);
}

const PLACEHOLDER_RUNES = '𐱅𐰇𐰼𐰜 𐰼𐰇𐰤𐰠𐰼𐰃';

function updateRuneAndTranslation() {
    if (!runeOutput || !translationText) return;

    const hasInput = rawRussianInput.length > 0;
    const runeText = convertRussianToRunes(rawRussianInput);

    if (!hasInput) {
        runeOutput.textContent = PLACEHOLDER_RUNES;
        runeOutput.classList.add('placeholder-text');
    } else {
        runeOutput.textContent = runeText;
        runeOutput.classList.toggle('placeholder-text', runeText.trim() === '');
    }

    translationText.textContent = getRussianTranslation(rawRussianInput);
}

function addCharacter(char) {
    if (UNSUPPORTED.has(char.toLowerCase())) {
        showToast('Увы, такой буквы нет в этом языке', 1800);
        return;
    }
    if (/[а-яА-ЯёЁ]/.test(char)) char = char.toLowerCase();
    rawRussianInput += char;
    updateRuneAndTranslation();
}

function deleteLastChar() {
    if (!rawRussianInput.length) return;
    rawRussianInput = rawRussianInput.slice(0, -1);
    updateRuneAndTranslation();
}

function clearAll() {
    rawRussianInput = '';
    updateRuneAndTranslation();
    showToast('Поле очищено', 1000);
}

async function copyToClipboard() {
    const runesOnly = convertRussianToRunes(rawRussianInput);
    if (!runesOnly.trim()) {
        showToast('📭 Нет текста для копирования', 1500);
        return;
    }
    try {
        await navigator.clipboard.writeText(runesOnly);
        showToast('Руны скопированы!', 1800, true);
    } catch {
        showToast('Не удалось скопировать', 1800);
    }
}

function handlePhysicalKeyboard(e) {
    const key = e.key;

    if (key === 'Backspace') {
        e.preventDefault();
        deleteLastChar();
        return;
    }
    if (key === ' ' || key === 'Space' || key === 'Enter') {
        e.preventDefault();
        addCharacter(' ');
        return;
    }
    if (key.length !== 1) return;

    if (/[а-яА-ЯёЁ]/.test(key)) {
        e.preventDefault();
        addCharacter(key);
        return;
    }
    if (/[0-9.,!?;:()\-=+[\]{}'"\/\\|`~@#$%^&*]/.test(key)) {
        e.preventDefault();
        addCharacter(key);
    }
}

const ROW1 = ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'];
const ROW2 = ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'];
const ROW3 = ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'ё'];

function createKey(cyrChar) {
    const runeChar = RUS_TO_RUNE.get(cyrChar);
    const isUnsupported = UNSUPPORTED.has(cyrChar);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key' + (isUnsupported ? ' key-disabled' : '');
    if (isUnsupported) {
        btn.setAttribute('aria-disabled', 'true');
    }

    const runeSpan = document.createElement('span');
    runeSpan.className = 'key-rune-char';
    runeSpan.textContent = isUnsupported ? '⌀' : (runeChar || ' ');

    const letterSpan = document.createElement('span');
    letterSpan.className = 'key-letter-char';
    letterSpan.textContent = cyrChar;

    btn.append(runeSpan, letterSpan);

    btn.addEventListener('click', () => {
        if (isUnsupported) {
            showToast('Увы, такой буквы нет в этом языке', 1800);
        } else {
            addCharacter(cyrChar);
        }
    });

    return btn;
}

const row1Container = document.getElementById('keyboardRow1');
const row2Container = document.getElementById('keyboardRow2');
const row3Container = document.getElementById('keyboardRow3');

if (row1Container) ROW1.forEach(ch => row1Container.appendChild(createKey(ch)));
if (row2Container) ROW2.forEach(ch => row2Container.appendChild(createKey(ch)));
if (row3Container) ROW3.forEach(ch => row3Container.appendChild(createKey(ch)));

document.getElementById('spaceKeyBtn')?.addEventListener('click', () => addCharacter(' '));
document.getElementById('copyBtn')?.addEventListener('click', copyToClipboard);
document.getElementById('clearBtn')?.addEventListener('click', clearAll);
document.getElementById('backBtn')?.addEventListener('click', deleteLastChar);
document.getElementById('exampleBtn')?.addEventListener('click', () => {
    const examplePhrase = "кюль тегин бильге каган";
    if (rawRussianInput.length === 0) rawRussianInput = examplePhrase;
    else rawRussianInput += " " + examplePhrase;
    updateRuneAndTranslation();
    showToast("Пример приведён", 1500);
});

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V') return;
    }
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return;
    handlePhysicalKeyboard(e);
});

rawRussianInput = "добро пожаловать в рунаписьмо";
updateRuneAndTranslation();