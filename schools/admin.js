const statPlayersEl = document.getElementById('statPlayers');
const statOnlineEl = document.getElementById('statOnline');
const statRunsEl = document.getElementById('statRuns');
const statAvgScoreEl = document.getElementById('statAvgScore');
const statAvgTimeEl = document.getElementById('statAvgTime');
const doorsBarsEl = document.getElementById('doorsBars');
const adminLeaderboardEl = document.getElementById('adminLeaderboard');
const recentRunsEl = document.getElementById('recentRuns');
const adminStatusEl = document.getElementById('adminStatus');
const liveMazeEl = document.getElementById('liveMaze');
const livePlayersListEl = document.getElementById('livePlayersList');

const mazeLayout = [
  ['S', '.', '.', '#', '.', '.', '.'],
  ['#', '#', 'D1', '#', '.', '#', '.'],
  ['.', '.', '.', '.', '.', '#', '.'],
  ['.', '#', '#', 'D2', '#', '#', '.'],
  ['.', '.', 'D3', '.', '.', '.', '.'],
  ['#', '.', '#', '#', 'D4', '#', '.'],
  ['.', '.', '.', '.', 'D5', '.', 'F']
];

const params = new URLSearchParams(window.location.search);
const adminKey = params.get('key') || '';
const BASE_PATH = window.location.pathname.startsWith('/schools/') ? '/schools' : '';

function withBase(path) {
  return `${BASE_PATH}${path}`;
}

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadStats() {
  const endpoint = adminKey
    ? withBase(`/api/admin/stats?key=${encodeURIComponent(adminKey)}`)
    : withBase('/api/admin/stats');

  const response = await fetch(endpoint);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Доступ запрещён. Добавьте ключ: /admin.html?key=ВАШ_КЛЮЧ');
    }
    throw new Error(`Ошибка ${response.status}`);
  }

  return response.json();
}

function renderBars(histogram) {
  const values = ['0', '1', '2', '3', '4', '5'].map((k) => Number(histogram[k] || 0));
  const maxValue = Math.max(1, ...values);

  doorsBarsEl.innerHTML = '';
  values.forEach((value, idx) => {
    const row = document.createElement('div');
    row.className = 'bar-row';

    const label = document.createElement('span');
    label.textContent = `${idx} дверей`;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${Math.max(4, Math.round((value / maxValue) * 100))}%`;
    track.appendChild(fill);

    const count = document.createElement('strong');
    count.textContent = String(value);

    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(count);
    doorsBarsEl.appendChild(row);
  });
}

function renderLeaderboard(items) {
  adminLeaderboardEl.innerHTML = '';

  if (!items.length) {
    adminLeaderboardEl.innerHTML = '<li>Пока нет результатов</li>';
    return;
  }

  items.forEach((row, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${index + 1}. ${escapeHtml(row.playerName)}</span><strong>${row.score} / ${formatTime(row.timeSeconds)}</strong>`;
    adminLeaderboardEl.appendChild(li);
  });
}

function renderRecent(items) {
  recentRunsEl.innerHTML = '';

  if (!items.length) {
    recentRunsEl.innerHTML = '<li>Пока нет финишей</li>';
    return;
  }

  items.forEach((row) => {
    const li = document.createElement('li');
    const time = new Date(row.updatedAt || Date.now()).toLocaleTimeString('ru-RU');
    li.innerHTML = `<span>${escapeHtml(row.playerName)} · ${formatTime(row.timeSeconds)} · ${row.doorsOpened}/5</span><strong>${row.score} · ${time}</strong>`;
    recentRunsEl.appendChild(li);
  });
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '•';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function renderLiveMaze(players) {
  const byCell = new Map();
  players.forEach((p) => {
    const key = `${p.row}:${p.col}`;
    if (!byCell.has(key)) byCell.set(key, []);
    byCell.get(key).push(p);
  });

  liveMazeEl.innerHTML = '';

  for (let r = 0; r < mazeLayout.length; r++) {
    for (let c = 0; c < mazeLayout[r].length; c++) {
      const val = mazeLayout[r][c];
      const cell = document.createElement('div');
      cell.className = 'live-cell';

      if (val === '#') cell.classList.add('wall');
      if (val === 'S') cell.classList.add('start');
      if (val === 'F') cell.classList.add('finish');
      if (val.startsWith && val.startsWith('D')) cell.classList.add('door');

      const list = byCell.get(`${r}:${c}`) || [];
      if (list.length) {
        const wrap = document.createElement('div');
        wrap.className = 'player-dot-wrap';

        list.slice(0, 6).forEach((p) => {
          const dot = document.createElement('span');
          dot.className = 'player-dot';
          dot.title = `${p.playerName} • ${p.score} очков`;
          dot.textContent = initials(p.playerName);
          wrap.appendChild(dot);
        });

        cell.appendChild(wrap);
      }

      liveMazeEl.appendChild(cell);
    }
  }
}

function renderLivePlayers(players) {
  livePlayersListEl.innerHTML = '';

  if (!players.length) {
    livePlayersListEl.innerHTML = '<li>Сейчас в лабиринте никого нет</li>';
    return;
  }

  players.forEach((p) => {
    const li = document.createElement('li');
    const ageSec = Math.max(0, Math.floor((Date.now() - new Date(p.updatedAt).getTime()) / 1000));
    li.innerHTML = `<span>${escapeHtml(p.playerName)} · (${p.row + 1}, ${p.col + 1}) · ${p.doorsOpened}/5</span><strong>${p.score} · ${ageSec}с назад</strong>`;
    livePlayersListEl.appendChild(li);
  });
}

async function refresh() {
  try {
    const data = await loadStats();

    statPlayersEl.textContent = String(data.summary?.uniquePlayers ?? 0);
    statOnlineEl.textContent = String(data.summary?.onlinePlayers ?? 0);
    statRunsEl.textContent = String(data.summary?.totalRuns ?? 0);
    statAvgScoreEl.textContent = String(data.summary?.avgScore ?? 0);
    statAvgTimeEl.textContent = formatTime(data.summary?.avgTime ?? 0);

    renderBars(data.doorsHistogram || {});
    renderLeaderboard(data.leaderboard || []);
    renderRecent(data.recentRuns || []);
    renderLiveMaze(data.livePlayers || []);
    renderLivePlayers(data.livePlayers || []);

    adminStatusEl.textContent = `Обновлено: ${new Date(data.updatedAt || Date.now()).toLocaleTimeString('ru-RU')}`;
  } catch (error) {
    adminStatusEl.textContent = `Ошибка: ${error.message}`;
  }
}

refresh();
setInterval(refresh, 4000);
