// 파트2-A: 날씨 게임플레이 반영
// Auto-extracted from taleforge.html (original section banner preserved above).
import { loadAtmosphere } from '../misc/001-block0-preamble.js';
import { toast } from '../utils.js';

export function getWeatherGameEffect(){
  const atm = loadAtmosphere();
  const weather = atm?.weather || 'none';
  const time    = atm?.timeOfDay || 'none';
  const effects = { statBonus:{}, statPenalty:{}, desc:'' };

  // 날씨별 효과
  const weatherFx = {
    rain:     { penalty:{agi:5,rng:8,per:5}, bonus:{}, desc:'비로 인해 이동과 사격이 어렵다' },
    storm:    { penalty:{agi:10,rng:15,per:10,str:5}, bonus:{end:5}, desc:'폭풍이 모든 행동을 방해한다' },
    snow:     { penalty:{agi:8,rng:10}, bonus:{end:8}, desc:'눈이 발을 붙잡는다' },
    fog:      { penalty:{per:15,rng:12}, bonus:{disg:10}, desc:'안개 속에서 시야가 막힌다' },
    scorching:{ penalty:{end:8,agi:5}, bonus:{str:5}, desc:'폭염이 체력을 소모시킨다' },
    clear:    { penalty:{}, bonus:{per:3,luk:2}, desc:'맑은 날씨가 기분을 상쾌하게 한다' },
  };

  // 시간대별 효과
  const timeFx = {
    midnight: { penalty:{per:8}, bonus:{disg:12,mgc:5}, desc:'자정의 어둠 속' },
    dawn:     { bonus:{luk:5,fath:3}, desc:'새벽의 고요함 속' },
    night:    { penalty:{per:5}, bonus:{disg:8,mgc:3}, desc:'밤의 어둠 속' },
    midday:   { bonus:{str:3,per:5}, desc:'한낮의 태양 아래' },
  };

  const wfx = weatherFx[weather] || {};
  const tfx = timeFx[time] || {};

  Object.entries(wfx.penalty||{}).forEach(([k,v])=>{ effects.statPenalty[k]=(effects.statPenalty[k]||0)+v; });
  Object.entries(wfx.bonus||{}).forEach(([k,v])=>{ effects.statBonus[k]=(effects.statBonus[k]||0)+v; });
  Object.entries(tfx.penalty||{}).forEach(([k,v])=>{ effects.statPenalty[k]=(effects.statPenalty[k]||0)+v; });
  Object.entries(tfx.bonus||{}).forEach(([k,v])=>{ effects.statBonus[k]=(effects.statBonus[k]||0)+v; });
  effects.desc = [wfx.desc,tfx.desc].filter(Boolean).join('. ');

  return effects;
}
window.getWeatherGameEffect = getWeatherGameEffect;

export function getWeatherStatModifier(statKey){
  const fx = getWeatherGameEffect();
  return (fx.statBonus[statKey]||0) - (fx.statPenalty[statKey]||0);
}
window.getWeatherStatModifier = getWeatherStatModifier;

export function notifyWeatherChange(newWeather){
  const weatherMsg = {
    rain:'🌧️ 비가 내리기 시작했다. 이동과 사격이 어려워진다.',
    storm:'⛈️ 폭풍이 몰아친다! 대부분의 행동이 어려워진다.',
    snow:'❄️ 눈이 내린다. 이동이 느려지지만 인내력이 강해진다.',
    fog:'🌫️ 짙은 안개가 깔렸다. 시야가 막히지만 은신이 쉬워진다.',
    scorching:'☀️ 폭염이 시작됐다. 체력 소모가 빨라진다.',
    clear:'🌤️ 날씨가 맑아졌다. 기분이 상쾌해진다.',
  };
  if(weatherMsg[newWeather]) toast(weatherMsg[newWeather], 3000);
}
window.notifyWeatherChange = notifyWeatherChange;
