// Adapted from the approved dynamic-card prototype. Slots reserve each card's
// maximum footprint; only the inner artwork scales, so neighbours never collide.
const section = document.querySelector('.illustration-archive');
if (section) {
  const viewport = section.querySelector('.illustration-window');
  const track = section.querySelector('.illustration-track');
  const original = track.firstElementChild;
  const controls = section.querySelector('.illustration-controls');
  const pause = section.querySelector('[data-art-pause]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  for (let i = 0; i < 4; i++) {
    const copy = original.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.append(copy);
  }
  const slots = [...track.querySelectorAll('.illustration-slot')];
  let cycle = 0, offset = 0, velocity = 0, last = 0, frame = 0;
  let visible = false, paused = preference.matches, hovered = false;
  let pointer = null, lastX = 0, lastTime = 0;
  let positions = [], width = 0;
  function wrap() {
    if (!cycle) return;
    offset = -2 * cycle + ((offset + 2 * cycle) % cycle + cycle) % cycle;
  }
  function render() {
    wrap();
    track.style.transform = `translate3d(${offset}px,0,0)`;
    slots.forEach((slot, i) => {
      const x = positions[i] + offset;
      if (x < -600 || x > width + 600) return;
      const wave = Math.sin((x - width / 2) / 310 + .35);
      slot.firstElementChild.style.setProperty('--art-scale', preference.matches ? '1' : (.81 + .19 * (wave + 1) / 2).toFixed(4));
    });
  }
  function measure() {
    const old = cycle;
    cycle = original.getBoundingClientRect().width;
    offset = old ? offset / old * cycle : -2 * cycle;
    width = viewport.clientWidth;
    positions = slots.map(slot => slot.offsetLeft + slot.offsetWidth / 2);
    render();
  }
  function active() { return visible && !document.hidden; }
  function moving() { return !preference.matches && !paused && !hovered && !section.contains(document.activeElement); }
  function tick(time) {
    frame = 0;
    const dt = last ? Math.min((time - last) / 1000, .05) : 0;
    last = time;
    if (pointer === null) {
      if (moving()) offset -= 38 * dt;
      offset += velocity * dt;
      velocity *= Math.pow(.06, dt);
      if (Math.abs(velocity) < 3) velocity = 0;
    }
    render();
    if (active() && (moving() || Math.abs(velocity) > 0)) frame = requestAnimationFrame(tick);
  }
  function wake() { if (!frame && active()) { last = 0; frame = requestAnimationFrame(tick); } }
  function label() {
    pause.textContent = paused ? 'Play motion' : 'Pause motion';
    pause.setAttribute('aria-pressed', String(paused));
    pause.hidden = preference.matches;
  }
  function release() {
    if (pointer === null) return;
    const id = pointer; pointer = null;
    if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
    viewport.classList.remove('is-dragging');
    if (preference.matches || performance.now() - lastTime > 100) velocity = 0;
    wake();
  }
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0 || pointer !== null) return;
    pointer = e.pointerId; lastX = e.clientX; lastTime = performance.now(); velocity = 0;
    viewport.setPointerCapture(pointer);
    viewport.classList.add('is-dragging');
    slots.forEach(slot => { slot.style.setProperty('--art-x','0deg'); slot.style.setProperty('--art-y','0deg'); });
  });
  viewport.addEventListener('pointermove', e => {
    if (e.pointerId !== pointer) return;
    const now = performance.now(), dx = e.clientX - lastX;
    offset += dx;
    velocity = preference.matches ? 0 : Math.max(-1600,Math.min(1600,dx / Math.max(now-lastTime,8) * 720));
    lastX = e.clientX; lastTime = now;
    render();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(event => viewport.addEventListener(event,release));
  viewport.addEventListener('pointerenter', e => { if(e.pointerType !== 'touch') { hovered = true; velocity = 0; } });
  viewport.addEventListener('pointerleave', () => { hovered = false; wake(); });
  slots.forEach(slot => {
    slot.addEventListener('pointermove', e => {
      if (pointer !== null || preference.matches || e.pointerType === 'touch') return;
      const rect = slot.getBoundingClientRect();
      slot.style.setProperty('--art-x', `${-(e.clientY-rect.top-rect.height/2)/rect.height*10}deg`);
      slot.style.setProperty('--art-y', `${(e.clientX-rect.left-rect.width/2)/rect.width*12}deg`);
    });
    slot.addEventListener('pointerleave', () => {slot.style.setProperty('--art-x','0deg');slot.style.setProperty('--art-y','0deg');});
  });
  function step(direction) { offset += direction * (slots[0].offsetWidth + parseFloat(getComputedStyle(original).gap)); velocity = 0; render(); }
  section.querySelector('[data-art-prev]').addEventListener('click',()=>step(1));
  section.querySelector('[data-art-next]').addEventListener('click',()=>step(-1));
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {e.preventDefault();step(e.key === 'ArrowLeft' ? 1 : -1);}
  });
  viewport.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); offset -= e.deltaX; velocity = 0; render(); }
  },{passive:false});
  pause.addEventListener('click',()=>{paused = !paused;velocity=0;label();wake();});
  section.addEventListener('focusout',()=>requestAnimationFrame(wake));
  window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',wake);
  preference.addEventListener('change',()=>{paused=preference.matches;velocity=0;label();render();wake();});
  new ResizeObserver(measure).observe(viewport);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake();},{rootMargin:'100px'}).observe(viewport);
  measure(); label();
  viewport.classList.add('is-ready'); controls.hidden=false;
}
