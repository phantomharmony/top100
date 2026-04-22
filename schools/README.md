# ENU RoboQuest (мультиплеер с лидербордом)

## Что реализовано
- Каждый школьник открывает сайт со своего телефона.
- У каждого игрока имя и личная сессия игры.
- Общий лидерборд хранится на сервере и обновляется у всех.
- С телефона можно играть кнопками на экране.
- Отдельная страница админа с живой статистикой: `/admin.html`.
- Вопросы берутся из расширенного банка (случайные 5 вопросов на игру).

## Запуск
1. Установите Node.js (версия 18+).
2. В папке проекта выполните `npm install`.
3. Запустите `npm start`.
4. На компьютере откройте `http://localhost:3000`.
5. Телефоны подключите к той же Wi-Fi сети и откройте адрес вида `http://IP_компьютера:3000`.

Сервер при запуске сам выводит локальные IP-адреса в консоль.

## Админ-экран
- Откройте `http://localhost:3000/admin.html`.
- Если зададите переменную окружения `ADMIN_KEY`, статистика будет защищена.
- Тогда вход: `http://localhost:3000/admin.html?key=ВАШ_КЛЮЧ`.

Пример запуска с ключом (PowerShell):
- `$env:ADMIN_KEY="enu2026"; npm start`

## Деплой на DigitalOcean Droplet (Ubuntu 22.04/24.04) — подробно

Ниже рабочий production-сценарий: Node + PM2 + Nginx + SSL.

### 1) Создать и подготовить сервер
1. Создайте Droplet (Ubuntu 22.04/24.04).
2. Подключитесь по SSH:
	- `ssh root@IP_ВАШЕГО_СЕРВЕРА`
3. Обновите систему:
	- `apt update && apt upgrade -y`
4. (Рекомендуется) включите firewall:
	- `ufw allow OpenSSH`
	- `ufw allow 80`
	- `ufw allow 443`
	- `ufw --force enable`

### 2) Установить Node.js 20 LTS и инструменты
1. Установите NodeSource:
	- `curl -fsSL https://deb.nodesource.com/setup_20.x | bash -`
2. Установите Node.js и git:
	- `apt install -y nodejs git`
3. Проверьте версии:
	- `node -v`
	- `npm -v`

### 3) Залить проект на сервер
Вариант A (через git):
- `mkdir -p /var/www/roboquest && cd /var/www/roboquest`
- `git clone ВАШ_GIT_URL .`

Вариант B (без git, с локального ПК):
- `scp -r C:/usedmxne/projs/schools/* root@ВАШ_СЕРВЕР:/var/www/roboquest/`

Если видите ошибку `Permission denied (publickey)`:
1. На локальном ПК создайте ключ (PowerShell):
	- `ssh-keygen -t ed25519 -C "roboquest"`
2. Выведите публичный ключ:
	- `Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub`
3. Вставьте его в DigitalOcean:
	- Droplet → **Access** → **Add SSH Key** (или в аккаунт DO: Settings → Security → SSH Keys)
4. Проверьте вход:
	- `ssh root@ВАШ_СЕРВЕР`
5. Если используете нестандартный ключ, укажите его явно:
	- `ssh -i C:/Users/ВАШ_ПОЛЬЗОВАТЕЛЬ/.ssh/id_ed25519 root@ВАШ_СЕРВЕР`
	- `scp -i C:/Users/ВАШ_ПОЛЬЗОВАТЕЛЬ/.ssh/id_ed25519 -r C:/usedmxne/projs/schools/* root@ВАШ_СЕРВЕР:/var/www/roboquest/`

### 4) Установить зависимости и проверить запуск
1. Перейдите в папку:
	- `cd /var/www/roboquest`
2. Установите зависимости:
	- `npm install`
3. Тестовый запуск:
	- `PORT=3000 ADMIN_KEY=enu2026 node server.js`
4. Откройте в браузере:
	- `http://IP_ВАШЕГО_СЕРВЕРА:3000`

### 5) Запуск как сервис через PM2
1. Установите PM2:
	- `npm i -g pm2`
2. Запустите приложение:
	- `cd /var/www/roboquest`
	- `PORT=3000 ADMIN_KEY=ваш_секрет pm2 start server.js --name roboquest`
3. Включите автозапуск после перезагрузки:
	- `pm2 startup systemd`
	- выполните команду, которую покажет PM2
	- `pm2 save`
4. Проверка:
	- `pm2 status`
	- `pm2 logs roboquest`

### 6) Поставить Nginx как reverse proxy
1. Установите Nginx:
	- `apt install -y nginx`
2. Создайте конфиг сайта:
	- `nano /etc/nginx/sites-available/roboquest`
3. Вставьте:

```nginx
server {
	 listen 80;
	 server_name ваш-домен.kz www.ваш-домен.kz;

	 location / {
		  proxy_pass http://127.0.0.1:3000;
		  proxy_http_version 1.1;
		  proxy_set_header Host $host;
		  proxy_set_header X-Real-IP $remote_addr;
		  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		  proxy_set_header X-Forwarded-Proto $scheme;
	 }
}
```

4. Включите сайт и проверьте конфиг:
	- `ln -s /etc/nginx/sites-available/roboquest /etc/nginx/sites-enabled/roboquest`
	- `nginx -t`
	- `systemctl reload nginx`

### 7) Подключить домен и SSL (Let's Encrypt)
1. В DNS добавьте A-запись на IP вашего Droplet:
	- `@ -> IP_ВАШЕГО_СЕРВЕРА`
	- `www -> IP_ВАШЕГО_СЕРВЕРА`
2. Установите certbot:
	- `apt install -y certbot python3-certbot-nginx`
3. Выпустите сертификат:
	- `certbot --nginx -d ваш-домен.kz -d www.ваш-домен.kz`
4. Проверка автообновления:
	- `systemctl status certbot.timer`

### 8) Где будут страницы
- Игра: `https://ваш-домен.kz/`
- Админ: `https://ваш-домен.kz/admin.html?key=ВАШ_КЛЮЧ`

### 9) Как обновлять проект
Если git:
- `cd /var/www/roboquest`
- `git pull`
- `npm install`
- `pm2 restart roboquest`

Если без git (scp/архив):
- залейте новые файлы в `/var/www/roboquest`
- `cd /var/www/roboquest && npm install && pm2 restart roboquest`

### 10) Резервное копирование лидерборда
Файл с данными: `leaderboard.json`.

Пример бэкапа:
- `cp /var/www/roboquest/leaderboard.json /var/www/roboquest/leaderboard.backup.$(date +%F-%H%M).json`

### 11) Полезные команды диагностики
- `pm2 logs roboquest --lines 200`
- `pm2 restart roboquest`
- `systemctl status nginx`
- `curl -I http://127.0.0.1:3000`

## Файлы
- `server.js` — API и раздача сайта.
- `leaderboard.json` — данные рейтинга (создаётся автоматически).
- `index.html`, `styles.css`, `script.js` — клиентская часть игры.
- `admin.html`, `admin.css`, `admin.js` — экран администратора.
