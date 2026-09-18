// ⑧ 모바일 스와이프 제스처 (좌우 패널 전환)
// Auto-extracted from taleforge.html (original section banner preserved above).
import { renderQuests } from '../job/087-전직-조건-저장로드-헬퍼-퀘스트아이템장소-등.js';
import { renderDashboard } from '../misc/235-⑦-게임-현황-대시보드.js';

(function initSwipeGesture(){
  let startX=0, startY=0, startTime=0;
    document.addEventListener('touchstart', e=>{
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, { passive:true });

  document.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const dt = Date.now() - startTime;
    // 빠른 수평 스와이프만 처리 (300ms 이내, 수평 50px 이상, 수직 30px 이하)
    if(dt > 300 || Math.abs(dx) < 50 || Math.abs(dy) > 30) return;
    // 패널 오버레이가 열려있으면 제스처 무시
    const openPanel = document.querySelector('.panel-ov[style*="flex"],.panel-ov.open');
    if(openPanel) return;
    // 입력 필드 위에서는 무시
    if(document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

    if(dx < -50){
      // 왼쪽 스와이프 → 대시보드 열기
      window.openP('dashboard'); renderDashboard();
    } else if(dx > 50){
      // 오른쪽 스와이프 → 퀘스트 열기
      window.openP('quests'); if(typeof renderQuests==='function') renderQuests();
    }
  }, { passive:true });
})();

// [제거] "빠른 행동" 단축바 — 자유 텍스트를 직접 타이핑해서 저장한 뒤
// sendMsg(text,false)로 그대로 재전송하는 기능이라, "입력은 선택지
// 클릭뿐"으로 확정한 결정과 정면으로 충돌하는 자유 텍스트 우회 경로였다.
// 기능 전체를 제거한다.
