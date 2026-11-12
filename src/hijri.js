// Date engine for taqweemak.com
// Hijri dates use the Umm al-Qura calendar via the built-in ICU calendar "islamic-umalqura".
// Supported range: 1356–1500 AH (1937–2077 CE). Outside it we return null rather than guess.

export const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];
export const GREG_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
export const GREG_MONTHS_LEVANT = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول',
];
export const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const MIN_HY = 1356;
export const MAX_HY = 1500;
export const MIN_DAY = Date.UTC(1937, 2, 14) / 864e5; // 1 Muharram 1356
export const MAX_DAY = Date.UTC(2077, 10, 16) / 864e5; // 30 Dhu al-Hijjah 1500

const DAY = 864e5;
const HFMT = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
  timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric',
});
const RIYADH = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit',
});

// Day number = days since 1970-01-01 (UTC).
export const dayNum = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / DAY);
export function fromDayNum(n) {
  const dt = new Date(n * DAY);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}
export const weekday = (n) => new Date(n * DAY).getUTCDay();
export const inRange = (n) => n >= MIN_DAY && n <= MAX_DAY;

export function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
export function gregMonthLength(y, m) { return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }
export function isValidGreg(y, m, d) { return y >= 1 && m >= 1 && m <= 12 && d >= 1 && d <= gregMonthLength(y, m); }

// Gregorian day number -> Hijri {y,m,d}
export function hijriFromDayNum(n) {
  if (!inRange(n)) return null;
  const out = {};
  for (const p of HFMT.formatToParts(new Date(n * DAY))) {
    if (p.type === 'year' || p.type === 'month' || p.type === 'day') out[p.type[0]] = Number(p.value);
  }
  return out;
}

// Hijri -> Gregorian day number (null if the Hijri date does not exist, e.g. 30 in a 29-day month)
export function dayNumFromHijri(hy, hm, hd) {
  if (hy < MIN_HY || hy > MAX_HY || hm < 1 || hm > 12 || hd < 1 || hd > 30) return null;
  const EPOCH = dayNum(622, 7, 19); // 1 Muharram 1 AH (proleptic Gregorian)
  let n = Math.round(EPOCH + (hy - 1) * 354.36707 + (hm - 1) * 29.530589 + (hd - 1));
  for (let i = 0; i < 10; i++) {
    n = Math.min(Math.max(n, MIN_DAY), MAX_DAY);
    const h = hijriFromDayNum(n);
    if (!h) break;
    const diff = Math.round((hy - h.y) * 354.36707 + (hm - h.m) * 29.530589 + (hd - h.d));
    if (diff === 0) break;
    n += diff;
  }
  n = Math.min(Math.max(n, MIN_DAY), MAX_DAY);
  const h = hijriFromDayNum(n);
  return h && h.y === hy && h.m === hm && h.d === hd ? n : null;
}

export function hijriMonthLength(hy, hm) {
  const a = dayNumFromHijri(hy, hm, 1);
  const b = hm === 12 ? dayNumFromHijri(hy + 1, 1, 1) : dayNumFromHijri(hy, hm + 1, 1);
  if (a == null) return null;
  if (b == null) return dayNumFromHijri(hy, hm, 30) == null ? 29 : 30;
  return b - a;
}
export function hijriYearLength(hy) {
  let t = 0;
  for (let m = 1; m <= 12; m++) t += hijriMonthLength(hy, m);
  return t;
}

// Build-time clock override (Node only) so the daily rebuild can be tested: TAQWEEMAK_NOW=2026-11-11T20:59:00Z
function defaultNow() {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.TAQWEEMAK_NOW) return new Date(process.env.TAQWEEMAK_NOW);
  } catch (e) { /* browser */ }
  return new Date();
}

// Today's date in Saudi Arabia (Asia/Riyadh)
export function todayRiyadh(now = defaultNow()) {
  const [y, m, d] = RIYADH.format(now).split('-').map(Number);
  return dayNum(y, m, d);
}

export const fmtHijri = (h) => `${h.d} ${HIJRI_MONTHS[h.m - 1]} ${h.y} هـ`;
export const fmtGreg = (g) => `${g.d} ${GREG_MONTHS[g.m - 1]} ${g.y} م`;
export const fmtHijriNum = (h) => `${String(h.d).padStart(2, '0')}/${String(h.m).padStart(2, '0')}/${h.y}`;
export const fmtGregNum = (g) => `${String(g.d).padStart(2, '0')}/${String(g.m).padStart(2, '0')}/${g.y}`;

// Full description of a day
export function describe(n) {
  const g = fromDayNum(n);
  const h = hijriFromDayNum(n);
  return { n, g, h, wd: WEEKDAYS[weekday(n)], gText: fmtGreg(g), hText: h ? fmtHijri(h) : null };
}

// Difference in years / months / days between two dates of the same calendar
export function diffYMD(from, to, monthLen) {
  let y = to.y - from.y, m = to.m - from.m, d = to.d - from.d;
  if (d < 0) {
    m -= 1;
    const pm = to.m === 1 ? 12 : to.m - 1;
    const py = to.m === 1 ? to.y - 1 : to.y;
    d += monthLen(py, pm);
  }
  if (m < 0) { y -= 1; m += 12; }
  return { y, m, d };
}

// Next day number (>= from) on which a Hijri month/day occurs
export function nextHijriOccurrence(fromN, hm, hd) {
  const h = hijriFromDayNum(fromN);
  if (!h) return null;
  for (let y = h.y; y <= h.y + 1; y++) {
    const n = dayNumFromHijri(y, hm, hd);
    if (n != null && n >= fromN) return n;
  }
  return null;
}

// Saudi government payday: 27th of the Gregorian month; Friday -> Thursday 26th, Saturday -> Sunday 28th.
export function saudiPayday(y, m) {
  let n = dayNum(y, m, 27);
  const wd = weekday(n);
  if (wd === 5) n -= 1;
  else if (wd === 6) n += 1;
  return n;
}
export function nextSaudiPayday(fromN) {
  const g = fromDayNum(fromN);
  let n = saudiPayday(g.y, g.m);
  if (n < fromN) n = g.m === 12 ? saudiPayday(g.y + 1, 1) : saudiPayday(g.y, g.m + 1);
  return n;
}

// Arabic plural helper for counts (يوم / أيام ...)
export function plural(n, [one, two, few, many, sing]) {
  const f = n.toLocaleString('en-US');
  if (n === 0) return `0 ${sing}`;
  if (n === 1) return one;
  if (n === 2) return two;
  const r = n % 100;
  if (r >= 3 && r <= 10) return `${f} ${few}`;
  if (r >= 11) return `${f} ${many}`;
  return `${f} ${sing}`;
}
export const DAYS_W = ['يوم واحد', 'يومان', 'أيام', 'يومًا', 'يوم'];
export const MONTHS_W = ['شهر واحد', 'شهران', 'أشهر', 'شهرًا', 'شهر'];
export const YEARS_W = ['سنة واحدة', 'سنتان', 'سنوات', 'سنة', 'سنة'];
export const WEEKS_W = ['أسبوع واحد', 'أسبوعان', 'أسابيع', 'أسبوعًا', 'أسبوع'];
export const HOURS_W = ['ساعة واحدة', 'ساعتان', 'ساعات', 'ساعة', 'ساعة'];

export function fmtYMD({ y, m, d }) {
  const parts = [];
  if (y) parts.push(plural(y, YEARS_W));
  if (m) parts.push(plural(m, MONTHS_W));
  if (d || !parts.length) parts.push(plural(d, DAYS_W));
  return parts.join(' و');
}

// Add years / months / days in the Gregorian calendar (day clipped to month end, e.g. 31 Jan + 1 month = 28/29 Feb)
export function addGreg(n, { y = 0, m = 0, d = 0 } = {}) {
  const g = fromDayNum(n);
  let mm = g.m - 1 + m + 12 * y;
  const yy = g.y + Math.floor(mm / 12);
  mm = ((mm % 12) + 12) % 12 + 1;
  return dayNum(yy, mm, Math.min(g.d, gregMonthLength(yy, mm))) + d;
}
// Same in the Hijri (Umm al-Qura) calendar; null when outside the supported range
export function addHijri(n, { y = 0, m = 0, d = 0 } = {}) {
  const h = hijriFromDayNum(n);
  if (!h) return null;
  let mm = h.m - 1 + m + 12 * y;
  const yy = h.y + Math.floor(mm / 12);
  mm = ((mm % 12) + 12) % 12 + 1;
  if (yy < MIN_HY || yy > MAX_HY) return null;
  const r = dayNumFromHijri(yy, mm, Math.min(h.d, hijriMonthLength(yy, mm)));
  if (r == null) return null;
  const out = r + d;
  return inRange(out) ? out : null;
}

// Count days in [a, b] (inclusive) whose weekday is not in `weekend` (0 = Sunday ... 6 = Saturday) and not in `holidays` (Set of day numbers)
export function countWorkdays(a, b, weekend = [5, 6], holidays = new Set()) {
  if (b < a) [a, b] = [b, a];
  const off = new Set(weekend);
  let work = 0, wkd = 0, hol = 0;
  for (let n = a; n <= b; n++) {
    if (off.has(weekday(n))) wkd++;
    else if (holidays.has(n)) hol++;
    else work++;
  }
  return { work, weekendDays: wkd, holidays: hol, total: b - a + 1 };
}

// Years / months / days from a to b (a <= b) using "whole months": the largest k such that a + k months <= b,
// where adding months clips to the month end (31 Jan + 1 month = 28/29 Feb). Remaining days are counted exactly.
function diffByMonths(a, b, from, to, add) {
  let k = (to.y - from.y) * 12 + (to.m - from.m);
  let base = add(a, { m: k });
  if (base == null || base > b) { k -= 1; base = add(a, { m: k }); }
  if (base == null) return null;
  return { y: Math.floor(k / 12), m: k % 12, d: b - base };
}
export function gregDiff(a, b) { return diffByMonths(a, b, fromDayNum(a), fromDayNum(b), addGreg); }
export function hijriDiff(a, b) {
  const ha = hijriFromDayNum(a), hb = hijriFromDayNum(b);
  if (!ha || !hb) return null;
  return diffByMonths(a, b, ha, hb, (n, o) => (o.m === 0 ? n : addHijri(n, o)));
}

// Next anniversary (>= fromN) of a Gregorian birth date; 29 Feb falls on 28 Feb in common years
export function nextGregAnniversary(birthN, fromN) {
  const b = fromDayNum(birthN), f = fromDayNum(fromN);
  for (let y = f.y; y <= f.y + 1; y++) {
    const d = Math.min(b.d, gregMonthLength(y, b.m));
    const n = dayNum(y, b.m, d);
    if (n >= fromN) return n;
  }
  return null;
}
// Next occurrence (today included) of a fixed Gregorian month/day, e.g. 23 Sep
export function nextGregOccurrence(fromN, m, d) {
  const f = fromDayNum(fromN);
  for (let y = f.y; y <= f.y + 1; y++) {
    const n = dayNum(y, m, Math.min(d, gregMonthLength(y, m)));
    if (n >= fromN) return n;
  }
  return null;
}
// Next anniversary of a Hijri birth date; day 30 falls on the 29th in 29-day months
export function nextHijriAnniversary(birthN, fromN) {
  const b = hijriFromDayNum(birthN), f = hijriFromDayNum(fromN);
  if (!b || !f) return null;
  for (let y = f.y; y <= f.y + 1 && y <= MAX_HY; y++) {
    const n = dayNumFromHijri(y, b.m, Math.min(b.d, hijriMonthLength(y, b.m)));
    if (n != null && n >= fromN) return n;
  }
  return null;
}

// Parse "YYYY-MM-DD" (Gregorian) into a day number, or null
export function parseISO(s) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return isValidGreg(y, mo, d) ? dayNum(y, mo, d) : null;
}
export const toISO = (n) => { const g = fromDayNum(n); return `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`; };
