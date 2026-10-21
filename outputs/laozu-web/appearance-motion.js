/* Original Spine timelines, sampled into atlases. Shared by portraits and combat. */
window.AppearanceMotion = (() => {
  const data = () => window.APPEARANCE_MOTION_DATA || {};
  const clip = (id, name) => {
    const clips = data()[id]?.clips;
    if (!clips) return null;
    return clips[name] || clips[{hit:'hit1',cast:'shifa',attack:'atk',walk:'move',dodge:'shanbi'}[name]] || clips.idle;
  };
  function html(id) {
    const c = clip(id, 'idle');
    return `<div class="dp-appearance" data-appearance-id="${Number(id)}"><svg class="dp-transmog" viewBox="${data()[id].viewBox || '0 0 320 420'}" aria-label="特殊幻化" role="img"><g class="dp-motion-anchor"><foreignObject width="320" height="420"><div xmlns="http://www.w3.org/1999/xhtml" class="dp-motion" data-motion-id="${Number(id)}" data-pose="idle" style="background-image:url(${c.file});--motion-time:${c.duration}s"></div></foreignObject></g></svg></div>`;
  }
  function pose(host, name, age, elapsed = 0) {
    const el = host.querySelector('[data-motion-id]');
    if (!el) return;
    const id = el.dataset.motionId, idleName=host.closest('.fighter')?'idle_atk':'idle', requested = clip(id, name);
    const active = name !== 'idle' && age >= 0 && (name === 'die' || age < requested.duration);
    const c = active ? requested : clip(id, idleName);
    const t = active ? Math.min(age, c.duration) : elapsed % c.duration;
    el.closest('.dp-motion-anchor').setAttribute('transform',c.transform || '');
    el.style.animation = 'none';
    el.style.backgroundImage = `url(${c.file})`;
    el.style.backgroundPosition = `${Math.min(c.frames - 1, Math.floor(t / c.duration * c.frames)) / (c.frames - 1) * 100}% 0`;
    el.dataset.pose = active ? name : idleName;
  }
  return {html, pose, has:id=>Object.hasOwn(data(),id), duration:(id,name)=>clip(id,name)?.duration || 0};
})();
