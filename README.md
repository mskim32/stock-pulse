# Stock Pulse

월별 상승률 Top 5(코스피·코스닥·나스닥), 나스닥 100 선물(NQ=F), 종목별 2002년~현재 월봉/연봉 차트와 연×월 수익률 히트맵을 보는 모바일 다크 테마 PWA.

```bash
npm install
npm run dev          # http://localhost:3000
USE_MOCK_DATA=1 npm run dev   # Yahoo 없이 샘플 데이터로 실행
```

## 디렉토리 구조

```
stock-pulse/
├─ app/
│  ├─ layout.tsx              # max-w-md 모바일 셸, 다크 테마, PWA 메타
│  ├─ page.tsx                # 홈 (Suspense → components/Home)
│  ├─ manifest.ts             # PWA manifest
│  ├─ globals.css             # Tailwind v4 테마 토큰 (bg #0B0E14, card #151A23, 상승 빨강/하락 파랑)
│  ├─ stock/[symbol]/page.tsx # 종목 상세
│  └─ api/
│     ├─ futures/route.ts         # GET ?year&month → NQ=F 월 종가·등락률·일별 미니차트
│     ├─ top-movers/route.ts      # GET ?market&year&month → 월간 상승률 Top N
│     ├─ stock/[symbol]/route.ts  # GET → 월봉·연봉 캔들 + 히트맵 행렬
│     └─ search/route.ts          # GET ?q → 한글명/티커/6자리 코드 + Yahoo 검색
├─ components/
│  ├─ Home.tsx                # 선택 상태를 URL(?y&m&tab)에 보관 → 뒤로가기 시 복원
│  ├─ YearMonthPicker.tsx     # 이전/다음 달, 연도 select, 1~12월 칩 (미래 월 비활성)
│  ├─ FuturesBanner.tsx       # 나스닥 선물 카드 + MiniChart
│  ├─ MarketTabs.tsx / TopMoversList.tsx
│  ├─ SearchBar.tsx           # 디바운스 검색 드롭다운
│  ├─ StockDetail.tsx         # 상세: 가격·통계·차트·히트맵
│  ├─ CandleChart.tsx / MiniChart.tsx   # Lightweight Charts v5
│  ├─ ReturnHeatmap.tsx       # 연(행)×월(열), 평균·승률 행, 셀 탭 상세
│  └─ SourceBadge.tsx         # 샘플 데이터 표시
├─ lib/
│  ├─ yahoo.ts                # yahoo-finance2 호출 (거래소 시간대 보정, 월 중복 제거)
│  ├─ market-data.ts          # 데이터 진입점: 캐시 + Yahoo 장애 시 mock 폴백
│  ├─ mock.ts                 # 시드 고정 가짜 시세
│  ├─ returns.ts              # 월 수익률, 연봉 집계, 히트맵 계산
│  ├─ universe.ts             # 시장별 랭킹 대상 종목 목록
│  ├─ dates.ts / format.ts / http.ts / use-fetch.ts / types.ts
├─ db/schema.sql              # Step 2: SQLite → Supabase 스키마
└─ public/                    # 아이콘
```

(Step 2 예정) `pipeline/` — Python(pykrx, FinanceDataReader, yfinance)으로 전 종목 월봉을 `db/`에 적재하고, API 라우트는 Yahoo 대신 DB를 읽도록 `lib/market-data.ts`만 교체.

## 알아둘 점

- **Top 5는 전체 시장이 아니라 `lib/universe.ts`의 대형주 목록(코스피 50, 코스닥 34, 나스닥 55)에서 집계합니다.** Yahoo에는 시장 전체 종목 목록 API가 없기 때문입니다. 현재 상장 종목만 있으므로 과거 월에는 생존 편향도 있습니다. 둘 다 Step 2 파이프라인(상장폐지 종목 포함)에서 해결합니다.
- 수익률 = 해당 월 종가 / 전월 종가 − 1 (Yahoo 분할 반영 OHLC, 배당 미반영).
- **신규상장 월**도 랭킹에 포함하고 `신규상장` 배지로 구분합니다. 이 달은 전월 종가가 없으므로 *첫 거래일 시가 대비 월말 종가*로 계산합니다(공모가 기준 아님). 상장월은 Yahoo `firstTradeDate`로 판별하므로, Yahoo 데이터 시작일이 실제 상장일보다 늦은 종목이나 코스닥→코스피 이전상장 종목은 잘못 표시될 수 있습니다. Step 2에서 KRX 상장일 데이터로 교체합니다.
- 첫 랭킹 요청은 종목 ~50개를 동시성 6으로 받아 수 초 걸리고, 이후에는 메모리 캐시(6시간)로 즉시 응답합니다.
- Yahoo 연결 실패 시 자동으로 샘플 데이터를 쓰고 화면에 `샘플 데이터` 배지를 표시합니다.
- 색상은 국내 관례(상승 빨강, 하락 파랑)를 따릅니다.

## 다음 단계

1. 로컬에서 Yahoo 실데이터 확인 — `샘플 데이터` 배지가 사라지는지, 신규상장 판별이 맞는지(예: 373220.KS → 2022.01)
2. GitHub 저장소 연결
3. Python 파이프라인(`pipeline/`) — KRX 전 종목(상장폐지 포함)·상장일·공모가·월봉 수집
4. SQLite 적재 후 `lib/market-data.ts`를 DB 조회로 교체 (공모가 대비 수익률 추가)
5. GitHub Actions 정기 업데이트
6. Supabase 이전 + Vercel 배포
7. PWA 마무리(서비스 워커), 테스트
