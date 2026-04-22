const mazeLayout = [
  ['S', '.', '.', '#', '.', '.', '.'],
  ['#', '#', 'D1', '#', '.', '#', '.'],
  ['.', '.', '.', '.', '.', '#', '.'],
  ['.', '#', '#', 'D2', '#', '#', '.'],
  ['.', '.', 'D3', '.', '.', '.', '.'],
  ['#', '.', '#', '#', 'D4', '#', '.'],
  ['.', '.', '.', '.', 'D5', '.', 'F']
];

const questionBank = [
  {
    question: 'Какой элемент робота обычно измеряет расстояние до объекта?',
    answers: ['Светодиод', 'Ультразвуковой датчик', 'Пассивный резистор', 'Сервопривод'],
    correct: 1
  },
  {
    question: 'Что такое алгоритм в робототехнике?',
    answers: [
      'Корпус робота',
      'План действий для выполнения задачи',
      'Тип батареи',
      'Название датчика'
    ],
    correct: 1
  },
  {
    question: 'Какой контроллер часто используют в учебных роботах?',
    answers: ['Arduino', 'Wi‑Fi роутер', 'Видеокарта', 'Монитор'],
    correct: 0
  },
  {
    question: 'Для чего нужен сервопривод?',
    answers: [
      'Для хранения программы',
      'Для точного управления углом поворота',
      'Для подключения к интернету',
      'Для измерения температуры'
    ],
    correct: 1
  },
  {
    question: 'Какое правило безопасности верное в лаборатории робототехники?',
    answers: [
      'Проверять соединения перед включением питания',
      'Трогать провода мокрыми руками',
      'Оставлять включённый паяльник без присмотра',
      'Менять схему при включенном питании'
    ],
    correct: 0
  },
  {
    question: 'Какой датчик используется для определения линии на поле?',
    answers: ['Датчик цвета/освещённости', 'GPS-модуль', 'Датчик влажности', 'Барометр'],
    correct: 0
  },
  {
    question: 'Что делает цикл `for` в программе робота?',
    answers: ['Выключает питание', 'Повторяет блок команд', 'Измеряет напряжение', 'Загружает прошивку'],
    correct: 1
  },
  {
    question: 'Зачем нужен драйвер мотора?',
    answers: [
      'Для усиления и управления током двигателя',
      'Для записи видео',
      'Для подключения клавиатуры',
      'Для охлаждения контроллера'
    ],
    correct: 0
  },
  {
    question: 'Что такое ШИМ (PWM)?',
    answers: [
      'Метод управления мощностью через импульсы',
      'Тип аккумулятора',
      'Название датчика расстояния',
      'Программа для черчения схем'
    ],
    correct: 0
  },
  {
    question: 'Какой тип движения лучше для точного поворота на месте?',
    answers: ['Оба колеса вперёд', 'Оба колеса назад', 'Колёса в разные стороны', 'Остановка моторов'],
    correct: 2
  },
  {
    question: 'Что обычно хранит переменная?',
    answers: ['Только картинки', 'Данные, которые могут изменяться', 'Только звук', 'Только адрес сайта'],
    correct: 1
  },
  {
    question: 'Почему важно калибровать датчики перед заездом?',
    answers: [
      'Чтобы датчики давали более точные значения',
      'Чтобы увеличить размер колёс',
      'Чтобы ускорить интернет',
      'Чтобы выключить таймер'
    ],
    correct: 0
  },
  {
    question: 'Какой модуль часто используют для беспроводной связи робота?',
    answers: ['Bluetooth/Wi‑Fi модуль', 'Только предохранитель', 'Трансформатор 220В', 'Механическое реле времени'],
    correct: 0
  },
  {
    question: 'Что значит отладка программы?',
    answers: [
      'Поиск и исправление ошибок',
      'Печать корпуса на 3D‑принтере',
      'Пайка аккумулятора',
      'Покраска робота'
    ],
    correct: 0
  },
  {
    question: 'Какой датчик определяет расстояние по отражённому свету?',
    answers: ['Инфракрасный датчик расстояния', 'Микрофон', 'Кнопка', 'Динамик'],
    correct: 0
  },
  {
    question: 'Что безопаснее делать перед сменой проводки?',
    answers: [
      'Отключить питание',
      'Ускорить моторы',
      'Поднять напряжение',
      'Нажать reset несколько раз'
    ],
    correct: 0
  },
  {
    question: 'Что такое функция в программировании?',
    answers: [
      'Именованный блок кода для повторного использования',
      'Тип мотора',
      'Значение напряжения батареи',
      'Плата расширения'
    ],
    correct: 0
  },
  {
    question: 'Для чего нужен энкодер на колесе?',
    answers: [
      'Измерять скорость/пройденный путь',
      'Передавать Wi‑Fi',
      'Заряжать аккумулятор',
      'Измерять температуру воздуха'
    ],
    correct: 0
  },
  {
    question: 'Какой тип питания чаще всего у учебных мобильных роботов?',
    answers: ['Аккумулятор 5–12В', '220В напрямую', 'Только солнечные панели', 'Пневматика'],
    correct: 0
  },
  {
    question: 'Что делает условие `if`?',
    answers: ['Сравнивает условие и выбирает действие', 'Вращает сервопривод', 'Очищает память Arduino', 'Печатает схему'],
    correct: 0
  },
  {
    question: 'Какой протокол чаще всего используют для подключения нескольких датчиков по двум линиям SDA/SCL?',
    answers: ['UART', 'SPI', 'I2C', 'CAN'],
    correct: 2
  },
  {
    question: 'Что делает H-мост в драйвере двигателя?',
    answers: [
      'Меняет направление вращения и управляет мотором',
      'Измеряет освещённость',
      'Шифрует данные датчика',
      'Стабилизирует Wi‑Fi сигнал'
    ],
    correct: 0
  },
  {
    question: 'Если у робота два одинаковых мотора, как обычно поворачивают плавно вправо?',
    answers: [
      'Увеличивают скорость правого мотора',
      'Уменьшают скорость правого мотора относительно левого',
      'Отключают оба мотора',
      'Меняют полярность аккумулятора'
    ],
    correct: 1
  },
  {
    question: 'Для чего в ПИД-регуляторе нужен коэффициент D (дифференциальная часть)?',
    answers: [
      'Увеличивать постоянную ошибку',
      'Подавлять резкие колебания и перерегулирование',
      'Ускорять заряд аккумулятора',
      'Сохранять программу в EEPROM'
    ],
    correct: 1
  },
  {
    question: 'Что произойдёт при слишком большом коэффициенте P в регуляторе линии?',
    answers: [
      'Робот станет слишком медленным',
      'Робот начнёт сильнее колебаться вокруг линии',
      'Датчик перестанет работать',
      'Моторы перестанут потреблять ток'
    ],
    correct: 1
  },
  {
    question: 'Зачем программно делать debounce для кнопки?',
    answers: [
      'Чтобы уменьшить дребезг контактов и ложные нажатия',
      'Чтобы повысить частоту CPU',
      'Чтобы увеличить яркость LED',
      'Чтобы включить Bluetooth'
    ],
    correct: 0
  },
  {
    question: 'Какой тип памяти в Arduino обычно хранит данные после отключения питания?',
    answers: ['SRAM', 'EEPROM', 'Кэш браузера', 'Буфер UART'],
    correct: 1
  },
  {
    question: 'Что лучше описывает конечный автомат (FSM) в робототехнике?',
    answers: [
      'Набор состояний и переходов между ними по событиям',
      'Тип мотор-редуктора',
      'Метод пайки проводов',
      'Формат изображений с камеры'
    ],
    correct: 0
  },
  {
    question: 'Какое преимущество даёт редуктор с большим передаточным отношением?',
    answers: [
      'Больше скорость, меньше момент',
      'Больше момент, меньше скорость',
      'Меньше ток и больше скорость одновременно',
      'Улучшает качество Wi‑Fi'
    ],
    correct: 1
  },
  {
    question: 'Какой порядок обычно применяют при отладке робота?',
    answers: [
      'Сначала механика и питание, потом датчики, потом алгоритм',
      'Сначала дизайн корпуса, потом всё остальное не важно',
      'Сразу финальный запуск без тестов',
      'Сначала реклама проекта'
    ],
    correct: 0
  },
  {
    question: 'Что означает baud rate в UART?',
    answers: [
      'Скорость передачи символов/битов в линии связи',
      'Ёмкость аккумулятора',
      'Температуру мотора',
      'Максимальный угол сервопривода'
    ],
    correct: 0
  },
  {
    question: 'При питании от аккумулятора 7.4В (2S Li-ion) для Arduino 5В обычно нужно:',
    answers: [
      'Подать напрямую на 5V без преобразования',
      'Использовать понижающий DC-DC преобразователь',
      'Подключить через резистор 10 Ом',
      'Подать через USB-кабель без источника'
    ],
    correct: 1
  },
  {
    question: 'Какой принцип помогает роботу-следопыту линии на перекрёстках?',
    answers: [
      'Использовать таблицу правил для комбинаций датчиков',
      'Всегда ехать прямо без проверки датчиков',
      'Отключить один мотор навсегда',
      'Уменьшить напряжение датчиков до нуля'
    ],
    correct: 0
  }
];

let doorQuestions = {};
const DOOR_IDS = ['D1', 'D2', 'D3', 'D4', 'D5'];
const QUESTIONS_PER_DOOR = 2;
const TOTAL_QUESTIONS = DOOR_IDS.length * QUESTIONS_PER_DOOR;

function createDoorQuestions() {
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, TOTAL_QUESTIONS);
  return {
    D1: [selected[0], selected[1]],
    D2: [selected[2], selected[3]],
    D3: [selected[4], selected[5]],
    D4: [selected[6], selected[7]],
    D5: [selected[8], selected[9]]
  };
}

const mazeEl = document.getElementById('maze');
const doorsOpenEl = document.getElementById('doorsOpen');
const questionsDoneEl = document.getElementById('questionsDone');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const playerNameEl = document.getElementById('playerName');
const leaderboardEl = document.getElementById('leaderboard');
const leaderboardStatusEl = document.getElementById('leaderboardStatus');
const dpadButtons = document.querySelectorAll('.dpad-btn');
const touchpadEl = document.getElementById('touchpad');

const questionModal = document.getElementById('questionModal');
const questionText = document.getElementById('questionText');
const answersEl = document.getElementById('answers');
const feedbackEl = document.getElementById('questionFeedback');
const closeModalBtn = document.getElementById('closeModal');

const finishModal = document.getElementById('finishModal');
const finishText = document.getElementById('finishText');
const playAgainBtn = document.getElementById('playAgain');
const restartBtn = document.getElementById('restartBtn');

const playerModal = document.getElementById('playerModal');
const playerInput = document.getElementById('playerInput');
const savePlayerBtn = document.getElementById('savePlayer');
const playerErrorEl = document.getElementById('playerError');

let playerPos = { r: 0, c: 0 };
let score = 0;
let openedDoors = new Set();
let currentDoor = null;
let gameFinished = false;
let startTime = Date.now();
let timerId = null;
let leaderboardTimerId = null;
let scoreSubmitted = false;
let playerStateTimerId = null;
let moveHoldTimerId = null;
let doorProgress = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };
let questionsAnswered = 0;

let playerName = localStorage.getItem('roboquestPlayerName') || '';
let playerId = localStorage.getItem('roboquestPlayerId') || '';
const BASE_PATH = window.location.pathname.startsWith('/schools/') ? '/schools' : '';

function withBase(path) {
  return `${BASE_PATH}${path}`;
}

function sanitizeName(name) {
  return name.replace(/\s+/g, ' ').trim().slice(0, 24);
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json();
}

function showPlayerModal() {
  playerInput.value = playerName;
  playerErrorEl.textContent = '';
  playerModal.classList.remove('hidden');
  playerInput.focus();
}

async function registerPlayer(name) {
  const data = await apiFetch(withBase('/api/players/register'), {
    method: 'POST',
    body: JSON.stringify({ playerName: name, playerId: playerId || null })
  });

  playerId = data.playerId;
  playerName = data.playerName;
  localStorage.setItem('roboquestPlayerId', playerId);
  localStorage.setItem('roboquestPlayerName', playerName);
  playerNameEl.textContent = playerName;
}

async function submitScore(elapsedSeconds) {
  if (scoreSubmitted || !playerId || !gameFinished) return;
  scoreSubmitted = true;

  try {
    await apiFetch(withBase('/api/scores'), {
      method: 'POST',
      body: JSON.stringify({
        playerId,
        playerName,
        score,
        timeSeconds: elapsedSeconds,
        doorsOpened: openedDoors.size
      })
    });
    await loadLeaderboard();
  } catch (error) {
    leaderboardStatusEl.textContent = 'Не удалось отправить результат. Проверьте соединение.';
  }
}

async function sendPlayerState(extra = {}) {
  if (!playerId || !playerName) return;

  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

  try {
    await apiFetch(withBase('/api/player-state'), {
      method: 'POST',
      body: JSON.stringify({
        playerId,
        playerName,
        row: playerPos.r,
        col: playerPos.c,
        score,
        doorsOpened: openedDoors.size,
        elapsedSeconds,
        gameFinished,
        ...extra
      })
    });
  } catch {
    // Сетевой heartbeat не должен ломать игру
  }
}

function renderLeaderboard(items) {
  leaderboardEl.innerHTML = '';

  if (!items.length) {
    leaderboardEl.innerHTML = '<li>Пока нет результатов</li>';
    return;
  }

  items.forEach((row, index) => {
    const li = document.createElement('li');
    const isYou = row.playerId === playerId;
    if (isYou) li.classList.add('you');
    li.innerHTML = `<span>${index + 1}. ${row.playerName}${isYou ? ' (вы)' : ''}</span><strong>${row.score} / ${formatTime(row.timeSeconds)}</strong>`;
    leaderboardEl.appendChild(li);
  });
}

async function loadLeaderboard() {
  try {
    const data = await apiFetch(withBase('/api/leaderboard'));
    renderLeaderboard(data.items || []);
    leaderboardStatusEl.textContent = `Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`;
  } catch (error) {
    leaderboardStatusEl.textContent = 'Лидерборд временно недоступен.';
  }
}

function isInside(r, c) {
  return r >= 0 && c >= 0 && r < mazeLayout.length && c < mazeLayout[0].length;
}

function getCellValue(r, c) {
  return mazeLayout[r][c];
}

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function renderMaze() {
  mazeEl.innerHTML = '';

  for (let r = 0; r < mazeLayout.length; r++) {
    for (let c = 0; c < mazeLayout[r].length; c++) {
      const val = mazeLayout[r][c];
      const cell = document.createElement('div');
      cell.className = 'cell';

      if (val === '#') cell.classList.add('wall');
      if (val === 'S') cell.classList.add('start');
      if (val === 'F') cell.classList.add('finish');

      if (val.startsWith && val.startsWith('D')) {
        cell.classList.add('door');
        if (openedDoors.has(val)) cell.classList.add('open');
      }

      if (playerPos.r === r && playerPos.c === c) {
        const player = document.createElement('div');
        player.className = 'player';
        cell.appendChild(player);
      }

      mazeEl.appendChild(cell);
    }
  }

  doorsOpenEl.textContent = `${openedDoors.size}/5`;
  questionsDoneEl.textContent = `${questionsAnswered}/${TOTAL_QUESTIONS}`;
  scoreEl.textContent = String(score);
}

function showQuestion(doorId) {
  currentDoor = doorId;
  const idx = doorProgress[doorId] || 0;
  const data = doorQuestions[doorId][idx];
  questionText.textContent = data.question;
  answersEl.innerHTML = '';
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';

  data.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn answer';
    btn.textContent = answer;
    btn.addEventListener('click', () => checkAnswer(index));
    answersEl.appendChild(btn);
  });

  questionModal.classList.remove('hidden');
}

function checkAnswer(index) {
  if (!currentDoor) return;

  const idx = doorProgress[currentDoor] || 0;
  const data = doorQuestions[currentDoor][idx];
  if (index === data.correct) {
    if (!openedDoors.has(currentDoor)) {
      doorProgress[currentDoor] = Math.min(QUESTIONS_PER_DOOR, (doorProgress[currentDoor] || 0) + 1);
      questionsAnswered = Math.min(TOTAL_QUESTIONS, questionsAnswered + 1);
      score += 10;

      if (doorProgress[currentDoor] >= QUESTIONS_PER_DOOR) {
        openedDoors.add(currentDoor);
      }
    }
    feedbackEl.textContent = openedDoors.has(currentDoor)
      ? 'Верно! Дверь открыта.'
      : 'Верно! Остался ещё 1 вопрос для этой двери.';
    feedbackEl.classList.add('good');
    renderMaze();

    setTimeout(() => {
      questionModal.classList.add('hidden');
      feedbackEl.textContent = '';
      currentDoor = null;
    }, 650);
  } else {
    score = Math.max(0, score - 5);
    scoreEl.textContent = String(score);
    feedbackEl.textContent = 'Неверно. Попробуйте ещё раз.';
    feedbackEl.classList.add('bad');
  }
}

function tryMove(dr, dc) {
  if (gameFinished || !questionModal.classList.contains('hidden')) return;

  const nr = playerPos.r + dr;
  const nc = playerPos.c + dc;
  if (!isInside(nr, nc)) return;

  const target = getCellValue(nr, nc);
  if (target === '#') return;

  if (target.startsWith && target.startsWith('D') && !openedDoors.has(target)) {
    showQuestion(target);
    return;
  }

  playerPos = { r: nr, c: nc };
  renderMaze();
  sendPlayerState();

  if (target === 'F') finishGame();
}

function finishGame() {
  gameFinished = true;
  clearInterval(timerId);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const bonus = Math.max(0, 120 - elapsed);
  score += bonus;
  scoreEl.textContent = String(score);

  finishText.textContent = `Вы дошли до финиша за ${formatTime(elapsed)} и набрали ${score} баллов.`;
  finishModal.classList.remove('hidden');
  sendPlayerState({ elapsedSeconds: elapsed, gameFinished: true });
  submitScore(elapsed);
}

function startTimer() {
  clearInterval(timerId);
  startTime = Date.now();
  timerEl.textContent = '00:00';

  timerId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(elapsed);
  }, 1000);
}

function resetGame() {
  playerPos = { r: 0, c: 0 };
  score = 0;
  openedDoors = new Set();
  doorProgress = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };
  questionsAnswered = 0;
  currentDoor = null;
  gameFinished = false;
  scoreSubmitted = false;
  doorQuestions = createDoorQuestions();
  questionModal.classList.add('hidden');
  finishModal.classList.add('hidden');
  renderMaze();
  startTimer();
  sendPlayerState({ gameFinished: false, elapsedSeconds: 0 });
}

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  if (key === 'arrowup' || key === 'w') tryMove(-1, 0);
  if (key === 'arrowdown' || key === 's') tryMove(1, 0);
  if (key === 'arrowleft' || key === 'a') tryMove(0, -1);
  if (key === 'arrowright' || key === 'd') tryMove(0, 1);
});

closeModalBtn.addEventListener('click', () => {
  questionModal.classList.add('hidden');
  currentDoor = null;
});

playAgainBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

savePlayerBtn.addEventListener('click', async () => {
  const candidate = sanitizeName(playerInput.value);
  if (candidate.length < 2) {
    playerErrorEl.textContent = 'Введите имя от 2 символов.';
    return;
  }

  savePlayerBtn.disabled = true;
  playerErrorEl.textContent = '';

  try {
    await registerPlayer(candidate);
    playerModal.classList.add('hidden');
    resetGame();
    await sendPlayerState({ gameFinished: false, elapsedSeconds: 0 });
    await loadLeaderboard();
  } catch (error) {
    playerErrorEl.textContent = 'Сервер недоступен. Проверьте подключение.';
  } finally {
    savePlayerBtn.disabled = false;
  }
});

playerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') savePlayerBtn.click();
});

const moveByAction = {
  up: () => tryMove(-1, 0),
  down: () => tryMove(1, 0),
  left: () => tryMove(0, -1),
  right: () => tryMove(0, 1)
};

dpadButtons.forEach((btn) => {
  const action = btn.dataset.move;
  const move = moveByAction[action];
  if (!move) return;

  const startHold = (e) => {
    if (e.cancelable) e.preventDefault();
    move();
    clearInterval(moveHoldTimerId);
    moveHoldTimerId = setInterval(move, 180);
  };

  const stopHold = () => {
    clearInterval(moveHoldTimerId);
    moveHoldTimerId = null;
  };

  btn.addEventListener('click', move);
  btn.addEventListener('touchstart', startHold, { passive: false });
  btn.addEventListener('touchend', stopHold);
  btn.addEventListener('touchcancel', stopHold);
  btn.addEventListener('mousedown', startHold);
  btn.addEventListener('mouseup', stopHold);
  btn.addEventListener('mouseleave', stopHold);
});

if (touchpadEl) {
  let sx = 0;
  let sy = 0;
  let ex = 0;
  let ey = 0;
  const threshold = 28;

  touchpadEl.addEventListener('touchstart', (e) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    sx = t.clientX;
    sy = t.clientY;
    ex = sx;
    ey = sy;
  }, { passive: true });

  touchpadEl.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    ex = t.clientX;
    ey = t.clientY;
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  touchpadEl.addEventListener('touchend', () => {
    const dx = ex - sx;
    const dy = ey - sy;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX < threshold && absY < threshold) return;

    if (absX > absY) {
      if (dx > 0) moveByAction.right();
      else moveByAction.left();
    } else {
      if (dy > 0) moveByAction.down();
      else moveByAction.up();
    }
  });
}

resetGame();

if (!playerName) {
  playerNameEl.textContent = '—';
  showPlayerModal();
} else {
  registerPlayer(playerName)
    .then(() => {
      playerModal.classList.add('hidden');
      sendPlayerState({ gameFinished: false });
      return loadLeaderboard();
    })
    .catch(() => {
      showPlayerModal();
    });
}

clearInterval(leaderboardTimerId);
leaderboardTimerId = setInterval(loadLeaderboard, 5000);

clearInterval(playerStateTimerId);
playerStateTimerId = setInterval(() => {
  sendPlayerState();
}, 4000);
