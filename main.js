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
