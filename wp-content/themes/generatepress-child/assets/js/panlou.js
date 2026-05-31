// ─── 常數 ───────────────────────────────────────────────
// 地支對應：戌=白羊 酉=金牛 申=雙子 未=巨蟹 午=獅子 巳=處女
//           辰=天秤 卯=天蠍 寅=射手 丑=摩羯 子=水瓶 亥=雙魚
const SIGN_SYM  = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥'];
const SIGN_NAME = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥'];
const SIGN_ABB  = ['戌','酉','申','未','午','巳','辰','卯','寅','丑','子','亥'];
const SIGN_COL  = ['#e05050','#90b050','#e0c040','#5090e0','#e09030','#70b070',
                   '#90b0e0','#9050d0','#d07030','#709080','#70b0c0','#9070c0'];

// 二十八宿原始資料（傳統度數，總和 365.25）
// 順序：虛女牛斗箕尾心房氐亢角軫翼張星柳鬼井參觜畢昴胃婁奎壁室危
const MANSION_RAW = [
  {name:'虛',trad:10},  {name:'女',trad:12},  {name:'牛',trad:8},
  {name:'斗',trad:26.25},{name:'箕',trad:11},  {name:'尾',trad:18},
  {name:'心',trad:5},   {name:'房',trad:5},   {name:'氐',trad:15},
  {name:'亢',trad:9},   {name:'角',trad:12},  {name:'軫',trad:17},
  {name:'翼',trad:18},  {name:'張',trad:18},  {name:'星',trad:7},
  {name:'柳',trad:15},  {name:'鬼',trad:4},   {name:'井',trad:33},
  {name:'參',trad:9},   {name:'觜',trad:2},   {name:'畢',trad:16},
  {name:'昴',trad:11},  {name:'胃',trad:14},  {name:'婁',trad:12},
  {name:'奎',trad:16},  {name:'壁',trad:9},   {name:'室',trad:16},
  {name:'危',trad:17},
];

// 七政（去除天王、海王、冥王）
const PLANETS = [
  {id:'Sun',    zh:'太陽', sym:'☉', col:'#ffd060'},
  {id:'Moon',   zh:'月亮', sym:'☽', col:'#c8d0e0'},
  {id:'Mercury',zh:'水星', sym:'☿', col:'#80c880'},
  {id:'Venus',  zh:'金星', sym:'♀', col:'#e0a8c8'},
  {id:'Mars',   zh:'火星', sym:'♂', col:'#e06060'},
  {id:'Jupiter',zh:'木星', sym:'♃', col:'#c8a860'},
  {id:'Saturn', zh:'土星', sym:'♄', col:'#a89060'},
];

// ─── 數學工具 ────────────────────────────────────────────
const π = Math.PI;
const r2d = r => r * 180 / π;
const d2r = d => d * π / 180;
const n360 = a => ((a % 360) + 360) % 360;

// ─── 二十八宿初始化 ──────────────────────────────────────
// 虛宿0度 = 子23°26' = 水瓶座300° + 23°26' = 323.4333°
const MANSION_START = 333 + 26 / 60; // 亥3°26' = 虛宿東界（終點）
// 1 傳統度 = 360/365.25 現代度
const MANSION_SCALE = 360 / 365.25;

let _mCum = 0;
const MANSIONS = MANSION_RAW.map(m => {
  const width = m.trad * MANSION_SCALE;
  const lon0  = n360(MANSION_START - _mCum);
  const lonM  = n360(MANSION_START - _mCum - width / 2);
  _mCum += width;
  return { name: m.name, trad: m.trad, width, lon0, lonM };
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
  const s  = Math.floor(((deg - d) * 60 - m) * 60);
  return `${SIGN_ABB[si]} ${d}°${String(m).padStart(2,'0')}′${String(s).padStart(2,'0')}″`;
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
  const T = (jd - 2451545.0) / 36525.0;
  return n360(83.3532465 + 4069.0137287*T - 0.0103200*T*T - T*T*T/80053 + T*T*T*T/18999000);
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
  positions.push({id:'LuoHou', zh:'羅睺', sym:'☋', col:'#d08060', lon:n360(trueNN+180), retro:false});
  positions.push({id:'JiDu',   zh:'計都', sym:'☊', col:'#60d090', lon:trueNN,           retro:false});
  positions.push({id:'YuePo',  zh:'月孛', sym:'⚸', col:'#c070d0', lon:calcApogee(jd),   retro:false});
  positions.push({id:'ZiQi',   zh:'紫炁', sym:'炁', col:'#80b0ff', lon:calcZiQi(jd),     retro:false});

  drawChart(asc, mc, houses, positions);
  updateTable(positions, asc, mc, houses);
  updateInfo(y, mo, d, h, mi, tzOff, lat, lon, asc, mc, eot);
}

// ─── SVG 繪製 ────────────────────────────────────────────
const CX=260, CY=260;
const RO=248;
const RZ=210;
const RN=183;
const RP=150;
const RI=76;

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
  return `<path d="M${x1o.toFixed(1)},${y1o.toFixed(1)} A${r1},${r1} 0 0,0 ${x2o.toFixed(1)},${y2o.toFixed(1)} L${x2i.toFixed(1)},${y2i.toFixed(1)} A${r2},${r2} 0 0,1 ${x1i.toFixed(1)},${y1i.toFixed(1)} Z" fill="${fill}" opacity="0.18"/>`;
}

function drawChart(asc, mc, houses, positions) {
  let s = '';

  s += circle(CX,CY,RO,'#06060f','#1a1a38',1.5);

  for (let i=0; i<12; i++) {
    const lon0=i*30, lon1=lon0+30, lonM=lon0+15;
    const a0=lonToAngle(lon0,asc), a1=lonToAngle(lon1,asc), aM=lonToAngle(lonM,asc);
    s += arc(CX,CY,RO,RZ,a1,a0,SIGN_COL[i]);
    const [ox,oy]=toXY(a0,RO), [ix,iy]=toXY(a0,RZ);
    s += line(ox,oy,ix,iy,'#2a2a50',1);
    const [tx,ty]=toXY(aM,(RO+RZ)/2);
    s += `<text x="${tx.toFixed(1)}" y="${(ty+5).toFixed(1)}" text-anchor="middle" fill="${SIGN_COL[i]}" font-size="14">${SIGN_SYM[i]}</text>`;
  }
  s += circle(CX,CY,RO,'none','#2a2a55',1.5);
  s += circle(CX,CY,RZ,'none','#1e1e45',1);

  s += circle(CX,CY,RN,'none','#181830',0.8);
  for (const m of MANSIONS) {
    const ang = lonToAngle(m.lon0, asc);
    const [ox,oy] = toXY(ang, RZ);
    const [ix,iy] = toXY(ang, RN);
    s += line(ox, oy, ix, iy, '#404080', 1.5);
    const angM = lonToAngle(m.lonM, asc);
    const [tx,ty] = toXY(angM, (RZ+RN)/2);
    const col = m.width < 5 ? '#3c3c70' : '#5858a8';
    const fs  = m.width < 4 ? 7 : (m.width < 7 ? 8 : 10);
    s += `<text x="${tx.toFixed(1)}" y="${(ty+4).toFixed(1)}" text-anchor="middle" fill="${col}" font-size="${fs}">${m.name}</text>`;
  }

  s += circle(CX,CY,RI,'#050510','#1a1a38',1);

  for (let i=0; i<12; i++) {
    const ang=lonToAngle(houses[i],asc);
    const [ox,oy]=toXY(ang,RN), [ix,iy]=toXY(ang,RI);
    const isAng=i%3===0;
    s += line(ox,oy,ix,iy,isAng?'#6060c0':'#3a3a70',isAng?2:1.5);
    const midAng=lonToAngle(houses[i]+15,asc);
    const [nx,ny]=toXY(midAng,(RN+RI)/2-4);
    s += `<text x="${nx.toFixed(1)}" y="${(ny+4).toFixed(1)}" text-anchor="middle" fill="#38386a" font-size="11">${i+1}</text>`;
  }

  const axes = [
    {lon:asc,           label:'ASC',col:'#b0b0ff',w:2},
    {lon:n360(asc+180), label:'DSC',col:'#8080c0',w:1},
    {lon:mc,            label:'MC', col:'#e0d060',w:2},
    {lon:n360(mc+180),  label:'IC', col:'#907840',w:1},
  ];
  for (const ax of axes) {
    const ang=lonToAngle(ax.lon,asc);
    const [ox,oy]=toXY(ang,RZ), [ix,iy]=toXY(ang,RI);
    s += line(ox,oy,ix,iy,ax.col,ax.w,0.7);
    const [lx,ly]=toXY(ang,RZ+11);
    const anch=(ang>45&&ang<135||ang>225&&ang<315)?'middle':(ang<=45||ang>=315)?'start':'end';
    const dy=(ang>135&&ang<315)?14:-4;
    s += `<text x="${lx.toFixed(1)}" y="${(ly+dy).toFixed(1)}" text-anchor="${anch}" fill="${ax.col}" font-size="10" font-weight="bold">${ax.label}</text>`;
  }

  const placed = [];
  const sorted = [...positions].sort((a,b)=>a.lon-b.lon);
  for (const p of sorted) {
    const ang=lonToAngle(p.lon,asc);
    let r=RP;
    for (const pp of placed) {
      const diff=Math.min(Math.abs(ang-pp.ang),360-Math.abs(ang-pp.ang));
      if (diff<14) r=Math.min(r, pp.r-22);
    }
    r=Math.max(r, RI+16);
    const [px,py]=toXY(ang,r);
    const isCJK = p.sym.charCodeAt(0) > 0xFF;
    const fs = isCJK ? 13 : 17;
    s += `<text x="${px.toFixed(1)}" y="${(py+5).toFixed(1)}" text-anchor="middle" fill="${p.col}" font-size="${fs}">${p.sym}</text>`;
    if (p.retro) {
      s += `<text x="${(px+11).toFixed(1)}" y="${(py-3).toFixed(1)}" fill="${p.col}" font-size="8" opacity=".8">℞</text>`;
    }
    const [t1x,t1y]=toXY(ang,RZ-1), [t2x,t2y]=toXY(ang,RZ-8);
    s += line(t1x,t1y,t2x,t2y,p.col,2);
    placed.push({ang,r});
  }

  s += `<text x="260" y="512" text-anchor="middle" fill="#404068" font-size="11">ASC ${Math.floor(n360(asc)%30)}° ${SIGN_NAME[signOf(asc)]}</text>`;

  document.getElementById('chart-svg').innerHTML = s;
}

// ─── 星曆表 ──────────────────────────────────────────────
function updateTable(positions, asc, mc, houses) {
  const fourYuIds = new Set(['LuoHou','JiDu','YuePo','ZiQi']);
  const planets7  = positions.filter(p => !fourYuIds.has(p.id));
  const fourYu    = positions.filter(p =>  fourYuIds.has(p.id));

  const makeRow = p => {
    const mansion = getMansion(p.lon);
    return `<tr>
      <td><span style="color:${p.col}">${p.sym}</span></td>
      <td style="color:#9090c8">${p.zh}</td>
      <td style="color:#d0d0e8;font-family:monospace;font-size:.76rem">${fmtLon(p.lon)}</td>
      <td style="color:#5858a0;font-size:.8rem">${mansion.name}</td>
      <td>${p.retro?'<span class="retro">℞</span>':''}</td>
     </tr>`;
  };

  const sepRow = `<tr class="sep-row"><td colspan="5">── 四餘 ──</td></tr>`;
  const rows = planets7.map(makeRow).join('') + sepRow + fourYu.map(makeRow).join('');

  document.getElementById('planet-table').innerHTML =
    `<table><thead><tr><th></th><th>星體</th><th>位置</th><th>宿</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;

  document.getElementById('house-info').innerHTML = '';
}

function updateInfo(y,mo,d,h,mi,tz,lat,lon,asc,mc,eot) {
  const pad = n => String(n).padStart(2,'0');
  const tzStr = tz>=0?`UTC+${tz}`:`UTC${tz}`;
  const absEot = Math.abs(eot).toFixed(1);
  const eotStr = eot>=0?`+${absEot}′`:`-${absEot}′`;
  document.getElementById('chart-info').textContent =
    `${y}/${pad(mo)}/${pad(d)} ${pad(h)}:${pad(mi)} ${tzStr} ｜ ${lat}°N ${lon}°E ｜ 均時差 ${eotStr}`;
}

function setCity(lat, lon, tz) {
  document.getElementById('lat').value = lat;
  document.getElementById('lon').value = lon;
  document.getElementById('tz').value  = tz;
}

window.addEventListener('load', () => {
  setTimeout(() => { if (typeof Astronomy !== 'undefined') calculate(); }, 600);
});
