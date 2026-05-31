// ─── 常數 ───────────────────────────────────────────────
// 地支對應：戌=白羊 酉=金牛 申=雙子 未=巨蟹 午=獅子 巳=處女
//           辰=天秤 卯=天蠍 寅=射手 丑=摩羯 子=水瓶 亥=雙魚
const SIGN_SYM  = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥'];
const SIGN_NAME = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥'];
const SIGN_ABB  = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥'];
const SIGN_COL  = ['#c01818','#4a7010','#a07800','#1048c0','#c04800','#107038',
                   '#1a4888','#680898','#b03808','#1e4858','#0e6898','#481898'];

// 十二宮名稱（以命宮為0，逆時針排列）
const PALACE_NAMES = ['命宮','財帛','兄弟','田宅','子女','奴僕','夫妻','疾厄','遷移','官祿','福德','相貌'];

// 地支自然序（子=0 … 亥=11），命宮計算用
const ZHI_NAMES    = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZHI_SHI_CHEN = ['子時','丑時','寅時','卯時','辰時','巳時','午時','未時','申時','酉時','戌時','亥時'];

// ─── 八字常數 ────────────────────────────────────────────
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 日柱基準：JD 2436115（1957-12-25 正午）= 甲午日（60甲子循環位置30）
const JD_REF_DAY     = 2436115;
const DAY_REF_IDX    = 44; // 基準修正：以 1984-02-06=庚午(idx=6) 反推

// 月干五虎遁年：依年干取寅月起始干索引
// 甲己→丙(2) 乙庚→戊(4) 丙辛→庚(6) 丁壬→壬(8) 戊癸→甲(0)
const MONTH_GAN_START = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // indexed by yearGanIdx (0=甲)

// 時干五鼠遁日：依日干取子時起始干索引
// 甲己→甲(0) 乙庚→丙(2) 丙辛→戊(4) 丁壬→庚(6) 戊癸→壬(8)
const HOUR_GAN_START  = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]; // indexed by dayGanIdx

// 12節：太陽達到此黃道度數時換月（回歸黃道 tropical）
// 每節對應月支（ZHI索引）與大約公曆月日
const JIE_LIST = [
  { name:'立春', lon:315, zhiIdx:2,  mo:2,  d:4  }, // 寅月
  { name:'驚蟄', lon:345, zhiIdx:3,  mo:3,  d:6  }, // 卯月
  { name:'清明', lon: 15, zhiIdx:4,  mo:4,  d:5  }, // 辰月
  { name:'立夏', lon: 45, zhiIdx:5,  mo:5,  d:6  }, // 巳月
  { name:'芒種', lon: 75, zhiIdx:6,  mo:6,  d:6  }, // 午月
  { name:'小暑', lon:105, zhiIdx:7,  mo:7,  d:7  }, // 未月
  { name:'立秋', lon:135, zhiIdx:8,  mo:8,  d:7  }, // 申月
  { name:'白露', lon:165, zhiIdx:9,  mo:9,  d:8  }, // 酉月
  { name:'寒露', lon:195, zhiIdx:10, mo:10, d:8  }, // 戌月
  { name:'立冬', lon:225, zhiIdx:11, mo:11, d:7  }, // 亥月
  { name:'大雪', lon:255, zhiIdx:0,  mo:12, d:7  }, // 子月
  { name:'小寒', lon:285, zhiIdx:1,  mo:1,  d:6  }, // 丑月（隔年1月）
];

// ─── 節氣二分搜（利用已載入的 astronomy-engine）──────────────
function findJieQiJD(approxJD, targetLon) {
  let lo = approxJD - 16, hi = approxJD + 16;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const ms  = (mid - 2440587.5) * 86400000;
    const t   = Astronomy.MakeTime(new Date(ms));
    let   lon = Astronomy.SunPosition(t).elon;
    let diff = n360(lon - targetLon);
    if (diff > 180) diff -= 360;
    if (diff > 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

function dateToJD(y, mo, d) {
  return calcJD(y, mo, d, 12, 0, 0);
}

// ─── 八字四柱計算 ────────────────────────────────────────────
function calcDayGanzhi(y, mo, d) {
  const jdNoon = dateToJD(y, mo, d);
  const offset  = Math.round(jdNoon) - JD_REF_DAY;
  const idx     = ((offset + DAY_REF_IDX) % 60 + 60) % 60;
  return { gan: GAN[idx % 10], zhi: ZHI[idx % 12], ganIdx: idx % 10, zhiIdx: idx % 12 };
}

function calcYearGanzhi(y, mo, d) {
  const birthJD  = dateToJD(y, mo, d);
  const approxJD = dateToJD(y, 2, 4);
  const lichunJD = findJieQiJD(approxJD, 315);
  const baziYear = birthJD < lichunJD ? y - 1 : y;
  const idx      = ((baziYear - 4) % 60 + 60) % 60;
  return { gan: GAN[idx % 10], zhi: ZHI[idx % 12], ganIdx: idx % 10, zhiIdx: idx % 12, baziYear };
}

function calcMonthGanzhi(y, mo, d, yearGanIdx) {
  const birthJD = dateToJD(y, mo, d);
  const nodes = [];
  nodes.push({ jd: findJieQiJD(dateToJD(y - 1, 1, 6), 285), zhiIdx: 1 });
  for (const jie of JIE_LIST) {
    const yr = (jie.mo === 1) ? y + 1 : y;
    nodes.push({ jd: findJieQiJD(dateToJD(yr, jie.mo, jie.d), jie.lon), zhiIdx: jie.zhiIdx });
  }
  nodes.sort((a, b) => a.jd - b.jd);
  let cur = nodes[0];
  for (const node of nodes) {
    if (node.jd <= birthJD) cur = node;
    else break;
  }
  const monthNum = (cur.zhiIdx - 2 + 12) % 12;
  const ganIdx   = (MONTH_GAN_START[yearGanIdx] + monthNum) % 10;
  return { gan: GAN[ganIdx], zhi: ZHI[cur.zhiIdx], ganIdx, zhiIdx: cur.zhiIdx };
}

function calcHourGanzhi(h, dayGanIdx) {
  const zhiIdx = getShiChen(h);
  const ganIdx = (HOUR_GAN_START[dayGanIdx] + zhiIdx) % 10;
  return { gan: GAN[ganIdx], zhi: ZHI[zhiIdx], ganIdx, zhiIdx };
}

function calcBazi(y, mo, d, tst_h) {
  const year  = calcYearGanzhi(y, mo, d);
  const month = calcMonthGanzhi(y, mo, d, year.ganIdx);
  const day   = calcDayGanzhi(y, mo, d);
  const hour  = calcHourGanzhi(tst_h, day.ganIdx);
  return { year, month, day, hour };
}

function getShiChen(h) {
  const hr = ((h % 24) + 24) % 24;
  return Math.floor(((hr + 1) % 24) / 2);
}

function getMingGong(sunLon, h) {
  const sunZhiIdx  = (10 - signOf(sunLon) + 12) % 12;
  const shiChenIdx = getShiChen(h);
  const mgZhiIdx   = ((sunZhiIdx + 3 - shiChenIdx) % 12 + 12) % 12;
  const mgEclIdx   = (10 - mgZhiIdx + 12) % 12;
  return {
    zhiIdx:  mgZhiIdx,
    eclIdx:  mgEclIdx,
    name:    ZHI_NAMES[mgZhiIdx],
    shiChen: ZHI_SHI_CHEN[shiChenIdx]
  };
}

// 二十八宿原始資料（傳統度數，總和 365.25）
// 順序：虛女牛斗箕尾心房氐亢角軫翼張星柳鬼井參觜畢昴胃婁奎壁室危
// 宿主星（木金土日月火水，從角宿起循環）
const MANSION_RAW = [
  {name:'虛',trad:10,   ruler:'Sun'},
  {name:'女',trad:12,   ruler:'Saturn'},
  {name:'牛',trad:8,    ruler:'Venus'},
  {name:'斗',trad:26.25,ruler:'Jupiter'},
  {name:'箕',trad:11,   ruler:'Mercury'},
  {name:'尾',trad:18,   ruler:'Mars'},
  {name:'心',trad:5,    ruler:'Moon'},
  {name:'房',trad:5,    ruler:'Sun'},
  {name:'氐',trad:15,   ruler:'Saturn'},
  {name:'亢',trad:9,    ruler:'Venus'},
  {name:'角',trad:12,   ruler:'Jupiter'},
  {name:'軫',trad:17,   ruler:'Mercury'},
  {name:'翼',trad:18,   ruler:'Mars'},
  {name:'張',trad:18,   ruler:'Moon'},
  {name:'星',trad:7,    ruler:'Sun'},
  {name:'柳',trad:15,   ruler:'Saturn'},
  {name:'鬼',trad:4,    ruler:'Venus'},
  {name:'井',trad:33,   ruler:'Jupiter'},
  {name:'參',trad:9,    ruler:'Mercury'},
  {name:'觜',trad:2,    ruler:'Mars'},
  {name:'畢',trad:16,   ruler:'Moon'},
  {name:'昴',trad:11,   ruler:'Sun'},
  {name:'胃',trad:14,   ruler:'Saturn'},
  {name:'婁',trad:12,   ruler:'Venus'},
  {name:'奎',trad:16,   ruler:'Jupiter'},
  {name:'壁',trad:9,    ruler:'Mercury'},
  {name:'室',trad:16,   ruler:'Mars'},
  {name:'危',trad:17,   ruler:'Moon'},
];

// 星體顯示標籤（漢字簡稱）
const BODY_LABEL = {
  Sun:'日', Moon:'月', Mercury:'水', Venus:'金',
  Mars:'火', Jupiter:'木', Saturn:'土',
  LuoHou:'羅', JiDu:'計', YuePo:'孛', ZiQi:'炁'
};

// 七政（去除天王、海王、冥王）
const PLANETS = [
  {id:'Sun',    zh:'太陽', sym:'☉', col:'#a86000'},
  {id:'Moon',   zh:'月亮', sym:'☽', col:'#3050a0'},
  {id:'Mercury',zh:'水星', sym:'☿', col:'#186820'},
  {id:'Venus',  zh:'金星', sym:'♀', col:'#a01868'},
  {id:'Mars',   zh:'火星', sym:'♂', col:'#b80808'},
  {id:'Jupiter',zh:'木星', sym:'♃', col:'#785800'},
  {id:'Saturn', zh:'土星', sym:'♄', col:'#503410'},
];

// ─── 數學工具 ────────────────────────────────────────────
const π = Math.PI;
const r2d = r => r * 180 / π;
const d2r = d => d * π / 180;
const n360 = a => ((a % 360) + 360) % 360;

// ─── 二十八宿初始化 ──────────────────────────────────────
// 基準：角宿0度=辰宮23.5°、虛宿0度=子宮23.43°，兩者反推平均值
// 角宿反推：332.8635°，虛宿反推：333.2863°，平均 = 333.0749°
const MANSION_START = 333.0749; // 亥宮3°04'
// 1 傳統度 = 360/365.25 現代度
const MANSION_SCALE = 360 / 365.25;

let _mCum = 0;
const MANSIONS = MANSION_RAW.map(m => {
  const width = m.trad * MANSION_SCALE;
  const lon0  = n360(MANSION_START - _mCum);
  const lonM  = n360(MANSION_START - _mCum - width / 2);
  _mCum += width;
  return { name: m.name, trad: m.trad, width, lon0, lonM, ruler: m.ruler };
});

function getMansion(lon) {
  const rel = n360(MANSION_START - n360(lon));
  let cum = 0;
  for (const m of MANSIONS) {
    if (rel >= cum && rel < cum + m.width) return m;
    cum += m.width;
  }
  return MANSIONS[0];
}

// ─── 格式化 ──────────────────────────────────────────────
function fmtLon(lon) {
  const l  = n360(lon);
  const si = Math.floor(l / 30);
  const deg = l % 30;
  const d  = Math.floor(deg);
  const m  = Math.floor((deg - d) * 60);
  return `${SIGN_ABB[si]} ${d}度${String(m).padStart(2,'0')}分`;
}
function signOf(lon) { return Math.floor(n360(lon) / 30); }

// ─── 天文計算 ────────────────────────────────────────────
function calcJD(y, mo, d, h, mi, tzOff) {
  let utcH = h + mi / 60 - tzOff;
  let day = d, mon = mo, yr = y;
  while (utcH < 0)  { utcH += 24; day--; }
  while (utcH >= 24){ utcH -= 24; day++; }
  if (mon <= 2) { yr--; mon += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mon + 1)) + day + utcH / 24 + B - 1524.5;
}

function calcGMST(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  return n360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000);
}

function calcEps(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.4392911111 - (46.8150/3600)*T - (0.00059/3600)*T*T + (0.001813/3600)*T*T*T;
}

function calcAsc(lmst, lat, eps) {
  const θ = d2r(lmst), φ = d2r(lat), ε = d2r(eps);
  const y = -Math.cos(θ);
  const x = Math.sin(ε) * Math.tan(φ) + Math.cos(ε) * Math.sin(θ);
  let asc = r2d(Math.atan2(y, x));
  if (Math.cos(θ) > 0) asc += 180;
  return n360(asc);
}

function calcMC(lmst, eps) {
  const θ = d2r(lmst), ε = d2r(eps);
  return n360(r2d(Math.atan2(Math.sin(θ), Math.cos(θ) * Math.cos(ε))));
}

// ─── 均時差（Equation of Time），單位：分鐘 ────────────────
function calcEoT(jd) {
  const T  = (jd - 2451545.0) / 36525.0;
  const L0 = n360(280.46646 + 36000.76983*T + 0.0003032*T*T);
  const M  = n360(357.52911 + 35999.05029*T - 0.0001537*T*T);
  const e  = 0.016708634 - 0.000042037*T - 0.0000001267*T*T;
  const eps = calcEps(jd);
  const y  = Math.tan(d2r(eps / 2)) ** 2;
  const eot = y * Math.sin(d2r(2*L0))
            - 2*e * Math.sin(d2r(M))
            + 4*e*y * Math.sin(d2r(M)) * Math.cos(d2r(2*L0))
            - 0.5*y*y * Math.sin(d2r(4*L0))
            - 1.25*e*e * Math.sin(d2r(2*M));
  return r2d(eot) * 4;
}

// ─── 真交點（Meeus 主要修正項）─────────────────────────────
function calcTrueNode(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const omega = n360(125.04452 - 1934.136261*T + 0.0020708*T*T + T*T*T/450000);
  const D = n360(297.85036 + 445267.111480*T - 0.0019142*T*T + T*T*T/189474);
  const M = n360(357.52772 + 35999.050340*T - 0.0001603*T*T - T*T*T/300000);
  const l = n360(134.96298 + 477198.867398*T + 0.0086972*T*T + T*T*T/56250);
  const F = n360( 93.27191 + 483202.017538*T - 0.0036825*T*T + T*T*T/327270);
  const delta =
    -1.4979 * Math.sin(d2r(2*(D - F)))
    - 0.1500 * Math.sin(d2r(M))
    - 0.1226 * Math.sin(d2r(2*D))
    + 0.1176 * Math.sin(d2r(2*F))
    - 0.0801 * Math.sin(d2r(2*l - M));
  return n360(omega + delta);
}

// ─── 月孛（平均遠地點）──────────────────────────────────────
function calcApogee(jd) {
  // 月球遠地點（月孛）= 近地點公式 + 180°
  const T = (jd - 2451545.0) / 36525.0;
  return n360(83.3532465 + 4069.0137287*T - 0.0103200*T*T - T*T*T/80053 + T*T*T*T/18999000 + 180);
}

// ─── 紫炁（28年一周天，順行）────────────────────────────────
function calcZiQi(jd) {
  const JD_REF = 2435937.5; // 1957/04/09 午夜
  return n360((jd - JD_REF) * 360 / (28 * 365.25));
}

// ─── Astronomy-engine 包裝 ───────────────────────────────
function makeTime(y, mo, d, h, mi, tzOff) {
  const ms = Date.UTC(y, mo-1, d, h, mi, 0) - tzOff * 3600000;
  return Astronomy.MakeTime(new Date(ms));
}

function getPlanetLon(id, time) {
  try {
    if (id === 'Sun')  return Astronomy.SunPosition(time).elon;
    if (id === 'Moon') return Astronomy.Ecliptic(Astronomy.GeoMoon(time)).elon;
    const b = Astronomy.Body[id];
    if (b == null) return null;
    return Astronomy.Ecliptic(Astronomy.GeoVector(b, time, true)).elon;
  } catch(e) { return null; }
}

function isRetro(id, time) {
  if (id === 'Sun' || id === 'Moon') return false;
  try {
    const b = Astronomy.Body[id];
    if (b == null) return false;
    const dt = 864000;
    const t1 = Astronomy.MakeTime(new Date(time.date.getTime() - dt));
    const t2 = Astronomy.MakeTime(new Date(time.date.getTime() + dt));
    const l1 = Astronomy.Ecliptic(Astronomy.GeoVector(b, t1, true)).elon;
    const l2 = Astronomy.Ecliptic(Astronomy.GeoVector(b, t2, true)).elon;
    let diff = l2 - l1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
  } catch(e) { return false; }
}

// ─── 主計算入口 ──────────────────────────────────────────
function calculate() {
  const dateStr = document.getElementById('bdate').value;
  const timeStr = document.getElementById('btime').value;
  const tzOff   = parseFloat(document.getElementById('tz').value);
  const lat      = parseFloat(document.getElementById('lat').value);
  const lon      = parseFloat(document.getElementById('lon').value);

  if (!dateStr || !timeStr) { alert('請輸入出生日期和時間'); return; }
  const [y,mo,d] = dateStr.split('-').map(Number);
  const [h,mi]   = timeStr.split(':').map(Number);

  const jd   = calcJD(y, mo, d, h, mi, tzOff);
  const time = makeTime(y, mo, d, h, mi, tzOff);

  // 真太陽時修正
  const eot    = calcEoT(jd);
  const jd_tst = jd + eot / 1440;

  const gmst = calcGMST(jd_tst);
  const eps  = calcEps(jd_tst);
  const lmst = n360(gmst + lon);
  const asc  = calcAsc(lmst, lat, eps);
  const mc   = calcMC(lmst, eps);

  // 整宮制宮頭
  const ascSign = signOf(asc);
  const houses  = Array.from({length:12}, (_,i) => ((ascSign+i)%12)*30);

  // 七政
  const positions = [];
  for (const p of PLANETS) {
    const plon = getPlanetLon(p.id, time);
    if (plon !== null) positions.push({...p, lon: plon, retro: isRetro(p.id, time)});
  }

  // 四餘
  const trueNN = calcTrueNode(jd);
  positions.push({id:'LuoHou', zh:'羅睺', sym:'☋', col:'#943010', lon:n360(trueNN+180), retro:false});
  positions.push({id:'JiDu',   zh:'計都', sym:'☊', col:'#0c6840', lon:trueNN,           retro:false});
  positions.push({id:'YuePo',  zh:'月孛', sym:'⚸', col:'#680898', lon:calcApogee(jd),   retro:false});
  positions.push({id:'ZiQi',   zh:'紫炁', sym:'炁', col:'#0c40b0', lon:calcZiQi(jd),     retro:false});

  // 命宮
  const sunPos   = positions.find(p => p.id === 'Sun');
  const mingGong = sunPos ? getMingGong(sunPos.lon, h) : null;

  // 命度：太陽宮內度數 X，投射到命宮同度，查星宿
  let mingDu = null;
  if (mingGong && sunPos) {
    const sunDegInSign = n360(sunPos.lon) % 30;
    const mingDuLon    = mingGong.eclIdx * 30 + sunDegInSign;
    mingDu = getMansion(mingDuLon);
  }

  // 身度：月亮所落星宿
  const moonPos = positions.find(p => p.id === 'Moon');
  const shenDu  = moonPos ? getMansion(moonPos.lon) : null;

  // 八字四柱（需在 drawChart 前完成）
  const tst_total = h + mi / 60 + eot / 60 + (lon - tzOff * 15) / 15;
  const tst_h     = ((tst_total % 24) + 24) % 24;
  const bazi      = calcBazi(y, mo, d, tst_h);
  window.BAZI     = bazi;

  drawChart(asc, mc, houses, positions, mingGong, mingDu, shenDu, bazi.year.zhiIdx, bazi.year.ganIdx, y);
  updateTable(positions, asc, mc, houses, mingGong, mingDu, shenDu);
  updateInfo(y, mo, d, h, mi, tzOff, lat, lon, asc, mc, eot);
  updateBaziPanel(bazi, tst_h);
}

// ─── SVG 繪製 ────────────────────────────────────────────
const CX=320, CY=320;
const RO=248;  // 最外圈（黃道外緣）
const RZ=210;  // 黃道環內緣
const RN=183;  // 星宿環內緣
const RP=168;  // 行星基準半徑
const RI=76;   // 內圓
// 神煞環（年支兩組 + 年干神煞共用）
const RSI=254, RSO=310;
// 洞微大限圈
const RDI=316, RDO=348;

// ─── 神煞資料 ─────────────────────────────────────────────
const SHENSHA_G1 = ['歲駕','天空','地雌','貫索','官符','小耗','大耗','天厄','天雄','天德','天狗','病符'];
const SHENSHA_G2 = ['劍鋒','青龍','喪門','朱雀','五鬼','月德','闌干','紫微','白虎','絞殺','弔客','驀越'];

// 年干神煞（甲0…癸9），每組 7 條，值為地支索引（子0…亥11）
// 順序：天貴, 玉貴, 陽刃, 飛刃, 國印, 文昌, 天廚
const SHENSHA_GAN_NAMES = ['天貴','玉貴','陽刃','飛刃','國印','文昌','天廚'];
const SHENSHA_GAN = [
  [7, 1, 3, 9,10, 5, 5], // 甲：未丑卯酉戌巳巳
  [8, 0, 4,10,11, 6, 6], // 乙：申子辰戌亥午午
  [9,11, 6, 0, 1, 8, 0], // 丙：酉亥午子丑申子
  [11, 9, 7, 1, 2, 9, 5], // 丁：亥酉未丑寅酉巳
  [1, 7, 6, 0, 1, 8, 6], // 戊：丑未午子丑申午
  [0, 8, 7, 1, 2, 9, 8], // 己：子申未丑寅酉申
  [1, 7, 9, 3, 4,11, 2], // 庚：丑未酉卯辰亥寅
  [2, 6,10, 4, 5,10, 6], // 辛：寅午戌辰巳戌午
  [3, 5, 0, 6, 7, 2, 9], // 壬：卯巳子午未寅酉
  [5, 3, 1, 7, 8, 3,11], // 癸：巳卯丑未申卯亥
];

// 納音長生神煞
// 30個納音五行（索引 = Math.floor(六十甲子序號/2)）
const NAYIN_WUXING_30 = [
  '金','火','木','土','金','火','水','土','金','木',  // 0-9
  '水','土','火','木','水','金','火','木','土','金',  // 10-19
  '火','水','土','金','木','水','土','火','木','水'   // 20-29
];
// 各納音五行的長生起始地支索引（陽順：子0丑1寅2卯3辰4巳5午6未7申8酉9戌10亥11）
const NAYIN_CS_START = { 金:5, 木:11, 水:8, 火:2, 土:2 };
const CHANGSHENG_NAMES = ['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];

function lonToAngle(lon, asc) { return n360(270 + (lon - asc)); }
function toXY(angleDeg, r) {
  const rad = d2r(angleDeg);
  return [CX + r*Math.cos(rad), CY - r*Math.sin(rad)];
}
function line(x1,y1,x2,y2,col,w,op) {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}" opacity="${op??1}"/>`;
}
function circle(cx,cy,r,fill,stroke,sw) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill??'none'}" stroke="${stroke??'none'}" stroke-width="${sw??1}"/>`;
}
function arc(cx,cy,r1,r2,a1deg,a2deg,fill) {
  const [x1o,y1o]=toXY(a1deg,r1), [x1i,y1i]=toXY(a1deg,r2);
  const [x2o,y2o]=toXY(a2deg,r1), [x2i,y2i]=toXY(a2deg,r2);
  return `<path d="M${x1o.toFixed(1)},${y1o.toFixed(1)} A${r1},${r1} 0 0,0 ${x2o.toFixed(1)},${y2o.toFixed(1)} L${x2i.toFixed(1)},${y2i.toFixed(1)} A${r2},${r2} 0 0,1 ${x1i.toFixed(1)},${y1i.toFixed(1)} Z" fill="${fill}" opacity="0.22"/>`;
}

function drawChart(asc, mc, houses, positions, mingGong, mingDu, shenDu, yearZhiIdx, yearGanIdx, birthYear) {
  const realAsc = asc;
  asc = 315; // 子宮（315°）永遠固定在最下方
  let s = '';

  // ── 底圓（含神煞環背景）────────────────────────────────
  s += circle(CX,CY,RSO,'#f0f0f8','none',0);  // 神煞圈背景（避免透出黑色）
  s += circle(CX,CY,RO,'#f6f6ff','#9090b8',2);

  // ── 黃道十二宮格（梯形色塊）──────────────────────────────
  for (let i=0; i<12; i++) {
    const lon0=i*30, lon1=lon0+30, lonM=lon0+15;
    const a0=lonToAngle(lon0,asc), a1=lonToAngle(lon1,asc), aM=lonToAngle(lonM,asc);
    // 四個頂點（直線邊梯形）
    const [x1o,y1o]=toXY(a0,RO), [x1i,y1i]=toXY(a0,RZ);
    const [x2o,y2o]=toXY(a1,RO), [x2i,y2i]=toXY(a1,RZ);
    s += `<polygon points="${x1o.toFixed(1)},${y1o.toFixed(1)} ${x2o.toFixed(1)},${y2o.toFixed(1)} ${x2i.toFixed(1)},${y2i.toFixed(1)} ${x1i.toFixed(1)},${y1i.toFixed(1)}" fill="${SIGN_COL[i]}" opacity="0.25"/>`;
    // 邊界線
    s += line(x1o,y1o,x1i,y1i,'#b0b0cc',1.5);
    const [tx,ty]=toXY(aM,(RO+RZ)/2);
    s += `<text x="${tx.toFixed(1)}" y="${(ty+5).toFixed(1)}" text-anchor="middle" fill="${SIGN_COL[i]}" font-size="16" font-weight="bold">${SIGN_SYM[i]}</text>`;
  }


  s += circle(CX,CY,RO,'none','#8080b0',2);
  s += circle(CX,CY,RZ,'none','#a0a0c0',1.5);

  // ── 二十八宿環 ────────────────────────────────────────
  s += circle(CX,CY,RN,'none','#9090b8',1.5);
  for (const m of MANSIONS) {
    // 宿界線（從 RZ 到 RN）
    const ang = lonToAngle(m.lon0, asc);
    const [ox,oy] = toXY(ang, RZ);
    const [ix,iy] = toXY(ang, RN);
    s += line(ox, oy, ix, iy, '#5858a8', 2);
    // 宿名（在宿中點）
    const angM = lonToAngle(m.lonM, asc);
    const [tx,ty] = toXY(angM, (RZ+RN)/2);
    // 窄宿（< 5 現代度）縮小字
    const col = m.width < 5 ? '#3838a0' : '#1414a8';
    const fs  = m.width < 4 ? 9 : (m.width < 7 ? 10 : 12);
    s += `<text x="${tx.toFixed(1)}" y="${(ty+4).toFixed(1)}" text-anchor="middle" fill="${col}" font-size="${fs}" font-weight="bold">${m.name}</text>`;
  }

  // ── 內圓 ──────────────────────────────────────────────
  s += circle(CX,CY,RI,'#f0f0ff','#9090b8',1.5);

  // ── 宮位分割線（RN → RI）& 宮名 ──────────────────────
  const hMG = mingGong ? (mingGong.eclIdx - houses[0]/30 + 12) % 12 : -1;
  for (let i=0; i<12; i++) {
    const ang=lonToAngle(houses[i],asc);
    const [ox,oy]=toXY(ang,RN), [ix,iy]=toXY(ang,RI);
    const isAng=i%3===0;
    s += line(ox,oy,ix,iy,isAng?'#1818d0':'#7070b0',isAng?2.5:2);
    if (hMG >= 0) {
      const midAng  = lonToAngle(houses[i]+15, asc);
      const [nx,ny] = toXY(midAng, (RN+RI)/2);
      const palIdx  = (i - hMG + 12) % 12;
      const palName = PALACE_NAMES[palIdx];
      const col     = palIdx === 0 ? '#7c3000' : '#1a1a80';
      s += `<text x="${nx.toFixed(1)}" y="${(ny-2).toFixed(1)}" text-anchor="middle" fill="${col}" font-size="14" font-weight="bold">${palName[0]}</text>`;
      s += `<text x="${nx.toFixed(1)}" y="${(ny+13).toFixed(1)}" text-anchor="middle" fill="${col}" font-size="14" font-weight="bold">${palName[1]}</text>`;
    }
  }


  // ── 行星符號（碰撞迴避：徑向錯開）────────────────────
  const GAP = 13;
  const sorted = [...positions]
    .map(p => ({ p, trueAng: lonToAngle(p.lon, asc) }))
    .sort((a, b) => a.trueAng - b.trueAng);
  sorted.forEach(item => { item.dispAng = item.trueAng; });
  for (let pass = 0; pass < 40; pass++) {
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = sorted[i+1].dispAng - sorted[i].dispAng;
      if (diff < GAP) {
        const mid = (sorted[i].dispAng + sorted[i+1].dispAng) / 2;
        sorted[i].dispAng   = mid - GAP / 2;
        sorted[i+1].dispAng = mid + GAP / 2;
      }
    }
  }
  for (const {p, trueAng, dispAng} of sorted) {
    const [px,py] = toXY(dispAng, RP);
    const label = BODY_LABEL[p.id] || p.sym;
    s += `<text x="${px.toFixed(1)}" y="${(py+5).toFixed(1)}" text-anchor="middle" fill="${p.col}" font-size="15" font-weight="bold">${label}</text>`;
    const [lx1,ly1] = toXY(dispAng, RP+9), [lx2,ly2] = toXY(trueAng, RN);
    s += line(lx1,ly1,lx2,ly2, p.col, 1.5, 0.7);
    const [mx1,my1] = toXY(trueAng, RN), [mx2,my2] = toXY(trueAng, RN-6);
    s += line(mx1,my1,mx2,my2, p.col, 2, 0.9);
  }

  // ── 中心圓：命度主 / 身度主 ──────────────────────────────
  {
    const PLANET_COL = {Sun:'#a86000',Moon:'#3050a0',Mercury:'#186820',Venus:'#a01868',Mars:'#b80808',Jupiter:'#785800',Saturn:'#503410'};
    const mLabel = mingDu?.ruler ? BODY_LABEL[mingDu.ruler] : null;
    const sLabel = shenDu?.ruler ? BODY_LABEL[shenDu.ruler] : null;
    const mCol   = mingDu?.ruler ? (PLANET_COL[mingDu.ruler] || '#333') : '#333';
    const sCol   = shenDu?.ruler ? (PLANET_COL[shenDu.ruler] || '#333') : '#333';

    const mText = (mingDu && mLabel) ? `${mingDu.name}宿${mLabel}` : null;
    const sText = (shenDu && sLabel) ? `${shenDu.name}宿${sLabel}` : null;

    if (mText && sText) {
      s += `<text x="${CX}" y="${CY-20}" text-anchor="middle" fill="#7070a0" font-size="11" font-weight="600">命度主</text>`;
      s += `<text x="${CX}" y="${CY-2}"  text-anchor="middle" fill="${mCol}" font-size="17" font-weight="bold">${mText}</text>`;
      s += `<line x1="${CX-28}" y1="${CY+5}" x2="${CX+28}" y2="${CY+5}" stroke="#c0c0d8" stroke-width="1"/>`;
      s += `<text x="${CX}" y="${CY+19}" text-anchor="middle" fill="#7070a0" font-size="11" font-weight="600">身度主</text>`;
      s += `<text x="${CX}" y="${CY+37}" text-anchor="middle" fill="${sCol}" font-size="17" font-weight="bold">${sText}</text>`;
    } else if (mText) {
      s += `<text x="${CX}" y="${CY-8}"  text-anchor="middle" fill="#7070a0" font-size="11" font-weight="600">命度主</text>`;
      s += `<text x="${CX}" y="${CY+14}" text-anchor="middle" fill="${mCol}" font-size="17" font-weight="bold">${mText}</text>`;
    } else if (sText) {
      s += `<text x="${CX}" y="${CY-8}"  text-anchor="middle" fill="#7070a0" font-size="11" font-weight="600">身度主</text>`;
      s += `<text x="${CX}" y="${CY+14}" text-anchor="middle" fill="${sCol}" font-size="17" font-weight="bold">${sText}</text>`;
    }
  }

  // ── 神煞環（年支 G1/G2 + 年干神煞 + 納音長生，同一圈並排）────────────
  if (yearZhiIdx !== undefined) {
    // 預建年干神煞的 地支→名稱[] 對照表
    const ganShaMap = {};
    if (yearGanIdx !== undefined && yearGanIdx !== null) {
      SHENSHA_GAN[yearGanIdx].forEach((z, i) => {
        if (!ganShaMap[z]) ganShaMap[z] = [];
        ganShaMap[z].push(SHENSHA_GAN_NAMES[i]);
      });
    }

    // 咸池（桃花）神煞：以年支三合局定桃花位
    // 申子辰→酉(9)、寅午戌→卯(3)、巳酉丑→午(6)、亥卯未→子(0)
    const XIANCHI_MAP = [9,6,3,0,9,6,3,0,9,6,3,0];
    const xianchiZhi = (yearZhiIdx !== undefined) ? XIANCHI_MAP[yearZhiIdx] : -1;

    // 驛馬神煞：以年支三合局定驛馬位
    // 申子辰→寅(2)、寅午戌→申(8)、巳酉丑→亥(11)、亥卯未→巳(5)
    const YIMA_MAP = [2,11,8,5,2,11,8,5,2,11,8,5];
    const yimaZhi = (yearZhiIdx !== undefined) ? YIMA_MAP[yearZhiIdx] : -1;

    // 預建納音長生神煞的 地支索引→長生名稱 對照表
    const nayinCSMap = {};
    if (yearGanIdx !== undefined && yearZhiIdx !== undefined) {
      // 由天干+地支索引求六十甲子序號
      let num60 = 0;
      for (let k = 0; k < 6; k++) {
        if ((yearGanIdx + 10 * k) % 12 === yearZhiIdx) { num60 = yearGanIdx + 10 * k; break; }
      }
      const nayinWuxing = NAYIN_WUXING_30[Math.floor(num60 / 2)];
      const csStart = NAYIN_CS_START[nayinWuxing];
      for (let i = 0; i < 12; i++) {
        nayinCSMap[(csStart + i) % 12] = CHANGSHENG_NAMES[i];
      }
    }
    // 劫殺：納音長生「絕」位（序號9）；亡神：劫殺對面宮（+6）
    const jiesha_nayin = (yearGanIdx !== undefined && yearZhiIdx !== undefined) ? (() => {
      let num60 = 0;
      for (let k = 0; k < 6; k++) {
        if ((yearGanIdx + 10*k) % 12 === yearZhiIdx) { num60 = yearGanIdx + 10*k; break; }
      }
      const csStart = NAYIN_CS_START[NAYIN_WUXING_30[Math.floor(num60/2)]];
      return (csStart + 9) % 12;
    })() : -1;
    const wangshen_nayin = jiesha_nayin >= 0 ? (jiesha_nayin + 6) % 12 : -1;

    // 孤辰、寡宿：依歲駕（yearZhiIdx）所在三合組決定
    // 寅卯辰→孤辰巳(5)/寡宿丑(1)；巳午未→孤辰申(8)/寡宿辰(4)
    // 申酉戌→孤辰亥(11)/寡宿未(7)；亥子丑→孤辰寅(2)/寡宿戌(10)
    const GUCHEN_MAP  = [2,2,5,5,5,8,8,8,11,11,11,2]; // 索引=yearZhiIdx
    const GUASU_MAP   = [10,10,1,1,1,4,4,4,7,7,7,10];
    const guchenZhi = (yearZhiIdx !== undefined) ? GUCHEN_MAP[yearZhiIdx] : -1;
    const guasuZhi  = (yearZhiIdx !== undefined) ? GUASU_MAP[yearZhiIdx]  : -1;

    s += circle(CX,CY,RSO,'none','#8878b0',1.5);
    s += circle(CX,CY,RSI,'none','#b0a0d0',1);
    for (let i = 0; i < 12; i++) {
      const ang = lonToAngle(i * 30, asc);
      const [ox,oy] = toXY(ang, RSO), [ix,iy] = toXY(ang, RSI);
      s += line(ox,oy,ix,iy,'#b0a0cc',1);
    }

    const rs = [RSI+14, RSI+28]; // 字的徑向位置（不變）

    for (let i = 0; i < 12; i++) {
      const zhiIdx = (yearZhiIdx + i) % 12;
      const eclIdx = (10 - zhiIdx + 12) % 12;
      const midAng = lonToAngle(eclIdx * 30 + 15, asc);
      const n1 = SHENSHA_G1[i], n2 = SHENSHA_G2[i];
      const stems = ganShaMap[zhiIdx] || [];     // 落在這個地支的年干神煞
      const csName = nayinCSMap[zhiIdx];         // 納音長生神煞
      const isXianchi = (zhiIdx === xianchiZhi);
      const isYima    = (zhiIdx === yimaZhi);
      const isJiesha   = (zhiIdx === jiesha_nayin);
      const isWangshen = (zhiIdx === wangshen_nayin);
      const isGuchen   = (zhiIdx === guchenZhi);
      const isGuasu    = (zhiIdx === guasuZhi);

      // 決定角度排列
      const totalCols = 2 + stems.length + (csName ? 1 : 0) + (isXianchi ? 1 : 0) + (isYima ? 1 : 0) + (isJiesha ? 1 : 0) + (isWangshen ? 1 : 0) + (isGuchen ? 1 : 0) + (isGuasu ? 1 : 0);
      const step = 26 / totalCols;
      const startOff = -(step * (totalCols - 1)) / 2;

      const allNames  = [n1, n2, ...stems,
        ...(csName     ? [csName]  : []),
        ...(isXianchi  ? ['咸池']  : []),
        ...(isYima     ? ['驛馬']  : []),
        ...(isJiesha   ? ['劫殺']  : []),
        ...(isWangshen ? ['亡神']  : []),
        ...(isGuchen   ? ['孤辰']  : []),
        ...(isGuasu    ? ['寡宿']  : []),
      ];
      const allColors = [
        '#3a1070', '#1a2870',
        ...stems.map(() => '#8a1040'),
        ...(csName     ? ['#1a6030'] : []), // 納音長生：深綠
        ...(isXianchi  ? ['#904010'] : []), // 咸池：橙褐
        ...(isYima     ? ['#106090'] : []), // 驛馬：藍綠
        ...(isJiesha   ? ['#606000'] : []), // 劫殺：黃褐
        ...(isWangshen ? ['#505050'] : []), // 亡神：深灰
        ...(isGuchen   ? ['#7a3090'] : []), // 孤辰：紫紅
        ...(isGuasu    ? ['#307060'] : []), // 寡宿：青綠
      ];
      const allSizes  = [
        11, 11,
        ...stems.map(() => stems.length > 1 ? 9 : 10),
        ...(csName     ? [csName.length > 2 ? 8 : 10] : []),
        ...(isXianchi  ? [10] : []),
        ...(isYima     ? [10] : []),
        ...(isJiesha   ? [10] : []),
        ...(isWangshen ? [10] : []),
        ...(isGuchen   ? [10] : []),
        ...(isGuasu    ? [10] : []),
      ];

      // 子丑寅戌亥 五宮文字朝內（-90°）且內外對調
      const flipZhi = [0,1,2,10,11].includes(zhiIdx);
      const rot = flipZhi ? -90 : 90;
      // flipZhi：name[0]在內(rs[0])、name[1]在外(rs[1])
      // 其他：name[1]在內(rs[0])、name[0]在外(rs[1])
      allNames.forEach((name, ci) => {
        const off = startOff + ci * step;
        const tx0 = (CX+rs[0]).toFixed(1), ty = (CY+4).toFixed(1);
        const tx1 = (CX+rs[1]).toFixed(1);
        const [inner, outer] = flipZhi ? [name[0], name[1]] : [name[1], name[0]];
        s += `<g transform="rotate(${(-(midAng+off)).toFixed(1)},${CX},${CY})">`;
        if (inner !== undefined) s += `<text x="${tx0}" y="${ty}" text-anchor="middle" fill="${allColors[ci]}" font-size="${allSizes[ci]}" font-weight="700" transform="rotate(${rot},${tx0},${ty})">${inner}</text>`;
        if (outer !== undefined) s += `<text x="${tx1}" y="${ty}" text-anchor="middle" fill="${allColors[ci]}" font-size="${allSizes[ci]}" font-weight="700" transform="rotate(${rot},${tx1},${ty})">${outer}</text>`;
        s += `</g>`;
      });
    }
  }


  // ── 洞微大限圈 ────────────────────────────────────────────
  const sunPosInChart = positions.find(p => p.id === 'Sun');
  if (mingGong && sunPosInChart && birthYear) {
    const DONGWEI_YEARS = [null, 10, 11, 15, 8, 7, 11, 4.5, 4.5, 4.5, 5, 5];

    // 命宮年限
    const sunDegInSign = n360(sunPosInChart.lon) % 30;
    const mingYears    = 10 + sunDegInSign / 3;
    DONGWEI_YEARS[0]   = mingYears;

    // 環形白色背景（只填 RDI~RDO 之間）
    s += `<path d="M ${CX+RDO} ${CY} A ${RDO} ${RDO} 0 1 0 ${CX-RDO} ${CY} A ${RDO} ${RDO} 0 1 0 ${CX+RDO} ${CY} M ${CX+RDI} ${CY} A ${RDI} ${RDI} 0 1 1 ${CX-RDI} ${CY} A ${RDI} ${RDI} 0 1 1 ${CX+RDI} ${CY} Z" fill="#ffffff" fill-rule="evenodd"/>`;
    s += circle(CX,CY,RDO,'none','#b08040',1.2);
    s += circle(CX,CY,RDI,'none','#c8a060',0.8);

    // 各宮每格度數（round 到小數第2位）
    const mingDpy = Math.round(30 / mingYears * 100) / 100;
    const DONGWEI_DPY = [
      mingDpy,                                    // 命宮（動態）
      3.00,                                       // 相貌 10年
      Math.round(30/11 * 100) / 100,              // 福德 11年 → 2.73
      2.00,                                       // 官祿 15年
      Math.round(30/8  * 100) / 100,              // 遷移 8年  → 3.75
      Math.round(30/7  * 100) / 100,              // 疾厄 7年  → 4.29
      Math.round(30/11 * 100) / 100,              // 夫妻 11年 → 2.73
      Math.round(30/4.5* 100) / 100,              // 奴僕 4.5年→ 6.67
      Math.round(30/4.5* 100) / 100,              // 子女 4.5年
      Math.round(30/4.5* 100) / 100,              // 田宅 4.5年
      6.00,                                       // 兄弟 5年
      6.00,                                       // 財帛 5年
    ];

    const mingEcl = mingGong.eclIdx;
    let currentAge = 1;
    let entryOffset = 0; // 本宮起始偏移量（上一宮溢出的度數）

    for (let p = 0; p < 12; p++) {
      const eclIdx  = (mingEcl - p + 12) % 12;
      const pYears  = DONGWEI_YEARS[p];
      const dpy     = DONGWEI_DPY[p];
      const intYears= Math.floor(pYears);
      const fracYears= pYears - intYears;
      const palHigh = eclIdx * 30 + 30; // 宮位高緯邊 longitude

      const flipLabel = [0,1,2,10,11].includes(eclIdx);
      const rotLabel  = flipLabel ? -90 : 90;

      // 畫 intYears 個格子（從高緯邊減去 entryOffset 開始）
      for (let y = 0; y < intYears; y++) {
        const lon = palHigh - entryOffset - y * dpy;
        const age = Math.round(currentAge) + y;

        const ang = lonToAngle(lon, asc);
        const [ox,oy] = toXY(ang, RDO);
        const [ix,iy] = toXY(ang, RDI);
        s += line(ox,oy,ix,iy, (y === 0 && entryOffset === 0) ? '#906020' : '#c8a878',
                               (y === 0 && entryOffset === 0) ? 1.2 : 0.7);

        const midAng2 = lonToAngle(lon - dpy / 2, asc);
        const [lx,ly] = toXY(midAng2, (RDI + RDO) / 2);
        s += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="#7a4800" font-size="9" font-weight="600" transform="rotate(${rotLabel},${lx.toFixed(1)},${ly.toFixed(1)})">${age}</text>`;
      }

      // 計算溢出：本宮用掉的度數 = entryOffset + intYears*dpy
      // 溢出距離 = (entryOffset + intYears*dpy + fracYears*dpy) - 30
      const totalUsed = entryOffset + pYears * dpy;
      entryOffset = totalUsed - 30; // 帶入下一宮（若<0則=0）
      if (entryOffset < 0) entryOffset = 0;

      // 若有溢出，在下一宮標記結束年齡線
      if (entryOffset > 0) {
        const prevEcl = (eclIdx - 1 + 12) % 12;
        const overflowLon = prevEcl * 30 + 30 - entryOffset;
        const endAge = Math.round(currentAge) + intYears;
        const ang = lonToAngle(overflowLon, asc);
        const [ox,oy] = toXY(ang, RDO);
        const [ix,iy] = toXY(ang, RDI);
        s += line(ox,oy,ix,iy,'#906020',1.2);
        const [lx,ly] = toXY(ang, (RDI + RDO) / 2);
        const flip2 = [0,1,2,10,11].includes(prevEcl);
        s += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="#7a4800" font-size="9" font-weight="600" transform="rotate(${flip2?-90:90},${lx.toFixed(1)},${ly.toFixed(1)})">${endAge}</text>`;
      }

      currentAge += pYears;
    }
  }

  document.getElementById('chart-svg').innerHTML = s;
}

// ─── 星曆表 ──────────────────────────────────────────────
function updateTable(positions, asc, mc, houses, mingGong, mingDu, shenDu) {
  const fourYuIds = new Set(['LuoHou','JiDu','YuePo','ZiQi']);
  const planets7  = positions.filter(p => !fourYuIds.has(p.id));
  const fourYu    = positions.filter(p =>  fourYuIds.has(p.id));

  const makeRow = p => {
    const mansion = getMansion(p.lon);
    const label   = BODY_LABEL[p.id] || p.zh;
    return `<tr>
      <td style="white-space:nowrap"><span style="color:${p.col};font-weight:700;font-size:1.25rem">${label}</span><span style="color:#000000;font-weight:700;font-size:.85rem;margin-left:5px">${p.zh}</span></td>
      <td style="color:#000!important;font-size:1.25rem;font-weight:bold;font-family:'Microsoft JhengHei',sans-serif">${fmtLon(p.lon)}</td>
      <td style="color:#000000;font-weight:700;font-size:1.1rem;text-align:center">${mansion.name}</td>
      <td style="text-align:center">${p.retro?'<span class="retro">逆</span>':''}</td>
     </tr>`;
  };

  const ascMansion = getMansion(asc);
  const mcMansion  = getMansion(mc);

  const headerRows =
    `<tr><td style="white-space:nowrap"><span style="color:#0000cc;font-weight:700;font-size:1.15rem">升</span><span style="color:#000000;font-weight:700;font-size:.85rem;margin-left:5px">上升點</span></td><td style="color:#000!important;font-size:1.25rem;font-weight:bold;font-family:'Microsoft JhengHei',sans-serif">${fmtLon(asc)}</td><td style="color:#000000;font-weight:700;font-size:1.1rem;text-align:center">${ascMansion.name}</td><td></td></tr>` +
    `<tr><td style="white-space:nowrap"><span style="color:#886600;font-weight:700;font-size:1.15rem">頂</span><span style="color:#000000;font-weight:700;font-size:.85rem;margin-left:5px">天頂</span></td><td style="color:#000!important;font-size:1.25rem;font-weight:bold;font-family:'Microsoft JhengHei',sans-serif">${fmtLon(mc)}</td><td style="color:#000000;font-weight:700;font-size:1.1rem;text-align:center">${mcMansion.name}</td><td></td></tr>`;

  const sepRow = `<tr class="sep-row"><td colspan="4">四　餘</td></tr>`;
  const rows = headerRows + planets7.map(makeRow).join('') + sepRow + fourYu.map(makeRow).join('');

  document.getElementById('planet-table').innerHTML =
    `<table><thead><tr><th>星體</th><th>位置</th><th>宿</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;

  const mingGongHtml = mingGong
    ? `<div style="background:#fef9ee;border:2px solid #c8900a;border-radius:7px;padding:11px 13px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:7px">
          <span style="color:#4a2800;font-weight:700;font-size:1rem">命宮：<strong style="font-size:1.2rem;color:#2a1000">${mingGong.name}宮</strong></span>
          <span style="color:#4a2800;font-weight:700;font-size:1rem">命度：<strong style="font-size:1.2rem;color:#2a1000">${mingDu ? mingDu.name + '宿' : '—'}</strong></span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#4a2800;font-weight:600;font-size:.95rem">時辰：${mingGong.shiChen}</span>
          <span style="color:#4a2800;font-weight:700;font-size:1rem">身度：<strong style="font-size:1.2rem;color:#2a1000">${shenDu ? shenDu.name + '宿' : '—'}</strong></span>
        </div>
      </div>`
    : '';
  document.getElementById('house-info').innerHTML = mingGongHtml;
}

function updateInfo(y,mo,d,h,mi,tz,lat,lon,asc,mc,eot) {
  const pad = n => String(n).padStart(2,'0');
  const tzStr = tz>=0?`UTC+${tz}`:`UTC${tz}`;
  const absEot = Math.abs(eot).toFixed(1);
  const eotStr = eot>=0?`+${absEot}′`:`-${absEot}′`;
  document.getElementById('chart-info').textContent =
    `${y}/${pad(mo)}/${pad(d)} ${pad(h)}:${pad(mi)} ${tzStr} ｜ ${lat}°N ${lon}°E ｜ 均時差 ${eotStr}`;
}

function updateBaziPanel(bazi, tst_h) {
  const cols = [
    { label: '年', ...bazi.year  },
    { label: '月', ...bazi.month },
    { label: '日', ...bazi.day   },
    { label: '時', ...bazi.hour  },
  ];
  const html = cols.map(c => `
    <div class="bazi-col">
      <span class="bazi-col-label">${c.label}</span>
      <span class="bazi-char-gan">${c.gan}</span>
      <div class="bazi-divider"></div>
      <span class="bazi-char-zhi">${c.zhi}</span>
    </div>`).join('');
  document.getElementById('bazi-grid').innerHTML = html;
  const th = Math.floor(tst_h);
  const tm = Math.floor((tst_h - th) * 60);
  document.getElementById('bazi-tst').textContent =
    `真太陽時：${String(th).padStart(2,'0')}時${String(tm).padStart(2,'0')}分`;
}

function setCity(lat, lon, tz) {
  document.getElementById('lat').value = lat;
  document.getElementById('lon').value = lon;
  document.getElementById('tz').value  = tz;
}

window.addEventListener('load', () => {
  setTimeout(() => { if (typeof Astronomy !== 'undefined') calculate(); }, 600);
});
