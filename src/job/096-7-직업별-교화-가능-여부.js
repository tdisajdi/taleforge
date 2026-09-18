// 7. 직업별 교화 가능 여부
// Auto-extracted from taleforge.html (original section banner preserved above).
import { JOB_EVANGEL_PERMISSION } from '../data/096-7-직업별-교화-가능-여부.js';

export function getJobEvangelActions(jobId){
  return JOB_EVANGEL_PERMISSION[jobId] || [];
}
window.getJobEvangelActions = getJobEvangelActions;
