-- Step 2 storage schema (SQLite now, Postgres/Supabase later — kept ANSI-compatible).
-- Filled by the Python pipeline (pykrx / FinanceDataReader / yfinance); the API routes
-- then read from here instead of calling Yahoo per request.

CREATE TABLE IF NOT EXISTS symbols (
  symbol      TEXT PRIMARY KEY,          -- Yahoo-style: 005930.KS, 247540.KQ, AAPL, NQ=F
  name        TEXT NOT NULL,
  market      TEXT NOT NULL,             -- KOSPI | KOSDAQ | NASDAQ | FUTURES
  currency    TEXT NOT NULL,
  listed_on   DATE,
  delisted_on DATE                       -- kept so historical rankings avoid survivorship bias
);

CREATE TABLE IF NOT EXISTS monthly_bars (
  symbol     TEXT    NOT NULL REFERENCES symbols(symbol),
  ym         TEXT    NOT NULL,           -- 'YYYY-MM'
  open       REAL    NOT NULL,
  high       REAL    NOT NULL,
  low        REAL    NOT NULL,
  close      REAL    NOT NULL,
  volume     REAL,
  return_pct REAL,                       -- vs previous month close; NULL for the first month
  PRIMARY KEY (symbol, ym)
);

-- Serves /api/top-movers: WHERE market = ? AND ym = ? ORDER BY return_pct DESC LIMIT 5
CREATE INDEX IF NOT EXISTS idx_monthly_bars_ym_return ON monthly_bars (ym, return_pct DESC);
