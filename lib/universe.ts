import type { Market } from "./types";

/**
 * Curated ranking universe for the Step 1 prototype.
 *
 * Yahoo Finance has no "all tickers on KOSPI" endpoint, so live ranking runs over
 * these large/mid caps. The Step 2 Python pipeline (pykrx / FinanceDataReader)
 * replaces this with the full listed universe, including delisted names.
 */
export interface UniverseEntry {
  symbol: string;
  name: string;
}

const kospi: [string, string][] = [
  ["005930", "삼성전자"], ["000660", "SK하이닉스"], ["373220", "LG에너지솔루션"],
  ["207940", "삼성바이오로직스"], ["005380", "현대차"], ["000270", "기아"],
  ["068270", "셀트리온"], ["005490", "POSCO홀딩스"], ["035420", "NAVER"],
  ["035720", "카카오"], ["051910", "LG화학"], ["006400", "삼성SDI"],
  ["105560", "KB금융"], ["055550", "신한지주"], ["012330", "현대모비스"],
  ["028260", "삼성물산"], ["066570", "LG전자"], ["003550", "LG"],
  ["096770", "SK이노베이션"], ["034730", "SK"], ["015760", "한국전력"],
  ["017670", "SK텔레콤"], ["030200", "KT"], ["032830", "삼성생명"],
  ["086790", "하나금융지주"], ["012450", "한화에어로스페이스"], ["329180", "HD현대중공업"],
  ["009540", "HD한국조선해양"], ["010130", "고려아연"], ["011200", "HMM"],
  ["033780", "KT&G"], ["000810", "삼성화재"], ["018260", "삼성에스디에스"],
  ["009150", "삼성전기"], ["010950", "S-Oil"], ["024110", "기업은행"],
  ["316140", "우리금융지주"], ["042660", "한화오션"], ["064350", "현대로템"],
  ["047810", "한국항공우주"], ["003670", "포스코퓨처엠"], ["090430", "아모레퍼시픽"],
  ["097950", "CJ제일제당"], ["271560", "오리온"], ["251270", "넷마블"],
  ["036570", "엔씨소프트"], ["011170", "롯데케미칼"], ["000720", "현대건설"],
  ["006800", "미래에셋증권"], ["267260", "HD현대일렉트릭"],
];

const kosdaq: [string, string][] = [
  ["247540", "에코프로비엠"], ["086520", "에코프로"], ["196170", "알테오젠"],
  ["028300", "HLB"], ["263750", "펄어비스"], ["293490", "카카오게임즈"],
  ["035900", "JYP Ent."], ["041510", "에스엠"], ["145020", "휴젤"],
  ["058470", "리노공업"], ["357780", "솔브레인"], ["039030", "이오테크닉스"],
  ["240810", "원익IPS"], ["214150", "클래시스"], ["237690", "에스티팜"],
  ["112040", "위메이드"], ["078340", "컴투스"], ["068760", "셀트리온제약"],
  ["095340", "ISC"], ["403870", "HPSP"], ["277810", "레인보우로보틱스"],
  ["141080", "리가켐바이오"], ["298380", "에이비엘바이오"], ["328130", "루닛"],
  ["036930", "주성엔지니어링"], ["084370", "유진테크"], ["005290", "동진쎄미켐"],
  ["067160", "SOOP"], ["253450", "스튜디오드래곤"], ["214450", "파마리서치"],
  ["000250", "삼천당제약"], ["039200", "오스코텍"], ["222800", "심텍"],
  ["140410", "메지온"],
];

const nasdaq: [string, string][] = [
  ["AAPL", "Apple"], ["MSFT", "Microsoft"], ["NVDA", "NVIDIA"], ["AMZN", "Amazon"],
  ["GOOGL", "Alphabet"], ["META", "Meta Platforms"], ["TSLA", "Tesla"], ["AVGO", "Broadcom"],
  ["COST", "Costco"], ["NFLX", "Netflix"], ["AMD", "AMD"], ["ADBE", "Adobe"],
  ["PEP", "PepsiCo"], ["CSCO", "Cisco"], ["INTC", "Intel"], ["QCOM", "Qualcomm"],
  ["TXN", "Texas Instruments"], ["AMAT", "Applied Materials"], ["MU", "Micron"],
  ["LRCX", "Lam Research"], ["KLAC", "KLA"], ["ADI", "Analog Devices"], ["INTU", "Intuit"],
  ["ISRG", "Intuitive Surgical"], ["BKNG", "Booking"], ["GILD", "Gilead"], ["AMGN", "Amgen"],
  ["VRTX", "Vertex"], ["REGN", "Regeneron"], ["SBUX", "Starbucks"], ["MDLZ", "Mondelez"],
  ["PYPL", "PayPal"], ["MRVL", "Marvell"], ["PANW", "Palo Alto Networks"],
  ["CRWD", "CrowdStrike"], ["ASML", "ASML"], ["MELI", "MercadoLibre"],
  ["ORLY", "O'Reilly Automotive"], ["CTAS", "Cintas"], ["SNPS", "Synopsys"],
  ["CDNS", "Cadence"], ["ADP", "ADP"], ["CMCSA", "Comcast"], ["TMUS", "T-Mobile US"],
  ["HON", "Honeywell"], ["PDD", "PDD Holdings"], ["ABNB", "Airbnb"], ["DXCM", "Dexcom"],
  ["IDXX", "IDEXX"], ["MNST", "Monster Beverage"], ["CSX", "CSX"], ["PAYX", "Paychex"],
  ["ROST", "Ross Stores"], ["FAST", "Fastenal"], ["EA", "Electronic Arts"],
];

/** Yahoo Finance crypto quote symbols (base-quote). */
const crypto: [string, string][] = [
  ["BTC-USD", "Bitcoin"], ["ETH-USD", "Ethereum"], ["BNB-USD", "BNB"],
  ["SOL-USD", "Solana"], ["XRP-USD", "XRP"], ["ADA-USD", "Cardano"],
  ["DOGE-USD", "Dogecoin"], ["TON-USD", "Toncoin"], ["AVAX-USD", "Avalanche"],
  ["SHIB-USD", "Shiba Inu"], ["DOT-USD", "Polkadot"], ["LINK-USD", "Chainlink"],
  ["TRX-USD", "TRON"], ["POL-USD", "Polygon"], ["BCH-USD", "Bitcoin Cash"],
  ["NEAR-USD", "NEAR Protocol"], ["LTC-USD", "Litecoin"], ["UNI-USD", "Uniswap"],
  ["ICP-USD", "Internet Computer"], ["APT-USD", "Aptos"], ["ATOM-USD", "Cosmos"],
  ["ETC-USD", "Ethereum Classic"], ["FIL-USD", "Filecoin"], ["ARB-USD", "Arbitrum"],
  ["OP-USD", "Optimism"], ["SUI-USD", "Sui"], ["PEPE-USD", "Pepe"],
  ["AAVE-USD", "Aave"], ["RENDER-USD", "Render"], ["INJ-USD", "Injective"],
  ["SEI-USD", "Sei"], ["IMX-USD", "Immutable"], ["STX-USD", "Stacks"],
  ["MKR-USD", "Maker"], ["GRT-USD", "The Graph"], ["ALGO-USD", "Algorand"],
];

const suffix = (list: [string, string][], sfx: string): UniverseEntry[] =>
  list.map(([code, name]) => ({ symbol: code + sfx, name }));

export const UNIVERSE: Record<Market, UniverseEntry[]> = {
  KOSPI: suffix(kospi, ".KS"),
  KOSDAQ: suffix(kosdaq, ".KQ"),
  NASDAQ: suffix(nasdaq, ""),
  CRYPTO: suffix(crypto, ""),
};

export const FUTURES_SYMBOL = "NQ=F";
export const FUTURES_NAME = "나스닥 100 선물";

const bySymbol = new Map<string, UniverseEntry & { market: Market }>();
for (const market of Object.keys(UNIVERSE) as Market[]) {
  for (const e of UNIVERSE[market]) bySymbol.set(e.symbol, { ...e, market });
}

export function lookup(symbol: string) {
  return bySymbol.get(symbol.toUpperCase());
}

const CRYPTO_QUOTE = /-(USD|USDT|USDC|KRW|EUR|BTC|ETH)$/;

export function marketOf(symbol: string): Market {
  const known = lookup(symbol);
  if (known) return known.market;
  if (symbol.endsWith(".KS")) return "KOSPI";
  if (symbol.endsWith(".KQ")) return "KOSDAQ";
  if (CRYPTO_QUOTE.test(symbol)) return "CRYPTO";
  return "NASDAQ";
}

export function allEntries() {
  return [...bySymbol.values()];
}
