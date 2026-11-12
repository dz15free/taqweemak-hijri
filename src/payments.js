// Saudi monthly payment dates, each from its published rule (sources on each page).
// Day numbers come from hijri.js; weekday(): 5 = Friday, 6 = Saturday.
import { dayNum, weekday, fromDayNum, saudiPayday, dayNumFromHijri, hijriFromDayNum } from './hijri.js';

// Citizen Account: the 10th of each Gregorian month; Friday → Thursday 9th, Saturday → Sunday 11th.
export function citizenAccountDate(y, m) {
  const n = dayNum(y, m, 10);
  const wd = weekday(n);
  return wd === 5 ? n - 1 : wd === 6 ? n + 1 : n;
}
// Developed Social Security (HRSD): paid on the 1st, eligibility results on the 27th of the month before.
export const socialSecurityDate = (y, m) => dayNum(y, m, 1);
export const socialSecurityEligibility = (y, m) => (m === 1 ? dayNum(y - 1, 12, 27) : dayNum(y, m - 1, 27));
// GOSI pensions (civil, military and social insurance): the 1st of each Gregorian month since May 2024.
export const pensionDate = (y, m) => dayNum(y, m, 1);

export const PAY = {
  salary: { id: 'salary', name: 'رواتب موظفي الدولة', short: 'الراتب', path: '/salary-countdown/', date: saudiPayday },
  citizen: { id: 'citizen', name: 'دعم حساب المواطن', short: 'حساب المواطن', path: '/citizen-account-countdown/', date: citizenAccountDate },
  social: { id: 'social', name: 'معاش الضمان الاجتماعي المطور', short: 'الضمان المطور', path: '/social-security-countdown/', date: socialSecurityDate },
  pension: { id: 'pension', name: 'معاشات المتقاعدين (التأمينات)', short: 'التقاعد', path: '/pension-countdown/', date: pensionDate },
};

// Next payment on or after fromN for a payment id.
export function nextPay(id, fromN) {
  const g = fromDayNum(fromN);
  let y = g.y, m = g.m;
  for (let i = 0; i < 3; i++) {
    const n = PAY[id].date(y, m);
    if (n >= fromN) return n;
    m++; if (m > 12) { m = 1; y++; }
  }
  return null;
}

// Payment months starting with the month of fromN: [{ y, m, n }]
export function payMonths(id, fromN, count) {
  const g = fromDayNum(fromN);
  let y = g.y, m = g.m;
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({ y, m, n: PAY[id].date(y, m) });
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

// Is day n inside the estimated Eid holiday window (Umm al-Qura)? Returns the Eid name or null.
// Window (deliberately wide, since the moon can shift Eid by a day): two days before 1 Shawwal to 4 Shawwal,
// and 9–13 Dhu al-Hijjah. Official holidays are announced each year.
export function eidWindow(n) {
  const h = hijriFromDayNum(n);
  if (!h) return null;
  const fitr = dayNumFromHijri(h.y, 10, 1), adha = dayNumFromHijri(h.y, 12, 10);
  if (n >= fitr - 2 && n <= fitr + 3) return 'عيد الفطر';
  if (n >= adha - 1 && n <= adha + 3) return 'عيد الأضحى';
  return null;
}
