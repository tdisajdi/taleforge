// block0-preamble — data
// Pure data split out of misc/001-block0-preamble.js (see generate.js).

export const _dirty = {
  character: false,
  stats:     false,
  chat:      false,
  meta:      false,
  scenario:  false,
  gold:      false,
  inventory: false,
  equipped:  false,
};

export const _memStore = {};

export const EMOTION_DEFS = [
  { id:"joy",        label:"기쁨",       icon:"😊", color:"#f1c40f" },
  { id:"anger",      label:"분노",       icon:"😠", color:"#e74c3c" },
  { id:"sadness",    label:"슬픔",       icon:"😢", color:"#3498db" },
  { id:"fear",       label:"두려움",     icon:"😨", color:"#9b59b6" },
  { id:"disgust",    label:"불쾌",       icon:"😒", color:"#7f8c8d" },
  { id:"surprise",   label:"놀람",       icon:"😲", color:"#e67e22" },
  { id:"affection",  label:"애정",       icon:"🥰", color:"#e91e63" },
  { id:"longing",    label:"그리움",     icon:"🌙", color:"#5c6bc0" },
  { id:"anxiety",    label:"불안",       icon:"😰", color:"#78909c" },
  { id:"calm",       label:"평온",       icon:"😌", color:"#26a69a" },
  { id:"excited",    label:"설렘",       icon:"✨", color:"#ff8f00" },
  { id:"suspicious", label:"경계",       icon:"🤨", color:"#795548" },
  { id:"guilty",     label:"죄책감",     icon:"😞", color:"#546e7a" },
  { id:"proud",      label:"자부심",     icon:"😤", color:"#c0392b" },
  { id:"confused",   label:"혼란",       icon:"😵", color:"#8d6e63" },
];
