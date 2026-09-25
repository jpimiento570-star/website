(() => {
  'use strict';

  const CFG = window.JIP_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cop = (n) => '$' + Math.round(n).toLocaleString('es-CO');
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const waLink = (text) => `https://wa.me/${CFG.whatsapp || '573143049755'}?text=${encodeURIComponent(text)}`;

  // ───────────────────────── Encabezado y menú
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuBtn = $('#menuBtn');
  const nav = $('#nav');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // ───────────────────────── Palabra rotativa del titular
  const rotator = $('#rotator');
  const words = ['hogar', 'finca', 'negocio', 'familia'];
  if (rotator && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      rotator.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        rotator.textContent = words[i];
        rotator.classList.remove('is-out');
      }, 380);
    }, 2800);
  }

  // ───────────────────────── Señal que sale de la antena del hero
  const canvas = $('#heroSignal');
  const heroImg = $('.hero-media img');
  if (canvas && heroImg && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const DISH = { x: 0.868, y: 0.445 }; // posición de la antena dentro de la foto
    let W = 0, H = 0, ox = 0, oy = 0, running = true, raf;

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const iw = heroImg.naturalWidth || 1414, ih = heroImg.naturalHeight || 821;
      const narrow = window.innerWidth <= 760;
      const s = Math.max(W / iw, H / ih);
      // En móvil la foto es un recorte centrado en la antena (ver hero-mobile.webp)
      const dish = narrow ? { x: 0.62, y: 0.475 } : DISH;
      const offX = narrow ? (W - iw * s) / 2 : W - iw * s; // object-position: right / center
      ox = offX + iw * s * dish.x;
      oy = (H - ih * s) / 2 + ih * s * dish.y;
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const period = 5200, rings = 4, maxR = Math.hypot(W, H) * 0.75;
      for (let k = 0; k < rings; k++) {
        const p = ((t / period) + k / rings) % 1;
        const r = 18 + p * maxR;
        const a = Math.pow(1 - p, 2.2) * 0.55;
        ctx.beginPath();
        ctx.arc(ox, oy, r, Math.PI * 0.62, Math.PI * 1.38); // arco que abre hacia el valle
        ctx.strokeStyle = `rgba(246, 170, 20, ${a})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(ox, oy, 3 + Math.sin(t / 400) * 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 200, 80, 0.9)';
      ctx.fill();
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => { layout(); cancelAnimationFrame(raf); running = true; raf = requestAnimationFrame(draw); };
    if (heroImg.complete) start(); else heroImg.addEventListener('load', start, { once: true });
    window.addEventListener('resize', layout);
    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    }).observe(canvas);
  }

  // ───────────────────────── Cobertura
  const ZONAS = CFG.zonas || [];
  const TIPO = {
    fibra: { label: 'Fibra óptica disponible', text: 'Tu zona tiene red de fibra. Elige tu plan y agendamos la instalación.', tone: 'ok' },
    radio: { label: 'Internet rural por radioenlace', text: 'Llegamos con radioenlace. Haremos un estudio de línea de vista para tu punto exacto.', tone: 'ok' },
    mixta: { label: 'Zona con cobertura JIP', text: 'Tenemos red en tu zona. Un asesor confirma si llega fibra o radio a tu dirección exacta.', tone: 'ok' },
  };
  const datalist = $('#zonas');
  ZONAS.forEach((z) => datalist.append(new Option(z.nombre)));

  const zoneList = $('#zoneList');
  const TAG = { fibra: 'Fibra', radio: 'Radio', mixta: 'Fibra o radio' };
  ZONAS.forEach((z) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${z.nombre}</span><em class="tag tag-${z.tipo}">${TAG[z.tipo]}</em>`;
    zoneList.append(li);
  });

  const findZone = (q) => {
    const n = norm(q);
    if (n.length < 3) return null;
    return ZONAS.find((z) => norm(z.nombre) === n)
      || ZONAS.find((z) => norm(z.nombre).includes(n) || n.includes(norm(z.nombre)));
  };

  const coverageForm = $('#coverageForm');
  const coverageInput = $('#coverageInput');
  const coverageResult = $('#coverageResult');
  coverageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = coverageInput.value.trim();
    const zone = findZone(q);
    if (zone) {
      const t = TIPO[zone.tipo];
      const service = zone.tipo === 'radio' ? 'internet-rural' : 'fibra-optica';
      coverageResult.innerHTML = `
        <div class="result result-ok">
          <div><strong>${t.label} en ${zone.nombre}</strong><p>${t.text}</p></div>
          <a class="btn btn-yolk btn-sm" href="#contacto" data-service="${service}" data-barrio="${zone.nombre}">Solicitar instalación</a>
        </div>`;
    } else {
      coverageResult.innerHTML = `
        <div class="result result-pending">
          <div><strong>Aún no tenemos ${q ? `“${q.replace(/[<>]/g, '')}”` : 'esa zona'} en el mapa</strong>
          <p>Nuestra red crece cada mes. Déjanos tus datos y revisamos tu punto exacto.</p></div>
          <a class="btn btn-outline-light btn-sm" href="#contacto" data-service="internet-rural" data-barrio="${q.replace(/"/g, '')}">Consultar mi dirección</a>
        </div>`;
    }
  });
  $('#checkAgain').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => coverageInput.focus(), 500);
  });

  // ───────────────────────── Planes de fibra
  const PLANES = CFG.planes || [];
  const plansEl = $('#plans');
  const planSelect = $('#planSelect');
  PLANES.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'plan' + (p.destacado ? ' plan-featured' : '');
    card.innerHTML = `
      ${p.destacado ? '<span class="plan-flag">El más completo para el hogar</span>' : ''}
      <div class="plan-speed"><strong>${p.mbps}</strong><span>Mbps</span></div>
      <p class="plan-ideal">${p.ideal}</p>
      <div class="plan-price"><strong>${cop(p.precio)}</strong><span>al mes</span></div>
      <a class="btn ${p.destacado ? 'btn-yolk' : 'btn-outline'} btn-block" href="#contacto" data-service="fibra-optica" data-plan="${p.mbps}">Elegir ${p.mbps} Mbps</a>`;
    plansEl.append(card);
    planSelect.append(new Option(`${p.mbps} Mbps · ${cop(p.precio)}/mes`, `${p.mbps} Mbps - ${cop(p.precio)}/mes`));
  });
  planSelect.append(new Option('Aún no sé, quiero asesoría', 'Asesoría'));

  // ───────────────────────── Carrusel 3D de planes (solo móvil)
  (() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const cards = $$('.plan', plansEl);
    const dots = $('#planDots');
    const prev = $('#planPrev');
    const next = $('#planNext');
    const hint = $('#planHint');
    if (!cards.length) return;
    let active = Math.max(0, cards.findIndex((c) => c.classList.contains('plan-featured')));
    let on = false, startX = 0, startY = 0, drag = 0, dragging = false, moved = false;

    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', `Ver plan ${PLANES[i].mbps} Mbps`);
      d.addEventListener('click', () => go(i));
      dots.append(d);
    });

    const render = () => {
      const w = cards[0].offsetWidth || 300;
      cards.forEach((card, i) => {
        const off = i - active + drag / w;
        const abs = Math.abs(off);
        card.style.transform =
          `translateX(${off * 58}%) translateZ(${-abs * 160}px) rotateY(${-off * 34}deg) scale(${1 - Math.min(abs, 2) * 0.06})`;
        card.style.opacity = abs > 2.6 ? '0' : String(1 - Math.min(abs, 2) * 0.28);
        card.style.zIndex = String(100 - Math.round(abs * 10));
        card.classList.toggle('is-active', i === active);
        card.setAttribute('aria-hidden', String(i !== active));
      });
      [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === active)));
      prev.disabled = active === 0;
      next.disabled = active === cards.length - 1;
      hint.textContent = `Plan ${active + 1} de ${cards.length} · desliza para ver más`;
    };

    const go = (i) => { active = Math.max(0, Math.min(cards.length - 1, i)); drag = 0; render(); };
    const setHeight = () => { plansEl.style.height = Math.max(...cards.map((c) => c.offsetHeight)) + 'px'; };

    const enable = () => {
      if (on) return;
      on = true;
      plansEl.classList.add('is-carousel');
      setHeight();
      render();
    };
    const disable = () => {
      if (!on) return;
      on = false;
      plansEl.classList.remove('is-carousel');
      plansEl.style.height = '';
      cards.forEach((c) => { c.style.cssText = ''; c.classList.remove('is-active'); c.removeAttribute('aria-hidden'); });
    };

    plansEl.addEventListener('pointerdown', (e) => {
      if (!on || (e.pointerType === 'mouse' && e.button !== 0)) return;
      startX = e.clientX; startY = e.clientY; drag = 0; dragging = true; moved = false;
    });
    plansEl.addEventListener('pointermove', (e) => {
      if (!on || !dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (!moved && Math.abs(dx) < 8) return;
      if (!moved && Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // gesto vertical: dejar hacer scroll
      if (!moved) { moved = true; plansEl.classList.add('is-dragging'); plansEl.setPointerCapture(e.pointerId); }
      const edge = (active === 0 && dx > 0) || (active === cards.length - 1 && dx < 0);
      drag = edge ? dx * 0.35 : dx;
      render();
    });
    const end = () => {
      if (!on || !dragging) return;
      dragging = false;
      plansEl.classList.remove('is-dragging');
      const w = cards[0].offsetWidth;
      const steps = Math.abs(drag) > w * 0.18 ? Math.max(1, Math.round(Math.abs(drag) / w)) * -Math.sign(drag) : 0;
      go(active + steps);
    };
    plansEl.addEventListener('pointerup', end);
    plansEl.addEventListener('pointercancel', end);

    // Tocar una tarjeta lateral la trae al centro; tocar tras arrastrar no activa enlaces
    plansEl.addEventListener('click', (e) => {
      if (!on) return;
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      const card = e.target.closest('.plan');
      const i = cards.indexOf(card);
      if (i >= 0 && i !== active) { e.preventDefault(); e.stopPropagation(); go(i); }
    }, true);

    prev.addEventListener('click', () => go(active - 1));
    next.addEventListener('click', () => go(active + 1));
    plansEl.addEventListener('keydown', (e) => {
      if (!on) return;
      if (e.key === 'ArrowLeft') go(active - 1);
      if (e.key === 'ArrowRight') go(active + 1);
    });

    const apply = () => (mq.matches ? enable() : disable());
    mq.addEventListener('change', apply);
    window.addEventListener('resize', () => { if (on) { setHeight(); render(); } });
    apply();
  })();

  // ───────────────────────── Asesor de velocidad
  const advisorForm = $('#advisorForm');
  const advisorResult = $('#advisorResult');
  const recommend = () => {
    const people = Number(new FormData(advisorForm).get('people'));
    const uses = new FormData(advisorForm).getAll('use');
    const weights = { streaming: 40, work: 35, gaming: 40, cams: 30, business: 90 };
    let need = people * 30 + uses.reduce((s, u) => s + (weights[u] || 0), 0);
    if (people === 3) need += 20;
    const plan = PLANES.find((p) => p.mbps >= need) || PLANES[PLANES.length - 1];
    if (!plan) return;
    advisorResult.innerHTML = `
      <span>Te sugerimos</span>
      <strong>${plan.mbps} Mbps</strong>
      <small>${cop(plan.precio)} al mes · ${plan.ideal}</small>
      <a class="btn btn-yolk btn-sm" href="#contacto" data-service="fibra-optica" data-plan="${plan.mbps}">Quiero este plan</a>`;
  };
  advisorForm.addEventListener('change', recommend);
  recommend();

  // ───────────────────────── Vista en vivo (reloj)
  const clock = $('#liveClock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('es-CO', { hour12: false }); };
  tick();
  setInterval(tick, 1000);

  // ───────────────────────── Calculadora solar
  const bill = $('#bill');
  const billRange = $('#billRange');
  const solarForm = $('#solarForm');
  const parseMoney = (v) => Number(String(v).replace(/\D/g, '')) || 0;
  const calc = () => {
    const monthly = parseMoney(bill.value);
    const tariff = Math.max(100, Number($('#tariff').value) || 950);
    const hsp = Math.max(1, Number($('#hsp').value) || 4.5);
    const cover = Number(new FormData(solarForm).get('cover')) || 0.8;
    const kwhMonth = monthly / tariff;
    const target = kwhMonth * cover;
    const kwp = target / (hsp * 30 * 0.8); // 80 % de rendimiento del sistema
    const panels = Math.max(1, Math.ceil(kwp / 0.55));
    $('#outSaving').textContent = cop(target * tariff);
    $('#outYear').textContent = `${cop(target * tariff * 12)} al año`;
    $('#outKwp').textContent = `${(panels * 0.55).toFixed(1).replace('.', ',')} kWp`;
    $('#outPanels').textContent = panels;
    $('#outArea').textContent = `${Math.round(panels * 2.6)} m²`;
    $('#outKwh').textContent = `${Math.round(target).toLocaleString('es-CO')} kWh`;
    $('#solarCta').dataset.message = `Estudio solar: factura aprox. ${cop(monthly)}/mes, cubrir ${Math.round(cover * 100)}% (sistema estimado de ${(panels * 0.55).toFixed(1)} kWp, ${panels} paneles).`;
  };
  bill.addEventListener('input', () => {
    const n = parseMoney(bill.value);
    bill.value = n ? n.toLocaleString('es-CO') : '';
    billRange.value = Math.min(Math.max(n, billRange.min), billRange.max);
    calc();
  });
  billRange.addEventListener('input', () => { bill.value = Number(billRange.value).toLocaleString('es-CO'); calc(); });
  solarForm.addEventListener('input', calc);
  solarForm.addEventListener('submit', (e) => e.preventDefault());
  calc();

  // ───────────────────────── Video de cobertura
  const video = $('#coverageVideo');
  const soundBtn = $('#soundBtn');
  if (video) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (video.preload === 'none') video.preload = 'auto';
        if (!reduceMotion) video.play().catch(() => {});
      } else video.pause();
    }, { threshold: 0.4 }).observe(video);
    soundBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (video.paused) video.play().catch(() => {});
      soundBtn.textContent = video.muted ? 'Activar sonido' : 'Silenciar';
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
    });
  }

  // ───────────────────────── Formulario (LeadFlow)
  const form = $('#leadForm');
  const serviceSelect = $('#serviceSelect');
  const status = $('#formStatus');
  const submitBtn = $('#leadSubmit');
  const done = $('#leadDone');

  const syncFields = () => {
    const kind = new FormData(form).get('kind');
    const isQuote = kind === 'cotizacion';
    $('[data-show="plan"]', form).hidden = !(isQuote && serviceSelect.value === 'fibra-optica');
    $('[data-show="support"]', form).hidden = kind !== 'soporte';
    const msg = $('[name="message"]', form);
    msg.required = kind !== 'cotizacion';
    $('#messageLabel').textContent = {
      cotizacion: 'Cuéntanos más (opcional)',
      soporte: 'Describe la falla o el mantenimiento que necesitas',
      pqr: 'Describe tu queja o reclamo',
    }[kind];
  };
  form.addEventListener('change', syncFields);
  syncFields();

  // Botones que preparan el formulario (planes, servicios, cobertura)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-service], [data-plan]');
    if (!a) return;
    $('[name="kind"][value="cotizacion"]', form).checked = true;
    if (a.dataset.service) serviceSelect.value = a.dataset.service;
    if (a.dataset.plan) {
      const opt = [...planSelect.options].find((o) => o.value.startsWith(`${a.dataset.plan} Mbps`));
      if (opt) planSelect.value = opt.value;
    }
    if (a.dataset.barrio) $('#barrioInput').value = a.dataset.barrio;
    if (a.dataset.message) $('[name="message"]', form).value = a.dataset.message;
    syncFields();
    done.hidden = true;
    form.hidden = false;
    setTimeout(() => $('[name="name"]', form).focus({ preventScroll: true }), 600);
  });

  const endpointReady = () =>
    CFG.leadflowEndpoint && CFG.formKey && !/TU-PROYECTO|TU_FORM_KEY/.test(CFG.leadflowEndpoint + CFG.formKey);

  const buildPayload = () => {
    const fd = new FormData(form);
    const kind = fd.get('kind');
    const type = kind === 'soporte' ? fd.get('support_type') : kind;
    const payload = {
      form_key: CFG.formKey,
      type,
      name: fd.get('name').trim(),
      email: fd.get('email').trim(),
      phone: fd.get('phone').trim(),
      service: fd.get('service'),
      message: fd.get('message').trim(),
      opt_in: $('[name="opt_in"]', form).checked,
      website: fd.get('website'),
      barrio: fd.get('barrio').trim(),
      direccion: fd.get('direccion').trim(),
      origen: 'sitio-web',
    };
    if (kind === 'cotizacion' && fd.get('service') === 'fibra-optica') payload.plan = fd.get('plan');
    return payload;
  };

  const whatsappFallback = (p) => {
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const lines = [
      `Hola, soy ${p.name}.`,
      p.type === 'cotizacion' ? `Quiero cotizar: ${service}${p.plan ? ` (${p.plan})` : ''}.` : `Solicitud: ${p.type.replace(/_/g, ' ')} · ${service}.`,
      p.barrio && `Barrio/vereda: ${p.barrio}`,
      p.direccion && `Dirección: ${p.direccion}`,
      p.email && `Correo: ${p.email}`,
      p.message && `Detalle: ${p.message}`,
    ].filter(Boolean);
    return waLink(lines.join('\n'));
  };

  const showDone = (radicado) => {
    form.hidden = true;
    done.hidden = false;
    $('#doneTitle').textContent = radicado ? `Solicitud radicada: ${radicado}` : '¡Recibimos tu solicitud!';
    $('#doneText').textContent = radicado
      ? 'Te enviamos el número de radicado por WhatsApp y correo. Nuestro equipo técnico te contactará pronto.'
      : 'Revisa tu correo: te enviamos la información y el portafolio. Un asesor te escribirá por WhatsApp.';
    done.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const p = buildPayload();
    if (p.phone.replace(/\D/g, '').length < 10) {
      status.textContent = 'Escribe un número de WhatsApp de 10 dígitos.';
      status.classList.add('is-error');
      return;
    }

    if (!endpointReady()) {
      window.open(whatsappFallback(p), '_blank', 'noopener');
      showDone(null);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    try {
      const res = await fetch(CFG.leadflowEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(out.error || 'No pudimos enviar tu solicitud.'), { server: true });
      form.reset();
      syncFields();
      showDone(out.radicado);
    } catch (err) {
      status.classList.add('is-error');
      if (err.server) {
        status.textContent = err.message;
      } else {
        status.innerHTML = `No hay conexión con el servidor. <a href="${whatsappFallback(p)}" target="_blank" rel="noopener">Envíanos tu solicitud por WhatsApp</a>.`;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar solicitud';
    }
  });

  $('#leadAgain').addEventListener('click', () => { done.hidden = true; form.hidden = false; $('[name="name"]', form).focus(); });

  // ───────────────────────── Redes y año
  const ICONS = {
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    tiktok: '<path d="M15 3c.4 2.6 2 4.2 4.5 4.4v3.3a7.8 7.8 0 0 1-4.4-1.4v6.1A5.6 5.6 0 1 1 9.5 10v3.4a2.3 2.3 0 1 0 2.2 2.3V3Z"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>',
  };
  const socials = $('#socials');
  Object.entries(CFG.socials || {}).forEach(([k, url]) => {
    if (!url || !ICONS[k]) return;
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', k);
    a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
    socials.append(a);
  });
  $('#year').textContent = new Date().getFullYear();
})();
