// [NEW] 날씨/계절 판정 연동 시스템
// Auto-extracted from taleforge.html (original section banner preserved above).
import { TIME_EFFECTS, WEATHER_EFFECTS } from '../data/032-NEW-날씨계절-판정-연동-시스템.js';
import { loadAtmosphere } from '../misc/001-block0-preamble.js';

export const getWeatherStatMods = () => {
  const atm = loadAtmosphere();
  const w = WEATHER_EFFECTS[atm.weather] || WEATHER_EFFECTS.none;
  const t = TIME_EFFECTS[atm.timeOfDay] || TIME_EFFECTS.none;
  const combined = {};
  [...Object.entries(w.bonuses), ...Object.entries(t.bonuses)].forEach(([k,v]) => combined[k] = (combined[k]||0)+v);
  [...Object.entries(w.penalties), ...Object.entries(t.penalties)].forEach(([k,v]) => combined[k] = (combined[k]||0)+v);
  return { weather:w, time:t, combined };
};
