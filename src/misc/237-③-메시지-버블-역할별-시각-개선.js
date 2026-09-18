// ③ 메시지 버블 역할별 시각 개선
// Auto-extracted from taleforge.html (original section banner preserved above).

(function patchBubbleStyle(){
  const style = document.createElement('style');
  style.textContent = `
    .msg-ai .bubble{
      background:var(--panel);
      border-left:2px solid #2a1a05;
      border-radius:0 8px 8px 8px;
      position:relative;
    }
    .msg-ai .bubble::before{
      content:'📖';
      position:absolute;left:-18px;top:4px;
      font-size:10px;opacity:.5;
    }
    .msg-user .bubble{
      background:linear-gradient(135deg,#0a0600,#120b00);
      border:1px solid #3a2810;
      border-radius:8px 0 8px 8px;
      margin-left:20%;
    }
    .msg-ai{ margin-right:8% }
    .roll-info{ margin-top:4px;padding:3px 0 }
  `;
  document.head.appendChild(style);
})();
