// Fran Santillana · interacción sin librerías
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coma = (n, d = 1) => n.toFixed(d).replace('.', ',');

  // ---------- cabecera sólida al bajar ----------
  const cab = $('[data-cab]');
  const alBajar = () => cab.classList.toggle('solida', scrollY > 40);
  addEventListener('scroll', alBajar, { passive: true }); alBajar();

  // ---------- formatos a escala ----------
  const F = window.FORMATOS || [], svg = $('[data-plano]'), ficha = $('[data-ficha]'), pie = $('[data-pie]');
  const NS = 'http://www.w3.org/2000/svg';
  // número pseudoaleatorio estable (misma pieza, mismo tono)
  const rnd = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
  const tono = (hex, d) => {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 + d))));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };
  function dibuja(f) {
    const pared = f.sup === 'pared', W = pared ? 200 : 300, H = pared ? 245 : 200, j = .45;
    const w = f.w, h = f.h, M = { l: 30, t: 14, r: 12, b: 30 };
    svg.setAttribute('viewBox', `${-M.l} ${-M.t} ${W + M.l + M.r} ${H + M.t + M.b}`);
    let enteras = 0, cortadas = 0, piezas = '', vetas = '', fila = 0, idx = 0;
    for (let y = H; y > 0; y -= h, fila++) {
      const off = f.patron === 'tercio' ? ((fila % 3) * w) / 3 : 0;
      for (let x = -off; x < W; x += w, idx++) {
        const x0 = Math.max(0, x), x1 = Math.min(W, x + w), y0 = Math.max(0, y - h), y1 = y;
        if (x1 - x0 < .5 || y1 - y0 < .5) continue;
        const corte = x < 0 || x + w > W || y - h < 0;
        corte ? cortadas++ : enteras++;
        const col = tono(f.tono, (rnd(idx) - .5) * (f.veta === 'madera' ? .16 : .06));
        piezas += `<rect class="pz" x="${(x0 + j / 2).toFixed(2)}" y="${(y0 + j / 2).toFixed(2)}" width="${(x1 - x0 - j).toFixed(2)}" height="${(y1 - y0 - j).toFixed(2)}" fill="${col}"${corte ? ' data-corte="1"' : ''}/>`;
        if (corte) piezas += `<rect class="pz" x="${(x0 + j / 2).toFixed(2)}" y="${(y0 + j / 2).toFixed(2)}" width="${(x1 - x0 - j).toFixed(2)}" height="${(y1 - y0 - j).toFixed(2)}" fill="url(#rayado)"/>`;
        // vetas: madera en líneas, mármol en una curva
        if (f.veta === 'madera') {
          for (let k = 1; k <= 2; k++) { const yy = y0 + (y1 - y0) * (k / 3 + (rnd(idx + k) - .5) * .12); vetas += `<path class="pz" d="M${(x0 + 2).toFixed(1)} ${yy.toFixed(1)} Q ${((x0 + x1) / 2).toFixed(1)} ${(yy + (rnd(idx * k) - .5) * 3).toFixed(1)} ${(x1 - 2).toFixed(1)} ${yy.toFixed(1)}"/>`; }
        } else if (f.veta === 'marmol' && rnd(idx) > .45) {
          const a = x0 + (x1 - x0) * rnd(idx + 3), b = x0 + (x1 - x0) * rnd(idx + 7);
          vetas += `<path class="pz" d="M${a.toFixed(1)} ${(y0 + 1).toFixed(1)} C ${(a + 8).toFixed(1)} ${(y0 + (y1 - y0) * .4).toFixed(1)} ${(b - 8).toFixed(1)} ${(y0 + (y1 - y0) * .6).toFixed(1)} ${b.toFixed(1)} ${(y1 - 1).toFixed(1)}"/>`;
        }
      }
    }
    // láser: horizontal sobre la primera hilada y vertical en la primera junta entera
    const ly = H - h, offset0 = 0, lx = Math.min(W - 2, w - offset0);
    const cota = (x1, y1, x2, y2, t, vert) => `<g class="cota"><path d="M${x1} ${y1}L${x2} ${y2}"/><path d="M${vert ? x1 - 3 : x1} ${vert ? y1 : y1 - 3}L${vert ? x1 + 3 : x1} ${vert ? y1 : y1 + 3}M${vert ? x2 - 3 : x2} ${vert ? y2 : y2 - 3}L${vert ? x2 + 3 : x2} ${vert ? y2 : y2 + 3}"/><text x="${vert ? x1 - 6 : (x1 + x2) / 2}" y="${vert ? (y1 + y2) / 2 : y1 + 12}" ${vert ? `transform="rotate(-90 ${x1 - 6} ${(y1 + y2) / 2})"` : ''} text-anchor="middle">${t}</text></g>`;
    svg.innerHTML = `<defs>
        <filter id="brillo" filterUnits="userSpaceOnUse" x="${-M.l}" y="${-M.t}" width="${W + M.l + M.r}" height="${H + M.t + M.b}"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id="rayado" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V4" stroke="rgba(10,20,36,.14)" stroke-width="1.2"/></pattern>
        <clipPath id="sup"><rect width="${W}" height="${H}"/></clipPath>
      </defs>
      <rect class="sup-fondo" x="-1" y="-1" width="${W + 2}" height="${H + 2}" rx="1"/>
      <g clip-path="url(#sup)" class="piezas">${piezas}<g class="vetas ${f.veta}">${vetas}</g></g>
      ${cota(0, H + 14, W, H + 14, coma(W / 100, 2) + ' m', false)}
      ${cota(-14, 0, -14, H, coma(H / 100, 2) + ' m', true)}
      <g class="laser-g"><path class="laser-l" d="M-8 ${ly}H${W + 8}"/><path class="laser-l" d="M${lx} -8V${H + 8}"/><circle class="laser-p" cx="${lx}" cy="${ly}" r="2.2"/></g>`;
    const m2 = (W * H) / 1e4, porM2 = 1e4 / (w * h);
    const sup = pared ? 'pared de ducha de 2,00 × 2,45 m' : 'suelo de 3,00 × 2,00 m';
    pie.innerHTML = `<span><i style="background:${f.tono}"></i>pieza entera</span><span><i style="background:${f.tono};background-image:repeating-linear-gradient(45deg,rgba(10,20,36,.18) 0 1px,transparent 1px 3px)"></i>pieza cortada</span><span><i style="background:#19c95c;height:2px;vertical-align:3px"></i>láser</span>`;
    ficha.innerHTML = `<h3>${f.nom}<small>cm</small></h3>
      <p class="ficha__uso">${f.uso}</p>
      <div class="ficha__cifras">
        <div><b>${coma(porM2)}</b><span>piezas por m²</span></div>
        <div><b>${enteras} + ${cortadas}</b><span>enteras y cortadas en ${pared ? 'una' : 'un'} ${sup}</span></div>
      </div>
      <p class="ficha__nota">${f.nota}</p>
      <p class="ficha__t-obras">Dónde lo he puesto</p>
      <ul class="ficha__obras">${f.obras.map(([t, a, fe]) => `<li>${a ? `<a href="${a}">${t}</a>` : `<span>${t}</span>`}<span class="mono">${fe}</span></li>`).join('')}</ul>`;
    svg.setAttribute('aria-label', `Despiece a escala de ${f.nom} cm en ${pared ? 'una' : 'un'} ${sup}: ${enteras} piezas enteras y ${cortadas} cortadas (${coma(m2, 2)} m²)`);
  }
  const botones = $$('.fmt');
  const elige = (i, foco) => {
    botones.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    if (foco) { botones[i].focus(); botones[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: quieto ? 'auto' : 'smooth' }); }
    dibuja(F[i]);
  };
  if (svg && F.length) {
    botones.forEach((b, i) => {
      b.addEventListener('click', () => elige(i));
      b.addEventListener('keydown', (e) => {
        const n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); elige((i + n + F.length) % F.length, true); }
      });
    });
    elige(0);
  }

  // ---------- baño en tres días: capítulos del vídeo ----------
  const video = $('[data-video]'), movil = $('.movil'), barra = $('[data-barra]'), diasBtn = $$('.dia');
  if (video) {
    const src = $('source', video);
    const carga = () => { if (src.dataset.src && !src.src) { src.src = src.dataset.src; video.preload = 'metadata'; video.load(); } };
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { video.poster = video.dataset.poster; carga(); o.disconnect(); } }, { rootMargin: '60% 0px' }).observe(video);
    const ts = diasBtn.map((b) => +b.dataset.t);
    const salta = (t) => { carga(); const ir = () => { video.currentTime = t; video.play(); }; video.readyState >= 1 ? ir() : video.addEventListener('loadedmetadata', ir, { once: true }); };
    $('[data-play]').addEventListener('click', () => { carga(); video.paused ? video.play() : video.pause(); });
    video.addEventListener('play', () => movil.classList.add('sonando'));
    video.addEventListener('pause', () => movil.classList.remove('sonando'));
    diasBtn.forEach((b) => b.addEventListener('click', () => salta(+b.dataset.t)));
    video.addEventListener('timeupdate', () => {
      const t = video.currentTime, d = video.duration || 89;
      barra.style.transform = `scaleX(${t / d})`;
      let k = 0; ts.forEach((x, i) => { if (t >= x - .2) k = i; });
      diasBtn.forEach((b, i) => { b.setAttribute('aria-pressed', i === k); b.classList.toggle('pasado', i < k); });
    });
  }

  // ---------- formulario → WhatsApp ----------
  const form = $('[data-form]');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form), nombre = (d.get('nombre') || '').trim();
    const campo = form.elements.nombre;
    if (!nombre) { campo.setAttribute('aria-invalid', 'true'); campo.focus(); return; }
    campo.removeAttribute('aria-invalid');
    const txt = [`Hola Fran, soy ${nombre}.`, `Quiero reformar: ${d.get('que')}.`, d.get('municipio') ? `Es en ${d.get('municipio').trim()}.` : '', (d.get('mensaje') || '').trim()].filter(Boolean).join('\n');
    window.open(`${window.WA}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
  });
})();
