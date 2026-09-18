// 파트1-B: 랜덤 이벤트 시스템 — data
// Pure data split out of misc/072-파트1-B-랜덤-이벤트-시스템.js (see generate.js).
import { generateItem } from '../items/006-세트-아이템-시스템.js';
import { saveGold, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { addExp } from '../misc/009-레벨업-스탯-포인트-배분-시스템.js';
import { updateReputation } from '../misc/054-이동수단-시스템.js';
import { loadWorldState, saveWorldState } from '../misc/066-②-선택-결과-추적-시스템.js';
import { updateFactionRep } from '../npc/067-③-NPC-관계망-시스템.js';
import { applyStatusEffect } from '../ui/155-⑭-메모리-패널-UI.js';
import { toast } from '../utils.js';
import { S } from './084-TaleForge-순수-JS-엔진.js';

export const RANDOM_EVENTS = {
  common: [
    { id:'re_merchant', chance:0.08, minTurn:5,
      title:'수상한 행상인',
      desc:'낯선 행상인이 나타나 희귀한 물건을 내밀었다.',
      choices:['물건을 구매한다', '정중히 거절한다', '그를 의심한다'],
      effects:{
        '물건을 구매한다': ()=>{ if(S.gold>=50){ S.gold-=50; saveGold(S.gold); const item=generateItem(null,'rare'); if(item){ S.inventory.push(item); saveInventory(S.inventory); toastHTML(`🎁 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 획득!`,2500); } } else toast('골드가 부족하다'); },
        '정중히 거절한다': ()=>{ toast('행상인이 실망한 표정으로 떠났다', 2000); },
        '그를 의심한다': ()=>{ if(Math.random()<0.4){ updateReputation(5); toast('🔍 그는 실제로 수상한 자였다! 평판+5',2500); } else toast('그는 평범한 행상인이었다',2000); },
      }},
    { id:'re_beggar', chance:0.06, minTurn:3,
      title:'거리의 노인',
      desc:'굶주린 노인이 도움을 요청한다.',
      choices:['음식을 나눠준다', '골드를 준다(20)', '못 본 척 지나간다'],
      effects:{
        '음식을 나눠준다': ()=>{ updateFactionRep('교회',3); updateReputation(8); toast('👴 노인이 고마워한다. 평판+8',2000); },
        '골드를 준다(20)': ()=>{ if(S.gold>=20){ S.gold-=20; saveGold(S.gold); updateReputation(12); updateFactionRep('교회',5); toast('💰 선행. 평판+12',2000); } else toast('골드가 부족하다'); },
        '못 본 척 지나간다': ()=>{ const ws=loadWorldState(); ws.evilActs=(ws.evilActs||0)+1; saveWorldState(ws); toast('😔 양심이 찔린다',1500); },
      }},
    { id:'re_ambush', chance:0.07, minTurn:8,
      title:'매복 습격',
      desc:'어둠 속에서 강도떼가 나타났다!',
      choices:['맞서 싸운다', '도망친다', '협상을 시도한다'],
      effects:{
        '맞서 싸운다': ()=>{ if(Math.random()<0.6){ S.gold+=30; saveGold(S.gold); toast('⚔️ 격퇴! 골드+30',2500); } else { S.stats.hp=Math.max(1,(S.stats.hp||100)-20); window.updateHeader(); if(Math.random()<0.4){ applyStatusEffect('poison'); toast('💀 부상을 입었다! HP-20 + 중독',2500); } else { toast('💀 부상을 입었다! HP-20',2500); } } },
        '도망친다': ()=>{ if((S.stats.agi||50)>50){ toast('💨 탈출 성공!',2000); } else { S.gold=Math.max(0,S.gold-20); saveGold(S.gold); toast('💸 도망치다 골드를 잃었다! -20',2500); } },
        '협상을 시도한다': ()=>{ if((S.stats.neg||50)>60||Math.random()<0.3){ toast('🤝 협상 성공! 무사히 통과',2000); } else { S.gold=Math.max(0,S.gold-30); saveGold(S.gold); toast('❌ 협상 실패! 골드-30',2500); } },
      }},
    { id:'re_treasure', chance:0.05, minTurn:10,
      title:'숨겨진 보물',
      desc:'우연히 낡은 상자를 발견했다.',
      choices:['조심스럽게 연다', '그냥 힘으로 부순다', '무시하고 지나간다'],
      effects:{
        '조심스럽게 연다': ()=>{ if(Math.random()<0.7){ const item=generateItem(null,'rare'); if(item){ S.inventory.push(item); saveInventory(S.inventory); toastHTML(`💎 ${typeof getEntityIconHTML==='function'?getEntityIconHTML(item,{size:14}):(item.icon)} ${esc(item.name)} 발견!`,2500); } } else { if(Math.random()<0.5){ applyStatusEffect('curse'); toast('⚠️ 저주가 걸린 상자였다!',2500); } else { toast('⚠️ 상자가 비어있었다.',2000); } } },
        '그냥 힘으로 부순다': ()=>{ const gold=Math.floor(Math.random()*50)+10; S.gold+=gold; saveGold(S.gold); toast(`💰 골드 +${gold}`,2000); },
        '무시하고 지나간다': ()=>toast('계속 길을 간다',1000),
      }},
    { id:'re_traveler', chance:0.07, minTurn:5,
      title:'동료 여행자',
      desc:'혼자 여행 중인 모험가를 만났다.',
      choices:['함께 동행하자고 한다', '정보를 교환한다', '그냥 인사만 한다'],
      effects:{
        '함께 동행하자고 한다': ()=>{ toast('🧭 새로운 동료와 함께 길을 나선다',2000); updateReputation(5); },
        '정보를 교환한다': ()=>{ window.updateStats('totalExp',30); toast('📜 유용한 정보를 얻었다. EXP+30',2000); },
        '그냥 인사만 한다': ()=>toast('☺️ 서로 미소를 나누고 각자의 길로',1500),
      }},
    { id:'re_chance_opening', chance:0.10, minTurn:1, scene:'tense',
      title:'한순간의 빈틈',
      desc:'상대의 시선이 흐트러진 틈, 단 한 번의 기회가 보인다.',
      choices:['그 틈을 놓치지 않고 움직인다', '섣불리 움직이지 않고 버틴다'],
      effects:{
        '그 틈을 놓치지 않고 움직인다': ()=>{ if(Math.random()<0.5){ S.stats.agi=Math.min(999,(S.stats.agi||0)+5); window.updateHeader(); toast('⚡ 빈틈을 파고들었다! AGI+5',2200); } else { S.stats.hp=Math.max(1,(S.stats.hp||100)-10); window.updateHeader(); toast('⚠️ 움직임을 들켜 반격당했다. HP-10',2200); } },
        '섣불리 움직이지 않고 버틴다': ()=>toast('😶 숨을 죽이고 기회를 기다린다',1500),
      }},
    { id:'re_fellow_captive', chance:0.06, minTurn:1, scene:'tense',
      title:'곁에 묶인 동료',
      desc:'함께 붙잡힌 누군가가 작게 속삭여온다.',
      choices:['함께 탈출을 모의한다', '경계하며 거리를 둔다'],
      effects:{
        '함께 탈출을 모의한다': ()=>{ updateReputation(3); toast('🤝 작은 동맹이 생겼다',2000); },
        '경계하며 거리를 둔다': ()=>toast('...섣부른 신뢰는 위험하다',1500),
      }},
    { id:'re_shrine_found', chance:0.05, minTurn:15,
      title:'신비로운 제단',
      desc:'숲 속 깊은 곳에서 고대 제단을 발견했다.',
      choices:['제물을 바친다(골드 30)', '기도를 올린다', '탐구한다'],
      effects:{
        '제물을 바친다(골드 30)': ()=>{ if(S.gold>=30){ S.gold-=30; saveGold(S.gold); const stats=['str','agi','mgc','int','luk']; const k=stats[Math.floor(Math.random()*stats.length)]; S.stats[k]=Math.min(999,(S.stats[k]||0)+15); window.updateHeader(); toast(`✨ 신의 축복! ${k.toUpperCase()}+15`,2500); } else toast('골드가 부족하다'); },
        '기도를 올린다': ()=>{ applyStatusEffect('blessed'); S.stats.fath=Math.min(999,(S.stats.fath||0)+10); window.updateHeader(); toast('🙏 신성한 축복이 깃들었다',2000); },
        '탐구한다': ()=>{ addExp(50); toast('📖 고대 비문을 해독했다. EXP+50',2000); },
      }},
    { id:'re_nightmare', chance:0.04, minTurn:20,
      title:'불길한 예감',
      desc:'잠을 자다 기묘한 꿈을 꿨다. 무언가를 경고하는 것 같다.',
      choices:['꿈의 의미를 분석한다', '무시한다', '신에게 기도한다'],
      effects:{
        '꿈의 의미를 분석한다': ()=>{ S.stats.per=Math.min(999,(S.stats.per||0)+8); window.updateHeader(); toast('🔮 예지력이 강해졌다. PER+8',2000); },
        '무시한다': ()=>{ if(Math.random()<0.15){ applyStatusEffect('curse'); toast('😰 악몽이 현실이 됐다... 저주 발동',2500); } else toast('아무 일도 없었다',1500); },
        '신에게 기도한다': ()=>{ S.stats.fath=Math.min(999,(S.stats.fath||0)+5); applyStatusEffect('blessed'); window.updateHeader(); toast('✝️ 신의 가호로 악몽을 물리쳤다',2000); },
      }},
    { id:'re_duel', chance:0.05, minTurn:12,
      title:'도전장',
      desc:'한 전사가 결투를 신청해왔다.',
      choices:['받아들인다', '거절한다', '조롱한다'],
      effects:{
        '받아들인다': ()=>{ if(Math.random()<0.55){ S.gold+=50; updateReputation(20); toast('⚔️ 결투 승리! 골드+50, 평판+20',2500); } else { S.stats.hp=Math.max(1,(S.stats.hp||100)-25); window.updateHeader(); toast('⚔️ 결투 패배... HP-25',2500); } },
        '거절한다': ()=>{ updateReputation(-5); toast('😔 비겁자라는 소리를 들었다. 평판-5',2000); },
        '조롱한다': ()=>{ if((S.stats.str||0)>70||Math.random()<0.4){ updateReputation(10); toast('😏 상대가 도망쳤다! 평판+10',2000); } else { S.stats.hp=Math.max(1,(S.stats.hp||100)-15); window.updateHeader(); toast('😡 화가 난 상대에게 얻어맞았다. HP-15',2500); } },
      }},
  ],
  medieval: [
    { id:'re_king_herald', chance:0.03, minTurn:25,
      title:'왕의 전령',
      desc:'왕국 문양이 새겨진 말을 탄 전령이 편지를 건넸다.',
      choices:['편지를 읽는다', '의심스러워 거절한다'],
      effects:{
        '편지를 읽는다': ()=>{ updateFactionRep('왕국 기사단',10); addExp(80); toast('📜 왕국에서 사절 임무를 요청했다. EXP+80',2500); },
        '의심스러워 거절한다': ()=>{ updateFactionRep('왕국 기사단',-5); toast('😤 전령이 무례하다며 떠났다',2000); },
      }},
  ],
};
