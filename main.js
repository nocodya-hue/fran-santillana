// Fran Santillana · vídeos: se cargan al tocarlos (preload none) y solo suena uno a la vez. Sin librerías.
(() => {
  const vids = [...document.querySelectorAll('[data-video]')];
  const parar = (v) => { v.pause(); v.closest('.video__marco').classList.remove('on'); };
  vids.forEach((v) => {
    const marco = v.closest('.video__marco'), btn = marco.querySelector('[data-play]');
    const alternar = () => {
      const src = v.querySelector('source[data-src]');
      if (src) { src.src = src.dataset.src; src.removeAttribute('data-src'); v.load(); }
      if (v.paused) {
        vids.forEach((o) => o !== v && !o.paused && parar(o));
        v.play().then(() => { marco.classList.add('on'); btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Reproducir', 'Pausar')); }).catch(() => {});
      } else { parar(v); btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Pausar', 'Reproducir')); }
    };
    btn.addEventListener('click', alternar);
    v.addEventListener('click', alternar);
  });
  // si un vídeo sale de la pantalla, se para
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && !e.target.paused) parar(e.target); }), { threshold: 0 });
    vids.forEach((v) => io.observe(v));
  }
})();

// Filtro de obras (antes y después)
(() => {
  const btns = [...document.querySelectorAll('[data-filtro]')], obras = [...document.querySelectorAll('.ad__it[data-cat]')];
  btns.forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.filtro;
    btns.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    obras.forEach((o) => { o.hidden = k !== 'todas' && o.dataset.cat !== k; });
  }));
})();

// Visor: cualquier foto con data-grande se abre a pantalla completa; flechas para pasar dentro de su grupo
(() => {
  const dlg = document.querySelector('[data-visor]'); if (!dlg || !dlg.showModal) return;
  const img = dlg.querySelector('[data-visor-img]'), pie = dlg.querySelector('[data-visor-pie]');
  let lista = [], i = 0;
  const visibles = (g) => [...g.querySelectorAll('img[data-grande]')].filter((el) => !el.closest('[hidden]'));
  const ver = (n) => {
    i = (n + lista.length) % lista.length; const el = lista[i];
    img.src = el.dataset.grande; img.alt = el.alt; pie.textContent = `${el.dataset.pie}  ·  ${i + 1} / ${lista.length}`;
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('img[data-grande]'); if (!el) return;
    const g = el.closest('[data-grupo]'); lista = g ? visibles(g) : [el];
    ver(lista.indexOf(el)); dlg.showModal();
  });
  dlg.querySelector('[data-visor-cerrar]').addEventListener('click', () => dlg.close());
  dlg.querySelector('[data-visor-ant]').addEventListener('click', () => ver(i - 1));
  dlg.querySelector('[data-visor-sig]').addEventListener('click', () => ver(i + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') ver(i - 1); if (e.key === 'ArrowRight') ver(i + 1); });
  // deslizar con el dedo
  let x0 = null;
  dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) ver(i + (dx < 0 ? 1 : -1)); x0 = null; });
})();
