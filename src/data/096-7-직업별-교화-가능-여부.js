// 7. 직업별 교화 가능 여부 — data
// Pure data split out of job/096-7-직업별-교화-가능-여부.js (see generate.js).

export const JOB_EVANGEL_PERMISSION = {
  cleric:          ['설교','기적','이단고발','자선','성지건립','논쟁토론'],
  paladin:         ['설교','기적','이단고발','자선'],
  archbishop:      ['설교','기적','이단고발','자선','성지건립','논쟁토론'],
  exorcist:        ['이단고발','자선'],
  oracle:          ['설교','기적'],
  solar_priest:    ['설교','기적','이단고발','성전선포','율법집전'],
  crusader:        ['이단고발','성전선포'],
  inquisitor:      ['이단고발','이단고발'],  // 강화
  shaman:          ['설교','기적','점술','자연치유의식','부족축제'],
  tribal_mage:     ['점술','자연치유의식'],
  grand_shaman:    ['설교','기적','점술','자연치유의식','부족축제','꿈해몽'],
  dark_priest:     ['힘제공계약','절망접근'],
  pact_mage:       ['힘제공계약'],
  abyss_evangelist:['힘제공계약','절망접근','진실은폐'],
  abyss_apostle:   ['힘제공계약','절망접근','진실은폐'],
};
