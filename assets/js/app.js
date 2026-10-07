/* =====================================================================
   APP — the engine. Reads CONTENT, applies theme + phase, runs motion
   and the (mock) RSVP / ucapan / calendar. No framework, no build step.

   URL switches for previewing:
     ?theme=awan|melur|malam   ?phase=pre|day|post   ?to=Pak%20Ali   ?nointro
   ===================================================================== */
(function () {
  'use strict';

  var C = window.CONTENT;
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var get = function (path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, C); };

  /* ---------- 1. Theme ---------- */
  var theme = params.get('theme') || C.theme;
  root.dataset.theme = theme;
  var tc = $('meta[name="theme-color"]');
  if (tc) tc.content = getComputedStyle(root).getPropertyValue('--bg').trim();

  /* ---------- 2. Bind content ---------- */
  $$('[data-bind]').forEach(function (el) { var v = get(el.dataset.bind); if (v != null) el.textContent = v; });
  $$('[data-href]').forEach(function (el) { var v = get(el.dataset.href); if (v) el.href = v; });

  function renderList(listEl, tplEl, items, fill) {
    listEl.textContent = '';
    items.forEach(function (it) { var node = tplEl.content.firstElementChild.cloneNode(true); fill(node, it); listEl.appendChild(node); });
  }
  renderList($('#schedule'), $('#tplSchedule'), C.schedule, function (li, s) {
    li.children[0].textContent = s.time; li.children[1].textContent = s.label;
  });
  renderList($('#contacts'), $('#tplContact'), C.contacts, function (a, c) {
    a.href = 'https://wa.me/' + (c.phone || '');
    a.children[0].textContent = c.name + ' · ' + c.role;
  });

  /* ---------- 3. Personal greeting (?to=) ---------- */
  var guest = (params.get('to') || '').trim().slice(0, 60);
  if (guest) {
    $$('[data-guest]').forEach(function (el) { el.textContent = guest; });
    $$('[data-guest-line]').forEach(function (el) { el.hidden = false; });
  }

  /* ---------- 4. Phase: pre → day → post ---------- */
  var START = new Date(C.event.start).getTime();
  var END = new Date(C.event.end).getTime();
  function getPhase(now) {
    var dayStart = new Date(START); dayStart.setHours(0, 0, 0, 0);
    if (now < dayStart.getTime()) return 'pre';
    if (now <= END + 2 * 3600e3) return 'day';
    return 'post';
  }
  var phase = params.get('phase') || getPhase(Date.now());
  root.dataset.phase = phase;
  $$('[data-phase]').forEach(function (el) {
    if (el === root) return;
    el.hidden = el.dataset.phase.split(' ').indexOf(phase) === -1;
  });

  /* ---------- 5. Intro → cover → open ---------- */
  var cover = $('#cover'), intro = $('#intro');
  var introOn = C.features.intro && !reduced && !params.has('nointro');
  var introTimers = [];

  function buildLoom() {
    var loom = $('#loom'), frag = document.createDocumentFragment(), i, j, el;
    for (i = 0; i < 13; i++) {
      el = document.createElement('div');
      el.className = i % 2 ? 'warp u' : 'warp';
      el.style.left = (15 + i * 30) + 'px';
      el.style.animationDelay = (i * 0.06) + 's';
      frag.appendChild(el);
    }
    for (j = 0; j < 28; j++) {
      el = document.createElement('div');
      el.className = j % 2 ? 'weft r' : 'weft';
      el.style.top = (15 + j * 30) + 'px';
      el.style.animationDelay = (1 + j * 0.03) + 's';
      frag.appendChild(el);
    }
    for (i = 0; i < 13; i++) for (j = 0; j < 28; j++) {
      if ((i + j) % 2) continue;
      var x = 15 + i * 30, y = 15 + j * 30;
      var dist = Math.sqrt(Math.pow(x - 195, 2) + Math.pow(y - 422, 2)) / 465;
      el = document.createElement('div');
      el.className = (i + j) % 4 === 0 ? 'dia s' : 'dia';
      el.style.left = (x - 3.5) + 'px';
      el.style.top = (y - 3.5) + 'px';
      el.style.animationDelay = (1.7 + dist * 1.2).toFixed(2) + 's';
      frag.appendChild(el);
    }
    loom.appendChild(frag);
  }

  function readyCover() { cover.classList.add('is-ready'); }
  function endIntro() {
    introTimers.forEach(clearTimeout);
    intro.hidden = true;
    readyCover();
  }

  if (introOn) {
    buildLoom();
    intro.hidden = false;
    introTimers.push(setTimeout(readyCover, 4300));
    introTimers.push(setTimeout(endIntro, 5400));
    $('#skipIntro').addEventListener('click', endIntro);
  } else {
    readyCover();
  }

  var audio = $('#audio'), musicBtn = $('#musicBtn');
  function setMusic(on) {
    musicBtn.classList.toggle('is-playing', on);
    musicBtn.setAttribute('aria-label', on ? 'Matikan muzik' : 'Mainkan muzik');
    if (!C.music || !C.music.src) return;
    if (!audio.src) audio.src = C.music.src;
    if (on) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } else { audio.pause(); }
  }
  musicBtn.addEventListener('click', function () { setMusic(!musicBtn.classList.contains('is-playing')); });

  $('#openBtn').addEventListener('click', function () {
    cover.classList.add('is-lifting');
    document.body.classList.remove('is-locked');
    window.scrollTo(0, 0);
    musicBtn.hidden = false;
    setMusic(true);                       // the tap is the user gesture browsers need for audio
    startPetals();
    setTimeout(function () { cover.hidden = true; }, 1150);
  });

  /* ---------- 6. Hujan bunga ---------- */
  function startPetals() {
    if (!C.features.petals || reduced || phase === 'day') return;
    var box = $('#petals'), ns = 'http://www.w3.org/2000/svg';
    var petalSvg = '<g><circle cx="10" cy="4.6" r="3.6"/><circle cx="15.2" cy="8.4" r="3.6"/><circle cx="13.2" cy="14.4" r="3.6"/><circle cx="6.8" cy="14.4" r="3.6"/><circle cx="4.8" cy="8.4" r="3.6"/></g><circle class="core" cx="10" cy="10" r="1.8"/>';
    for (var k = 0; k < 22; k++) {
      var s = document.createElementNS(ns, 'svg');
      s.setAttribute('viewBox', '0 0 20 20');
      s.setAttribute('class', ['petal', 'petal b', 'petal c'][k % 3]);
      s.innerHTML = petalSvg;
      var size = 16 + (k * 53) % 11;
      s.style.left = (2 + ((k * 37) % 100) * 0.94).toFixed(1) + '%';
      s.style.width = s.style.height = size + 'px';
      s.style.animationDuration = (8 + ((k * 29) % 7) * 0.9).toFixed(1) + 's';
      s.style.animationDelay = (k < 10 ? k * 0.15 : 1.5 + (k - 10) * 0.6).toFixed(2) + 's';
      box.appendChild(s);
    }
  }

  /* ---------- 7. Countdown ---------- */
  var cd = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
  function tick() {
    var diff = Math.max(0, START - Date.now());
    cd.d.textContent = Math.floor(diff / 864e5);
    cd.h.textContent = Math.floor(diff / 36e5) % 24;
    cd.m.textContent = Math.floor(diff / 6e4) % 60;
    cd.s.textContent = Math.floor(diff / 1e3) % 60;
  }
  if (phase === 'pre') { tick(); setInterval(tick, 1000); }

  /* ---------- 8. Scroll: progress line, active nav, reveals ---------- */
  var bar = $('#progress');
  var navLinks = $$('#nav a');
  var targets = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
      var active = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < innerHeight * 0.5) active = i; });
      navLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 9. Calendar sheet ---------- */
  var sheet = $('#calSheet');
  function fmtUtc(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  var calTitle = 'Walimatul Urus ' + C.couple.a + ' & ' + C.couple.b;
  var calPlace = C.venue.name + ', ' + C.venue.address;
  $('#gcalLink').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(calTitle) +
    '&dates=' + fmtUtc(START) + '/' + fmtUtc(END) +
    '&location=' + encodeURIComponent(calPlace) +
    '&details=' + encodeURIComponent(location.href.split('?')[0]);
  $('#icsBtn').addEventListener('click', function () {
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//hazwanwedding//MS', 'BEGIN:VEVENT',
      'UID:' + START + '@hazwanwedding', 'DTSTAMP:' + fmtUtc(Date.now()),
      'DTSTART:' + fmtUtc(START), 'DTEND:' + fmtUtc(END),
      'SUMMARY:' + calTitle, 'LOCATION:' + calPlace, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'walimatul-urus.ics';
    a.click();
  });
  $('#calBtn').addEventListener('click', function () { sheet.hidden = false; });
  $$('[data-close]', sheet).forEach(function (b) { b.addEventListener('click', function () { sheet.hidden = true; }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') sheet.hidden = true; });

  /* ---------- 10. RSVP (mock — swap submitRsvp() for the GAS call later) ---------- */
  var rsvp = { att: 'hadir', pax: 2 };
  var form = $('#rsvpForm'), nameIn = $('#rsvpName'), err = $('#rsvpErr'), paxOut = $('#pax');
  $$('.toggle button', form).forEach(function (b) {
    b.addEventListener('click', function () {
      rsvp.att = b.dataset.att;
      $$('.toggle button', form).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $('#paxRow').hidden = rsvp.att !== 'hadir';
    });
  });
  $('#paxDec').addEventListener('click', function () { rsvp.pax = Math.max(1, rsvp.pax - 1); paxOut.textContent = rsvp.pax; });
  $('#paxInc').addEventListener('click', function () { rsvp.pax = Math.min(C.rsvp.maxPax, rsvp.pax + 1); paxOut.textContent = rsvp.pax; });
  nameIn.addEventListener('input', function () { err.hidden = true; $('#rsvpNameField').classList.remove('is-error'); });

  function submitRsvp(payload) {
    // TODO(GAS): return fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
    return new Promise(function (res) { setTimeout(res, 1000); });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameIn.value.trim();
    if (!name) { err.hidden = false; $('#rsvpNameField').classList.add('is-error'); nameIn.focus(); return; }
    var btn = $('#rsvpSubmit');
    btn.disabled = true;
    btn.innerHTML = '<svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9"/></svg>Menghantar…';
    submitRsvp({ name: name, att: rsvp.att, pax: rsvp.att === 'hadir' ? rsvp.pax : 0, to: guest }).then(function () {
      btn.disabled = false; btn.textContent = 'Sahkan Kehadiran';
      $('#rsvpThanksName').textContent = name;
      $('#rsvpSummary').textContent = rsvp.att === 'hadir'
        ? 'Kami nantikan kehadiran ' + rsvp.pax + ' orang.'
        : 'Terima kasih kerana memaklumkan. Doa anda amat bermakna.';
      form.hidden = true; $('#rsvpDone').hidden = false;
    });
  });
  $('#rsvpEdit').addEventListener('click', function () { $('#rsvpDone').hidden = true; form.hidden = false; });

  /* ---------- 11. Ucapan (mock — stays in this browser until GAS is wired) ---------- */
  var wishes = [];
  var wText = $('#wishText'), wName = $('#wishName'), wSubmit = $('#wishSubmit');
  function syncWishBtn() {
    var ready = wText.value.trim().length > 0;
    wSubmit.classList.toggle('btn--solid', ready);
    $('#wishLen').textContent = wText.value.length;
  }
  wText.addEventListener('input', syncWishBtn);
  $('#wishForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = wText.value.trim();
    if (!text) { wText.focus(); return; }
    wishes.unshift({ name: wName.value.trim() || 'Tetamu', text: text });
    var node = $('#tplWish').content.firstElementChild.cloneNode(true);
    node.querySelector('q').textContent = text;
    node.querySelector('small').textContent = wishes[0].name + ' · baru sahaja';
    $('#wishes').prepend(node);
    $('#wishCount').textContent = wishes.length;
    $('#wishEmpty').hidden = true;
    wText.value = ''; syncWishBtn();
  });
})();
