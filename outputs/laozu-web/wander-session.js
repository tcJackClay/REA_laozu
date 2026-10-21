/* UIWanderMain / UISelectEquip: closing selection does not submit the batch. */
window.WanderSession = (() => {
  const equipment = r => !!r && (r.reward ? r.rewardView !== 'event' : !r.popup && ['battle-ready','node-ready'].includes(r.phase));
  const event = r => !!r && (r.reward?.token && r.rewardView === 'event' || r.popup?.type === 'story' || !r.reward && !r.popup && r.phase === 'node-done');
  function showReward(r) { if (!r?.reward) return false; r.rewardView='equipment'; return true; }
  function returnEvent(r) { if (!r?.reward) return false; r.rewardView='event'; return true; }
  function log(r,type,detail={}) { (r.uiTrace ||= []).push({type,step:r.step,...detail}); r.uiTrace=r.uiTrace.slice(-60); }
  return {equipment,event,showReward,returnEvent,log};
})();
