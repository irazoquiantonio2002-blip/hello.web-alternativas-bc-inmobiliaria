/* ═══════════════════════════════════════════════════════════════
   ALTERNATIVA BC INMOBILIARIA — Interacciones
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Dato único de contacto: se reutiliza en toda la página */
  var WA_NUMBER = '526646241636'; // +52 664 624 1636
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1. PRELOADER — carga pausada y con carácter
  ───────────────────────────────────────────── */
  (function preloader() {
    var bar = document.querySelector('.loader-bar-fill');
    var pct = document.getElementById('loader-pct');
    var progress = 0;
    var done = false;

    var timer = setInterval(function () {
      // Avance irregular: se siente como carga real, no como una barra falsa
      progress += Math.random() * 9 + 3.5;
      if (progress >= 100) { progress = 100; clearInterval(timer); finish(); }
      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent = Math.floor(progress);
    }, 95);

    function finish() {
      if (done) return;
      done = true;
      // Espera mínima total ~2.4s para que la transición se aprecie
      setTimeout(function () {
        document.body.classList.add('loaded');
        document.body.classList.remove('is-locked');
        window.dispatchEvent(new Event('site:ready'));
      }, 520);
    }

    document.body.classList.add('is-locked');
    // Red de seguridad: nunca dejar al usuario atrapado en el loader
    setTimeout(finish, 6000);
  })();

  /* ─────────────────────────────────────────────
     2. AÑO DINÁMICO
  ───────────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─────────────────────────────────────────────
     3. NAVBAR: fondo al hacer scroll + progreso + sección activa
  ───────────────────────────────────────────── */
  var navbar = document.getElementById('navbar');
  var progressBar = document.getElementById('scroll-progress');
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (navbar) navbar.classList.toggle('scrolled', y > 40);

    if (progressBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }

    // Scrollspy
    var current = '';
    var mid = y + window.innerHeight * 0.32;
    sections.forEach(function (s) { if (s.offsetTop <= mid) current = s.id; });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });

    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ─────────────────────────────────────────────
     4. MENÚ MÓVIL
  ───────────────────────────────────────────── */
  var burger = document.getElementById('hamburger');
  var mobMenu = document.getElementById('mob-menu');
  if (burger && mobMenu) {
    var toggleMenu = function (open) {
      burger.classList.toggle('open', open);
      mobMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', function () {
      toggleMenu(!mobMenu.classList.contains('open'));
    });
    mobMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggleMenu(false); });
    });
    document.addEventListener('click', function (e) {
      if (!mobMenu.contains(e.target) && !burger.contains(e.target)) toggleMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggleMenu(false);
    });
  }

  /* ─────────────────────────────────────────────
     5. MARQUEE — se duplica para bucle continuo
  ───────────────────────────────────────────── */
  (function marquee() {
    var track = document.getElementById('marquee');
    if (!track) return;
    var items = [
      'Compra de Propiedades', 'Venta de Inmuebles', 'Renta y Arrendamiento',
      'Asesoría Personalizada', 'Conocimiento del Mercado Local',
      'Acompañamiento Legal', 'Avalúo y Valuación', 'Baja California'
    ];
    var html = items.map(function (t) {
      return '<span class="marquee-item"><i class="fa-solid fa-diamond"></i>' + t + '</span>';
    }).join('');
    track.innerHTML = html + html; // duplicado = bucle sin costura
  })();

  /* ─────────────────────────────────────────────
     6. REVEAL AL SCROLL + títulos palabra por palabra
  ───────────────────────────────────────────── */
  (function reveals() {
    // Divide títulos marcados en palabras animables.
    // Recorre en profundidad para respetar el marcado interno (<em>, <span>…).
    function splitNode(node) {
      var frag = document.createDocumentFragment();
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) { // nodo de texto
          child.textContent.split(/(\s+)/).forEach(function (chunk) {
            if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }
            var w = document.createElement('span');
            w.className = 'split-word';
            var inner = document.createElement('span');
            inner.textContent = chunk;
            w.appendChild(inner);
            frag.appendChild(w);
          });
        } else if (child.nodeType === 1) { // elemento: conserva la etiqueta
          var clone = child.cloneNode(false);
          clone.appendChild(splitNode(child));
          frag.appendChild(clone);
        }
      });
      return frag;
    }

    document.querySelectorAll('[data-split]').forEach(function (el) {
      var frag = splitNode(el);
      el.innerHTML = '';
      el.appendChild(frag);
      el.classList.add('split-ready');
      // Escalona la entrada de cada palabra
      el.querySelectorAll('.split-word > span').forEach(function (w, i) {
        w.style.transitionDelay = Math.min(i * 0.055, 1.1) + 's';
      });
    });

    var targets = document.querySelectorAll('.reveal, .split-ready');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach(function (t) { t.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ─────────────────────────────────────────────
     7. CONTADORES ANIMADOS (0 → valor final)
  ───────────────────────────────────────────── */
  (function counters() {
    var nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    function run(el) {
      var end = parseFloat(el.dataset.count || '0');
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      var dur = 1900, t0 = null;

      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        var val = Math.floor(end * eased);
        el.textContent = prefix + val.toLocaleString('es-MX') + suffix;
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = prefix + end.toLocaleString('es-MX') + suffix;
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window) || reduceMotion) {
      nums.forEach(function (n) {
        n.textContent = (n.dataset.prefix || '') +
          parseFloat(n.dataset.count || 0).toLocaleString('es-MX') + (n.dataset.suffix || '');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ─────────────────────────────────────────────
     8. MÁQUINA DE ESCRIBIR en el hero
  ───────────────────────────────────────────── */
  (function typewriter() {
    var el = document.getElementById('type-rotator');
    if (!el) return;
    var words = (el.dataset.words || '').split('|').filter(Boolean);
    if (!words.length) return;
    if (reduceMotion) { el.textContent = words[0]; return; }

    var i = 0, ch = 0, deleting = false;
    function tick() {
      var word = words[i];
      ch += deleting ? -1 : 1;
      el.textContent = word.substring(0, ch);

      var delay = deleting ? 45 : 88;
      if (!deleting && ch === word.length) { delay = 1900; deleting = true; }
      else if (deleting && ch === 0) { deleting = false; i = (i + 1) % words.length; delay = 320; }
      setTimeout(tick, delay);
    }
    window.addEventListener('site:ready', function () { setTimeout(tick, 260); }, { once: true });
  })();

  /* ─────────────────────────────────────────────
     9. PARTÍCULAS — hero y secciones
  ───────────────────────────────────────────── */
  function particleField(canvas, opts) {
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var w = 0, h = 0;
    var cfg = Object.assign({
      count: 46, maxR: 2.2, speed: 0.22, link: false, glow: true, alpha: 0.55
    }, opts || {});

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var n = Math.round(cfg.count * Math.min(w / 1280, 1.15));
      particles = [];
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * cfg.maxR + 0.55,
          vx: (Math.random() - 0.5) * cfg.speed,
          vy: -(Math.random() * cfg.speed + 0.06),
          a: Math.random() * cfg.alpha + 0.12,
          tw: Math.random() * Math.PI * 2
        });
      }
    }

    var raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);

      if (cfg.link) {
        for (var i = 0; i < particles.length; i++) {
          for (var j = i + 1; j < particles.length; j++) {
            var dx = particles[i].x - particles[j].x;
            var dy = particles[i].y - particles[j].y;
            var d2 = dx * dx + dy * dy;
            if (d2 < 15000) {
              ctx.strokeStyle = 'rgba(255,215,0,' + (0.10 * (1 - d2 / 15000)) + ')';
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.03;
        if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;

        var flick = p.a * (0.62 + Math.sin(p.tw) * 0.38);
        if (cfg.glow) {
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, 'rgba(255,215,0,' + flick + ')');
          g.addColorStop(1, 'rgba(255,215,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,235,150,' + Math.min(flick + 0.2, 1) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    // Pausa fuera de pantalla: ahorra batería en móvil
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!raf) draw(); }
          else { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 }).observe(canvas);
    }
  }

  particleField(document.getElementById('hero-canvas'), { count: 62, maxR: 2.4, link: true, alpha: .6 });
  document.querySelectorAll('.sec-particles').forEach(function (c) {
    particleField(c, { count: 26, maxR: 1.7, speed: 0.16, alpha: .38, glow: true });
  });

  /* ─────────────────────────────────────────────
     10. SPOTLIGHT que sigue al cursor (escritorio)
  ───────────────────────────────────────────── */
  (function spotlight() {
    var el = document.getElementById('spotlight');
    if (!el || reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    window.addEventListener('mousemove', function (e) {
      el.style.opacity = '1';
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    }, { passive: true });
    document.addEventListener('mouseleave', function () { el.style.opacity = '0'; });
  })();

  /* ─────────────────────────────────────────────
     11. FORMULARIO → WHATSAPP (nunca correo, nunca "cargando")
  ───────────────────────────────────────────── */
  (function waForm() {
    var form = document.getElementById('wa-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('f-name');
      var phone = document.getElementById('f-phone');
      var interest = document.getElementById('f-interest');
      var zone = document.getElementById('f-zone');
      var msg = document.getElementById('f-msg');

      var required = [name, msg];
      var ok = true;
      required.forEach(function (f) {
        var empty = !f.value.trim();
        f.classList.toggle('err', empty);
        if (empty && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;

      var lines = [
        'Hola, Alternativa BC Inmobiliaria.',
        '',
        'Mi nombre es ' + name.value.trim() + '.',
        'Me interesa: ' + interest.value + '.'
      ];
      if (zone && zone.value.trim()) lines.push('Zona de interés: ' + zone.value.trim() + '.');
      if (phone && phone.value.trim()) lines.push('Mi teléfono: ' + phone.value.trim() + '.');
      lines.push('', msg.value.trim(), '', '(Enviado desde el sitio web)');

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });

    form.querySelectorAll('.form-control').forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('err'); });
    });
  })();

  /* ─────────────────────────────────────────────
     12. Anclas suaves con compensación del navbar fijo
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = (navbar ? navbar.offsetHeight : 0) - 1;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

})();
