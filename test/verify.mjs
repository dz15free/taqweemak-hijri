// Accuracy tests. Run: npm test
// Reference values come from published sources (Ministry of Finance salary tables, Umm al-Qura month tables,
// HRSD / Citizen Account announcements, official Ramadan timetables). Prayer-time tolerance: 1 minute.
import * as H from '../src/hijri.js';
import { MOF_PAYDAYS } from '../src/official.js';
let fail = 0, pass = 0;
const eq = (label, a, b) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  ok ? pass++ : fail++;
  if (!ok || process.env.VERBOSE) console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}: ${JSON.stringify(a)}${ok ? '' : ' expected ' + JSON.stringify(b)}`);
};
const g2h = (y, m, d) => { const h = H.hijriFromDayNum(H.dayNum(y, m, d)); return `${h.d}/${h.m}/${h.y}`; };
const h2g = (y, m, d) => { const n = H.dayNumFromHijri(y, m, d); return n == null ? null : H.toISO(n); };

// 1) Reference points from published sources
//    MOF 2026 salary table (Gregorian date with its Hijri equivalent)
eq('MOF 27/08/2026 = 14/03/1448', g2h(2026, 8, 27), '14/3/1448');
eq('MOF 27/09/2026 = 16/04/1448', g2h(2026, 9, 27), '16/4/1448');
eq('MOF 27/10/2026 = 16/05/1448', g2h(2026, 10, 27), '16/5/1448');
eq('MOF 26/11/2026 = 16/06/1448', g2h(2026, 11, 26), '16/6/1448');
eq('MOF 27/12/2026 = 18/07/1448', g2h(2026, 12, 27), '18/7/1448');
//    Month boundaries (Umm al-Qura month tables)
eq('1 Rabi II 1448 = 2026-09-12', h2g(1448, 4, 1), '2026-09-12');
eq('1 Jumada II 1448 = 2026-11-11', h2g(1448, 6, 1), '2026-11-11');
eq('Jumada II 1448 ends 2026-12-09', h2g(1448, 6, H.hijriMonthLength(1448, 6)), '2026-12-09');
eq('1 Rabi II 1449 = 2027-09-02', h2g(1449, 4, 1), '2027-09-02');
eq('1 Jumada II 1449 = 2027-10-31', h2g(1449, 6, 1), '2027-10-31');
eq('1 Ramadan 1447 = 2026-02-18', h2g(1447, 9, 1), '2026-02-18');
eq('1 Muharram 1356 = 1937-03-14', h2g(1356, 1, 1), '1937-03-14');
eq('Range end 30/12/1500 = 2077-11-16', h2g(1500, 12, 30), '2077-11-16');

// 2) Exhaustive round trip and month-length sanity over the full supported range
let rt = 0, days = 0;
for (let n = H.MIN_DAY; n <= H.MAX_DAY; n++, days++) {
  const h = H.hijriFromDayNum(n);
  if (H.dayNumFromHijri(h.y, h.m, h.d) !== n) rt++;
}
eq(`round trip on ${days} days (1937–2077)`, rt, 0);
let bad = 0, yBad = 0;
for (let y = H.MIN_HY; y <= H.MAX_HY; y++) {
  for (let m = 1; m <= 12; m++) {
    const L = H.hijriMonthLength(y, m);
    if (L !== 29 && L !== 30) bad++;
    if (L === 29 && H.dayNumFromHijri(y, m, 30) !== null) bad++;
  }
  const YL = H.hijriYearLength(y);
  if (YL < 354 || YL > 355) yBad++;
}
eq('every Hijri month is 29/30 days and day 30 rejected in 29-day months', bad, 0);
eq('every Hijri year is 354/355 days', yBad, 0);
// Consecutive days: Hijri date always advances by exactly one day (no gaps/duplicates across months/years)
let jumps = 0;
for (let n = H.MIN_DAY + 1; n <= H.MAX_DAY; n++) {
  const a = H.hijriFromDayNum(n - 1), b = H.hijriFromDayNum(n);
  const ok = (b.d === a.d + 1 && b.m === a.m && b.y === a.y) || (b.d === 1 && ((b.m === a.m + 1 && b.y === a.y) || (a.m === 12 && b.m === 1 && b.y === a.y + 1)));
  if (!ok) jumps++;
}
eq('Hijri date advances by one day every day', jumps, 0);
eq('out of range returns null', [H.hijriFromDayNum(H.MIN_DAY - 1), H.dayNumFromHijri(1355, 12, 1), H.dayNumFromHijri(1448, 13, 1)], [null, null, null]);

// 3) Gregorian leap years and arithmetic
eq('leap years 1900/2000/2024/2026', [1900, 2000, 2024, 2026].map(H.isLeap), [false, true, true, false]);
eq('29 Feb 2025 invalid', H.isValidGreg(2025, 2, 29), false);
eq('31 Jan 2024 + 1 month = 29 Feb', H.toISO(H.addGreg(H.dayNum(2024, 1, 31), { m: 1 })), '2024-02-29');
eq('29 Feb 2024 + 1 year = 28 Feb 2025', H.toISO(H.addGreg(H.dayNum(2024, 2, 29), { y: 1 })), '2025-02-28');
eq('1 Jan 2026 − 1 day = 31 Dec 2025', H.toISO(H.addGreg(H.dayNum(2026, 1, 1), { d: -1 })), '2025-12-31');
eq('day 30 + 1 Hijri month clips to a 29-day month end', (() => {
  for (let y = 1440; y < 1460; y++) for (let m = 1; m < 12; m++) {
    if (H.hijriMonthLength(y, m) === 30 && H.hijriMonthLength(y, m + 1) === 29) {
      const r = H.hijriFromDayNum(H.addHijri(H.dayNumFromHijri(y, m, 30), { m: 1 }));
      return r.m === m + 1 && r.d === 29;
    }
  }
  return 'no case';
})(), true);
eq('1 Jumada II 1448 + 3 Hijri months = 1 Ramadan 1448', H.addHijri(H.dayNumFromHijri(1448, 6, 1), { m: 3 }), H.dayNumFromHijri(1448, 9, 1));
eq('weekday 2026-11-11 is Wednesday', H.WEEKDAYS[H.weekday(H.dayNum(2026, 11, 11))], 'الأربعاء');

// 4) Age / differences
eq('age 2024-01-31 → 2024-02-29 = 0y 0m 29d? (whole month reached on 29 Feb)', H.gregDiff(H.dayNum(2024, 1, 31), H.dayNum(2024, 2, 29)), { y: 0, m: 1, d: 0 });
eq('age 2026-03-31 → 2026-04-30 = 1 month (clipped)', H.gregDiff(H.dayNum(2026, 3, 31), H.dayNum(2026, 4, 30)), { y: 0, m: 1, d: 0 });
eq('same day = 0', H.gregDiff(H.dayNum(2026, 5, 5), H.dayNum(2026, 5, 5)), { y: 0, m: 0, d: 0 });
eq('age 2000-01-01 → 2026-01-01 = 26y', H.gregDiff(H.dayNum(2000, 1, 1), H.dayNum(2026, 1, 1)), { y: 26, m: 0, d: 0 });
eq('age 1995-08-20 → 2026-11-11 = 31y 2m 22d', H.gregDiff(H.dayNum(1995, 8, 20), H.dayNum(2026, 11, 11)), { y: 31, m: 2, d: 22 });
eq('age with Feb borrow 2024-01-31 → 2024-03-01', H.gregDiff(H.dayNum(2024, 1, 31), H.dayNum(2024, 3, 1)), { y: 0, m: 1, d: 1 });
eq('Hijri age 1 Muharram 1447 → 1 Muharram 1448 = 1y', H.hijriDiff(H.dayNumFromHijri(1447, 1, 1), H.dayNumFromHijri(1448, 1, 1)), { y: 1, m: 0, d: 0 });
eq('next anniversary of 29 Feb in 2027 = 28 Feb', H.toISO(H.nextGregAnniversary(H.dayNum(2000, 2, 29), H.dayNum(2027, 1, 1))), '2027-02-28');
eq('days in 2026', H.dayNum(2027, 1, 1) - H.dayNum(2026, 1, 1), 365);
eq('days in 2024', H.dayNum(2025, 1, 1) - H.dayNum(2024, 1, 1), 366);

// 5) Working days
eq('Nov 2026 workdays (Fri+Sat off; 1 Nov is a Sunday)', H.countWorkdays(H.dayNum(2026, 11, 1), H.dayNum(2026, 11, 30), [5, 6]).work, 22);
eq('holiday on a weekday is excluded once', H.countWorkdays(H.dayNum(2026, 11, 1), H.dayNum(2026, 11, 7), [5, 6], new Set([H.dayNum(2026, 11, 2), H.dayNum(2026, 11, 6)])), { work: 4, weekendDays: 2, holidays: 1, total: 7 });

// 6) Saudi government payday rule vs. every MOF date we hold
for (const [k, n] of Object.entries(MOF_PAYDAYS)) {
  const [y, m] = k.split('-').map(Number);
  eq(`payday rule matches MOF ${k}`, H.saudiPayday(y, m), n);
}
eq('payday Feb 2026 (27 = Fri → Thu 26)', H.toISO(H.saudiPayday(2026, 2)), '2026-02-26');
eq('payday Jun 2026 (27 = Sat → Sun 28)', H.toISO(H.saudiPayday(2026, 6)), '2026-06-28');
eq('payday rule vs MOF 2024 published table', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => H.fromDayNum(H.saudiPayday(2024, m)).d), [28, 27, 27, 28, 27, 27, 28, 27, 26, 27, 27, 26]);
eq('next payday from 2026-11-27 rolls to December', H.toISO(H.nextSaudiPayday(H.dayNum(2026, 11, 27))), '2026-12-27');

// 7) Riyadh midnight boundary (independent of the machine's time zone)
eq('20:59 UTC is still the same Riyadh day', H.toISO(H.todayRiyadh(new Date('2026-11-11T20:59:00Z'))), '2026-11-11');
eq('21:00 UTC is the next Riyadh day', H.toISO(H.todayRiyadh(new Date('2026-11-11T21:00:00Z'))), '2026-11-12');

// 8) Arabic plurals
eq('plurals', [1, 2, 3, 10, 11, 99, 100, 103, 111].map((n) => H.plural(n, H.DAYS_W)), ['يوم واحد', 'يومان', '3 أيام', '10 أيام', '11 يومًا', '99 يومًا', '100 يوم', '103 أيام', '111 يومًا']);

// 8b) Fixed Gregorian occasions (National Day 23 Sep, Founding Day 22 Feb)
eq('Founding Day after 2026-11-12', H.toISO(H.nextGregOccurrence(H.dayNum(2026, 11, 12), 2, 22)), '2027-02-22');
eq('National Day after 2026-11-12', H.toISO(H.nextGregOccurrence(H.dayNum(2026, 11, 12), 9, 23)), '2027-09-23');
eq('occasion day itself counts as today', H.toISO(H.nextGregOccurrence(H.dayNum(2027, 9, 23), 9, 23)), '2027-09-23');
eq('day after rolls to next year', H.toISO(H.nextGregOccurrence(H.dayNum(2027, 2, 23), 2, 22)), '2028-02-22');
eq('Founding Day 2027 = Monday 15 Ramadan 1448', [H.describe(H.dayNum(2027, 2, 22)).wd, H.describe(H.dayNum(2027, 2, 22)).hText], ['الاثنين', '15 رمضان 1448 هـ']);

// 8c) Saudi payment rules (dates published by the programs, see each page's sources)
const P = await import('../src/payments.js');
eq('Citizen Account Jan 2026 (10th = Sat) → Sun 11', H.toISO(P.citizenAccountDate(2026, 1)), '2026-01-11');
eq('Citizen Account Apr 2026 (10th = Fri) → Thu 9', H.toISO(P.citizenAccountDate(2026, 4)), '2026-04-09');
eq('Citizen Account Jul 2026 (10th = Fri) → Thu 9', H.toISO(P.citizenAccountDate(2026, 7)), '2026-07-09');
eq('Citizen Account Oct 2026 (10th = Sat) → Sun 11', H.toISO(P.citizenAccountDate(2026, 10)), '2026-10-11');
eq('Citizen Account Aug 2026 on Monday 10th', H.toISO(P.citizenAccountDate(2026, 8)), '2026-08-10');
eq('Citizen Account Nov 2026 on Tuesday 10th', H.toISO(P.citizenAccountDate(2026, 11)), '2026-11-10');
eq('next Citizen Account after 12 Nov 2026', H.toISO(P.nextPay('citizen', H.dayNum(2026, 11, 12))), '2026-12-10');
eq('social security eligibility for Jan 2027 = 27 Dec 2026', H.toISO(P.socialSecurityEligibility(2027, 1)), '2026-12-27');
eq('next pension after 12 Nov 2026', H.toISO(P.nextPay('pension', H.dayNum(2026, 11, 12))), '2026-12-01');
eq('salary via PAY matches Ministry of Finance (Nov 2026 = 26th)', H.toISO(P.nextPay('salary', H.dayNum(2026, 11, 1))), '2026-11-26');
eq('10 Mar 2027 flagged as Eid al-Fitr window', P.eidWindow(H.dayNum(2027, 3, 10)), 'عيد الفطر');
eq('1 Dec 2026 not in an Eid window', P.eidWindow(H.dayNum(2026, 12, 1)), null);

// 8d) Prayer times (Umm al-Qura method) against published Umm al-Qura times, tolerance 1 minute
const PR = await import('../src/prayer.js');
const { CITIES } = await import('../src/cities.js');
const CITY = Object.fromEntries(CITIES.map((c) => [c.slug, c]));
const near = (name, got, want) => eq(name, Math.abs(got - want) <= 1, true);
const at = (slug, y, m, d, ramadan) => PR.prayerTimes(CITY[slug].lat, CITY[slug].lng, H.dayNum(y, m, d), { ramadan, method: CITY[slug].method });
const hm = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
// 12 Ramadan 1442 (24 Apr 2021), Umm al-Qura times reported by almowaten.net
near('Riyadh maghrib 24 Apr 2021 = 18:20', at('riyadh', 2021, 4, 24, true).maghrib, hm('18:20'));
near('Riyadh isha in Ramadan = 20:20 (maghrib + 2h)', at('riyadh', 2021, 4, 24, true).isha, hm('20:20'));
near('Dammam maghrib 24 Apr 2021 = 18:08', at('dammam', 2021, 4, 24, true).maghrib, hm('18:08'));
near('Tabuk maghrib 24 Apr 2021 = 19:05', at('tabuk', 2021, 4, 24, true).maghrib, hm('19:05'));
near('Madinah isha 24 Apr 2021 = 20:48', at('madinah', 2021, 4, 24, true).isha, hm('20:48'));
// 1 Ramadan 1447 (18 Feb 2026), published imsakiya tables
near('Madinah fajr 18 Feb 2026 = 05:35', at('madinah', 2026, 2, 18, true).fajr, hm('05:35'));
near('Madinah maghrib 18 Feb 2026 = 18:18', at('madinah', 2026, 2, 18, true).maghrib, hm('18:18'));
near('Riyadh fajr 18 Feb 2026 = 05:06', at('riyadh', 2026, 2, 18, true).fajr, hm('05:06'));
near('Riyadh asr 18 Feb 2026 = 15:23', at('riyadh', 2026, 2, 18, true).asr, hm('15:23'));
eq('isha outside Ramadan = maghrib + 90', at('riyadh', 2026, 11, 12, false).isha - at('riyadh', 2026, 11, 12, false).maghrib, 90);

// Gulf: each city with its country's method, against published Ramadan 2026 tables (±1 min)
const all = (label, slug, y, m, d, list) => { const t = at(slug, y, m, d, true); ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach((k, i) => near(`${label} ${k}`, t[k], hm(list[i]))); };
all('Dubai 18 Feb 2026', 'dubai', 2026, 2, 18, ['05:34', '06:48', '12:36', '15:50', '18:18', '19:32']);
all('Dubai 19 Mar 2026', 'dubai', 2026, 3, 19, ['05:07', '06:20', '12:29', '15:54', '18:33', '19:47']);
all('Kuwait 18 Feb 2026', 'kuwait-city', 2026, 2, 18, ['05:05', '06:25', '12:02', '15:14', '17:39', '18:57']);
all('Kuwait 4 Mar 2026', 'kuwait-city', 2026, 3, 4, ['04:52', '06:10', '12:00', '15:20', '17:49', '19:06']);
all('Doha 18 Feb 2026', 'doha', 2026, 2, 18, ['04:49', '06:07', '11:49', '15:05', '17:32', '19:02']);
all('Doha 19 Feb 2026', 'doha', 2026, 2, 19, ['04:48', '06:06', '11:49', '15:05', '17:33', '19:03']);
eq('UAE times are UTC+4 (Dubai iftar after Riyadh clock)', at('dubai', 2026, 2, 18, true).maghrib > at('riyadh', 2026, 2, 18, true).maghrib, true);


console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
