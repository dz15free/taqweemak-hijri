// Officially published dates, entered by hand from the cited sources. Anything not listed here is computed
// and must be shown as "expected / تقديري", never as official.
import { dayNum } from './hijri.js';

// Ministry of Finance — "موعد صرف الرواتب لعام 2026م" (mof.gov.sa/mediacenter/Payroll/Pages/2026.aspx).
// Only the months we could read on the official page are listed (checked 2026-11-11).
export const MOF_PAYDAYS = {
  '2026-08': dayNum(2026, 8, 27),
  '2026-09': dayNum(2026, 9, 27),
  '2026-10': dayNum(2026, 10, 27),
  '2026-11': dayNum(2026, 11, 26),
  '2026-12': dayNum(2026, 12, 27),
};
export const MOF_CHECKED = '2026-11-11';
