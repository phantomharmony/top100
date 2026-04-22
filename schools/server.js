const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'leaderboard.json');
const ADMIN_KEY = process.env.ADMIN_KEY || '';

app.use(express.json());
app.use(express.static(__dirname));

function readStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = { entries: [], submissions: [], liveStates: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);

    const entries = Array.isArray(data.entries) ? data.entries : [];
    const submissions = Array.isArray(data.submissions) ? data.submissions : [];
    const liveStates = Array.isArray(data.liveStates) ? data.liveStates : [];
    return { entries, submissions, liveStates };
  } catch {
    return { entries: [], submissions: [], liveStates: [] };
  }
}

function saveStore(store) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({
      entries: Array.isArray(store.entries) ? store.entries : [],
      submissions: Array.isArray(store.submissions) ? store.submissions : [],
      liveStates: Array.isArray(store.liveStates) ? store.liveStates : []
    }, null, 2),
    'utf8'
  );
}

function normalizeName(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);
}

function toPublicEntry(row) {
  return {
    playerId: row.playerId,
    playerName: row.playerName,
    score: row.score,
    timeSeconds: row.timeSeconds,
    doorsOpened: row.doorsOpened,
    updatedAt: row.updatedAt
  };
}

function sortLeaderboard(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });
}

function hasAdminAccess(req) {
  if (!ADMIN_KEY) return true;
  const incoming = String(req.query.key || req.headers['x-admin-key'] || '').trim();
  return incoming && incoming === ADMIN_KEY;
}

function clampInt(value, min, max, fallback = min) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

app.post('/api/players/register', (req, res) => {
  const playerName = normalizeName(req.body.playerName);
  const incomingId = String(req.body.playerId || '').trim();

  if (playerName.length < 2) {
    return res.status(400).json({ error: 'Некорректное имя игрока' });
  }

  const playerId = incomingId || crypto.randomUUID();
  return res.json({ playerId, playerName });
});

app.get('/api/leaderboard', (req, res) => {
  const store = readStore();
  const entries = sortLeaderboard(store.entries).slice(0, 20).map(toPublicEntry);
  return res.json({ items: entries });
});

app.post('/api/scores', (req, res) => {
  const playerId = String(req.body.playerId || '').trim();
  const playerName = normalizeName(req.body.playerName);
  const score = Number(req.body.score);
  const timeSeconds = Number(req.body.timeSeconds);
  const doorsOpened = Number(req.body.doorsOpened);

  if (!playerId || playerName.length < 2) {
    return res.status(400).json({ error: 'Некорректные данные игрока' });
  }

  if (!Number.isFinite(score) || score < 0 || !Number.isFinite(timeSeconds) || timeSeconds < 0) {
    return res.status(400).json({ error: 'Некорректный результат' });
  }

  const safeScore = Math.floor(score);
  const safeTime = Math.floor(timeSeconds);
  const safeDoors = Number.isFinite(doorsOpened) ? Math.max(0, Math.min(5, Math.floor(doorsOpened))) : 0;

  const store = readStore();
  const entries = store.entries;
  const submissions = store.submissions;
  const now = new Date().toISOString();
  const index = entries.findIndex((x) => x.playerId === playerId);

  const newEntry = {
    playerId,
    playerName,
    score: safeScore,
    timeSeconds: safeTime,
    doorsOpened: safeDoors,
    updatedAt: now
  };

  submissions.push({
    ...newEntry,
    id: crypto.randomUUID()
  });

  if (submissions.length > 3000) {
    store.submissions = submissions.slice(-3000);
  }

  if (index === -1) {
    entries.push(newEntry);
  } else {
    const prev = entries[index];
    const isBetter = safeScore > prev.score || (safeScore === prev.score && safeTime < prev.timeSeconds);

    if (isBetter) {
      entries[index] = newEntry;
    } else {
      entries[index] = {
        ...prev,
        playerName,
        updatedAt: now
      };
    }
  }

  saveStore(store);
  return res.json({ ok: true });
});

app.post('/api/player-state', (req, res) => {
  const playerId = String(req.body.playerId || '').trim();
  const playerName = normalizeName(req.body.playerName);

  if (!playerId || playerName.length < 2) {
    return res.status(400).json({ error: 'Некорректные данные игрока' });
  }

  const row = clampInt(req.body.row, 0, 6, 0);
  const col = clampInt(req.body.col, 0, 6, 0);
  const score = clampInt(req.body.score, 0, 9999, 0);
  const doorsOpened = clampInt(req.body.doorsOpened, 0, 5, 0);
  const elapsedSeconds = clampInt(req.body.elapsedSeconds, 0, 24 * 60 * 60, 0);
  const gameFinished = Boolean(req.body.gameFinished);
  const now = new Date().toISOString();

  const store = readStore();
  const states = store.liveStates;
  const index = states.findIndex((x) => x.playerId === playerId);

  const nextState = {
    playerId,
    playerName,
    row,
    col,
    score,
    doorsOpened,
    elapsedSeconds,
    gameFinished,
    updatedAt: now
  };

  if (index === -1) {
    states.push(nextState);
  } else {
    states[index] = nextState;
  }

  if (states.length > 600) {
    store.liveStates = states.slice(-600);
  }

  saveStore(store);
  return res.json({ ok: true });
});

app.get('/api/admin/stats', (req, res) => {
  if (!hasAdminAccess(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const store = readStore();
  const entries = sortLeaderboard(store.entries);
  const submissions = [...store.submissions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const liveStates = [...store.liveStates];

  const uniquePlayers = new Set(entries.map((x) => x.playerId)).size;
  const totalRuns = submissions.length;

  let avgScore = 0;
  let avgTime = 0;
  if (totalRuns > 0) {
    avgScore = Math.round(submissions.reduce((sum, x) => sum + Number(x.score || 0), 0) / totalRuns);
    avgTime = Math.round(submissions.reduce((sum, x) => sum + Number(x.timeSeconds || 0), 0) / totalRuns);
  }

  const nowTs = Date.now();
  const last15MinTs = nowTs - 15 * 60 * 1000;
  const onlineByRuns = new Set(
    submissions
      .filter((x) => new Date(x.updatedAt).getTime() >= last15MinTs)
      .map((x) => x.playerId)
  );

  const liveWindowTs = nowTs - 20 * 1000;
  const activeLivePlayers = liveStates
    .filter((x) => new Date(x.updatedAt).getTime() >= liveWindowTs)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const onlinePlayers = new Set([
    ...onlineByRuns,
    ...activeLivePlayers.map((x) => x.playerId)
  ]).size;

  const doorsHistogram = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0
  };

  submissions.forEach((x) => {
    const key = String(Math.max(0, Math.min(5, Math.floor(Number(x.doorsOpened || 0)))));
    doorsHistogram[key] += 1;
  });

  return res.json({
    summary: {
      uniquePlayers,
      totalRuns,
      avgScore,
      avgTime,
      onlinePlayers
    },
    leaderboard: entries.slice(0, 15).map(toPublicEntry),
    recentRuns: submissions.slice(0, 20).map(toPublicEntry),
    livePlayers: activeLivePlayers.map((x) => ({
      playerId: x.playerId,
      playerName: x.playerName,
      row: x.row,
      col: x.col,
      score: x.score,
      doorsOpened: x.doorsOpened,
      elapsedSeconds: x.elapsedSeconds,
      gameFinished: Boolean(x.gameFinished),
      updatedAt: x.updatedAt
    })),
    doorsHistogram,
    updatedAt: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const ips = [];

  Object.values(interfaces).forEach((iface) => {
    (iface || []).forEach((item) => {
      if (item.family === 'IPv4' && !item.internal) {
        ips.push(item.address);
      }
    });
  });

  console.log(`ENU RoboQuest запущен: http://localhost:${PORT}`);
  ips.forEach((ip) => {
    console.log(`Для телефонов в Wi-Fi: http://${ip}:${PORT}`);
  });
});
