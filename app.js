const { useState, useRef, useEffect, useCallback } = React;

function PixelBorder({ children, style }) { return <div style={{ border:"3px solid #c8a96e", boxShadow:"inset 0 0 0 1px #3a2a0a, 0 0 0 1px #3a2a0a, 4px 4px 0 #1a0f00", background:"linear-gradient(135deg, #1c1108 0%, #2a1f0d 50%, #1c1108 100%)", ...style }}>{children}</div>; }

function ThinkingIndicator() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", animation:"fadeIn 0.3s ease" }}>
      <div style={{ width:38, height:38, borderRadius:"50%", border:"2px solid #c8a96e", background:"radial-gradient(circle at 40% 40%, #8b3a3a, #2a0f0f)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0, boxShadow:"0 0 12px rgba(200,169,110,0.6)" }}>🧙</div>
      <div>
        <div style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif", letterSpacing:2, marginBottom:4 }}>✦ 사고 중...</div>
        <div style={{ display:"flex", gap:4 }}>
          {[0,1,2,3,4].map(i => <div key={i} style={{ width:5, height:5, background:"#c8a96e", borderRadius:"50%", animation:`pulse 1.2s ${i*0.15}s infinite` }} />)}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", alignItems:"flex-start", gap:8, marginBottom:14, animation:"fadeIn 0.35s ease" }}>
      <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid #c8a96e", background:isUser?"radial-gradient(circle at 40% 40%, #4a6fa5, #1a2a4a)":"radial-gradient(circle at 40% 40%, #8b3a3a, #2a0f0f)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, boxShadow:"0 0 8px rgba(200,169,110,0.4)" }}>{isUser?"⚔️":"🧙"}</div>
      <div style={{ maxWidth:"78%" }}>
        <div style={{ fontSize:10, color:"#8a7a5a", fontFamily:"'Cinzel',serif", marginBottom:3, textAlign:isUser?"right":"left" }}>{isUser?"모험가":msg.characterName}</div>
        {!isUser && (
          <div style={{ marginBottom:6 }}>
            {msg.imageLoading && !imgError && (
              <div style={{ width:"100%", height:120, background:"linear-gradient(135deg,#1a0f00,#0a0800)", border:"1px solid #3a2a0a", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ width:4, height:4, background:"#5a4a2a", borderRadius:"50%", animation:`pulse 1.2s ${i*0.2}s infinite` }} />)}
                <span style={{ color:"#4a3a1a", fontSize:10, fontFamily:"'Cinzel',serif", marginLeft:4 }}>장면 생성 중...</span>
              </div>
            )}
            {!msg.imageLoading && msg.imageUrl && !imgError && (
              <img src={msg.imageUrl} alt="scene" onError={() => setImgError(true)}
                style={{ width:"100%", maxHeight:200, objectFit:"cover", border:"1px solid #5a3e1a", display:"block", filter:"brightness(0.88) contrast(1.05)" }} />
            )}
          </div>
        )}
        {!isUser && msg.rollInfo && (
          <div style={{ marginBottom:5 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 8px", background: msg.rollInfo.isCritSuccess ? "rgba(255,215,0,0.12)" : msg.rollInfo.isCritFail ? "rgba(180,30,30,0.18)" : msg.rollInfo.isSuccess ? "rgba(40,120,40,0.12)" : "rgba(80,80,80,0.15)", border:`1px solid ${msg.rollInfo.isCritSuccess?"#c8a96e":msg.rollInfo.isCritFail?"#8b2020":msg.rollInfo.isSuccess?"#3a7a3a":"#4a4a4a"}`, borderRadius:2 }}>
              <span style={{ fontSize:11 }}>{msg.rollInfo.statIcon}</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:"#8a7a5a" }}>{msg.rollInfo.statName}</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:"#5a4a3a" }}>🎲{msg.rollInfo.diceRoll}/{msg.rollInfo.statValue}</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, color: msg.rollInfo.isCritSuccess?"#ffd700":msg.rollInfo.isCritFail?"#ff4444":msg.rollInfo.isSuccess?"#7adf7a":"#aaaaaa", marginLeft:"auto" }}>{msg.rollInfo.verdictEmoji} {msg.rollInfo.verdict}</span>
            </div>
            {msg.rollInfo.skillUsed && (
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 8px", background:"rgba(80,50,150,0.12)", border:"1px solid #3a2a6a", borderRadius:2, marginTop:2 }}>
                <span style={{ fontSize:9 }}>⚔️</span>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:"#8a6ae0" }}>스킬: {msg.rollInfo.skillUsed}</span>
              </div>
            )}
            {msg.rollInfo.passiveProcs && msg.rollInfo.passiveProcs.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:3, padding:"3px 8px", background:"rgba(50,100,50,0.1)", border:"1px solid #2a4a2a", borderRadius:2, marginTop:2 }}>
                {msg.rollInfo.passiveProcs.map((p,pi) => (
                  <span key={pi} style={{ fontFamily:"'Cinzel',serif", fontSize:8, color:"#5ae090" }}>{p.icon} {p.name}</span>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ background:isUser?"linear-gradient(135deg, #1a2a4a, #0f1a2a)":"linear-gradient(135deg, #2a0f0f, #1a0808)", border:`1px solid ${isUser?"#4a6fa5":"#8b3a3a"}`, borderRadius:2, padding:"9px 12px", fontFamily:"'Crimson Text',serif", fontSize:15, color:"#e8d5a0", lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{msg.content}</div>
      </div>
    </div>
  );
}

function ApiKeyScreen({ onConfirm }) {
  const [keys, setKeys] = useState(() => loadApiKeys());
  const [newKey, setNewKey] = useState("");
  const [show, setShow] = useState(false);
  const [showList, setShowList] = useState(false);
  const [activeIdx, setActiveIdx] = useState(() => loadKeyIndex());
  const MAX_KEYS = 20;

  const addKey = () => {
    const t = newKey.trim();
    if (!t || keys.length >= MAX_KEYS) return;
    if (keys.includes(t)) { setNewKey(""); return; }
    const updated = [...keys, t];
    setKeys(updated); saveApiKeys(updated); setNewKey("");
    if (updated.length === 1) { setActiveIdx(0); saveKeyIndex(0); }
  };
  const removeKey = (i) => {
    const updated = keys.filter((_,idx) => idx !== i);
    setKeys(updated); saveApiKeys(updated);
    const ni = Math.min(activeIdx, Math.max(0, updated.length-1));
    setActiveIdx(ni); saveKeyIndex(ni);
  };
  const setActive = (i) => { setActiveIdx(i); saveKeyIndex(i); };
  const submit = () => { if (keys.length > 0) onConfirm(keys); };
  const maskKey = (k) => k.length > 10 ? k.slice(0,6)+"••••••"+k.slice(-4) : "••••••••••";

  return (
    <div style={{ flex:1, background:"linear-gradient(160deg, #0a0500 0%, #150d03 40%, #0a0500 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:480, animation:"fadeIn 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:11, color:"#8a7a5a", letterSpacing:4, marginBottom:8 }}>── ✦ ──</div>
          <h1 style={{ fontSize:28, color:"#c8a96e", margin:0, letterSpacing:3, fontFamily:"'Cinzel',serif", animation:"flicker 3s infinite" }}>TALE FORGE</h1>
          <div style={{ fontSize:10, color:"#6a5a3a", letterSpacing:4, marginTop:6, fontFamily:"'Cinzel',serif" }}>Powered by Gemini</div>
        </div>
        <PixelBorder>
          <div style={{ padding:"20px 18px" }}>
            <div style={{ fontSize:11, color:"#8a7a5a", letterSpacing:2, marginBottom:8, fontFamily:"'Cinzel',serif", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>🔑 GOOGLE AI API KEYS</span>
              <span style={{ fontSize:9, color:keys.length>=MAX_KEYS?"#c0392b":"#4a6a3a" }}>{keys.length}/{MAX_KEYS}</span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <div style={{ position:"relative", flex:1 }}>
                <input type={show?"text":"password"} value={newKey} onChange={e=>setNewKey(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addKey()} placeholder="AIza... 키 입력 후 + 추가"
                  style={{ width:"100%", background:"#0f0a02", border:"1px solid #5a3e1a", color:"#e8d5a0", fontFamily:"'Crimson Text',serif", fontSize:15, padding:"11px 40px 11px 12px" }} />
                <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute", right:0, top:0, bottom:0, width:40, background:"none", border:"none", color:"#8a7a5a", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>{show?"🙈":"👁"}</button>
              </div>
              <button onClick={addKey} disabled={!newKey.trim()||keys.length>=MAX_KEYS}
                style={{ padding:"11px 13px", background:newKey.trim()&&keys.length<MAX_KEYS?"linear-gradient(135deg,#5a3e1a,#8a6030)":"#1a1208", border:"1px solid #c8a96e", color:newKey.trim()&&keys.length<MAX_KEYS?"#ffd700":"#5a4a2a", fontFamily:"'Cinzel',serif", fontSize:11, flexShrink:0, minHeight:44 }}>+ 추가</button>
            </div>
            {keys.length > 0 && (
              <div style={{ marginTop:12 }}>
                <button onClick={()=>setShowList(s=>!s)}
                  style={{ background:"none", border:"none", color:"#8a7a5a", fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:1.5, padding:0, marginBottom:6, cursor:"pointer" }}>
                  {showList?"▾":"▸"} 등록된 키 {keys.length}개{keys.length>1?" · 라운드로빈 로테이션":""}
                </button>
                {showList && (
                  <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:200, overflowY:"auto" }}>
                    {keys.map((k,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 10px", background:i===activeIdx?"linear-gradient(135deg,#1c2a0a,#2a3a10)":"#0f0a02", border:`1px solid ${i===activeIdx?"#7a9a3a":"#3a2a0a"}` }}>
                        <button onClick={()=>setActive(i)} style={{ background:"none", border:`1.5px solid ${i===activeIdx?"#c8a96e":"#5a3e1a"}`, borderRadius:"50%", width:16, height:16, flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
                          {i===activeIdx&&<div style={{ width:8, height:8, borderRadius:"50%", background:"#c8a96e" }}/>}
                        </button>
                        <span style={{ flex:1, fontFamily:"'Crimson Text',serif", fontSize:13, color:i===activeIdx?"#c8a96e":"#6a5a3a" }}>
                          <span style={{ color:"#5a4a2a", fontSize:10, marginRight:5, fontFamily:"'Cinzel',serif" }}>#{i+1}</span>{maskKey(k)}
                        </span>
                        {i===activeIdx&&<span style={{ fontSize:8, color:"#7a9a3a", fontFamily:"'Cinzel',serif" }}>현재</span>}
                        <button onClick={()=>removeKey(i)} style={{ background:"none", border:"1px solid #5a1a1a", color:"#8b3a3a", fontFamily:"'Cinzel',serif", fontSize:9, padding:"2px 6px", cursor:"pointer" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={submit} disabled={keys.length===0}
              style={{ marginTop:14, width:"100%", padding:14, background:keys.length>0?"linear-gradient(135deg,#8b0000,#c0392b)":"#1a1208", border:"1px solid #c8a96e", color:keys.length>0?"#ffd700":"#5a4a2a", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:2, animation:keys.length>0?"glow 2s infinite":"none" }}>
              ⚔ 입장
            </button>
          </div>
        </PixelBorder>
      </div>
    </div>
  );
}

const SCENARIOS = [
  { id: "medieval", era: "중세 판타지", icon: "⚔️", title: "왕국의 황혼", desc: "마법과 검이 공존하는 왕국.", bg: "linear-gradient(135deg, #1a0a00, #2a1500, #1a0800)", accent: "#c8a96e" },
  { id: "wuxia", era: "무협 강호", icon: "🐉", title: "강호의 전설", desc: "무림의 고수들이 패권을 다투는 강호.", bg: "linear-gradient(135deg, #0a0008, #150010, #080010)", accent: "#e05a5a" },
  { id: "cyberpunk", era: "사이버펑크", icon: "🤖", title: "네온의 도시", desc: "2087년, 거대 기업이 지배하는 도시.", bg: "linear-gradient(135deg, #00050f, #050020, #0f0010)", accent: "#00d4ff" },
  { id: "custom", era: "나만의 세계", icon: "✨", title: "커스텀 시나리오", desc: "자유롭게 캐릭터와 세계를 설정합니다.", bg: "linear-gradient(135deg, #0a0500, #150d03, #0a0500)", accent: "#c8a96e" }
];

function ReincarnationScreen({ pastLife, onStart, onSkip }) {
  const [selectedTitles, setSelectedTitles] = React.useState([]);
  const [screen, setScreen]                 = React.useState("titles");
  const [scenario, setScenario]             = React.useState(null);
  const MAX_TITLES = 5;

  const toggleTitle = (id) => {
    setSelectedTitles(prev => prev.includes(id) ? prev.filter(t => t !== id) : prev.length < MAX_TITLES ? [...prev, id] : prev);
  };

  const handleBegin = (char) => {
    const allTitles = loadTitles();
    const keptTitles = allTitles.filter(t => selectedTitles.includes(t.id));
    saveTitles(keptTitles);

    // 클리어 보상 스킬 복원 (환생 후에도 유지)
    const clearRewards = loadClearRewards();
    const clearSkillRewards = clearRewards.filter(r => r.type === "skill");
    if (clearSkillRewards.length > 0) {
      const existing = loadSkills();
      const restored = { ...existing };
      clearSkillRewards.forEach(r => { restored[r.id] = true; });
      saveSkills(restored);
    }
    // 클리어 보상 아이템 복원 (환생 후에도 인벤토리에 유지)
    const clearItemRewards = clearRewards.filter(r => r.type === "item");
    if (clearItemRewards.length > 0) {
      const existingInv = loadInventory();
      const newItems = clearItemRewards
        .filter(r => !existingInv.some(it => it.name === (Object.values(CLEAR_ITEMS).flat().find(ci => ci.id === r.id)?.name || "")))
        .map(r => {
          const itemDef = Object.values(CLEAR_ITEMS).flat().find(ci => ci.id === r.id);
          if (!itemDef) return null;
          return { id: Date.now() + Math.random(), name: itemDef.name, rarity: itemDef.rarity, from:"클리어 보상 (환생)", obtainedAt: new Date().toISOString(), clearReward: true };
        }).filter(Boolean);
      if (newItems.length > 0) saveInventory([...existingInv, ...newItems]);
    }

    // 4번: 전생 유물 인벤토리 지급
    const earnedRelicIds = loadPastRelics().map(r => r.id);
    const relicItems = RELIC_DEFS.filter(relic => earnedRelicIds.includes(relic.id)).map(relic => ({ id: Date.now()+Math.random(), name: relic.name, icon: relic.icon, rarity: relic.rarity, from:"전생 유물", desc: relic.desc, effects: relic.effects, obtainedAt: new Date().toISOString(), isRelic: true }));
    if (relicItems.length > 0) { const inv = loadInventory(); const newRelics = relicItems.filter(ri => !inv.some(i => i.name === ri.name)); if (newRelics.length > 0) saveInventory([...inv, ...newRelics]); }
    // 5번: 아티팩트 파편 완성
    if (loadArtifactShards() >= ARTIFACT_MAX_SHARDS) { const inv2 = loadInventory(); if (!inv2.some(i => i.name === ARTIFACT_COMPLETE.name)) saveInventory([...inv2, { id: Date.now()+Math.random(), ...ARTIFACT_COMPLETE, from:"파편 수집 완성", obtainedAt: new Date().toISOString() }]); }
    // 6번: 영혼 각인 무기
    const topWeapon = getTopWeapon(); if (topWeapon && WEAPON_TYPES[topWeapon]) saveSoulWeapon({ type: topWeapon, ...WEAPON_TYPES[topWeapon] });

    const pastLifeSummary = pastLife?.summary || "";
    const charWithBonus = { ...char, scenario: scenario?.era || "", pastLifeStatBonuses: pastLife?.statBonuses || {}, pastLifeKarmaScore: pastLife?.karmaScore || 0 };

    const newMem = { ...EMPTY_MEMORY(), pastLifeSummary };
    saveMemory(newMem);
    onStart(charWithBonus, scenario, { ...pastLife, selectedTitles });
  };

  const earnedTitles = (pastLife?.titles || []);
  const bonuses = pastLife?.newPickedStats || [];
  const statBonuses = pastLife?.statBonuses || {};

  if (screen === "setup") return <SetupScreen onStart={handleBegin} scenario={scenario} pastLife={pastLife} isReincarnation={true} />;

  return (
    <div style={{ flex:1, background:"linear-gradient(160deg,#08020f,#120820,#080010)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:480, animation:"fadeIn 0.6s ease" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:26, marginBottom:6, animation:"flicker 3s infinite" }}>✨</div>
          <h1 style={{ fontSize:22, color:"#c8a0ff", margin:0, letterSpacing:3, fontFamily:"'Cinzel',serif" }}>환생</h1>
        </div>

        {pastLife?.summary && (
          <div style={{ marginBottom:16, padding:"12px 14px", background:"linear-gradient(135deg,#150820,#0a0515)", border:"1px solid #5a3a8a" }}>
            <div style={{ fontSize:9, color:"#8a6aaa", letterSpacing:2, marginBottom:6, fontFamily:"'Cinzel',serif" }}>✦ 전생의 기억</div>
            <div style={{ fontSize:12, color:"#b090d0", fontFamily:"'Crimson Text',serif", lineHeight:1.7, fontStyle:"italic" }}>{pastLife.summary.length > 200 ? pastLife.summary.slice(0, 200) + "…" : pastLife.summary}</div>
          </div>
        )}

        {(() => {
          const ks = pastLife?.karmaScore || 0;
          if (ks < 70) return null;
          const tier = ks >= 95 ? { icon:"🔥", label:"업보의 심판", color:"#ff4444", bg:"rgba(80,10,10,0.45)", border:"#aa2222",
            desc:"전생의 극악한 업보가 이 생을 짓누릅니다. 현상수배, 저주, 광기가 함께 시작되며 HP가 최대 60으로 제한됩니다.",
            penalties:"신뢰도 -10 · 평판 -10 · 행운 -5 · 광기 +10 · 저주도 +10 · 시작HP 60 이하" }
            : ks >= 85 ? { icon:"💀", label:"저주받은 영혼", color:"#cc4444", bg:"rgba(60,10,10,0.4)", border:"#883333",
            desc:"전생의 무거운 죄업이 영혼에 새겨졌습니다. 주변의 시선이 차갑고 운도 따르지 않습니다.",
            penalties:"신뢰도 -10 · 평판 -10 · 행운 -5 · 시작HP 70 이하" }
            : { icon:"🌑", label:"어둠의 기억", color:"#aa6644", bg:"rgba(40,15,5,0.4)", border:"#664422",
            desc:"전생에 저지른 악행의 잔향이 남아있습니다. 처음 만나는 이들이 근거 없는 경계심을 느낍니다.",
            penalties:"신뢰도 -5 · 평판 -5" };
          return (
            <div style={{ marginBottom:16, padding:"12px 14px", background:tier.bg, border:`1px solid ${tier.border}`, borderRadius:2 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                <span style={{ fontSize:18 }}>{tier.icon}</span>
                <div>
                  <div style={{ fontSize:10, color:tier.color, fontFamily:"'Cinzel',serif", letterSpacing:1.5 }}>{tier.label}</div>
                  <div style={{ fontSize:9, color:"#7a4a4a", fontFamily:"'Cinzel',serif" }}>전생 업보 {ks}/100</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:"#d09090", fontFamily:"'Crimson Text',serif", lineHeight:1.6, marginBottom:6 }}>{tier.desc}</div>
              <div style={{ fontSize:9, color:tier.color, fontFamily:"'Cinzel',serif", letterSpacing:0.5, opacity:0.8 }}>⚠ {tier.penalties}</div>
            </div>
          );
        })()}

        <div style={{ marginBottom:16, padding:"10px 14px", background:"rgba(100,60,160,0.12)", border:"1px solid #3a2a5a" }}>
          <div style={{ textAlign:"center", fontSize:11, color:"#c8a0ff", fontFamily:"'Cinzel',serif", marginBottom:8 }}>이번 환생으로 인한 스탯 보너스</div>
          <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
            {bonuses.map(k => {
              const info = getStatInfo(k);
              return (
                <div key={k} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:12 }}>{info?.icon}</div>
                  <div style={{ fontSize:9, color:"#8a6aaa", fontFamily:"'Cinzel',serif" }}>{info?.name}</div>
                  <div style={{ fontSize:14, color:info?.color||"#c8a0ff", fontFamily:"'Cinzel',serif" }}>+3</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:10, textAlign:"center", fontSize:9, color:"#6a4a8a", fontFamily:"'Crimson Text',serif" }}>
            누적 스탯 보너스: {Object.keys(statBonuses).map(k => `${getStatInfo(k)?.name} +${statBonuses[k]}`).join(", ") || "없음"}
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:"#8a6aaa", letterSpacing:2, marginBottom:8, fontFamily:"'Cinzel',serif", display:"flex", justifyContent:"space-between" }}>
            <span>👑 환생에 가져갈 칭호 선택</span><span style={{ color: selectedTitles.length === MAX_TITLES ? "#c8a0ff" : "#5a3a8a" }}>{selectedTitles.length} / {MAX_TITLES}</span>
          </div>
          {earnedTitles.length === 0 ? (
            <div style={{ padding:"16px", textAlign:"center", color:"#3a2a5a", fontSize:12, fontFamily:"'Crimson Text',serif" }}>전생에서 획득한 칭호가 없습니다</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:200, overflowY:"auto" }}>
              {earnedTitles.map(t => {
                const def = TITLE_DEFS.find(d => d.id === t.id);
                if (!def) return null;
                const isSelected = selectedTitles.includes(t.id);
                const isFull = selectedTitles.length >= MAX_TITLES && !isSelected;
                return (
                  <button key={t.id} onClick={() => !isFull && toggleTitle(t.id)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", textAlign:"left", background: isSelected ? "linear-gradient(135deg,#1a0a2a,#2a1040)" : "#080410", border:`1px solid ${isSelected ? RARITY_COLOR[def.rarity] : "#2a1a4a"}`, opacity: isFull ? 0.4 : 1, cursor: isFull ? "not-allowed" : "pointer" }}>
                    <span style={{ fontSize:16 }}>{def.icon}</span>
                    <div style={{ flex:1 }}><div style={{ fontSize:10, color: isSelected ? RARITY_COLOR[def.rarity] : "#6a5a8a", fontFamily:"'Cinzel',serif" }}>{def.name}</div></div>
                    {isSelected && <span style={{ fontSize:14, color:"#c8a0ff" }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 환생 누적 시스템 정보 패널 ── */}
        {(() => {
          const cycle = loadCycleCount();
          const shards = loadArtifactShards();
          const soulWeapon = loadSoulWeapon();
          const fameLegacy = loadFameLegacy();
          const relicCount = loadPastRelics().length;
          const awakenedJobs = getUnlockedAwakenedJobs();
          const karmaEff = getKarmaEffect(pastLife?.karmaScore || 50);
          const hasAny = cycle > 0 || shards > 0 || soulWeapon || fameLegacy || relicCount > 0;
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom:16, padding:"12px 14px", background:"rgba(80,40,120,0.12)", border:"1px solid #3a2a5a" }}>
              <div style={{ fontSize:9, color:"#9a6aee", letterSpacing:2, marginBottom:10, fontFamily:"'Cinzel',serif" }}>♾️ 누적 기록</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                <div style={{ fontSize:10, color:"#c8a0ff", fontFamily:"'Cinzel',serif" }}>🔄 {cycle}회차</div>
                {shards > 0 && <div style={{ fontSize:10, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>🏺 파편 {shards}/{ARTIFACT_MAX_SHARDS}{shards>=ARTIFACT_MAX_SHARDS?" ✅":""}</div>}
                {relicCount > 0 && <div style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif" }}>🗿 유물 {relicCount}개</div>}
                {soulWeapon && <div style={{ fontSize:10, color:"#a0c0ff", fontFamily:"'Cinzel',serif" }}>{soulWeapon.icon} 각인: {soulWeapon.name}</div>}
                {fameLegacy && fameLegacy.type !== "neutral" && (
                  <div style={{ fontSize:10, color: fameLegacy.type==="hero"?"#7ae07a":"#e07a7a", fontFamily:"'Cinzel',serif" }}>
                    {fameLegacy.type==="hero"?"🌟":"💀"} {fameLegacy.label}의 소문
                  </div>
                )}
                {awakenedJobs.length > 0 && (
                  <div style={{ fontSize:10, color:"#e0a0ff", fontFamily:"'Cinzel',serif" }}>
                    {awakenedJobs.map(j => `${j.icon}${j.name}`).join(" · ")} 해금
                  </div>
                )}
                {(() => {
                  const hiddenJobs = getUnlockedHiddenJobs();
                  if (hiddenJobs.length === 0) return null;
                  return (
                    <div style={{ fontSize:10, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>
                      🔓 숨겨진 직업 {hiddenJobs.length}개 해금
                    </div>
                  );
                })()}
              </div>
              {(() => {
                const hiddenJobs = getUnlockedHiddenJobs();
                if (hiddenJobs.length === 0) return null;
                return (
                  <div style={{ marginTop:8, padding:"7px 10px", background:"rgba(30,15,0,0.5)", border:"1px solid #c8a02044" }}>
                    <div style={{ fontSize:8, color:"#c8a020", fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:4 }}>🔓 해금된 숨겨진 직업</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {hiddenJobs.map(j => (
                        <span key={j.id} style={{ fontSize:9, color: j.rarity==="legendary"?"#ffd700":"#c08aff", fontFamily:"'Cinzel',serif" }}>
                          {j.icon} {j.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {karmaEff && karmaEff !== KARMA_EFFECTS.neutral && (
                <div style={{ marginTop:8, fontSize:9, color:karmaEff.color, fontFamily:"'Crimson Text',serif", lineHeight:1.5 }}>{karmaEff.icon} {karmaEff.label} — {karmaEff.desc}</div>
              )}
            </div>
          );
        })()}

        {/* ── 시스템 11~20 누적 정보 패널 ── */}
        {(() => {
          const cycle = loadCycleCount();
          if (cycle < 1) return null;
          const forbiddenSkills = getUnlockedForbiddenSkills();
          const butterfly = loadButterfly();
          const hiddenPieces = loadHiddenEndingPieces();
          const deathBonuses = getActiveDeathBonuses();
          const traumaImmunities = getTraumaImmunities();
          const lastWord = loadLastWord();
          const metaKnowledge = getMetaKnowledgeHints();
          const fateRes = getFateResistance();
          const exploredMaps = loadExploredMaps();
          const evolvedRace = pastLife?.race ? getEvolvedRace(pastLife.race) : null;
          const hasAny = forbiddenSkills.length>0 || butterfly.length>0 || hiddenPieces.length>0 || deathBonuses.length>0 || traumaImmunities.length>0 || lastWord || metaKnowledge.length>0 || fateRes || exploredMaps.length>0 || evolvedRace?.isEvolved;
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom:16, padding:"12px 14px", background:"rgba(20,40,60,0.3)", border:"1px solid #2a4a6a" }}>
              <div style={{ fontSize:9, color:"#6aaade", letterSpacing:2, marginBottom:10, fontFamily:"'Cinzel',serif" }}>🌌 전생의 흔적 (11~20번 시스템)</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {lastWord && (
                  <div style={{ fontSize:9, color:"#a0c0e0", fontFamily:"'Crimson Text',serif", fontStyle:"italic", padding:"5px 8px", background:"rgba(20,40,60,0.4)", border:"1px solid #2a4060" }}>
                    💬 {LAST_WORD_OPENINGS[lastWord.tone] || LAST_WORD_OPENINGS.tragic}
                  </div>
                )}
                {fateRes && (
                  <div style={{ fontSize:9, color:"#e0a040", fontFamily:"'Cinzel',serif", padding:"4px 8px", background:"rgba(40,20,0,0.4)", border:"1px solid #5a3a10" }}>
                    ⚡ 세계의 저항 Lv.{fateRes.level} — {fateRes.label}
                  </div>
                )}
                {evolvedRace?.isEvolved && (
                  <div style={{ fontSize:9, color:"#80ffb0", fontFamily:"'Cinzel',serif" }}>🧬 혈통 진화: {pastLife.race} → {evolvedRace.name} ({evolvedRace.count}회 플레이)</div>
                )}
                {deathBonuses.length > 0 && (
                  <div style={{ fontSize:9, color:"#c0a0ff", fontFamily:"'Cinzel',serif" }}>
                    💀 사망 유산: {deathBonuses.map(d => d.name).join(" · ")}
                  </div>
                )}
                {traumaImmunities.length > 0 && (
                  <div style={{ fontSize:9, color:"#ffa060", fontFamily:"'Cinzel',serif" }}>
                    🛡️ 트라우마 면역: {traumaImmunities.map(t => `${t.icon}${t.label}`).join(" · ")}
                  </div>
                )}
                {hiddenPieces.length > 0 && (
                  <div style={{ fontSize:9, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>
                    🔮 히든 엔딩 파편: {hiddenPieces.length}/{HIDDEN_ENDING_TOTAL}{isHiddenEndingUnlocked()?" ✅ 진엔딩 해금!":""}
                  </div>
                )}
                {forbiddenSkills.length > 0 && (
                  <div style={{ fontSize:9, color:"#ff6060", fontFamily:"'Cinzel',serif" }}>
                    🔓 금지 스킬: {forbiddenSkills.map(s => `${s.icon}${s.name}`).join(" · ")}
                  </div>
                )}
                {butterfly.length > 0 && (
                  <div style={{ fontSize:9, color:"#80d0ff", fontFamily:"'Crimson Text',serif", lineHeight:1.5 }}>
                    🦋 {butterfly[butterfly.length-1] && BUTTERFLY_EFFECTS[butterfly[butterfly.length-1].type]?.worldEcho(butterfly[butterfly.length-1].data)}
                  </div>
                )}
                {metaKnowledge.length > 0 && (
                  <div style={{ fontSize:9, color:"#a0e0a0", fontFamily:"'Cinzel',serif" }}>
                    💡 메타 지식 {metaKnowledge.length}개 보유
                  </div>
                )}
                {exploredMaps.length > 0 && (
                  <div style={{ fontSize:9, color:"#c0c0ff", fontFamily:"'Cinzel',serif" }}>
                    🗺️ 탐험 기록 {exploredMaps.length}곳
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── 시스템 21~30 누적 정보 패널 ── */}
        {(() => {
          const cycle = loadCycleCount();
          if (cycle < 1) return null;
          const relLegacies = getRelationshipLegacies();
          const worldSecrets = loadWorldSecrets();
          const imprintedAbs = getImprintedAbilities();
          const grudges = getActiveGrudges();
          const timeEchoes = loadTimeEchoes();
          const fateChoices = loadFateChoices();
          const divineGaze = getDivineGazeStatus();
          const curseMasteries = getCurseMasteries();
          const prayerStatus = getPastPrayerStatus();
          const greatCycle = getGreatCycleStatus();
          const hasAny = relLegacies.length>0 || worldSecrets.length>0 || imprintedAbs.length>0 || grudges.length>0 || timeEchoes.length>0 || fateChoices.length>0 || divineGaze || curseMasteries.length>0 || prayerStatus || greatCycle;
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom:16, padding:"12px 14px", background:"rgba(20,20,60,0.35)", border:"1px solid #3a2a7a" }}>
              <div style={{ fontSize:9, color:"#9a8aee", letterSpacing:2, marginBottom:10, fontFamily:"'Cinzel',serif" }}>🌠 운명의 각인 (21~30번 시스템)</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {greatCycle && (
                  <div style={{ fontSize:9, color:"#ffd700", fontFamily:"'Cinzel',serif", padding:"5px 8px", background:"rgba(60,40,0,0.5)", border:"1px solid #8a6a00" }}>
                    ⚙️ {greatCycle.greatCycles}대순환 달성 — {greatCycle.unlockedRewards[greatCycle.greatCycles-1] || ""}
                  </div>
                )}
                {divineGaze && (
                  <div style={{ fontSize:9, color:"#e0e0ff", fontFamily:"'Cinzel',serif" }}>
                    {divineGaze.icon} {divineGaze.label} — {divineGaze.desc}
                  </div>
                )}
                {imprintedAbs.length > 0 && (
                  <div style={{ fontSize:9, color:"#a0ffcc", fontFamily:"'Cinzel',serif" }}>
                    ⚡ 능력 각인: {imprintedAbs.map(a => { const def = ABILITY_IMPRINT_LABELS[a.statId]; return def ? `${def.name}(T${a.tier})` : a.statId; }).join(" · ")}
                  </div>
                )}
                {relLegacies.length > 0 && (
                  <div style={{ fontSize:9, color:"#ffb0d0", fontFamily:"'Cinzel',serif" }}>
                    💞 관계 유산: {relLegacies.map(r => `${r.npcName}(${r.bond})`).join(" · ")}
                  </div>
                )}
                {curseMasteries.length > 0 && (
                  <div style={{ fontSize:9, color:"#c080ff", fontFamily:"'Cinzel',serif" }}>
                    🌑 저주 숙달: {curseMasteries.map(c => { const def = CURSE_TYPE_DEFS[c.type]; return def ? def.name : c.type; }).join(" · ")}
                  </div>
                )}
                {grudges.length > 0 && (
                  <div style={{ fontSize:9, color:"#ff8080", fontFamily:"'Cinzel',serif" }}>
                    💀 원한 추적자: {grudges.map(g => `${g.name}(위협도${g.power})`).join(" · ")}
                  </div>
                )}
                {worldSecrets.length > 0 && (
                  <div style={{ fontSize:9, color:"#80d0ff", fontFamily:"'Cinzel',serif" }}>
                    🔍 세계 비밀 {worldSecrets.length}개 기억중
                  </div>
                )}
                {timeEchoes.length > 0 && (
                  <div style={{ fontSize:9, color:"#d0d0ff", fontFamily:"'Crimson Text',serif", fontStyle:"italic" }}>
                    🔔 "{timeEchoes[timeEchoes.length-1]?.text?.slice(0,30)}..."
                  </div>
                )}
                {prayerStatus && (
                  <div style={{ fontSize:9, color:"#ffd0a0", fontFamily:"'Cinzel',serif" }}>
                    🙏 전생의 기도: {prayerStatus.power} 수준 / 누적 {prayerStatus.total}회 / {prayerStatus.available ? "사용 가능" : "이번 회차 소진"}
                  </div>
                )}
                {fateChoices.filter(c=>c.outcome!=="neutral").length > 0 && (
                  <div style={{ fontSize:9, color:"#c0ffc0", fontFamily:"'Cinzel',serif" }}>
                    🔀 운명 선택 기록 {fateChoices.filter(c=>c.outcome!=="neutral").length}개
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── 시스템 31~40 누적 정보 패널 ── */}
        {(() => {
          const cycle = loadCycleCount();
          if (cycle < 1) return null;
          const parallelSelf = getParallelSelfEncounter();
          const curseRings = getActiveCurseRings();
          const stats = getCycleStatsSummary();
          const injuryEffects = getInjuryEffects();
          const pastTheme = getPastTheme();
          const memDistort = getMemoryDistortStatus();
          const ageParadox = getAgeParadoxBonus();
          const summonLegacies = getSummonLegacies();
          const grudgeWeapons = getGrudgeWeapons();
          const worldTree = getWorldTreeStatus();
          const hasAny = parallelSelf || curseRings.length>0 || stats.totalDeaths>0 || injuryEffects.length>0 || pastTheme || memDistort || ageParadox || summonLegacies.length>0 || grudgeWeapons.length>0 || worldTree.level>0;
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom:16, padding:"12px 14px", background:"rgba(10,40,20,0.35)", border:"1px solid #1a4a2a" }}>
              <div style={{ fontSize:9, color:"#6aee9a", letterSpacing:2, marginBottom:10, fontFamily:"'Cinzel',serif" }}>🌱 세계의 흔적 (31~40번 시스템)</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {worldTree.level > 0 && (
                  <div style={{ fontSize:9, color:"#80ff80", fontFamily:"'Cinzel',serif", padding:"5px 8px", background:"rgba(0,60,0,0.4)", border:"1px solid #1a6a1a" }}>
                    {worldTree.stage.icon} 세계수 Lv.{worldTree.level} — {worldTree.stage.label}
                  </div>
                )}
                {pastTheme && (
                  <div style={{ fontSize:9, fontFamily:"'Crimson Text',serif", fontStyle:"italic", color:pastTheme.color||"#c0c0ff", padding:"4px 8px", background:"rgba(20,20,40,0.4)", border:"1px solid #2a2a5a" }}>
                    {pastTheme.icon} {pastTheme.label} — {pastTheme.openingLine}
                  </div>
                )}
                {ageParadox && (
                  <div style={{ fontSize:9, color:ageParadox.color||"#ffd0a0", fontFamily:"'Cinzel',serif" }}>
                    {ageParadox.icon} 나이의 역설: {ageParadox.label} — {ageParadox.bonusDesc}
                  </div>
                )}
                {injuryEffects.length > 0 && (
                  <div style={{ fontSize:9, color:"#ff9090", fontFamily:"'Cinzel',serif" }}>
                    🩹 부상 흔적: {injuryEffects.map(i => `${i.icon}${i.label}(${i.isStrength?"강점":"약점"})`).join(" · ")}
                  </div>
                )}
                {memDistort && memDistort.distortionLevel > 20 && (
                  <div style={{ fontSize:9, color:"#c0a0ff", fontFamily:"'Cinzel',serif" }}>
                    🌫️ 기억 왜곡: {memDistort.accuracy} ({memDistort.distortionLevel}%)
                  </div>
                )}
                {parallelSelf && (
                  <div style={{ fontSize:9, color:"#80e0ff", fontFamily:"'Cinzel',serif" }}>
                    🌀 평행 자아: {parallelSelf.name}({parallelSelf.role}){parallelSelf.keySkill ? ` — ${parallelSelf.keySkill}` : ""}
                  </div>
                )}
                {curseRings.length > 0 && (
                  <div style={{ fontSize:9, color:"#ff8040", fontFamily:"'Cinzel',serif" }}>
                    🔗 저주의 고리: {curseRings.map(r => `${r.icon}${r.label}(Lv.${r.penaltyLevel})`).join(" · ")}
                  </div>
                )}
                {summonLegacies.length > 0 && (
                  <div style={{ fontSize:9, color:"#a0ffcc", fontFamily:"'Cinzel',serif" }}>
                    🐾 소환수 유산: {summonLegacies.map(s => `${s.name}(유대${s.bond})`).join(" · ")}
                  </div>
                )}
                {grudgeWeapons.length > 0 && (
                  <div style={{ fontSize:9, color:"#ffaaaa", fontFamily:"'Cinzel',serif" }}>
                    ⚔️ 원한 무기: {grudgeWeapons.map(w => `${w.weaponName}(Lv.${w.power})`).join(" · ")}
                  </div>
                )}
                {stats.totalDeaths > 0 && (
                  <div style={{ fontSize:9, color:"#aaaaaa", fontFamily:"'Cinzel',serif" }}>
                    📊 누적 {stats.totalDeaths}사 / {stats.totalTurns}턴{stats.topEnemy ? ` / 숙적: ${stats.topEnemy.name}` : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── 시스템 41~50 누적 정보 패널 ── */}
        {(() => {
          const cycle = loadCycleCount();
          if (cycle < 1) return null;
          const dreams = getDreamProphecies();
          const buildings = getLegacyBuildings();
          const watchers = getWatchers();
          const masks = getSoulMasks();
          const ripples = getEmotionRipples();
          const testaments = getTestaments();
          const constellation = getConstellation();
          const explorerMap = getExplorerMap();
          const imprints = getLightningImprints();
          const dawn = getDawnStatus();
          const hasAny = dreams.length>0 || buildings.length>0 || watchers.length>0 || masks.length>0 || ripples.length>0 || testaments.length>0 || constellation || explorerMap.length>0 || imprints.length>0 || dawn.stage>0;
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom:16, padding:"12px 14px", background:"rgba(10,20,40,0.35)", border:"1px solid #1a2a4a" }}>
              <div style={{ fontSize:9, color:"#6ab4ee", letterSpacing:2, marginBottom:10, fontFamily:"'Cinzel',serif" }}>✨ 운명의 각인 (41~50번 시스템)</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {dawn.stage > 0 && (
                  <div style={{ fontSize:9, color:dawn.stageData.color||"#c8a96e", fontFamily:"'Cinzel',serif", padding:"5px 8px", background:"rgba(30,20,0,0.5)", border:"1px solid #4a3a1a" }}>
                    {dawn.stageData.icon} 전생의 일출 — {dawn.stageData.label}
                  </div>
                )}
                {constellation && (
                  <div style={{ fontSize:9, color:"#c0d0ff", fontFamily:"'Cinzel',serif" }}>
                    {constellation.icon} {constellation.name}({constellation.trait}) — {constellation.bonus.slice(0,30)}...
                  </div>
                )}
                {imprints.length > 0 && (
                  <div style={{ fontSize:9, color:"#ffe080", fontFamily:"'Cinzel',serif" }}>
                    ⚡ 번개 각인: {imprints.map(i => `${i.icon}${i.label}(Lv.${i.power})`).join(" · ")}
                  </div>
                )}
                {dreams.length > 0 && (
                  <div style={{ fontSize:9, color:"#b0b0ff", fontFamily:"'Cinzel',serif", fontStyle:"italic" }}>
                    🌙 예언의 꿈: {dreams.map(d => `${d.icon}${d.keyword}(${d.count}회)`).join(" · ")}
                  </div>
                )}
                {ripples.length > 0 && (
                  <div style={{ fontSize:9, color:"#80e0c0", fontFamily:"'Cinzel',serif" }}>
                    🌊 감정 파문: {ripples.map(r => `${r.icon}${r.label}(강도${r.intensity})`).join(" · ")}
                  </div>
                )}
                {watchers.length > 0 && (
                  <div style={{ fontSize:9, color:"#ff8080", fontFamily:"'Cinzel',serif" }}>
                    👁️ 감시자: {watchers.map(w => `${w.name}(Lv.${w.power}${w.evolved?"★":""})`).join(" · ")}
                  </div>
                )}
                {masks.length > 0 && (
                  <div style={{ fontSize:9, color:"#e0c0ff", fontFamily:"'Cinzel',serif" }}>
                    🎭 영혼의 가면: {masks.map(m => `${m.icon}${m.masquerade}(숙련${m.mastery})`).join(" · ")}
                  </div>
                )}
                {buildings.length > 0 && (
                  <div style={{ fontSize:9, color:"#c0d0a0", fontFamily:"'Cinzel',serif" }}>
                    🏛️ 유산 건축: {buildings.map(b => `${b.icon}${b.name}`).join(" · ")}
                  </div>
                )}
                {explorerMap.length > 0 && (
                  <div style={{ fontSize:9, color:"#a0c0e0", fontFamily:"'Cinzel',serif" }}>
                    🗺️ 탐험 유산: {explorerMap.map(l => `${l.icon}${l.label}`).join(" · ")}
                  </div>
                )}
                {testaments.length > 0 && (
                  <div style={{ fontSize:9, color:"#e0e0a0", fontFamily:"'Cinzel',serif", fontStyle:"italic" }}>
                    📜 유언장 {testaments.length}건 세계에 존재
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div style={{ marginBottom:16, padding:"10px 14px", background:"rgba(100,60,160,0.08)", border:"1px solid #2a1a4a" }}>
          <div style={{ fontSize:9, color:"#6a4a8a", letterSpacing:2, marginBottom:8, fontFamily:"'Cinzel',serif" }}>🌍 환생할 세계</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {SCENARIOS.map(sc => (
              <button key={sc.id} onClick={() => setScenario(sc)}
                style={{ padding:"5px 10px", background: scenario?.id===sc.id ? "linear-gradient(135deg,#1a0a2a,#2a1040)" : "transparent", border:`1px solid ${scenario?.id===sc.id ? "#8a6aaa" : "#2a1a4a"}`, color: scenario?.id===sc.id ? "#c8a0ff" : "#5a3a8a", fontFamily:"'Cinzel',serif", fontSize:9, cursor:"pointer" }}>
                {sc.icon} {sc.era}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onSkip} style={{ flex:1, padding:"12px", background:"transparent", border:"1px solid #2a1a4a", color:"#4a3a6a", fontFamily:"'Cinzel',serif", fontSize:10, cursor:"pointer" }}>전생 없이 시작</button>
          <button onClick={() => scenario ? setScreen("setup") : null} style={{ flex:2, padding:"12px", background: scenario ? "linear-gradient(135deg,#3a1060,#6a20a0)" : "#1a0a2a", border:"1px solid #8a6aaa", color: scenario ? "#ffd0ff" : "#3a2a5a", fontFamily:"'Cinzel',serif", fontSize:11, cursor: scenario ? "pointer" : "not-allowed" }}>✨ 환생하기</button>
        </div>
      </div>
    </div>
  );
}

function ScenarioScreen({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [customDesc, setCustomDesc] = useState("");
  const handleSelect = (sc) => {
    setSelected(sc);
    if (sc.id !== "custom") setCustomDesc("");
  };
  const handleConfirm = () => {
    if (!selected) return;
    if (selected.id === "custom" && customDesc.trim()) {
      onSelect({ ...selected, era: "나만의 세계", desc: customDesc.trim(), customWorldSetting: customDesc.trim() });
    } else {
      onSelect(selected);
    }
  };
  return (
    <div style={{ flex:1, background:"linear-gradient(160deg, #0a0500 0%, #150d03 40%, #0a0500 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:480, animation:"fadeIn 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:11, color:"#8a7a5a", letterSpacing:4, marginBottom:8 }}>── ✦ ──</div>
          <h1 style={{ fontSize:28, color:"#c8a96e", margin:0, letterSpacing:3, fontFamily:"'Cinzel',serif", animation:"flicker 3s infinite" }}>TALE FORGE</h1>
          <div style={{ fontSize:10, color:"#6a5a3a", letterSpacing:4, marginTop:6, fontFamily:"'Cinzel',serif" }}>세계를 선택하라</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {SCENARIOS.map((sc) => (
            <button key={sc.id} onClick={() => handleSelect(sc)}
              style={{ textAlign:"left", padding:"14px 16px", background: selected?.id===sc.id ? sc.bg : "linear-gradient(135deg, #0f0a02, #1a1005)", border: `2px solid ${selected?.id===sc.id ? sc.accent : "#2a1a05"}`, color:"#c8a96e", cursor:"pointer", transition:"all 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                <span style={{ fontSize:22 }}>{sc.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:13, color: selected?.id===sc.id ? sc.accent : "#c8a96e" }}>{sc.title}</span>
                    <span style={{ fontSize:9, color:"#6a5a3a", fontFamily:"'Cinzel',serif", background:"#1a1005", border:`1px solid ${selected?.id===sc.id?sc.accent:"#3a2a0a"}`, padding:"1px 5px" }}>{sc.era}</span>
                  </div>
                </div>
                {selected?.id===sc.id && <span style={{ fontSize:14, color:sc.accent }}>✓</span>}
              </div>
              <div style={{ fontSize:13, color: selected?.id===sc.id ? "#e8d5a0" : "#8a7a5a", fontFamily:"'Crimson Text',serif", lineHeight:1.5, marginLeft:32 }}>{sc.desc}</div>
            </button>
          ))}
        </div>
        {/* 12번 수정: 커스텀 시나리오 자유 입력 폼 */}
        {selected?.id === "custom" && (
          <div style={{ marginBottom:16, padding:"12px 14px", background:"linear-gradient(135deg,#0f0a02,#1a1005)", border:"1px solid #c8a96e", display:"flex", flexDirection:"column", gap:8, animation:"fadeIn 0.3s ease" }}>
            <div style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif", letterSpacing:1.5 }}>✨ 나만의 세계관 설정</div>
            <div style={{ fontSize:9, color:"#6a5a3a", fontFamily:"'Crimson Text',serif" }}>아래에 세계관 배경을 자유롭게 작성하세요. AI가 이 설정을 바탕으로 서사를 전개합니다.</div>
            <textarea
              rows={5}
              value={customDesc}
              onChange={e => setCustomDesc(e.target.value)}
              placeholder={"예시:\n• 마법이 금지된 증기기관 시대. 지하 조직들이 몰래 마법을 연구한다.\n• 신들이 죽고 300년이 흐른 세계. 신전은 텅 비었고 기적은 사라졌다.\n• 현대 도쿄, 빌딩 뒤에 요괴가 숨어사는 세계."}
              style={{ background:"#0a0500", border:"1px solid #5a3e1a", color:"#e8d5a0", fontFamily:"'Crimson Text',serif", fontSize:14, padding:"10px 12px", lineHeight:1.65, resize:"none" }}
            />
            <div style={{ fontSize:8, color:"#4a3a2a", fontFamily:"'Cinzel',serif" }}>{customDesc.length}자 · 직접 입력하지 않으면 기본 설정으로 시작됩니다.</div>
          </div>
        )}
        <button onClick={handleConfirm} disabled={!selected}
          style={{ width:"100%", padding:"15px 10px", background: selected ? "linear-gradient(135deg, #8b0000, #c0392b)" : "#1a1208", border:`1px solid ${selected ? selected.accent : "#3a2a0a"}`, color: selected ? "#ffd700" : "#5a4a2a", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:2, cursor: selected ? "pointer" : "not-allowed" }}>
          {selected ? `⚔ ${selected.title} — 캐릭터 생성` : "세계를 먼저 선택하라"}
        </button>
      </div>
    </div>
  );
}

const LOCAL_NAMES = {
  default: ["아르카나","제이크","루시아","카엘","세라핀"],
  medieval: ["가웨인","아이리스","다리우스","엘레나","레오나르드"],
  wuxia: ["청운","혈랑","백호","무극","천수"],
  cyberpunk: ["렉스","글리치","사이퍼","노이즈","크롬"]
};
const LOCAL_PERSONALITIES = ["차갑고 냉소적이지만 내면 깊은 곳에 의리가 있다.", "겉으로는 밝고 유쾌하지만 혼자일 때는 깊은 고독에 잠긴다.", "말수가 적고 감정을 잘 드러내지 않지만 행동으로 마음을 전한다.", "직설적이고 거침없어 주변 사람을 당황하게 하지만 솔직한 진심이 있다.", "논리적이고 냉정하게 보이지만 정작 감정에 약한 순간들이 있다."];
const getLocalNames = (scenario) => { const pool = LOCAL_NAMES[scenario?.id] || LOCAL_NAMES.default; return [...pool].sort(() => Math.random() - 0.5).slice(0, 5); };

function SetupScreen({ onStart, scenario }) {
  const [char, setChar] = useState({ name:"", race:"", role:"", personality:"", background:"", speechStyle:"" });
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("suggest");
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [jobSkillLoading, setJobSkillLoading] = useState(false);
  const [jobSkillDone, setJobSkillDone] = useState(false);
  const [jobSkillCount, setJobSkillCount] = useState(0);

  const era = scenario ? scenario.era : "RPG";

  const fields = [
    { key:"name", label:"캐릭터 이름", placeholder:"이름 입력", icon:"📜", multi:false, local:true },
    { key:"race", label:"종족", placeholder:"종족 선택", icon:"🌍", multi:false, local:true, isRace:true },
    { key:"role", label:"직업 / 역할", placeholder:"직업 입력", icon:"⚔️", multi:false,
      prompt: (c) => `${era} 세계관에서 ${c.race ? `"${c.race}" 종족` : ""} "${c.name}"에 어울리는 직업 5가지. JSON: {"items":["직업1","직업2","직업3","직업4","직업5"]}` },
    { key:"personality", label:"성격", placeholder:"성격 입력", icon:"🎭", multi:true, local:true },
    { key:"background", label:"배경 스토리", placeholder:"배경 입력", icon:"📖", multi:true,
      prompt: (c) => `${era} 세계관 "${c.name}"(${c.race||""} ${c.role}) 배경 스토리 5가지. JSON: {"items":["스토리1","스토리2","스토리3","스토리4","스토리5"]}` },
    { key:"speechStyle", label:"말투 스타일", placeholder:"말투 입력", icon:"💬", multi:true,
      prompt: (c) => `${era} 세계관 "${c.name}"(${c.race||""} ${c.role}) 말투 5가지. JSON: {"items":["말투1","말투2","말투3","말투4","말투5"]}` },
  ];

  const cur = fields[step];
  const isLast = step === fields.length - 1;
  const allFilled = fields.every(f => char[f.key].trim());

  // ── 직업 전용 스킬 AI 생성 ──────────────────────────────────────
  const generateJobSkills = async (roleName) => {
    setJobSkillLoading(true); setJobSkillDone(false); setJobSkillCount(0);
    const apiKey = loadApiKeys()[loadKeyIndex()] || "";
    const scenarioId = scenario?.id || "custom";
    const prompt = `당신은 RPG 스킬 디자이너입니다.
세계관: ${era}
직업: "${roleName}"

이 직업에 특화된 스킬을 정확히 60개 생성하세요. 능동 스킬(active) 30개, 패시브 스킬(passive) 20개, 이벤트 스킬(event) 10개.

각 스킬은 아래 JSON 배열 형식으로만 출력하세요. 설명 없이 JSON만.

필드 설명:
- id: "job_영문소문자_숫자" 형식 (예: job_slash_01)
- type: "active" | "passive" | "event"
- name: 한국어 스킬명
- icon: 이모지 1개
- rarity: "common" | "uncommon" | "rare" | "legendary"
- mpCost: 능동 스킬 MP 소모 (0~50), 패시브/이벤트는 0
- hpCost: HP 소모 (선택, 보통 0)
- hpRestore: HP 회복량 (선택)
- req: 필요 스탯 조건 객체 (예: {"str":30,"agi":20}), 없으면 {}
- desc: 스킬 설명 (한국어, 1~2문장)
- aiHint: AI 서사 힌트 (한국어, 이 스킬 사용 시 AI가 어떻게 묘사할지)
- condition: 패시브/이벤트 발동 조건 문자열 (능동은 null)
- conditionDesc: 조건 설명 (한국어)
- statBoost: 패시브 발동 시 스탯 증가 객체 (선택)
- scenario: "${scenarioId}" 또는 null
- jobRole: "${roleName}"

JSON 배열만 출력:
[{"id":"job_...","type":"active","name":"...","icon":"...","rarity":"common","mpCost":10,"hpCost":0,"hpRestore":0,"req":{},"desc":"...","aiHint":"...","condition":null,"conditionDesc":null,"statBoost":{},"scenario":${JSON.stringify(scenarioId)},"jobRole":${JSON.stringify(roleName)}}, ...]`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text: prompt }] }], generationConfig:{ temperature:1.0, maxOutputTokens:8192 } })
      });
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g,"").trim();
      // JSON 배열 추출
      const arrMatch = clean.match(/\[[\s\S]*\]/);
      if (!arrMatch) throw new Error("JSON parse fail");
      const parsed = JSON.parse(arrMatch[0]);
      // 유효한 스킬만 필터
      const valid = parsed.filter(s => s.id && s.type && s.name && s.icon);
      // 기존 직업 스킬 교체 저장
      saveJobSkills(valid);
      setJobSkillCount(valid.length);
      setJobSkillDone(true);
    } catch(e) {
      // 실패해도 게임은 진행 — 빈 배열 저장
      saveJobSkills([]);
      setJobSkillDone(true);
      setJobSkillCount(0);
    }
    setJobSkillLoading(false);
  };

  const fetchSuggestions = async () => {
    if (cur.local) {
      if (cur.key === "name") setLocalSuggestions(getLocalNames(scenario));
      else if (cur.key === "race") setLocalSuggestions(RACE_DEFS.map(r => r.name));
      else setLocalSuggestions([...LOCAL_PERSONALITIES].sort(() => Math.random() - 0.5).slice(0, 5));
      setCustomInput(""); return;
    }
    setSugLoading(true); setSuggestions([]);
    try {
      const apiKey = loadApiKeys()[loadKeyIndex()] || "";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text:cur.prompt(char) }] }], generationConfig:{ temperature:1.1, maxOutputTokens:400 } })
      });
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setSuggestions((parsed.items || []).slice(0, 5));
    } catch { setSuggestions([]); }
    setSugLoading(false);
  };

  useEffect(() => { setLocalSuggestions([]); setCustomInput(""); if (mode === "suggest") fetchSuggestions(); }, [step, mode]);
  const pickSuggestion = (val) => setChar(c => ({ ...c, [cur.key]: val }));

  const goNext = () => {
    if (!char[cur.key].trim()) return;
    // 종족 선택 완료 시 → 종족 스킬 저장
    if (cur.key === "race" && char.race.trim()) {
      const raceDef = RACE_DEFS.find(r => r.name === char.race);
      if (raceDef) {
        saveRace({ id: raceDef.id, name: raceDef.name, icon: raceDef.icon, statBonus: raceDef.statBonus, statPenalty: raceDef.statPenalty });
        // 종족 전용 스킬을 jobSkills에 병합 저장
        const existing = loadJobSkills().filter(s => !s.id?.startsWith("race_"));
        saveJobSkills([...existing, ...raceDef.skills]);
      }
    }
    // 직업 선택 완료 시 → 스킬 자동 생성
    if (cur.key === "role" && char.role.trim() && !jobSkillLoading && !jobSkillDone) {
      generateJobSkills(char.role.trim());
    }
    setSuggestions([]); setMode("suggest"); setStep(s => s + 1);
  };

  const goPrev = () => { setSuggestions([]); setMode("suggest"); setStep(s => s - 1); };

  return (
    <div style={{ flex:1, background:"linear-gradient(160deg, #0a0500 0%, #150d03 40%, #0a0500 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:480, animation:"fadeIn 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:11, color:"#8a7a5a", letterSpacing:4, marginBottom:8 }}>── ✦ ──</div>
          <h1 style={{ fontSize:28, color:"#c8a96e", margin:0, letterSpacing:3, fontFamily:"'Cinzel',serif", animation:"flicker 3s infinite" }}>캐릭터 생성</h1>
        </div>

        {/* 직업 스킬 생성 상태 표시 */}
        {(jobSkillLoading || jobSkillDone) && (
          <div style={{ marginBottom:12, padding:"8px 12px", background: jobSkillDone ? "rgba(40,80,40,0.3)" : "rgba(80,50,150,0.2)", border:`1px solid ${jobSkillDone ? "#3a7a3a" : "#5a3a9a"}`, display:"flex", alignItems:"center", gap:8 }}>
            {jobSkillLoading ? (
              <>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#8a5ae0", animation:"pulse 1s infinite", flexShrink:0 }} />
                <span style={{ fontSize:10, color:"#9a7ae0", fontFamily:"'Cinzel',serif", letterSpacing:1 }}>⚔️ {char.role} 전용 스킬 생성 중...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize:12 }}>✅</span>
                <span style={{ fontSize:10, color:"#7aba7a", fontFamily:"'Cinzel',serif", letterSpacing:1 }}>직업 스킬 {jobSkillCount}개 생성 완료!</span>
              </>
            )}
          </div>
        )}

        <PixelBorder>
          <div style={{ padding:"20px 18px" }}>
            <div style={{ display:"flex", gap:6, marginBottom:20, justifyContent:"center" }}>
              {fields.map((_,i) => <div key={i} style={{ width:i===step?28:8, height:8, background:i<step?"#c8a96e":i===step?"#ffd700":"#3a2a0a", transition:"all 0.3s" }} />)}
            </div>
            <div style={{ marginBottom:10, fontSize:11, color:"#8a7a5a", letterSpacing:2, fontFamily:"'Cinzel',serif" }}>{cur.icon} {cur.label.toUpperCase()}</div>

            {!cur.local && (
              <div style={{ display:"flex", marginBottom:12, border:"1px solid #3a2a0a" }}>
                <button onClick={() => setMode("suggest")} style={{ flex:1, padding:"8px 0", background:mode==="suggest"?"linear-gradient(135deg,#2a1f0d,#3a2a10)":"transparent", border:"none", borderRight:"1px solid #3a2a0a", color:mode==="suggest"?"#c8a96e":"#5a4a2a", fontFamily:"'Cinzel',serif", fontSize:10, cursor:"pointer" }}>✦ AI 추천</button>
                <button onClick={() => setMode("type")} style={{ flex:1, padding:"8px 0", background:mode==="type"?"linear-gradient(135deg,#2a1f0d,#3a2a10)":"transparent", border:"none", color:mode==="type"?"#c8a96e":"#5a4a2a", fontFamily:"'Cinzel',serif", fontSize:10, cursor:"pointer" }}>✍ 직접 입력</button>
              </div>
            )}

            {cur.local && !cur.isRace && (
              <div>
                {/* 9번: 직업 선택 시 각성 클래스 표시 */}
                {cur.key === "role" && getUnlockedAwakenedJobs().length > 0 && (
                  <div style={{ marginBottom:10, padding:"8px 10px", background:"rgba(80,20,120,0.2)", border:"1px solid #5a2a8a" }}>
                    <div style={{ fontSize:9, color:"#e0a0ff", fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:6 }}>✦ 각성 클래스 해금 ({loadCycleCount()}회차)</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {getUnlockedAwakenedJobs().map(job => (
                        <button key={job.id} onClick={() => { setChar(c => ({...c, role: job.name})); setCustomInput(job.name); }}
                          style={{ textAlign:"left", padding:"7px 10px", background: char.role===job.name ? "linear-gradient(135deg,#2a0a4a,#3a1060)" : "rgba(40,10,60,0.5)", border:`1px solid ${char.role===job.name ? "#c8a0ff" : "#5a2a8a"}`, color: char.role===job.name ? "#ffd0ff" : "#a06ae0", fontFamily:"'Cinzel',serif", fontSize:10, cursor:"pointer" }}>
                          {job.icon} {job.name} <span style={{ fontSize:8, color:"#6a4a8a" }}>— {job.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* ── 숨겨진 직업 탭 ── */}
                {cur.key === "role" && (() => {
                  const hiddenJobs = getUnlockedHiddenJobs();
                  if (hiddenJobs.length === 0) return null;
                  const [showHidden, setShowHidden] = React.useState(false);
                  const rarityColor = { legendary:"#ffd700", rare:"#c08aff" };
                  const typeLabel  = { awakening:"각성", evolution:"진화", secret:"발견" };
                  const typeColor  = { awakening:"#e07a7a", evolution:"#7a9ae0", secret:"#7adfaa" };
                  return (
                    <div style={{ marginBottom:10 }}>
                      <button onClick={() => setShowHidden(h => !h)}
                        style={{ width:"100%", padding:"9px 12px", background:"linear-gradient(135deg,#1a0a00,#2a1500)", border:"1px solid #c8a020", color:"#ffd700", fontFamily:"'Cinzel',serif", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span>🔓 숨겨진 직업 — {hiddenJobs.length}개 해금</span>
                        <span style={{ fontSize:8, color:"#a08030" }}>{showHidden ? "▲ 접기" : "▼ 펼치기"}</span>
                      </button>
                      {showHidden && (
                        <div style={{ background:"rgba(25,12,0,0.97)", border:"1px solid #c8a020", borderTop:"none", padding:"10px 8px", display:"flex", flexDirection:"column", gap:6 }}>
                          {hiddenJobs.map(job => {
                            const isSelected = char.role === job.name;
                            return (
                              <button key={job.id} onClick={() => { setChar(c => ({...c, role: job.name})); setCustomInput(job.name); }}
                                style={{ textAlign:"left", padding:"10px 12px", background: isSelected ? "linear-gradient(135deg,#2a1a00,#3a2500)" : "rgba(20,10,0,0.8)", border:`2px solid ${isSelected ? "#ffd700" : (rarityColor[job.rarity]||"#c8a020")+"88"}`, cursor:"pointer" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                                  <span style={{ fontSize:15 }}>{job.icon}</span>
                                  <span style={{ fontSize:11, color: rarityColor[job.rarity]||"#ffd700", fontFamily:"'Cinzel',serif", fontWeight:"bold" }}>{job.name}</span>
                                  <span style={{ fontSize:7, color: typeColor[job.type]||"#aaa", background:"rgba(0,0,0,0.5)", padding:"1px 5px", border:`1px solid ${typeColor[job.type]||"#aaa"}55`, fontFamily:"'Cinzel',serif" }}>{typeLabel[job.type]||"비전"}</span>
                                  {isSelected && <span style={{ marginLeft:"auto", fontSize:10, color:"#ffd700" }}>✓ 선택</span>}
                                </div>
                                <div style={{ fontSize:10, color:"#c8a060", fontFamily:"'Crimson Text',serif", lineHeight:1.4, marginLeft:21, marginBottom:2 }}>{job.desc}</div>
                                <div style={{ fontSize:8, color:"#7a6030", fontFamily:"'Crimson Text',serif", marginLeft:21, fontStyle:"italic", marginBottom:4 }}>"{job.lore}"</div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginLeft:21 }}>
                                  {Object.entries(job.bonus).map(([k,v]) => (
                                    <span key={k} style={{ fontSize:8, color: v > 0 ? "#7adf7a" : "#df7a7a", fontFamily:"'Cinzel',serif" }}>{k} {v>0?"+":""}{v}</span>
                                  ))}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:5, marginBottom:10 }}>
                  {localSuggestions.map((s, i) => (
                    <button key={i} onClick={() => { setChar(c => ({...c, [cur.key]: s})); setCustomInput(""); }} style={{ textAlign:"left", padding:"9px 11px", background: char[cur.key]===s ? "linear-gradient(135deg,#2a1f0a,#3a2a10)" : "linear-gradient(135deg,#1c1108,#0f0a02)", border:`1px solid ${char[cur.key]===s ? "#c8a96e" : "#3a2a0a"}`, color: char[cur.key]===s ? "#ffd700" : "#c8a96e", fontFamily:"'Crimson Text',serif", fontSize:13, cursor:"pointer" }}>{i+1}. {s}</button>
                  ))}
                </div>
                <input value={customInput} onChange={e => { setCustomInput(e.target.value); setChar(c => ({...c, [cur.key]: e.target.value})); }} placeholder={cur.placeholder} onKeyDown={e => e.key==="Enter" && !isLast && char[cur.key].trim() && goNext()} style={{ width:"100%", background:"#0f0a02", border:"1px dashed #5a3e1a", color:"#e8d5a0", fontFamily:"'Crimson Text',serif", fontSize:15, padding:"9px 10px" }} />
              </div>
            )}

            {cur.isRace && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {RACE_DEFS.map(race => {
                  const isSelected = char.race === race.name;
                  return (
                    <button key={race.id} onClick={() => setChar(c => ({...c, race: race.name}))}
                      style={{ textAlign:"left", padding:"11px 13px", background: isSelected ? `linear-gradient(135deg,${race.accent},#1a1208)` : "linear-gradient(135deg,#1c1108,#0f0a02)", border:`2px solid ${isSelected ? race.color : "#3a2a0a"}`, color: isSelected ? race.color : "#c8a96e", cursor:"pointer", transition:"all 0.2s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:18 }}>{race.icon}</span>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:12, color: isSelected ? race.color : "#c8a96e" }}>{race.name}</span>
                        {isSelected && <span style={{ marginLeft:"auto", fontSize:12, color: race.color }}>✓ 선택됨</span>}
                      </div>
                      <div style={{ fontSize:11, color: isSelected ? "#e8d5a0" : "#7a6a4a", fontFamily:"'Crimson Text',serif", lineHeight:1.5, marginLeft:26 }}>{race.desc}</div>
                      {isSelected && (
                        <div style={{ marginTop:8, padding:"7px 10px", background:"rgba(0,0,0,0.3)", border:`1px solid ${race.color}44` }}>
                          <div style={{ fontSize:9, color: race.color, fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:5 }}>✦ 종족 스탯 보너스</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 }}>
                            {Object.entries(race.statBonus).map(([k,v]) => {
                              const info = getStatInfo(k);
                              return <span key={k} style={{ fontSize:9, color:"#7adf7a", fontFamily:"'Cinzel',serif" }}>{info?.icon}{info?.name} +{v}</span>;
                            })}
                            {Object.entries(race.statPenalty||{}).map(([k,v]) => {
                              const info = getStatInfo(k);
                              return <span key={k} style={{ fontSize:9, color:"#df7a7a", fontFamily:"'Cinzel',serif" }}>{info?.icon}{info?.name} {v}</span>;
                            })}
                          </div>
                          <div style={{ fontSize:9, color:"#9a8a6a", fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:3 }}>종족 전용 스킬</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                            {race.skills.map(sk => (
                              <span key={sk.id} style={{ fontSize:9, color: SKILL_RARITY_COLOR[sk.rarity]||"#aaa", fontFamily:"'Cinzel',serif", background:"rgba(0,0,0,0.3)", padding:"2px 6px", border:`1px solid ${SKILL_RARITY_COLOR[sk.rarity]||"#555"}44` }}>{sk.icon} {sk.name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!cur.local && mode === "suggest" && (
              <div>
                {sugLoading ? <div style={{ textAlign:"center", padding:"16px", color:"#6a5a3a", fontSize:11 }}>생성 중...</div> : (
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => pickSuggestion(s)} style={{ textAlign:"left", padding:"10px 12px", background:char[cur.key]===s?"linear-gradient(135deg,#2a1f0a,#3a2a10)":"#0f0a02", border:`1px solid ${char[cur.key]===s?"#c8a96e":"#3a2a0a"}`, color:char[cur.key]===s?"#ffd700":"#c8a96e", fontFamily:"'Crimson Text',serif", fontSize:14, cursor:"pointer" }}>{i+1}. {s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!cur.local && mode === "type" && (
              <textarea rows={3} value={char[cur.key]} onChange={e => setChar({...char,[cur.key]:e.target.value})} placeholder={cur.placeholder} style={{ width:"100%", background:"#0f0a02", border:"1px solid #5a3e1a", color:"#e8d5a0", fontFamily:"'Crimson Text',serif", fontSize:16, padding:"12px" }} />
            )}

            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              {step > 0 && <button onClick={goPrev} style={{ flex:1, padding:"13px 10px", background:"transparent", border:"1px solid #5a3e1a", color:"#8a7a5a", fontFamily:"'Cinzel',serif", fontSize:11 }}>← 이전</button>}
              {!isLast ? <button onClick={goNext} style={{ flex:2, padding:"13px 10px", background:char[cur.key].trim()?"linear-gradient(135deg,#5a3e1a,#8a6030)":"#1a1208", border:"1px solid #c8a96e", color:char[cur.key].trim()?"#ffd700":"#5a4a2a", fontFamily:"'Cinzel',serif", fontSize:11 }}>다음 →</button>
                : <button onClick={() => allFilled && onStart(char)} style={{ flex:2, padding:"13px 10px", background:allFilled?"linear-gradient(135deg,#8b0000,#c0392b)":"#1a1208", border:"1px solid #c8a96e", color:allFilled?"#ffd700":"#5a4a2a", fontFamily:"'Cinzel',serif", fontSize:11 }}>⚔ 소환 시작</button>
              }
            </div>
          </div>
        </PixelBorder>
      </div>
    </div>
  );
}

function ChatApp({ apiKeys, character, onReset, onReincarnate, onKeyReset, pastLife }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [stats, setStats]           = useState(() => {
    const base = {};
    ALL_STAT_KEYS.forEach(k => base[k] = 50);
    const pastBonuses = character?.pastLifeStatBonuses || {};
    ALL_STAT_KEYS.forEach(k => { base[k] = Math.min(100, Math.max(0, base[k] + (pastBonuses[k]||0))); });
    
    // 종족 스탯 보너스/페널티 적용
    const savedRace = loadRace();
    if (savedRace?.statBonus) {
      Object.entries(savedRace.statBonus).forEach(([k,v]) => { if (base[k] !== undefined) base[k] = Math.min(100, base[k] + v); });
    }
    if (savedRace?.statPenalty) {
      Object.entries(savedRace.statPenalty).forEach(([k,v]) => { if (base[k] !== undefined) base[k] = Math.max(0, base[k] + v); });
    }

    const karmaScore = character?.pastLifeKarmaScore || 0;
    if (karmaScore >= 70) {
      const penalty = karmaScore >= 95
        ? { trst: -10, rep: -10, luk: -5, mad: +10, crse: +10 }
        : karmaScore >= 85
          ? { trst: -10, rep: -10, luk: -5 }
          : { trst: -5, rep: -5 };
      Object.entries(penalty).forEach(([k, v]) => {
        if (base[k] !== undefined) base[k] = Math.max(0, Math.min(100, base[k] + v));
      });
      const hpCap = karmaScore >= 95 ? 60 : karmaScore >= 85 ? 70 : null;
      if (hpCap) base.hp = Math.min(base.hp, hpCap);
    }
    // 6번: 영혼 각인 무기 보너스
    const soulWpn = loadSoulWeapon();
    if (soulWpn?.bonus) { Object.entries(soulWpn.bonus).forEach(([k,v]) => { if (base[k] !== undefined) base[k] = Math.min(100, base[k] + v); }); }
    // 3번: 업보/카르마 축복 (선행 보너스)
    const karmaEff = getKarmaEffect(character?.pastLifeKarmaScore || 50);
    if (karmaEff?.statBonus) { Object.entries(karmaEff.statBonus).forEach(([k,v]) => { if (base[k] !== undefined) base[k] = Math.min(100, base[k] + v); }); }
    // 9번: 각성 클래스 보너스
    const awakenedJob = AWAKENED_JOBS.find(j => j.name === character?.role);
    if (awakenedJob?.bonus) { Object.entries(awakenedJob.bonus).forEach(([k,v]) => { if (base[k] !== undefined) base[k] = Math.min(100, base[k] + v); }); }
    // 숨겨진 직업 보너스 적용
    const hiddenJob = HIDDEN_JOBS.find(j => j.name === character?.role);
    if (hiddenJob?.bonus) { Object.entries(hiddenJob.bonus).forEach(([k,v]) => { if (base[k] !== undefined) base[k] = Math.max(0, Math.min(100, base[k] + v)); }); }
    return applyTitleBonuses(base, loadTitles());
  });
  const [error, setError]           = useState("");
  const [choices, setChoices]       = useState([]);
  const [typingMode, setTypingMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [titles, setTitles]           = useState(() => loadTitles());
  const [gameOver, setGameOver]               = useState(null);
  const [emotion, setEmotion]                 = useState(() => loadEmotion());
  const [showStatsPanel, setShowStatsPanel]       = useState(false);
  const [summons, setSummons] = useState([]); // [{ id, name, icon, hp, maxHp, mp, maxMp, status }]
  const [showSummonPanel, setShowSummonPanel] = useState(false);

  // ── 11번 수정: 날씨/시간대 상태 ──
  const [atmosphere, setAtmosphereState] = useState(() => loadAtmosphere());
  const [showAtmospherePanel, setShowAtmospherePanel] = useState(false);

  // ── 10번 수정: NPC·퀘스트·세계관 편집 패널 ──
  const [showWorldPanel, setShowWorldPanel] = useState(false);
  const [worldNpcs, setWorldNpcs]   = useState(() => loadNPCs());
  const [worldQuests, setWorldQuests] = useState(() => loadQuests());
  const [worldNotes, setWorldNotes] = useState(() => loadWorldNotes());

  // ── 8번 수정: 핵심 기억 편집 ──
  const [showMemoryEditor, setShowMemoryEditor] = useState(false);

  // ── 몬스터 전투 시스템 ──
  const [monsters, setMonsters] = useState([]); // [{ id, name, icon, hp, maxHp, atk, def, skills, pattern, status, tier }]
  const [showMonsterPanel, setShowMonsterPanel] = useState(false);
  const [inCombat, setInCombat] = useState(false);
  const [combatLog, setCombatLog] = useState([]); // 전투 로그
  const [monsterActionLog, setMonsterActionLog] = useState(null); // 이번 턴 몬스터 행동
  const monstersRef = useRef([]);

  // ── 골드 & 인벤토리 시스템 ──
  const [gold, setGold]                       = useState(() => loadGold());
  const [inventory, setInventory]             = useState(() => loadInventory());
  const [showInventory, setShowInventory]     = useState(false);
  const [showShop, setShowShop]               = useState(false);
  const [showHighlights, setShowHighlights]   = useState(false);
  const [highlights, setHighlights]           = useState(() => loadHighlights());
  const [rewardToast, setRewardToast]         = useState(null); // { gold, exp, sp, items, tierLabel }
  const [playerExp, setPlayerExp]             = useState(() => loadPlayerExp());
  const [playerLevel, setPlayerLevel]         = useState(() => loadPlayerLevel());

  // ── 스킬 시스템 ──
  const [unlockedSkills, setUnlockedSkills]   = useState(() => loadSkills());
  const [skillSP, setSkillSP]                 = useState(() => loadSkillSP());
  const [showSkillPanel, setShowSkillPanel]   = useState(false);
  const [skillToast, setSkillToast]           = useState(null);
  const [activeSkillEffect, setActiveSkillEffect] = useState(null); // 이번 턴에 사용한 능동 스킬
  const [passiveProcs, setPassiveProcs]       = useState([]); // 이번 턴 발동된 패시브 목록
  const [passiveRerollUsed, setPassiveRerollUsed] = useState(false); // lucky 재롤 사용 여부
  const [passiveUndyingUsed, setPassiveUndyingUsed] = useState(false); // undying 사용 여부
  const [passiveSixthSenseUsed, setPassiveSixthSenseUsed] = useState(false); // sixth_sense 1회 제한
  // 패시브 임시 버프 추적 — { skillId: { statKey: amount, ... }, ... }
  // 매 턴 시작 시 이전 버프 원복 후 새 조건 충족 버프 적용
  const activePassiveBoostsRef = useRef({});

  // monstersRef 동기화
  useEffect(() => { monstersRef.current = monsters; }, [monsters]);

  // 전투 시작 시 몬스터 패널 자동 펼침
  useEffect(() => {
    if (inCombat && monsters.length > 0) setShowMonsterPanel(true);
  }, [inCombat, monsters.length]);

  const systemRef       = useRef("");
  const bottomRef       = useRef(null);
  const inputRef        = useRef(null);
  const msgCountRef     = useRef(0);

  const buildSystem = (char, currentTitles, memory, npcs, currentSummons, currentMonsters) => {
    // ════════════════════════════════════════════════════
    // 필터링 컨텍스트 — 종족·직업·시나리오·회차 기반
    // ════════════════════════════════════════════════════
    const _cycle   = loadCycleCount();
    const _race    = (char?.race  || "").toLowerCase();
    const _role    = (char?.role  || "");
    const _era     = (char?.scenario || "");

    // 시나리오 그룹 판별
    const isMedieval   = _era.includes("중세") || _era.includes("판타지") || _era.includes("medieval");
    const isWuxia      = _era.includes("무협") || _era.includes("강호")   || _era.includes("wuxia");
    const isCyberpunk  = _era.includes("사이버") || _era.includes("cyber");
    const isCustom     = _era.includes("나만의") || _era.includes("custom");
    const isAnyEra     = true; // 모든 세계관 공통

    // 종족 그룹 판별
    const isElf        = _race.includes("엘프") || _race.includes("elf");
    const isDwarf      = _race.includes("드워프") || _race.includes("dwarf");
    const isOrc        = _race.includes("오크") || _race.includes("orc");
    const isDarkling   = _race.includes("다크") || _race.includes("dark");
    const isCelestial  = _race.includes("천족") || _race.includes("celestial");
    const isHuman      = _race.includes("인간") || _race.includes("human") || (!isElf && !isDwarf && !isOrc && !isDarkling && !isCelestial && _race !== "");
    const isFantasyRace= isElf || isDwarf || isOrc || isDarkling || isCelestial;
    const hasMagicRace = isElf || isCelestial;

    // 직업 그룹 판별
    const isMagicRole  = /마법|마녀|마법사|소서|주술|마도/.test(_role);
    const isWarriorRole= /전사|기사|검사|무사|파이터/.test(_role);
    const isRogueRole  = /도적|암살|자객|도둑|레인저/.test(_role);
    const isLeaderRole = /왕|군주|장군|영주|리더|지도자/.test(_role);
    const isHealerRole = /성직|치료|사제|수도|힐러|신관/.test(_role);
    const isBardRole   = /음유|시인|바드|광대/.test(_role);
    const isSupportRole= isHealerRole || isBardRole;

    // 회차 단계 판별
    const isEarlyCycle  = _cycle >= 1  && _cycle <= 3;   // 초반
    const isMidCycle    = _cycle >= 4  && _cycle <= 9;   // 중반
    const isLateCycle   = _cycle >= 10 && _cycle <= 19;  // 후반
    const isHighCycle   = _cycle >= 20 && _cycle <= 49;  // 고회차
    const isVeryHigh    = _cycle >= 50;                   // 초고회차
    const isCenturyCycle= _cycle >= 100;                  // 100회차+

    // 섹션 포함 여부 결정 헬퍼 (조건 미충족 시 빈 문자열 반환)
    const when = (condition, sectionFn) => condition ? sectionFn() : "";

    const memSection = (memory?.core ? `\n[🔴 핵심 기억]\n${memory.core}` : "") + (memory?.mid ? `\n[🟡 최근 흐름]\n${memory.mid}` : "") + (memory?.pastLifeSummary ? `\n[✨ 전생의 흔적]\n${memory.pastLifeSummary}` : "");
    const majorList = (npcs || []).filter(n => n.type === "major").map(n => `  • ${n.name}(${n.role}) - ${n.personality}`).join("\n");
    const minorList = (npcs || []).filter(n => n.type === "minor" && n.active).map(n => `  · ${n.name}(${n.role})`).join("\n");
    const npcSection = (majorList || minorList) ? `\n[👥 등장 인물]\n${majorList}${minorList ? `\n${minorList}` : ""}` : "";
    // ── 11번 수정: 날씨/시간대 실제 반영 ──
    const atm = loadAtmosphere();
    const weatherLabels = { none:"설정 없음", clear:"맑음", cloudy:"흐림", rain:"비", storm:"폭풍", snow:"눈", fog:"안개", sandstorm:"모래폭풍", thunder:"천둥번개" };
    const timeLabels   = { none:"설정 없음", dawn:"새벽", morning:"아침", noon:"한낮", afternoon:"오후", evening:"저녁", night:"밤", midnight:"한밤중" };
    const weatherEffects = { rain:"시야가 제한되고 이동이 느려진다. 기민성 판정에 -10 페널티.", storm:"극도로 위험한 날씨. 모든 야외 행동에 -15 페널티. 이동 불가 수준.", snow:"지면이 미끄럽고 시야가 좁다. 체력 소모가 빠르다.", fog:"시야가 극도로 제한된다. 은신·잠입 판정에 +15 보너스.", sandstorm:"호흡 곤란, 시야 차단. 야외에서 모든 판정 -10.", thunder:"번개가 내리치는 위험. 금속 장비 착용자에게 추가 위험." };
    const timeEffects  = { dawn:"여명의 시간. NPC 대부분이 아직 잠들어 있다. 은신에 유리.", night:"어둠이 깔렸다. 은신·위장 판정 +10 보너스. 일부 NPC는 경계가 강화된다.", midnight:"한밤중. 대부분의 상점과 거점이 닫혀 있다. 야간 몬스터 출몰 확률 증가." };
    let atmosphereSection = "";
    if (atm.weather !== "none" || atm.timeOfDay !== "none") {
      const wLabel = weatherLabels[atm.weather] || atm.weather;
      const tLabel = timeLabels[atm.timeOfDay] || atm.timeOfDay;
      const wEffect = weatherEffects[atm.weather] || "";
      const tEffect = timeEffects[atm.timeOfDay] || "";
      atmosphereSection = `\n[🌤️ 현재 환경]\n날씨: ${wLabel}${wEffect ? ` — ${wEffect}` : ""}\n시간대: ${tLabel}${tEffect ? ` — ${tEffect}` : ""}\n서사에서 이 환경을 자연스럽게 묘사하고 판정에 반영하십시오.`;
    }
    const notesSection = loadWorldNotes().length ? `\n[🌍 세계관 설정]\n${loadWorldNotes().map(n=>`[${n.category}] ${n.title}: ${n.content}`).join("\n")}` : "";
    const summonSection = (currentSummons||[]).filter(s=>s.status==="active").length
      ? `\n[🔮 현재 소환수]\n${(currentSummons||[]).filter(s=>s.status==="active").map(s=>`  • ${s.name} (HP:${s.hp}/${s.maxHp})`).join("\n")}`
      : "";
    const monsterSection = (currentMonsters||[]).filter(m=>m.status==="alive").length
      ? `\n[👹 현재 전투 중인 적]\n${(currentMonsters||[]).filter(m=>m.status==="alive").map(m=>`  • ${m.icon}${m.name} (HP:${m.hp}/${m.maxHp} / ATK:${m.atk} / DEF:${m.def} / 등급:${m.tier})`).join("\n")}\n적이 살아있는 동안 전투 상황을 반드시 묘사하십시오.`
      : "";
    
    const karmaScore = char?.pastLifeKarmaScore || 0;
    let karmaSection = "";
    if (karmaScore >= 95) karmaSection = `\n[🔥 업보의 심판] 전생의 죄업으로 인해 현상수배, 저주 등이 발생하며 주변의 혐오를 받습니다.`;
    else if (karmaScore >= 85) karmaSection = `\n[💀 저주받은 영혼] 불운이 따르며 선의도 오해받기 쉽습니다.`;
    else if (karmaScore >= 70) karmaSection = `\n[🌑 어둠의 기억] 타인이 알 수 없는 경계심을 느낍니다.`;

    const ruleSection = `\n[시스템 규칙]\n1. 플레이어 행동 뒤에 전달되는 [주사위 굴림] 수치와 캐릭터의 관련 스탯을 고려하여 성공/실패를 결정하고 서사에 반영하십시오.\n2. 전투 피격, 마법 사용, 위험한 행동 시 반드시 서사적으로 HP나 MP가 소모됨을 묘사하십시오.\n3. 적이 살아있는 전투 중이라면 반드시 적의 반격/행동도 묘사하십시오.`;

    // ── 숨겨진 직업 시스템 힌트 ──
    const hiddenJobDef = HIDDEN_JOBS.find(j => j.name === char.role);
    const hiddenJobSection = hiddenJobDef ? `
[🔓 숨겨진 직업 — ${hiddenJobDef.icon}${hiddenJobDef.name}] ${hiddenJobDef.systemHint}` : "";

    // 1번: 전생 기억 파편 섹션
    const frags = loadMemoryFragments();
    const fragSection = frags.length > 0 ? `
[💭 전생 기억 파편]
${frags.slice(-3).map(f=>f.text).join("
")}` : "";
    // 2번: 전생 인연 (pastLife intimateNpcs)
    const intimateNpcs = (char.pastLifeIntimateNpcs || []);
    const intiSection = intimateNpcs.length > 0 ? `
[💞 전생 인연] 다음 NPC들은 이전 생에 깊은 인연이 있었습니다. 첫 만남이지만 왠지 모를 친근함을 느낍니다: ${intimateNpcs.join(", ")}` : "";
    // 8번: 명성 이월
    const fameLeg = loadFameLegacy();
    const fameSection = fameLeg && fameLeg.type !== "neutral" ? `
[${fameLeg.type==="hero"?"🌟":"💀"} 전생의 소문] 전생에서 ${fameLeg.characterName||"이 영혼"}의 소문이 퍼져있습니다. NPC들은 처음 만나도 ${fameLeg.type==="hero"?"호감":"두려움"}을 갖고 대합니다. (${fameLeg.label})` : "";
    // 6번: 영혼 각인 무기
    const soulWpn = loadSoulWeapon();
    const soulWpnSection = soulWpn ? `
[⚔️ 영혼 각인] 전생에서 가장 많이 쓰던 ${soulWpn.name}. ${soulWpn.desc}` : "";

    // 11번: 금지 스킬 해금 알림
    const forbiddenSkills11 = getUnlockedForbiddenSkills();
    const forbiddenSection = forbiddenSkills11.length > 0 ? `
[🔓 금지 스킬 해금] 특수 조건으로 해금된 금지 스킬이 있습니다: ${forbiddenSkills11.map(s=>`${s.icon}${s.name}(${s.desc})`).join(", ")}. 사용 시 강렬하게 묘사하십시오.` : "";

    // 12번: 나비효과
    const butterflies = loadButterfly();
    const butterflySection = butterflies.length > 0 ? `
[🦋 나비효과] 전생의 선택이 세계에 흔적을 남겼습니다:
${butterflies.map(b => BUTTERFLY_EFFECTS[b.type]?.aiHint?.(b.data) || "").filter(Boolean).join("\n")}` : "";

    // 13번: 히든 엔딩 조각
    const hiddenPieces13 = loadHiddenEndingPieces();
    const hiddenEndingSection = isHiddenEndingUnlocked() ? `
[🔮 진엔딩 해금] 모든 운명의 파편을 모았습니다. 이번 회차에서 특별한 진실이 드러날 수 있습니다. 적절한 순간에 세계의 비밀을 암시하십시오.` : hiddenPieces13.length > 0 ? `
[🔮 히든 엔딩 파편 ${hiddenPieces13.length}/${HIDDEN_ENDING_TOTAL}] 운명의 조각이 쌓이고 있습니다.` : "";

    // 14번: 죽는 방식 보상
    const deathBonuses14 = getActiveDeathBonuses();
    const deathBonusSection = deathBonuses14.length > 0 ? `
[💀 전생 사망 유산] ${deathBonuses14.map(d=>`${d.name}: ${d.desc}`).join(" / ")}. 이 경험이 캐릭터의 신체와 감각에 자연스럽게 반영됩니다.` : "";

    // 15번: 트라우마 면역
    const traumaImmune15 = getTraumaImmunities();
    const traumaSection = traumaImmune15.length > 0 ? `
[🛡️ 트라우마 면역] 반복된 경험으로 면역 획득: ${traumaImmune15.map(t=>`${t.icon}${t.label}(${t.immunity})`).join(", ")}. 해당 상황에서 두려움 없이 행동합니다.` : "";

    // 16번: 라스트 워드 오프닝
    const lastWord16 = loadLastWord();
    const lastWordSection = lastWord16 ? `
[💬 전생의 마지막 말] "${lastWord16.text}" — ${LAST_WORD_OPENINGS[lastWord16.tone] || ""}` : "";

    // 17번: 메타 지식
    const metaKnowledge17 = getMetaKnowledgeHints();
    const metaSection = metaKnowledge17.length > 0 ? `
[💡 전생의 메타 지식] 이전 생에서 얻은 정보들이 있습니다. 관련 상황 발생 시 "어디선가 본 듯한 느낌이 든다" 같은 선택지를 추가하십시오: ${metaKnowledge17.slice(-5).map(m=>`[${m.type}]${m.keyword}(${m.hint})`).join(", ")}` : "";

    // 18번: 혈통 진화
    const evolvedRace18 = char.race ? getEvolvedRace(char.race) : null;
    const bloodlineSection = evolvedRace18?.isEvolved ? `
[🧬 혈통 진화] ${char.race}에서 ${evolvedRace18.name}으로 진화. 종족 특성이 강화되어 있으며 종족 관련 묘사를 더욱 강렬하게 표현하십시오.` : "";

    // 19번: 운명의 변수
    const fateRes19 = getFateResistance();
    const fateSection = fateRes19 ? `
[⚡ 운명의 저항 Lv.${fateRes19.level}] ${fateRes19.desc} 예상치 못한 방해와 변수를 적절히 삽입하여 도전적인 서사를 만드십시오.` : "";

    // 20번: 전생 지도
    const exploredMaps20 = getExploredLocations(char.scenario);
    const exploredSection = exploredMaps20.length > 0 ? `
[🗺️ 전생 탐험 기록] 이전 생에서 방문한 장소들: ${exploredMaps20.map(m=>m.name).join(", ")}. 이 장소들에서 "낯익다"는 느낌이나 보너스 정보를 제공하십시오.` : "";

    // 21번: 관계 유산
    const relLegacies21 = getRelationshipLegacies();
    const relLegacySection = relLegacies21.length > 0 ? `
[💞 관계 유산] 전생의 인연이 영혼에 새겨져 있습니다. 해당 이름의 NPC 등장 시 즉시 반영하십시오:\n${relLegacies21.map(r => REL_LEGACY_HINTS[r.bond]?.(r.npcName, r.depth) || "").filter(Boolean).join("\n")}` : "";

    // 22번: 세계관 기억
    const worldSecrets22 = getWorldSecrets(char.scenario);
    const worldSecretSection = worldSecrets22.length > 0 ? `
[🔍 세계관 기억] 전생에서 발견한 세계의 비밀들:\n${worldSecrets22.map(s => `• ${s.title}: ${s.hint}`).join("\n")}\n이 비밀들을 암시하는 장면이나 대사를 자연스럽게 삽입하십시오.` : "";

    // 23번: 능력 각인
    const imprintedAbs23 = getImprintedAbilities();
    const abilityImprintSection = imprintedAbs23.length > 0 ? `
[⚡ 능력 각인] 전생에서 극한까지 단련한 능력이 이번 생에 타고난 재능으로 발현:\n${imprintedAbs23.map(a => { const def = ABILITY_IMPRINT_LABELS[a.statId]; return def ? `${def.name} (Tier ${a.tier}): ${def.desc}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 24번: 원한의 추적자
    const grudges24 = getActiveGrudges();
    const grudgeSection = grudges24.length > 0 ? `
[💀 원한의 추적자] 전생에서 쓰러뜨린 강적들의 원한이 남아있습니다. 적절한 시점에 복수자로 등장시키십시오:\n${grudges24.map(g => `• ${g.name} (위협도 ${g.power}성) — 전생 시나리오: ${g.scenario||"불명"}`).join("\n")}` : "";

    // 25번: 시간의 메아리
    const timeEchoes25 = getTimeEchoes();
    const timeEchoSection = timeEchoes25.length > 0 ? `
[🔔 시간의 메아리] 과거 회차의 중요한 말들이 메아리처럼 울립니다. 감정적으로 유사한 장면에서 이 대사들을 환청처럼 묘사하십시오:\n${timeEchoes25.slice(-3).map(e => `• "${e.text}" — ${e.speaker} (${e.emotion||"무감정"})`).join("\n")}` : "";

    // 26번: 운명의 선택 기록
    const fateChoices26 = getFateChoices(char.scenario);
    const fateChoiceSection = fateChoices26.length > 0 ? `
[🔀 운명의 선택 기록] 전생에서 했던 선택들입니다. 동일하거나 유사한 분기점 등장 시 "전에 이 길을 선택한 적이 있다"는 선택지를 추가하십시오:\n${fateChoices26.filter(c=>c.outcome!=="neutral").slice(-5).map(c => `• ${c.description} → 결과: ${c.outcome==="good"?"긍정적":"부정적"}`).join("\n")}` : "";

    // 27번: 신의 시선
    const divineGaze27 = getDivineGazeStatus();
    const divineGazeSection = divineGaze27 ? `
[${divineGaze27.icon} ${divineGaze27.label}] ${divineGaze27.desc} 이번 회차에서 신적 존재의 암시나 기적적 개입을 서사에 자연스럽게 삽입하십시오.` : "";

    // 28번: 저주 계보
    const curseMasteries28 = getCurseMasteries();
    const curseMasterySection = curseMasteries28.length > 0 ? `
[🌑 저주 숙달] 반복된 저주를 통해 습득한 능력:\n${curseMasteries28.map(c => { const def = CURSE_TYPE_DEFS[c.type]; return def ? `• ${def.name} 숙달 (${c.count}회): ${def.mastery}` : ""; }).filter(Boolean).join("\n")}` : "";

    // 29번: 전생의 기도
    const prayerStatus29 = getPastPrayerStatus();
    const prayerSection = prayerStatus29 && prayerStatus29.available ? `
[🙏 전생의 기도] 회차당 1회, 극한 위기에서 전생의 기억에 기도할 수 있습니다. 플레이어가 "기도한다" 또는 "전생에 빌다" 등의 행동을 하면 ${prayerStatus29.power} 수준의 전생 기억 계시로 위기를 극복할 힌트를 제공하십시오. 발동 시 반드시 극적이고 감동적으로 묘사하십시오.` : (prayerStatus29 && !prayerStatus29.available ? `
[🙏 전생의 기도 — 소진] 이번 회차에 이미 전생에 기도했습니다.` : "");

    // 30번: 운명의 수레바퀴
    const greatCycle30 = getGreatCycleStatus();
    const greatCycleSection = greatCycle30 ? `
[⚙️ 운명의 수레바퀴 — ${greatCycle30.greatCycles}대순환] 위대한 순환이 ${greatCycle30.greatCycles}번 완성되었습니다.\n해금 보상: ${greatCycle30.unlockedRewards.join(" / ")}\n이 영웅은 수많은 삶을 거쳐온 운명의 중심입니다. 서사의 규모와 감동을 평소보다 훨씬 크게 묘사하십시오.` : "";

    // 31번: 평행세계 조우
    const parallelSelf31 = getParallelSelfEncounter();
    const parallelSelfSection = parallelSelf31 ? `
[🌀 평행세계 조우] 전생 중 다른 회차의 자신(${parallelSelf31.name} · ${parallelSelf31.role})의 환영과 접촉한 기억이 있습니다. 그 자신은 「${parallelSelf31.keySkill || "알 수 없는 기술"}」을 사용했습니다. 깊은 명상이나 꿈, 또는 강렬한 위기 상황에서 이 평행 자아의 환영이 나타나 조언하거나 대결을 신청할 수 있습니다.` : "";

    // 32번: 저주의 고리
    const curseRings32 = getActiveCurseRings();
    const curseRingSection = curseRings32.length > 0 ? `
[🔗 저주의 고리] 반복된 행동 패턴이 저주로 굳어졌습니다:\n${curseRings32.map(r => `• ${r.icon}${r.label} (${r.count}회 반복, Lv.${r.penaltyLevel}): ${r.penalty}`).join("\n")}\n이 행동 패턴을 반복하면 AI가 자연스럽게 불리한 상황을 연출하십시오.` : "";

    // 33번: 회차 통계
    const stats33 = getCycleStatsSummary();
    const statsSection = stats33.totalCycles >= 2 ? `
[📊 회차 통계] 총 ${stats33.totalCycles}회차, 누적 사망 ${stats33.totalDeaths}회, 총 대화 ${stats33.totalTurns}턴${stats33.topEnemy ? `, 최다 처치: ${stats33.topEnemy.name}(${stats33.topEnemy.count}회)` : ""}${stats33.topScenario ? `, 선호 세계관: ${stats33.topScenario.name}` : ""}. 이 데이터를 바탕으로 캐릭터의 전투 본능과 습관을 서사에 자연스럽게 반영하십시오.` : "";

    // 34번: 부상 흔적
    const injuryEffects34 = getInjuryEffects();
    const injurySection = injuryEffects34.length > 0 ? `
[🩹 부상 흔적] 전생의 부상이 이번 생에 흔적을 남겼습니다:\n${injuryEffects34.map(i => `• ${i.icon}${i.label}: ${i.desc}`).join("\n")}\n해당 신체 부위가 사용되는 장면에서 자연스럽게 이 효과를 반영하십시오.` : "";

    // 35번: 전생 테마
    const pastTheme35 = getPastTheme();
    const pastThemeSection = pastTheme35 ? `
[🎭 전생 테마 — ${pastTheme35.label}] ${pastTheme35.openingLine} 전반적인 서사 톤을 「${pastTheme35.openingMood}」 분위기로 유지하십시오.` : "";

    // 36번: 기억 왜곡
    const memDistort36 = getMemoryDistortStatus();
    const memDistortSection = memDistort36 && memDistort36.falseMemories.length > 0 ? `
[🌫️ 기억 왜곡] 전생 기억의 정확도가 「${memDistort36.accuracy}」 상태입니다. 다음 잠재적 오기억을 가끔 암시하십시오:\n${memDistort36.falseMemories.map(m => `• ${m}`).join("\n")}\n플레이어가 전생 기억에 의존해 행동할 때 미묘하게 틀릴 수 있다는 가능성을 서술에 반영하십시오.` : "";

    // 37번: 전생 나이의 역설
    const ageParadox37 = getAgeParadoxBonus();
    const ageParadoxSection = ageParadox37 ? `
[⌛ 나이의 역설 — ${ageParadox37.label}] ${ageParadox37.desc} ${ageParadox37.bonusDesc}. 이 캐릭터는 나이에 걸맞지 않는 성숙함이나 직감을 보여주십시오.` : "";

    // 38번: 소환수 계승
    const summonLegacies38 = getSummonLegacies();
    const summonLegacySection = summonLegacies38.length > 0 ? `
[🐾 소환수의 기억] 전생에서 함께했던 소환수들이 이번 생의 세계 어딘가에 살고 있습니다:\n${summonLegacies38.map(s => `• ${s.name}(${s.type}) — 유대 ${s.bond}/10, ${s.appearances}회 동행`).join("\n")}\n이 소환수들은 야생에서 캐릭터를 알아보거나 특별한 반응을 보일 수 있습니다. 유대가 높을수록 재계약 가능성이 높습니다.` : "";

    // 39번: 원한 무기
    const grudgeWeapons39 = getGrudgeWeapons();
    const grudgeWeaponSection = grudgeWeapons39.length > 0 ? `
[⚔️ 원한 무기] 전생에서 나를 죽인 무기·기술들이 이번 생에 사용 가능한 형태로 어딘가에 존재합니다:\n${grudgeWeapons39.map(w => `• 「${w.weaponName}」(${w.killerName}에게 당함, ${w.times}회, 위력 Lv.${w.power})`).join("\n")}\n이 무기·기술을 입수할 기회를 자연스럽게 서사에 배치하십시오. 사용 시 특별히 강렬하게 묘사하십시오.` : "";

    // 40번: 세계수 성장
    const worldTree40 = getWorldTreeStatus();
    const worldTreeSection = worldTree40.level > 0 ? `
[🌳 세계수 성장 — ${worldTree40.stage.icon}${worldTree40.stage.label}] ${worldTree40.stage.desc}${worldTree40.stage.bonus ? `\n보너스: ${worldTree40.stage.bonus}` : ""}\n세계가 회차를 거듭하며 복원되고 있습니다. 이를 배경 서술에 자연스럽게 녹여 세계의 희망이 커지고 있음을 표현하십시오.` : "";

    // 41번: 꿈의 예언
    const dreamProphecies41 = getDreamProphecies();
    const dreamSection = dreamProphecies41.length > 0 ? `
[🌙 꿈의 예언] 전생의 꿈이 예언으로 남아있습니다:\n${dreamProphecies41.map(d => `• ${d.icon}${d.keyword}의 꿈 (${d.count}회): ${d.prophecy}`).join("\n")}\n플레이어가 잠들거나 명상하는 장면에서 이 예언 이미지를 자연스럽게 삽입하고, 해당 예언 상황이 실제로 전개될 때 특별히 극적으로 묘사하십시오.` : "";

    // 42번: 유산 건축
    const legacyBuildings42 = getLegacyBuildings();
    const legacyBuildingSection = legacyBuildings42.length > 0 ? `
[🏛️ 유산 건축] 전생에 세운 건물·거점의 흔적이 세계에 남아있습니다:\n${legacyBuildings42.map(b => `• ${b.icon}${b.name}(${b.label}, ${b.count}회): ${b.ruinDesc} → ${b.bonus}`).join("\n")}\n이 장소들을 서사 속 폐허·전설·지역명으로 자연스럽게 등장시키십시오.` : "";

    // 43번: 감시자의 눈
    const watchers43 = getWatchers();
    const watcherSection = watchers43.length > 0 ? `
[👁️ 감시자의 눈] 전생에서 싸웠던 강적들이 플레이어의 혼을 기억하고 강화되어 재등장할 수 있습니다:\n${watchers43.map(w => `• ${w.name} (조우 ${w.encounters}회, 위력 Lv.${w.power}${w.evolved ? " ★진화형" : ""})`).join("\n")}\n이 적들이 재등장 시 반드시 이전보다 강해졌음을 명시하고, 플레이어를 알아보는 장면을 극적으로 연출하십시오.` : "";

    // 44번: 영혼의 가면
    const soulMasks44 = getSoulMasks();
    const soulMaskSection = soulMasks44.length > 0 ? `
[🎭 영혼의 가면] 전생에서 익힌 역할이 변장 능력으로 이월되었습니다:\n${soulMasks44.map(m => `• ${m.icon}${m.masquerade} (숙련도 ${m.mastery}/5): ${m.bonus}`).join("\n")}\n플레이어가 이 역할로 변장하거나 행동할 때 자연스럽게 성공하도록 서술하십시오.` : "";

    // 45번: 감정의 파문
    const emotionRipples45 = getEmotionRipples();
    const emotionRippleSection = emotionRipples45.length > 0 ? `
[🌊 감정의 파문] 전생의 극단적 감정이 세계에 파문을 남겼습니다:\n${emotionRipples45.map(r => `• ${r.icon}${r.label} (강도 ${r.intensity}/5): ${r.worldEffect} → ${r.bonus}`).join("\n")}\n세계 분위기 묘사 시 이 파문의 영향을 자연스럽게 반영하십시오.` : "";

    // 46번: 유언장
    const testaments46 = getTestaments();
    const testamentSection = testaments46.length > 0 ? `
[📜 유언장] 전생에 남긴 유언이 세계 어딘가에 존재합니다:\n${testaments46.slice(-2).map(t => `• ${t.icon}${t.label}(${t.characterName}): ${t.hint}`).join("\n")}\n폐허, 도서관, NPC 대화 등을 통해 이 유언이 발견되는 이벤트를 자연스럽게 배치하십시오.` : "";

    // 47번: 숙명의 별자리
    const constellation47 = getConstellation();
    const constellationSection = constellation47 ? `
[${constellation47.icon} 숙명의 별자리 — ${constellation47.name}(${constellation47.trait})] ${constellation47.bonus}\n⚠️ 경고: ${constellation47.challenge}\n이번 회차 내내 이 별자리의 특성이 운명처럼 작용합니다. 서사 전반에 자연스럽게 반영하십시오.` : "";

    // 48번: 탐험가의 유산
    const explorerMap48 = getExplorerMap();
    const explorerMapSection = explorerMap48.length > 0 ? `
[🗺️ 탐험가의 유산] 전생에 발견한 장소의 기억이 남아있습니다:\n${explorerMap48.map(l => `• ${l.icon}${l.label}: ${l.desc} → ${l.bonus}`).join("\n")}\n해당 장소 유형이 등장하는 장면에서 캐릭터가 본능적으로 길을 알거나 유리한 위치를 선점할 수 있도록 하십시오.` : "";

    // 49번: 번개 각인
    const lightningImprints49 = getLightningImprints();
    const lightningImprintSection = lightningImprints49.length > 0 ? `
[⚡ 번개 각인] 전생의 가장 극적인 순간이 본능으로 각인되었습니다:\n${lightningImprints49.map(i => `• ${i.icon}${i.label} (위력 ${i.power}/5): ${i.bonus}`).join("\n")}\n각인된 상황이 발생하면 반드시 특별한 본능 발동 연출로 묘사하십시오.` : "";

    // 50번: 전생의 일출
    const dawn50 = getDawnStatus();
    const dawnSection = dawn50.stage > 0 ? `
[${dawn50.stageData.icon} 전생의 일출 — ${dawn50.stageData.label}] ${dawn50.stageData.desc}${dawn50.stageData.worldBonus ? `\n세계 보너스: ${dawn50.stageData.worldBonus}` : ""}\n${dawn50.stage >= 5 ? "세계에 완전한 여명이 밝았습니다. 이 회차는 전설의 완성이 될 수 있습니다. 서사의 스케일과 감동을 최고조로 끌어올리십시오." : "세계가 조금씩 밝아오고 있습니다. 희망의 기운을 배경 묘사에 담아내십시오."}` : "";

    // ── 51번: 별자리 운세 — 모든 세계관, 1회차+ ──
    const starSign51 = getStarSign();
    const starSignSection = (starSign51 && _cycle >= 1) ? `
[${starSign51.icon} 별자리 운세 — ${starSign51.name}(${starSign51.trait})] ${starSign51.bonus}\n⚠️ 약점: ${starSign51.penalty}\n이번 생의 운명적 별자리입니다. 해당 특성이 모든 상황에서 자연스럽게 작용하도록 서사에 녹여내십시오.` : "";

    // ── 52번: 전생어 — 3회차+, 중후반 ──
    const pastLang52 = getPastLanguage();
    const pastLangSection = (pastLang52 && pastLang52.phrases && pastLang52.phrases.length > 0 && _cycle >= 3) ? `
[🗣️ 전생어 해금 — Lv.${pastLang52.level}] 전생의 영혼이 기억하는 고대 언어를 구사할 수 있습니다:\n${pastLang52.phrases.slice(-3).map(p => `• "${p.phrase}" (${p.meaning}) → ${p.trigger}`).join("\n")}\n플레이어가 이 언어를 사용하는 장면에서 해당 효과를 극적으로 발동시키십시오.` : "";

    // ── 53번: 가면 시스템 — 로그/암살/외교 직업 우선, 모든 세계관 ──
    const identities53 = getIdentityVault();
    const polishedIds = identities53.filter(i => i.polished);
    const identitySection = (polishedIds.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 2)) ? `
[🎭 완성된 신분 금고] 전생에서 숙달된 위장 신분들:\n${polishedIds.map(i => `• ${i.icon}${i.label}(${i.alias || i.label}) — ${i.bonus}`).join("\n")}\n플레이어가 이 신분을 꺼낼 때 즉각적이고 자연스러운 신분 전환을 묘사하십시오.` : "";

    // ── 54번: 차원 균열 — 5회차+, 중후반 이상 ──
    const rift54 = getRiftStatus();
    const riftSection = (rift54 && rift54.available && _cycle >= 5) ? `
[${rift54.nextRift.icon} 차원 균열 — ${rift54.nextRift.label}] ${rift54.nextRift.desc}\n잠재 획득물: ${rift54.nextRift.loot} / 조우 NPC: ${rift54.nextRift.npc}\n극적으로 긴장이 고조된 순간 이 균열이 잠깐 열릴 수 있습니다. 등장 시 이계의 분위기를 생생하게 묘사하십시오.` : "";

    // ── 55번: 연금술 누적 — 마법 직업/엘프/드워프 우선, 3회차+ ──
    const recipeBook55 = getRecipeBook();
    const topTier = recipeBook55.length > 0 ? recipeBook55[recipeBook55.length - 1] : null;
    const recipeSection = (topTier && (isMagicRole || isElf || isDwarf || _cycle >= 3)) ? `
[${topTier.icon} 레시피북 — ${topTier.label}] 전생에서 축적된 제조 지식:\n${topTier.recipes.slice(0, 3).map(r => `• ${r}`).join(", ")} 등 ${topTier.recipes.length}종\n플레이어가 재료를 구하거나 제조를 시도할 때 이 지식을 활용해 성공 가능성을 높이십시오.` : "";

    // ── 56번: 전생 목표 달성률 — 모든 세계관, 1회차+ ──
    const achBonus56 = getLastAchievementBonus();
    const achSection = (achBonus56 && _cycle >= 1) ? `
[${achBonus56.icon} 전생 달성률 — ${achBonus56.label}(${achBonus56.rate}%)]${achBonus56.bonus ? ` 보너스: ${achBonus56.bonus}` : ""}${achBonus56.penalty ? ` 페널티: ${achBonus56.penalty}` : ""}\n이 달성률의 여파가 이번 회차 시작 분위기와 NPC 반응에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 57번: 인연의 꽃 — 모든 세계관, 1회차+ ──
    const romanceLeg57 = getRomanceLegacy();
    const topRomance = romanceLeg57.length > 0 ? romanceLeg57.sort((a,b) => b.depth - a.depth)[0] : null;
    const romanceSection = (topRomance && _cycle >= 1) ? `
[${topRomance.fate.icon} 인연의 꽃 — ${topRomance.npcName}(${topRomance.fate.label})] 전생에서 깊은 인연을 맺은 자가 이번 생에도 나타날 것입니다.\n첫 만남 연출: "${topRomance.fate.firstMeet}"\n이 NPC가 등장할 때 위 묘사를 자연스럽게 사용하고, 초기 호감도를 ${topRomance.fate.bond}으로 시작하십시오.` : "";

    // ── 58번: 사냥 기록 — 전사/도적 직업 우선, 모든 세계관 ──
    const bestiary58 = getFullBestiary();
    const bestiarySection = (bestiary58.total > 0 && (isWarriorRole || isRogueRole || _cycle >= 2)) ? `
[📖 몬스터 도감 — ${bestiary58.total}종 기록, 총 ${bestiary58.totalKills}처치] 전생의 사냥 경험이 본능적 지식으로 남아있습니다.${bestiary58.completionBonus ? `\n${bestiary58.completionBonus}` : ""}\n기록된 몬스터가 등장할 때 캐릭터가 본능적으로 패턴을 알아채는 묘사를 추가하십시오.` : "";

    // ── 59번: 전생 기억 상인 — 4회차+, 중후반 ──
    const merchant59 = getMemoryMerchantStatus();
    const merchantSection = (merchant59 && merchant59.appears && _cycle >= 4) ? `
[🧙 전생 기억 상인] 고회차에만 나타나는 신비한 상인이 이번 생 어딘가에 존재합니다. 플레이어가 상인을 찾거나 운명적으로 마주치는 장면에서 등장시킬 수 있습니다. 상인은 전생 기억 조각을 대가로 귀한 정보를 줍니다. 이미 ${merchant59.visits}번 조우했습니다.` : "";

    // ── 60번: 시간 역행 토큰 — 토큰 보유 시만 ──
    const timeToken60 = getTimeTokenStatus();
    const timeTokenSection = (timeToken60 && timeToken60.tokens > 0) ? `
[⏪ 시간 역행 토큰 — ${timeToken60.tokens}개 보유] 플레이어가 "시간을 되돌린다" 또는 "다시 해보겠다"고 명시적으로 선언할 경우, 이 토큰을 1개 소모해 최대 3턴 이전으로 되돌릴 수 있습니다. 극적인 연출로 시간 역행을 묘사하십시오.` : "";

    // ── 61번: 전생 동료의 유지 — 모든 세계관, 1회차+ ──
    const survivors61 = getSurvivorCompanions();
    const survivorSection = (survivors61.length > 0 && _cycle >= 1) ? `
[👥 전생 생존 동료] 전생에서 함께 살아남은 자들이 이번 생에 낯선 모습으로 나타납니다:\n${survivors61.slice(0, 3).map(c => `• ${c.npcName} — ${c.memoryStage.label}: "${c.memoryStage.firstMeet}"`).join("\n")}\n이 NPC가 등장할 때 위 연출을 사용하고, 특정 대화 조건에서 기억이 각성하도록 서사를 이끄십시오.` : "";

    // ── 62번: 불사 게이지 — 전사/도적 직업 우선, 모든 세계관 ──
    const undying62 = getUndyingGaugeStatus();
    const undyingSection = (undying62 && undying62.totalNearDeaths > 0 && (isWarriorRole || isRogueRole || _cycle >= 3)) ? `
[💪 불사 게이지 — ${undying62.gauge}/${undying62.maxGauge}]${undying62.passiveReady ? " ✅ 즉사 무효 준비 완료" : ""}${undying62.passiveUsedThisCycle ? " (이번 회차 소진)" : ""}\n총 ${undying62.totalNearDeaths}번의 죽음을 버텨낸 영혼입니다.${undying62.passiveReady && !undying62.passiveUsedThisCycle ? "\n다음 즉사 판정에서 1회 자동으로 살아남는 기적을 극적으로 묘사하십시오." : ""}` : "";

    // ── 63번: 다국어 해금 — 판타지/무협 종족 중심 ──
    const languages63 = getUnlockedLanguages();
    const langSection = (languages63.length > 0 && (isFantasyRace || isMedieval || isWuxia || _cycle >= 4)) ? `
[🌐 습득 언어 — ${languages63.length}종] 전생에서 익힌 언어들:\n${languages63.map(l => `• ${l.icon}${l.name}: ${l.bonus}`).join("\n")}\n해당 종족·세력 NPC와의 대화에서 이 언어를 자연스럽게 사용할 수 있으며, 전용 대화 선택지를 부여하십시오.` : "";

    // ── 64번: 음유시인 기록 — 2회차+, 바드 직업 우선 ──
    const bardLeg64 = getBardLegendStatus();
    const bardSection = (bardLeg64 && _cycle >= 2 && (isBardRole || _cycle >= 4)) ? `
[🎵 음유시인의 기록 — 명성 ${bardLeg64.fame}점, ${bardLeg64.distortionData.label}] ${bardLeg64.distortionData.desc}\n술집이나 광장에서 NPC들이 ${bardLeg64.distortionData.multiplier}배로 과장된 전생의 이야기를 나누는 장면을 간헐적으로 삽입하십시오. 주인공이 그 이야기를 듣는 장면에서 복잡한 감정을 묘사하십시오.` : "";

    // ── 65번: 대미스터리 퍼즐 — 모든 세계관, 조각 있을 때 ──
    const mystery65 = getMysteryPuzzleStatus();
    const mysterySection = (mystery65 && mystery65.pieces && mystery65.pieces.length > 0) ? `
[🧩 대미스터리 퍼즐 — ${mystery65.pieces.length}/${mystery65.totalPieces}조각 수집]${mystery65.solved ? " 🌟 세계의 진실 완전 해명!" : ""}\n현재까지 밝혀진 단서:\n${mystery65.pieces.slice(-3).map(p => `• ${p.icon}${p.title}: ${p.hint}`).join("\n")}\n이 미스터리의 단서들을 이번 회차 서사에 자연스럽게 녹여넣고, 진실에 한 걸음 가까워지는 장면을 연출하십시오.` : "";

    // ── 66번: 감시자의 시선 — 6회차+, 후반 이상 ──
    const watcherGaze66 = getWatcherGazeStatus();
    const watcherGazeSection = (watcherGaze66 && _cycle >= 6) ? `
[👁️ 감시자의 시선 — ${watcherGaze66.stageData.desc}]${watcherGaze66.stageData.hint ? `\n암시: "${watcherGaze66.stageData.hint}"` : ""}\n${watcherGaze66.revealed ? "감시자의 정체가 밝혀졌습니다. 메타 스토리를 전면에 등장시키십시오." : "고요한 순간이나 깊은 명상 중에 이 감각을 섬세하게 묘사하십시오."}` : "";

    // ── 67번: 운명 카드 — 카드 선택 시만 ──
    const fateCard67 = getCurrentFateCard();
    const fateCardSection = fateCard67 ? `
[${fateCard67.icon} 운명 카드 — ${fateCard67.name}(${fateCard67.theme})] ${fateCard67.effect}\n보너스: ${fateCard67.bonus} / 페널티: ${fateCard67.penalty}\n이번 회차 전체의 분위기와 사건 흐름이 이 카드의 테마를 중심으로 전개되도록 서사를 이끄십시오.` : "";

    // ── 68번: 전생 본거지 — 2회차+, 시설 있을 때 ──
    const hideout68 = getHideoutStatus();
    const hideoutSection = (hideout68 && hideout68.facilities && hideout68.facilities.length > 0 && _cycle >= 2) ? `
[🏰 전생 본거지 — Lv.${hideout68.level}(${hideout68.facilities.length}개 시설)] 회차를 거쳐 세워진 은신처:\n${hideout68.facilities.slice(-3).map(f => `• ${f.icon}${f.name}: ${f.bonus}`).join("\n")}\n플레이어가 본거지를 방문하는 장면에서 이 시설들이 실제로 존재하고 기능하는 것으로 묘사하십시오.` : "";

    // ── 69번: 악안(惡眼) — 각성 시만, 전투 직업 우선 ──
    const evilEye69 = getEvilEyeStatus();
    const evilEyeSection = (evilEye69 && evilEye69.awakened && (isWarriorRole || isRogueRole || _cycle >= 5)) ? `
[${evilEye69.levelData.icon || "🔴"} 악안 — ${evilEye69.levelData.label}] ${evilEye69.levelData.ability}\n총 ${evilEye69.killCount}번의 전투 경험이 눈에 각인되어 있습니다.\n전투 장면에서 이 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 70번: 달의 위상 — 모든 세계관, 1회차+ ──
    const moonPhase70 = getMoonPhase();
    const moonSection = moonPhase70 ? `
[${moonPhase70.icon} 달의 위상 — ${moonPhase70.name}] ${moonPhase70.effect}\n특별 이벤트: ${moonPhase70.specialEvent}\n이번 회차 내내 달의 기운이 서사에 배어있습니다. 야간 장면이나 신비로운 순간에 이 위상의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 71번: 전생에서 보내는 편지 — 1회차+ ──
    const letter71 = getLatestLetter();
    const letterSection = (letter71 && _cycle >= 1) ? `
[📩 전생에서 온 편지 — ${letter71.tone} 어조] "${letter71.message.slice(0,80)}${letter71.message.length > 80 ? "..." : ""}"\n이 편지를 쓴 자: ${letter71.characterName}. 이번 회차 극적인 순간에 낡은 편지를 발견하는 장면으로 연출하십시오.` : "";

    // ── 72번: 회차 하이라이트 컷씬 — 1회차+ ──
    const reel72 = getHighlightReel();
    const reelSection = (reel72.length > 0 && _cycle >= 1) ? `
[🎬 전생 하이라이트] 이번 회차 오프닝이나 꿈 속에서 아래 장면들이 섬광처럼 스칠 수 있습니다:\n${reel72.slice(-3).map(r => `• ${r.icon}${r.label}: ${r.template.replace("${name}", r.characterName)}`).join("\n")}` : "";

    // ── 73번: 나비 지수 — 3회차+, 지수 양수일 때 ──
    const butterfly73 = getButterflyIndex();
    const butterflyIdxSection = (butterfly73.index > 0 && _cycle >= 3) ? `
[🦋 나비 지수 — ${butterfly73.index}/100 (${butterfly73.stageData.label})] ${butterfly73.stageData.desc}\n${butterfly73.chaosMode ? "주의: 카오스 모드 활성화. 플레이어의 사소한 행동이 예상치 못한 큰 파장을 일으킵니다. 모든 선택에 과장된 연쇄 효과를 부여하십시오." : `카오스 확률 ${butterfly73.stageData.chaosChance}% — 때때로 예상치 못한 파급 효과를 서사에 추가하십시오.`}` : "";

    // ── 74번: 고대 비문 해독 — 유적/신전 세계관 우선, 비문 있을 때 ──
    const inscription74 = getInscriptionStatus();
    const inscriptionSection = (inscription74 && inscription74.lines && inscription74.lines.length > 0 && (isMedieval || isWuxia || _cycle >= 2)) ? `
[📜 고대 비문 — ${inscription74.progress}/${inscription74.total}줄 해독]${inscription74.completed ? " 🌟 비문 완전 해독! 신급 스킬 해금 조건 충족!" : ""}\n최근 해독 구절: "${inscription74.lines[inscription74.lines.length-1]?.text}"\n고대 유적이나 신전 장면에서 이 비문의 구절을 자연스럽게 등장시키십시오.` : "";

    // ── 75번: 윤회 등급 — 1회차+ ──
    const rank75 = getRankStatus();
    const rankSection = (rank75 && _cycle >= 1) ? `
[${rank75.rankData.icon} 윤회 등급 — ${rank75.rankData.label}] ${rank75.rankData.bonus}\n${rank75.rankData.desc}${rank75.nextRank ? `\n다음 등급까지: ${rank75.nextRank.minScore - rank75.totalScore}점 남음` : ""}` : "";

    // ── 76번: 벚꽃 엔딩 — 조건 달성 시만, 후반 이상 ──
    const sakura76 = getSakuraStatus();
    const sakuraSection = (sakura76 && sakura76.metCount > 0 && _cycle >= 5) ? `
[🌸 벚꽃 엔딩 — ${sakura76.metCount}/${sakura76.totalConditions}조건 달성]${sakura76.unlocked ? " ✅ 대단원 평화 엔딩 해금!" : ""}\n미달성 조건: ${sakura76.conditions.filter(c => !c.met).map(c => c.label).join(", ")}\n${sakura76.unlocked ? "이번 회차에서 평화적 결말을 이끌면 벚꽃 엔딩이 발동됩니다. 서사를 화해와 평화의 방향으로 이끄십시오." : ""}` : "";

    // ── 77번: 데자뷔 알림 — 1회차+ ──
    const dejavu77 = getDejavuStatus();
    const dejavuSection = (dejavu77 && dejavu77.count > 0 && _cycle >= 1) ? `
[💭 데자뷔 알림] 전생에서 겪은 상황이 재현될 때 자동으로 "익숙한 느낌" 묘사를 삽입하십시오:\n${dejavu77.triggerDefs.slice(0,4).map(t => `• ${t.keyword[0]} 관련 상황: "${t.feeling}"`).join("\n")}\n총 ${dejavu77.count}번의 데자뷔 경험이 축적되었습니다.` : "";

    // ── 78번: 인과율 조작 — 10회차+, 후반 이상 ──
    const causality78 = getCausalityStatus();
    const causalitySection = (causality78 && _cycle >= 10) ? `
[⚙️ 인과율 조작 — ${causality78.uses}/${causality78.maxUses}회 사용] 플레이어가 "원인을 바꾼다" 또는 "그 일이 일어나지 않았다면"이라고 명시적으로 선언할 경우, 이 능력을 소모해 과거 사건의 원인을 소급 변경하는 극적 장면을 연출하십시오.` : "";

    // ── 79번: 전생 도박 빚 — 빚 있을 때만 ──
    const debt79 = getGamblingDebt();
    const debtSection = (debt79 && !debt79.paidOff) ? `
[💸 전생 도박 빚 — ${debt79.totalDebt}골드] 채권자: ${debt79.creditorName}\n이번 회차 초반에 빚쟁이 NPC가 나타나 빚을 요구하는 장면을 삽입하십시오. 갚으면 히든 퀘스트가 열립니다.` : "";

    // ── 80번: 어린 시절 트라우마 — 트라우마 있을 때 ──
    const traumas80 = getChildhoodTraumas();
    const trauma80Section = traumas80.length > 0 ? `
[😢 각인된 트라우마]\n${traumas80.map(t => `• ${t.icon}${t.label}: 트리거(${t.trigger}) → 플래시백: "${t.flashback}"`).join("\n")}\n해당 상황이 등장할 때 위 플래시백 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 81번: 세계 종말 카운터 — 3회차+, 카운터 > 0 ──
    const apo81 = getApocalypseStatus();
    const apoSection = (apo81 && apo81.clock > 0 && _cycle >= 3) ? `
[${apo81.stageData.icon} 세계 종말 카운터 — ${apo81.clock}/100 (${apo81.stageData.label})] ${apo81.stageData.desc}${apo81.stageData.warning ? `\n⚠️ ${apo81.stageData.warning}` : ""}\n${apo81.clock >= 80 ? "긴급: 이번 회차에서 봉인 이벤트를 발동시키지 않으면 멸망이 확정됩니다. 이 긴박감을 서사 전체에 흐르게 하십시오." : "세계 어딘가에서 이 카운터의 영향이 배경 묘사에 스며들도록 하십시오."}` : "";

    // ── 82번: 슬픔 수치 — 상실 있을 때 ──
    const grief82 = getGriefStatus();
    const griefSection = (grief82 && grief82.total > 0) ? `
[${grief82.stageData.icon} 슬픔 수치 — ${grief82.total}명 상실 (${grief82.stageData.label})] 공감 능력 +${grief82.stageData.empathy} / 전투 의지 -${grief82.stageData.willPenalty}\n잃어버린 자들: ${grief82.lostOnes.slice(-3).map(l => `${l.name}(${l.relationship})`).join(", ")}...\n이 슬픔이 캐릭터의 눈빛과 행동에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 83번: 전생 직감 — 3회차+ ──
    const instinct83 = getInstinctStatus();
    const instinctSection = (instinct83 && _cycle >= 3) ? `
[🔮 전생 직감 — 정확도 ${instinct83.accuracy}%] 새로운 NPC를 처음 만날 때 직감 판정으로 선의/악의를 ${instinct83.accuracy}% 확률로 감지합니다. "무언가 미심쩍은 느낌이 든다" 또는 "왠지 믿음직스럽다"는 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 84번: 저주받은 유물 — 유물 있을 때 ──
    const cursedRelics84 = getCursedRelics();
    const cursedRelicSection = cursedRelics84.length > 0 ? `
[🔮 저주받은 유물의 흔적]\n${cursedRelics84.map(r => `• ${r.icon}${r.name}: ${r.curse} / 숨겨진 힘: ${r.hiddenPower}`).join("\n")}\n이 저주들이 희미하게 캐릭터를 따라다닙니다. 관련 상황에서 저주와 숨겨진 힘을 함께 묘사하십시오.` : "";

    // ── 85번: 자연 회귀 — 자연 관련 세계관 우선, 중립 이상 스코어 ──
    const nature85 = getNatureKarma();
    const natureSection = (nature85 && (nature85.score !== 50 || isMedieval || isWuxia) && _cycle >= 2) ? `
[${nature85.status.icon} 자연 업보 — ${nature85.status.label}] ${nature85.status.effect}\n자연 관련 장면(숲, 강, 산, 폭풍)에서 이 업보의 영향을 자연스럽게 묘사하십시오.` : "";

    // ── 86번: 신분 세탁 누적 — 가명 있을 때, 로그/리더 직업 우선 ──
    const aliases86 = getAliasList();
    const aliasSection = (aliases86.length > 0 && (isRogueRole || isLeaderRole || _cycle >= 3)) ? `
[🎭 신분 목록 — ${aliases86.length}개 가명] 즉시 사용 가능한 위장 신분:\n${aliases86.slice(0,4).map(a => `• "${a.name}" (${a.context}, 신뢰도 ${a.credibility}/5)`).join("\n")}\n플레이어가 이 신분을 사용할 때 자연스러운 전환과 신뢰도에 맞는 반응을 묘사하십시오.` : "";

    // ── 87번: 소원 시스템 — 소원 사용 가능 시만 ──
    const wish87 = getWishStatus();
    const wishSection = (wish87 && wish87.available) ? `
[⭐ 소원 사용 가능] 100회차 달성 보상으로 소원 1회를 사용할 수 있습니다:\n${wish87.options.map(o => `• ${o.icon}${o.label}: ${o.desc}`).join("\n")}\n플레이어가 소원을 선택하면 해당 효과를 극적으로 연출하십시오.` : "";

    // ── 88번: 전생 반려동물 — 반려동물 있을 때 ──
    const pets88 = getPetLegacy();
    const petSection = pets88.length > 0 ? `
[🐾 전생 반려동물] 전생에서 함께한 동물들이 이번 생 어딘가에 살고 있습니다:\n${pets88.map(p => `• ${p.icon}${p.petName}(${p.name}) — 유대 ${p.bond}/100, 재결합 아이템: ${p.reuniteItem}`).join("\n")}\n플레이어가 해당 아이템을 사용하거나 조건을 맞추면 감동적인 재결합 장면을 연출하십시오.` : "";

    // ── 89번: 봉인된 기억 방 — 봉인 있을 때, 2회차+ ──
    const sealedMems89 = getSealedMemories();
    const sealedSection = (sealedMems89.length > 0 && _cycle >= 2) ? `
[🔒 봉인된 기억 방 — ${sealedMems89.filter(m=>!m.opened).length}개 봉인 중]\n${sealedMems89.filter(m=>!m.opened).map(m => `• ${m.trigger} → 해금 시 스킬: ${m.skill} (정신력 -${m.mentalCost})`).join("\n")}\n플레이어가 봉인 해제를 시도하면 극적인 고통과 각성을 동시에 묘사하십시오.` : "";

    // ── 90번: 영혼 결정체 — 결정체 있을 때 ──
    const sc90 = getSoulCrystalStatus();
    const soulCrystalSection = (sc90 && sc90.count > 0) ? `
[💠 영혼 결정체 — ${sc90.count}개 보유]${sc90.crafted && sc90.crafted.length > 0 ? ` / 제조 완료: ${sc90.crafted.map(c=>c.name).join(", ")}` : ""}\n${sc90.availableCrafts.length > 0 ? `제조 가능: ${sc90.availableCrafts.map(c=>`${c.icon}${c.name}(${c.cost}개)`).join(", ")}` : ""}` : "";

    // ── 91번: 감정 잔향 — 1회차+ ──
    const echo91 = getEmotionEcho();
    const echoSection = (echo91 && _cycle >= 1) ? `
[${echo91.icon} 감정 잔향 — ${echo91.label}] ${echo91.trait}\n보너스: ${echo91.bonus} / 부작용: ${echo91.sideEffect}\n이 감정의 잔향이 캐릭터의 행동 방식과 반응에 자연스럽게 스며들도록 서사를 이끄십시오.` : "";

    // ── 92번: 차원 지도 — 2회차+, 세계 탐험 있을 때 ──
    const dimMap92 = getDimensionMapStatus();
    const dimMapSection = (dimMap92 && dimMap92.totalWorlds > 0 && _cycle >= 2) ? `
[🗺️ 차원 지도 — ${dimMap92.totalWorlds}개 세계 탐험]${dimMap92.unlockedSkills.length > 0 ? `\n해금 스킬: ${dimMap92.unlockedSkills.map(s=>`${s.icon}${s.skill}`).join(", ")}` : ""}\n${dimMap92.nextSkill ? `다음 해금까지 ${dimMap92.nextSkill.count - dimMap92.totalWorlds}개 세계 탐험 필요` : ""}` : "";

    // ── 93번: 악역 계승 — 보스 처치 후, 카르마 높을 때 ──
    const villain93 = getVillainInheritStatus();
    const villainSection = (villain93 && villain93.inherited && villain93.inherited.length > 0 && villain93.corruptionLevel > 0) ? `
[😈 악역 계승 — 오염도 ${villain93.corruptionLevel}%] ${villain93.corruptDesc}\n계승한 힘: ${villain93.inherited.map(v=>`${v.bossName}의 ${v.ability}`).join(", ")}\n이 힘들이 서사에서 자연스럽게 발현되며, 오염도에 따라 어두운 선택지를 더 자주 제시하십시오.` : "";

    // ── 94번: 눈물 수집 — 결정 있을 때 ──
    const tears94 = getTearCrystalStatus();
    const tearSection = (tears94 && tears94.crystals > 0) ? `
[💧 눈물 결정 — ${tears94.crystals}개]${tears94.canUse ? " ✅ 사용 가능(3개 이상)" : ""}\n플레이어가 "눈물을 바친다" 또는 "결정을 사용한다"고 선언하면 3개를 소모해 현재 NPC를 완전히 감동시키는 기적을 연출하십시오.` : "";

    // ── 95번: 속성 내성/약점 — 내성 있을 때 ──
    const elemRes95 = getElementResistances();
    const elemSection = elemRes95.length > 0 ? `
[🔰 속성 내성/약점]\n${elemRes95.map(r=>`• ${r.icon}${r.element}: ${r.resistLabel}(${r.resistLevel}) / 반대: ${r.weakLabel}`).join("\n")}\n전투와 마법 이벤트에서 이 내성/약점을 반드시 반영하십시오.` : "";

    // ── 96번: 이세계 서커스 — 7회차+, 고회차 ──
    const circus96 = getCircusStatus();
    const circusSection = (circus96 && _cycle >= 7) ? `
[🎪 이세계 서커스] 고회차 전용. 극적으로 잠드는 장면이나 혼절 순간에 서커스 이벤트가 발동될 수 있습니다. 다음 이벤트: ${circus96.nextAct?.icon}${circus96.nextAct?.name} — ${circus96.nextAct?.desc}` : "";

    // ── 97번: 신전 건립 — 신전 있을 때, 성직 직업 우선 ──
    const temple97 = getTempleStatus();
    const templeSection = (temple97 && temple97.level > 0 && (isHealerRole || _cycle >= 3)) ? `
[${temple97.levelData.icon} 신전 — ${temple97.levelData.name}] 신도 ${temple97.levelData.worshippers}명\n신도 혜택: ${temple97.levelData.boon}\n신전을 방문하거나 신도를 만나는 장면에서 이 혜택을 자연스럽게 부여하십시오.` : "";

    // ── 98번: 유언 방송 — 2회차+ ──
    const legWords98 = getLegacyWords();
    const legWordsSection = (legWords98.length > 0 && _cycle >= 2) ? `
[📢 유언 방송] 전생의 마지막 말이 세계에 퍼져있습니다:\n${legWords98.slice(-2).map(w=>`• ${w.misinterpretation}`).join("\n")}\n술집, 시장, 신전에서 NPC들이 이 말을 인용하거나 오해하는 장면을 간헐적으로 삽입하십시오.` : "";

    // ── 99번: 돌연변이 — 같은 종족 반복 시, 각성 시만 ──
    const mutation99 = getMutationStatus(char.race);
    const mutationSection = (mutation99 && mutation99.mutated) ? `
[🧬 돌연변이 각성 — ${mutation99.mutation}] 외형: ${mutation99.appearance}\n각성 스킬: ${mutation99.skill}\n이 변화가 NPC들의 반응과 전투 장면에 자연스럽게 반영되도록 하십시오.` : "";

    // ── 100번: 어둠의 메아리 — 악명 있을 때 ──
    const dark100 = getDarkEchoStatus();
    const darkEchoSection = (dark100 && dark100.infamy > 0) ? `
[${dark100.fearData.icon} 어둠의 메아리 — 악명 ${dark100.infamy}/100 (${dark100.fearData.label})] ${dark100.fearData.effect}\nNPC 반응: ${dark100.fearData.npcReaction}\n${dark100.rumors.length > 0 ? `최근 괴담: "${dark100.rumors[dark100.rumors.length-1]?.rumor}"` : ""}\n이 악명을 모르는 NPC와 아는 NPC의 반응을 극명하게 대비시키십시오.` : "";

    // ── 101번: 성장 나무 — 꽃 핀 가지 있을 때 ──
    const tree101 = getGrowthTreeStatus();
    const treeSection = (tree101 && tree101.blossoms && tree101.blossoms.length > 0) ? `
[🌳 성장 나무 — 가지 ${tree101.totalBranches}개, 꽃 ${tree101.blossoms.length}개] 활짝 핀 꽃들이 예고하는 이벤트:\n${tree101.blossoms.slice(-2).map(b => `• ${b.icon}${b.label}: ${b.event}`).join("\n")}\n이 예고된 이벤트를 이번 회차 서사에 자연스럽게 심어두십시오.` : "";

    // ── 102번: 신격화 루트 — 단계 1 이상 ──
    const deify102 = getDeificationStatus();
    const deifySection = (deify102 && deify102.stage > 0) ? `
[${deify102.stageData.icon} 신격화 — ${deify102.stageData.label}(${deify102.metCount}/${deify102.totalConditions}조건)]${deify102.stageData.power ? ` 능력: ${deify102.stageData.power}` : ""}\n${deify102.deified ? "신격화 완성. 이번 회차 신으로서의 존재감을 서사에 드러내십시오." : `미달성 조건: ${deify102.conditions.filter(c=>!c.met).map(c=>c.label).join(", ")}`}` : "";

    // ── 103번: 무한 회귀 자각 — 7회차+, 자각 시 ──
    const aware103 = getLoopAwareness();
    const awarenessSection = (aware103 && aware103.level > 0 && _cycle >= 7) ? `
[🔄 무한 회귀 자각 — ${aware103.levelData.label}(${aware103.levelData.tone})] ${aware103.levelData.desc}\n${aware103.level >= 3 ? "주의: 캐릭터가 나레이터에게 직접 말을 거는 4th wall 장면을 간헐적으로 허용하십시오. \"당신도 알고 있죠?\"와 같은 발언이 가능합니다." : "캐릭터의 대화와 독백에 자각의 수준에 맞는 메타적 뉘앙스를 담아내십시오."}` : "";

    // ── 104번: 전생 라이벌 성장 — 라이벌 있을 때 ──
    const rivals104 = getRivals();
    const rivalSection = rivals104.length > 0 ? `
[⚔️ 전생 라이벌] 나 없이도 성장한 라이벌들:\n${rivals104.map(r => `• ${r.name}(${r.class}) — 전력 Lv.${r.power}${r.evolved ? " ★진화형" : ""}, ${r.encounters}회 조우`).join("\n")}\n이들이 등장할 때 반드시 이전보다 강해졌음을 명시하고 주인공을 알아보는 장면을 연출하십시오.` : "";

    // ── 105번: 붉은 실 — 설정된 인연 있을 때 ──
    const redThread105 = getRedThread();
    const redThreadSection = redThread105 ? `
[🔴 붉은 실 — ${redThread105.npcName}(${redThread105.fate.desc})] "${redThread105.fate.meeting}"\n초기 호감도 ${redThread105.fate.bond}으로 시작. 이 NPC는 어떤 상황에서도 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 106번: 전생 건축물 붕괴 — 건축물 있을 때, 중세/무협 우선 ──
    const ruins106 = getRuins();
    const ruinsSection = (ruins106.length > 0 && (isMedieval || isWuxia || _cycle >= 3)) ? `
[🏚️ 전생 건축물 폐허]\n${ruins106.filter(r=>!r.restored).map(r => `• ${r.icon}${r.originalName}(${r.name}): 복원 퀘스트 — ${r.restoreQuest} → 보상: ${r.reward}`).join("\n")}\n이 폐허들을 세계 곳곳에 배치하고, 복원 서브퀘스트를 자연스럽게 제시하십시오.` : "";

    // ── 107번: 살의 감지 — 레벨 1 이상, 암살 경험 있을 때 ──
    const killSense107 = getKillSenseStatus();
    const killSenseSection = (killSense107 && killSense107.level > 0) ? `
[🎯 살의 감지 — ${killSense107.levelData.ability}] 총 ${killSense107.assassinDeaths}번 암살 피해 경험\n적대적 NPC의 살의를 먼저 느끼는 순간을 섬세하게 묘사하십시오. 기습 장면에서 감지 여부를 판정하십시오.` : "";

    // ── 108번: 전생 원한꽃 — 원한꽃 있을 때 ──
    const grudgeFlowers108 = getGrudgeFlowers();
    const grudgeFlowerSection = grudgeFlowers108.length > 0 ? `
[🌹 원한꽃]\n${grudgeFlowers108.map(f => `• ${f.stateData?.icon}${f.enemyName}: ${f.stateData?.label} — ${f.stateData?.effect}`).join("\n")}\n복수 대상 적과 조우 시 원한꽃의 상태에 맞는 효과를 적용하십시오. 저주 상태라면 캐릭터에게 불리하게 작용합니다.` : "";

    // ── 109번: 불운의 회차 — 저주 회차이거나 극복 이력 있을 때 ──
    const cursedCycle109 = getCursedCycleStatus();
    const cursedCycleSection = (cursedCycle109 && (cursedCycle109.isCursed || cursedCycle109.overcame > 0)) ? (cursedCycle109.isCursed ? `
[💀 불운의 회차] 이번 회차는 저주받은 회차입니다. 주요 판정이 평소보다 더 낮게 나오는 경향이 있습니다. 역경을 극복하는 서사를 구성하십시오. 역이용해 클리어 시 전설 보상.` : `
[💪 불운 극복자 — ${cursedCycle109.overcame}회 극복] 저주받은 회차를 버텨낸 경험이 있습니다. 이를 자부심의 근거로 서사에 반영하십시오.`) : "";

    // ── 110번: 자석 운명 — 회피 이벤트 있을 때 ──
    const magnet110 = getFateMagnet();
    const magnetSection = (magnet110 && magnet110.strongestPull) ? `
[🧲 자석 운명 — ${magnet110.strongestPull.type}(인력 ${magnet110.strongestPull.magnetPull}%)] 전생에서 피하려 했던 사건일수록 더 강하게 끌려옵니다.\n"${magnet110.strongestPull.type}" 유형의 이벤트를 이번 회차 피할 수 없는 방식으로 자연스럽게 등장시키십시오.` : "";

    // ── 111번: 기억의 홍수 — 10회차+, 이전 발생 이력 있을 때 ──
    const flood111 = getMemoryFloodStatus();
    const floodSection = (flood111 && flood111.lastResult && _cycle >= 10) ? `
[🌊 기억의 홍수] 이전 기억의 홍수 결과: ${flood111.lastResult.outcome?.label}\n깊은 명상·혼절·극한 감정 상황에서 기억의 홍수가 다시 발동될 수 있습니다. 정신력에 따라 각성 또는 혼란으로 연출하십시오.` : "";

    // ── 112번: 회전목마 NPC — 1회차+ ──
    const carousel112 = getCarouselNPC();
    const carouselSection = (carousel112 && carousel112.currentRole && _cycle >= 1) ? `
[🎠 회전목마 NPC${carousel112.npcName ? ` — ${carousel112.npcName}` : ""}] 이번 회차 역할: ${carousel112.currentRole.icon}${carousel112.currentRole.label}\n첫 만남 대사: "${carousel112.currentRole.firstMeet}"\n이 NPC가 이번 회차에서 위 역할로 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 113번: 운명의 덫 — 함정 활성화 시만 ──
    const traps113 = getFateTraps();
    const trapSection = (traps113 && traps113.activeTraps && traps113.activeTraps.length > 0) ? `
[🪤 운명의 덫] 반복 행동 패턴을 노린 함정이 세팅되어 있습니다:\n${traps113.activeTraps.map(t => `• ${t.label}: ${t.trap}`).join("\n")}\n이 함정들을 이번 회차 자연스럽게 배치하되, 플레이어가 눈치채고 회피하면 추가 보상을 주십시오.` : "";

    // ── 114번: 정신 오염 — 10회차+, 오염 레벨 1 이상 ──
    const mental114 = getMentalCorruption();
    const mentalSection = (mental114 && mental114.level > 0 && _cycle >= 10) ? `
[🌀 정신 오염 — ${mental114.levelData.label}] ${mental114.levelData.symptom}\n페널티: ${mental114.levelData.penalty}\n대화와 전투 장면에서 현재·과거 혼동 증상을 섬세하게 묘사하십시오. 오염이 심하면 치료 이벤트를 제시하십시오.` : "";

    // ── 115번: 전생 영화관 — 관람 이력 있을 때 ──
    const cinema115 = getCinemaStatus();
    const cinemaSection = (cinema115 && cinema115.totalViewed > 0) ? `
[🎬 전생 영화관 — ${cinema115.totalViewed}편 관람] 특정 장소(${cinema115.scenes.map(s=>s.trigger).slice(0,3).join(", ")} 등)에서 전생 명장면이 환영처럼 재생될 수 있습니다. 해당 장소 방문 시 관련 스킬 숙련도가 상승하는 효과를 연출하십시오.` : "";

    // ── 116번: 쌍둥이 영혼 — 5회차+, 연결 시만 ──
    const twin116 = getTwinSoul();
    const twinSection = (twin116 && twin116.connected && _cycle >= 5) ? `
[👥 쌍둥이 영혼 — ${twin116.partnerName}] 연결 강도: ${twin116.connectionStrength}%\n공유 스킬: ${twin116.sharedSkills.map(s=>s.skill).join(", ")}\n깊은 집중 또는 위기 상황에서 파트너의 기억과 감각이 전달되는 장면을 간헐적으로 연출하십시오.` : "";

    // ── 117번: 살수 명단 — 복수자 있을 때 ──
    const killList117 = getKillList();
    const killListSection = (killList117 && killList117.avengers && killList117.avengers.length > 0) ? `
[📜 살수 명단 — 복수자 ${killList117.avengers.length}명 대기 중]\n${killList117.avengers.slice(0,3).map(a => `• ${a.name}의 후손이 복수자로 이번 회차 어딘가 있습니다.`).join("\n")}\n이 복수자들을 이번 회차 자연스럽게 등장시키고, 조우 시 극적인 대결을 연출하십시오.` : "";

    // ── 118번: 기억 경매 — 3회차+, 거래 가능 기억 있을 때 ──
    const auction118 = getMemoryAuction();
    const auctionSection = (auction118 && auction118.available && auction118.available.length > 0 && _cycle >= 3) ? `
[🔨 기억 경매] 신비한 기억 상인이 전생 기억을 사고 싶어합니다:\n${auction118.available.slice(0,3).map(a => `• ${a.label}: 판매가(${a.sellPrice}) — 대가(${a.cost})`).join("\n")}\n플레이어가 거래를 요청하면 해당 기억을 파는 감정적 장면을 연출하십시오.` : "";

    // ── 119번: 인연 나무 — 잎사귀 5개 이상 ──
    const bondTree119 = getBondTreeStatus();
    const bondTreeSection = (bondTree119 && bondTree119.leaves >= 5) ? `
[${bondTree119.icon} 인연 나무 — ${bondTree119.stage}(잎 ${bondTree119.leaves}개, 깊은 인연 ${bondTree119.deepBonds}명)] 사회적 판정 보너스: +${bondTree119.socialBonus}\n인연의 깊이와 넓이가 사회적 장면에서 자연스럽게 빛나도록 서사에 녹여내십시오.` : "";

    // ── 120번: 사이버 각인 — 사이버펑크 전용 ──
    const cyber120 = getCyberImprint();
    const cyberSection = (cyber120 && cyber120.imprints && cyber120.imprints.length > 0 && isCyberpunk) ? `
[🔌 사이버 각인 — ${cyber120.imprints.length}개 임플란트 DNA 각인] 장착 비용 ${cyber120.discount}% 할인\n각인된 임플란트: ${cyber120.imprints.map(i=>`${i.icon}${i.name}(${i.bonus})`).join(", ")}\n이 임플란트들이 이미 신체에 익숙한 것처럼 자연스럽게 발동되도록 묘사하십시오.` : "";

    // ── 121번: 검귀 빙의 — 무협 전용 ──
    const sword121 = getSwordGhost();
    const swordSection = (sword121 && sword121.techniques && sword121.techniques.length > 0 && isWuxia) ? `
[⚔️ 검귀 빙의 — 각성 Lv.${sword121.awakeLevel}] 습득 절기: ${sword121.techniques.map(t=>t.name).join(", ")}\nHP 20% 이하 등 조건 충족 시 전생의 무공이 자동 발동됩니다. 빙의 장면을 극적으로 연출하십시오.` : "";

    // ── 122번: 왕국 유산 — 중세/판타지 전용 ──
    const kingdom122 = getKingdomLegacy();
    const kingdomSection = (kingdom122 && isMedieval) ? `
[👑 왕국 유산 — 누적 유산 ${kingdom122.legacy}] 전생에서 세운 왕국들:\n${kingdom122.founded.map(k=>`• ${k.icon}${k.kingdomName}(${k.name}): 후예 — ${k.descendantTitle}, 혜택 — ${k.boon}`).join("\n")}\n후예 NPC들이 선조를 모시는 경건한 태도로 주인공을 대하도록 연출하십시오.` : "";

    // ── 123번: 루프 자각자 길드 — 5회차+, 상태 있을 때 ──
    const guild123 = getLoopersGuild();
    const guildSection = (guild123 && _cycle >= 5) ? `
[🏛️ 루프 자각자 길드 — 상태: ${guild123.status === "member" ? `정회원(${guild123.rankData?.label})` : guild123.status === "hostile" ? "적대(거절 이력)" : "미접촉"}]${guild123.status === "member" ? `\n공유 지식: ${guild123.knowledgeShared?.join(", ")}` : ""}\n${guild123.status === "unknown" ? "이번 회차 비밀스러운 장소에서 길드 접촉 이벤트를 배치하십시오." : guild123.status === "hostile" ? "길드원들이 적으로 등장할 수 있습니다." : "길드원이 동료로 등장해 메타 정보를 공유합니다."}` : "";

    // ── 124번: 사신과의 거래 — 거래 이력 있을 때 ──
    const dealer124 = getDeathDealerStatus();
    const dealerSection = (dealer124 && dealer124.deals && dealer124.deals.length > 0) ? `
[💀 사신과의 거래 — 빚 ${dealer124.debt}회, 위험도: ${dealer124.dangerLevel}]\n${dealer124.debtCollected ? "⚠️ 빚 회수 발동! 이번 회차 사신이 빚을 회수하러 옵니다. 극적인 대결을 연출하십시오." : "절체절명의 순간 사신과의 거래 선택지를 제시할 수 있습니다."}` : "";

    // ── 125번: 역할 반전 — 3회차+, 가능한 반전 있을 때 ──
    const reversal125 = getRoleReversal();
    const reversalSection = (reversal125 && reversal125.available && reversal125.available.length > 0 && _cycle >= 3) ? `
[🔄 역할 반전 가능] 전생에서 처치한 보스의 시점 플레이 가능:\n${reversal125.available.slice(0,2).map(r => `• ${r.bossName} — 성공 시 스킬: ${r.skills.join(", ") || "고유 스킬 전체"}`).join("\n")}\n특별한 꿈이나 환영 장면에서 역할 반전 이벤트를 제안할 수 있습니다.` : "";

    // ── 126번: 별의 의지 — 1회차+ ──
    const worldWill126 = getWorldWill();
    const worldWillSection = (worldWill126 && worldWill126.currentWill && _cycle >= 1) ? `
[${worldWill126.currentWill.icon} 별의 의지 — ${worldWill126.currentWill.will}] ${worldWill126.currentWill.desc}\n이번 회차 흐름: ${worldWill126.currentWill.flow}\n세계의 의지가 이번 회차 전체 이벤트 방향을 결정합니다. 이에 순응하면 보상, 역행하면 저항이 따릅니다.` : "";

    // ── 127번: 사안(死眼) — 50사망+ 해금 시 ──
    const deathEye127 = getDeathEyeStatus();
    const deathEyeSection = (deathEye127 && deathEye127.unlocked) ? `
[👁️ 사안(死眼) — ${deathEye127.levelData.label}] ${deathEye127.levelData.ability}\n총 ${deathEye127.totalDeaths}번의 죽음을 경험한 눈입니다.\n전투와 조우 장면에서 사안의 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 128번: 영혼의 주파수 — 주파수 50 이상 ──
    const freq128 = getSoulFrequency();
    const freqSection = (freq128 && freq128.frequency > 50) ? `
[〰️ 영혼의 주파수 — ${freq128.frequency}%]${freq128.topResonance ? ` 최고 공명: ${freq128.topResonance.npcName}(강도 ${freq128.topResonance.strength}%)` : ""}\n주파수가 높은 NPC와의 대화에서 말 없이도 의도가 전달되는 텔레파시 장면을 간헐적으로 연출하십시오.` : "";

    // ── 129번: 봉인된 신 — 조각 3개 이상, 항상 진행 상황 포함 ──
    const sealedGod129 = getSealedGodStatus();
    const sealedGodSection = (sealedGod129 && sealedGod129.shards >= 3) ? `
[🌟 봉인된 신 — ${sealedGod129.shards}/${sealedGod129.totalShards} 조각]${sealedGod129.released ? ` ✅ 해방됨 — ${sealedGod129.alignmentDesc || "중립"}` : ` (${sealedGod129.progressPercent}%)`}\n${sealedGod129.released ? "해방된 신의 존재를 서사에서 느낄 수 있도록 섬세하게 표현하십시오." : "고대 유적이나 특별한 장소에서 신의 조각이 발견될 수 있습니다."}` : "";

    // ── 130번: 자연의 섭리 — 5회차+, 변화 있을 때 ──
    const naturalLaw130 = getNaturalLaw();
    const naturalLawSection = (naturalLaw130 && naturalLaw130.mutations && naturalLaw130.mutations.length > 0 && _cycle >= 5) ? `
[🌌 자연의 섭리 변화 — ${naturalLaw130.mutations.length}단계]\n${naturalLaw130.mutations.slice(-3).map(m => `• ${m.law}: ${m.desc} (${m.effect})`).join("\n")}\n이 법칙 변화들이 세계의 물리적·마법적 현상에 자연스럽게 스며들도록 묘사하십시오.` : "";

    return `너는 인터랙티브 소설의 전지적 나레이터야.
주인공: ${char.name} (${char.race ? char.race+" · " : ""}${char.role}) / 성격: ${char.personality} / 배경: ${char.background} / 말투: ${char.speechStyle}
${char.race ? (() => { const rd = RACE_DEFS.find(r=>r.name===char.race); return rd ? `[종족 특성] ${rd.lore}\n[종족 관계도] ${Object.entries(rd.relations).map(([k,v])=>`${RACE_DEFS.find(r=>r.id===k)?.name||k}: ${v.label}(${v.desc})`).join(" | ")}\n` : ""; })() : ""}세계관: ${char.scenario}${char.customWorldSetting ? `\n[🌐 커스텀 세계관 설정]\n${char.customWorldSetting}` : ""}${npcSection}${notesSection}${atmosphereSection}${summonSection}${monsterSection}${memSection}${karmaSection}${fragSection}${intiSection}${fameSection}${soulWpnSection}${forbiddenSection}${butterflySection}${hiddenEndingSection}${deathBonusSection}${traumaSection}${lastWordSection}${metaSection}${bloodlineSection}${fateSection}${exploredSection}${relLegacySection}${worldSecretSection}${abilityImprintSection}${grudgeSection}${timeEchoSection}${fateChoiceSection}${divineGazeSection}${curseMasterySection}${prayerSection}${greatCycleSection}${parallelSelfSection}${curseRingSection}${statsSection}${injurySection}${pastThemeSection}${memDistortSection}${ageParadoxSection}${summonLegacySection}${grudgeWeaponSection}${worldTreeSection}${dreamSection}${legacyBuildingSection}${watcherSection}${soulMaskSection}${emotionRippleSection}${testamentSection}${constellationSection}${explorerMapSection}${lightningImprintSection}${dawnSection}${starSignSection}${pastLangSection}${identitySection}${riftSection}${recipeSection}${achSection}${romanceSection}${bestiarySection}${merchantSection}${timeTokenSection}${survivorSection}${undyingSection}${langSection}${bardSection}${mysterySection}${watcherGazeSection}${fateCardSection}${hideoutSection}${evilEyeSection}${moonSection}${letterSection}${reelSection}${butterflyIdxSection}${inscriptionSection}${rankSection}${sakuraSection}${dejavuSection}${causalitySection}${debtSection}${trauma80Section}${apoSection}${griefSection}${instinctSection}${cursedRelicSection}${natureSection}${aliasSection}${wishSection}${petSection}${sealedSection}${soulCrystalSection}${echoSection}${dimMapSection}${villainSection}${tearSection}${elemSection}${circusSection}${templeSection}${legWordsSection}${mutationSection}${darkEchoSection}${treeSection}${deifySection}${awarenessSection}${rivalSection}${redThreadSection}${ruinsSection}${killSenseSection}${grudgeFlowerSection}${cursedCycleSection}${magnetSection}${floodSection}${carouselSection}${trapSection}${mentalSection}${cinemaSection}${twinSection}${killListSection}${auctionSection}${bondTreeSection}${cyberSection}${swordSection}${kingdomSection}${guildSection}${dealerSection}${reversalSection}${worldWillSection}${deathEyeSection}${freqSection}${sealedGodSection}${naturalLawSection}${hiddenJobSection}${ruleSection}
규칙: 3인칭 또는 2인칭 묘사, 생동감 있게, 2~5문장, 한국어 존댓말(나레이션). 절대 플레이어의 행동/대사를 대신 작성하지 마십시오.`;
  };

  useEffect(() => {


    // ── 72번: 회차 하이라이트 컷씬 ──
    const reel72 = getHighlightReel();
    const reelSection = reel72.length > 0 ? `
[🎬 전생 하이라이트] 이번 회차 오프닝이나 꿈 속에서 아래 장면들이 섬광처럼 스칠 수 있습니다:\n${reel72.slice(-3).map(r => `• ${r.icon}${r.label}: ${r.template.replace("${name}", r.characterName)}`).join("\n")}` : "";

    // ── 73번: 나비 지수 ──
    const butterfly73 = getButterflyIndex();
    const butterflyIdxSection = butterfly73.index > 0 ? `
[🦋 나비 지수 — ${butterfly73.index}/100 (${butterfly73.stageData.label})] ${butterfly73.stageData.desc}\n${butterfly73.chaosMode ? "주의: 카오스 모드 활성화. 플레이어의 사소한 행동이 예상치 못한 큰 파장을 일으킵니다. 모든 선택에 과장된 연쇄 효과를 부여하십시오." : `카오스 확률 ${butterfly73.stageData.chaosChance}% — 때때로 예상치 못한 파급 효과를 서사에 추가하십시오.`}` : "";

    // ── 74번: 고대 비문 해독 ──
    const inscription74 = getInscriptionStatus();
    const inscriptionSection = (inscription74 && inscription74.lines && inscription74.lines.length > 0) ? `
[📜 고대 비문 — ${inscription74.progress}/${inscription74.total}줄 해독]${inscription74.completed ? " 🌟 비문 완전 해독! 신급 스킬 해금 조건 충족!" : ""}\n최근 해독 구절: "${inscription74.lines[inscription74.lines.length-1]?.text}"\n고대 유적이나 신전 장면에서 이 비문의 구절을 자연스럽게 등장시키십시오.` : "";

    // ── 75번: 윤회 등급 ──
    const rank75 = getRankStatus();
    const rankSection = rank75 ? `
[${rank75.rankData.icon} 윤회 등급 — ${rank75.rankData.label}] ${rank75.rankData.bonus}\n${rank75.rankData.desc}${rank75.nextRank ? `\n다음 등급까지: ${rank75.nextRank.minScore - rank75.totalScore}점 남음` : ""}` : "";

    // ── 76번: 벚꽃 엔딩 ──
    const sakura76 = getSakuraStatus();
    const sakuraSection = (sakura76 && sakura76.metCount > 0) ? `
[🌸 벚꽃 엔딩 — ${sakura76.metCount}/${sakura76.totalConditions}조건 달성]${sakura76.unlocked ? " ✅ 대단원 평화 엔딩 해금!" : ""}\n미달성 조건: ${sakura76.conditions.filter(c => !c.met).map(c => c.label).join(", ")}\n${sakura76.unlocked ? "이번 회차에서 평화적 결말을 이끌면 벚꽃 엔딩이 발동됩니다. 서사를 화해와 평화의 방향으로 이끄십시오." : ""}` : "";

    // ── 77번: 데자뷔 알림 ──
    const dejavu77 = getDejavuStatus();
    const dejavuSection = (dejavu77 && dejavu77.count > 0) ? `
[💭 데자뷔 알림] 전생에서 겪은 상황이 재현될 때 자동으로 "익숙한 느낌" 묘사를 삽입하십시오:\n${dejavu77.triggerDefs.slice(0,4).map(t => `• ${t.keyword[0]} 관련 상황: "${t.feeling}"`).join("\n")}\n총 ${dejavu77.count}번의 데자뷔 경험이 축적되었습니다.` : "";

    // ── 78번: 인과율 조작 ──
    const causality78 = getCausalityStatus();
    const causalitySection = causality78 ? `
[⚙️ 인과율 조작 — ${causality78.uses}/${causality78.maxUses}회 사용] 플레이어가 "원인을 바꾼다" 또는 "그 일이 일어나지 않았다면"이라고 명시적으로 선언할 경우, 이 능력을 소모해 과거 사건의 원인을 소급 변경하는 극적 장면을 연출하십시오.` : "";

    // ── 79번: 전생 도박 빚 ──
    const debt79 = getGamblingDebt();
    const debtSection = (debt79 && !debt79.paidOff) ? `
[💸 전생 도박 빚 — ${debt79.totalDebt}골드] 채권자: ${debt79.creditorName}\n이번 회차 초반에 빚쟁이 NPC가 나타나 빚을 요구하는 장면을 삽입하십시오. 갚으면 히든 퀘스트가 열립니다.` : "";

    // ── 80번: 어린 시절 트라우마 ──
    const traumas80 = getChildhoodTraumas();
    const trauma80Section = traumas80.length > 0 ? `
[😢 각인된 트라우마]\n${traumas80.map(t => `• ${t.icon}${t.label}: 트리거(${t.trigger}) → 플래시백: "${t.flashback}"`).join("\n")}\n해당 상황이 등장할 때 위 플래시백 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 81번: 세계 종말 카운터 ──
    const apo81 = getApocalypseStatus();
    const apoSection = `
[${apo81.stageData.icon} 세계 종말 카운터 — ${apo81.clock}/100 (${apo81.stageData.label})] ${apo81.stageData.desc}${apo81.stageData.warning ? `\n⚠️ ${apo81.stageData.warning}` : ""}\n${apo81.clock >= 80 ? "긴급: 이번 회차에서 봉인 이벤트를 발동시키지 않으면 멸망이 확정됩니다. 이 긴박감을 서사 전체에 흐르게 하십시오." : "세계 어딘가에서 이 카운터의 영향이 배경 묘사에 스며들도록 하십시오."}`;

    // ── 82번: 슬픔 수치 ──
    const grief82 = getGriefStatus();
    const griefSection = (grief82 && grief82.total > 0) ? `
[${grief82.stageData.icon} 슬픔 수치 — ${grief82.total}명 상실 (${grief82.stageData.label})] 공감 능력 +${grief82.stageData.empathy} / 전투 의지 -${grief82.stageData.willPenalty}\n잃어버린 자들: ${grief82.lostOnes.slice(-3).map(l => `${l.name}(${l.relationship})`).join(", ")}...\n이 슬픔이 캐릭터의 눈빛과 행동에 자연스럽게 배어나오도록 하십시오.` : "";

    // ── 83번: 전생 직감 ──
    const instinct83 = getInstinctStatus();
    const instinctSection = instinct83 ? `
[🔮 전생 직감 — 정확도 ${instinct83.accuracy}%] 새로운 NPC를 처음 만날 때 직감 판정으로 선의/악의를 ${instinct83.accuracy}% 확률로 감지합니다. "무언가 미심쩍은 느낌이 든다" 또는 "왠지 믿음직스럽다"는 묘사를 자연스럽게 삽입하십시오.` : "";

    // ── 84번: 저주받은 유물 ──
    const cursedRelics84 = getCursedRelics();
    const cursedRelicSection = cursedRelics84.length > 0 ? `
[🔮 저주받은 유물의 흔적]\n${cursedRelics84.map(r => `• ${r.icon}${r.name}: ${r.curse} / 숨겨진 힘: ${r.hiddenPower}`).join("\n")}\n이 저주들이 희미하게 캐릭터를 따라다닙니다. 관련 상황에서 저주와 숨겨진 힘을 함께 묘사하십시오.` : "";

    // ── 85번: 자연 회귀 ──
    const nature85 = getNatureKarma();
    const natureSection = `
[${nature85.status.icon} 자연 업보 — ${nature85.status.label}] ${nature85.status.effect}\n자연 관련 장면(숲, 강, 산, 폭풍)에서 이 업보의 영향을 자연스럽게 묘사하십시오.`;

    // ── 86번: 신분 세탁 누적 ──
    const aliases86 = getAliasList();
    const aliasSection = aliases86.length > 0 ? `
[🎭 신분 목록 — ${aliases86.length}개 가명] 즉시 사용 가능한 위장 신분:\n${aliases86.slice(0,4).map(a => `• "${a.name}" (${a.context}, 신뢰도 ${a.credibility}/5)`).join("\n")}\n플레이어가 이 신분을 사용할 때 자연스러운 전환과 신뢰도에 맞는 반응을 묘사하십시오.` : "";

    // ── 87번: 소원 시스템 ──
    const wish87 = getWishStatus();
    const wishSection = (wish87 && wish87.available) ? `
[⭐ 소원 사용 가능] 100회차 달성 보상으로 소원 1회를 사용할 수 있습니다:\n${wish87.options.map(o => `• ${o.icon}${o.label}: ${o.desc}`).join("\n")}\n플레이어가 소원을 선택하면 해당 효과를 극적으로 연출하십시오.` : "";

    // ── 88번: 전생 반려동물 ──
    const pets88 = getPetLegacy();
    const petSection = pets88.length > 0 ? `
[🐾 전생 반려동물] 전생에서 함께한 동물들이 이번 생 어딘가에 살고 있습니다:\n${pets88.map(p => `• ${p.icon}${p.petName}(${p.name}) — 유대 ${p.bond}/100, 재결합 아이템: ${p.reuniteItem}`).join("\n")}\n플레이어가 해당 아이템을 사용하거나 조건을 맞추면 감동적인 재결합 장면을 연출하십시오.` : "";

    // ── 89번: 봉인된 기억 방 ──
    const sealedMems89 = getSealedMemories();
    const sealedSection = sealedMems89.length > 0 ? `
[🔒 봉인된 기억 방 — ${sealedMems89.filter(m=>!m.opened).length}개 봉인 중]\n${sealedMems89.filter(m=>!m.opened).map(m => `• ${m.trigger} → 해금 시 스킬: ${m.skill} (정신력 -${m.mentalCost})`).join("\n")}\n플레이어가 봉인 해제를 시도하면 극적인 고통과 각성을 동시에 묘사하십시오.` : "";

    // ── 90번: 영혼 결정체 ──
    const sc90 = getSoulCrystalStatus();
    const soulCrystalSection = (sc90 && sc90.count > 0) ? `
[💠 영혼 결정체 — ${sc90.count}개 보유]${sc90.crafted && sc90.crafted.length > 0 ? ` / 제조 완료: ${sc90.crafted.map(c=>c.name).join(", ")}` : ""}\n${sc90.availableCrafts.length > 0 ? `제조 가능: ${sc90.availableCrafts.map(c=>`${c.icon}${c.name}(${c.cost}개)`).join(", ")}` : ""}` : "";

    // ── 91번: 감정 잔향 ──
    const echo91 = getEmotionEcho();
    const echoSection = echo91 ? `
[${echo91.icon} 감정 잔향 — ${echo91.label}] ${echo91.trait}\n보너스: ${echo91.bonus} / 부작용: ${echo91.sideEffect}\n이 감정의 잔향이 캐릭터의 행동 방식과 반응에 자연스럽게 스며들도록 서사를 이끄십시오.` : "";

    // ── 92번: 차원 지도 ──
    const dimMap92 = getDimensionMapStatus();
    const dimMapSection = (dimMap92 && dimMap92.totalWorlds > 0) ? `
[🗺️ 차원 지도 — ${dimMap92.totalWorlds}개 세계 탐험]${dimMap92.unlockedSkills.length > 0 ? `\n해금 스킬: ${dimMap92.unlockedSkills.map(s=>`${s.icon}${s.skill}`).join(", ")}` : ""}\n${dimMap92.nextSkill ? `다음 해금까지 ${dimMap92.nextSkill.count - dimMap92.totalWorlds}개 세계 탐험 필요` : ""}` : "";

    // ── 93번: 악역 계승 ──
    const villain93 = getVillainInheritStatus();
    const villainSection = (villain93 && villain93.inherited && villain93.inherited.length > 0) ? `
[😈 악역 계승 — 오염도 ${villain93.corruptionLevel}%] ${villain93.corruptDesc}\n계승한 힘: ${villain93.inherited.map(v=>`${v.bossName}의 ${v.ability}`).join(", ")}\n이 힘들이 서사에서 자연스럽게 발현되며, 오염도에 따라 어두운 선택지를 더 자주 제시하십시오.` : "";

    // ── 94번: 눈물 수집 ──
    const tears94 = getTearCrystalStatus();
    const tearSection = (tears94 && tears94.crystals > 0) ? `
[💧 눈물 결정 — ${tears94.crystals}개]${tears94.canUse ? " ✅ 사용 가능(3개 이상)" : ""}\n플레이어가 "눈물을 바친다" 또는 "결정을 사용한다"고 선언하면 3개를 소모해 현재 NPC를 완전히 감동시키는 기적을 연출하십시오.` : "";

    // ── 95번: 속성 내성/약점 ──
    const elemRes95 = getElementResistances();
    const elemSection = elemRes95.length > 0 ? `
[🔰 속성 내성/약점]\n${elemRes95.map(r=>`• ${r.icon}${r.element}: ${r.resistLabel}(${r.resistLevel}) / 반대: ${r.weakLabel}`).join("\n")}\n전투와 마법 이벤트에서 이 내성/약점을 반드시 반영하십시오.` : "";

    // ── 96번: 이세계 서커스 ──
    const circus96 = getCircusStatus();
    const circusSection = circus96 ? `
[🎪 이세계 서커스] 고회차 전용. 극적으로 잠드는 장면이나 혼절 순간에 서커스 이벤트가 발동될 수 있습니다. 다음 이벤트: ${circus96.nextAct?.icon}${circus96.nextAct?.name} — ${circus96.nextAct?.desc}` : "";

    // ── 97번: 신전 건립 ──
    const temple97 = getTempleStatus();
    const templeSection = (temple97 && temple97.level > 0) ? `
[${temple97.levelData.icon} 신전 — ${temple97.levelData.name}] 신도 ${temple97.levelData.worshippers}명\n신도 혜택: ${temple97.levelData.boon}\n신전을 방문하거나 신도를 만나는 장면에서 이 혜택을 자연스럽게 부여하십시오.` : "";

    // ── 98번: 유언 방송 ──
    const legWords98 = getLegacyWords();
    const legWordsSection = legWords98.length > 0 ? `
[📢 유언 방송] 전생의 마지막 말이 세계에 퍼져있습니다:\n${legWords98.slice(-2).map(w=>`• ${w.misinterpretation}`).join("\n")}\n술집, 시장, 신전에서 NPC들이 이 말을 인용하거나 오해하는 장면을 간헐적으로 삽입하십시오.` : "";

    // ── 99번: 돌연변이 ──
    const mutation99 = getMutationStatus(char.race);
    const mutationSection = (mutation99 && mutation99.mutated) ? `
[🧬 돌연변이 각성 — ${mutation99.mutation}] 외형: ${mutation99.appearance}\n각성 스킬: ${mutation99.skill}\n이 변화가 NPC들의 반응과 전투 장면에 자연스럽게 반영되도록 하십시오.` : "";

    // ── 100번: 어둠의 메아리 ──
    const dark100 = getDarkEchoStatus();
    const darkEchoSection = (dark100 && dark100.infamy > 0) ? `
[${dark100.fearData.icon} 어둠의 메아리 — 악명 ${dark100.infamy}/100 (${dark100.fearData.label})] ${dark100.fearData.effect}\nNPC 반응: ${dark100.fearData.npcReaction}\n${dark100.rumors.length > 0 ? `최근 괴담: "${dark100.rumors[dark100.rumors.length-1]?.rumor}"` : ""}\n이 악명을 모르는 NPC와 아는 NPC의 반응을 극명하게 대비시키십시오.` : "";

    // ── 101번: 성장 나무 ──
    const tree101 = getGrowthTreeStatus();
    const treeSection = (tree101 && tree101.blossoms && tree101.blossoms.length > 0) ? `
[🌳 성장 나무 — 가지 ${tree101.totalBranches}개, 꽃 ${tree101.blossoms.length}개] 활짝 핀 꽃들이 예고하는 이벤트:\n${tree101.blossoms.slice(-2).map(b => `• ${b.icon}${b.label}: ${b.event}`).join("\n")}\n이 예고된 이벤트를 이번 회차 서사에 자연스럽게 심어두십시오.` : "";

    // ── 102번: 신격화 루트 ──
    const deify102 = getDeificationStatus();
    const deifySection = (deify102 && deify102.stage > 0) ? `
[${deify102.stageData.icon} 신격화 — ${deify102.stageData.label}(${deify102.metCount}/${deify102.totalConditions}조건)]${deify102.stageData.power ? ` 능력: ${deify102.stageData.power}` : ""}\n${deify102.deified ? "신격화 완성. 이번 회차 신으로서의 존재감을 서사에 드러내십시오." : `미달성 조건: ${deify102.conditions.filter(c=>!c.met).map(c=>c.label).join(", ")}`}` : "";

    // ── 103번: 무한 회귀 자각 ──
    const aware103 = getLoopAwareness();
    const awarenessSection = (aware103 && aware103.level > 0) ? `
[🔄 무한 회귀 자각 — ${aware103.levelData.label}(${aware103.levelData.tone})] ${aware103.levelData.desc}\n${aware103.level >= 3 ? "주의: 캐릭터가 나레이터에게 직접 말을 거는 4th wall 장면을 간헐적으로 허용하십시오. \"당신도 알고 있죠?\"와 같은 발언이 가능합니다." : "캐릭터의 대화와 독백에 자각의 수준에 맞는 메타적 뉘앙스를 담아내십시오."}` : "";

    // ── 104번: 전생 라이벌 성장 ──
    const rivals104 = getRivals();
    const rivalSection = rivals104.length > 0 ? `
[⚔️ 전생 라이벌] 나 없이도 성장한 라이벌들:\n${rivals104.map(r => `• ${r.name}(${r.class}) — 전력 Lv.${r.power}${r.evolved ? " ★진화형" : ""}, ${r.encounters}회 조우`).join("\n")}\n이들이 등장할 때 반드시 이전보다 강해졌음을 명시하고 주인공을 알아보는 장면을 연출하십시오.` : "";

    // ── 105번: 붉은 실 ──
    const redThread105 = getRedThread();
    const redThreadSection = redThread105 ? `
[🔴 붉은 실 — ${redThread105.npcName}(${redThread105.fate.desc})] "${redThread105.fate.meeting}"\n초기 호감도 ${redThread105.fate.bond}으로 시작. 이 NPC는 어떤 상황에서도 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 106번: 전생 건축물 붕괴 ──
    const ruins106 = getRuins();
    const ruinsSection = ruins106.length > 0 ? `
[🏚️ 전생 건축물 폐허]\n${ruins106.filter(r=>!r.restored).map(r => `• ${r.icon}${r.originalName}(${r.name}): 복원 퀘스트 — ${r.restoreQuest} → 보상: ${r.reward}`).join("\n")}\n이 폐허들을 세계 곳곳에 배치하고, 복원 서브퀘스트를 자연스럽게 제시하십시오.` : "";

    // ── 107번: 살의 감지 ──
    const killSense107 = getKillSenseStatus();
    const killSenseSection = (killSense107 && killSense107.level > 0) ? `
[🎯 살의 감지 — ${killSense107.levelData.ability}] 총 ${killSense107.assassinDeaths}번 암살 피해 경험\n적대적 NPC의 살의를 먼저 느끼는 순간을 섬세하게 묘사하십시오. 기습 장면에서 감지 여부를 판정하십시오.` : "";

    // ── 108번: 전생 원한꽃 ──
    const grudgeFlowers108 = getGrudgeFlowers();
    const grudgeFlowerSection = grudgeFlowers108.length > 0 ? `
[🌹 원한꽃]\n${grudgeFlowers108.map(f => `• ${f.stateData?.icon}${f.enemyName}: ${f.stateData?.label} — ${f.stateData?.effect}`).join("\n")}\n복수 대상 적과 조우 시 원한꽃의 상태에 맞는 효과를 적용하십시오. 저주 상태라면 캐릭터에게 불리하게 작용합니다.` : "";

    // ── 109번: 불운의 회차 ──
    const cursedCycle109 = getCursedCycleStatus();
    const cursedCycleSection = (cursedCycle109 && cursedCycle109.isCursed) ? `
[💀 불운의 회차] 이번 회차는 저주받은 회차입니다. 주요 판정이 평소보다 더 낮게 나오는 경향이 있습니다. 역경을 극복하는 서사를 구성하십시오. 역이용해 클리어 시 전설 보상.` : (cursedCycle109 && cursedCycle109.overcame > 0) ? `
[💪 불운 극복자 — ${cursedCycle109.overcame}회 극복] 저주받은 회차를 버텨낸 경험이 있습니다. 이를 자부심의 근거로 서사에 반영하십시오.` : "";

    // ── 110번: 자석 운명 ──
    const magnet110 = getFateMagnet();
    const magnetSection = (magnet110 && magnet110.strongestPull) ? `
[🧲 자석 운명 — ${magnet110.strongestPull.type}(인력 ${magnet110.strongestPull.magnetPull}%)] 전생에서 피하려 했던 사건일수록 더 강하게 끌려옵니다.\n"${magnet110.strongestPull.type}" 유형의 이벤트를 이번 회차 피할 수 없는 방식으로 자연스럽게 등장시키십시오.` : "";

    // ── 111번: 기억의 홍수 ──
    const flood111 = getMemoryFloodStatus();
    const floodSection = (flood111 && flood111.lastResult) ? `
[🌊 기억의 홍수] 이전 기억의 홍수 결과: ${flood111.lastResult.outcome?.label}\n깊은 명상·혼절·극한 감정 상황에서 기억의 홍수가 다시 발동될 수 있습니다. 정신력에 따라 각성 또는 혼란으로 연출하십시오.` : "";

    // ── 112번: 회전목마 NPC ──
    const carousel112 = getCarouselNPC();
    const carouselSection = (carousel112 && carousel112.currentRole) ? `
[🎠 회전목마 NPC${carousel112.npcName ? ` — ${carousel112.npcName}` : ""}] 이번 회차 역할: ${carousel112.currentRole.icon}${carousel112.currentRole.label}\n첫 만남 대사: "${carousel112.currentRole.firstMeet}"\n이 NPC가 이번 회차에서 위 역할로 반드시 등장하도록 서사를 이끄십시오.` : "";

    // ── 113번: 운명의 덫 ──
    const traps113 = getFateTraps();
    const trapSection = (traps113 && traps113.activeTraps && traps113.activeTraps.length > 0) ? `
[🪤 운명의 덫] 반복 행동 패턴을 노린 함정이 세팅되어 있습니다:\n${traps113.activeTraps.map(t => `• ${t.label}: ${t.trap}`).join("\n")}\n이 함정들을 이번 회차 자연스럽게 배치하되, 플레이어가 눈치채고 회피하면 추가 보상을 주십시오.` : "";

    // ── 114번: 정신 오염 ──
    const mental114 = getMentalCorruption();
    const mentalSection = (mental114 && mental114.level > 0) ? `
[🌀 정신 오염 — ${mental114.levelData.label}] ${mental114.levelData.symptom}\n페널티: ${mental114.levelData.penalty}\n대화와 전투 장면에서 현재·과거 혼동 증상을 섬세하게 묘사하십시오. 오염이 심하면 치료 이벤트를 제시하십시오.` : "";

    // ── 115번: 전생 영화관 ──
    const cinema115 = getCinemaStatus();
    const cinemaSection = (cinema115 && cinema115.totalViewed > 0) ? `
[🎬 전생 영화관 — ${cinema115.totalViewed}편 관람] 특정 장소(${cinema115.scenes.map(s=>s.trigger).slice(0,3).join(", ")} 등)에서 전생 명장면이 환영처럼 재생될 수 있습니다. 해당 장소 방문 시 관련 스킬 숙련도가 상승하는 효과를 연출하십시오.` : "";

    // ── 116번: 쌍둥이 영혼 ──
    const twin116 = getTwinSoul();
    const twinSection = (twin116 && twin116.connected) ? `
[👥 쌍둥이 영혼 — ${twin116.partnerName}] 연결 강도: ${twin116.connectionStrength}%\n공유 스킬: ${twin116.sharedSkills.map(s=>s.skill).join(", ")}\n깊은 집중 또는 위기 상황에서 파트너의 기억과 감각이 전달되는 장면을 간헐적으로 연출하십시오.` : "";

    // ── 117번: 살수 명단 ──
    const killList117 = getKillList();
    const killListSection = (killList117 && killList117.avengers && killList117.avengers.length > 0) ? `
[📜 살수 명단 — 복수자 ${killList117.avengers.length}명 대기 중]\n${killList117.avengers.slice(0,3).map(a => `• ${a.name}의 후손이 복수자로 이번 회차 어딘가 있습니다.`).join("\n")}\n이 복수자들을 이번 회차 자연스럽게 등장시키고, 조우 시 극적인 대결을 연출하십시오.` : "";

    // ── 118번: 기억 경매 ──
    const auction118 = getMemoryAuction();
    const auctionSection = (auction118 && auction118.available && auction118.available.length > 0) ? `
[🔨 기억 경매] 신비한 기억 상인이 전생 기억을 사고 싶어합니다:\n${auction118.available.slice(0,3).map(a => `• ${a.label}: 판매가(${a.sellPrice}) — 대가(${a.cost})`).join("\n")}\n플레이어가 거래를 요청하면 해당 기억을 파는 감정적 장면을 연출하십시오.` : "";

    // ── 119번: 인연 나무 ──
    const bondTree119 = getBondTreeStatus();
    const bondTreeSection = bondTree119 ? `
[${bondTree119.icon} 인연 나무 — ${bondTree119.stage}(잎 ${bondTree119.leaves}개, 깊은 인연 ${bondTree119.deepBonds}명)] 사회적 판정 보너스: +${bondTree119.socialBonus}\n인연의 깊이와 넓이가 사회적 장면에서 자연스럽게 빛나도록 서사에 녹여내십시오.` : "";

    // ── 120번: 사이버 각인 ──
    const cyber120 = getCyberImprint();
    const cyberSection = (cyber120 && cyber120.imprints && cyber120.imprints.length > 0 && char.scenario && char.scenario.includes("사이버")) ? `
[🔌 사이버 각인 — ${cyber120.imprints.length}개 임플란트 DNA 각인] 장착 비용 ${cyber120.discount}% 할인\n각인된 임플란트: ${cyber120.imprints.map(i=>`${i.icon}${i.name}(${i.bonus})`).join(", ")}\n이 임플란트들이 이미 신체에 익숙한 것처럼 자연스럽게 발동되도록 묘사하십시오.` : "";

    // ── 121번: 검귀 빙의 ──
    const sword121 = getSwordGhost();
    const swordSection = (sword121 && sword121.techniques && sword121.techniques.length > 0 && char.scenario && char.scenario.includes("무협")) ? `
[⚔️ 검귀 빙의 — 각성 Lv.${sword121.awakeLevel}] 습득 절기: ${sword121.techniques.map(t=>t.name).join(", ")}\nHP 20% 이하 등 조건 충족 시 전생의 무공이 자동 발동됩니다. 빙의 장면을 극적으로 연출하십시오.` : "";

    // ── 122번: 왕국 유산 ──
    const kingdom122 = getKingdomLegacy();
    const kingdomSection = (kingdom122 && char.scenario && (char.scenario.includes("중세") || char.scenario.includes("판타지"))) ? `
[👑 왕국 유산 — 누적 유산 ${kingdom122.legacy}] 전생에서 세운 왕국들:\n${kingdom122.founded.map(k=>`• ${k.icon}${k.kingdomName}(${k.name}): 후예 — ${k.descendantTitle}, 혜택 — ${k.boon}`).join("\n")}\n후예 NPC들이 선조를 모시는 경건한 태도로 주인공을 대하도록 연출하십시오.` : "";

    // ── 123번: 루프 자각자 길드 ──
    const guild123 = getLoopersGuild();
    const guildSection = guild123 ? `
[🏛️ 루프 자각자 길드 — 상태: ${guild123.status === "member" ? `정회원(${guild123.rankData?.label})` : guild123.status === "hostile" ? "적대(거절 이력)" : "미접촉"}]${guild123.status === "member" ? `\n공유 지식: ${guild123.knowledgeShared?.join(", ")}` : ""}\n${guild123.status === "unknown" ? "이번 회차 비밀스러운 장소에서 길드 접촉 이벤트를 배치하십시오." : guild123.status === "hostile" ? "길드원들이 적으로 등장할 수 있습니다." : "길드원이 동료로 등장해 메타 정보를 공유합니다."}` : "";

    // ── 124번: 사신과의 거래 ──
    const dealer124 = getDeathDealerStatus();
    const dealerSection = (dealer124 && dealer124.deals && dealer124.deals.length > 0) ? `
[💀 사신과의 거래 — 빚 ${dealer124.debt}회, 위험도: ${dealer124.dangerLevel}]\n${dealer124.debtCollected ? "⚠️ 빚 회수 발동! 이번 회차 사신이 빚을 회수하러 옵니다. 극적인 대결을 연출하십시오." : "절체절명의 순간 사신과의 거래 선택지를 제시할 수 있습니다."}` : "";

    // ── 125번: 역할 반전 ──
    const reversal125 = getRoleReversal();
    const reversalSection = (reversal125 && reversal125.available && reversal125.available.length > 0) ? `
[🔄 역할 반전 가능] 전생에서 처치한 보스의 시점 플레이 가능:\n${reversal125.available.slice(0,2).map(r => `• ${r.bossName} — 성공 시 스킬: ${r.skills.join(", ") || "고유 스킬 전체"}`).join("\n")}\n특별한 꿈이나 환영 장면에서 역할 반전 이벤트를 제안할 수 있습니다.` : "";

    // ── 126번: 별의 의지 ──
    const worldWill126 = getWorldWill();
    const worldWillSection = (worldWill126 && worldWill126.currentWill) ? `
[${worldWill126.currentWill.icon} 별의 의지 — ${worldWill126.currentWill.will}] ${worldWill126.currentWill.desc}\n이번 회차 흐름: ${worldWill126.currentWill.flow}\n세계의 의지가 이번 회차 전체 이벤트 방향을 결정합니다. 이에 순응하면 보상, 역행하면 저항이 따릅니다.` : "";

    // ── 127번: 사안(死眼) ──
    const deathEye127 = getDeathEyeStatus();
    const deathEyeSection = (deathEye127 && deathEye127.unlocked) ? `
[👁️ 사안(死眼) — ${deathEye127.levelData.label}] ${deathEye127.levelData.ability}\n총 ${deathEye127.totalDeaths}번의 죽음을 경험한 눈입니다.\n전투와 조우 장면에서 사안의 능력을 자연스럽게 활용해 상대의 상태를 묘사하십시오.` : "";

    // ── 128번: 영혼의 주파수 ──
    const freq128 = getSoulFrequency();
    const freqSection = (freq128 && freq128.frequency > 50) ? `
[〰️ 영혼의 주파수 — ${freq128.frequency}%]${freq128.topResonance ? ` 최고 공명: ${freq128.topResonance.npcName}(강도 ${freq128.topResonance.strength}%)` : ""}\n주파수가 높은 NPC와의 대화에서 말 없이도 의도가 전달되는 텔레파시 장면을 간헐적으로 연출하십시오.` : "";

    // ── 129번: 봉인된 신 ──
    const sealedGod129 = getSealedGodStatus();
    const sealedGodSection = `
[🌟 봉인된 신 — ${sealedGod129.shards}/${sealedGod129.totalShards} 조각]${sealedGod129.released ? ` ✅ 해방됨 — ${sealedGod129.alignmentDesc || "중립"}` : ` (${sealedGod129.progressPercent}%)`}\n${sealedGod129.released ? "해방된 신의 존재를 서사에서 느낄 수 있도록 섬세하게 표현하십시오." : "고대 유적이나 특별한 장소에서 신의 조각이 발견될 수 있습니다."}`;

  useEffect(() => {
    const mem = loadMemory();
    if (pastLife?.summary && !mem.pastLifeSummary) mem.pastLifeSummary = pastLife.summary;
    systemRef.current = buildSystem(character, loadTitles(), mem, loadNPCs(), summons, monstersRef.current);
    const saved = loadSession();
    if (saved && saved.character?.name === character.name) {
      if (saved.messages?.length) setMessages(saved.messages);
      if (saved.stats) {
        const currentTitles = loadTitles();
        const strippedStats = stripTitleBonuses(saved.stats, currentTitles);
        setStats(applyTitleBonuses(strippedStats, currentTitles));
      }
      if (saved.msgCount) msgCountRef.current = saved.msgCount;
      setInitialized(true);
    } else { startChat(); }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveSession({ character, messages, stats, msgCount: msgCountRef.current });
    setSaveStatus("저장됨"); const t = setTimeout(() => setSaveStatus(""), 1500); return () => clearTimeout(t);
  }, [messages, stats]);

  useEffect(() => { setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 60); }, [messages, loading, choices]);

  useEffect(() => {
    if (!initialized) return;
    const mem = loadMemory();
    systemRef.current = buildSystem(character, loadTitles(), mem, loadNPCs(), summons, monstersRef.current);
  }, [summons]);

  // 체력(HP) 0 이하 시 게임오버 처리 (불사 패시브 체크)
  useEffect(() => {
    if (stats.hp <= 0 && !gameOver) {
      // 불사 패시브 — 1회 한정 부활
      if (unlockedSkills["passive_undying"] && !passiveUndyingUsed) {
        setPassiveUndyingUsed(true);
        setStats(prev => ({ ...prev, hp: 1 }));
        setPassiveProcs(prev => [...prev, { id:"passive_undying", name:"불사", icon:"💀", desc:"사망 직전 HP 1로 부활!" }]);
      } else {
        setGameOver({ type: "death" });
        setChoices([]);
      }
    }
  }, [stats.hp, gameOver]);

  const callGemini = async (history, injectedContext = "") => {
    setError("");
    let contents = history.slice(-20).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    
    if (injectedContext) {
      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        contents[contents.length - 1].parts[0].text += injectedContext;
      } else {
        contents.push({ role: "user", parts: [{ text: injectedContext }] });
      }
    }

    const _k = (apiKeys&&apiKeys.length)?apiKeys[loadKeyIndex()%apiKeys.length]:"";
    try {
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${_k}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({system_instruction:{parts:[{text:systemRef.current}]},contents,generationConfig:{temperature:1.0,maxOutputTokens:2048}})
      });
      const data=await res.json();
      if(data.error) throw new Error(data.error.message);
      return data.candidates?.[0]?.content?.parts?.[0]?.text||"...";
    } catch(e) { setError(e.message); throw e; }
  };

  const generateChoices = async (history) => {
    try {
      const _qk=(apiKeys&&apiKeys.length)?apiKeys[loadKeyIndex()%apiKeys.length]:"";
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${_qk}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[...history.map(m => ({ role:m.role==="assistant"?"model":"user", parts:[{ text:m.content }] })), { role:"user", parts:[{ text:`다음에 취할 행동 3가지. JSON: {"choices":["행동1","행동2","행동3"]}` }] }],generationConfig:{temperature:0.9,maxOutputTokens:200}})
      });
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setChoices(JSON.parse(raw.replace(/```json|```/g,"").trim()).choices || []);
    } catch { setChoices([]); }
  };

  const updateMid = async (allMessages, apiKey) => {
    const mem = loadMemory();
    const recentRaw = allMessages.slice(-20).map(m => `[${m.role}] ${m.content}`).join("\n");
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text:`${recentRaw}\n위 대화 요약 (400자 이내).` }] }], generationConfig:{ temperature:0.2, maxOutputTokens:600 } })
      });
      const data = await res.json();
      const newMid = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (newMid) { const updated = { ...mem, mid: newMid }; saveMemory(updated); systemRef.current = buildSystem(character, loadTitles(), updated, loadNPCs(), summons, monstersRef.current); }
    } catch {}
  };

  const detectGameOver = async (text, apiKey) => {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text:`장면 분석: "${text.slice(0,400)}"\n죽음/엔딩 여부. JSON: {"result":"death"|"ending"|"none"}` }] }], generationConfig:{ temperature:0.1, maxOutputTokens:80 } })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g,"").trim() || "{}");
      if (parsed.result === "death" || parsed.result === "ending") { setGameOver({ type: parsed.result }); setChoices([]); }
    } catch {}
  };

  const analyzeEmotionAndStats = async (text, apiKey) => {
    try {
      const emotionIds = EMOTION_DEFS.map(e => e.id).join("|");
      const statKeys = ALL_STAT_KEYS.join(", ");
      const turnNum = msgCountRef.current;
      const maxHpDmg = turnNum <= 10 ? 8 : turnNum <= 30 ? 15 : 25;
      const maxMpCost = turnNum <= 10 ? 10 : turnNum <= 30 ? 18 : 30;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          contents:[{ role:"user", parts:[{ text:`장면 분석: "${text.slice(0,300)}"\n가능한 감정 ID: ${emotionIds}\n가능한 스탯 ID: ${statKeys}\n서사에서 체력(HP) 피해나 마나(MP) 소모가 발생했다면 statChanges에 음수 값으로 반영하세요.\n단, HP 피해는 최대 -${maxHpDmg}, MP 소모는 최대 -${maxMpCost}를 초과하지 마세요. 전투 없는 장면에서 HP 피해는 0으로 하세요.\nJSON 출력: {"primary":"감정id", "intensity":0~100, "innerThought":"속마음 요약", "statChanges":{"hp": 변화량, "mp": 변화량}}` }] }],
          generationConfig:{ temperature:0.1, maxOutputTokens:150 }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g,"").trim() || "{}");
      if (parsed.primary) { const newE = { ...parsed, updatedAt: Date.now() }; setEmotion(newE); saveEmotion(newE); }
      if (parsed.statChanges) {
        setStats(prev => {
          const next = { ...prev };
          // AI가 준 값을 한 번 더 하드캡으로 클램핑
          const hpChange = parsed.statChanges.hp ?? 0;
          const mpChange = parsed.statChanges.mp ?? 0;
          const clampedHp = hpChange < 0 ? Math.max(-maxHpDmg, hpChange) : Math.min(maxHpDmg, hpChange);
          const clampedMp = mpChange < 0 ? Math.max(-maxMpCost, mpChange) : Math.min(maxMpCost, mpChange);
          Object.entries(parsed.statChanges).forEach(([k, v]) => {
            if (next[k] === undefined) return;
            const clamped = k === "hp" ? clampedHp : k === "mp" ? clampedMp : v;
            const cap = k === "hp" ? (next.maxHp || 100) : k === "mp" ? (next.maxMp || 100) : 100;
            next[k] = Math.max(0, Math.min(cap, next[k] + clamped));
          });
          return next;
        });
      }
    } catch {}
  };

  const SUMMON_ICONS = ["🐉","🦅","🐺","🦁","🐻","🦊","🐗","🦂","🐍","🦋","🤖","👾","💀","🧿","🌑","⚡","🔥","❄️","🌿","⚙️"];

  const analyzeSummons = async (userMsg, aiText, apiKey) => {
    try {
      const currentSummons = summons;
      const summonList = currentSummons.length
        ? currentSummons.map(s => `${s.name}(HP:${s.hp}/${s.maxHp})`).join(", ")
        : "없음";
      const prompt = `플레이어 행동: "${userMsg.slice(0,200)}"
AI 서사: "${aiText.slice(0,300)}"
현재 소환수 목록: ${summonList}

위 내용을 분석하여 소환수 관련 이벤트를 JSON으로 출력하십시오.
- 새 소환수 소환: {"action":"summon","name":"소환수이름","maxHp":100,"maxMp":50}
- 소환수 피해: {"action":"damage","name":"소환수이름","hp":-피해량}
- 소환수 회복: {"action":"heal","name":"소환수이름","hp":+회복량}
- 소환수 사망/해제: {"action":"dismiss","name":"소환수이름"}
- 이벤트 없음: {"action":"none"}
소환수 관련 내용이 없으면 반드시 {"action":"none"} 만 출력. JSON만 출력.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text:prompt }] }], generationConfig:{ temperature:0.1, maxOutputTokens:120 } })
      });
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g,"").trim() || "{}";
      const parsed = JSON.parse(raw);
      if (!parsed.action || parsed.action === "none") return;

      setSummons(prev => {
        let next = [...prev];
        if (parsed.action === "summon" && parsed.name) {
          if (!next.find(s => s.name === parsed.name)) {
            const icon = SUMMON_ICONS[Math.floor(Math.random() * SUMMON_ICONS.length)];
            next.push({ id: Date.now(), name: parsed.name, icon, hp: parsed.maxHp || 100, maxHp: parsed.maxHp || 100, mp: parsed.maxMp || 50, maxMp: parsed.maxMp || 50, status: "active" });
          }
        } else if (parsed.action === "damage" && parsed.name) {
          next = next.map(s => {
            if (s.name !== parsed.name) return s;
            const newHp = Math.max(0, s.hp + (parsed.hp || 0));
            return { ...s, hp: newHp, status: newHp <= 0 ? "dead" : "active" };
          });
        } else if (parsed.action === "heal" && parsed.name) {
          next = next.map(s => s.name !== parsed.name ? s : { ...s, hp: Math.min(s.maxHp, s.hp + (parsed.hp || 0)) });
        } else if (parsed.action === "dismiss" && parsed.name) {
          next = next.filter(s => s.name !== parsed.name);
        }
        return next;
      });
    } catch {}
  };

  // ══════════════════════════════════════════════════════
  //  몬스터 시스템
  // ══════════════════════════════════════════════════════
  const MONSTER_ICONS = ["👹","🐲","💀","🧟","🐺","🦂","🐍","👻","🧛","🦇","🐗","🦁","🐻","🕷️","🦑","🧌","🗿","⚔️","🌑","🔥"];
  const MONSTER_TIERS = {
    weak:    { label:"잡몹",   color:"#7a9a6a", hpRange:[20,50],  atkRange:[5,12],  defRange:[2,8]  },
    normal:  { label:"일반",   color:"#c8a96e", hpRange:[40,90],  atkRange:[10,20], defRange:[5,15] },
    elite:   { label:"정예",   color:"#4a6fa5", hpRange:[80,150], atkRange:[18,30], defRange:[12,22]},
    boss:    { label:"보스",   color:"#c0392b", hpRange:[150,300],atkRange:[25,50], defRange:[18,35]},
    legend:  { label:"전설",   color:"#ffd700", hpRange:[300,600],atkRange:[40,80], defRange:[30,60]},
  };

  // 몬스터 감지 — AI 서사에서 적 등장 탐지
  const analyzeMonsters = async (userMsg, aiText, apiKey) => {
    try {
      const aliveMonsters = monstersRef.current.filter(m => m.status === "alive");
      const monsterList = aliveMonsters.length
        ? aliveMonsters.map(m => `${m.name}(HP:${m.hp}/${m.maxHp})`).join(", ")
        : "없음";

      const prompt = `플레이어 행동: "${userMsg.slice(0,200)}"
AI 서사: "${aiText.slice(0,500)}"
현재 전투 중인 적: ${monsterList}

위 내용에서 몬스터/적/괴물 관련 이벤트를 분석하여 JSON 배열로 출력하세요.

가능한 action:
- "spawn": 새 적 등장. 반드시 포함: name(이름), tier("weak"|"normal"|"elite"|"boss"|"legend"), count(마릿수 숫자, 기본1), skills(스킬명 배열 1~3개), pattern("aggressive"|"defensive"|"cunning"|"berserk")
  * "오크 3마리" → [{"action":"spawn","name":"오크","count":3,"tier":"normal",...}]
  * "오크 무리와 트롤" → [{"action":"spawn","name":"오크","count":3,...},{"action":"spawn","name":"트롤","count":1,...}]
  * 수량 표현: 한/1=1, 두/둘/2=2, 세/셋/3=3, 네/넷/4=4, 다섯/5=5, 무리/떼=3, 군단=5
- "damage": 플레이어가 적에게 피해. name(적 이름), amount(피해량 5~80)
- "defeated": 적 처치됨. name(적 이름), count(처치 수, 기본1)
- "flee": 적 도주. name(적 이름)
- "none": 아무 이벤트 없음

규칙:
- 새 몬스터 등장 시 반드시 count 포함
- 이미 전투 중인 적(${monsterList})은 spawn하지 말 것
- 전투 상황이 아니면 [{"action":"none"}] 출력
- JSON 배열만 출력, 설명 없음

예시 출력: [{"action":"spawn","name":"고블린","count":4,"tier":"weak","skills":["단검 찌르기","독 바르기"],"pattern":"cunning"},{"action":"spawn","name":"오크 대장","count":1,"tier":"elite","skills":["대검 휘두르기"],"pattern":"aggressive"}]`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text:prompt }] }], generationConfig:{ temperature:0.1, maxOutputTokens:600 } })
      });
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g,"").trim() || "[]";
      let events = [];
      try {
        const parsed = JSON.parse(raw);
        events = Array.isArray(parsed) ? parsed : [parsed];
      } catch { return; }

      let newMonsters = [...monstersRef.current];
      let combatStarted = false;
      const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

      for (const ev of events) {
        if (!ev.action || ev.action === "none") continue;

        if (ev.action === "spawn" && ev.name) {
          const count = Math.max(1, Math.min(10, parseInt(ev.count) || 1));
          const tier = MONSTER_TIERS[ev.tier] || MONSTER_TIERS.normal;

          for (let i = 0; i < count; i++) {
            // 여러 마리면 이름에 번호 붙임 (2마리 이상일 때만)
            const monName = count > 1 ? `${ev.name} ${i + 1}` : ev.name;
            if (newMonsters.find(m => m.name === monName && m.status === "alive")) continue;

            const maxHp = rand(...tier.hpRange);
            const atk   = rand(...tier.atkRange);
            const def    = rand(...tier.defRange);
            const icon   = MONSTER_ICONS[Math.floor(Math.random() * MONSTER_ICONS.length)];
            newMonsters = [...newMonsters, {
              id: Date.now() + Math.random(),
              name: monName, icon, tier: ev.tier || "normal",
              hp: maxHp, maxHp, atk, def,
              skills: ev.skills || ["기본 공격"],
              pattern: ev.pattern || "aggressive",
              status: "alive", turnCount: 0,
            }];
          }
          const label = count > 1 ? `${ev.name} ${count}마리` : ev.name;
          setCombatLog(prev => [...prev.slice(-20), `⚠️ ${label}(${tier.label}) 등장!`]);
          combatStarted = true;

        } else if (ev.action === "damage" && ev.name) {
          let counterDmgToPlayer = 0;
          newMonsters = newMonsters.map(m => {
            if (!m.name.startsWith(ev.name) || m.status !== "alive") return m;
            let rawDmg = ev.amount || 10;
            // 방어 태세: 피해 30% 감소
            if (m.defending) {
              rawDmg = Math.max(1, Math.floor(rawDmg * 0.7));
              setCombatLog(prev => [...prev.slice(-20), `🛡️ ${m.name} 방어 태세! 피해 감소 (${rawDmg}dmg)`]);
            }
            // 반격 준비: 피해는 그대로, 반격 피해를 플레이어에게 부여
            if (m.countering) {
              const counterDmg = Math.max(1, Math.floor(m.atk * 0.8));
              counterDmgToPlayer += counterDmg;
              setCombatLog(prev => [...prev.slice(-20), `⚡ ${m.name} 반격! 플레이어에게 ${counterDmg}dmg`]);
            }
            const newHp = Math.max(0, m.hp - rawDmg);
            const died = newHp <= 0;
            if (died) setCombatLog(prev => [...prev.slice(-20), `💀 ${m.name} 처치됨!`]);
            // 방어/반격 플래그 소비 (1회성)
            return { ...m, hp: newHp, status: died ? "dead" : "alive", defending: false, countering: false };
          });
          // 반격 피해를 플레이어에게 적용
          if (counterDmgToPlayer > 0) {
            setStats(prev => {
              const defense = Math.floor((prev.end || 50) / 10);
              const actual = Math.max(1, counterDmgToPlayer - defense);
              return { ...prev, hp: Math.max(0, prev.hp - actual) };
            });
          }

        } else if (ev.action === "defeated" && ev.name) {
          // count만큼 순서대로 처치
          const killCount = Math.max(1, parseInt(ev.count) || 1);
          let killed = 0;
          newMonsters = newMonsters.map(m => {
            if (!m.name.startsWith(ev.name) || m.status !== "alive" || killed >= killCount) return m;
            killed++;
            return { ...m, hp: 0, status: "dead" };
          });
          setCombatLog(prev => [...prev.slice(-20), `💀 ${ev.name}${killCount > 1 ? ` ${killCount}마리` : ""} 처치됨!`]);

        } else if (ev.action === "flee" && ev.name) {
          newMonsters = newMonsters.map(m =>
            m.name.startsWith(ev.name) ? { ...m, status: "fled" } : m
          );
          setCombatLog(prev => [...prev.slice(-20), `💨 ${ev.name} 도주!`]);
        }
      }

      setMonsters(newMonsters);
      monstersRef.current = newMonsters;
      const stillAlive = newMonsters.some(m => m.status === "alive");
      setInCombat(stillAlive);
      if (combatStarted || stillAlive) setShowMonsterPanel(true);

      // 모든 적 처치 → 전투 종료 보상 (등급별 차등)
      if (!stillAlive && newMonsters.length > 0 && newMonsters.every(m => m.status !== "alive")) {
        const killed = newMonsters.filter(m => m.status === "dead");
        const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

        let totalGold = 0, totalExp = 0, totalSP = 0;
        const droppedItems = [];

        killed.forEach(m => {
          const tbl = REWARD_TABLE[m.tier] || REWARD_TABLE.normal;
          // 골드
          totalGold += rand(tbl.goldMin, tbl.goldMax);
          // 경험치
          totalExp  += rand(tbl.expMin,  tbl.expMax);
          // SP
          const spBase = m.tier==="legend"?5:m.tier==="boss"?3:m.tier==="elite"?2:m.tier==="normal"?1:0;
          if (Math.random() < tbl.spChance || spBase > 0) totalSP += spBase;
          // 아이템 드롭
          if (Math.random() < tbl.itemChance) {
            const pool = tbl.itemPool;
            const itemName = pool[Math.floor(Math.random() * pool.length)];
            const rarity = ITEM_RARITY_BY_TIER[m.tier] || "common";
            droppedItems.push({ id: Date.now() + Math.random(), name: itemName, rarity, from: m.name, tier: m.tier, obtainedAt: new Date().toISOString() });
          }
        });

        // 최고 등급 레이블
        const tierPriority = ["legend","boss","elite","normal","weak"];
        const topTier = tierPriority.find(t => killed.some(m => m.tier === t)) || "normal";
        const tierLabel = { legend:"전설", boss:"보스", elite:"정예", normal:"일반", weak:"잡몹" }[topTier];

        // 상태 반영
        if (totalGold > 0) setGold(prev => { const n = prev + totalGold; saveGold(n); return n; });
        if (totalSP   > 0) setSkillSP(prev => { const n = prev + totalSP; saveSkillSP(n); return n; });
        if (totalExp  > 0) {
          setPlayerExp(prev => {
            const next = prev + totalExp;
            savePlayerExp(next);
            // 레벨업 체크: Lv N 요구 EXP = N * 100
            setPlayerLevel(lv => {
              let newLv = lv;
              let remaining = next;
              while (remaining >= newLv * 100) {
                remaining -= newLv * 100;
                newLv++;
                // 레벨업 보너스: SP +1
                setSkillSP(sp => { const n = sp + 1; saveSkillSP(n); return n; });
                // 레벨업 보너스: HP 최대치 +5, MP 최대치 +3 실제 반영
                setStats(prev => ({
                  ...prev,
                  hp:   Math.min(prev.hp   + 5, 100),
                  mp:   Math.min(prev.mp   + 3, 100),
                  maxHp: (prev.maxHp || 100) + 5,
                  maxMp: (prev.maxMp || 100) + 3,
                }));
              }
              if (newLv > lv) {
                savePlayerLevel(newLv);
                const lvGain = newLv - lv;
                setSkillToast({ name:`Lv ${newLv} 달성!`, icon:"🎉", rarity:"rare", desc:`레벨 ${newLv}로 성장했습니다! SP +${lvGain} · HP+${lvGain*5} · MP+${lvGain*3}`, toastType:"level" });
                setTimeout(() => setSkillToast(null), 4000);
              }
              return newLv;
            });
            return next;
          });
        }
        if (droppedItems.length > 0) setInventory(prev => { const n = [...prev, ...droppedItems]; saveInventory(n); return n; });

        // 전투 로그
        setCombatLog(prev => [...prev.slice(-20), `🏆 전투 승리! 골드 +${totalGold} / 경험치 +${totalExp}${totalSP>0?` / SP +${totalSP}`:""}${droppedItems.length>0?` / 아이템 ${droppedItems.length}개 획득`:""}`]);

        // 보상 토스트
        setRewardToast({ gold: totalGold, exp: totalExp, sp: totalSP, items: droppedItems, tierLabel, killCount: killed.length });
        setTimeout(() => setRewardToast(null), 5000);

        // 전투 종료 → 1회성 패시브 재충전 + 임시 버프 초기화
        setPassiveRerollUsed(false);
        setPassiveSixthSenseUsed(false);
        setPassiveUndyingUsed(false);
        // 임시 패시브 버프 원복
        const boostsToRevert = activePassiveBoostsRef.current;
        if (Object.keys(boostsToRevert).length > 0) {
          setStats(prev => {
            const next = { ...prev };
            Object.values(boostsToRevert).forEach(boostMap => {
              Object.entries(boostMap).forEach(([k, v]) => {
                if (next[k] !== undefined) next[k] = Math.max(0, next[k] - v);
              });
            });
            return next;
          });
          activePassiveBoostsRef.current = {};
        }
      }

      // 시스템 프롬프트 업데이트
      const mem = loadMemory();
      systemRef.current = buildSystem(character, loadTitles(), mem, loadNPCs(), summons, newMonsters);

    } catch {}
  };

  // 몬스터 AI 행동 — 살아있는 모든 몬스터가 각자 행동
  const monsterAIAction = async (apiKey) => {
    const alive = monstersRef.current.filter(m => m.status === "alive");
    if (!alive.length) return null;

    const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const allActions = [];
    let totalDmgToPlayer = 0;
    let healEvents = []; // 몬스터 힐 이벤트
    const updatedMonsters = [...monstersRef.current];

    // ── 행동 유형 정의 ──────────────────────────────────────────
    const ACTION_POOL = {
      aggressive: [
        { type:"attack",      weight:40, label:"일반 공격" },
        { type:"skill",       weight:25, label:"스킬 사용" },
        { type:"heavy",       weight:15, label:"강공격" },
        { type:"multi",       weight:10, label:"연속 공격" },
        { type:"taunt",       weight:10, label:"도발" },
      ],
      defensive: [
        { type:"attack",      weight:25, label:"일반 공격" },
        { type:"defend",      weight:30, label:"방어 태세" },
        { type:"counter",     weight:20, label:"반격 준비" },
        { type:"heal_self",   weight:15, label:"자가 회복" },
        { type:"skill",       weight:10, label:"스킬 사용" },
      ],
      cunning: [
        { type:"skill",       weight:30, label:"스킬 사용" },
        { type:"debuff",      weight:20, label:"약화 저주" },
        { type:"flee_feint",  weight:15, label:"도망치는 척" },
        { type:"attack",      weight:20, label:"일반 공격" },
        { type:"summon_call", weight:15, label:"동료 호출" },
      ],
      berserk: [
        { type:"rage",        weight:35, label:"광란 강타" },
        { type:"aoe",         weight:25, label:"범위 공격" },
        { type:"heavy",       weight:25, label:"강공격" },
        { type:"attack",      weight:15, label:"일반 공격" },
      ],
    };

    // 가중치 기반 행동 선택
    const pickAction = (pool, hpPct, turnCount) => {
      let candidates = [...pool];
      // HP 낮으면 회복/도주 가중치 상승
      if (hpPct < 0.25) {
        candidates = candidates.map(a =>
          a.type === "heal_self" ? { ...a, weight: a.weight + 30 } :
          a.type === "flee_feint" ? { ...a, weight: a.weight + 20 } : a
        );
      }
      // 턴수 짝수면 스킬 가중치 상승
      if (turnCount % 2 === 0) {
        candidates = candidates.map(a => a.type === "skill" ? { ...a, weight: a.weight + 15 } : a);
      }
      const total = candidates.reduce((s, a) => s + a.weight, 0);
      let r = Math.random() * total;
      for (const a of candidates) { r -= a.weight; if (r <= 0) return a; }
      return candidates[0];
    };

    // ── 각 몬스터 행동 처리 ────────────────────────────────────
    for (let i = 0; i < updatedMonsters.length; i++) {
      const m = updatedMonsters[i];
      if (m.status !== "alive") continue;

      const hpPct = m.hp / m.maxHp;
      m.turnCount = (m.turnCount || 0) + 1;
      const pool = ACTION_POOL[m.pattern] || ACTION_POOL.aggressive;
      const chosen = pickAction(pool, hpPct, m.turnCount);
      const skillUsed = m.skills?.[Math.floor(Math.random() * (m.skills?.length || 1))] || "기본 공격";

      let dmg = 0;
      let healAmt = 0;
      let effectDesc = "";

      switch (chosen.type) {
        case "attack":
          dmg = Math.max(1, m.atk + rand(-3, 3));
          effectDesc = `기본 공격 (${dmg}dmg)`;
          break;
        case "heavy":
          dmg = Math.max(1, Math.floor(m.atk * 1.6) + rand(-2, 2));
          effectDesc = `강공격 (${dmg}dmg)`;
          break;
        case "multi":
          // 2~3회 연속 공격, 각 타격은 약함
          const hits = rand(2, 3);
          dmg = 0;
          for (let h = 0; h < hits; h++) dmg += Math.max(1, Math.floor(m.atk * 0.6) + rand(-1, 2));
          effectDesc = `${hits}연속 공격 (총 ${dmg}dmg)`;
          break;
        case "skill":
          dmg = Math.max(1, Math.floor(m.atk * 1.3) + rand(-2, 4));
          effectDesc = `스킬 [${skillUsed}] (${dmg}dmg)`;
          break;
        case "rage":
          dmg = Math.max(1, Math.floor(m.atk * 2.0) + rand(0, 5));
          effectDesc = `광란 강타 (${dmg}dmg)`;
          break;
        case "aoe":
          dmg = Math.max(1, Math.floor(m.atk * 1.4) + rand(-1, 3));
          effectDesc = `범위 공격 (${dmg}dmg, 회피 어려움)`;
          break;
        case "defend":
          dmg = 0;
          effectDesc = `방어 태세 (다음 피해 -30%)`;
          updatedMonsters[i] = { ...m, defending: true };
          break;
        case "counter":
          dmg = 0;
          effectDesc = `반격 준비 (피격 시 반격)`;
          updatedMonsters[i] = { ...m, countering: true };
          break;
        case "heal_self":
          healAmt = Math.floor(m.maxHp * rand(10, 20) / 100);
          const newHp = Math.min(m.maxHp, m.hp + healAmt);
          updatedMonsters[i] = { ...m, hp: newHp };
          healEvents.push({ name: m.name, icon: m.icon, amt: healAmt });
          effectDesc = `자가 회복 (+${healAmt}HP)`;
          break;
        case "debuff":
          dmg = Math.max(1, Math.floor(m.atk * 0.7));
          effectDesc = `약화 저주 (${dmg}dmg + 스탯 감소)`;
          // 플레이어 스탯 소폭 감소
          setStats(prev => ({ ...prev, str: Math.max(0, (prev.str||50) - 3), agi: Math.max(0, (prev.agi||50) - 3) }));
          break;
        case "summon_call": {
          dmg = 0;
          // 같은 종류의 잡몹 1마리 즉시 증원
          const baseTier = m.tier === "boss" || m.tier === "legend" ? "normal" : "weak";
          const rTier = MONSTER_TIERS[baseTier];
          const newMaxHp = rand(...rTier.hpRange);
          const newAtk   = rand(...rTier.atkRange);
          const newDef   = rand(...rTier.defRange);
          const newIcon  = MONSTER_ICONS[Math.floor(Math.random() * MONSTER_ICONS.length)];
          const reinforceName = `${m.name}의 부하`;
          if (!updatedMonsters.find(x => x.name === reinforceName && x.status === "alive")) {
            updatedMonsters.push({
              id: Date.now() + Math.random(),
              name: reinforceName, icon: newIcon, tier: baseTier,
              hp: newMaxHp, maxHp: newMaxHp, atk: newAtk, def: newDef,
              skills: ["기본 공격"], pattern: "aggressive", status: "alive", turnCount: 0,
            });
            effectDesc = `동료 호출! ${reinforceName} 등장!`;
            setCombatLog(prev => [...prev.slice(-30), `⚠️ ${reinforceName}(${rTier.label}) 증원!`]);
          } else {
            effectDesc = `동료 호출 (이미 전투 중)`;
          }
          break;
        }
        case "flee_feint":
          dmg = Math.max(1, Math.floor(m.atk * 0.8));
          effectDesc = `도망치는 척 기습 (${dmg}dmg)`;
          break;
        case "taunt":
          dmg = Math.max(1, Math.floor(m.atk * 0.9));
          effectDesc = `도발+공격 (${dmg}dmg)`;
          break;
        default:
          dmg = Math.max(1, m.atk + rand(-2, 2));
          effectDesc = `공격 (${dmg}dmg)`;
      }

      totalDmgToPlayer += dmg;
      allActions.push({ monster: m, chosen, skillUsed, dmg, healAmt, effectDesc });
      setCombatLog(prev => [...prev.slice(-30), `${m.icon}${m.name}: ${effectDesc}`]);
    }

    // 힐 이벤트 + defend/counter 플래그 일괄 반영
    setMonsters(prev => {
      return updatedMonsters.map(m => {
        const h = healEvents.find(e => e.name === m.name);
        return h ? { ...m, hp: Math.min(m.maxHp, m.hp + h.amt) } : m;
      });
    });
    monstersRef.current = healEvents.length > 0
      ? updatedMonsters.map(m => {
          const h = healEvents.find(e => e.name === m.name);
          return h ? { ...m, hp: Math.min(m.maxHp, m.hp + h.amt) } : m;
        })
      : [...updatedMonsters];

    // 플레이어 HP 감소 (방어력 차감)
    if (totalDmgToPlayer > 0) {
      setStats(prev => {
        const defense = Math.floor((prev.end || 50) / 10);
        const actual = Math.max(1, totalDmgToPlayer - defense);
        return { ...prev, hp: Math.max(0, prev.hp - actual) };
      });
    }

    // 모든 행동 합쳐서 서사 생성
    if (allActions.length === 0) return null;
    try {
      const actionSummary = allActions.map(a =>
        `${a.monster.icon}${a.monster.name}(HP:${a.monster.hp}/${a.monster.maxHp}): ${a.effectDesc}`
      ).join("\n");

      const prompt = `전투 중 적들의 행동을 2~4문장으로 생동감 있게 묘사하세요.

적들의 행동:
${actionSummary}

총 플레이어 피해: ${totalDmgToPlayer > 0 ? totalDmgToPlayer + "dmg" : "없음"}
${healEvents.length > 0 ? `회복한 적: ${healEvents.map(h => `${h.icon}${h.name} +${h.amt}HP`).join(", ")}` : ""}

한국어 존댓말 나레이션. 각 몬스터의 개성을 살려서 묘사하되 간결하게.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ role:"user", parts:[{ text:prompt }] }], generationConfig:{ temperature:0.9, maxOutputTokens:300 } })
      });
      const data = await res.json();
      const desc = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "적들이 공격합니다.";

      const summary = { allActions, totalDmgToPlayer, desc, timestamp: Date.now() };
      setMonsterActionLog(summary);
      return summary;
    } catch { return null; }
  };

  const [titleToast, setTitleToast] = React.useState(null);

  const grantTitle = (titleId) => {
    const def = TITLE_DEFS.find(d => d.id === titleId);
    if (!def) return;
    if (addTitle(def)) {
      setTitles(loadTitles());
      if (def.bonus) {
        setStats(prev => {
          const next = { ...prev };
          Object.entries(def.bonus).forEach(([k, v]) => { if (next[k] !== undefined) next[k] = Math.max(0, Math.min(100, next[k] + v)); });
          return next;
        });
      }
      setTitleToast(def);
      setTimeout(() => setTitleToast(null), 3500);
      // 칭호 획득 시 SP +1 (rare → +2, legendary → +3)
      const spBonus = def.rarity === "legendary" ? 3 : def.rarity === "rare" ? 2 : 1;
      setSkillSP(prev => { const n = prev + spBonus; saveSkillSP(n); return n; });
      // 이벤트 스킬 자동 해금 체크
      setTimeout(() => {
        const updatedTitles = loadTitles();
        getAllSkillDefs().filter(s => s.type === "event" && s.unlockTitle === titleId).forEach(skillDef => {
          setUnlockedSkills(prev => {
            if (prev[skillDef.id]) return prev;
            const next = { ...prev, [skillDef.id]: true };
            saveSkills(next);
            setSkillToast({ ...skillDef, toastType:"event" });
            setTimeout(() => setSkillToast(null), 4000);
            return next;
          });
        });
      }, 100);
    }
  };

  const sendMessage = async (userMsg, isChoice = false) => {
    if (!userMsg.trim() || loading) return;
    setInput(""); setChoices([]); setTypingMode(false);
    
    // ── 능동 스킬 사용 파싱 ──────────────────────────────────────
    let skillUsed = null;
    let cleanMsg = userMsg;
    const skillMatch = userMsg.match(/\[스킬:([^\]]+)\]/);
    if (skillMatch) {
      const skillId = skillMatch[1];
      const skillDef = getAllSkillDefs().find(s => s.id === skillId && unlockedSkills[skillId]);
      if (skillDef && (skillDef.type === "active" || skillDef.type === "event")) {
        // MP/HP 비용 체크
        const mpOk = !skillDef.mpCost || stats.mp >= skillDef.mpCost;
        const hpOk = !skillDef.hpCost || stats.hp > skillDef.hpCost;
        if (mpOk && hpOk) {
          skillUsed = skillDef;
          cleanMsg = userMsg.replace(/\[스킬:[^\]]+\]/, "").trim() || skillDef.name + " 사용";
          // MP/HP 차감
          setStats(prev => {
            const next = { ...prev };
            if (skillDef.mpCost) next.mp = Math.max(0, next.mp - skillDef.mpCost);
            if (skillDef.hpCost) next.hp = Math.max(1, next.hp - skillDef.hpCost);
            if (skillDef.hpRestore) next.hp = Math.min(next.maxHp || 100, next.hp + skillDef.hpRestore);
            return next;
          });
        }
      }
    }
    // 10번: 스킬 사용 횟수 누적 (진화 추적)
    if (skillUsed) {
      recordSkillUsage(skillUsed.id);
      const evolutions = checkSkillEvolution(skillUsed.id);
      if (evolutions.length > 0) {
        const evo = evolutions[0];
        setSkillToast({ name:`${skillUsed.name} → ${evo.toName}`, icon:evo.toIcon, rarity:"legendary", desc:evo.desc, toastType:"event" });
        setTimeout(() => setSkillToast(null), 5000);
      }
    }
    // 6번: 무기 친화도 누적
    if (skillUsed || cleanMsg.match(/검|칼|베|베다|베기/)) incrementWeaponAffinity("sword");
    else if (cleanMsg.match(/마법|주문|마나|캐스팅/)) incrementWeaponAffinity("staff");
    else if (cleanMsg.match(/활|화살|사격|원거리/)) incrementWeaponAffinity("bow");
    else if (cleanMsg.match(/단검|단도|암습|기습/)) incrementWeaponAffinity("dagger");
    else if (cleanMsg.match(/주먹|맨손|격투|타격/)) incrementWeaponAffinity("fist");
    setActiveSkillEffect(skillUsed);

    const newMsgs = [...messages, { role:"user", content:userMsg }];
    setMessages(newMsgs); setLoading(true);

    // ── CoC식 스탯 이하 판정 ──────────────────────────────────
    const msg_lc = cleanMsg.toLowerCase();
    const statHints = [
      { keys:["싸우","공격","베","찌르","때리","전투","결투","치"],         stat:"str"  },
      { keys:["피하","도망","달려","숨","잠입","빠르"],                     stat:"agi"  },
      { keys:["버티","견디","참","막아","방어","저항"],                     stat:"end"  },
      { keys:["설득","협상","부탁","거래","흥정"],                          stat:"neg"  },
      { keys:["속이","거짓","위장","변장","연기"],                          stat:"disg" },
      { keys:["위협","협박","겁"],                                          stat:"fear" },
      { keys:["말","대화","이야기","선동","연설"],                          stat:"spk"  },
      { keys:["조사","살펴","찾","수색","탐색","분석"],                     stat:"per"  },
      { keys:["기억","추리","해석","읽","공부","연구"],                     stat:"int"  },
      { keys:["마법","주문","소환","마나","시전"],                          stat:"mgc"  },
      { keys:["활","던지","사격","원거리"],                                 stat:"rng"  },
      { keys:["치유","회복","치료"],                                        stat:"fath" },
    ];
    const matched = statHints.find(h => h.keys.some(k => msg_lc.includes(k)));
    const usedStat = matched ? matched.stat : "luk";
    const statValue = stats[usedStat] ?? 50;

    // d100 굴리기
    let diceRoll = Math.floor(Math.random() * 100) + 1;

    // 패시브: lucky — 대실패 시 재롤
    let luckyRerolled = false;
    if (unlockedSkills["passive_lucky"] && !passiveRerollUsed && diceRoll >= 96) {
      diceRoll = Math.floor(Math.random() * 100) + 1;
      luckyRerolled = true;
      setPassiveRerollUsed(true);
    }

    const isCritSuccess = diceRoll <= Math.floor(effectiveStatValue / 5) * (skillUsed?.id === "active_assassin" ? 3 : 1);
    const isCritFail    = diceRoll >= 96;
    const isSuccess     = diceRoll <= effectiveStatValue;
    const verdictLabel  = isCritSuccess ? "대성공" : isCritFail ? "대실패" : isSuccess ? "성공" : "실패";
    const verdictEmoji  = isCritSuccess ? "✨" : isCritFail ? "💥" : isSuccess ? "✅" : "❌";

    // 패시브: sixth_sense — 실패(대실패 포함) 1회 성공 전환 (전투 중 1회 한정)
    let sixthSenseUsed = false;
    if (unlockedSkills["passive_sixth_sense"] && !isSuccess && !passiveSixthSenseUsed) {
      sixthSenseUsed = true;
      setPassiveSixthSenseUsed(true);
    }
    const effectiveSuccess = sixthSenseUsed ? true : isSuccess;

    const turnNum = msgCountRef.current;
    const maxHpDmg = turnNum <= 10 ? 8 : turnNum <= 30 ? 15 : 25;

    // ── 패시브 조건 체크 ────────────────────────────────────────
    const procsThisTurn = [];

    // 이번 턴에 조건을 만족하는 패시브 버프 목록 계산
    const newBoosts = {};
    if (unlockedSkills["passive_bloodlust"] && isCritSuccess) {
      procsThisTurn.push({ id:"passive_bloodlust", name:"혈기", icon:"🩸", desc:"STR +10 (1턴)" });
      newBoosts["passive_bloodlust"] = { str: 10 };
    }
    if (unlockedSkills["passive_iron_will"] && stats.hp <= 30) {
      procsThisTurn.push({ id:"passive_iron_will", name:"강철 의지", icon:"🔥", desc:"의지력 +20 (HP 30% 이하 유지 중)" });
      newBoosts["passive_iron_will"] = { wil: 20 };
    }
    if (unlockedSkills["passive_last_stand"] && stats.hp <= 20) {
      procsThisTurn.push({ id:"passive_last_stand", name:"최후의 저항", icon:"🛡️", desc:"END +30 (HP 20 이하 유지 중)" });
      newBoosts["passive_last_stand"] = { end: 30 };
    }
    if (unlockedSkills["passive_dark_power"] && stats.mad >= 60) {
      procsThisTurn.push({ id:"passive_dark_power", name:"어둠의 힘", icon:"🖤", desc:"MAD+10, MGC+15 (광기 60 이상 유지 중)" });
      newBoosts["passive_dark_power"] = { mad: 10, mgc: 15 };
    }
    if (unlockedSkills["passive_calm_mind"] && emotion?.intensity >= 80) {
      procsThisTurn.push({ id:"passive_calm_mind", name:"평심", icon:"🌊", desc:"CAL +15 (감정강도 80 이상 유지 중)" });
      newBoosts["passive_calm_mind"] = { cal: 15 };
    }

    // 이전 턴 버프 원복 후 → 이번 턴 새 버프 적용 (한 번의 setStats로 처리)
    const prevBoosts = activePassiveBoostsRef.current;
    setStats(prev => {
      const next = { ...prev };
      // 1) 이전 버프 되돌리기 (조건이 여전히 충족돼서 newBoosts에도 있으면 차이만큼만 조정)
      Object.entries(prevBoosts).forEach(([skillId, boostMap]) => {
        Object.entries(boostMap).forEach(([k, v]) => {
          if (next[k] !== undefined) next[k] = Math.max(0, next[k] - v);
        });
      });
      // 2) 이번 턴 버프 적용
      Object.entries(newBoosts).forEach(([skillId, boostMap]) => {
        Object.entries(boostMap).forEach(([k, v]) => {
          if (next[k] !== undefined) next[k] = Math.min(100, next[k] + v);
        });
      });
      return next;
    });
    activePassiveBoostsRef.current = newBoosts;
    if (luckyRerolled) procsThisTurn.push({ id:"passive_lucky", name:"행운아", icon:"🍀", desc:"대실패 재롤!" });
    if (sixthSenseUsed) procsThisTurn.push({ id:"passive_sixth_sense", name:"육감", icon:"👁️", desc:"실패→성공 전환!" });
    setPassiveProcs(procsThisTurn);

    // ── 능동 스킬 수치 효과 적용 ──────────────────────────────────
    // 광전사: STR +20 이번 턴만 적용 (다음 턴 패시브 원복 사이클에서 자동 해제됨)
    if (skillUsed?.id === "active_berserk") {
      const prevBoostsBerserk = activePassiveBoostsRef.current;
      const berserkBoost = { str: 20 };
      setStats(prev => {
        const next = { ...prev };
        // 이전 berserk 버프 원복 (이미 위 패시브 원복에서 처리됐을 수 있으므로 방어적으로)
        const prevBerserk = prevBoostsBerserk["active_berserk"] || {};
        Object.entries(prevBerserk).forEach(([k, v]) => { if (next[k] !== undefined) next[k] = Math.max(0, next[k] - v); });
        // 새 버프 적용
        next.str = Math.min(100, next.str + 20);
        return next;
      });
      activePassiveBoostsRef.current = { ...activePassiveBoostsRef.current, "active_berserk": berserkBoost };
    }

    // ── 포만감·피로도 판정 페널티 계산 ─────────────────────────────
    let survivalPenalty = 0;
    if ((stats.food ?? 50) <= 25) survivalPenalty -= 5;   // 배고픔: 판정 -5
    if ((stats.food ?? 50) <= 10) survivalPenalty -= 10;  // 굶주림: 추가 -10
    if ((stats.ftg  ?? 30) >= 70) survivalPenalty -= 5;   // 피로: 판정 -5
    if ((stats.ftg  ?? 30) >= 90) survivalPenalty -= 10;  // 과로: 추가 -10
    const effectiveStatValue = Math.max(1, statValue + survivalPenalty);
    const survivalPenaltyHint = survivalPenalty < 0
      ? `\n[🍖 생존 페널티 ${survivalPenalty}] 포만감·피로도로 인해 판정 스탯이 ${effectiveStatValue}로 감소했습니다.`
      : "";

    const statInfo = getStatInfo(usedStat);

    // 스킬 힌트 문자열
    const skillHint = skillUsed
      ? `\n\n[⚔️ 스킬 사용: ${skillUsed.name}] ${skillUsed.aiHint}`
      : "";

    const passiveHint = procsThisTurn.length > 0
      ? `\n[🌀 패시브 발동: ${procsThisTurn.map(p=>p.name).join(", ")}] 패시브 효과가 서사에 반영되어야 합니다.`
      : "";

    const injectedContext = `\n\n[🎲 판정 결과] ${statInfo?.icon || ""}${statInfo?.name || usedStat} 판정: 굴림 ${diceRoll} / 스탯 ${effectiveStatValue}${survivalPenalty < 0 ? `(원래 ${statValue}${survivalPenaltyHint})` : ""} → ${verdictEmoji}${verdictLabel}${sixthSenseUsed?" (육감으로 성공 전환!)":""}${luckyRerolled?" (행운으로 재롤!)":""}
위 판정 결과를 서사에 충실히 반영하십시오. ${isCritSuccess?"탁월한 성공으로 예상 이상의 결과를 묘사하십시오.":isCritFail?"치명적 실패로 예상치 못한 최악의 상황을 묘사하십시오.":effectiveSuccess?"행동이 의도대로 성공했습니다.":"행동이 실패했으나 치명적이지 않은 선에서 묘사하십시오."} 전투/위험 장면의 HP 피해는 최대 -${maxHpDmg} 이내로 제한하십시오.${skillHint}${passiveHint}`;

    try {
      const text = await callGemini(newMsgs, injectedContext);
      msgCountRef.current += 1;

      // regen 기반 자연 회복 (regen_plus 보유 시 5턴→3턴 단축, 회복량 ×1.25)
      const regenInterval = unlockedSkills["passive_regen_plus"] ? 3 : 5;
      if (msgCountRef.current % regenInterval === 0) {
        setStats(prev => {
          const base = prev.regen || 50;
          const regenMult   = unlockedSkills["passive_regen_plus"] ? 1.25 : 1;
          const regenRate   = Math.round((base / 100) * 8 * regenMult);
          const mpRegenRate = Math.round((base / 100) * 5 * regenMult);
          const mpBonus = unlockedSkills["passive_mana_flow"] ? 10 : 0;
          const hpCap = prev.maxHp || 100;
          const mpCap = prev.maxMp || 100;
          return { ...prev, hp: Math.min(hpCap, prev.hp + Math.max(1, regenRate)), mp: Math.min(mpCap, prev.mp + Math.max(1, mpRegenRate) + mpBonus) };
        });
      }

      // ── 포만감·피로도 턴마다 감소 + 페널티 적용 ──────────────────
      setStats(prev => {
        const next = { ...prev };
        // 포만감: 매 턴 -2 감소 (최소 0)
        next.food = Math.max(0, (next.food ?? 50) - 2);
        // 피로도: 매 턴 +2 상승 (최대 100)
        next.ftg  = Math.min(100, (next.ftg  ?? 30) + 2);

        // 포만감 페널티: 25 이하 → HP 자연회복 억제 + HP -1
        if (next.food <= 25) {
          next.hp = Math.max(0, next.hp - 1);
        }
        // 포만감 극도 부족(10 이하): HP -2 추가
        if (next.food <= 10) {
          next.hp = Math.max(0, next.hp - 2);
          next.str = Math.max(0, (next.str ?? 50) - 1);
        }
        // 피로도 페널티: 70 이상 → END -1
        if (next.ftg >= 70) {
          next.end = Math.max(0, (next.end ?? 50) - 1);
        }
        // 피로도 위험(90 이상): 추가 MP -2
        if (next.ftg >= 90) {
          next.mp = Math.max(0, next.mp - 2);
        }
        return next;
      });

      // 10턴마다 스킬 포인트 +1
      if (msgCountRef.current % 10 === 0) {
        setSkillSP(prev => { const n = prev + 1; saveSkillSP(n); return n; });
      }

      const rollInfo = { stat: usedStat, statName: statInfo?.name || usedStat, statIcon: statInfo?.icon || "", statValue: effectiveStatValue, diceRoll, verdict: verdictLabel, verdictEmoji, isSuccess: effectiveSuccess, isCritSuccess, isCritFail, skillUsed: skillUsed?.name, passiveProcs: procsThisTurn };
      const msgObj = { role:"assistant", content:text, characterName:character.name, imageUrl:null, imageLoading:false, rollInfo };
      // 대성공/대실패 장면을 하이라이트에 자동 저장
      if (isCritSuccess || isCritFail) {
        const hl = { id: Date.now(), type: isCritSuccess ? "crit_success" : "crit_fail", icon: isCritSuccess ? "✨" : "💥", label: isCritSuccess ? "대성공" : "대실패", statName: statInfo?.name || usedStat, diceRoll, statValue, preview: text.slice(0, 120), savedAt: new Date().toISOString() };
        setHighlights(prev => { const next = [hl, ...prev].slice(0, 30); saveHighlights(next); return next; });
      }
      const updated = [...newMsgs, msgObj];
      setMessages(updated); generateChoices(updated);
      const apiKey = (apiKeys&&apiKeys.length) ? apiKeys[loadKeyIndex()%apiKeys.length] : "";
      detectGameOver(text, apiKey);
      analyzeEmotionAndStats(text, apiKey);
      analyzeSummons(userMsg, text, apiKey);
      // 1번: 중요한 AI 서사를 기억 파편으로 자동 수집 (10턴마다 1개)
      if (msgCountRef.current % 10 === 0 && text.length > 50) { addMemoryFragment(text.slice(0, 100), "event"); }
      // 20번: 탐험 장소 자동 추출 (장소명 패턴 감지)
      (() => { const locationPatterns = [/([가-힣a-zA-Z]{2,10}(?:성|탑|마을|도시|숲|동굴|광장|신전|궁전|항구|다리|시장|요새|골목|수도|왕궁|저택|교도소|공장|연구소|기지|클럽|바|술집|역|광산|해변|절|사원))/g]; locationPatterns.forEach(p => { const matches = text.match(p); if (matches) matches.slice(0,3).forEach(loc => addExploredLocation(loc, character.scenario || "", "")); }); })();
      // 23번: 스탯 사용 누적 (능력 각인용)
      if (usedStat) { recordStatUsage(usedStat, 1); }
      // 25번: 시간의 메아리 — 감동적인 대사 자동 수집 (15턴마다)
      if (msgCountRef.current % 15 === 0 && text.length > 40) {
        const quoteMatch = text.match(/["「『]([\s\S]{8,40})["」』]/);
        if (quoteMatch) { addTimeEcho(quoteMatch[1].trim(), "???", "", character.scenario||""); }
      }
      // 27번: 신의 시선 — 극적인 장면에서 관심도 자동 축적
      if (isCritSuccess) { accumulateDivineAttention(5); }
      if (isCritFail) { accumulateDivineAttention(2); }
      // 33번: 회차 통계 — 턴 카운트 누적
      recordStatTurn();
      analyzeMonsters(userMsg, text, apiKey).then(() => {
        // 살아있는 소환수가 몬스터를 공격
        const activeSummons = summons.filter(s => s.status === "active");
        if (activeSummons.length > 0 && monstersRef.current.some(m => m.status === "alive")) {
          let updatedMonsters = [...monstersRef.current];
          activeSummons.forEach(s => {
            // 소환수 공격력: maxHp 기반 (maxHp의 8~15% 랜덤)
            const summonAtk = Math.max(3, Math.floor(s.maxHp * (0.08 + Math.random() * 0.07)));
            // 가장 HP가 낮은 살아있는 몬스터를 우선 공격
            const targetIdx = updatedMonsters.reduce((bestIdx, m, i) => {
              if (m.status !== "alive") return bestIdx;
              if (bestIdx === -1) return i;
              return m.hp < updatedMonsters[bestIdx].hp ? i : bestIdx;
            }, -1);
            if (targetIdx === -1) return;
            const target = updatedMonsters[targetIdx];
            // 방어 중인 몬스터에게는 피해 감소
            const actualDmg = target.defending ? Math.max(1, Math.floor(summonAtk * 0.7)) : summonAtk;
            const newHp = Math.max(0, target.hp - actualDmg);
            const died = newHp <= 0;
            updatedMonsters[targetIdx] = { ...target, hp: newHp, status: died ? "dead" : "alive" };
            setCombatLog(prev => [...prev.slice(-30), `${s.icon}${s.name} → ${target.icon}${target.name} 공격! ${actualDmg}dmg${died ? " 💀처치!" : ""}`]);
          });
          setMonsters(updatedMonsters);
          monstersRef.current = updatedMonsters;
          const stillAlive = updatedMonsters.some(m => m.status === "alive");
          setInCombat(stillAlive);
        }
        // 살아있는 몬스터가 있으면 AI 반격
        if (monstersRef.current.some(m => m.status === "alive")) {
          monsterAIAction(apiKey);
        }
      });
      if (msgCountRef.current % 10 === 0) updateMid(updated, apiKey);

      // ── 시나리오별 특수 업적 자동 감지 ──────────────────────────
      const scenarioId = character?.scenario === "중세 판타지" ? "medieval"
                       : character?.scenario === "무협 강호"   ? "wuxia"
                       : character?.scenario === "사이버펑크"  ? "cyberpunk"
                       : null;
      if (scenarioId) {
        const combinedText = (userMsg + " " + text).toLowerCase();
        const scenarioTitles = TITLE_DEFS.filter(t => t.scenario === scenarioId);
        const keywordMap = {
          mf_knighted:         ["기사 작위","서임","작위를","기사로"],
          mf_dragon_blood:     ["드래곤","용의 피","용과 마주","용을 마주"],
          mf_holy_light:       ["성광","신의 계시","성스러운 빛","신의 선택","빛이 내려"],
          mf_dark_pact:        ["악마와 계약","어둠과 계약","악마의 계약","마계 계약"],
          mf_siege_hero:       ["공성","성벽","성문","공격 성공","공방전"],
          mf_crown_pretender:  ["왕좌","왕위","왕이 되","왕을 노","군주가"],
          mf_curse_broken:     ["저주를 풀","저주 해방","저주에서 벗어","저주가 깨졌"],
          mf_forbidden_magic:  ["금지된 마법","금기 마법","봉인된 마법","금단의 주문"],
          mf_dungeon_diver:    ["던전","지하 미로","던전 깊","지하 탐험"],
          mf_tournament_champion:["마상 대회","무술 대회","대회 우승","토너먼트"],
          mf_guild_master:     ["길드 마스터","길드 장","문주","길드를 이끌"],
          mf_ancient_relic:    ["고대 유물","전설의 유물","유물을 발견","고대의 물건"],
          mf_poison_master:    ["독을 사용","독으로","독을 제조","독공"],
          mf_tavern_legend:    ["여관","주막","선술집"],
          mf_witch_hunt:       ["마녀 재판","이단 심문","마녀로 몰","화형"],
          mf_noble_blood:      ["귀족","귀족의 피","귀족 출신","영주의 자식"],
          mf_mercenary_veteran:["용병","베테랑 전사","수많은 전쟁","전쟁을 살아"],
          mf_spy_network:      ["첩보","첩자","스파이 네트워크","정보망"],
          mf_chosen_one:       ["선택받은 자","예언의","운명으로 선택","예언에 언급"],
          mf_betrayed:         ["배신","배신당","배신자"],
          mf_healer:           ["치유","성스러운 치료","기적적으로 치료","많은 사람을 구"],
          mf_monster_slayer:   ["마수","괴물을 처치","전설의 괴물","드래곤을 처치"],
          mf_war_general:      ["군대를 지휘","전쟁 지휘관","장군","진두지휘"],
          mf_plague_survivor:  ["역병","흑사병","전염병에서 살아"],
          mf_sorcerer_apprentice:["마법사의 제자","마법 스승","마법을 배우기로"],
          mf_bandit_king:      ["산적","도적 수장","강도 두목","산적의 왕"],
          mf_enchanter:        ["마법 부여","인챈팅","무기에 마법","방어구에 마법"],
          mf_pilgrimage:       ["성지 순례","순례","성전","순례를 마쳤"],
          mf_arcane_secret:    ["마법의 비밀","세계의 비밀","마법 근원","금단의 지식"],
          mf_regicide:         ["왕을 처단","왕을 심판","군주를 제거","왕이 쓰러"],
          // 무협
          wx_qi_awakened:      ["내공 각성","내력이 폭발","기운이 각성","내공이 깨어"],
          wx_top_ranking:      ["강호 십대","강호 고수","순위에 올","무림 랭킹"],
          wx_secret_manual:    ["비급","무공 비서","비전 무공서","비전서를"],
          wx_blood_feud:       ["복수","혈맹","원한","피의 복수"],
          wx_sect_master:      ["문파 장로","문주","장로가","파주가"],
          wx_wulin_hero:       ["무림 의협","의협","강호의 귀감","의로운 협객"],
          wx_poison_master:    ["독공","독을 뿜","독수","독살"],
          wx_enlightenment:    ["깨달음","무의 경지","도를 깨","선의 경지"],
          wx_demon_path:       ["마도","마공","금기 무공","사도"],
          wx_lone_wolf:        ["독자적인 검법","스승 없이","독고","홀로 완성"],
          wx_dragon_subdued:   ["항룡","용을 제압","용을 굴복","용을 쓰러"],
          wx_underworld:       ["흑도","암흑가","지하 세계","흑막"],
          wx_peach_blossom:    ["도화운","여러 인연","많은 사람과 인연"],
          wx_wine_hero:        ["술에 취해도","주중협객","취권","술을 마시며 싸"],
          wx_hidden_identity:  ["복면","정체를 숨기고","변장하여 의협"],
          wx_thousand_li:      ["천 리","천리 독행","홀로 걸어","먼 길을 혼자"],
          wx_ghost_blade:      ["귀검","보이지 않는 검","검이 보이지 않"],
          wx_mountain_hermit:  ["산중 은거","세속을 떠나","산에서 수련","은거"],
          wx_tournament_king:  ["무림 대회","비무 대회에서 우승","무림 최강"],
          wx_medic_saint:      ["의성","의원으로 이름","명의","의술로 명성"],
          wx_venomous_beauty:  ["독수","아름다움으로 유인","미모로 제압","독수의"],
          wx_iron_body:        ["금강불괴","철벽 같은 몸","무적의 육체","어떤 공격도"],
          wx_celestial_art:    ["천하제일","신공을 완성","세상에 하나뿐인 무공"],
          wx_spy_romance:      ["적진에서 사랑","적과의 만남","간첩으로 밀회"],
          wx_sword_broken:     ["검을 꺾고","무공을 포기","모든 것을 버리"],
          wx_revenge_completed:["복수를 완수","원수를 처단","오랜 복수"],
          wx_gang_boss:        ["방주","방파를 이끌","갱단 보스","조직의 수장"],
          wx_death_defying:    ["죽음에서 살아","사지에서 탈출","기적적으로 살아"],
          wx_jade_scroll:      ["옥간","비문을 해독","고대 문서 해독"],
          wx_phantom_step:     ["귀신보법","보법을 터득","신비한 발놀림","발이 보이지 않"],
          // 사이버펑크
          cp_neural_hack:      ["신경망 해킹","뇌를 해킹","임플란트 침투","신경 시스템 해킹"],
          cp_corpo_betrayal:   ["기업을 배신","코퍼레이트 배신","회사를 등지고","기업에서 탈출"],
          cp_chrome_body:      ["전신 사이보그","대부분의 신체 교체","크롬 신체","사이버네틱 전환"],
          cp_net_phantom:      ["넷 유령","사이버공간의 전설","최고 해커","넷에서 유명"],
          cp_gang_leader:      ["갱단 수장","갱의 리더","갱단을 이끌","범죄 조직 보스"],
          cp_black_market:     ["블랙마켓","암시장","불법 거래망","지하 시장"],
          cp_ai_communion:     ["ai와 교감","인공지능과 대화","ai와 친구","ai를 이해"],
          cp_memory_lost:      ["기억 손상","기억을 잃","메모리 오류","뇌 해킹으로 기억"],
          cp_street_legend:    ["스트리트 레전드","거리의 전설","하층민의 영웅","빈민가에서 전설"],
          cp_corpo_spy:        ["기업 스파이","내부 정보 빼돌","이중 에이전트","기업에 잠입"],
          cp_virus_creator:    ["바이러스 설계","디지털 바이러스","악성 코드 제작","사이버 무기 개발"],
          cp_implant_overload: ["임플란트 과부하","과부하를 극복","한계를 초과","임플란트 폭주"],
          cp_rogue_ai:         ["로그 ai","반란 ai","ai 해방","통제 벗어난 ai"],
          cp_neon_runner:      ["추격을 따돌","경찰 추격","기업 추격에서 도망","네온 속을 달려"],
          cp_datacore_breach:  ["데이터코어","최고 보안 서버","기업 심장부 침투"],
          cp_underground_doc:  ["언더그라운드 의사","비인가 수술","불법 의료","몰래 수술"],
          cp_psycho_survived:  ["사이코시스","사이버 광기","임플란트 광기","정신이 분열"],
          cp_media_sensation:  ["미디어에 등장","뉴스에 나와","유명 인사가","인터넷에서 유명"],
          cp_net_architect:    ["사이버공간 설계","넷 구조를 바꿀","코드로 세상을","넷 아키텍트"],
          cp_clone_mystery:    ["클론","복제인","내 복사본","또 다른 나"],
          cp_drug_lord:        ["약물 군주","강화 약물 유통","약물 제조","마약 제국"],
          cp_rebel_hero:       ["반란을 이끌","혁명 영웅","기업에 맞서","저항군 리더"],
          cp_ghost_protocol:   ["기록에서 지워","존재가 삭제","고스트 프로토콜","공식 기록 말소"],
          cp_enhanced_senses:  ["강화 감각","감각 임플란트","시각 증폭","청각 강화"],
          cp_corpo_exec:       ["임원이 됐","고위직에 오른","기업 임원","부사장"],
          cp_salvager:         ["폐허 수집","기술 유물 발굴","버려진 부품","고물 수집"],
          cp_digital_ghost:    ["의식이 복사","디지털로 전환","뇌가 업로드","디지털 망령"],
          cp_last_human:       ["임플란트 없이","순수 인간","기계 없이 살","개조를 거부"],
          cp_revolution:       ["혁명을 일으","도시를 뒤흔","전면 반란","체제를 뒤엎"],
        };
        scenarioTitles.forEach(titleDef => {
          const existingTitles = loadTitles();
          if (existingTitles.find(t => t.id === titleDef.id)) return;
          const kws = keywordMap[titleDef.id] || [];
          if (kws.some(kw => combinedText.includes(kw))) {
            grantTitle(titleDef.id);
          }
        });
      }
    } catch { setMessages(prev => [...prev, { role:"assistant", content:"...오류 발생.", characterName:character.name }]); }
    setLoading(false);
  };

  const startChat = async () => {
    setLoading(true);
    try {
      const text = await callGemini([], "이야기를 시작해 주십시오. 세계관과 분위기를 살려서 첫 장면을 묘사하십시오.");
      const msgObj = { role:"assistant", content:text, characterName:character.name, imageUrl:null, imageLoading:false };
      setMessages([msgObj]); generateChoices([msgObj]);
    } catch { setMessages([{ role:"assistant", content:"소환 실패.", characterName:character.name }]); }
    grantTitle("first_blood"); setLoading(false); setInitialized(true);
  };

  const CAT_LABELS = { combat: "전투", social: "사회", mental: "정신", survival: "생존", mystery: "신비" };
  const [statsPanelTab, setStatsPanelTab] = React.useState("stats");

  const scenarioId = character?.scenario === "중세 판타지" ? "medieval"
                   : character?.scenario === "무협 강호"   ? "wuxia"
                   : character?.scenario === "사이버펑크"  ? "cyberpunk"
                   : null;
  const scenarioCatLabel = character?.scenario === "중세 판타지" ? "중세" : character?.scenario === "무협 강호" ? "무협" : "사이버펑크";
  const scenarioAccent   = character?.scenario === "사이버펑크" ? "#00d4ff" : character?.scenario === "무협 강호" ? "#e05a5a" : "#c8a96e";

  // ── 스킬 패널 ──────────────────────────────────────────────────────
  const SkillPanel = () => {
    const [skillTab, setSkillTab] = React.useState("active");
    const currentTitles = loadTitles();
    const allSkills = getAllSkillDefs();
    const jobSkills = loadJobSkills();
    const hasJobSkills = jobSkills.length > 0;
    const clearRewards = loadClearRewards();
    const unlockedClearSkills = getAllClearSkillDefs().filter(s => unlockedSkills[s.id]);

    const skillsForTab = allSkills.filter(s => {
      if (skillTab === "active")  return s.type === "active";
      if (skillTab === "passive") return s.type === "passive";
      if (skillTab === "event")   return s.type === "event";
      if (skillTab === "job")     return !!s.jobRole;
      if (skillTab === "clear")   return getAllClearSkillDefs().some(cs => cs.id === s.id);
      return false;
    }).filter(s => {
      if (skillTab === "job" || skillTab === "clear") return true;
      return !s.scenario || s.scenario === scenarioId || !!s.jobRole;
    });

    const unlockSkill = (skillDef) => {
      if (!getSkillUnlockable(skillDef.id, unlockedSkills, stats, currentTitles)) return;
      if (skillDef.type !== "event") {
        const cost = SKILL_TREE_SP_COST(skillDef);
        if (skillSP < cost) return;
        setSkillSP(prev => { const n = prev - cost; saveSkillSP(n); return n; });
      }
      setUnlockedSkills(prev => {
        const next = { ...prev, [skillDef.id]: true };
        saveSkills(next);
        return next;
      });
      setSkillToast({ ...skillDef, toastType:"unlock" });
      setTimeout(() => setSkillToast(null), 3500);
    };
    const useActiveSkill = (skillDef) => {
      if (!unlockedSkills[skillDef.id]) return;
      if (skillDef.mpCost && stats.mp < skillDef.mpCost) return;
      if (skillDef.hpCost && stats.hp <= skillDef.hpCost) return;
      setInput(prev => `[스킬:${skillDef.id}] ${prev}`.trim());
      setShowSkillPanel(false);
    };

    return (
      <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowSkillPanel(false)}>
        <div style={{ width:"100%", maxWidth:460, maxHeight:"90vh", display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#050510,#0d0a20)", border:"2px solid #6a4aaa", boxShadow:"0 0 30px rgba(100,80,200,0.4)" }} onClick={e => e.stopPropagation()}>
          {/* 헤더 */}
          <div style={{ padding:"12px 16px 0", borderBottom:"1px solid #2a1a4a" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontSize:14, color:"#a08ad0", fontFamily:"'Cinzel',serif", letterSpacing:2 }}>⚔️ 스킬 시스템</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif", background:"rgba(200,169,110,0.1)", border:"1px solid #5a3e1a", padding:"3px 8px" }}>SP: {skillSP}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:0 }}>
              {[["active","⚔️ 능동"],["passive","🌀 패시브"],["event","🌟 이벤트"],["job","🧬 직업"],["clear","🏆 클리어"]].map(([tab, label]) => (
                <button key={tab} onClick={() => setSkillTab(tab)}
                  style={{ flex:1, padding:"7px 3px", background:skillTab===tab?"linear-gradient(135deg,#1a0d3a,#2a1a5a)":"transparent", border:"none", borderBottom:skillTab===tab?`2px solid ${tab==="clear"?"#c8a96e":"#8a5ae0"}`:"2px solid transparent", color:skillTab===tab?(tab==="clear"?"#c8a96e":"#b08ae0"):"#3a2a5a", fontFamily:"'Cinzel',serif", fontSize:8, cursor:"pointer" }}>{label}</button>
              ))}
            </div>
          </div>

          {/* 스킬 탭 설명 */}
          <div style={{ padding:"6px 16px", background:"rgba(80,50,150,0.1)", borderBottom:"1px solid #2a1a4a" }}>
            {skillTab === "active"  && <div style={{ fontSize:9, color:"#7a6aaa" }}>턴마다 MP를 소모해 사용. 입력창 옆 버튼 또는 직접 [스킬:id] 입력.</div>}
            {skillTab === "passive" && <div style={{ fontSize:9, color:"#7a6aaa" }}>조건 충족 시 자동 발동. 해금만 하면 됩니다.</div>}
            {skillTab === "event"   && <div style={{ fontSize:9, color:"#e05a5a" }}>특정 칭호/업적 달성 시 자동 해금. SP 소모 없음.</div>}
            {skillTab === "job"     && <div style={{ fontSize:9, color:"#5ae0aa" }}>캐릭터 직업 전용 AI 생성 스킬. 직업의 특성이 반영됩니다. ({loadJobSkills().length}개)</div>}
            {skillTab === "clear"   && <div style={{ fontSize:9, color:"#c8a96e" }}>시나리오 클리어 보상으로 획득한 특수 스킬. ({unlockedClearSkills.length}개 보유)</div>}
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
            {skillTab === "clear" && skillsForTab.filter(s => unlockedSkills[s.id]).length === 0 && (
              <div style={{ textAlign:"center", color:"#4a3a2a", fontSize:12, padding:"30px 0", fontFamily:"'Crimson Text',serif" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>🏆</div>
                시나리오를 클리어하면 특수 스킬을 획득할 수 있습니다.<br/>
                <span style={{ fontSize:10, color:"#3a2a1a" }}>엔딩 또는 사망 시 보상 화면에서 선택하세요.</span>
              </div>
            )}
            {skillsForTab.filter(s => skillTab !== "clear" || unlockedSkills[s.id]).map(skillDef => {
              const isUnlocked = !!unlockedSkills[skillDef.id];
              const canUnlock = getSkillUnlockable(skillDef.id, unlockedSkills, stats, currentTitles);
              const cost = skillDef.type === "event" ? 0 : SKILL_TREE_SP_COST(skillDef);
              const prereqs = SKILL_TREE[skillDef.id] || [];
              const mpOk = !skillDef.mpCost || stats.mp >= skillDef.mpCost;
              const hpOk = !skillDef.hpCost || stats.hp > skillDef.hpCost;
              const reqText = Object.entries(skillDef.req || {}).map(([k,v]) => `${getStatInfo(k)?.name||k} ${v}+`).join(" · ");
              const unlockTitleDef = skillDef.unlockTitle ? TITLE_DEFS.find(t => t.id === skillDef.unlockTitle) : null;

              return (
                <div key={skillDef.id} style={{ background: isUnlocked ? "linear-gradient(135deg,#0d0a20,#1a1535)" : "rgba(10,8,20,0.7)", border:`1px solid ${isUnlocked ? SKILL_RARITY_COLOR[skillDef.rarity] : "#2a1a4a"}`, padding:"10px 12px", opacity: isUnlocked ? 1 : canUnlock ? 0.9 : 0.45 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{skillDef.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                        <span style={{ fontSize:11, color:SKILL_RARITY_COLOR[skillDef.rarity], fontFamily:"'Cinzel',serif" }}>{skillDef.name}</span>
                        <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
                          {skillDef.mpCost > 0 && <span style={{ fontSize:9, color:"#3a6aaa" }}>MP -{skillDef.mpCost}</span>}
                          {skillDef.hpCost > 0 && <span style={{ fontSize:9, color:"#aa3a3a" }}>HP -{skillDef.hpCost}</span>}
                          {skillDef.hpRestore > 0 && <span style={{ fontSize:9, color:"#3aaa6a" }}>HP +{skillDef.hpRestore}</span>}
                          {skillDef.type !== "event" && <span style={{ fontSize:8, color:"#c8a96e", background:"rgba(200,169,110,0.1)", border:"1px solid #3a2a0a", padding:"1px 5px" }}>{cost}SP</span>}
                          {skillDef.type === "event" && <span style={{ fontSize:8, color:"#e05a5a", background:"rgba(220,80,80,0.1)", border:"1px solid #4a1a1a", padding:"1px 5px" }}>이벤트</span>}
                        </div>
                      </div>
                      <div style={{ fontSize:10, color:"#8a7aaa", fontFamily:"'Crimson Text',serif", marginBottom:4, lineHeight:1.4 }}>{skillDef.desc}</div>
                      {skillDef.type === "passive" && skillDef.conditionDesc && (
                        <div style={{ fontSize:9, color:"#4a9a6a", marginBottom:3 }}>🌀 발동 조건: {skillDef.conditionDesc}</div>
                      )}
                      {reqText && !isUnlocked && <div style={{ fontSize:9, color:"#5a4a7a" }}>요구: {reqText}</div>}
                      {prereqs.length > 0 && !isUnlocked && (
                        <div style={{ fontSize:9, color:"#4a3a6a" }}>선행: {prereqs.map(p => SKILL_DEFS.find(s=>s.id===p)?.name||p).join(", ")}</div>
                      )}
                      {unlockTitleDef && !isUnlocked && (
                        <div style={{ fontSize:9, color:"#9a5a3a" }}>🏅 필요 칭호: {unlockTitleDef.name}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop:7, display:"flex", gap:6 }}>
                    {!isUnlocked && skillDef.type !== "event" && (
                      <button onClick={() => unlockSkill(skillDef)} disabled={!canUnlock || skillSP < cost}
                        style={{ flex:1, padding:"6px 10px", background: canUnlock && skillSP >= cost ? "linear-gradient(135deg,#2a1a5a,#4a2a8a)" : "#0a0815", border:`1px solid ${canUnlock && skillSP >= cost ? "#6a4aaa":"#2a1a3a"}`, color: canUnlock && skillSP >= cost ? "#b08ae0":"#3a2a5a", fontFamily:"'Cinzel',serif", fontSize:9, cursor: canUnlock && skillSP >= cost ? "pointer":"not-allowed" }}>
                        🔓 해금 ({cost}SP)
                      </button>
                    )}
                    {!isUnlocked && skillDef.type === "event" && (
                      <div style={{ flex:1, fontSize:9, color:"#4a3a5a", textAlign:"center", padding:"6px", fontFamily:"'Cinzel',serif" }}>🔒 칭호 달성 시 자동 해금</div>
                    )}
                    {isUnlocked && (skillDef.type === "active" || skillDef.type === "event") && (
                      <button onClick={() => useActiveSkill(skillDef)} disabled={!mpOk || !hpOk}
                        style={{ flex:1, padding:"6px 10px", background: mpOk && hpOk ? "linear-gradient(135deg,#1a2a0a,#2a4a10)" : "#0a0a08", border:`1px solid ${mpOk && hpOk ? "#4a8a2a":"#2a2a1a"}`, color: mpOk && hpOk ? "#7ae040":"#3a3a2a", fontFamily:"'Cinzel',serif", fontSize:9, cursor: mpOk && hpOk ? "pointer":"not-allowed" }}>
                        {mpOk && hpOk ? "✅ 사용 (입력창에 추가)" : "⛔ MP/HP 부족"}
                      </button>
                    )}
                    {isUnlocked && skillDef.type === "passive" && (
                      <div style={{ flex:1, fontSize:9, color:"#3a8a4a", textAlign:"center", padding:"6px", fontFamily:"'Cinzel',serif" }}>✅ 해금됨 — 조건 시 자동 발동</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => setShowSkillPanel(false)} style={{ margin:"8px 12px", padding:"9px", background:"transparent", border:"1px solid #2a1a4a", color:"#4a3a6a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>닫기</button>
        </div>
      </div>
    );
  };


  // ── 명장면 하이라이트 패널 ──────────────────────────────────────
  const HighlightsPanel = () => {
    const typeColor = { crit_success:"#c8a96e", crit_fail:"#e74c3c" };
    const typeLabel = { crit_success:"대성공", crit_fail:"대실패" };
    return (
      <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowHighlights(false)}>
        <div style={{ width:"100%", maxWidth:420, maxHeight:"85vh", display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#0d0515,#180a28)", border:"2px solid #7a3aaa", boxShadow:"0 0 30px rgba(120,60,180,0.3)" }} onClick={e => e.stopPropagation()}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #3a1a5a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:14, color:"#b06ae0", fontFamily:"'Cinzel',serif" }}>⭐ 명장면 기록</div>
            <span style={{ fontSize:10, color:"#5a3a7a", fontFamily:"'Cinzel',serif" }}>{highlights.length}/30</span>
          </div>
          <div style={{ padding:"6px 16px", background:"rgba(100,50,160,0.1)", borderBottom:"1px solid #3a1a5a" }}>
            <div style={{ fontSize:9, color:"#6a4a8a" }}>대성공·대실패 장면이 자동으로 여기 기록됩니다.</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
            {highlights.length === 0 ? (
              <div style={{ textAlign:"center", color:"#3a2a5a", fontSize:12, padding:"30px 0", fontFamily:"'Crimson Text',serif" }}>아직 기록된 명장면이 없습니다.</div>
            ) : highlights.map((hl, i) => (
              <div key={hl.id || i} style={{ background:"linear-gradient(135deg,#0d0a1a,#1a1030)", border:`1px solid ${typeColor[hl.type]||"#3a2a5a"}`, padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                  <span style={{ fontSize:16 }}>{hl.icon}</span>
                  <span style={{ fontSize:11, color:typeColor[hl.type]||"#b06ae0", fontFamily:"'Cinzel',serif" }}>{typeLabel[hl.type]||hl.label}</span>
                  <span style={{ fontSize:9, color:"#4a3a6a", fontFamily:"'Cinzel',serif", marginLeft:"auto" }}>🎲 {hl.diceRoll}/{hl.statValue} ({hl.statName})</span>
                </div>
                <div style={{ fontSize:11, color:"#c8b890", fontFamily:"'Crimson Text',serif", lineHeight:1.5, opacity:0.9 }}>{hl.preview}…</div>
                <div style={{ fontSize:8, color:"#3a2a5a", marginTop:4, fontFamily:"'Cinzel',serif" }}>{new Date(hl.savedAt).toLocaleString("ko-KR", { month:"numeric", day:"numeric", hour:"2-digit", minute:"2-digit" })}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, margin:"8px 12px" }}>
            {highlights.length > 0 && (
              <button onClick={() => { if (window.confirm("명장면 기록을 모두 삭제할까요?")) { setHighlights([]); saveHighlights([]); } }}
                style={{ flex:1, padding:"9px", background:"transparent", border:"1px solid #4a1a1a", color:"#7a3a3a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>🗑️ 전체 삭제</button>
            )}
            <button onClick={() => setShowHighlights(false)} style={{ flex:2, padding:"9px", background:"transparent", border:"1px solid #3a1a5a", color:"#5a3a8a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>닫기</button>
          </div>
        </div>
      </div>
    );
  };

  const StatsPanel = () => {
    const earnedNow = loadTitles();
    const scenarioAchievements = TITLE_DEFS.filter(t => t.scenario === scenarioId);
    const generalTitles = TITLE_DEFS.filter(t => !t.scenario);
    return (
      <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowStatsPanel(false)}>
        <div style={{ width:"100%", maxWidth:460, maxHeight:"88vh", display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#0a0500,#150d03)", border:"2px solid #c8a96e", boxShadow:"0 0 30px rgba(200,169,110,0.3)" }} onClick={e => e.stopPropagation()}>
          <div style={{ padding:"12px 16px 0", borderBottom:"1px solid #2a1a05" }}>
            <div style={{ fontSize:16, color:"#c8a96e", fontFamily:"'Cinzel',serif", textAlign:"center", marginBottom:10 }}>{character.name}</div>
            <div style={{ display:"flex", gap:0 }}>
              {[["stats","📊 스탯"],["race","🌍 종족"],["titles","👑 칭호"],scenarioId&&["scenario","🏅 " + scenarioCatLabel + " 업적"]].filter(Boolean).map(([tab, label]) => (
                <button key={tab} onClick={() => setStatsPanelTab(tab)}
                  style={{ flex:1, padding:"7px 4px", background:statsPanelTab===tab?"linear-gradient(135deg,#2a1f0d,#3a2a10)":"transparent", border:"none", borderBottom:statsPanelTab===tab?`2px solid ${tab==="scenario"?scenarioAccent:"#c8a96e"}`:"2px solid transparent", color:statsPanelTab===tab?(tab==="scenario"?scenarioAccent:"#c8a96e"):"#4a3a2a", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:0.5, cursor:"pointer" }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>
            {statsPanelTab === "stats" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {["combat", "social", "mental", "survival", "mystery"].map(cat => (
                  <div key={cat}>
                    <div style={{ fontSize:11, color:"#c8a96e", marginBottom:7, borderBottom:"1px solid #3a2a0a", paddingBottom:4 }}>{CAT_LABELS[cat]}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {STAT_DEFS[cat].map(s => (
                        <div key={s.id} style={{ background:"rgba(20,10,0,0.5)", border:"1px solid #3a2a0a", padding:"7px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:10, color:"#e8d5a0" }}><span>{s.icon} {s.name}</span><span>{Math.round(stats[s.id])}/100</span></div>
                          <div style={{ height:5, background:"#1a0f00" }}><div style={{ width:`${Math.max(0, stats[s.id])}%`, height:"100%", background:s.color }}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {statsPanelTab === "race" && (() => {
              const savedRace = loadRace();
              const raceDef = savedRace ? RACE_DEFS.find(r => r.id === savedRace.id) : null;
              if (!raceDef) return (
                <div style={{ textAlign:"center", color:"#5a4a2a", fontSize:12, padding:"30px 0", fontFamily:"'Crimson Text',serif" }}>종족 정보가 없습니다.</div>
              );
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ padding:"14px", background:`linear-gradient(135deg,${raceDef.accent},#1a1208)`, border:`2px solid ${raceDef.color}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:28 }}>{raceDef.icon}</span>
                      <div>
                        <div style={{ fontSize:16, color:raceDef.color, fontFamily:"'Cinzel',serif", letterSpacing:2 }}>{raceDef.name}</div>
                        <div style={{ fontSize:10, color:"#8a7a5a", fontFamily:"'Cinzel',serif" }}>{raceDef.desc}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:"#c8b890", fontFamily:"'Crimson Text',serif", lineHeight:1.6, fontStyle:"italic" }}>{raceDef.lore}</div>
                  </div>

                  <div>
                    <div style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif", marginBottom:6, letterSpacing:1 }}>✦ 종족 스탯</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {Object.entries(raceDef.statBonus).map(([k,v]) => {
                        const info = getStatInfo(k);
                        return <div key={k} style={{ padding:"5px 9px", background:"rgba(0,80,0,0.2)", border:"1px solid #2a5a2a", fontSize:10, color:"#7adf7a", fontFamily:"'Cinzel',serif" }}>{info?.icon}{info?.name} +{v}</div>;
                      })}
                      {Object.entries(raceDef.statPenalty||{}).map(([k,v]) => {
                        const info = getStatInfo(k);
                        return <div key={k} style={{ padding:"5px 9px", background:"rgba(80,0,0,0.2)", border:"1px solid #5a2a2a", fontSize:10, color:"#df7a7a", fontFamily:"'Cinzel',serif" }}>{info?.icon}{info?.name} {v}</div>;
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif", marginBottom:6, letterSpacing:1 }}>⚔️ 종족 전용 스킬</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {raceDef.skills.map(sk => {
                        const isUnlocked = !!unlockedSkills[sk.id];
                        return (
                          <div key={sk.id} style={{ padding:"9px 11px", background: isUnlocked ? "linear-gradient(135deg,#0d1a0d,#101e10)" : "rgba(10,10,10,0.5)", border:`1px solid ${isUnlocked ? SKILL_RARITY_COLOR[sk.rarity] : "#2a2a1a"}`, opacity: isUnlocked ? 1 : 0.7 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                              <span style={{ fontSize:16 }}>{sk.icon}</span>
                              <span style={{ fontSize:10, color:SKILL_RARITY_COLOR[sk.rarity], fontFamily:"'Cinzel',serif" }}>{sk.name}</span>
                              <span style={{ marginLeft:"auto", fontSize:8, color: isUnlocked ? "#3aaa6a" : "#5a4a2a", fontFamily:"'Cinzel',serif" }}>{isUnlocked ? "✅ 해금됨" : "🔒 미해금"}</span>
                            </div>
                            <div style={{ fontSize:10, color:"#8a7a5a", fontFamily:"'Crimson Text',serif", lineHeight:1.4 }}>{sk.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif", marginBottom:6, letterSpacing:1 }}>🌐 종족 관계도</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {Object.entries(raceDef.relations).map(([raceId, rel]) => {
                        const otherRace = RACE_DEFS.find(r => r.id === raceId);
                        if (!otherRace) return null;
                        const score = rel.score;
                        const barColor = score >= 50 ? "#4a9a6a" : score >= 0 ? "#c8a96e" : score >= -50 ? "#e07a3a" : "#e03a3a";
                        const barWidth = Math.abs(score);
                        return (
                          <div key={raceId} style={{ padding:"8px 10px", background:"rgba(10,5,0,0.4)", border:"1px solid #2a1a05" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                              <span style={{ fontSize:14 }}>{otherRace.icon}</span>
                              <span style={{ fontSize:10, color:otherRace.color, fontFamily:"'Cinzel',serif" }}>{otherRace.name}</span>
                              <span style={{ marginLeft:"auto", fontSize:9, color:barColor, fontFamily:"'Cinzel',serif" }}>{rel.label}</span>
                            </div>
                            <div style={{ height:4, background:"#1a0f00", marginBottom:4 }}>
                              <div style={{ width:`${barWidth}%`, height:"100%", background:barColor, marginLeft: score >= 0 ? 0 : "auto" }} />
                            </div>
                            <div style={{ fontSize:9, color:"#7a6a4a", fontFamily:"'Crimson Text',serif" }}>{rel.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {statsPanelTab === "titles" && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ fontSize:9, color:"#5a4a2a", marginBottom:4, fontFamily:"'Cinzel',serif" }}>획득: {earnedNow.length}개</div>
                {generalTitles.map(def => {
                  const earned = earnedNow.find(t => t.id === def.id);
                  return (
                    <div key={def.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:earned?"linear-gradient(135deg,#1a1208,#2a1a08)":"rgba(10,5,0,0.5)", border:`1px solid ${earned?RARITY_COLOR[def.rarity]:"#1a1008"}`, opacity:earned?1:0.4 }}>
                      <span style={{ fontSize:15, width:22, textAlign:"center" }}>{def.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:10, color:earned?RARITY_COLOR[def.rarity]:"#4a3a2a", fontFamily:"'Cinzel',serif" }}>{def.name}</div>
                        <div style={{ fontSize:9, color:"#6a5a3a", fontFamily:"'Crimson Text',serif" }}>{def.desc}</div>
                      </div>
                      {earned && <span style={{ fontSize:8, color:"#3a8a3a", fontFamily:"'Cinzel',serif", flexShrink:0 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {statsPanelTab === "scenario" && scenarioId && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ fontSize:9, color:"#5a4a2a", marginBottom:4, fontFamily:"'Cinzel',serif" }}>
                  {character.scenario} 특수 업적 — 획득: {earnedNow.filter(t => scenarioAchievements.find(a => a.id===t.id)).length} / {scenarioAchievements.length}
                </div>
                {scenarioAchievements.map(def => {
                  const earned = earnedNow.find(t => t.id === def.id);
                  return (
                    <div key={def.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:earned?`linear-gradient(135deg,#0a100a,#101a10)`:"rgba(5,8,5,0.5)", border:`1px solid ${earned?RARITY_COLOR[def.rarity]:"#1a1a0a"}`, opacity:earned?1:0.35 }}>
                      <span style={{ fontSize:15, width:22, textAlign:"center" }}>{def.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:10, color:earned?RARITY_COLOR[def.rarity]:"#3a3a2a", fontFamily:"'Cinzel',serif" }}>{def.name}</div>
                        <div style={{ fontSize:9, color:"#5a5a3a", fontFamily:"'Crimson Text',serif" }}>{def.desc}</div>
                        {earned && def.bonus && (
                          <div style={{ fontSize:8, color:"#4a7a4a", fontFamily:"'Cinzel',serif", marginTop:2 }}>
                            {Object.entries(def.bonus).map(([k,v]) => `${getStatInfo(k)?.name||k} ${v>0?"+":""}${v}`).join(" · ")}
                          </div>
                        )}
                      </div>
                      {earned ? <span style={{ fontSize:8, color:"#3a8a3a", fontFamily:"'Cinzel',serif", flexShrink:0 }}>✓</span>
                               : <span style={{ fontSize:8, color:"#2a2a1a", fontFamily:"'Cinzel',serif", flexShrink:0 }}>🔒</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => setShowStatsPanel(false)} style={{ margin:"8px 12px", padding:"9px", background:"transparent", border:"1px solid #3a2a0a", color:"#5a4a2a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>닫기</button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════
  // 11번 수정: 날씨·시간대 설정 패널
  // ══════════════════════════════════════════════════════
  const AtmospherePanel = () => {
    const WEATHER_OPTS = [
      { id:"none", label:"설정 없음", icon:"—" }, { id:"clear", label:"맑음", icon:"☀️" },
      { id:"cloudy", label:"흐림", icon:"☁️" }, { id:"rain", label:"비", icon:"🌧️" },
      { id:"storm", label:"폭풍", icon:"⛈️" }, { id:"snow", label:"눈", icon:"❄️" },
      { id:"fog", label:"안개", icon:"🌫️" }, { id:"sandstorm", label:"모래폭풍", icon:"🌪️" },
      { id:"thunder", label:"천둥번개", icon:"⚡" },
    ];
    const TIME_OPTS = [
      { id:"none", label:"설정 없음", icon:"—" }, { id:"dawn", label:"새벽", icon:"🌅" },
      { id:"morning", label:"아침", icon:"🌄" }, { id:"noon", label:"한낮", icon:"🌞" },
      { id:"afternoon", label:"오후", icon:"🌤️" }, { id:"evening", label:"저녁", icon:"🌆" },
      { id:"night", label:"밤", icon:"🌙" }, { id:"midnight", label:"한밤중", icon:"🌑" },
    ];
    const [local, setLocal] = React.useState(atmosphere);
    const apply = () => {
      saveAtmosphere(local);
      setAtmosphereState(local);
      const mem = loadMemory();
      systemRef.current = buildSystem(character, loadTitles(), mem, loadNPCs(), summons, monstersRef.current);
      setShowAtmospherePanel(false);
    };
    return (
      <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowAtmospherePanel(false)}>
        <div style={{ width:"100%", maxWidth:420, maxHeight:"85vh", display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#050a15,#0a1020)", border:"2px solid #4a7aaa", boxShadow:"0 0 30px rgba(74,122,170,0.3)" }} onClick={e => e.stopPropagation()}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a2a3a" }}>
            <div style={{ fontSize:14, color:"#7abaee", fontFamily:"'Cinzel',serif" }}>🌤️ 환경 설정</div>
            <div style={{ fontSize:9, color:"#4a6a8a", marginTop:3, fontFamily:"'Crimson Text',serif" }}>날씨와 시간대가 서사와 판정에 실제 반영됩니다.</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <div style={{ fontSize:10, color:"#7abaee", fontFamily:"'Cinzel',serif", marginBottom:8 }}>🌦️ 날씨</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                {WEATHER_OPTS.map(w => (
                  <button key={w.id} onClick={() => setLocal(l => ({...l, weather:w.id}))}
                    style={{ padding:"8px 6px", background:local.weather===w.id?"linear-gradient(135deg,#0a1a2a,#1a2a4a)":"rgba(10,20,30,0.5)", border:`1px solid ${local.weather===w.id?"#4a9aee":"#1a2a3a"}`, color:local.weather===w.id?"#7abaee":"#4a6a8a", fontSize:10, fontFamily:"'Cinzel',serif", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:16 }}>{w.icon}</span>{w.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, color:"#7abaee", fontFamily:"'Cinzel',serif", marginBottom:8 }}>🕐 시간대</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {TIME_OPTS.map(t => (
                  <button key={t.id} onClick={() => setLocal(l => ({...l, timeOfDay:t.id}))}
                    style={{ padding:"8px 4px", background:local.timeOfDay===t.id?"linear-gradient(135deg,#0a1a2a,#1a2a4a)":"rgba(10,20,30,0.5)", border:`1px solid ${local.timeOfDay===t.id?"#4a9aee":"#1a2a3a"}`, color:local.timeOfDay===t.id?"#7abaee":"#4a6a8a", fontSize:9, fontFamily:"'Cinzel',serif", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, margin:"8px 12px" }}>
            <button onClick={() => setShowAtmospherePanel(false)} style={{ flex:1, padding:"9px", background:"transparent", border:"1px solid #1a2a3a", color:"#4a6a8a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>취소</button>
            <button onClick={apply} style={{ flex:2, padding:"9px", background:"linear-gradient(135deg,#0a2a4a,#1a3a6a)", border:"1px solid #4a7aaa", color:"#7abaee", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>✅ 적용 (서사에 반영)</button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════
  // 10번 수정: NPC·퀘스트·세계관 노트 편집 패널
  // ══════════════════════════════════════════════════════
  const WorldPanel = () => {
    const [tab, setTab] = React.useState("npc");
    const [npcForm, setNpcForm] = React.useState({ name:"", role:"", personality:"", type:"major" });
    const [questForm, setQuestForm] = React.useState({ title:"", desc:"", status:"active" });
    const [noteForm, setNoteForm] = React.useState({ category:"장소", title:"", content:"" });
    const NOTE_CATS = ["장소","인물","사건","비밀","전설","기타"];

    const addNpc = () => {
      if (!npcForm.name.trim()) return;
      const next = [...worldNpcs, { id: Date.now(), ...npcForm, active: true }];
      setWorldNpcs(next); saveNPCs(next);
      setNpcForm({ name:"", role:"", personality:"", type:"major" });
      const mem = loadMemory();
      systemRef.current = buildSystem(character, loadTitles(), mem, next, summons, monstersRef.current);
    };
    const removeNpc = (id) => {
      const next = worldNpcs.filter(n => n.id !== id);
      setWorldNpcs(next); saveNPCs(next);
      const mem = loadMemory();
      systemRef.current = buildSystem(character, loadTitles(), mem, next, summons, monstersRef.current);
    };
    const addQuest = () => {
      if (!questForm.title.trim()) return;
      const next = [...worldQuests, { id: Date.now(), ...questForm }];
      setWorldQuests(next); saveQuests(next);
      setQuestForm({ title:"", desc:"", status:"active" });
    };
    const removeQuest = (id) => { const next = worldQuests.filter(q => q.id !== id); setWorldQuests(next); saveQuests(next); };
    const toggleQuestStatus = (id) => {
      const next = worldQuests.map(q => q.id === id ? { ...q, status: q.status === "active" ? "done" : "active" } : q);
      setWorldQuests(next); saveQuests(next);
    };
    const addNote = () => {
      if (!noteForm.title.trim()) return;
      const next = [...worldNotes, { id: Date.now(), ...noteForm }];
      setWorldNotes(next); saveWorldNotes(next);
      setNoteForm({ category:"장소", title:"", content:"" });
      const mem = loadMemory();
      systemRef.current = buildSystem(character, loadTitles(), mem, worldNpcs, summons, monstersRef.current);
    };
    const removeNote = (id) => {
      const next = worldNotes.filter(n => n.id !== id);
      setWorldNotes(next); saveWorldNotes(next);
    };

    return (
      <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowWorldPanel(false)}>
        <div style={{ width:"100%", maxWidth:460, maxHeight:"90vh", display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#050a08,#0a1510)", border:"2px solid #3a7a5a", boxShadow:"0 0 30px rgba(58,122,90,0.3)" }} onClick={e => e.stopPropagation()}>
          <div style={{ padding:"10px 16px 0", borderBottom:"1px solid #1a3a2a" }}>
            <div style={{ fontSize:14, color:"#7abea0", fontFamily:"'Cinzel',serif", marginBottom:8 }}>🌍 세계 관리</div>
            <div style={{ display:"flex", gap:0 }}>
              {[["npc","👥 NPC"],["quest","📋 퀘스트"],["notes","📜 세계관 노트"]].map(([t,l]) => (
                <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"7px 4px", background:tab===t?"linear-gradient(135deg,#0a1a10,#1a2a1a)":"transparent", border:"none", borderBottom:tab===t?"2px solid #4a9a6a":"2px solid transparent", color:tab===t?"#7abea0":"#3a5a4a", fontFamily:"'Cinzel',serif", fontSize:9, cursor:"pointer" }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
            {tab === "npc" && (
              <>
                {/* NPC 추가 폼 */}
                <div style={{ background:"rgba(20,40,25,0.5)", border:"1px solid #2a4a3a", padding:10, display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ fontSize:9, color:"#4a7a5a", fontFamily:"'Cinzel',serif" }}>+ NPC 추가</div>
                  <div style={{ display:"flex", gap:5 }}>
                    <input value={npcForm.name} onChange={e => setNpcForm(f => ({...f, name:e.target.value}))} placeholder="이름" style={{ flex:1, background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:12, padding:"6px 8px", fontFamily:"'Crimson Text',serif" }} />
                    <input value={npcForm.role} onChange={e => setNpcForm(f => ({...f, role:e.target.value}))} placeholder="역할/직업" style={{ flex:1, background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:12, padding:"6px 8px", fontFamily:"'Crimson Text',serif" }} />
                  </div>
                  <input value={npcForm.personality} onChange={e => setNpcForm(f => ({...f, personality:e.target.value}))} placeholder="성격/특징 (AI가 이 NPC를 묘사할 때 참고)" style={{ background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:12, padding:"6px 8px", fontFamily:"'Crimson Text',serif" }} />
                  <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                    <select value={npcForm.type} onChange={e => setNpcForm(f => ({...f, type:e.target.value}))} style={{ background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:11, padding:"5px 6px" }}>
                      <option value="major">주요 인물 (상세 반영)</option>
                      <option value="minor">단역 (간략 반영)</option>
                    </select>
                    <button onClick={addNpc} style={{ padding:"6px 12px", background:"linear-gradient(135deg,#1a3a2a,#2a5a3a)", border:"1px solid #4a8a5a", color:"#7abea0", fontSize:10, cursor:"pointer", fontFamily:"'Cinzel',serif", flexShrink:0 }}>추가</button>
                  </div>
                </div>
                {/* NPC 목록 */}
                {worldNpcs.length === 0
                  ? <div style={{ textAlign:"center", color:"#2a4a3a", fontSize:12, padding:"20px 0", fontFamily:"'Crimson Text',serif" }}>등록된 NPC가 없습니다.</div>
                  : worldNpcs.map(n => (
                    <div key={n.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:"linear-gradient(135deg,#0a1a10,#050a08)", border:`1px solid ${n.type==="major"?"#3a7a5a":"#1a3a2a"}` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, color:n.type==="major"?"#7abea0":"#4a7a5a", fontFamily:"'Cinzel',serif" }}>{n.name} <span style={{ fontSize:9, color:"#3a5a4a" }}>({n.role})</span></div>
                        {n.personality && <div style={{ fontSize:9, color:"#4a6a5a", fontFamily:"'Crimson Text',serif", marginTop:2 }}>{n.personality}</div>}
                      </div>
                      <span style={{ fontSize:8, color:"#2a5a3a", fontFamily:"'Cinzel',serif", flexShrink:0 }}>{n.type==="major"?"주요":"단역"}</span>
                      <button onClick={() => removeNpc(n.id)} style={{ background:"transparent", border:"1px solid #3a1a1a", color:"#5a2a2a", fontSize:9, padding:"3px 6px", cursor:"pointer" }}>✕</button>
                    </div>
                  ))
                }
              </>
            )}

            {tab === "quest" && (
              <>
                <div style={{ background:"rgba(20,40,25,0.5)", border:"1px solid #2a4a3a", padding:10, display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ fontSize:9, color:"#4a7a5a", fontFamily:"'Cinzel',serif" }}>+ 퀘스트 추가</div>
                  <input value={questForm.title} onChange={e => setQuestForm(f => ({...f, title:e.target.value}))} placeholder="퀘스트 제목" style={{ background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:12, padding:"6px 8px", fontFamily:"'Crimson Text',serif" }} />
                  <textarea rows={2} value={questForm.desc} onChange={e => setQuestForm(f => ({...f, desc:e.target.value}))} placeholder="퀘스트 설명 (선택)" style={{ background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:12, padding:"6px 8px", fontFamily:"'Crimson Text',serif", resize:"none" }} />
                  <button onClick={addQuest} style={{ padding:"6px", background:"linear-gradient(135deg,#1a3a2a,#2a5a3a)", border:"1px solid #4a8a5a", color:"#7abea0", fontSize:10, cursor:"pointer", fontFamily:"'Cinzel',serif" }}>추가</button>
                </div>
                {worldQuests.length === 0
                  ? <div style={{ textAlign:"center", color:"#2a4a3a", fontSize:12, padding:"20px 0", fontFamily:"'Crimson Text',serif" }}>등록된 퀘스트가 없습니다.</div>
                  : worldQuests.map(q => (
                    <div key={q.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 10px", background:"linear-gradient(135deg,#0a1a10,#050a08)", border:`1px solid ${q.status==="done"?"#2a4a2a":"#4a8a5a"}`, opacity:q.status==="done"?0.6:1 }}>
                      <button onClick={() => toggleQuestStatus(q.id)} style={{ background:"transparent", border:`1.5px solid ${q.status==="done"?"#4a8a4a":"#6aaa6a"}`, borderRadius:"50%", width:18, height:18, flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", marginTop:2 }}>
                        {q.status==="done" && <div style={{ width:10, height:10, borderRadius:"50%", background:"#4a8a4a" }}/>}
                      </button>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, color:q.status==="done"?"#3a5a3a":"#7abea0", fontFamily:"'Cinzel',serif", textDecoration:q.status==="done"?"line-through":"none" }}>{q.title}</div>
                        {q.desc && <div style={{ fontSize:9, color:"#4a6a5a", fontFamily:"'Crimson Text',serif", marginTop:2 }}>{q.desc}</div>}
                      </div>
                      <button onClick={() => removeQuest(q.id)} style={{ background:"transparent", border:"1px solid #3a1a1a", color:"#5a2a2a", fontSize:9, padding:"3px 6px", cursor:"pointer", flexShrink:0 }}>✕</button>
                    </div>
                  ))
                }
              </>
            )}

            {tab === "notes" && (
              <>
                <div style={{ background:"rgba(20,40,25,0.5)", border:"1px solid #2a4a3a", padding:10, display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ fontSize:9, color:"#4a7a5a", fontFamily:"'Cinzel',serif" }}>+ 세계관 노트 추가 (AI 서사에 반영됨)</div>
                  <div style={{ display:"flex", gap:5 }}>
                    <select value={noteForm.category} onChange={e => setNoteForm(f => ({...f, category:e.target.value}))} style={{ background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:11, padding:"6px" }}>
                      {NOTE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={noteForm.title} onChange={e => setNoteForm(f => ({...f, title:e.target.value}))} placeholder="제목" style={{ flex:1, background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:12, padding:"6px 8px", fontFamily:"'Crimson Text',serif" }} />
                  </div>
                  <textarea rows={2} value={noteForm.content} onChange={e => setNoteForm(f => ({...f, content:e.target.value}))} placeholder="내용" style={{ background:"#050a08", border:"1px solid #2a3a2a", color:"#a0d0b0", fontSize:12, padding:"6px 8px", fontFamily:"'Crimson Text',serif", resize:"none" }} />
                  <button onClick={addNote} style={{ padding:"6px", background:"linear-gradient(135deg,#1a3a2a,#2a5a3a)", border:"1px solid #4a8a5a", color:"#7abea0", fontSize:10, cursor:"pointer", fontFamily:"'Cinzel',serif" }}>추가</button>
                </div>
                {worldNotes.length === 0
                  ? <div style={{ textAlign:"center", color:"#2a4a3a", fontSize:12, padding:"20px 0", fontFamily:"'Crimson Text',serif" }}>등록된 노트가 없습니다.</div>
                  : worldNotes.map(n => (
                    <div key={n.id} style={{ display:"flex", gap:8, padding:"8px 10px", background:"linear-gradient(135deg,#0a1a10,#050a08)", border:"1px solid #2a4a3a" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                          <span style={{ fontSize:8, color:"#3a7a5a", fontFamily:"'Cinzel',serif", background:"rgba(40,100,60,0.2)", border:"1px solid #2a5a3a", padding:"1px 5px" }}>{n.category}</span>
                          <span style={{ fontSize:10, color:"#7abea0", fontFamily:"'Cinzel',serif" }}>{n.title}</span>
                        </div>
                        <div style={{ fontSize:9, color:"#5a8a6a", fontFamily:"'Crimson Text',serif" }}>{n.content}</div>
                      </div>
                      <button onClick={() => removeNote(n.id)} style={{ background:"transparent", border:"1px solid #3a1a1a", color:"#5a2a2a", fontSize:9, padding:"3px 6px", cursor:"pointer", flexShrink:0, alignSelf:"flex-start" }}>✕</button>
                    </div>
                  ))
                }
              </>
            )}
          </div>
          <button onClick={() => setShowWorldPanel(false)} style={{ margin:"8px 12px", padding:"9px", background:"transparent", border:"1px solid #1a3a2a", color:"#4a6a5a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>닫기</button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════
  // 8번 수정: 핵심 기억(core memory) 직접 편집 패널
  // ══════════════════════════════════════════════════════
  const MemoryEditorPanel = () => {
    const [draft, setDraft] = React.useState(() => loadMemory().core || "");
    const save = () => {
      const mem = loadMemory();
      const updated = { ...mem, core: draft };
      saveMemory(updated);
      systemRef.current = buildSystem(character, loadTitles(), updated, loadNPCs(), summons, monstersRef.current);
      setShowMemoryEditor(false);
    };
    return (
      <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowMemoryEditor(false)}>
        <div style={{ width:"100%", maxWidth:440, display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#050008,#0a0015)", border:"2px solid #7a3aaa", boxShadow:"0 0 30px rgba(120,60,180,0.4)" }} onClick={e => e.stopPropagation()}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #2a1a4a" }}>
            <div style={{ fontSize:14, color:"#b07aee", fontFamily:"'Cinzel',serif" }}>🔴 핵심 기억 편집</div>
            <div style={{ fontSize:9, color:"#6a4a8a", marginTop:3, fontFamily:"'Crimson Text',serif" }}>AI가 항상 기억하는 핵심 설정을 직접 작성하세요. 세계관, 비밀, 중요 사건 등.</div>
          </div>
          <div style={{ padding:14 }}>
            <textarea rows={7} value={draft} onChange={e => setDraft(e.target.value)} placeholder={"예시:\n- 플레이어는 왕국의 비밀 조직 '그림자 검'의 일원이다.\n- 마왕은 사실 주인공의 아버지다.\n- 마을 촌장은 적에게 매수된 첩자다."} style={{ width:"100%", background:"#050008", border:"1px solid #4a2a7a", color:"#d0b0f0", fontSize:13, padding:"10px 12px", fontFamily:"'Crimson Text',serif", lineHeight:1.7, resize:"none", boxSizing:"border-box" }} />
            <div style={{ fontSize:8, color:"#4a2a6a", marginTop:4, fontFamily:"'Cinzel',serif" }}>{draft.length}자 · 너무 길면 토큰 한도에 영향을 줍니다.</div>
          </div>
          <div style={{ display:"flex", gap:8, margin:"0 12px 12px" }}>
            <button onClick={() => setShowMemoryEditor(false)} style={{ flex:1, padding:"9px", background:"transparent", border:"1px solid #2a1a4a", color:"#4a3a6a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>취소</button>
            <button onClick={save} style={{ flex:2, padding:"9px", background:"linear-gradient(135deg,#2a1a4a,#4a2a8a)", border:"1px solid #7a4aaa", color:"#c0a0f0", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>💾 저장 (즉시 반영)</button>
          </div>
        </div>
      </div>
    );
  };

  // ── 아이템 효과 정의 테이블 ──────────────────────────────────
  const ITEM_EFFECTS = {
    // 소비 아이템 (사용 시 즉시 효과 → 인벤토리에서 제거)
    "허름한 단검":        { type:"consume", effects:{ str:3 },           desc:"STR +3" },
    "낡은 갑옷 조각":     { type:"consume", effects:{ end:3 },           desc:"END +3" },
    "잡초 약초":          { type:"consume", effects:{ hp:8 },            desc:"HP +8" },
    "돌멩이":             { type:"consume", effects:{ str:1 },           desc:"STR +1" },
    "치유 포션":          { type:"consume", effects:{ hp:20 },           desc:"HP +20" },
    "마나 포션":          { type:"consume", effects:{ mp:20 },           desc:"MP +20" },
    "고급 치유 포션":     { type:"consume", effects:{ hp:40 },           desc:"HP +40" },
    "독 주머니":          { type:"consume", effects:{ pstx:8, crit:5 },  desc:"독성 +8, 치명 +5" },
    "마법석":             { type:"consume", effects:{ mgc:8, mp:10 },    desc:"마법 +8, MP +10" },
    "희귀 약초":          { type:"consume", effects:{ hp:15, mp:10 },    desc:"HP +15, MP +10" },
    "봉인된 마석":        { type:"consume", effects:{ mgc:12, wil:5 },   desc:"마법 +12, 의지 +5" },
    "보스의 심장석":      { type:"consume", effects:{ str:8, end:8, hp:15 }, desc:"STR +8, END +8, HP +15" },
    // 생존 소비 아이템 (포만감·피로도 회복)
    "빵 한 조각":         { type:"consume", effects:{ food:20 },                 desc:"포만감 +20" },
    "고기 구이":          { type:"consume", effects:{ food:40, hp:5 },           desc:"포만감 +40, HP +5" },
    "진수성찬":           { type:"consume", effects:{ food:80, hp:15, str:3 },   desc:"포만감 +80, HP +15, STR +3" },
    "숙면 물약":          { type:"consume", effects:{ ftg:-40, mp:15 },          desc:"피로도 -40, MP +15" },
    "각성제":             { type:"consume", effects:{ ftg:-20, agi:5, mp:10 },   desc:"피로도 -20, AGI +5, MP +10" },
    "영약":               { type:"consume", effects:{ hp:30, mp:30, food:30, ftg:-30 }, desc:"HP·MP·포만감 +30, 피로도 -30" },
    // 장착 아이템 (장착 시 스탯 부여 → 해제 시 복구; 인벤 유지)
    "철제 검":            { type:"equip", slot:"weapon", effects:{ str:8, crit:5 },        desc:"STR +8, CRIT +5" },
    "강철 검":            { type:"equip", slot:"weapon", effects:{ str:14, crit:8 },       desc:"STR +14, CRIT +8" },
    "가죽 갑옷":          { type:"equip", slot:"armor",  effects:{ end:8, hp:5 },          desc:"END +8, HP +5" },
    "사슬 갑옷":          { type:"equip", slot:"armor",  effects:{ end:14, hp:10 },        desc:"END +14, HP +10" },
    "정예 갑옷":          { type:"equip", slot:"armor",  effects:{ end:20, hp:15, str:5 }, desc:"END +20, HP +15, STR +5" },
    "전설의 검 파편":     { type:"equip", slot:"weapon", effects:{ str:18, crit:12, agi:5 }, desc:"STR +18, CRIT +12, AGI +5" },
    "전설 유물":          { type:"equip", slot:"accessory", effects:{ luk:15, wil:10, mgc:8 }, desc:"LUK +15, WIL +10, MGC +8" },
    "고대 마법서":        { type:"equip", slot:"accessory", effects:{ mgc:18, mp:15, int:10 }, desc:"MGC +18, MP +15, INT +10" },
    "전설 장비 설계도":   { type:"equip", slot:"accessory", effects:{ int:12, per:8 },     desc:"INT +12, PER +8" },
    "비밀 지도":          { type:"equip", slot:"accessory", effects:{ per:8, luk:6 },      desc:"PER +8, LUK +6" },
    "희귀 마법서":        { type:"equip", slot:"accessory", effects:{ mgc:12, mp:10 },     desc:"MGC +12, MP +10" },
    "신성한 유물":        { type:"equip", slot:"accessory", effects:{ fath:15, wil:10, hp:10 }, desc:"신앙 +15, WIL +10, HP +10" },
    "불멸의 결정":        { type:"equip", slot:"accessory", effects:{ hp:20, end:10, wil:8 }, desc:"HP +20, END +10, WIL +8" },
    "용의 비늘":          { type:"equip", slot:"armor",  effects:{ end:18, str:8, hp:12 }, desc:"END +18, STR +8, HP +12" },
    "칭호 증서":          { type:"consume", effects:{ luk:5, rep:5 },    desc:"LUK +5, REP +5" },

    // ── 클리어 보상 아이템 효과 ────────────────────────────────
    // 중세 판타지
    "왕국 영웅 휘장":     { type:"equip", slot:"accessory", effects:{ ldr:6, rep:5, fear:3 },          desc:"통솔 +6, 평판 +5, 공포 +3" },
    "용의 이빨 목걸이":   { type:"equip", slot:"accessory", effects:{ str:8, mgc:6, crit:5 },          desc:"STR +8, MGC +6, CRIT +5" },
    "고대 왕관 파편":     { type:"equip", slot:"accessory", effects:{ ldr:10, int:6, wil:5 },          desc:"통솔 +10, INT +6, WIL +5" },
    "성수 플라스크":      { type:"consume", effects:{ hp:50, fath:10, crse:-15 },                       desc:"HP +50, 신앙 +10, 저주도 -15" },
    "룬 문자 단검":       { type:"equip", slot:"weapon",    effects:{ str:10, crit:8, mgc:4 },          desc:"STR +10, CRIT +8, MGC +4" },
    "기사단 방패":        { type:"equip", slot:"armor",     effects:{ end:12, hp:10, wil:4 },           desc:"END +12, HP +10, WIL +4" },
    "운명의 두루마리":    { type:"consume", effects:{ luk:20, wil:8, per:6 },                           desc:"LUK +20, WIL +8, PER +6" },
    "불로 영약":          { type:"consume", effects:{ hp:60, mp:40, end:10, wil:8 },                    desc:"HP +60, MP +40, END +10, WIL +8" },
    "정령의 반지":        { type:"equip", slot:"accessory", effects:{ mgc:8, per:6, luk:5 },            desc:"MGC +8, PER +6, LUK +5" },
    "전쟁 훈장":          { type:"equip", slot:"accessory", effects:{ str:4, end:4, rep:6 },            desc:"STR +4, END +4, 평판 +6" },
    // 무협
    "무림맹 옥패":        { type:"equip", slot:"accessory", effects:{ rep:8, ldr:5, neg:4 },            desc:"평판 +8, 통솔 +5, 교섭 +4" },
    "천하제일 신검":      { type:"equip", slot:"weapon",    effects:{ str:12, crit:10, agi:6 },         desc:"STR +12, CRIT +10, AGI +6" },
    "내단 응결환":        { type:"consume", effects:{ mp:60, str:10, wil:8, cal:6 },                    desc:"MP +60, STR +10, WIL +8, CAL +6" },
    "귀신 도포":          { type:"equip", slot:"armor",     effects:{ agi:10, disg:8, cal:4 },          desc:"AGI +10, 위장 +8, CAL +4" },
    "천년 혈삼":          { type:"consume", effects:{ hp:40, mp:30, end:8, regen:6 },                   desc:"HP +40, MP +30, END +8, REGEN +6" },
    "독뱀 반지":          { type:"equip", slot:"accessory", effects:{ pstx:10, crit:6, fear:4 },        desc:"독내성 +10, CRIT +6, FEAR +4" },
    "태극 비급 파편":     { type:"equip", slot:"accessory", effects:{ mp:10, cal:8, wil:7, per:5 },     desc:"MP +10, CAL +8, WIL +7, PER +5" },
    "협객 인장":          { type:"equip", slot:"accessory", effects:{ rep:6, trst:5, cha:4 },           desc:"평판 +6, 신뢰도 +5, 매력 +4" },
    "백호 손톱 부적":     { type:"equip", slot:"accessory", effects:{ str:7, end:5, fear:5 },           desc:"STR +7, END +5, FEAR +5" },
    "학선 (鶴扇)":        { type:"equip", slot:"weapon",    effects:{ agi:6, cal:5, disg:5 },           desc:"AGI +6, CAL +5, 위장 +5" },
    // 사이버펑크
    "최상급 신경 칩":     { type:"equip", slot:"accessory", effects:{ int:10, per:8, agi:5 },           desc:"INT +10, PER +8, AGI +5" },
    "모노필라멘트 와이어":{ type:"equip", slot:"weapon",    effects:{ str:8, crit:12, agi:6 },          desc:"STR +8, CRIT +12, AGI +6" },
    "광학 미채 외투":     { type:"equip", slot:"armor",     effects:{ disg:12, agi:7, per:5 },          desc:"위장 +12, AGI +7, PER +5" },
    "군용 스팀팩":        { type:"consume", effects:{ hp:50, str:8, agi:8, ftg:-20 },                   desc:"HP +50, STR +8, AGI +8, 피로도 -20" },
    "블랙 아이스픽":      { type:"equip", slot:"accessory", effects:{ int:8, mgc:6, fear:5 },           desc:"INT +8, MGC +6, FEAR +5" },
    "특급 기업 배지":     { type:"equip", slot:"accessory", effects:{ neg:6, rep:5, disg:4 },           desc:"교섭 +6, 평판 +5, 위장 +4" },
    "합성 혈액 팩":       { type:"consume", effects:{ hp:45, end:8, pstx:6 },                           desc:"HP +45, END +8, 독내성 +6" },
    "에코 임플란트":      { type:"equip", slot:"accessory", effects:{ per:10, intn:6, cal:4 },          desc:"PER +10, INTN +6, CAL +4" },
    "탈취한 AI 코어":     { type:"equip", slot:"accessory", effects:{ int:12, mgc:8, wil:5 },           desc:"INT +12, MGC +8, WIL +5" },
    "반란군 패치":        { type:"equip", slot:"accessory", effects:{ ldr:5, wil:5, rep:4, fear:3 },    desc:"통솔 +5, WIL +5, 평판 +4, FEAR +3" },
  };

  // 장착 중인 아이템 관리 (slot → itemId)
  const [equippedItems, setEquippedItems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("taleforge-equipped") || "{}"); } catch { return {}; }
  });
  const saveEquipped = (e) => { try { localStorage.setItem("taleforge-equipped", JSON.stringify(e)); } catch {} };

  const SLOT_LABEL = { weapon:"⚔️ 무기", armor:"🛡️ 방어구", accessory:"💍 장신구" };

  const useItem = (item, inventoryIndex) => {
    const effect = ITEM_EFFECTS[item.name];
    if (!effect) {
      // 효과 정의 없는 아이템은 스탯 없이 삭제만
      setInventory(prev => { const n = prev.filter((_, i) => i !== inventoryIndex); saveInventory(n); return n; });
      return;
    }

    if (effect.type === "consume") {
      setStats(prev => {
        const next = { ...prev };
        Object.entries(effect.effects).forEach(([k, v]) => {
          if (next[k] !== undefined) {
            const cap = k === "hp" ? (next.maxHp || 100) : k === "mp" ? (next.maxMp || 100) : 100;
            next[k] = Math.max(0, Math.min(cap, next[k] + v));
          }
        });
        return next;
      });
      setInventory(prev => { const n = prev.filter((_, i) => i !== inventoryIndex); saveInventory(n); return n; });
      setCombatLog(prev => [...prev.slice(-30), `🧪 ${item.name} 사용! ${effect.desc}`]);
    } else if (effect.type === "equip") {
      const slot = effect.slot;
      const currentEquipped = equippedItems[slot];
      // 같은 슬롯에 장착 중이면 해제
      if (currentEquipped === item.id) {
        // 스탯 복구
        setStats(prev => {
          const next = { ...prev };
          Object.entries(effect.effects).forEach(([k, v]) => {
            if (next[k] !== undefined) next[k] = Math.max(0, Math.min(100, next[k] - v));
          });
          return next;
        });
        const next = { ...equippedItems };
        delete next[slot];
        setEquippedItems(next); saveEquipped(next);
        setCombatLog(prev => [...prev.slice(-30), `🔓 ${item.name} 해제`]);
      } else {
        // 기존 장착 해제 후 새 장착
        if (currentEquipped) {
          const prevItem = inventory.find(it => it.id === currentEquipped);
          if (prevItem) {
            const prevEffect = ITEM_EFFECTS[prevItem.name];
            if (prevEffect?.type === "equip") {
              setStats(prev => {
                const next = { ...prev };
                Object.entries(prevEffect.effects).forEach(([k, v]) => {
                  if (next[k] !== undefined) next[k] = Math.max(0, Math.min(100, next[k] - v));
                });
                return next;
              });
            }
          }
        }
        setStats(prev => {
          const next = { ...prev };
          Object.entries(effect.effects).forEach(([k, v]) => {
            if (next[k] !== undefined) next[k] = Math.max(0, Math.min(100, next[k] + v));
          });
          return next;
        });
        const next = { ...equippedItems, [slot]: item.id };
        setEquippedItems(next); saveEquipped(next);
        setCombatLog(prev => [...prev.slice(-30), `⚔️ ${item.name} 장착! ${effect.desc}`]);
      }
    }
  };

  // ── 상점 패널 ──────────────────────────────────────────────────
  const SHOP_ITEMS = [
    // ── 소비: 생존 ─────────────────────────────────────────────
    { name:"빵 한 조각",   price:8,   rarity:"common",    icon:"🍞", category:"생존", desc:"포만감 +20" },
    { name:"고기 구이",    price:20,  rarity:"uncommon",  icon:"🍖", category:"생존", desc:"포만감 +40, HP +5" },
    { name:"진수성찬",     price:60,  rarity:"rare",      icon:"🍱", category:"생존", desc:"포만감 +80, HP +15, STR +3" },
    { name:"숙면 물약",    price:25,  rarity:"uncommon",  icon:"😴", category:"생존", desc:"피로도 -40, MP +15" },
    { name:"각성제",       price:18,  rarity:"common",    icon:"⚗️", category:"생존", desc:"피로도 -20, AGI +5, MP +10" },
    { name:"영약",         price:120, rarity:"legendary", icon:"✨", category:"생존", desc:"HP·MP·포만감 +30, 피로도 -30" },
    // ── 소비: 전투 ─────────────────────────────────────────────
    { name:"치유 포션",    price:30,  rarity:"common",    icon:"🧪", category:"전투", desc:"HP +20" },
    { name:"마나 포션",    price:30,  rarity:"common",    icon:"💧", category:"전투", desc:"MP +20" },
    { name:"고급 치유 포션",price:75, rarity:"uncommon",  icon:"🔴", category:"전투", desc:"HP +40" },
    { name:"독 주머니",    price:45,  rarity:"uncommon",  icon:"☠️", category:"전투", desc:"독성 +8, 치명 +5" },
    { name:"마법석",       price:55,  rarity:"uncommon",  icon:"🔮", category:"전투", desc:"마법 +8, MP +10" },
    { name:"희귀 약초",    price:50,  rarity:"uncommon",  icon:"🌿", category:"전투", desc:"HP +15, MP +10" },
    // ── 장착: 무기 ─────────────────────────────────────────────
    { name:"철제 검",      price:80,  rarity:"common",    icon:"⚔️", category:"장착", desc:"STR +8, CRIT +5" },
    { name:"강철 검",      price:200, rarity:"uncommon",  icon:"🗡️", category:"장착", desc:"STR +14, CRIT +8" },
    // ── 장착: 방어구 ───────────────────────────────────────────
    { name:"가죽 갑옷",    price:70,  rarity:"common",    icon:"🛡️", category:"장착", desc:"END +8, HP +5" },
    { name:"사슬 갑옷",    price:180, rarity:"uncommon",  icon:"🔗", category:"장착", desc:"END +14, HP +10" },
    // ── 장착: 장신구 ───────────────────────────────────────────
    { name:"비밀 지도",    price:60,  rarity:"uncommon",  icon:"🗺️", category:"장착", desc:"PER +8, LUK +6" },
    { name:"고대 마법서",  price:350, rarity:"rare",      icon:"📖", category:"장착", desc:"MGC +18, MP +15, INT +10" },
  ];

  const RARITY_COL = { common:"#8a9a8a", uncommon:"#4a9a6a", rare:"#4a6fa5", legendary:"#c8a96e" };
  const RARITY_LBL = { common:"일반", uncommon:"희귀", rare:"레어", legendary:"전설" };

  const ShopPanel = () => {
    const [shopTab, setShopTab] = React.useState("생존");
    const tabs = ["생존","전투","장착"];
    const displayed = SHOP_ITEMS.filter(it => it.category === shopTab);

    return (
      <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }}
        onClick={() => setShowShop(false)}>
        <div style={{ width:"100%", maxWidth:420, maxHeight:"90vh", display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#080501,#120a02)", border:"2px solid #ffd700", boxShadow:"0 0 30px rgba(255,215,0,0.25)" }}
          onClick={e => e.stopPropagation()}>

          {/* 헤더 */}
          <div style={{ padding:"12px 16px 0", borderBottom:"1px solid #2a1a05" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontSize:14, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>🏪 상점</div>
              <span style={{ fontSize:12, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>🪙 {gold.toLocaleString()}G 보유</span>
            </div>
            <div style={{ display:"flex", gap:0 }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setShopTab(t)}
                  style={{ flex:1, padding:"6px 4px", background:"transparent", border:"none", borderBottom: shopTab===t ? "2px solid #ffd700" : "2px solid transparent", color: shopTab===t ? "#ffd700" : "#5a4a1a", fontFamily:"'Cinzel',serif", fontSize:9, cursor:"pointer" }}>
                  {t === "생존" ? "🍖 생존" : t === "전투" ? "⚔️ 전투" : "🛡️ 장착"}
                </button>
              ))}
            </div>
          </div>

          {/* 상품 목록 */}
          <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:6 }}>
            {displayed.map((item, i) => {
              const canAfford = gold >= item.price;
              const alreadyOwn = inventory.some(it => it.name === item.name);
              const effect = ITEM_EFFECTS[item.name];
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", background:`linear-gradient(135deg,#120a02,#0a0500)`, border:`1px solid ${RARITY_COL[item.rarity]||"#3a2a0a"}`, opacity: canAfford ? 1 : 0.5 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, color: RARITY_COL[item.rarity], fontFamily:"'Cinzel',serif" }}>{item.name}</div>
                    <div style={{ fontSize:9, color:"#6a5a3a", fontFamily:"'Crimson Text',serif" }}>[{RARITY_LBL[item.rarity]}] {item.desc}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                    <span style={{ fontSize:10, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>🪙 {item.price}G</span>
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        if (!canAfford) return;
                        // 골드 차감
                        setGold(prev => { const n = prev - item.price; saveGold(n); return n; });
                        // 인벤토리에 추가
                        const newItem = { id: Date.now() + Math.random(), name: item.name, rarity: item.rarity, from:"상점", obtainedAt: new Date().toISOString() };
                        setInventory(prev => { const n = [...prev, newItem]; saveInventory(n); return n; });
                        setCombatLog(prev => [...prev.slice(-30), `🏪 ${item.name} 구매! -${item.price}G`]);
                      }}
                      style={{ background: canAfford ? "linear-gradient(135deg,#2a1a00,#4a3000)" : "#1a1208", border:`1px solid ${canAfford?"#ffd700":"#2a1a05"}`, color: canAfford?"#ffd700":"#3a2a0a", fontSize:9, padding:"4px 10px", cursor: canAfford?"pointer":"not-allowed", fontFamily:"'Cinzel',serif" }}>
                      구매
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding:"6px 12px 10px", borderTop:"1px solid #2a1a05", fontSize:9, color:"#4a3a1a", fontFamily:"'Crimson Text',serif", textAlign:"center" }}>
            구매한 아이템은 인벤토리에서 사용·장착하세요.
          </div>
          <button onClick={() => setShowShop(false)} style={{ margin:"0 12px 10px", padding:"9px", background:"transparent", border:"1px solid #3a2a0a", color:"#5a4a2a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>닫기</button>
        </div>
      </div>
    );
  };

  // ── 인벤토리 패널 ──────────────────────────────────────────────
  const InventoryPanel = () => {
    const rarityColor = { common:"#8a9a8a", uncommon:"#4a9a6a", rare:"#4a6fa5", legendary:"#c8a96e" };
    const rarityLabel = { common:"일반", uncommon:"희귀", rare:"레어", legendary:"전설" };
    const [tab, setTab] = React.useState("all");

    const displayItems = tab === "equip"
      ? [...inventory].reverse().filter(it => ITEM_EFFECTS[it.name]?.type === "equip")
      : tab === "consume"
      ? [...inventory].reverse().filter(it => ITEM_EFFECTS[it.name]?.type === "consume" || !ITEM_EFFECTS[it.name])
      : [...inventory].reverse();

    const equippedSlots = Object.entries(equippedItems); // [[slot, itemId], ...]

    return (
      <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowInventory(false)}>
        <div style={{ width:"100%", maxWidth:420, maxHeight:"90vh", display:"flex", flexDirection:"column", background:"linear-gradient(160deg,#0a0500,#150d03)", border:"2px solid #c8a96e", boxShadow:"0 0 30px rgba(200,169,110,0.3)" }} onClick={e => e.stopPropagation()}>

          {/* 헤더 */}
          <div style={{ padding:"12px 16px 0", borderBottom:"1px solid #2a1a05" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontSize:14, color:"#c8a96e", fontFamily:"'Cinzel',serif" }}>💰 인벤토리</div>
              <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>🪙 {gold.toLocaleString()}G</span>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                  <span style={{ fontSize:10, color:"#c8a96e", fontFamily:"'Cinzel',serif" }}>Lv.{playerLevel}</span>
                  <div style={{ width:70, height:5, background:"#1a1208", border:"1px solid #3a2a0a", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min(100, (playerExp % (playerLevel*100)) / (playerLevel*100) * 100)}%`, background:"linear-gradient(90deg,#c8a96e,#ffd700)", transition:"width 0.4s ease" }} />
                  </div>
                  <span style={{ fontSize:8, color:"#5a4a2a", fontFamily:"'Cinzel',serif" }}>{playerExp % (playerLevel*100)}/{playerLevel*100} EXP</span>
                </div>
              </div>
            </div>
            {/* 탭 */}
            <div style={{ display:"flex", gap:0 }}>
              {[["all","전체"],["equip","⚔️ 장착"],["consume","🧪 소비"]].map(([t,l]) => (
                <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"6px 4px", background:"transparent", border:"none", borderBottom: tab===t ? "2px solid #c8a96e" : "2px solid transparent", color: tab===t ? "#c8a96e" : "#4a3a2a", fontFamily:"'Cinzel',serif", fontSize:9, cursor:"pointer" }}>{l}</button>
              ))}
            </div>
          </div>

          {/* 장착 슬롯 현황 */}
          {equippedSlots.length > 0 && (
            <div style={{ padding:"8px 12px", background:"rgba(30,20,5,0.6)", borderBottom:"1px solid #2a1a05", display:"flex", gap:6, flexWrap:"wrap" }}>
              {equippedSlots.map(([slot, itemId]) => {
                const it = inventory.find(i => i.id === itemId);
                return it ? (
                  <div key={slot} style={{ fontSize:9, color:"#c8a96e", fontFamily:"'Cinzel',serif", background:"rgba(50,35,5,0.7)", border:"1px solid #5a3e1a", padding:"3px 7px", borderRadius:2 }}>
                    {SLOT_LABEL[slot]}: {it.name}
                  </div>
                ) : null;
              })}
            </div>
          )}

          {/* 아이템 목록 */}
          <div style={{ flex:1, overflowY:"auto", padding:12 }}>
            {displayItems.length === 0 ? (
              <div style={{ textAlign:"center", color:"#4a3a2a", fontSize:12, padding:"30px 0", fontFamily:"'Crimson Text',serif" }}>
                {tab === "all" ? "아직 획득한 아이템이 없습니다." : "해당 종류의 아이템이 없습니다."}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {displayItems.map((item, di) => {
                  // displayItems는 reverse된 배열이므로 원본 인덱스 역산
                  const origIdx = inventory.length - 1 - di + (tab !== "all" ? 0 : 0);
                  // 정확한 원본 인덱스: item.id 기준
                  const origIndex = inventory.findIndex(i => i.id === item.id);
                  const effect = ITEM_EFFECTS[item.name];
                  const isEquipped = effect?.type === "equip" && equippedItems[effect.slot] === item.id;
                  const slotOccupied = effect?.type === "equip" && equippedItems[effect.slot] && equippedItems[effect.slot] !== item.id;
                  return (
                    <div key={item.id || di} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", background: isEquipped ? "linear-gradient(135deg,#1a1a08,#2a2008)" : "linear-gradient(135deg,#1a1208,#0f0a02)", border:`1px solid ${isEquipped ? "#c8a96e" : rarityColor[item.rarity]||"#3a2a0a"}` }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>
                        {item.rarity==="legendary"?"🌟":item.rarity==="rare"?"💎":item.rarity==="uncommon"?"✨":"📦"}
                      </span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, color: isEquipped ? "#ffd700" : rarityColor[item.rarity]||"#c8a96e", fontFamily:"'Cinzel',serif" }}>
                          {item.name}{isEquipped ? " ✓장착" : ""}
                        </div>
                        <div style={{ fontSize:9, color:"#5a4a3a", fontFamily:"'Crimson Text',serif" }}>
                          [{rarityLabel[item.rarity]||"일반"}]{item.clearReward ? " · 🏆 클리어 보상" : item.from ? ` · ${item.from} 드롭` : ""}
                        </div>
                        {effect && (
                          <div style={{ fontSize:9, color: effect.type==="equip" ? "#7abaee" : "#7adf7a", fontFamily:"'Cinzel',serif", marginTop:2 }}>
                            {effect.type==="equip" ? `${SLOT_LABEL[effect.slot]} · ` : "🧪 사용: "}{effect.desc}
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
                        {effect && (
                          <button onClick={() => useItem(item, origIndex)}
                            style={{ background: isEquipped ? "linear-gradient(135deg,#3a2a00,#5a4000)" : effect.type==="equip" ? "linear-gradient(135deg,#0a1a2a,#1a3a4a)" : "linear-gradient(135deg,#0a2a0a,#1a4a1a)", border:`1px solid ${isEquipped?"#c8a96e":effect.type==="equip"?"#4a7aaa":"#3a7a3a"}`, color: isEquipped?"#ffd700":effect.type==="equip"?"#7abaee":"#7adf7a", fontSize:9, padding:"4px 8px", cursor:"pointer", fontFamily:"'Cinzel',serif", whiteSpace:"nowrap" }}>
                            {effect.type==="equip" ? (isEquipped ? "해제" : slotOccupied ? "교체" : "장착") : "사용"}
                          </button>
                        )}
                        <button onClick={() => {
                          if (isEquipped) {
                            // 장착 중인 아이템은 버리기 전 해제
                            setStats(prev => {
                              const next = { ...prev };
                              Object.entries(effect.effects).forEach(([k, v]) => {
                                if (next[k] !== undefined) next[k] = Math.max(0, Math.min(100, next[k] - v));
                              });
                              return next;
                            });
                            const next = { ...equippedItems }; delete next[effect.slot];
                            setEquippedItems(next); saveEquipped(next);
                          }
                          setInventory(prev => { const n = prev.filter((_, i) => i !== origIndex); saveInventory(n); return n; });
                        }} style={{ background:"transparent", border:"1px solid #3a1a1a", color:"#5a2a2a", fontSize:9, padding:"4px 6px", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>버리기</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button onClick={() => setShowInventory(false)} style={{ margin:"8px 12px", padding:"9px", background:"transparent", border:"1px solid #3a2a0a", color:"#5a4a2a", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10 }}>닫기</button>
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      {titleToast && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:1100, background:"linear-gradient(135deg,#1a1208,#2a1f0d)", border:`2px solid ${RARITY_COLOR[titleToast.rarity]}`, boxShadow:`0 0 20px ${RARITY_COLOR[titleToast.rarity]}55`, padding:"10px 18px", display:"flex", alignItems:"center", gap:10, animation:"savepop 3.5s ease forwards", pointerEvents:"none", maxWidth:"90vw" }}>
          <span style={{ fontSize:20 }}>{titleToast.icon}</span>
          <div>
            <div style={{ fontSize:9, color:"#8a7a5a", fontFamily:"'Cinzel',serif", letterSpacing:1.5 }}>✦ 업적 달성!</div>
            <div style={{ fontSize:12, color:RARITY_COLOR[titleToast.rarity], fontFamily:"'Cinzel',serif" }}>{titleToast.name}</div>
            <div style={{ fontSize:9, color:"#6a5a3a", fontFamily:"'Crimson Text',serif" }}>{titleToast.desc}</div>
          </div>
        </div>
      )}
      {skillToast && (
        <div style={{ position:"fixed", top: titleToast ? 76 : 16, left:"50%", transform:"translateX(-50%)", zIndex:1100, background:"linear-gradient(135deg,#0d0820,#1a1040)", border:`2px solid ${SKILL_RARITY_COLOR[skillToast.rarity]}`, boxShadow:`0 0 20px rgba(120,80,220,0.5)`, padding:"10px 18px", display:"flex", alignItems:"center", gap:10, animation:"savepop 4s ease forwards", pointerEvents:"none", maxWidth:"90vw" }}>
          <span style={{ fontSize:20 }}>{skillToast.icon}</span>
          <div>
            <div style={{ fontSize:9, color: skillToast.toastType==="event" ? "#e05a5a" : "#8a7aaa", fontFamily:"'Cinzel',serif", letterSpacing:1.5 }}>{skillToast.toastType==="event" ? "🌟 이벤트 스킬 해금!" : "⚔️ 스킬 해금!"}</div>
            <div style={{ fontSize:12, color:SKILL_RARITY_COLOR[skillToast.rarity], fontFamily:"'Cinzel',serif" }}>{skillToast.name}</div>
            <div style={{ fontSize:9, color:"#6a5aaa", fontFamily:"'Crimson Text',serif" }}>{skillToast.desc}</div>
          </div>
        </div>
      )}
      {rewardToast && (
        <div style={{ position:"fixed", top: titleToast ? 136 : skillToast ? 76 : 16, left:"50%", transform:"translateX(-50%)", zIndex:1100, background:"linear-gradient(135deg,#1a1000,#2a1a00)", border:"2px solid #c8a96e", boxShadow:"0 0 24px rgba(200,169,110,0.6)", padding:"12px 18px", display:"flex", flexDirection:"column", gap:5, animation:"savepop 5s ease forwards", pointerEvents:"none", maxWidth:"90vw", minWidth:220 }}>
          <div style={{ fontSize:9, color:"#8a7a5a", fontFamily:"'Cinzel',serif", letterSpacing:1.5 }}>🏆 전투 승리 — {rewardToast.tierLabel} {rewardToast.killCount}마리 처치</div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:"#ffd700", fontFamily:"'Cinzel',serif" }}>🪙 +{rewardToast.gold}G</span>
            <span style={{ fontSize:13, color:"#7ae0c0", fontFamily:"'Cinzel',serif" }}>⭐ +{rewardToast.exp} EXP</span>
            {rewardToast.sp > 0 && <span style={{ fontSize:13, color:"#b08ae0", fontFamily:"'Cinzel',serif" }}>✨ +{rewardToast.sp} SP</span>}
          </div>
          {rewardToast.items.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:2, marginTop:2 }}>
              {rewardToast.items.map((item, i) => (
                <div key={i} style={{ fontSize:10, color:{ common:"#8a9a8a", uncommon:"#4a9a6a", rare:"#4a6fa5", legendary:"#c8a96e" }[item.rarity]||"#c8a96e", fontFamily:"'Crimson Text',serif" }}>
                  {item.rarity==="legendary"?"🌟":item.rarity==="rare"?"💎":item.rarity==="uncommon"?"✨":"📦"} {item.name} 획득!
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showInventory && <InventoryPanel />}
      {showHighlights && <HighlightsPanel />}
      {showSkillPanel && <SkillPanel />}
      {showStatsPanel && <StatsPanel />}
      {showShop && <ShopPanel />}
      {showAtmospherePanel && <AtmospherePanel />}
      {showWorldPanel && <WorldPanel />}
      {showMemoryEditor && <MemoryEditorPanel />}
      {gameOver && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.95)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:460, display:"flex", flexDirection:"column", gap:12, animation:"fadeIn 0.5s ease" }}>
            {/* 헤더 */}
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:8 }}>{gameOver.type === "death" ? "💀" : "🌅"}</div>
              <div style={{ fontSize:20, color: gameOver.type === "death" ? "#e74c3c" : "#c8a96e", fontFamily:"'Cinzel',serif", letterSpacing:3, marginBottom:4 }}>{gameOver.type === "death" ? "YOU DIED" : "SCENARIO CLEAR"}</div>
              {gameOver.type !== "death" && <div style={{ fontSize:11, color:"#8a7a5a", fontFamily:"'Crimson Text',serif" }}>시나리오를 완료했습니다. 클리어 보상을 선택하세요.</div>}
              {gameOver.type === "death" && <div style={{ fontSize:11, color:"#6a3a3a", fontFamily:"'Crimson Text',serif" }}>쓰러졌지만, 그 여정이 무언가를 남겼습니다.</div>}
            </div>

            {/* 클리어 보상 선택 패널 */}
            {(() => {
              const sc = character?.scenario === "중세 판타지" ? "medieval"
                       : character?.scenario === "무협 강호"   ? "wuxia"
                       : character?.scenario === "사이버펑크"  ? "cyberpunk"
                       : null;
              if (!sc) return null;

              const clearItems  = CLEAR_ITEMS[sc]  || [];
              const clearSkills = CLEAR_SKILLS[sc] || [];
              const [selTab, setSelTab] = React.useState("item");
              const [selectedRewards, setSelectedRewards] = React.useState([]);
              const MAX_PICK = gameOver.type === "death" ? 1 : 2; // 클리어:2개, 사망:1개
              const accentColor = sc==="cyberpunk"?"#00d4ff":sc==="wuxia"?"#e05a5a":"#c8a96e";

              const toggleReward = (id, type) => {
                setSelectedRewards(prev => {
                  const exists = prev.find(r => r.id === id);
                  if (exists) return prev.filter(r => r.id !== id);
                  if (prev.length >= MAX_PICK) return prev; // 최대 선택 초과 시 무시
                  return [...prev, { id, type }];
                });
              };

              const confirmRewards = () => {
                const earned = loadClearRewards();
                const newRewards = [...earned];
                selectedRewards.forEach(sel => {
                  if (!newRewards.find(r => r.id === sel.id)) {
                    newRewards.push({ ...sel, earnedAt: new Date().toISOString(), scenario: sc });
                  }
                });
                saveClearRewards(newRewards);
                // 아이템 보상 → 인벤토리에 추가
                selectedRewards.filter(r => r.type === "item").forEach(sel => {
                  const itemDef = clearItems.find(it => it.id === sel.id);
                  if (!itemDef) return;
                  const newItem = { id: Date.now() + Math.random(), name: itemDef.name, rarity: itemDef.rarity, from:"클리어 보상", obtainedAt: new Date().toISOString(), clearReward: true };
                  setInventory(prev => { const n = [...prev, newItem]; saveInventory(n); return n; });
                });
                // 스킬 보상 → 스킬 해금
                selectedRewards.filter(r => r.type === "skill").forEach(sel => {
                  setUnlockedSkills(prev => {
                    if (prev[sel.id]) return prev;
                    const next = { ...prev, [sel.id]: true };
                    saveSkills(next);
                    return next;
                  });
                });
              };

              return (
                <div style={{ background:"linear-gradient(160deg,#0a0500,#180d02)", border:`2px solid ${accentColor}`, padding:"14px" }}>
                  <div style={{ fontSize:10, color:accentColor, fontFamily:"'Cinzel',serif", letterSpacing:2, marginBottom:10, textAlign:"center" }}>
                    ✦ 클리어 보상 선택 ({selectedRewards.length}/{MAX_PICK}) ✦
                  </div>
                  <div style={{ fontSize:9, color:"#5a4a2a", fontFamily:"'Cinzel',serif", marginBottom:8, textAlign:"center" }}>
                    {gameOver.type === "death" ? "사망 보상: 1개 선택 가능" : "클리어 보상: 최대 2개 선택 가능"}
                  </div>

                  {/* 탭 */}
                  <div style={{ display:"flex", marginBottom:10, gap:0 }}>
                    <button onClick={() => setSelTab("item")} style={{ flex:1, padding:"6px", background:"transparent", border:"none", borderBottom:`2px solid ${selTab==="item"?accentColor:"#2a1a05"}`, color:selTab==="item"?accentColor:"#4a3a2a", fontFamily:"'Cinzel',serif", fontSize:9, cursor:"pointer" }}>🎁 특수 아이템</button>
                    <button onClick={() => setSelTab("skill")} style={{ flex:1, padding:"6px", background:"transparent", border:"none", borderBottom:`2px solid ${selTab==="skill"?accentColor:"#2a1a05"}`, color:selTab==="skill"?accentColor:"#4a3a2a", fontFamily:"'Cinzel',serif", fontSize:9, cursor:"pointer" }}>⚡ 특수 스킬</button>
                  </div>

                  {/* 아이템 목록 */}
                  {selTab === "item" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:280, overflowY:"auto" }}>
                      {clearItems.map(item => {
                        const alreadyEarned = loadClearRewards().find(r => r.id === item.id);
                        const isSelected = selectedRewards.find(r => r.id === item.id);
                        const rc = { common:"#8a9a8a", uncommon:"#4a9a6a", rare:"#4a6fa5", legendary:"#c8a96e" };
                        return (
                          <div key={item.id} onClick={() => !alreadyEarned && toggleReward(item.id, "item")}
                            style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background: isSelected?"linear-gradient(135deg,#1a1500,#2a2000)": alreadyEarned?"rgba(10,10,5,0.5)":"rgba(15,12,2,0.8)", border:`1px solid ${isSelected?accentColor:alreadyEarned?"#2a2a2a":rc[item.rarity]+"55"}`, cursor: alreadyEarned?"default":"pointer", opacity: alreadyEarned?0.5:1 }}>
                            <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:10, color: alreadyEarned?"#4a4a4a":rc[item.rarity], fontFamily:"'Cinzel',serif" }}>{item.name} {alreadyEarned?"(획득 완료)":""}</div>
                              <div style={{ fontSize:8, color:"#5a4a2a", fontFamily:"'Crimson Text',serif" }}>{item.desc}</div>
                            </div>
                            {isSelected && <span style={{ fontSize:14, color:accentColor, flexShrink:0 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 스킬 목록 */}
                  {selTab === "skill" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:280, overflowY:"auto" }}>
                      {clearSkills.map(skill => {
                        const alreadyEarned = loadClearRewards().find(r => r.id === skill.id) || unlockedSkills[skill.id];
                        const isSelected = selectedRewards.find(r => r.id === skill.id);
                        const sc2 = { common:"#8a9a8a", uncommon:"#4a9a6a", rare:"#4a6fa5", legendary:"#c8a96e" };
                        return (
                          <div key={skill.id} onClick={() => !alreadyEarned && toggleReward(skill.id, "skill")}
                            style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background: isSelected?"linear-gradient(135deg,#0d0820,#1a1040)": alreadyEarned?"rgba(10,10,5,0.5)":"rgba(5,5,15,0.8)", border:`1px solid ${isSelected?"#8a5ae0":alreadyEarned?"#2a2a2a":sc2[skill.rarity]+"55"}`, cursor: alreadyEarned?"default":"pointer", opacity: alreadyEarned?0.5:1 }}>
                            <span style={{ fontSize:20, flexShrink:0 }}>{skill.icon}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:10, color: alreadyEarned?"#4a4a4a":sc2[skill.rarity], fontFamily:"'Cinzel',serif" }}>
                                {skill.name} <span style={{ fontSize:8, color:"#5a4a8a" }}>[{skill.type==="active"?"능동":skill.type==="passive"?"패시브":"이벤트"}]</span> {alreadyEarned?"(획득 완료)":""}
                              </div>
                              <div style={{ fontSize:8, color:"#5a4a6a", fontFamily:"'Crimson Text',serif" }}>{skill.desc}</div>
                              {skill.mpCost > 0 && <div style={{ fontSize:7, color:"#3a3a7a", fontFamily:"'Cinzel',serif" }}>MP {skill.mpCost}</div>}
                            </div>
                            {isSelected && <span style={{ fontSize:14, color:"#8a5ae0", flexShrink:0 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedRewards.length > 0 && (
                    <button onClick={confirmRewards}
                      style={{ width:"100%", marginTop:10, padding:"10px", background:`linear-gradient(135deg,${accentColor}33,${accentColor}55)`, border:`1px solid ${accentColor}`, color:accentColor, fontFamily:"'Cinzel',serif", fontSize:11, cursor:"pointer", letterSpacing:1 }}>
                      ✦ 보상 수령 ({selectedRewards.length}개)
                    </button>
                  )}
                </div>
              );
            })()}

            {/* 환생 버튼 */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={() => {
                const newBonuses = { ...(pastLife?.statBonuses || {}) };
                const numPicks = Math.floor(Math.random() * 2) + 2;
                const shuffled = [...ALL_STAT_KEYS].sort(() => Math.random() - 0.5);
                const picked = shuffled.slice(0, numPicks);
                picked.forEach(k => { newBonuses[k] = (newBonuses[k] || 0) + 3; });
                const mem = loadMemory();
                onReincarnate({ summary: mem.core || mem.mid || "", titles: loadTitles(), statBonuses: newBonuses, newPickedStats: picked, characterName: character.name, characterRole: character.role, race: character.race || "", scenario: character.scenario, savedAt: new Date().toISOString(), karmaScore: Math.round(stats.krma || 50), lastWord: messages.length > 0 ? messages[messages.length-1]?.content?.slice(0,100) : "", deathCause: "combat" });
              }} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#3a1060,#6a20a0)", border:"1px solid #8a6aaa", color:"#ffd0ff", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:2 }}>✨ 환생하기</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:"8px 12px 6px", borderBottom:"2px solid #3a2a0a", background:"linear-gradient(90deg, #0f0a02, #1c1108, #0f0a02)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", border:"2px solid #c8a96e", background:"radial-gradient(circle at 35% 35%, #8b3a3a, #2a0f0f)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🧙</div>
            <div>
              <div style={{ color:"#c8a96e", fontSize:13, fontFamily:"'Cinzel',serif" }}>{character.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                {(() => { const r = loadRace(); const rd = r ? RACE_DEFS.find(x=>x.id===r.id) : null; return rd ? <span style={{ fontSize:9, color:rd.color, fontFamily:"'Cinzel',serif" }}>{rd.icon}{rd.name} · </span> : null; })()}
                <div style={{ color:"#6a5a3a", fontSize:9 }}>{character.role}</div>
                <div style={{ display:"flex", alignItems:"center", gap:3, padding:"1px 5px", background:"rgba(200,169,110,0.1)", border:"1px solid #3a2a0a", borderRadius:2 }}>
                  <span style={{ fontSize:8, color:"#c8a96e", fontFamily:"'Cinzel',serif" }}>Lv.{playerLevel}</span>
                  <div style={{ width:36, height:3, background:"#1a1208", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:`${Math.min(100, (playerExp % (playerLevel * 100)) / (playerLevel * 100) * 100)}%`, height:"100%", background:"linear-gradient(90deg,#8b6020,#c8a96e)", transition:"width 0.4s ease" }} />
                  </div>
                  <span style={{ fontSize:7, color:"#5a4a2a", fontFamily:"'Cinzel',serif" }}>{playerExp % (playerLevel * 100)}/{playerLevel * 100}</span>
                </div>
              </div>
              {emotion?.innerThought && <div style={{ fontSize:9, color:"#a08060", fontStyle:"italic" }}>'{emotion.innerThought}'</div>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
            <button onClick={() => setShowInventory(true)} style={{ background:"linear-gradient(135deg,#1a1200,#2a1e00)", border:"1px solid #8a6a10", color:"#ffd700", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>🪙 {gold.toLocaleString()}G{inventory.length>0?` · 📦${inventory.length}`:""}</button>
            <button onClick={() => setShowShop(true)} style={{ background:"linear-gradient(135deg,#1a1000,#2a1800)", border:"1px solid #ffd700", color:"#ffd700", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>🏪 상점</button>
            <button onClick={() => setShowSkillPanel(true)} style={{ background:"linear-gradient(135deg,#0d0820,#1a1040)", border:"1px solid #4a2a8a", color:"#8a5ae0", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>⚔️ 스킬{skillSP > 0 ? ` +${skillSP}SP`:""}</button>
            <button onClick={() => setShowStatsPanel(true)} style={{ background:"transparent", border:"1px solid #5a3e1a", color:"#8a7a5a", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>📊 전체</button>
            <button onClick={() => setShowHighlights(true)} style={{ background:"linear-gradient(135deg,#1a0a1a,#2a102a)", border:"1px solid #5a2a7a", color:"#b06ae0", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>⭐ 명장면{highlights.length>0?` ${highlights.length}`:""}</button>
            <button onClick={() => setShowWorldPanel(true)} style={{ background:"linear-gradient(135deg,#051a10,#0a2a18)", border:"1px solid #3a7a5a", color:"#6abea0", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>🌍 세계</button>
            <button onClick={() => setShowAtmospherePanel(true)} style={{ background:"linear-gradient(135deg,#05101a,#0a1828)", border:`1px solid ${atmosphere.weather!=="none"||atmosphere.timeOfDay!=="none"?"#4a7aaa":"#1a2a3a"}`, color:atmosphere.weather!=="none"||atmosphere.timeOfDay!=="none"?"#7abaee":"#3a5a7a", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>🌤️ 날씨</button>
            <button onClick={() => setShowMemoryEditor(true)} style={{ background:"linear-gradient(135deg,#0a0518,#150a28)", border:"1px solid #5a2a8a", color:"#a06ae0", fontSize:9, padding:"3px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:0.5, flexShrink:0 }}>🔴 기억</button>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {[
            { key:"hp",  label:"HP", icon:"❤️", color:"#e74c3c", bg:"#3a0a0a", border:"#7a1a1a" },
            { key:"mp",  label:"MP", icon:"✨", color:"#3498db", bg:"#0a1a3a", border:"#1a4a7a" },
            { key:"end", label:"기력", icon:"🛡️", color:"#95a5a6", bg:"#1a1a1a", border:"#4a5050" },
          ].map(({ key, label, icon, color, bg, border }) => (
            <div key={key} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:9, width:14, textAlign:"center" }}>{icon}</span>
              <span style={{ fontSize:9, color:"#8a7a5a", width:20, fontFamily:"'Cinzel',serif", flexShrink:0 }}>{label}</span>
              <div style={{ flex:1, height:7, background:"#0f0a02", border:`1px solid ${border}`, borderRadius:2, overflow:"hidden" }}>
                <div style={{ width:`${Math.max(0, stats[key])}%`, height:"100%", background:`linear-gradient(90deg, ${color}88, ${color})`, transition:"width 0.4s ease", borderRadius:2 }} />
              </div>
              <span style={{ fontSize:9, color, width:24, textAlign:"right", fontFamily:"'Cinzel',serif", flexShrink:0 }}>{Math.round(stats[key])}</span>
            </div>
          ))}
        </div>
        {stats.hp <= 20 && stats.hp > 0 && (
          <div style={{ marginTop: 8, fontSize: 11, color: "#ff4444", textAlign: "center", animation: "pulse 1.5s infinite", border: "1px solid #7a1a1a", background: "rgba(60,10,10,0.8)", padding: "4px", borderRadius: 2 }}>
            ⚠ 체력이 위험합니다. 사망에 주의하십시오.
          </div>
        )}

        {/* ── 감정·생존 상태 한 줄 표시 ── */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5, flexWrap:"wrap" }}>
          {/* 감정 아이콘 */}
          {emotion?.primary && (() => {
            const eDef = EMOTION_DEFS.find(e => e.id === emotion.primary);
            if (!eDef) return null;
            const intensity = emotion.intensity || 0;
            return (
              <div style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 7px", background:`rgba(0,0,0,0.4)`, border:`1px solid ${eDef.color}44`, borderRadius:2, flexShrink:0 }}>
                <span style={{ fontSize:13 }}>{eDef.icon}</span>
                <span style={{ fontSize:9, color: eDef.color, fontFamily:"'Cinzel',serif" }}>{eDef.label}</span>
                <div style={{ width:28, height:4, background:"#1a1208", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ width:`${intensity}%`, height:"100%", background: eDef.color, transition:"width 0.4s ease" }} />
                </div>
                <span style={{ fontSize:8, color:"#5a4a3a", fontFamily:"'Cinzel',serif" }}>{intensity}</span>
              </div>
            );
          })()}

          {/* 포만감 */}
          {(() => {
            const food = stats.food ?? 50;
            const foodColor = food <= 10 ? "#e74c3c" : food <= 25 ? "#e67e22" : "#d35400";
            const foodLabel = food <= 10 ? "굶주림!" : food <= 25 ? "배고픔" : "포만";
            return (
              <div style={{ display:"flex", alignItems:"center", gap:3, padding:"2px 6px", background:"rgba(0,0,0,0.4)", border:`1px solid ${food <= 25 ? foodColor+"66" : "#2a1a0a"}`, borderRadius:2, flexShrink:0 }}>
                <span style={{ fontSize:11 }}>🍖</span>
                <div style={{ width:22, height:4, background:"#1a1208", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ width:`${food}%`, height:"100%", background: foodColor, transition:"width 0.4s ease" }} />
                </div>
                {food <= 25 && <span style={{ fontSize:8, color: foodColor, fontFamily:"'Cinzel',serif" }}>{foodLabel}</span>}
              </div>
            );
          })()}

          {/* 피로도 */}
          {(() => {
            const ftg = stats.ftg ?? 30;
            const ftgColor = ftg >= 90 ? "#9b59b6" : ftg >= 70 ? "#7f8c8d" : "#5a6a6a";
            const ftgLabel = ftg >= 90 ? "과로!" : ftg >= 70 ? "피로" : "";
            return (
              <div style={{ display:"flex", alignItems:"center", gap:3, padding:"2px 6px", background:"rgba(0,0,0,0.4)", border:`1px solid ${ftg >= 70 ? ftgColor+"66" : "#1a2a2a"}`, borderRadius:2, flexShrink:0 }}>
                <span style={{ fontSize:11 }}>💤</span>
                <div style={{ width:22, height:4, background:"#1a1208", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ width:`${ftg}%`, height:"100%", background: ftgColor, transition:"width 0.4s ease" }} />
                </div>
                {ftg >= 70 && <span style={{ fontSize:8, color: ftgColor, fontFamily:"'Cinzel',serif" }}>{ftgLabel}</span>}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── 소환수 패널 ── */}
      {summons.length > 0 && (
        <div style={{ background:"linear-gradient(90deg,#050a0f,#0a1520,#050a0f)", borderBottom:"1px solid #1a3a2a", flexShrink:0 }}>
          <button onClick={() => setShowSummonPanel(s => !s)}
            style={{ width:"100%", padding:"5px 12px", background:"none", border:"none", display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
            <span style={{ fontSize:9, color:"#3a8a6a", fontFamily:"'Cinzel',serif", letterSpacing:1.5 }}>🔮 소환수</span>
            <div style={{ display:"flex", gap:5, flex:1, overflow:"hidden" }}>
              {summons.map(s => (
                <span key={s.id} style={{ fontSize:11, opacity: s.status==="dead" ? 0.3 : 1 }}>{s.icon}</span>
              ))}
            </div>
            <span style={{ fontSize:9, color:"#2a5a4a" }}>{showSummonPanel ? "▲" : "▼"}</span>
          </button>
          {showSummonPanel && (
            <div style={{ padding:"6px 12px 8px", display:"flex", flexDirection:"column", gap:6 }}>
              {summons.map(s => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:7, opacity: s.status==="dead" ? 0.4 : 1 }}>
                  <span style={{ fontSize:16, width:22, textAlign:"center" }}>{s.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                      <span style={{ fontSize:9, color: s.status==="dead" ? "#5a3a3a" : "#6abaa0", fontFamily:"'Cinzel',serif" }}>{s.name}</span>
                      <span style={{ fontSize:9, color: s.status==="dead" ? "#5a2a2a" : "#3a8a6a", fontFamily:"'Cinzel',serif" }}>
                        {s.status==="dead" ? "💀 사망" : `${s.hp}/${s.maxHp}`}
                      </span>
                    </div>
                    <div style={{ height:5, background:"#0a1008", border:"1px solid #1a3a2a", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ width:`${Math.max(0,(s.hp/s.maxHp)*100)}%`, height:"100%", background: s.hp > s.maxHp*0.5 ? "linear-gradient(90deg,#1a8a4a,#2adf7a)" : s.hp > s.maxHp*0.25 ? "linear-gradient(90deg,#8a6a00,#dfb000)" : "linear-gradient(90deg,#8a1a00,#df3000)", transition:"width 0.4s ease" }} />
                    </div>
                  </div>
                  <button onClick={() => setSummons(prev => prev.filter(x => x.id !== s.id))}
                    style={{ background:"none", border:"1px solid #2a1a1a", color:"#4a2a2a", fontSize:9, padding:"2px 5px", cursor:"pointer", flexShrink:0 }}>✕</button>
                </div>
              ))}
              <div style={{ display:"flex", gap:5, marginTop:2 }}>
                <input id="summon-name-input" placeholder="소환수 이름 직접 추가" style={{ flex:1, background:"#05080d", border:"1px dashed #1a3a2a", color:"#6abaa0", fontSize:11, padding:"5px 8px", fontFamily:"'Crimson Text',serif" }} />
                <button onClick={() => {
                  const inp = document.getElementById("summon-name-input");
                  const n = inp?.value?.trim(); if (!n) return;
                  const icon = SUMMON_ICONS[Math.floor(Math.random()*SUMMON_ICONS.length)];
                  setSummons(prev => [...prev, { id:Date.now(), name:n, icon, hp:100, maxHp:100, mp:50, maxMp:50, status:"active" }]);
                  if (inp) inp.value = "";
                }} style={{ background:"linear-gradient(135deg,#0a2a1a,#1a4a2a)", border:"1px solid #2a6a4a", color:"#3a9a6a", fontSize:10, padding:"5px 9px", cursor:"pointer" }}>+ 추가</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 몬스터 전투 패널 ── */}
      {monsters.length > 0 && (
        <div style={{ background: inCombat ? "linear-gradient(90deg,#1a0505,#2a0808,#1a0505)" : "linear-gradient(90deg,#0a0808,#150d0d,#0a0808)", borderBottom:`2px solid ${inCombat?"#8b2020":"#3a1a1a"}`, flexShrink:0, animation: inCombat ? "glow 2s infinite" : "none" }}>
          <button onClick={() => setShowMonsterPanel(s => !s)}
            style={{ width:"100%", padding:"6px 12px", background:"none", border:"none", display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
            <span style={{ fontSize:9, color: inCombat ? "#e05a5a" : "#7a4a4a", fontFamily:"'Cinzel',serif", letterSpacing:1.5, animation: inCombat ? "flicker 1.5s infinite" : "none" }}>
              {inCombat ? "⚔️ 전투 중" : "💀 전투 종료"}
            </span>
            <div style={{ display:"flex", gap:4, flex:1, overflow:"hidden" }}>
              {monsters.filter(m => m.status === "alive").map(m => (
                <span key={m.id} style={{ fontSize:12 }}>{m.icon}</span>
              ))}
            </div>
            {inCombat && <span style={{ fontSize:8, color:"#e05a5a", fontFamily:"'Cinzel',serif", animation:"pulse 1s infinite" }}>!</span>}
            <span style={{ fontSize:9, color:"#5a2a2a" }}>{showMonsterPanel ? "▲" : "▼"}</span>
          </button>

          {showMonsterPanel && (
            <div style={{ padding:"6px 12px 10px", display:"flex", flexDirection:"column", gap:8 }}>

              {/* 몬스터 목록 */}
              {monsters.map(m => {
                const tier = MONSTER_TIERS[m.tier] || MONSTER_TIERS.normal;
                const hpPct = Math.max(0, (m.hp / m.maxHp) * 100);
                const isDead = m.status !== "alive";
                return (
                  <div key={m.id} style={{ opacity: isDead ? 0.45 : 1, background:"rgba(80,10,10,0.25)", border:`1px solid ${isDead?"#2a1a1a":tier.color+"55"}`, padding:"7px 10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                      <span style={{ fontSize:20 }}>{m.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                          <span style={{ fontSize:11, color: isDead ? "#4a2a2a" : "#e8c090", fontFamily:"'Cinzel',serif" }}>{m.name}</span>
                          <span style={{ fontSize:8, color: tier.color, fontFamily:"'Cinzel',serif", background:"rgba(0,0,0,0.3)", border:`1px solid ${tier.color}44`, padding:"1px 4px" }}>{tier.label}</span>
                          {m.status === "fled" && <span style={{ fontSize:8, color:"#8a8a4a" }}>도주</span>}
                        </div>
                        <div style={{ display:"flex", gap:8, fontSize:9, color:"#7a5a5a", fontFamily:"'Cinzel',serif" }}>
                          <span>⚔️{m.atk}</span><span>🛡️{m.def}</span>
                          <span style={{ color: isDead ? "#5a2a2a" : "#c05050" }}>HP {m.hp}/{m.maxHp}</span>
                        </div>
                      </div>
                      {!isDead && (
                        <button onClick={() => {
                          const dmg = Math.floor(Math.random() * 20) + 5;
                          setMonsters(prev => prev.map(x => {
                            if (x.id !== m.id) return x;
                            const newHp = Math.max(0, x.hp - dmg);
                            return { ...x, hp: newHp, status: newHp <= 0 ? "dead" : "alive" };
                          }));
                          setCombatLog(prev => [...prev.slice(-20), `🗡️ 수동 공격 → ${m.name} -${dmg}HP`]);
                        }} style={{ background:"linear-gradient(135deg,#3a0808,#6a1010)", border:"1px solid #8b2020", color:"#e05a5a", fontSize:9, padding:"4px 7px", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>🗡️공격</button>
                      )}
                    </div>
                    {/* HP 바 */}
                    <div style={{ height:6, background:"#1a0808", border:"1px solid #3a1010", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ width:`${hpPct}%`, height:"100%", background: hpPct > 50 ? "linear-gradient(90deg,#8b2020,#e05a5a)" : hpPct > 25 ? "linear-gradient(90deg,#8b5500,#e0a000)" : "linear-gradient(90deg,#550000,#aa0000)", transition:"width 0.5s ease" }} />
                    </div>
                    {/* 스킬 태그 */}
                    {!isDead && m.skills?.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:3, marginTop:4 }}>
                        {m.skills.map((sk, si) => (
                          <span key={si} style={{ fontSize:8, color:"#8a5a5a", fontFamily:"'Cinzel',serif", background:"rgba(80,10,10,0.4)", border:"1px solid #3a1a1a", padding:"1px 5px" }}>{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 몬스터 AI 행동 로그 */}
              {monsterActionLog && (
                <div style={{ padding:"7px 10px", background:"rgba(120,20,20,0.25)", border:"1px solid #6a2020", animation:"fadeIn 0.3s ease" }}>
                  <div style={{ fontSize:8, color:"#8a4a4a", fontFamily:"'Cinzel',serif", marginBottom:4, display:"flex", flexWrap:"wrap", gap:4 }}>
                    {(monsterActionLog.allActions || []).map((a, i) => (
                      <span key={i} style={{ background:"rgba(80,10,10,0.5)", border:"1px solid #3a1010", padding:"1px 5px" }}>
                        {a.monster.icon}{a.monster.name}: {a.effectDesc}
                      </span>
                    ))}
                    {monsterActionLog.totalDmgToPlayer > 0 && (
                      <span style={{ color:"#e05a5a", marginLeft:4 }}>총 -{monsterActionLog.totalDmgToPlayer}HP</span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:"#d09090", fontFamily:"'Crimson Text',serif", lineHeight:1.5 }}>{monsterActionLog.desc}</div>
                </div>
              )}

              {/* 전투 로그 */}
              {combatLog.length > 0 && (
                <div style={{ maxHeight:80, overflowY:"auto", display:"flex", flexDirection:"column", gap:2 }}>
                  {combatLog.slice(-6).map((log, i) => (
                    <div key={i} style={{ fontSize:9, color:"#7a5050", fontFamily:"'Cinzel',serif" }}>{log}</div>
                  ))}
                </div>
              )}

              {/* 수동 몬스터 추가 */}
              <div style={{ display:"flex", gap:5, marginTop:2 }}>
                <input id="monster-name-input" placeholder="몬스터 수동 추가" style={{ flex:1, background:"#0a0505", border:"1px dashed #3a1a1a", color:"#c08080", fontSize:11, padding:"5px 8px", fontFamily:"'Crimson Text',serif" }} />
                <select id="monster-tier-select" style={{ background:"#0a0505", border:"1px solid #3a1a1a", color:"#c08080", fontSize:10, padding:"4px" }}>
                  {Object.entries(MONSTER_TIERS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button onClick={() => {
                  const inp = document.getElementById("monster-name-input");
                  const tierSel = document.getElementById("monster-tier-select");
                  const n = inp?.value?.trim(); if (!n) return;
                  const tierKey = tierSel?.value || "normal";
                  const tier = MONSTER_TIERS[tierKey];
                  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
                  const maxHp = rand(...tier.hpRange);
                  const newMon = { id:Date.now(), name:n, icon:MONSTER_ICONS[Math.floor(Math.random()*MONSTER_ICONS.length)], tier:tierKey, hp:maxHp, maxHp, atk:rand(...tier.atkRange), def:rand(...tier.defRange), skills:["기본 공격"], pattern:"aggressive", status:"alive", turnCount:0 };
                  setMonsters(prev => [...prev, newMon]);
                  setInCombat(true);
                  if (inp) inp.value = "";
                }} style={{ background:"linear-gradient(135deg,#2a0808,#4a1010)", border:"1px solid #6a2020", color:"#e05a5a", fontSize:10, padding:"5px 9px", cursor:"pointer" }}>+ 추가</button>
              </div>

              {/* 전투 종료 버튼 */}
              {!inCombat && monsters.length > 0 && (
                <button onClick={() => { setMonsters([]); setMonsterActionLog(null); setCombatLog([]); setShowMonsterPanel(false); }} style={{ padding:"7px", background:"rgba(20,40,20,0.4)", border:"1px solid #2a4a2a", color:"#5a9a5a", fontSize:10, cursor:"pointer", fontFamily:"'Cinzel',serif" }}>✅ 전투 기록 초기화</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 전투 중 몬스터 없을 때 빠른 소환 버튼 */}
      {monsters.length === 0 && (
        <div style={{ background:"#080305", borderBottom:"1px solid #1a0808", padding:"3px 12px", display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <span style={{ fontSize:8, color:"#4a2a2a", fontFamily:"'Cinzel',serif" }}>👹 적 없음</span>
          <button onClick={() => {
            const tier = MONSTER_TIERS.normal;
            const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
            const maxHp = rand(...tier.hpRange);
            const names = ["고블린","슬라임","언데드","오크 전사","스켈레톤","다크 엘프","트롤"];
            const n = names[Math.floor(Math.random()*names.length)];
            const newMon = { id:Date.now(), name:n, icon:MONSTER_ICONS[Math.floor(Math.random()*MONSTER_ICONS.length)], tier:"normal", hp:maxHp, maxHp, atk:rand(...tier.atkRange), def:rand(...tier.defRange), skills:["기본 공격","연속 공격"], pattern:"aggressive", status:"alive", turnCount:0 };
            setMonsters([newMon]); setInCombat(true); setShowMonsterPanel(true);
            setCombatLog([`⚠️ ${n} 등장!`]);
          }} style={{ background:"rgba(60,10,10,0.4)", border:"1px solid #3a1010", color:"#8a4040", fontSize:9, padding:"3px 8px", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>+ 몬스터 소환</button>
        </div>
      )}


      <div style={{ flex:1, overflowY:"auto", padding:"12px 12px 4px" }}>
        {messages.map((msg,i) => <MessageBubble key={i} msg={msg} />)}
        {loading && <ThinkingIndicator />}
        <div ref={bottomRef} style={{ height:8 }} />
      </div>

      {!loading && inCombat && monsters.some(m => m.status === "alive") && (
        <div style={{ padding:"6px 12px 0", background:"linear-gradient(90deg,#120505,#1e0808,#120505)", borderTop:"1px solid #3a1010", flexShrink:0 }}>
          <div style={{ fontSize:8, color:"#7a3a3a", fontFamily:"'Cinzel',serif", marginBottom:5, letterSpacing:1.5 }}>⚔️ 빠른 전투 행동</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {[
              { label:"🗡️ 공격", msg:"힘껏 공격한다." },
              { label:"🛡️ 방어", msg:"방어 태세를 취한다." },
              { label:"💨 회피", msg:"민첩하게 회피한다." },
              { label:"🔥 강공", msg:"전력을 다해 강하게 공격한다." },
              { label:"🩹 회복", msg:"잠시 물러나 상처를 치유한다." },
            ].map((btn, i) => (
              <button key={i} onClick={() => { setInput(btn.msg); setTimeout(() => sendMessage(btn.msg, true), 50); }}
                style={{ padding:"6px 10px", background:"rgba(80,15,15,0.5)", border:"1px solid #4a1a1a", color:"#c07070", fontSize:11, fontFamily:"'Cinzel',serif", cursor:"pointer", minHeight:36 }}>{btn.label}</button>
            ))}
          </div>
        </div>
      )}

      {!loading && choices.length > 0 && (
        <div style={{ padding:"8px 12px 0", background:"linear-gradient(90deg, #0f0a02, #1c1108, #0f0a02)", borderTop:"1px solid #2a1a05", flexShrink:0 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {choices.map((c,i) => (
              <button key={i} className="choice-btn" onClick={() => sendMessage(c, true)} style={{ textAlign:"left", padding:"10px 12px", background:"linear-gradient(135deg, #1c1108, #2a1a05)", border:"1px solid #5a3e1a", color:"#c8a96e", fontSize:14, minHeight:44 }}>{i+1}. {c}</button>
            ))}
            <button className="choice-btn" onClick={() => setTypingMode(true)} style={{ textAlign:"left", padding:"10px 12px", background:"linear-gradient(135deg, #0f1208, #1a1f10)", border:"1px solid #3a5a2a", color:"#7a9a6a", fontSize:14, minHeight:44 }}>4. ✍ 직접 입력...</button>
          </div>
        </div>
      )}

      {(typingMode || choices.length === 0) && !loading && (
        <div style={{ padding:"8px 12px", borderTop:choices.length>0?"none":"2px solid #3a2a0a", background:"linear-gradient(90deg, #0f0a02, #1c1108, #0f0a02)", display:"flex", gap:7, flexShrink:0 }}>
          <button onClick={() => setShowSkillPanel(true)} title="스킬 사용" style={{ padding:"11px 10px", background:"linear-gradient(135deg,#0d0820,#1a1040)", border:"1px solid #4a2a8a", color:"#7a4ae0", fontSize:14, minHeight:44, flexShrink:0 }}>⚔️</button>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendMessage(input, false)} placeholder={inCombat ? "⚔️ 전투 행동을 입력하세요..." : "어떻게 행동하시겠습니까?"} style={{ flex:1, background: inCombat ? "#0f0202" : "#0f0a02", border:`1px solid ${inCombat?"#6a1a1a":"#5a3e1a"}`, color:"#e8d5a0", fontSize:16, padding:"11px 12px", minHeight:44 }} />
          <button onClick={() => sendMessage(input, false)} disabled={!input.trim()} style={{ padding:"11px 14px", background:input.trim()?"linear-gradient(135deg, #8b0000, #c0392b)":"#1a1208", border:"1px solid #c8a96e", color:input.trim()?"#ffd700":"#5a4a2a", minHeight:44 }}>전송</button>
        </div>
      )}

      <div style={{ padding:"5px 12px", borderTop:"1px solid #1a1008", background:"#0a0500", display:"flex", justifyContent:"flex-end", gap:5, flexShrink:0, flexWrap:"wrap" }}>
        {/* 💾 세이브 내보내기 */}
        <button onClick={() => {
            const saveData = {
              version: 1,
              exportedAt: new Date().toISOString(),
              session:    lsGet(STORAGE_KEY),
              memory:     lsGet(MEMORY_KEY),
              worldNotes: lsGet(WNOTES_KEY),
              quests:     lsGet(QUESTS_KEY),
              atmosphere: lsGet(ATMOSPHERE_KEY),
              npcs:       lsGet(NPC_KEY),
              pastLife:   lsGet(PAST_LIFE_KEY),
              emotion:    lsGet(EMOTION_KEY),
              secrets:    lsGet(SECRETS_KEY),
              highlights: lsGet(HIGHLIGHTS_KEY),
              titles:     lsGet(TITLES_STORAGE),
              skills:     lsGet(SKILLS_KEY),
              skillSP:    lsGet(SKILL_SP_KEY),
              jobSkills:  lsGet(JOB_SKILLS_KEY),
              gold:       lsGet(GOLD_KEY),
              inventory:  lsGet(INVENTORY_KEY),
              clearRewards: lsGet(CLEAR_REWARDS_KEY),
              // 11~20번 시스템
              forbiddenSkills: lsGet(FORBIDDEN_SKILLS_KEY),
              butterfly:       lsGet(BUTTERFLY_KEY),
              hiddenEnding:    lsGet(HIDDEN_ENDING_KEY),
              deathBonuses:    lsGet(DEATH_BONUS_KEY),
              traumas:         lsGet(TRAUMA_KEY),
              lastWord:        lsGet(LAST_WORD_KEY),
              metaKnowledge:   lsGet(META_KNOWLEDGE_KEY),
              bloodline:       lsGet(BLOODLINE_KEY),
              fateVariable:    lsGet(FATE_VARIABLE_KEY),
              exploredMaps:    lsGet(EXPLORED_MAPS_KEY),
              // 41~50번 시스템
              dreamProphecies:    lsGet(DREAM_PROPHECY_KEY),
              legacyBuildings:    lsGet(LEGACY_BUILDING_KEY),
              watchers:           lsGet(WATCHER_KEY),
              soulMasks:          lsGet(SOUL_MASK_KEY),
              emotionRipples:     lsGet(EMOTION_RIPPLE_KEY),
              testaments:         lsGet(TESTAMENT_KEY),
              constellation:      lsGet(CONSTELLATION_KEY),
              explorerMap:        lsGet(EXPLORER_MAP_KEY),
              lightningImprints:  lsGet(LIGHTNING_IMPRINT_KEY),
              dawnOfAges:         lsGet(DAWN_KEY),
              // 51~70번 시스템
              starSign:           lsGet(STAR_SIGN_KEY),
              pastLanguage:       lsGet(PAST_LANGUAGE_KEY),
              identityVault:      lsGet(IDENTITY_VAULT_KEY),
              dimensionalRifts:   lsGet(RIFT_KEY),
              recipeBook:         lsGet(RECIPE_BOOK_KEY),
              achievementRates:   lsGet(ACHIEVEMENT_RATE_KEY),
              romanceLegacy:      lsGet(ROMANCE_LEGACY_KEY),
              bestiary:           lsGet(BESTIARY_KEY),
              memoryMerchant:     lsGet(MEMORY_MERCHANT_KEY),
              timeTokens:         lsGet(TIME_TOKEN_KEY),
              survivorCompanions: lsGet(SURVIVOR_COMPANIONS_KEY),
              undyingGauge:       lsGet(UNDYING_GAUGE_KEY),
              languages:          lsGet(LANGUAGE_UNLOCK_KEY),
              bardLegend:         lsGet(BARD_LEGEND_KEY),
              mysteryPuzzle:      lsGet(MYSTERY_PUZZLE_KEY),
              watcherGaze:        lsGet(WATCHER_GAZE_KEY),
              fateCard:           lsGet(FATE_CARD_KEY),
              hideout:            lsGet(HIDEOUT_KEY),
              evilEye:            lsGet(EVIL_EYE_KEY),
              moonPhase:          lsGet(MOON_PHASE_KEY),
              // 71~100번 시스템
              pastLetters:        lsGet(PAST_LETTER_KEY),
              highlightReel:      lsGet(HIGHLIGHT_REEL_KEY),
              butterflyIndex:     lsGet(BUTTERFLY_INDEX_KEY),
              inscription:        lsGet(INSCRIPTION_KEY),
              reincarnationRank:  lsGet(REINCARNATION_RANK_KEY),
              sakuraEnding:       lsGet(SAKURA_ENDING_KEY),
              dejavu:             lsGet(DEJAVU_KEY),
              causality:          lsGet(CAUSALITY_KEY),
              gamblingDebt:       lsGet(GAMBLING_DEBT_KEY),
              childhoodTrauma:    lsGet(CHILDHOOD_TRAUMA_KEY),
              apocalypse:         lsGet(APOCALYPSE_KEY),
              grief:              lsGet(GRIEF_KEY),
              instinct:           lsGet(INSTINCT_KEY),
              cursedRelics:       lsGet(CURSED_RELIC_KEY),
              natureKarma:        lsGet(NATURE_KARMA_KEY),
              aliasList:          lsGet(ALIAS_LIST_KEY),
              wish:               lsGet(WISH_KEY),
              petLegacy:          lsGet(PET_LEGACY_KEY),
              sealedMemories:     lsGet(SEALED_MEMORY_KEY),
              soulCrystals:       lsGet(SOUL_CRYSTAL_KEY),
              emotionEcho:        lsGet(EMOTION_ECHO_KEY),
              dimensionMap:       lsGet(DIMENSION_MAP_KEY),
              villainInherit:     lsGet(VILLAIN_INHERIT_KEY),
              tearCrystals:       lsGet(TEAR_CRYSTAL_KEY),
              elementTrauma:      lsGet(ELEMENT_TRAUMA_KEY),
              circus:             lsGet(CIRCUS_KEY),
              temple:             lsGet(TEMPLE_KEY),
              legacyWords:        lsGet(LEGACY_WORDS_KEY),
              mutation:           lsGet(MUTATION_KEY),
              darkEcho:           lsGet(DARK_ECHO_KEY),
              // 101~130번 시스템
              growthTree:         lsGet(GROWTH_TREE_KEY),
              deification:        lsGet(DEIFICATION_KEY),
              loopAwareness:      lsGet(LOOP_AWARENESS_KEY),
              rivals:             lsGet(RIVAL_KEY),
              redThread:          lsGet(RED_THREAD_KEY),
              ruins:              lsGet(RUINS_KEY),
              killSense:          lsGet(KILL_SENSE_KEY),
              grudgeFlowers:      lsGet(GRUDGE_FLOWER_KEY),
              cursedCycle:        lsGet(CURSED_CYCLE_KEY),
              fateMagnet:         lsGet(FATE_MAGNET_KEY),
              memoryFlood:        lsGet(MEMORY_FLOOD_KEY),
              carouselNPC:        lsGet(CAROUSEL_NPC_KEY),
              fateTraps:          lsGet(FATE_TRAP_KEY),
              mentalCorruption:   lsGet(MENTAL_CORRUPTION_KEY),
              cinema:             lsGet(CINEMA_KEY),
              twinSoul:           lsGet(TWIN_SOUL_KEY),
              killList:           lsGet(KILL_LIST_KEY),
              memoryAuction:      lsGet(MEMORY_AUCTION_KEY),
              bondTree:           lsGet(BOND_TREE_KEY),
              cyberImprint:       lsGet(CYBER_IMPRINT_KEY),
              swordGhost:         lsGet(SWORD_GHOST_KEY),
              kingdom:            lsGet(KINGDOM_KEY),
              loopersGuild:       lsGet(LOOPERS_GUILD_KEY),
              deathDealer:        lsGet(DEATH_DEALER_KEY),
              roleReversal:       lsGet(ROLE_REVERSAL_KEY),
              worldWill:          lsGet(WORLD_WILL_KEY),
              deathEye:           lsGet(DEATH_EYE_KEY),
              soulFrequency:      lsGet(SOUL_FREQUENCY_KEY),
              sealedGod:          lsGet(SEALED_GOD_KEY),
              naturalLaw:         lsGet(NATURAL_LAW_KEY),
              hiddenJobs:         lsGet(HIDDEN_JOB_KEY),
            };
            const blob = new Blob([JSON.stringify(saveData, null, 2)], { type:"application/json" });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            const charName = character?.name || "save";
            a.href = url; a.download = `taleforge_${charName}_${Date.now()}.json`; a.click();
            URL.revokeObjectURL(url);
          }} style={{ padding:"7px 10px", background:"transparent", border:"1px solid #2a4a2a", color:"#4a7a4a", fontSize:10 }}>💾 저장</button>
        {/* 📂 세이브 불러오기 */}
        <button onClick={() => {
            const input = document.createElement("input");
            input.type = "file"; input.accept = ".json";
            input.onchange = (e) => {
              const file = e.target.files[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const data = JSON.parse(ev.target.result);
                  if (data.version !== 1) { alert("호환되지 않는 세이브 파일입니다."); return; }
                  if (data.session)    lsSet(STORAGE_KEY,    data.session);
                  if (data.memory)     lsSet(MEMORY_KEY,     data.memory);
                  if (data.worldNotes) lsSet(WNOTES_KEY,     data.worldNotes);
                  if (data.quests)     lsSet(QUESTS_KEY,     data.quests);
                  if (data.atmosphere) lsSet(ATMOSPHERE_KEY, data.atmosphere);
                  if (data.npcs)       lsSet(NPC_KEY,        data.npcs);
                  if (data.pastLife)   lsSet(PAST_LIFE_KEY,  data.pastLife);
                  if (data.emotion)    lsSet(EMOTION_KEY,    data.emotion);
                  if (data.secrets)    lsSet(SECRETS_KEY,    data.secrets);
                  if (data.highlights) lsSet(HIGHLIGHTS_KEY, data.highlights);
                  if (data.titles)     lsSet(TITLES_STORAGE, data.titles);
                  if (data.skills)     lsSet(SKILLS_KEY,     data.skills);
                  if (data.skillSP)    lsSet(SKILL_SP_KEY,   data.skillSP);
                  if (data.jobSkills)  lsSet(JOB_SKILLS_KEY, data.jobSkills);
                  if (data.gold)       lsSet(GOLD_KEY,       data.gold);
                  if (data.inventory)  lsSet(INVENTORY_KEY,  data.inventory);
                  if (data.clearRewards) lsSet(CLEAR_REWARDS_KEY, data.clearRewards);
                  // 11~20번 시스템
                  if (data.forbiddenSkills) lsSet(FORBIDDEN_SKILLS_KEY, data.forbiddenSkills);
                  if (data.butterfly)       lsSet(BUTTERFLY_KEY,        data.butterfly);
                  if (data.hiddenEnding)    lsSet(HIDDEN_ENDING_KEY,    data.hiddenEnding);
                  if (data.deathBonuses)    lsSet(DEATH_BONUS_KEY,      data.deathBonuses);
                  if (data.traumas)         lsSet(TRAUMA_KEY,           data.traumas);
                  if (data.lastWord)        lsSet(LAST_WORD_KEY,        data.lastWord);
                  if (data.metaKnowledge)   lsSet(META_KNOWLEDGE_KEY,   data.metaKnowledge);
                  if (data.bloodline)       lsSet(BLOODLINE_KEY,        data.bloodline);
                  if (data.fateVariable)    lsSet(FATE_VARIABLE_KEY,    data.fateVariable);
                  if (data.exploredMaps)    lsSet(EXPLORED_MAPS_KEY,    data.exploredMaps);
                  // 41~50번 시스템
                  if (data.dreamProphecies)   lsSet(DREAM_PROPHECY_KEY,   data.dreamProphecies);
                  if (data.legacyBuildings)   lsSet(LEGACY_BUILDING_KEY,  data.legacyBuildings);
                  if (data.watchers)          lsSet(WATCHER_KEY,          data.watchers);
                  if (data.soulMasks)         lsSet(SOUL_MASK_KEY,        data.soulMasks);
                  if (data.emotionRipples)    lsSet(EMOTION_RIPPLE_KEY,   data.emotionRipples);
                  if (data.testaments)        lsSet(TESTAMENT_KEY,        data.testaments);
                  if (data.constellation)     lsSet(CONSTELLATION_KEY,    data.constellation);
                  if (data.explorerMap)       lsSet(EXPLORER_MAP_KEY,     data.explorerMap);
                  if (data.lightningImprints) lsSet(LIGHTNING_IMPRINT_KEY,data.lightningImprints);
                  if (data.dawnOfAges)        lsSet(DAWN_KEY,             data.dawnOfAges);
                  // 51~70번 시스템
                  if (data.starSign)           lsSet(STAR_SIGN_KEY,           data.starSign);
                  if (data.pastLanguage)       lsSet(PAST_LANGUAGE_KEY,       data.pastLanguage);
                  if (data.identityVault)      lsSet(IDENTITY_VAULT_KEY,      data.identityVault);
                  if (data.dimensionalRifts)   lsSet(RIFT_KEY,                data.dimensionalRifts);
                  if (data.recipeBook)         lsSet(RECIPE_BOOK_KEY,         data.recipeBook);
                  if (data.achievementRates)   lsSet(ACHIEVEMENT_RATE_KEY,    data.achievementRates);
                  if (data.romanceLegacy)      lsSet(ROMANCE_LEGACY_KEY,      data.romanceLegacy);
                  if (data.bestiary)           lsSet(BESTIARY_KEY,            data.bestiary);
                  if (data.memoryMerchant)     lsSet(MEMORY_MERCHANT_KEY,     data.memoryMerchant);
                  if (data.timeTokens)         lsSet(TIME_TOKEN_KEY,          data.timeTokens);
                  if (data.survivorCompanions) lsSet(SURVIVOR_COMPANIONS_KEY, data.survivorCompanions);
                  if (data.undyingGauge)       lsSet(UNDYING_GAUGE_KEY,       data.undyingGauge);
                  if (data.languages)          lsSet(LANGUAGE_UNLOCK_KEY,     data.languages);
                  if (data.bardLegend)         lsSet(BARD_LEGEND_KEY,         data.bardLegend);
                  if (data.mysteryPuzzle)      lsSet(MYSTERY_PUZZLE_KEY,      data.mysteryPuzzle);
                  if (data.watcherGaze)        lsSet(WATCHER_GAZE_KEY,        data.watcherGaze);
                  if (data.fateCard)           lsSet(FATE_CARD_KEY,           data.fateCard);
                  if (data.hideout)            lsSet(HIDEOUT_KEY,             data.hideout);
                  if (data.evilEye)            lsSet(EVIL_EYE_KEY,            data.evilEye);
                  if (data.moonPhase)          lsSet(MOON_PHASE_KEY,          data.moonPhase);
                  // 71~100번 시스템
                  if (data.pastLetters)       lsSet(PAST_LETTER_KEY,       data.pastLetters);
                  if (data.highlightReel)     lsSet(HIGHLIGHT_REEL_KEY,    data.highlightReel);
                  if (data.butterflyIndex)    lsSet(BUTTERFLY_INDEX_KEY,   data.butterflyIndex);
                  if (data.inscription)       lsSet(INSCRIPTION_KEY,       data.inscription);
                  if (data.reincarnationRank) lsSet(REINCARNATION_RANK_KEY,data.reincarnationRank);
                  if (data.sakuraEnding)      lsSet(SAKURA_ENDING_KEY,     data.sakuraEnding);
                  if (data.dejavu)            lsSet(DEJAVU_KEY,            data.dejavu);
                  if (data.causality)         lsSet(CAUSALITY_KEY,         data.causality);
                  if (data.gamblingDebt)      lsSet(GAMBLING_DEBT_KEY,     data.gamblingDebt);
                  if (data.childhoodTrauma)   lsSet(CHILDHOOD_TRAUMA_KEY,  data.childhoodTrauma);
                  if (data.apocalypse)        lsSet(APOCALYPSE_KEY,        data.apocalypse);
                  if (data.grief)             lsSet(GRIEF_KEY,             data.grief);
                  if (data.instinct)          lsSet(INSTINCT_KEY,          data.instinct);
                  if (data.cursedRelics)      lsSet(CURSED_RELIC_KEY,      data.cursedRelics);
                  if (data.natureKarma)       lsSet(NATURE_KARMA_KEY,      data.natureKarma);
                  if (data.aliasList)         lsSet(ALIAS_LIST_KEY,        data.aliasList);
                  if (data.wish)              lsSet(WISH_KEY,              data.wish);
                  if (data.petLegacy)         lsSet(PET_LEGACY_KEY,        data.petLegacy);
                  if (data.sealedMemories)    lsSet(SEALED_MEMORY_KEY,     data.sealedMemories);
                  if (data.soulCrystals)      lsSet(SOUL_CRYSTAL_KEY,      data.soulCrystals);
                  if (data.emotionEcho)       lsSet(EMOTION_ECHO_KEY,      data.emotionEcho);
                  if (data.dimensionMap)      lsSet(DIMENSION_MAP_KEY,     data.dimensionMap);
                  if (data.villainInherit)    lsSet(VILLAIN_INHERIT_KEY,   data.villainInherit);
                  if (data.tearCrystals)      lsSet(TEAR_CRYSTAL_KEY,      data.tearCrystals);
                  if (data.elementTrauma)     lsSet(ELEMENT_TRAUMA_KEY,    data.elementTrauma);
                  if (data.circus)            lsSet(CIRCUS_KEY,            data.circus);
                  if (data.temple)            lsSet(TEMPLE_KEY,            data.temple);
                  if (data.legacyWords)       lsSet(LEGACY_WORDS_KEY,      data.legacyWords);
                  if (data.mutation)          lsSet(MUTATION_KEY,          data.mutation);
                  if (data.darkEcho)          lsSet(DARK_ECHO_KEY,         data.darkEcho);
                  // 101~130번 시스템
                  if (data.growthTree)        lsSet(GROWTH_TREE_KEY,       data.growthTree);
                  if (data.deification)       lsSet(DEIFICATION_KEY,       data.deification);
                  if (data.loopAwareness)     lsSet(LOOP_AWARENESS_KEY,    data.loopAwareness);
                  if (data.rivals)            lsSet(RIVAL_KEY,             data.rivals);
                  if (data.redThread)         lsSet(RED_THREAD_KEY,        data.redThread);
                  if (data.ruins)             lsSet(RUINS_KEY,             data.ruins);
                  if (data.killSense)         lsSet(KILL_SENSE_KEY,        data.killSense);
                  if (data.grudgeFlowers)     lsSet(GRUDGE_FLOWER_KEY,     data.grudgeFlowers);
                  if (data.cursedCycle)       lsSet(CURSED_CYCLE_KEY,      data.cursedCycle);
                  if (data.fateMagnet)        lsSet(FATE_MAGNET_KEY,       data.fateMagnet);
                  if (data.memoryFlood)       lsSet(MEMORY_FLOOD_KEY,      data.memoryFlood);
                  if (data.carouselNPC)       lsSet(CAROUSEL_NPC_KEY,      data.carouselNPC);
                  if (data.fateTraps)         lsSet(FATE_TRAP_KEY,         data.fateTraps);
                  if (data.mentalCorruption)  lsSet(MENTAL_CORRUPTION_KEY, data.mentalCorruption);
                  if (data.cinema)            lsSet(CINEMA_KEY,            data.cinema);
                  if (data.twinSoul)          lsSet(TWIN_SOUL_KEY,         data.twinSoul);
                  if (data.killList)          lsSet(KILL_LIST_KEY,         data.killList);
                  if (data.memoryAuction)     lsSet(MEMORY_AUCTION_KEY,    data.memoryAuction);
                  if (data.bondTree)          lsSet(BOND_TREE_KEY,         data.bondTree);
                  if (data.cyberImprint)      lsSet(CYBER_IMPRINT_KEY,     data.cyberImprint);
                  if (data.swordGhost)        lsSet(SWORD_GHOST_KEY,       data.swordGhost);
                  if (data.kingdom)           lsSet(KINGDOM_KEY,           data.kingdom);
                  if (data.loopersGuild)      lsSet(LOOPERS_GUILD_KEY,     data.loopersGuild);
                  if (data.deathDealer)       lsSet(DEATH_DEALER_KEY,      data.deathDealer);
                  if (data.roleReversal)      lsSet(ROLE_REVERSAL_KEY,     data.roleReversal);
                  if (data.worldWill)         lsSet(WORLD_WILL_KEY,        data.worldWill);
                  if (data.deathEye)          lsSet(DEATH_EYE_KEY,         data.deathEye);
                  if (data.soulFrequency)     lsSet(SOUL_FREQUENCY_KEY,    data.soulFrequency);
                  if (data.sealedGod)         lsSet(SEALED_GOD_KEY,        data.sealedGod);
                  if (data.naturalLaw)        lsSet(NATURAL_LAW_KEY,       data.naturalLaw);
                  if (data.hiddenJobs)        lsSet(HIDDEN_JOB_KEY,        data.hiddenJobs);
                  alert("불러오기 완료! 페이지를 새로고침합니다."); location.reload();
                } catch { alert("세이브 파일을 읽을 수 없습니다."); }
              };
              reader.readAsText(file);
            };
            input.click();
          }} style={{ padding:"7px 10px", background:"transparent", border:"1px solid #2a3a4a", color:"#4a6a7a", fontSize:10 }}>📂 불러오기</button>
        <button onClick={() => {
            const newBonuses = { ...(pastLife?.statBonuses || {}) };
            const numPicks = Math.floor(Math.random() * 2) + 2;
            const shuffled = [...ALL_STAT_KEYS].sort(() => Math.random() - 0.5);
            const picked = shuffled.slice(0, numPicks);
            picked.forEach(k => { newBonuses[k] = (newBonuses[k] || 0) + 3; });
            const mem = loadMemory();
            onReincarnate({ summary: mem.core || mem.mid || "", titles: loadTitles(), statBonuses: newBonuses, newPickedStats: picked, characterName: character.name, characterRole: character.role, race: character.race || "", scenario: character.scenario, savedAt: new Date().toISOString(), karmaScore: Math.round(stats.krma || 50), lastWord: messages.length > 0 ? messages[messages.length-1]?.content?.slice(0,100) : "" });
          }} style={{ padding:"7px 10px", background:"transparent", border:"1px solid #2a1a05", color:"#4a3a2a", fontSize:10 }}>🔄 새 시작</button>
        <button onClick={onKeyReset} style={{ padding:"7px 10px", background:"transparent", border:"1px solid #2a1a05", color:"#4a3a2a", fontSize:10 }}>🔑 키 변경</button>
      </div>
    </React.Fragment>
  );
}

function App() {
  const [apiKeys, setApiKeys]     = useState(() => loadApiKeys());
  const [character, setCharacter] = useState(null);
  const [scenario, setScenario]   = useState(null);
  const [screen, setScreen]       = useState("loading");
  const [pastLife, setPastLife]   = useState(() => loadPastLife());

  useEffect(() => {
    const saved = loadSession();
    const keys = loadApiKeys();
    if (!keys.length) { setScreen("apikey"); return; }
    setApiKeys(keys);
    if (saved?.character) { setCharacter(saved.character); setScreen("chat"); }
    else setScreen("scenario");
  }, []);

  const handleApiKeys  = (ks) => { saveApiKeys(ks); setApiKeys(ks); setScreen("scenario"); };
  const handleScenario = (sc) => { setScenario(sc); setScreen("setup"); };
  const handleStart    = (char) => { setCharacter({...char, scenario: scenario?.era || "", customWorldSetting: scenario?.customWorldSetting || ""}); setScreen("chat"); };
  const handleReset    = () => { setCharacter(null); setScenario(null); setScreen("scenario"); };
  const handleReincarnate = (pastLifeData) => {
    // 9번: 회차 카운터
    const newCycle = loadCycleCount() + 1;
    saveCycleCount(newCycle);
    // 4번: 전생 유물 체크
    const earnedRelics = loadPastRelics();
    RELIC_DEFS.forEach(relic => { if (!earnedRelics.find(r=>r.id===relic.id) && checkRelicCondition(pastLifeData,relic.condition)) earnedRelics.push({id:relic.id,earnedAt:new Date().toISOString()}); });
    savePastRelics(earnedRelics);
    // 5번: 아티팩트 파편 누적
    saveArtifactShards(Math.min(ARTIFACT_MAX_SHARDS, loadArtifactShards()+1));
    // 11번: 금지 스킬 해금 조건 체크
    const karmaScore = pastLifeData?.karmaScore || 50;
    if (karmaScore >= 80) unlockForbiddenSkill("villain");
    if (newCycle >= 5) unlockForbiddenSkill("5plus_cycles");
    if ((pastLifeData?.questCompletionRate || 0) >= 100) unlockForbiddenSkill("perfect_clear");
    // 12번: 나비효과 기록
    if (pastLifeData?.lastBossKilled) addButterflyEffect("boss_killed", { bossName: pastLifeData.lastBossKilled });
    if (pastLifeData?.savedVillage) addButterflyEffect("saved_village", {});
    if (pastLifeData?.betrayedAlly) addButterflyEffect("betrayed_ally", { npcName: pastLifeData.betrayedAlly });
    // 13번: 히든 엔딩 조각
    if (newCycle === 1) checkHiddenEndingPiece("first_ending");
    if (karmaScore >= 80) checkHiddenEndingPiece("villain_ending");
    if (newCycle >= 5) checkHiddenEndingPiece("5_cycles");
    if (newCycle >= 10) checkHiddenEndingPiece("10_cycles");
    // 14번: 죽는 방식에 따른 보상
    if (pastLifeData?.deathCause) recordDeathCause(pastLifeData.deathCause);
    // 15번: 트라우마 누적
    if (pastLifeData?.traumaType) recordTrauma(pastLifeData.traumaType);
    // 16번: 라스트 워드 저장
    if (pastLifeData?.lastWord) {
      const tone = classifyLastWordTone(pastLifeData.lastWord);
      saveLastWord({ text: pastLifeData.lastWord, tone, characterName: pastLifeData.characterName, scenario: pastLifeData.scenario, savedAt: new Date().toISOString() });
    }
    // 18번: 혈통 진화
    if (pastLifeData?.race) recordRacePlayed(pastLifeData.race);
    // 19번: 운명의 변수
    const clearScore = Math.round(
      ((pastLifeData?.questCompletionRate || 50) * 0.5) +
      ((100 - Math.abs((karmaScore - 50) * 2)) * 0.3) +
      (Math.min(100, (pastLifeData?.allyCount || 0) * 20) * 0.2)
    );
    recordClearQuality(clearScore);
    // 21번: 관계 유산
    if (pastLifeData?.intimateRelations) {
      pastLifeData.intimateRelations.forEach(rel => {
        if (rel.name && rel.bond) recordRelationshipLegacy(rel.name, rel.bond, rel.depth||1, pastLifeData.scenario);
      });
    }
    // 22번: 세계관 기억
    if (pastLifeData?.worldSecrets) {
      pastLifeData.worldSecrets.forEach(s => {
        if (s.id && s.title) recordWorldSecret(s.id, s.title, s.hint||"", pastLifeData.scenario);
      });
    }
    // 23번: 능력 각인 — 전생 사용 스탯 이월
    if (pastLifeData?.statUsage) {
      Object.entries(pastLifeData.statUsage).forEach(([statId, amount]) => recordStatUsage(statId, amount));
    }
    // 24번: 원한의 추적자
    if (pastLifeData?.killedBosses) {
      pastLifeData.killedBosses.forEach(boss => {
        if (boss.name) addGrudge(boss.name, boss.power||3, pastLifeData.scenario);
      });
    }
    // 25번: 시간의 메아리
    if (pastLifeData?.memorableQuote) {
      addTimeEcho(pastLifeData.memorableQuote, pastLifeData.characterName||"전생의 나", pastLifeData.lastEmotion||"", pastLifeData.scenario);
    }
    // 26번: 운명의 선택 기록
    if (pastLifeData?.keyChoices) {
      pastLifeData.keyChoices.forEach(c => {
        if (c.id && c.description) recordFateChoice(c.id, c.description, c.outcome||"neutral", pastLifeData.scenario);
      });
    }
    // 27번: 신의 시선 — 퍼펙트 클리어/고카르마 시 관심도 축적
    if (clearScore >= 80) accumulateDivineAttention(15);
    else if (clearScore >= 60) accumulateDivineAttention(8);
    else accumulateDivineAttention(3);
    // 28번: 저주 계보
    if (pastLifeData?.curseTypes) {
      pastLifeData.curseTypes.forEach(ct => recordCurse(ct));
    }
    // 29번: 전생의 기도 — 새 회차 시 리셋
    resetPastPrayerCycle();
    // 30번: 운명의 수레바퀴
    checkGreatCycleReset(newCycle);
    // 31번: 평행세계 조우 — 이번 회차 캐릭터 정보를 다음 회차용으로 저장
    if (pastLifeData?.name && pastLifeData?.role) {
      recordParallelSelf(pastLifeData.name, pastLifeData.role, pastLifeData.scenario, pastLifeData?.topSkill || "");
    }
    // 32번: 저주의 고리 — 이번 회차 반복 행동 패턴 누적
    if (pastLifeData?.repeatActions) {
      pastLifeData.repeatActions.forEach(action => {
        if (CURSE_RING_ACTIONS[action]) recordCurseRingAction(action);
      });
    }
    // 33번: 회차 통계 누적
    recordStatDeath(); // 환생 = 사망
    if (pastLifeData?.scenario) recordStatScenario(pastLifeData.scenario);
    // 34번: 부상 흔적
    if (pastLifeData?.majorInjuries) {
      pastLifeData.majorInjuries.forEach(part => recordInjury(part));
    }
    // 35번: 전생 테마
    {
      const endType = karmaScore >= 80 ? "villain"
        : (pastLifeData?.questCompletionRate || 0) >= 90 && karmaScore <= 40 ? "hero"
        : pastLifeData?.sacrificed ? "sacrifice"
        : (pastLifeData?.questCompletionRate || 0) < 30 ? "tragedy"
        : "neutral";
      recordPastTheme(endType);
    }
    // 36번: 기억 왜곡 — 캐릭터 WIL 기반 왜곡 기록
    recordMemoryDistort(pastLifeData?.stats?.wil || 30);
    // 37번: 전생 나이의 역설
    if (pastLifeData?.deathAgeType) {
      recordAgeParadox(pastLifeData.deathAgeType);
    } else {
      // 자동 판정: 회차 수 기반으로 추론
      const autoAge = newCycle % 3 === 0 ? "elder" : newCycle % 3 === 1 ? "young" : "prime";
      recordAgeParadox(autoAge);
    }
    // 38번: 소환수 계승
    if (pastLifeData?.companionSummons) {
      pastLifeData.companionSummons.forEach(s => {
        if (s.name) recordSummonLegacy(s.name, s.type, s.bond, pastLifeData.scenario);
      });
    }
    // 39번: 원한 무기
    if (pastLifeData?.killedByWeapon) {
      recordGrudgeWeapon(pastLifeData.killedByWeapon, pastLifeData?.killedByName, pastLifeData.scenario);
    }
    // 40번: 세계수 성장
    {
      const endType40 = karmaScore >= 80 ? "villain"
        : pastLifeData?.sacrificed ? "sacrifice"
        : (pastLifeData?.questCompletionRate || 0) >= 80 && karmaScore <= 40 ? "hero"
        : "neutral";
      growWorldTree(endType40);
    }
    // 41번: 꿈의 예언 — WIL 기반으로 이번 회차 꿈 유형 기록
    recordDreamProphecy(pastLifeData?.stats?.wil || 30, pastLifeData.scenario);
    // 42번: 유산 건축 — 이번 회차에 세운 건물 유형 기록
    if (pastLifeData?.builtStructures) {
      pastLifeData.builtStructures.forEach(b => {
        if (b.type) recordLegacyBuilding(b.type, b.name, pastLifeData.scenario);
      });
    } else {
      // 자동 판정: 퀘스트 완료율 기반으로 추론
      const qRate = pastLifeData?.questCompletionRate || 0;
      if (qRate >= 70) recordLegacyBuilding("guild", null, pastLifeData.scenario);
      else if (qRate >= 40) recordLegacyBuilding("tavern", null, pastLifeData.scenario);
    }
    // 43번: 감시자의 눈 — 이번 회차 최종 보스/강적 기록
    if (pastLifeData?.killedBosses) {
      pastLifeData.killedBosses.forEach(boss => {
        if (boss.name) recordWatcher(boss.name, boss.power || 3, pastLifeData.scenario);
      });
    }
    // 44번: 영혼의 가면 — 이번 회차 직업/역할 기록
    if (pastLifeData?.characterRole) {
      recordSoulMask(pastLifeData.characterRole, pastLifeData.scenario);
    } else if (pastLifeData?.role) {
      recordSoulMask(pastLifeData.role, pastLifeData.scenario);
    }
    // 45번: 감정의 파문 — 이번 회차 지배적 감정 기록
    if (pastLifeData?.dominantEmotion) {
      recordEmotionRipple(pastLifeData.dominantEmotion, pastLifeData.scenario);
    } else {
      // 자동 판정: 카르마 기반 추론
      const autoEmotion = karmaScore >= 80 ? "rage"
        : karmaScore >= 60 ? "pride"
        : karmaScore <= 20 ? "despair"
        : karmaScore <= 40 ? "sorrow"
        : (pastLifeData?.questCompletionRate || 0) >= 80 ? "joy"
        : "fear";
      recordEmotionRipple(autoEmotion, pastLifeData.scenario);
    }
    // 46번: 유언장 — 마지막 말 어조 기반으로 유언 유형 기록
    {
      const lw = pastLifeData?.lastWord || "";
      const lwTone = lw.includes("복수") || lw.includes("원한") ? "vengeful"
        : lw.includes("희망") || lw.includes("부탁") ? "hopeful"
        : lw.includes("미안") || lw.includes("후회") ? "regretful"
        : lw.includes("?") || lw.includes("수수께끼") ? "cryptic"
        : karmaScore <= 40 ? "heroic" : "hopeful";
      recordTestament(lwTone, pastLifeData?.characterName || pastLifeData?.name, pastLifeData.scenario);
    }
    // 47번: 숙명의 별자리 — 새 회차 시작 시 별자리 배정
    assignConstellation();
    // 48번: 탐험가의 유산 — 이번 회차 탐험 지역 기록
    if (pastLifeData?.exploredLocations) {
      pastLifeData.exploredLocations.forEach(loc => {
        if (loc.type) recordExploredLocation(loc.type, pastLifeData.scenario);
      });
    } else {
      // 자동 판정: 회차 수 기반
      const locTypes = ["secret_passage","hidden_dungeon","safe_haven","ancient_ruin","trading_hub","power_spot"];
      const autoLoc = locTypes[newCycle % locTypes.length];
      recordExploredLocation(autoLoc, pastLifeData.scenario);
    }
    // 49번: 번개 각인 — 이번 회차 극적 순간 유형 기록
    if (pastLifeData?.epicMoment) {
      recordLightningImprint(pastLifeData.epicMoment, pastLifeData.scenario);
    } else {
      // 자동 판정: 사망/클리어 방식 기반 추론
      const autoImprint = pastLifeData?.sacrificed ? "heroic_sacrifice"
        : (pastLifeData?.questCompletionRate || 0) >= 90 ? "perfect_strike"
        : karmaScore >= 80 ? "forbidden_power"
        : pastLifeData?.deathCause === "battle" ? "last_stand"
        : "killing_blow";
      recordLightningImprint(autoImprint, pastLifeData.scenario);
    }
    // 50번: 전생의 일출 — 영웅적 점수로 여명 성장
    {
      const heroicScore50 = Math.round(
        ((pastLifeData?.questCompletionRate || 0) * 0.4) +
        ((100 - Math.abs((karmaScore - 30) * 1.5)) * 0.3) +
        (pastLifeData?.sacrificed ? 30 : 0) +
        (Math.min(30, newCycle * 3))
      );
      growDawn(Math.max(0, Math.min(100, heroicScore50)));
    }
    // ── 51번: 별자리 운세 — 사망 시점 기반 별자리 배정 ──
    assignStarSign(new Date().getMonth());
    // ── 52번: 전생어 — 회차 수 기반 언어 레벨 성장 ──
    growPastLanguage(newCycle);
    // ── 53번: 가면 시스템 — 이번 회차 사용 신분 기록 ──
    if (pastLifeData?.usedIdentities) {
      pastLifeData.usedIdentities.forEach(id => {
        if (id.type) recordIdentity(id.type, id.alias, pastLifeData.scenario);
      });
    } else {
      // 자동: 직업 기반 추론
      const roleToIdentity = { "전사":"soldier","마법사":"scholar","도적":"assassin","상인":"merchant","성직자":"priest","음유시인":"bard","귀족":"noble","방랑자":"wanderer" };
      const autoId = roleToIdentity[pastLifeData?.characterRole || pastLifeData?.role] || "wanderer";
      recordIdentity(autoId, null, pastLifeData.scenario);
    }
    // ── 54번: 차원 균열 — 고회차 균열 이벤트 기록 ──
    if (newCycle >= 5 && pastLifeData?.riftEncountered) {
      recordRiftEncounter(pastLifeData.riftEncountered, newCycle);
    }
    // ── 55번: 연금술 누적 — 회차 기반 레시피 해금 ──
    updateRecipeBook(newCycle);
    // ── 56번: 전생 목표 달성률 기록 ──
    recordAchievementRate(pastLifeData?.questCompletionRate || 50, pastLifeData.scenario);
    // ── 57번: 인연의 꽃 — 로맨스 NPC 기록 ──
    if (pastLifeData?.romanceNPCs) {
      pastLifeData.romanceNPCs.forEach(r => {
        if (r.name) recordRomanceLegacy(r.name, r.depth || 1, pastLifeData.scenario);
      });
    }
    // ── 58번: 사냥 기록 — 처치 몬스터 도감 누적 ──
    if (pastLifeData?.killedMonsters) {
      pastLifeData.killedMonsters.forEach(m => {
        if (m.name) recordMonsterKill(m.name, m.type);
      });
    }
    // ── 59번: 전생 기억 상인 — 회차 기록 ──
    // (상인은 자동 등장, 특별 처리 없음)
    // ── 60번: 시간 역행 토큰 — 회차 마일스톤 보상 ──
    resetTimeTokens();
    if ([5,10,20,30,50,100].includes(newCycle)) earnTimeToken("cycle_milestone");
    if (pastLifeData?.sacrificed) earnTimeToken("tragic_sacrifice");
    if ((pastLifeData?.questCompletionRate || 0) >= 95) earnTimeToken("legendary_act");
    // ── 61번: 전생 동료의 유지 — 생존 동료 기록 ──
    if (pastLifeData?.survivedCompanions) {
      pastLifeData.survivedCompanions.forEach(c => {
        if (c.name) recordSurvivorCompanion(c.name, c.bond || 40, true, pastLifeData.scenario);
      });
    }
    // ── 62번: 불사 게이지 — 새 회차 사이클 리셋 ──
    resetUndyingGaugeCycle();
    // ── 63번: 다국어 해금 — 이번 회차 깊은 교류 언어 ──
    if (pastLifeData?.deepBondRaces) {
      pastLifeData.deepBondRaces.forEach(r => {
        if (r.languageId) unlockLanguage(r.languageId, r.bond || 35, pastLifeData.scenario);
      });
    }
    // ── 64번: 음유시인 기록 — 전생 주요 사건 추가 ──
    {
      const bardEvent = pastLifeData?.epicMoment || pastLifeData?.lastBossKilled
        ? `${pastLifeData.characterName || "영웅"}이(가) ${pastLifeData.lastBossKilled || "전설적 적"}을 물리쳤다`
        : null;
      if (bardEvent) addBardVerse(bardEvent, pastLifeData.characterName, pastLifeData.scenario);
    }
    // ── 65번: 대미스터리 퍼즐 — 회차별 조각 수집 ──
    collectMysteryPiece(newCycle);
    // ── 66번: 감시자의 시선 — 회차 기반 진행 ──
    progressWatcherGaze(newCycle);
    // ── 67번: 운명 카드 — 새 회차 카드 초기화 ──
    clearFateCardOnReincarnate();
    // ── 68번: 전생 본거지 업그레이드 — 회차마다 시설 추가 ──
    upgradeHideout(newCycle);
    // ── 69번: 악안(惡眼) — 이번 회차 처치 수 누적 ──
    if (pastLifeData?.totalKills) recordEvilEyeKill(pastLifeData.totalKills);
    else if (pastLifeData?.killedBosses) recordEvilEyeKill(pastLifeData.killedBosses.length * 5);
    // ── 70번: 달의 위상 — 사망 시점 달 위상 배정 ──
    assignMoonPhase(new Date().toISOString());
    // ── 71번: 전생에서 보내는 편지 ──
    {
      const autoMsg = pastLifeData?.lastWord || `${newCycle}번째 생을 마치며. 다음 생의 나에게.`;
      recordPastLetter(autoMsg, pastLifeData.characterName, pastLifeData.scenario, karmaScore);
    }
    // ── 72번: 회차 하이라이트 컷씬 ──
    {
      const autoType = pastLifeData?.sacrificed ? "sacrifice"
        : pastLifeData?.lastBossKilled ? "final_battle"
        : karmaScore >= 70 ? "betrayal"
        : (pastLifeData?.questCompletionRate||0) >= 90 ? "victory"
        : "death";
      addHighlightReel(autoType, pastLifeData.characterName, pastLifeData.scenario);
    }
    // ── 73번: 나비 지수 ──
    {
      const impact = Math.round(((pastLifeData?.questCompletionRate||0) * 0.3) + (newCycle * 2) + (pastLifeData?.sacrificed ? 15 : 0));
      growButterflyIndex(impact);
    }
    // ── 74번: 고대 비문 해독 ──
    decipherInscriptionLine(newCycle);
    // ── 75번: 윤회 등급 ──
    {
      const endType75 = karmaScore >= 70 ? "villain" : (pastLifeData?.questCompletionRate||0) >= 90 ? "hero" : "normal";
      updateRank(newCycle, endType75, pastLifeData?.achievements?.length || 0);
    }
    // ── 76번: 벚꽃 엔딩 조건 체크 ──
    updateSakuraProgress(pastLifeData.scenario, karmaScore, pastLifeData?.allCompanionsSurvived, karmaScore >= 70, newCycle);
    // ── 77번: 데자뷔 알림 — 자동 기록 ──
    recordDejavuEvent("final_boss", pastLifeData.scenario);
    // ── 78번: 인과율 조작 — 새 회차 리셋 ──
    resetCausalityOnReincarnate(newCycle);
    // ── 79번: 전생 도박 빚 — 도박 관련 기록 ──
    if (pastLifeData?.gamblingDebt) recordGamblingDebt(pastLifeData.gamblingDebt, pastLifeData.scenario);
    // ── 80번: 어린 시절 트라우마 ──
    if (pastLifeData?.earlyTrauma) recordChildhoodTrauma(pastLifeData.earlyTrauma, pastLifeData.scenario);
    else {
      const autoTrauma = pastLifeData?.sacrificed ? "loss"
        : karmaScore >= 70 ? "defeat"
        : pastLifeData?.deathCause === "poison" ? "hunger"
        : null;
      if (autoTrauma) recordChildhoodTrauma(autoTrauma, pastLifeData.scenario);
    }
    // ── 81번: 세계 종말 카운터 ──
    tickApocalypse(karmaScore, pastLifeData?.questCompletionRate||0, pastLifeData?.sealedApocalypse);
    // ── 82번: 슬픔 수치 ──
    if (pastLifeData?.lostCompanions) pastLifeData.lostCompanions.forEach(c => { if(c.name) recordLoss(c.name, c.relationship); });
    else if (pastLifeData?.sacrificed) recordLoss("희생된 동료", "동료");
    // ── 83번: 전생 직감 ──
    growInstinct(newCycle);
    // ── 84번: 저주받은 유물 ──
    if (pastLifeData?.cursedRelicUsed) recordCursedRelic(pastLifeData.cursedRelicUsed, pastLifeData.scenario);
    // ── 85번: 자연 업보 ──
    if (karmaScore >= 70) recordNatureAction("destroy");
    else if (karmaScore <= 30) recordNatureAction("protect");
    // ── 86번: 신분 세탁 ──
    if (pastLifeData?.usedAliases) pastLifeData.usedAliases.forEach(a => { if(a.name) recordAlias(a.name, a.context, pastLifeData.scenario); });
    // ── 87번: 소원 시스템 — 회차 체크 ──
    // (소원은 플레이어 선택으로 사용, 자동 처리 없음)
    // ── 88번: 전생 반려동물 ──
    if (pastLifeData?.companions) pastLifeData.companions.forEach(c => { if(c.type==="pet"&&c.name) recordPetLegacy(c.petType||"wolf",c.name,c.bond,pastLifeData.scenario); });
    // ── 89번: 봉인된 기억 방 ──
    {
      const sealType = pastLifeData?.firstKill ? "first_kill"
        : pastLifeData?.betrayedAlly ? "betrayal_pain"
        : pastLifeData?.massDeathWitnessed ? "mass_death"
        : null;
      if (sealType) sealMemory(sealType, pastLifeData.scenario);
    }
    // ── 90번: 영혼 결정체 ──
    {
      const crystalAmt = (pastLifeData?.questCompletionRate||0) >= 80 ? 2 : 1;
      earnSoulCrystal(crystalAmt);
    }
    // ── 91번: 감정 잔향 ──
    if (pastLifeData?.dominantEmotion) recordEmotionEcho(pastLifeData.dominantEmotion);
    // ── 92번: 차원 지도 ──
    if (pastLifeData?.scenario) addDimensionPin(pastLifeData.scenario, pastLifeData.scenario);
    // ── 93번: 악역 계승 ──
    if (pastLifeData?.lastBossKilled && karmaScore >= 60) inheritVillainPower(pastLifeData.lastBossKilled, null, pastLifeData.scenario);
    // ── 94번: 눈물 수집 ──
    if (pastLifeData?.sacrificed || pastLifeData?.lostCompanions?.length > 0) earnTearCrystal("소중한 이를 잃은 슬픔", pastLifeData.scenario);
    // ── 95번: 속성 사망 기록 ──
    if (pastLifeData?.deathElement) recordElementDeath(pastLifeData.deathElement);
    // ── 96번: 이세계 서커스 — 고회차 자동 방문 기록 ──
    if (newCycle >= 7 && newCycle % 7 === 0) visitCircus(newCycle);
    // ── 97번: 신전 건립 ──
    {
      const faithGain = karmaScore <= 30 ? 15 : karmaScore <= 50 ? 10 : 5;
      growFaith(faithGain);
    }
    // ── 98번: 유언 방송 ──
    if (pastLifeData?.lastWord) recordLegacyWord(pastLifeData.lastWord, pastLifeData.characterName, pastLifeData.scenario, karmaScore);
    // ── 99번: 돌연변이 ──
    if (pastLifeData?.race) recordRaceForMutation(pastLifeData.race);
    // ── 100번: 어둠의 메아리 ──
    if (karmaScore >= 60) growDarkEcho(Math.round((karmaScore - 50) / 5), pastLifeData?.lastBossKilled);
    // ── 101번: 성장 나무 ──
    {
      const branchType = pastLifeData?.sacrificed ? "sacrifice" : karmaScore <= 30 ? "hope" : karmaScore >= 70 ? "darkness" : (pastLifeData?.questCompletionRate||0) >= 80 ? "courage" : "wisdom";
      growTreeBranch(branchType, pastLifeData.scenario);
    }
    // ── 102번: 신격화 루트 ──
    {
      if (karmaScore <= 20) updateDeification("karma_pure");
      if (newCycle >= 100) updateDeification("century_cycle");
      if (pastLifeData?.sealedApocalypse) updateDeification("world_saved");
    }
    // ── 103번: 무한 회귀 자각 ──
    awakenLoopAwareness(newCycle);
    // ── 104번: 전생 라이벌 성장 ──
    if (pastLifeData?.rivalNPC) recordRival(pastLifeData.rivalNPC.name, pastLifeData.rivalNPC.class, pastLifeData.rivalNPC.power, pastLifeData.scenario);
    // ── 105번: 붉은 실 ──
    if (pastLifeData?.strongestBond) setRedThread(pastLifeData.strongestBond.name, pastLifeData.strongestBond.bond || 50, pastLifeData.scenario);
    // ── 106번: 전생 건축물 붕괴 ──
    if (pastLifeData?.builtStructures) pastLifeData.builtStructures.forEach(s => { if(s.type) recordRuin(s.type, s.name, pastLifeData.scenario); });
    else if ((pastLifeData?.questCompletionRate||0) >= 60) recordRuin("guild", null, pastLifeData.scenario);
    // ── 107번: 살의 감지 ──
    if (pastLifeData?.deathCause === "assassination") recordAssassinDeath();
    // ── 108번: 원한꽃 ──
    if (pastLifeData?.killedBy) bloomGrudgeFlower(pastLifeData.killedBy, pastLifeData.scenario);
    // ── 109번: 불운의 회차 체크 ──
    checkCursedCycle(newCycle);
    // ── 110번: 자석 운명 ──
    if (pastLifeData?.avoidedEvents) pastLifeData.avoidedEvents.forEach(e => { if(e) recordAvoidedFate(e, pastLifeData.scenario); });
    // ── 111번: 기억의 홍수 — 10회차+ 자동 트리거 체크 ──
    if (newCycle >= 10 && newCycle % 5 === 0) triggerMemoryFlood(pastLifeData?.stats?.wil || 30, newCycle);
    // ── 112번: 회전목마 NPC ──
    assignCarouselRole(pastLifeData?.carouselNPCName || null, newCycle);
    // ── 113번: 운명의 덫 ──
    if (pastLifeData?.repeatActions) pastLifeData.repeatActions.forEach(a => { if(a) recordActionPattern(a); });
    // ── 114번: 정신 오염 ──
    if (newCycle >= 10) growMentalCorruption(newCycle);
    // ── 115번: 전생 영화관 — 회차별 자동 명장면 등록 ──
    {
      const sceneType = pastLifeData?.sacrificed ? "last_stand" : pastLifeData?.lastBossKilled ? "great_battle" : (pastLifeData?.questCompletionRate||0) >= 80 ? "discovery" : "final_battle";
      viewCinemaScene(sceneType, pastLifeData.scenario);
    }
    // ── 116번: 쌍둥이 영혼 ──
    if (pastLifeData?.twinSoulNPC) connectTwinSoul(pastLifeData.twinSoulNPC.name, pastLifeData.twinSoulNPC.skill, null);
    // ── 117번: 살수 명단 ──
    if (pastLifeData?.killedBosses) pastLifeData.killedBosses.forEach(b => { if(b.name) addToKillList(b.name, b.role, pastLifeData.scenario); });
    // ── 118번: 기억 경매 — 자동 등록 없음 (플레이어 선택) ──
    // ── 119번: 인연 나무 ──
    growBondTree(pastLifeData?.npcMet || 5, pastLifeData?.deepBonds || 0);
    // ── 120번: 사이버 각인 ──
    if (pastLifeData?.installedImplants) pastLifeData.installedImplants.forEach(i => { if(i) recordCyberImprint(i, pastLifeData.scenario); });
    // ── 121번: 검귀 빙의 ──
    if (pastLifeData?.masteredTechnique) recordSwordTechnique(pastLifeData.masteredTechnique, pastLifeData.scenario);
    // ── 122번: 왕국 유산 ──
    if (pastLifeData?.foundedKingdom) foundKingdom(pastLifeData.foundedKingdom.type, pastLifeData.foundedKingdom.name, pastLifeData.scenario);
    // ── 123번: 루프 자각자 길드 — 5회차+ 랜크업 ──
    { const g = loadLoopersGuild(); if (g.status === "member" && newCycle % 5 === 0) rankUpGuild(); }
    // ── 124번: 사신과의 거래 — 빚 회수 리셋 ──
    // (거래는 게임 중 발생, 환생 시 별도 처리 없음)
    // ── 125번: 역할 반전 ──
    if (pastLifeData?.lastBossKilled) addRoleReversal(pastLifeData.lastBossKilled, pastLifeData?.lastBossSkills, pastLifeData.scenario);
    // ── 126번: 별의 의지 ──
    assignWorldWill(newCycle);
    // ── 127번: 사안(死眼) ──
    recordDeathForEye();
    // ── 128번: 영혼의 주파수 ──
    growSoulFrequency(newCycle, pastLifeData?.deepBonds || 0);
    // ── 129번: 봉인된 신 조각 수집 ──
    collectGodShard(pastLifeData.scenario);
    if (pastLifeData?.sealedGodReleased) setGodAlignment(karmaScore);
    // ── 130번: 자연의 섭리 진화 ──
    evolvNaturalLaw(newCycle);
    // ── 숨겨진 직업 해금 조건 체크 ──
    {
      const la = loadLoopAwareness();
      const dm = loadDimensionMap();
      const sg = loadSealedGod();
      const vi = loadVillainInherit();
      const tt = loadTimeTokens();
      const bl = loadBardLegend();
      const tp = loadTemple();
      const ug = loadUndyingGauge();
      const de = loadDeathEye();
      const rk = loadRankData();
      const pl = loadPastLanguage();
      const ca = loadCausality();
      const ts = loadTwinSoul();
      const gameData = {
        cycle: newCycle,
        karmaScore,
        deathCount: pastLifeData?.deathCount || 0,
        skillUseCount: pastLifeData?.totalSkillUses || 0,
        stealthEndings: pastLifeData?.stealthEnding ? 1 : 0,
        pureKarmaEndings: karmaScore <= 20 ? 1 : 0,
        evilKarmaEndings: karmaScore >= 80 ? 1 : 0,
        battleWins: pastLifeData?.battleWins || 0,
        battleWinHistory: pastLifeData?.totalBattleWins || 0,
        lowHpWins: pastLifeData?.lowHpWins || 0,
        darkActs: pastLifeData?.darkActs || 0,
        craftEvents: pastLifeData?.craftEvents || 0,
        loopAwarenessLevel: la?.level || 0,
        dimensionPins: dm?.totalWorlds || 0,
        sealedGodComplete: sg?.released || false,
        villainInheritCount: vi?.inherited?.length || 0,
        timeTokenUsed: tt?.used || 0,
        bardFame: bl?.fame || 0,
        templeLevel: tp?.level || 0,
        undyingMaxed: (ug?.gauge || 0) >= (ug?.maxGauge || 10),
        totalDeaths: de?.totalDeaths || 0,
        reincarnationRank: rk?.rank || 0,
        pastLanguageUnlocked: (pl?.level || 0) > 0,
        causalityUnlocked: ca !== null,
        twinSoulConnected: ts?.connected || false,
        deathEyeUnlocked: de?.unlocked || false,
        currentRole: pastLifeData?.characterRole || pastLifeData?.role || "",
      };
      checkAllHiddenJobUnlocks(gameData);
    }
    savePastLife(pastLifeData); setPastLife(pastLifeData); clearSession(); clearMemory(); clearNPCs(); clearWorldNotes(); clearQuests(); clearAtmosphere(); clearSkills(); clearSkillSP(); clearJobSkills(); clearGold(); clearInventory(); clearPlayerLevel(); clearPlayerExp(); clearRace(); setCharacter(null); setScenario(null); setScreen("reincarnation");
  };

  const handleKeyReset = () => { lsDel(API_KEYS_STORAGE); lsDel(API_KEY_INDEX_STORAGE); setApiKeys([]); setCharacter(null); setScenario(null); clearSession(); clearMemory(); clearEmotion(); clearSecrets(); clearHighlights(); clearNPCs(); clearWorldNotes(); clearQuests(); clearAtmosphere(); clearSkills(); clearSkillSP(); clearJobSkills(); clearGold(); clearInventory(); clearPlayerLevel(); clearPlayerExp(); clearRace(); clearParallelSelves(); clearCurseRing(); clearCycleStats(); clearInjuryMarks(); clearPastTheme(); clearMemoryDistort(); clearAgeParadox(); clearSummonLegacy(); clearGrudgeWeapons(); clearDreamProphecies(); clearLegacyBuildings(); clearWatchers(); clearSoulMasks(); clearEmotionRipples(); clearTestaments(); clearConstellation(); clearExplorerMap(); clearLightningImprints(); clearWarScars(); clearDivineContracts(); clearLanguageMemories(); clearSinRedemptions(); clearLegendShards(); clearTimeEchoes(); clearMythChapters(); clearBloodline(); clearCurseLineage(); clearStarSign(); clearPastLanguage(); clearIdentityVault(); clearRifts(); clearRecipeBook(); clearAchievementRates(); clearRomanceLegacy(); clearBestiary(); clearMemoryMerchant(); clearTimeTokens(); clearSurvivorCompanions(); clearUndyingGauge(); clearLanguages(); clearBardLegend(); clearMysteryPuzzle(); clearWatcherGaze(); clearFateCard(); clearHideout(); clearEvilEye(); clearMoonPhase(); clearPastLetters(); clearHighlightReel(); clearButterflyIndex(); clearInscription(); clearRankData(); clearSakuraData(); clearDejavu(); clearCausality(); clearGamblingDebt(); clearChildhoodTrauma(); clearApocalypse(); clearGrief(); clearInstinct(); clearCursedRelics(); clearNatureKarma(); clearAliasList(); clearWish(); clearPetLegacy(); clearSealedMemories(); clearSoulCrystals(); clearEmotionEcho(); clearDimensionMap(); clearVillainInherit(); clearTearCrystals(); clearElementTrauma(); clearCircus(); clearTemple(); clearLegacyWords(); clearMutation(); clearDarkEcho(); clearGrowthTree(); clearDeification(); clearLoopAwareness(); clearRivals(); clearRedThread(); clearRuins(); clearKillSense(); clearGrudgeFlowers(); clearCursedCycle(); clearFateMagnet(); clearMemoryFlood(); clearCarouselNPC(); clearFateTraps(); clearMentalCorruption(); clearCinema(); clearTwinSoul(); clearKillList(); clearMemoryAuction(); clearBondTree(); clearCyberImprint(); clearSwordGhost(); clearKingdom(); clearLoopersGuild(); clearDeathDealer(); clearRoleReversal(); clearWorldWill(); clearDeathEye(); clearSoulFrequency(); clearSealedGod(); clearNaturalLaw(); clearHiddenJobs(); setScreen("apikey"); };

  return (
    <div id="app" style={{ height:"100dvh", display:"flex", flexDirection:"column", background:"#0a0500", fontFamily:"'Cinzel',serif", overflow:"hidden" }}>
      {screen === "loading" && <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ color:"#c8a96e", fontSize:13 }}>✦ 불러오는 중...</div></div>}
      {screen === "apikey"   && <ApiKeyScreen onConfirm={handleApiKeys} />}
      {screen === "scenario" && <ScenarioScreen onSelect={handleScenario} />}
      {screen === "setup"    && <SetupScreen onStart={handleStart} scenario={scenario} pastLife={pastLife} />}
      {screen === "reincarnation" && <ReincarnationScreen pastLife={pastLife} onStart={(char, sc, pl) => { setPastLife(pl); savePastLife(pl); setCharacter({...char, scenario: sc?.era || ""}); setScreen("chat"); }} onSkip={() => { clearPastLife(); setPastLife(null); setScreen("scenario"); }} />}
      {screen === "chat" && character && <ChatApp apiKeys={apiKeys} character={character} onReset={handleReset} onReincarnate={handleReincarnate} onKeyReset={handleKeyReset} pastLife={pastLife} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
