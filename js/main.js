'use strict';

const TRIP_START = new Date(2026, 11, 10); // 2026-12-10
const TRIP_END = new Date(2026, 11, 13);   // 2026-12-13
const THEME_KEY = 'osaka.theme';

// ---------- 테마 ----------
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  let theme;
  try {
    theme = localStorage.getItem(THEME_KEY);
  } catch {
    theme = null;
  }
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const apply = () => {
    document.documentElement.dataset.theme = theme;
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  };

  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* 저장 실패는 무시 */
    }
    apply();
  });

  apply();
}

// ---------- D-day ----------
function initDday() {
  const el = document.getElementById('dday');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAY = 24 * 60 * 60 * 1000;

  if (today < TRIP_START) {
    const diff = Math.round((TRIP_START - today) / DAY);
    el.textContent = `D-${diff}`;
  } else if (today <= TRIP_END) {
    const n = Math.round((today - TRIP_START) / DAY) + 1;
    el.textContent = `여행 중 · DAY ${n}`;
    document.getElementById(`day${n}`)?.classList.add('is-today');
  } else {
    el.textContent = '다녀온 여행 ✓';
  }
  el.hidden = false;
}

// ---------- 오늘 날짜 + 오사카 현재 시각 ----------
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function initClock() {
  const todayEl = document.getElementById('today-kr');
  const clockEl = document.getElementById('clock-jp');
  const jpTime = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const tick = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    todayEl.textContent = `${y}.${m}.${d} (${WEEKDAYS[now.getDay()]})`;
    clockEl.textContent = jpTime.format(now);
  };

  tick();
  setInterval(tick, 30 * 1000);
}

// ---------- 오사카 날씨 (Open-Meteo, API 키 불필요) ----------
const OSAKA = { lat: 34.6937, lon: 135.5023 };

// WMO 날씨 코드 → [아이콘, 설명]
function describeWeather(code) {
  if (code === 0) return ['☀️', '맑음'];
  if (code === 1) return ['🌤️', '대체로 맑음'];
  if (code === 2) return ['⛅', '구름 조금'];
  if (code === 3) return ['☁️', '흐림'];
  if (code === 45 || code === 48) return ['🌫️', '안개'];
  if (code >= 51 && code <= 57) return ['🌦️', '이슬비'];
  if (code >= 61 && code <= 67) return ['🌧️', '비'];
  if (code >= 71 && code <= 77) return ['🌨️', '눈'];
  if (code >= 80 && code <= 82) return ['🌧️', '소나기'];
  if (code === 85 || code === 86) return ['🌨️', '소낙눈'];
  if (code >= 95) return ['⛈️', '뇌우'];
  return ['🌡️', '-'];
}

function toISODate(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function initWeather() {
  const nowBox = document.getElementById('weather-now');
  const weekList = document.getElementById('weather-week');
  const note = document.getElementById('weather-note');

  const params = new URLSearchParams({
    latitude: OSAKA.lat,
    longitude: OSAKA.lon,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Tokyo',
    forecast_days: 16,
  });

  let data;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    nowBox.replaceChildren(el('p', 'muted', '날씨 정보를 불러오지 못했어요. 잠시 후 새로고침해 주세요.'));
    return;
  }

  // 현재 날씨
  const c = data.current;
  const [icon, desc] = describeWeather(c.weather_code);
  const info = el('div');
  info.append(
    el('div', 'weather-desc', `${desc} · 오사카`),
    el('div', 'weather-meta',
      `체감 ${Math.round(c.apparent_temperature)}° · 습도 ${c.relative_humidity_2m}% · 바람 ${Math.round(c.wind_speed_10m)}km/h`)
  );
  nowBox.replaceChildren(
    el('span', 'weather-icon', icon),
    el('span', 'weather-temp', `${Math.round(c.temperature_2m)}°`),
    info
  );

  // 일별 예보 (앞 7일)
  const daily = data.daily;
  const tripDates = [0, 1, 2, 3].map((i) => {
    const d = new Date(TRIP_START);
    d.setDate(d.getDate() + i);
    return toISODate(d);
  });

  weekList.replaceChildren();
  daily.time.slice(0, 7).forEach((iso, i) => {
    const date = new Date(`${iso}T00:00:00`);
    const [wIcon, wDesc] = describeWeather(daily.weather_code[i]);
    const li = el('li');
    if (tripDates.includes(iso)) li.classList.add('is-trip');
    li.title = wDesc;
    li.append(
      el('span', 'wd', i === 0 ? '오늘' : `${date.getMonth() + 1}/${date.getDate()} ${WEEKDAYS[date.getDay()]}`),
      el('span', 'wi', wIcon),
      el('span', 'hi', `${Math.round(daily.temperature_2m_max[i])}°`),
      el('span', 'lo', ` / ${Math.round(daily.temperature_2m_min[i])}°`)
    );
    const rain = daily.precipitation_probability_max[i];
    if (rain != null && rain >= 30) li.append(el('span', 'rain', `☔ ${rain}%`));
    weekList.appendChild(li);
  });

  // 여행 날짜 예보 → DAY 카드에 표시
  let shown = 0;
  tripDates.forEach((iso, n) => {
    const i = daily.time.indexOf(iso);
    if (i === -1) return;
    const [wIcon] = describeWeather(daily.weather_code[i]);
    const label = document.querySelector(`#day${n + 1} .day-label`);
    if (!label) return;
    label.querySelector('.day-weather')?.remove();
    label.append(el('span', 'day-weather',
      `${wIcon} ${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°`));
    shown++;
  });

  note.textContent = shown > 0
    ? '여행 날짜 예보는 각 DAY 카드에도 표시돼요. (Open-Meteo 제공)'
    : '여행 날짜 예보는 출발 약 2주 전부터 각 DAY 카드에 자동으로 표시돼요. (Open-Meteo 제공)';
}

initTheme();
initDday();
initClock();
initWeather();
