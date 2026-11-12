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

initTheme();
initDday();
