# Kyungmin

오사카 여행 일정(2026.12.10 – 12.13)을 보여주는 정적 웹 페이지입니다.
빌드 도구 없이 순수 HTML / CSS / JavaScript 로만 구성되어 있습니다.

## 구조

```
Kyungmin/
├── index.html      # 일정 페이지 (항공 / 숙소 / DAY별 일정 / 쇼핑)
├── css/
│   └── style.css   # 스타일 (CSS 변수로 라이트/다크 테마, 모바일 대응)
├── js/
│   └── main.js     # 테마 전환, D-day 표시, 여행 중 오늘 일정 강조
└── assets/         # 이미지, 폰트 등 정적 리소스
```

## 실행

- `index.html` 을 브라우저에서 바로 열면 됩니다.
- 또는 로컬 서버로 실행:
  - VS Code: Live Server 확장
  - Python: `python -m http.server 8000` → http://localhost:8000
  - Node: `npx serve .`
