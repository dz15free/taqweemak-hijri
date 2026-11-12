# taqweemak-hijri

The date engine behind [تقويمك — taqweemak.com](https://taqweemak.com): Umm al-Qura Hijri ↔ Gregorian conversion, Saudi monthly payment dates, and prayer-time methods for Saudi Arabia, the UAE, Kuwait and Qatar, each checked against published official tables.

محرك التواريخ الذي يعمل عليه موقع [تقويمك](https://taqweemak.com): تحويل التاريخ بين الهجري (أم القرى) والميلادي، ومواعيد الصرف الشهرية في السعودية، وطرق حساب مواقيت الصلاة في السعودية والإمارات والكويت وقطر، وكل ذلك مختبر مقابل جداول رسمية منشورة.

[![test](https://github.com/dz15free/taqweemak-hijri/actions/workflows/test.yml/badge.svg)](https://github.com/dz15free/taqweemak-hijri/actions/workflows/test.yml)

## Install

```sh
npm install github:dz15free/taqweemak-hijri
```

Node 18+ or any modern browser. Hijri dates use the runtime's built-in `Intl` Umm al-Qura calendar (`islamic-umalqura`), so there are no lookup tables to ship. Prayer times use [adhan](https://github.com/batoulapps/adhan-js) (MIT).

## Usage

```js
import {
  todayRiyadh, describe, dayNum, toISO,
  hijriFromDayNum, dayNumFromHijri,
  nextPay, saudiPayday,
  prayerTimes, hhmm, cityBySlug,
} from 'taqweemak-hijri';

// Today in Riyadh (midnight boundary at UTC+3, whatever the machine's time zone)
const today = todayRiyadh();
describe(today).hText;            // "2 جمادى الآخرة 1448 هـ"

// Hijri ↔ Gregorian (day numbers = days since 1970-01-01 UTC)
toISO(dayNumFromHijri(1448, 9, 1)); // "2027-02-08" (1 Ramadan 1448, Umm al-Qura)
hijriFromDayNum(dayNum(2026, 11, 12)); // { y: 1448, m: 6, d: 2 }

// Saudi payment dates
toISO(nextPay('citizen', today));  // Citizen Account: the 10th, Fri → Thu 9, Sat → Sun 11
toISO(saudiPayday(2026, 11));      // government salaries: the 27th, Fri → 26th, Sat → 28th
// ids: 'salary', 'citizen', 'social' (Developed Social Security), 'pension' (GOSI)

// Prayer times (minutes after local midnight)
const dubai = cityBySlug('dubai');
const t = prayerTimes(dubai.lat, dubai.lng, dayNum(2026, 2, 18), { method: 'uae', ramadan: true });
hhmm(t.maghrib);                   // "18:18"
```

### Prayer-time methods

| key | where | rule | checked against |
|---|---|---|---|
| `ksa` | Saudi Arabia | Umm al-Qura: Fajr 18.5°, Isha 90 min after Maghrib (120 min in Ramadan, per the Ministry of Islamic Affairs) | Umm al-Qura times for Riyadh, Madinah, Dammam, Tabuk |
| `uae` | UAE | Fajr and Isha 18.2°, with the minute offsets of the official Ramadan timetable | Dubai, Ramadan 2026, two dates |
| `kuwait` | Kuwait | Fajr 18°, Isha 17.5° | Kuwait City, Ramadan 2026, two dates |
| `qatar` | Qatar | Fajr 18°, Isha 90 min after Maghrib, with the timetable's minute offsets | Doha, Ramadan 2026, two dates |

Every check is in `test/verify.mjs` with a tolerance of one minute. Bahrain and Oman are not included yet: we have not found an official timetable to verify against.

## What the results mean

- **Umm al-Qura is a calculated calendar.** The start of Ramadan and the Eids is announced officially after the moon sighting and can differ by a day. Show such dates as estimates.
- **Payment dates are computed from each programme's published rule.** Government salaries come from the Ministry of Finance table where it is published (`MOF_PAYDAYS`); other months are the rule's expectation. The Citizen Account programme is officially extended to the end of 2026.
- Supported range: 1 Muharram 1356 to 30 Dhu al-Hijjah 1500 (14 March 1937 to 16 November 2077).

## Tests

```sh
npm test
```

114 checks: published Ministry of Finance salary dates, Umm al-Qura month boundaries, a full round trip over the supported range, Saudi payment rules, Riyadh midnight, Arabic plurals, and prayer times against official tables.

## Used by

- [taqweemak.com](https://taqweemak.com): [التاريخ الهجري اليوم](https://taqweemak.com/)، [تحويل التاريخ](https://taqweemak.com/date-converter/)، [مواعيد الصرف](https://taqweemak.com/payment-dates/)، [امساكية رمضان](https://taqweemak.com/ramadan-imsakiya/).

Using it somewhere? Open an issue and we will list it.

## License

MIT © رؤوف سعد — [taqweemak.com](https://taqweemak.com)
