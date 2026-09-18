// 음유시인 — 공연 / 후원자 / 전설곡
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { PATRON_CANDIDATES, SONG_GENRES } from '../data/254-음유시인-공연-후원자-전설곡.js';
import { renderNetworkPanel } from '../economy/255-상인-거래소-교역-지부-확장.js';
import { saveGold } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { toast } from '../utils.js';
import { updateReputation } from './054-이동수단-시스템.js';
import { loadNetwork, saveNetwork } from './253-SVG-타일-렌더링-작물-단계별-애니메이션.js';

export function performSong(genreId){
  const net = loadNetwork(); if(!net || net.type!=='bard') return;
  const genre = SONG_GENRES.find(g=>g.id===genreId); if(!genre) return;
  const cha = (S.stats&&S.stats.cha)||50;
  const success = Math.random() < Math.min(0.95, 0.55+(cha-50)/200);
  if(success){
    const gold = genre.baseGold[0]+Math.floor(Math.random()*(genre.baseGold[1]-genre.baseGold[0]+1));
    const fameGain = genre.baseFame + Math.floor(net.patrons.length/2);
    net.fame = (net.fame||0)+fameGain;
    net.totalEarned = (net.totalEarned||0)+gold;
    S.gold += gold; if(typeof saveGold==='function') saveGold(S.gold); window.updateHeader&&window.updateHeader();
    if(typeof window.updateStats==='function') window.updateStats('bard_performances', 1);
    toast(`${genre.name} 공연 성공! +${gold}G, 명성+${fameGain}`, 3500, genre);
    S._pendingNetworkHint = `${genre.name} 공연이 큰 호응을 얻었다. 청중들이 박수를 보냈다.`;
  } else {
    toast(`${genre.name} 공연이 시큰둥한 반응을 얻었다...`, 3000, genre);
    S._pendingNetworkHint = `${genre.name} 공연이 별다른 반응을 얻지 못했다.`;
  }
  saveNetwork(net);
  renderNetworkPanel();
}
window.performSong = performSong;

export function seekPatron(){
  const net = loadNetwork(); if(!net || net.type!=='bard') return;
  if((net.fame||0) < 30+net.patrons.length*40){ toast(`🎭 명성이 부족합니다. (필요 ${30+net.patrons.length*40}, 현재 ${net.fame||0})`); return; }
  if(net.patrons.length>=4){ toast('더 이상 후원자를 받을 수 없습니다.'); return; }
  const patron = PATRON_CANDIDATES[Math.floor(Math.random()*PATRON_CANDIDATES.length)];
  net.patrons.push({ name:patron, income: 15+net.patrons.length*8, joinedAt:S.msgCount||0 });
  saveNetwork(net);
  toast(`🎩 ${patron}이(가) 후원자가 되었습니다! 매 턴 정기 후원금을 받습니다.`, 4000);
  S._pendingNetworkHint = `${patron}이(가) 주인공의 재능을 알아보고 후원을 약속했다.`;
  renderNetworkPanel();
}
window.seekPatron = seekPatron;

export function composeLegendarySong(){
  const net = loadNetwork(); if(!net || net.type!=='bard') return;
  if((net.fame||0) < 200){ toast('🎼 명성 200 이상이어야 전설적인 곡을 작곡할 수 있습니다.'); return; }
  if(net.legendarySongs.length>=3){ toast('이미 충분히 많은 전설곡을 남겼습니다.'); return; }
  const songNames = ['잊혀진 왕의 발라드','천 개의 별빛 서사시','마지막 여행자의 노래'];
  const name = songNames[net.legendarySongs.length]||'이름 없는 명곡';
  net.legendarySongs.push({ name, composedAt:S.msgCount||0 });
  net.fame -= 100;
  if(S.stats){ S.stats.cha = Math.min(999,(S.stats.cha||50)+8); }
  saveNetwork(net);
  if(typeof updateReputation==='function') updateReputation(20);
  toast(`🎼 「${name}」을(를) 작곡했습니다! 영구히 CHA+8, 평판+20`, 5000);
  S._pendingNetworkHint = `주인공이 「${name}」이라는 전설적인 곡을 완성했다. 이 노래는 대륙 곳곳에서 불리게 될 것이다.`;
  renderNetworkPanel();
}
window.composeLegendarySong = composeLegendarySong;
