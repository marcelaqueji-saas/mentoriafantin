window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XEWWFLC4RS');

// Rastreia cliques especificamente no número do WhatsApp informado
window.addEventListener('click', function(e){
  const a = e.target.closest('a[href*="wa.me/554388260393"]');
  if(!a) return;
  gtag('event', 'click_whatsapp', {
    link_text: a.textContent.trim(),
    link_url: a.href,
    location: 'page' // opcional: você pode trocar por ids de seção
  });
});

/* Autoplay ao entrar; pausa ao sair. Botão liga/desliga som. */
(function(){
  const section = document.querySelector('#aprovacao-carolina');
  const video   = document.querySelector('#videoCarolina');
  const btn     = section ? section.querySelector('.unmute') : null;
  if(!section || !video || !btn) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(async e=>{
      if(e.isIntersecting){ try{ await video.play(); }catch(_){}} else { video.pause(); }
    });
  }, {threshold: .55});
  io.observe(section);

  btn.addEventListener('click', async ()=>{
    video.muted = !video.muted;
    btn.textContent = video.muted ? '🔇' : '🔊';
    try{ await video.play(); }catch(_){}
  });
})();

/* ===== JS da seção TREINO ===== */
(function(){
  const sec = document.querySelector('.train-proof');
  if(!sec) return;

  // autoplay dos vídeos quando entram na viewport; pausa ao sair
  const vids = sec.querySelectorAll('video');
  const vObs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      const v = en.target;
      if(en.isIntersecting){
        v.muted = true; v.playsInline = true;
        v.play().catch(()=>{});
      } else {
        v.pause();
      }
    });
  }, {threshold:.5});
  vids.forEach(v=>vObs.observe(v));

  // play/pausar manual pelo botão
  sec.querySelectorAll('.play-toggle').forEach(btn=>{
    const v = btn.closest('.media').querySelector('video');
    if(!v) { btn.remove(); return; }
    btn.addEventListener('click', ()=>{
      if(v.paused){ v.play().catch(()=>{}); }
      else{ v.pause(); }
    });
  });

  // animação de entrada dos cards
  if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const tiles = sec.querySelectorAll('[data-anim="tile"]');
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(en=>{
        if(!en.isIntersecting) return;
        en.target.classList.add('anim-in');
        obs.unobserve(en.target);
      });
    }, {threshold:.2, rootMargin:'0px 0px -10% 0px'});
    tiles.forEach(t=>io.observe(t));
  }
})();

/* ====== Diferenciais (accordion) ====== */
(function(){
  const DURATION = 380;
  const cards = Array.from(document.querySelectorAll('.expc-card'));
  let openRef = null;

  function closeCard(card){
    if(!card) return;
    const btn = card.querySelector('.expc-head');
    const body = card.querySelector('.expc-body');
    const divider = card.querySelector('.divider');
    btn.setAttribute('aria-expanded','false');
    body.style.opacity = '0';
    body.style.maxHeight = '0px';
    divider.style.opacity = '0';
    clearTimeout(body._hideTimer);
    body._hideTimer = setTimeout(()=>{ body.hidden = true; }, DURATION);
  }
  function openCard(card){
    const btn = card.querySelector('.expc-head');
    const body = card.querySelector('.expc-body');
    const divider = card.querySelector('.divider');
    btn.setAttribute('aria-expanded','true');
    divider.style.opacity = '1';
    body.hidden = false; body.style.maxHeight = '0px';
    body.offsetHeight; // reflow
    body.style.opacity = '1';
    body.style.maxHeight = body.scrollHeight + 'px';
  }
  cards.forEach(card => {
    const btn = card.querySelector('.expc-head');
    const body = card.querySelector('.expc-body');
    body.hidden = true; body.style.maxHeight = '0px'; body.style.opacity = '0';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if(isOpen){ closeCard(card); openRef = null; }
      else{ if(openRef && openRef !== card) closeCard(openRef); openCard(card); openRef = card; }
    });
  });
})();

/* ====== Feedbacks: duplica as imagens para loop contínuo ====== */
(function(){
  document.querySelectorAll('.row .track').forEach(track=>{
    track.innerHTML = track.innerHTML + track.innerHTML;
  });
})();

// KPIs: contagem ao entrar na tela
(function(){
  const els = document.querySelectorAll('.kpi-number');
  if(!('IntersectionObserver' in window)) return; // sem polyfill, sem erro

  const ease = (t)=> 1 - Math.pow(1 - t, 3); // easeOutCubic
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);

      const end = parseInt(el.getAttribute('data-count'), 10) || 0;
      const plus = el.getAttribute('data-plus') || '';
      const dur = 1200; // ms
      const start = performance.now();

      function tick(now){
        const p = Math.min(1, (now - start)/dur);
        const val = Math.round(ease(p) * end);
        el.textContent = val + plus;
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  els.forEach(el=>obs.observe(el));
})();

(function(){
  const root = document.querySelector('.taf-proof');
  if(!root) return;

  const viewport = root.querySelector('.taf-carousel'); // largura visível
  const track   = root.querySelector('.taf-track');
  const slides  = Array.from(root.querySelectorAll('.taf-slide'));
  const videos  = slides.map(s => s.querySelector('video'));
  const prevBtn = root.querySelector('.taf-prev');
  const nextBtn = root.querySelector('.taf-next');
  const dotsBox = root.querySelector('.taf-dots');

  let index = 0, autoTimer = null;

  // dots
  slides.forEach((_,i)=>{
    const b = document.createElement('button');
    b.type='button';
    b.setAttribute('aria-label','Ir para o vídeo '+(i+1));
    if(i===0) b.setAttribute('aria-current','true');
    b.addEventListener('click', ()=>go(i,true));
    dotsBox.appendChild(b);
  });

  function updateUI() {
    const w = viewport.clientWidth;
    track.style.transform = `translate3d(${-index * w}px,0,0)`;
    dotsBox.querySelectorAll('button').forEach((d,i)=>{
      d.toggleAttribute('aria-current', i===index);
    });
  }

  function clearAuto(){ clearTimeout(autoTimer); autoTimer = null; }
  function stopPrev(prev){
    if(prev == null) return;
    const v = videos[prev];
    v.pause(); v.currentTime = 0; v.onended = null;
  }

  async function playActive(){
    clearAuto();
    const v = videos[index];
    v.muted = true; v.playsInline = true;

    try { await v.play(); } catch(e) { /* ok */ }

    v.onended = ()=>go(index+1);
    // fallback seguro caso 'ended' não dispare (ex: vídeos muito curtos)
    const dur = isFinite(v.duration) && v.duration>0 ? v.duration : 12;
    autoTimer = setTimeout(()=>go(index+1), (dur + 0.3) * 1000);
  }

  function go(i, manual=false){
    const prev = index;
    index = (i + slides.length) % slides.length;
    updateUI();
    stopPrev(prev);
    playActive();
  }

  prevBtn.addEventListener('click', ()=>go(index-1,true));
  nextBtn.addEventListener('click', ()=>go(index+1,true));

  // swipe básico
  let x0=null, t0=0, pid=null;
  track.addEventListener('pointerdown', e=>{
    x0=e.clientX; t0=Date.now(); pid=e.pointerId; track.setPointerCapture(pid);
  });
  track.addEventListener('pointerup', e=>{
    if(x0==null) return;
    track.releasePointerCapture(pid);
    const dx = e.clientX - x0, dt = Date.now()-t0;
    x0=null; pid=null;
    if(Math.abs(dx) > 40 && dt < 600){ dx<0 ? go(index+1,true) : go(index-1,true); }
  });

  // manter alinhado ao redimensionar
  window.addEventListener('resize', updateUI);

  // start
  updateUI();
  playActive();
})();

/* Timeline: anima em viewport e autoplay de vídeos da timeline */
(function(){
  const sec = document.querySelector('.timeline');
  if(!sec) return;

  // reveal
  if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const items = sec.querySelectorAll('.tl-item[data-anim="tl"]');
    const io = new IntersectionObserver((entries,obs)=>{
      entries.forEach(en=>{
        if(!en.isIntersecting) return;
        en.target.classList.add('in');
        obs.unobserve(en.target);
      });
    }, {threshold:.2, rootMargin:'0px 0px -10% 0px'});
    items.forEach(i=>io.observe(i));
  }

  // autoplay/pause de vídeos se houver
  const vids = sec.querySelectorAll('video');
  if(vids.length){
    const vo = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        const v = en.target;
        if(en.isIntersecting){ v.muted = true; v.playsInline = true; v.play().catch(()=>{}); }
        else{ v.pause(); }
      });
    }, {threshold:.6});
    vids.forEach(v=>vo.observe(v));
  }
})();

(function(){
  const burger    = document.querySelector('.burger');
  const panel     = document.getElementById('menu-panel');
  const backdrop  = document.querySelector('.menu-backdrop');
  const btnClose  = panel ? panel.querySelector('.menu-close') : null;

  if(!burger || !panel || !backdrop || !btnClose) return;

  let isOpen = false;

  function openMenu(){
    if(isOpen) return;
    isOpen = true;

    // remove hidden para poder animar
    panel.hidden = false;
    backdrop.hidden = false;

    // pequena espera p/ o browser aplicar display antes da transição
    requestAnimationFrame(()=>{
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
    });

    burger.setAttribute('aria-expanded','true');
    panel.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
  }

  function closeMenu(){
    if(!isOpen) return;
    isOpen = false;

    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');

    burger.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true');
    document.body.classList.remove('no-scroll');

    // espera a transição para aplicar hidden
    const onEnd = ()=> {
      panel.hidden = true;
      backdrop.hidden = true;
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
  }

  // Toggle
  burger.addEventListener('click', (e)=>{
    e.preventDefault();
    isOpen ? closeMenu() : openMenu();
  });

  // ✕ e backdrop
  btnClose.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);

  // fecha ao clicar nos links
  panel.addEventListener('click', (e)=>{
    if(e.target.closest('.menu-list a')) closeMenu();
  });

  // Esc fecha
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeMenu();
  });

  // em telas grandes, garante fechado
  window.addEventListener('resize', ()=>{
    if(window.innerWidth >= 1024) closeMenu();
  });

  // garante estado inicial fechado
  closeMenu();
})();
