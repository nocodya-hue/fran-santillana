// Fran Santillana · interacción sin librerías
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ancho = () => innerWidth >= 960;
  const coma = (n, d = 1) => n.toFixed(d).replace('.', ',');

  // ---------- cabecera sólida al bajar ----------
  const cab = $('[data-cab]');
  const alBajar = () => cab.classList.toggle('solida', scrollY > 40);
  addEventListener('scroll', alBajar, { passive: true }); alBajar();

  // ---------- aparición al llegar ----------
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('[data-ver]').forEach((el) => io.observe(el));

  // ---------- portada: la cruz del láser sigue al puntero y mide ----------
  const portada = $('.portada'), cruz = $('[data-cruz]'), lectura = $('[data-lectura]');
  if (portada && cruz) {
    let tx = .66, ty = .71, x = tx, y = ty, activo = false, raf = 0;
    if (!fino) { tx = x = .62; ty = y = .74; }
    const pinta = () => {
      x += (tx - x) * .12; y += (ty - y) * .12;
      cruz.style.setProperty('--lx', (x * 100).toFixed(3) + '%');
      cruz.style.setProperty('--ly', (y * 100).toFixed(3) + '%');
      // lectura: la portada como una pared de 3,60 × 2,40 m
      if (lectura) lectura.textContent = `x ${coma(x * 3.6, 2)} m · y ${coma((1 - y) * 2.4, 2)} m · ±0,0 mm`;
      if (Math.abs(tx - x) > .0005 || Math.abs(ty - y) > .0005 || activo) raf = requestAnimationFrame(pinta); else raf = 0;
    };
    const mueve = () => { if (!raf) raf = requestAnimationFrame(pinta); };
    if (fino && !quieto) {
      portada.addEventListener('pointermove', (e) => {
        const r = portada.getBoundingClientRect();
        tx = Math.min(.97, Math.max(.03, (e.clientX - r.left) / r.width));
        ty = Math.min(.94, Math.max(.16, (e.clientY - r.top) / r.height));
        mueve();
      });
      portada.addEventListener('pointerleave', () => { tx = .66; ty = .71; mueve(); });
    } else if (!quieto) {
      // en el móvil, la cruz busca el nivel sola de vez en cuando
      let k = 0; const pts = [[.62, .74], [.36, .62], [.72, .55], [.5, .68]];
      setInterval(() => { if (scrollY < innerHeight) { [tx, ty] = pts[k++ % pts.length]; mueve(); } }, 3400);
    }
    setTimeout(mueve, 1900);
    // la foto se aleja un poco al bajar
    const foto = $('.portada__foto picture');
    if (foto && !quieto) addEventListener('scroll', () => { const s = scrollY; if (s < innerHeight * 1.2) foto.style.transform = `translate3d(0, ${s * .18}px, 0) scale(${1 + s * .00012})`; }, { passive: true });
  }

  // ---------- franja de formatos: corre más cuanto más rápido bajas ----------
  const cinta = $('[data-cinta]');
  if (cinta && !quieto && cinta.animate) {
    const anim = cinta.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 38000, iterations: Infinity });
    let ult = scrollY, vel = 1;
    const bucle = () => {
      const d = Math.abs(scrollY - ult); ult = scrollY;
      vel += ((1 + Math.min(d, 90) / 9) - vel) * .08;
      anim.playbackRate = vel;
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);
  }

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
        const d = Math.min(fila * 45, 700);
        piezas += `<rect class="pz" x="${(x0 + j / 2).toFixed(2)}" y="${(y0 + j / 2).toFixed(2)}" width="${(x1 - x0 - j).toFixed(2)}" height="${(y1 - y0 - j).toFixed(2)}" fill="${col}"${corte ? ' data-corte="1"' : ''} style="transition-delay:${d}ms"/>`;
        if (corte) piezas += `<rect class="pz" x="${(x0 + j / 2).toFixed(2)}" y="${(y0 + j / 2).toFixed(2)}" width="${(x1 - x0 - j).toFixed(2)}" height="${(y1 - y0 - j).toFixed(2)}" fill="url(#rayado)" style="transition-delay:${d}ms"/>`;
        // vetas: madera en líneas, mármol en una curva
        if (f.veta === 'madera') {
          for (let k = 1; k <= 2; k++) { const yy = y0 + (y1 - y0) * (k / 3 + (rnd(idx + k) - .5) * .12); vetas += `<path class="pz" d="M${(x0 + 2).toFixed(1)} ${yy.toFixed(1)} Q ${((x0 + x1) / 2).toFixed(1)} ${(yy + (rnd(idx * k) - .5) * 3).toFixed(1)} ${(x1 - 2).toFixed(1)} ${yy.toFixed(1)}" style="transition-delay:${d}ms"/>`; }
        } else if (f.veta === 'marmol' && rnd(idx) > .45) {
          const a = x0 + (x1 - x0) * rnd(idx + 3), b = x0 + (x1 - x0) * rnd(idx + 7);
          vetas += `<path class="pz" d="M${a.toFixed(1)} ${(y0 + 1).toFixed(1)} C ${(a + 8).toFixed(1)} ${(y0 + (y1 - y0) * .4).toFixed(1)} ${(b - 8).toFixed(1)} ${(y0 + (y1 - y0) * .6).toFixed(1)} ${b.toFixed(1)} ${(y1 - 1).toFixed(1)}" style="transition-delay:${d}ms"/>`;
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
    // aparece fila a fila
    const pzs = $$('.pz', svg); pzs.forEach((p) => p.style.opacity = 0);
    requestAnimationFrame(() => requestAnimationFrame(() => pzs.forEach((p) => p.style.opacity = '')));
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
  const video = $('[data-video]'), movil = $('.movil'), barra = $('[data-barra]'), diasBtn = $$('.dia'), diasLaser = $('[data-dias-laser]');
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
      // el láser de la regla avanza entre la primera y la última hora
      const p = Math.max(0, Math.min(1, (t - ts[0]) / (ts[ts.length - 1] - ts[0])));
      diasLaser.style.setProperty('--p', p.toFixed(3));
    });
  }

  // ---------- Santa Pola: carril horizontal (fijo al bajar en escritorio) ----------
  const sp = $('[data-carril]'), pasos = $('[data-pasos]'), prog = $('[data-progreso]');
  if (sp && pasos) {
    const fijo = () => ancho() && !quieto;
    const pista = $('[data-pista]');
    const mide = () => {
      if (fijo()) {
        const extra = pasos.scrollWidth - pista.clientWidth;
        sp.style.height = `${innerHeight + Math.max(0, extra)}px`;
        sp.classList.add('fijo');
      } else { sp.style.height = ''; sp.classList.remove('fijo'); pasos.style.transform = ''; }
      mueveSP();
    };
    const mueveSP = () => {
      if (fijo()) {
        const r = sp.getBoundingClientRect(), total = sp.offsetHeight - innerHeight;
        const p = Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
        const extra = pasos.scrollWidth - pista.clientWidth;
        pasos.style.transform = `translate3d(${-p * extra}px,0,0)`;
        prog.style.transform = `scaleX(${.06 + p * .94})`;
      } else {
        const max = pasos.scrollWidth - pasos.clientWidth;
        prog.style.transform = `scaleX(${.06 + (max > 0 ? pasos.scrollLeft / max : 1) * .94})`;
      }
    };
    addEventListener('scroll', mueveSP, { passive: true });
    pasos.addEventListener('scroll', mueveSP, { passive: true });
    addEventListener('resize', mide);
    addEventListener('load', mide); mide();
    const paso = (n) => {
      const w = $('.paso', pasos).getBoundingClientRect().width + 18;
      if (fijo()) { const total = sp.offsetHeight - innerHeight, extra = pasos.scrollWidth - pista.clientWidth; scrollBy({ top: (w / extra) * total * n, behavior: 'smooth' }); }
      else pasos.scrollBy({ left: w * n, behavior: quieto ? 'auto' : 'smooth' });
    };
    $('[data-ant]').addEventListener('click', () => paso(-1));
    $('[data-sig]').addEventListener('click', () => paso(1));
  }

  // ---------- obras: vista previa que sigue al puntero ----------
  const previa = $('[data-previa]');
  if (previa && fino && !quieto) {
    let px = 0, py = 0, cx = 0, cy = 0, vivo = false;
    const img = $('img', previa);
    const sigue = () => { cx += (px - cx) * .16; cy += (py - cy) * .16; previa.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${(px - cx) * .03}deg)`; if (vivo) requestAnimationFrame(sigue); };
    $$('.obra summary').forEach((s) => {
      s.addEventListener('pointerenter', (e) => {
        const o = s.parentElement; if (o.open) return;
        img.src = s.dataset.previa; px = cx = e.clientX + 24; py = cy = e.clientY - 120;
        previa.classList.add('on'); if (!vivo) { vivo = true; requestAnimationFrame(sigue); }
      });
      s.addEventListener('pointermove', (e) => { px = e.clientX + 24; py = e.clientY - 120; if (s.parentElement.open) previa.classList.remove('on'); });
      s.addEventListener('pointerleave', () => { previa.classList.remove('on'); vivo = false; });
      s.addEventListener('click', () => previa.classList.remove('on'));
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
