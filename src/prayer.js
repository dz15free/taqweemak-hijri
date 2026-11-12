// Prayer times computed at build time with adhan (MIT), one method per country.
// Each method is checked in scripts/verify-hijri.mjs against published official timetables (tolerance 1 minute).
//   ksa:    Umm al-Qura — Fajr 18.5°, Isha 90 min after Maghrib, 120 min in Ramadan (Ministry of Islamic Affairs circular)
//   uae:    Fajr and Isha 18.2°, sunrise −3, Dhuhr +3, Asr +1, Maghrib +3 minutes (fits the Awqaf Ramadan 2026 table)
//   kuwait: Fajr 18°, Isha 17.5°
//   qatar:  Fajr 18°, Isha 90 min after Maghrib, with the minute offsets that fit the Awqaf Ramadan 2026 table
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { fromDayNum } from './hijri.js';

export const METHODS = {
  ksa: { tz: 3, params: (ramadan) => { const p = CalculationMethod.UmmAlQura(); if (ramadan) p.adjustments.isha = 30; return p; } },
  uae: { tz: 4, params: () => { const p = CalculationMethod.Dubai(); p.adjustments.asr = -2; return p; } },
  kuwait: { tz: 3, params: () => CalculationMethod.Kuwait() },
  qatar: { tz: 3, params: () => { const p = CalculationMethod.Qatar(); Object.assign(p.adjustments, { fajr: -1, dhuhr: 1, asr: 1, maghrib: 3, isha: 3 }); return p; } },
};

const toMin = (d, tz) => { const m = Math.round(d.getTime() / 60000 + tz * 60) % 1440; return (m + 1440) % 1440; };
export const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const h12 = (m) => { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return `${((h + 11) % 12) + 1}:${mm} ${h < 12 ? 'ص' : 'م'}`; };

// n = day number; returns minutes after local midnight for each time.
export function prayerTimes(lat, lng, n, { ramadan = false, method = 'ksa' } = {}) {
  const g = fromDayNum(n);
  const M = METHODS[method];
  const p = M.params(ramadan);
  p.madhab = Madhab.Shafi;
  const t = new PrayerTimes(new Coordinates(lat, lng), new Date(Date.UTC(g.y, g.m - 1, g.d, 12)), p);
  const o = {};
  for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) o[k] = toMin(t[k], M.tz);
  return o;
}
