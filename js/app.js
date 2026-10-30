/* ===== contador + louvor do dia + compartilhar ===== */
(function () {
  "use strict";

  const TARGET = new Date(2026, 11, 28, 8, 0, 0); // 28/12/2026 08h00 (hora local)
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");

  /* ---------- contador ---------- */
  function tick() {
    let ms = TARGET - new Date();
    const home = $("home");
    if (ms <= 0) {
      home.classList.add("its-today");
      $("d-days").textContent = "É hoje! 🎉";
      document.querySelector(".days-label").textContent = "BOA VIAGEM";
      $("d-hours").textContent = "🚌";
      $("d-mins").textContent = "🎄";
      $("d-secs").textContent = "❤️";
      return;
    }
    const d = Math.floor(ms / 864e5);
    const h = Math.floor(ms / 36e5) % 24;
    const m = Math.floor(ms / 6e4) % 60;
    const s = Math.floor(ms / 1e3) % 60;
    $("d-days").textContent = pad(d);
    $("d-hours").textContent = pad(h);
    $("d-mins").textContent = pad(m);
    $("d-secs").textContent = pad(s);
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }

  /* ---------- louvor do dia ---------- */
  function daysSinceEpochLocal() {
    const now = new Date();
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round(localMidnight.getTime() / 864e5);
  }

  function louvorDoDia() {
    return LOUVORES[daysSinceEpochLocal() % LOUVORES.length];
  }

  let shownLouvorDay = null;
  function renderLouvor() {
    const day = daysSinceEpochLocal();
    if (day === shownLouvorDay) return;
    shownLouvorDay = day;
    const l = louvorDoDia();
    $("louvor-title").textContent = `${l.t} — ${l.a}`;
    $("louvor-frame").src = `https://www.youtube-nocookie.com/embed/${l.id}?rel=0`;
    renderShare();
  }

  // vira o louvor à meia-noite, mesmo com a página aberta
  function scheduleMidnight() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
    setTimeout(() => { renderLouvor(); scheduleMidnight(); }, next - now);
  }

  /* ---------- compartilhar ---------- */
  function renderShare() {
    const l = louvorDoDia();
    const ms = TARGET - new Date();
    const d = Math.max(0, Math.floor(ms / 864e5));
    const h = Math.max(0, Math.floor(ms / 36e5) % 24);
    const countLine = ms <= 0
      ? "É HOJE! 🎉 Rumo a Marília! 🚌🎄"
      : d === 0
        ? `Faltam só *${h} hora${h === 1 ? "" : "s"}* para a nossa viagem a Marília! 🚌🎄`
        : `Faltam *${d} dia${d === 1 ? "" : "s"} e ${h}h* para a nossa viagem a Marília! 🚌🎄`;
    const msg =
      `${countLine}\n\n` +
      `🎵 Louvor de hoje: ${l.t} — ${l.a}\n` +
      `https://youtu.be/${l.id}\n\n` +
      `⏳ Acompanhe a contagem: ${location.origin}${location.pathname}`;
    $("share").href = "https://wa.me/?text=" + encodeURIComponent(msg);
  }

  /* ---------- abertura ---------- */
  const intro = $("intro");
  const home = $("home");
  const gate = $("start-gate");

  function endIntro() {
    if (typeof engine !== "undefined") engine.kill();
    if (window.IntroAnim) IntroAnim.stop();
    intro.classList.add("fading");
    home.classList.remove("hidden");
    sessionStorage.setItem("seenIntro", "1");
    setTimeout(() => intro.remove && intro.classList.add("hidden"), 950);
  }

  function startIntro() {
    intro.classList.remove("hidden", "fading");
    home.classList.add("hidden");
    gate.classList.remove("fading");
    // rearma o acelerador
    launched = false; holding = false; prog = 0;
    IntroAnim.build(); // o mapa já fica pronto atrás da tela do acelerador
  }

  /* ---------- acelerador: segurar até o motor pegar ---------- */
  const pedal = $("pedal");
  const needle = $("needle");
  const speedoNum = $("speedo-num");
  const speedoFill = $("speedo-fill");
  const fillLen = speedoFill.getTotalLength();
  speedoFill.style.strokeDasharray = fillLen;
  speedoFill.style.strokeDashoffset = fillLen;

  // tracinhos do velocímetro
  (function ticks() {
    const g = $("speedo-ticks");
    const ns = "http://www.w3.org/2000/svg";
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI - (Math.PI * i) / 8;
      const x1 = 110 + Math.cos(a) * 78, y1 = 118 - Math.sin(a) * 78;
      const x2 = 110 + Math.cos(a) * 70, y2 = 118 - Math.sin(a) * 70;
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", x1); l.setAttribute("y1", y1);
      l.setAttribute("x2", x2); l.setAttribute("y2", y2);
      g.appendChild(l);
    }
  })();

  /* ronco de motor de carro VELHO (Web Audio, sem arquivo) */
  const engine = (() => {
    let ctx, osc1, osc2, gain, filt, noise, noiseGain, lfo, started = false;
    function ensure() {
      if (started) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain(); gain.gain.value = 0;
      // bem abafado, como escapamento furado
      filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 260; filt.Q.value = 1.4;
      osc1 = ctx.createOscillator(); osc1.type = "sawtooth"; osc1.frequency.value = 38;
      osc2 = ctx.createOscillator(); osc2.type = "square"; osc2.frequency.value = 19;
      const o2g = ctx.createGain(); o2g.gain.value = 0.7;
      // chocalho/partida
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      noiseGain = ctx.createGain(); noiseGain.gain.value = 0;
      // "putt-putt": tremolo na cadência das explosões
      const trem = ctx.createGain(); trem.gain.value = 0.72;
      lfo = ctx.createOscillator(); lfo.type = "square"; lfo.frequency.value = 9;
      const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 0.28;
      lfo.connect(lfoDepth); lfoDepth.connect(trem.gain);
      osc1.connect(filt); osc2.connect(o2g); o2g.connect(filt);
      noise.connect(noiseGain); noiseGain.connect(filt);
      filt.connect(trem); trem.connect(gain); gain.connect(ctx.destination);
      osc1.start(); osc2.start(); noise.start(); lfo.start();
      started = true;
    }
    return {
      rev(p, t) { // p: 0..1, t: segundos segurando
        ensure();
        if (ctx.state === "suspended") ctx.resume();
        // engasgos fortes na partida, leves depois (motor velho nunca fica redondo)
        const sputter = Math.sin(t * 27) * 8 * (1 - p * 0.55) + Math.sin(t * 6.7) * 3;
        const f = 34 + p * 110 + sputter;
        osc1.frequency.setTargetAtTime(f, ctx.currentTime, 0.035);
        osc2.frequency.setTargetAtTime(f / 2, ctx.currentTime, 0.035);
        filt.frequency.setTargetAtTime(230 + p * 780, ctx.currentTime, 0.06);
        lfo.frequency.setTargetAtTime(8 + p * 24, ctx.currentTime, 0.05);
        gain.gain.setTargetAtTime(0.09 + p * 0.2, ctx.currentTime, 0.05);
        noiseGain.gain.setTargetAtTime(0.05 + 0.1 * (1 - p), ctx.currentTime, 0.05);
      },
      idleOff() {
        if (!started) return;
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.18);
        noiseGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      },
      launch() { // revada curta e silêncio ainda na tela de abertura
        if (!started) return;
        const now = ctx.currentTime;
        osc1.frequency.setTargetAtTime(165, now, 0.08);
        filt.frequency.setTargetAtTime(1100, now, 0.08);
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0.3, now, 0.06);
        gain.gain.setTargetAtTime(0, now + 0.3, 0.12); // mudo em ~0,8s
        noiseGain.gain.setTargetAtTime(0, now + 0.2, 0.08);
      },
      kill() { // corte imediato (pular / fim da abertura)
        if (!started) return;
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0, now, 0.05);
        noiseGain.gain.setTargetAtTime(0, now, 0.05);
      },
    };
  })();

  let holding = false, prog = 0, holdT = 0, launched = false, lastTs = 0;

  function gateFrame(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;
    if (holding) { holdT += dt; prog = Math.min(1, prog + dt / 1.6); }
    else prog = Math.max(0, prog - dt * 1.4);

    const ang = -90 + prog * 180;
    needle.setAttribute("transform", `rotate(${ang.toFixed(1)} 110 118)`);
    speedoNum.textContent = Math.round(prog * 160);
    speedoFill.style.strokeDashoffset = fillLen * (1 - prog);
    if (holding) engine.rev(prog, holdT); else if (prog > 0) engine.rev(prog * 0.4, holdT);

    if (prog >= 1 && !launched) {
      launched = true;
      engine.launch();
      if (navigator.vibrate) navigator.vibrate(60);
      pedal.classList.remove("holding");
      gate.classList.add("fading");
      IntroAnim.play(endIntro);
      return; // para o loop
    }
    if (prog <= 0 && !holding) { engine.idleOff(); gateRaf = null; return; }
    gateRaf = requestAnimationFrame(gateFrame);
  }
  let gateRaf = null;

  function holdStart(e) {
    if (launched) return;
    e.preventDefault();
    holding = true; holdT = 0;
    pedal.classList.add("holding");
    $("gate-hint").textContent = "segura firme… 🔥";
    if (!gateRaf) { lastTs = 0; gateRaf = requestAnimationFrame(gateFrame); }
  }
  function holdEnd() {
    if (launched) return;
    holding = false;
    pedal.classList.remove("holding");
    $("gate-hint").textContent = "aperte e segure até o motor pegar 🚐";
  }
  pedal.addEventListener("pointerdown", holdStart);
  pedal.addEventListener("pointerup", holdEnd);
  pedal.addEventListener("pointerleave", holdEnd);
  pedal.addEventListener("pointercancel", holdEnd);
  pedal.addEventListener("contextmenu", (e) => e.preventDefault());

  $("skip").addEventListener("click", endIntro);
  $("replay").addEventListener("click", () => {
    sessionStorage.removeItem("seenIntro");
    document.body.appendChild(intro);
    startIntro();
    window.scrollTo(0, 0);
  });

  /* ---------- go ---------- */
  renderLouvor();
  scheduleMidnight();
  tick();
  setInterval(renderShare, 60e3);

  if (sessionStorage.getItem("seenIntro")) {
    endIntro();
  } else {
    startIntro();
  }
})();
