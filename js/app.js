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
    IntroAnim.build(); // o mapa já fica pronto atrás da tela do acelerador
  }

  $("pedal").addEventListener("click", () => {
    gate.classList.add("fading");
    IntroAnim.play(endIntro);
  });

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
