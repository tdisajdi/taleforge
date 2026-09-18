// UI 패널
// Auto-extracted from taleforge.html (original section banner preserved above).
import { S } from '../data/084-TaleForge-순수-JS-엔진.js';
import { RUNE_DEFS, RUNE_RECIPES } from '../data/174-룬-정의-30종.js';
import { GEM_GRADE_COLOR, GEM_TYPES, GEM_UPGRADE_COST } from '../data/175-보석-정의-5종-5등급.js';
import { ENHANCE_RATES, ENHANCE_STONES } from '../data/178-인챈트-강화-시스템-1-15.js';
import { loadEquipped, loadInventory, saveInventory } from '../items/007-동적-아이템-생성-시스템-무제한-영구-캐시.js';
import { gemEffectText, initItemSockets } from '../items/175-보석-정의-5종-5등급.js';
import { updateRuneGemBonuses } from '../items/179-총-룬보석-보너스-계산-적용.js';
import { esc, toast } from '../utils.js';

export function renderRuneGemPanel(){
  const body = document.getElementById('pb-rune');
  if(!body) return;
  const equip = typeof loadEquipped==='function' ? loadEquipped() : {};
  const inv   = typeof loadInventory==='function' ? loadInventory() : [];
  const bonuses = updateRuneGemBonuses();

  let html = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px">🔮 룬 · 보석 인챈트</div>';

  // 총 보너스 요약
  const bLines=[];
  if(bonuses.atk)       bLines.push('⚔️ ATK +'+bonuses.atk);
  if(bonuses.def)       bLines.push('🛡 DEF +'+bonuses.def);
  if(bonuses.hp)        bLines.push('❤️ HP +'+bonuses.hp);
  if(bonuses.crit)      bLines.push('💥 크리 +'+bonuses.crit+'%');
  if(bonuses.lifesteal) bLines.push('💉 흡혈 +'+bonuses.lifesteal+'%');
  if(bonuses.exp_bonus) bLines.push('⬆️ EXP +'+bonuses.exp_bonus+'%');
  if(bonuses.summon_atk)bLines.push('🔮 소환ATK +'+bonuses.summon_atk+'%');
  if(bLines.length){
    html += '<div style="padding:7px 9px;background:#0a0800;border:1px solid #3a2a05;margin-bottom:10px;font-size:9px;color:#80c080;line-height:1.8">'+bLines.join('  ')+'</div>';
  }

  // 장착 중인 장비별 소켓 표시
  const equipEntries = Object.entries(equip).filter(function(e){ return e[1]&&e[1].name; });
  if(!equipEntries.length){
    html += '<div style="color:var(--dim);font-size:10px;padding:12px;text-align:center">장착된 장비가 없습니다</div>';
  } else {
    equipEntries.forEach(function(entry){
      const key=entry[0], item=entry[1];
      initItemSockets(item);
      const lv = item.enhanceLevel||0;
      const lvColor = lv>=10?'#e0c040':lv>=7?'#60a0e0':lv>=4?'#60c060':'var(--dim)';
      const zodLocked = item.zodLocked;

      html += '<div style="padding:9px 10px;background:#090600;border:1px solid #2a1a05;margin-bottom:8px">';
      html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">';
      html += '<div style="flex:1"><div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">'+esc(item.name||key)+'</div>';
      html += '<div style="font-size:8px;color:'+lvColor+'">+'+(lv||0)+' 강화'+(zodLocked?' 🔒고정':'')+(item.enhanceAtk?' (ATK+'+item.enhanceAtk+' DEF+'+(item.enhanceDef||0)+' HP+'+(item.enhanceHp||0)+')':'')+'</div></div>';

      // 강화 버튼
      if(lv<15&&!zodLocked){
        const r = ENHANCE_RATES[lv];
        html += '<button onclick="enhanceItem2(\''+key+'\')" style="padding:4px 8px;background:#0a1008;border:1px solid #1a3010;color:#60a060;font-size:8px;cursor:pointer">+강화 ('+r.cost+'G, '+r.success+'%)</button>';
      }
      html += '</div>';

      // 룬 슬롯
      if(item.sockets.runes.length){
        html += '<div style="margin-bottom:5px"><div style="font-size:8px;color:var(--dim);margin-bottom:3px">🔮 룬 슬롯 ('+item.sockets.runes.filter(Boolean).length+'/'+item.sockets.runes.length+')</div>';
        html += '<div style="display:flex;gap:4px;flex-wrap:wrap">';
        item.sockets.runes.forEach(function(runeId, si){
          if(runeId){
            const rd=RUNE_DEFS[runeId];
            html += '<div style="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#0a0820;border:1px solid #3030a0;font-size:8px;color:#a0a0e0">'
              +(rd?rd.icon:'🔮')+' '+(rd?rd.name:runeId)
              +'<button onclick="extractRune(\''+key+'\','+si+')" style="background:none;border:none;color:#606090;cursor:pointer;font-size:9px;padding:0 2px">×</button></div>';
          } else {
            // 인벤에서 룬 선택
            const availRunes=inv.filter(function(i){ return i&&i.type==='rune'; });
            if(availRunes.length){
              html += '<select onchange="if(this.value){engraveRune(\''+key+'\','+si+',this.value);this.value=\'\'}" style="padding:3px;background:#0a0500;border:1px dashed #3030a0;color:#7070b0;font-size:8px;cursor:pointer">'
                +'<option value="">+ 룬 새기기</option>'
                +availRunes.map(function(r){ return '<option value="'+(r.runeId||r.name)+'">'+(r.icon||'🔮')+' '+esc(r.name)+'</option>'; }).join('')
                +'</select>';
            } else {
              html += '<div style="padding:3px 6px;border:1px dashed #2a2060;color:#404060;font-size:8px">빈 룬 슬롯</div>';
            }
          }
        });
        html += '</div></div>';
      }

      // 보석 슬롯
      if(item.sockets.gems.length){
        html += '<div><div style="font-size:8px;color:var(--dim);margin-bottom:3px">💎 보석 슬롯 ('+item.sockets.gems.filter(Boolean).length+'/'+item.sockets.gems.length+')</div>';
        html += '<div style="display:flex;gap:4px;flex-wrap:wrap">';
        item.sockets.gems.forEach(function(gem, si){
          if(gem){
            const gd=GEM_TYPES[gem.typeId];
            const gc=GEM_GRADE_COLOR[gem.grade]||'#888';
            html += '<div style="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#0a0810;border:1px solid '+gc+'55;font-size:8px;color:'+gc+'">'
              +(gd?gd.icon:'💎')+' '+(gd?gd.name:gem.typeId)+' ['+gem.grade+'] '+gemEffectText(gem.typeId,gem.grade)
              +'<button onclick="removeGem(\''+key+'\','+si+')" style="background:none;border:none;color:#605060;cursor:pointer;font-size:9px;padding:0 2px">×</button></div>';
          } else {
            const availGems=inv.filter(function(i){ return i&&i.type==='gem'; });
            if(availGems.length){
              html += '<select onchange="if(this.value){const p=this.value.split(\'|\');socketGem(\''+key+'\','+si+',p[0],p[1]);this.value=\'\'}" style="padding:3px;background:#0a0500;border:1px dashed #404080;color:#706070;font-size:8px;cursor:pointer">'
                +'<option value="">+ 보석 박기</option>'
                +availGems.map(function(g){ return '<option value="'+(g.gemTypeId||g.type)+'|'+(g.gemGrade||'D')+'">'+(g.icon||'💎')+' '+esc(g.name)+'</option>'; }).join('')
                +'</select>';
            } else {
              html += '<div style="padding:3px 6px;border:1px dashed #303060;color:#404060;font-size:8px">빈 보석 슬롯</div>';
            }
          }
        });
        html += '</div></div>';
      }
      html += '</div>';
    });
  }

  // 룬 조합 레시피
  html += '<details style="margin-top:8px"><summary style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);cursor:pointer">🔮 룬 조합 레시피</summary><div style="padding:6px 0">';
  RUNE_RECIPES.forEach(function(rec,i){
    const resultDef=RUNE_DEFS[rec.result];
    html += '<div style="display:flex;align-items:center;gap:7px;padding:5px 7px;background:#090600;border:1px solid #1a1005;margin-bottom:3px">'
      +'<div style="flex:1;font-size:8px;color:var(--dim)">'+esc(rec.desc)+'</div>'
      +'<button onclick="combineRunes('+i+')" style="padding:3px 7px;background:#0a0800;border:1px solid #2a2010;color:#a08040;font-size:8px;cursor:pointer">'+(resultDef?resultDef.icon:'🔮')+' 조합</button>'
      +'</div>';
  });
  html += '</div></details>';

  // 보석 업그레이드
  const upgradeableGems = inv.map(function(i,idx){ return {item:i,idx}; }).filter(function(x){ return x.item&&x.item.type==='gem'&&x.item.gemGrade!=='S'; });
  if(upgradeableGems.length){
    html += '<details style="margin-top:5px"><summary style="font-family:\'Cinzel\',serif;font-size:9px;color:var(--dim);cursor:pointer">💎 보석 업그레이드 (같은 등급 3개→1개 상위)</summary><div style="padding:6px 0">';
    const shown={};
    upgradeableGems.forEach(function(x){
      const k=x.item.gemKey;
      if(shown[k]) return; shown[k]=true;
      const cnt=inv.filter(function(i){ return i&&i.gemKey===k; }).length;
      const cost=GEM_UPGRADE_COST[x.item.gemGrade]||0;
      html += '<div style="display:flex;align-items:center;gap:6px;padding:5px 7px;background:#090600;border:1px solid #1a1005;margin-bottom:3px">'
        +'<span style="font-size:13px">'+(GEM_TYPES[x.item.gemTypeId]?(typeof getEntityIconHTML==='function'?getEntityIconHTML(GEM_TYPES[x.item.gemTypeId],{size:14}):(GEM_TYPES[x.item.gemTypeId]?.icon)):'💎')+'</span>'
        +'<div style="flex:1;font-size:9px;color:var(--dim)">'+esc(x.item.name)+' ×'+cnt+(cnt>=3?' (업그레이드 가능)':' ('+(3-cnt)+'개 더 필요)')+'</div>'
        +(cnt>=3?'<button onclick="upgradeGem('+x.idx+')" style="padding:3px 7px;background:#0a0808;border:1px solid #2a1a30;color:#a060c0;font-size:8px;cursor:pointer">업그레이드 (-'+cost+'G)</button>':'')
        +'</div>';
    });
    html += '</div></details>';
  }

  body.innerHTML = html;
}
window.renderRuneGemPanel = renderRuneGemPanel;

window.renderRuneGemPanel = renderRuneGemPanel;

(function injectRuneGemPanel(){
  const t=function(){
    if(window._runeGemInjected) return;
    if(!document.getElementById('pb-heritage')){ setTimeout(t,1000); return; }
    if(!document.getElementById('pb-rune')){
      const ref=document.getElementById('p-heritage');
      if(!ref){ setTimeout(t,500); return; }
      const div=document.createElement('div');
      div.className='panel-ov'; div.id='p-rune';
      div.innerHTML='<div class="panel"><div class="p-hdr"><span class="p-title">🔮 룬·보석</span><button class="p-close" onclick="closeP(\'rune\')">✕</button></div><div class="p-body scrollable" id="pb-rune"></div></div>';
      ref.parentNode.insertBefore(div,ref.nextSibling);
    }
    const heritageBtn=document.querySelector('.grp-sub-btn[onclick*="heritage"]');
    if(heritageBtn&&!document.querySelector('.grp-sub-btn[onclick*="rune"]')){
      const btn=document.createElement('button');
      btn.className='grp-sub-btn';
      btn.setAttribute('onclick',"openP('rune');closeGrp()");
      btn.innerHTML='🔮 룬·보석';
      heritageBtn.parentNode.insertBefore(btn,heritageBtn.nextSibling);
    }
    window._runeGemInjected=true;
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',t);
  else setTimeout(t,2400);
})();

(function hookRuneGemOpenP(){
  const t=function(){
    if(window._runeGemOpenHooked) return;
    if(typeof window.openP!=='function'){ setTimeout(t,1500); return; }
    window._runeGemOpenHooked=true;
    const _o=window.openP;
    window.openP=function(name){
      const r=_o.apply(this,arguments);
      if(name==='rune') setTimeout(function(){ renderRuneGemPanel(); updateRuneGemBonuses(); },100);
      return r;
    };
  };
  setTimeout(t,2800);
})();

(function hookRuneGemBLS(){
  const t=function(){
    if(window._runeGemBLSHooked) return;
    const fn=typeof window.buildLightSystem==='function'?'buildLightSystem':typeof window.buildSystemPrompt==='function'?'buildSystemPrompt':typeof window.buildPrompt==='function'?'buildPrompt':null;
    if(!fn){ setTimeout(t,3000); return; }
    window._runeGemBLSHooked=true;
    const _o=window[fn];
    window[fn]=function(){
      const r=_o.apply(this,arguments);
      try{
        const b=S.runeGemBonuses||updateRuneGemBonuses();
        const lines=[];
        if(b.atk>0)        lines.push('ATK+'+b.atk);
        if(b.def>0)        lines.push('DEF+'+b.def);
        if(b.hp>0)         lines.push('HP+'+b.hp);
        if(b.crit>0)       lines.push('크리+'+b.crit+'%');
        if(b.lifesteal>0)  lines.push('흡혈+'+b.lifesteal+'%');
        if(b.exp_bonus>0)  lines.push('EXP+'+b.exp_bonus+'%');
        if(b.summon_atk>0) lines.push('소환ATK+'+b.summon_atk+'%');
        if(b.armor_pierce) lines.push('방어관통');
        if(b.revive)       lines.push('소생'+b.revive+'%');
        if(!lines.length) return r;
        const bls='\n\n[🔮 룬·보석 강화 효과]\n'+lines.join(' / ')
          +'\n이 장비 강화 효과를 전투 묘사에 반영하라.';
        return typeof r==='string'?r+bls:r;
      }catch(e){ return r; }
    };
  };
  setTimeout(t,5200);
})();

setTimeout(function(){ try{ updateRuneGemBonuses(); }catch(e){} }, 3000);

// [버그 수정] 이 자리에 있던 hookRuneGemGS는 window.sendMsg를 감싸는
// 방식이라(다른 죽은 훅들과 동일한 원인) 한 번도 실행되지 않아, AI가
// 룬/보석/강화석을 gs.item_add로 지급해도 인벤토리에 전혀 반영되지
// 않았다. window.processGSBlock(gs)에 옮겨 연결한다.
(function hookRuneGemGS(){
  const t=function(){
    if(window._runeGemGSHooked) return;
    if(typeof window.processGSBlock!=='function'){ setTimeout(t,1500); return; }
    window._runeGemGSHooked=true;
    const _o=window.processGSBlock;
    window.processGSBlock=function(gs){
      const r=_o.apply(this,arguments);
      try{
        if(gs){
          if(Array.isArray(gs.item_add)){
            gs.item_add.forEach(function(item){
              if(!item) return;
              const inv=typeof loadInventory==='function'?loadInventory():[];
              // 룬 아이템
              if(item.runeId&&RUNE_DEFS[item.runeId]){
                const rd=RUNE_DEFS[item.runeId];
                inv.push({name:rd.name,icon:rd.icon,runeId:item.runeId,type:'rune',desc:rd.effect,tier:rd.tier});
                if(typeof saveInventory==='function') saveInventory(inv);
                toast(rd.icon+' '+rd.name+' 획득! ('+rd.tier+'급 룬)',3500);
              }
              // 보석 아이템
              if(item.gemTypeId&&GEM_TYPES[item.gemTypeId]){
                const gd=GEM_TYPES[item.gemTypeId];
                const grade=item.gemGrade||'D';
                const gemKey=item.gemTypeId+'_'+grade;
                inv.push({name:gd.name+' ['+grade+'급]',icon:gd.icon,gemKey,gemTypeId:item.gemTypeId,gemGrade:grade,type:'gem',desc:gemEffectText(item.gemTypeId,grade)});
                if(typeof saveInventory==='function') saveInventory(inv);
                toast(gd.icon+' '+gd.name+' ['+grade+'급] 획득!',3500);
              }
              // 강화석
              if(item.enhanceStone&&ENHANCE_STONES[item.enhanceStone]){
                const sd=ENHANCE_STONES[item.enhanceStone];
                inv.push({name:item.enhanceStone,icon:'✨',type:'enhance_stone',desc:sd.desc});
                if(typeof saveInventory==='function') saveInventory(inv);
                toast('✨ '+item.enhanceStone+' 획득!',3000);
              }
            });
          }
        }
      }catch(e){}
      return r;
    };
  };
  setTimeout(t,3500);
})();

console.log('[TaleForge] 룬·보석·인챈트 시스템 로드 완료 ✓');

console.log('[TaleForge v49] 작동 불량 로직 전면 수정 — processGSBlock/GS필드8/이벤트/onclick/레벨업 등 완료 ✓');

console.log('① 에이든 AIDEN_PROFILE(과거/동기/루프각성/장별서사) ② 베엘제부브 BEELZEBUB_PROFILE(3천년역사/내분)');

console.log('③ 말라카르 MALAKAR_PROFILE(반협약파수장/친제갈등) ④ 세계의의지 WORLD_WILL_MANIFESTATION(8장등장/대사/선택)');

console.log('⑤ 레오나르드 LEONARD_PROFILE(비밀/균열순간/동맹전환) ⑥ 마계내분 INFERNAL_FACTIONS+아르카누스 루프서사');

console.log("⑦ 비중세 시나리오 메인퀘스트 서사 보강(스팀펑크/무협/사이버펑크/아포칼립스/신화 fullDesc+aiHint+NPC)");
