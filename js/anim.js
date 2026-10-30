/* ===== Abertura cinematográfica: Santos → Marília ===== */
(function () {
  "use strict";

  gsap.registerPlugin(MotionPathPlugin);

  const AV = (n) => `assets/busts/${n}.png`;
  // proporção largura/altura de cada busto (gerado pelo make_busts.py)
  const AR = {
    "m-menino": 0.803, "m-pai": 0.692, "m-bebe": 1.195, "m-mae": 0.639,
    "v-homem1": 0.519, "v-mulher1": 0.59, "v-homem2": 0.604,
    "v-mulher2": 0.726, "v-vovo": 0.670, "v-vo": 0.602, "v-menina": 0.761,
  };
  const bust = (n, cx, bottom, h, extra = "") =>
    `<image class="bust b-${n}" href="${AV(n)}" x="${cx - (h * AR[n]) / 2}" y="${bottom - h}" width="${h * AR[n]}" height="${h}" ${extra}/>`;

  /* ---------- geografia ---------- */
  const W = 2400, H = 1500;
  const SANTOS = { x: 1950, y: 1180 };
  const MARILIA = { x: 470, y: 420 };
  const ROAD = `M ${SANTOS.x} ${SANTOS.y}
    C 1800 1150 1760 1030 1600 970
    C 1430 905 1360 980 1190 915
    C 1000 840 1030 720 870 660
    C 700 600 720 540 600 490
    C 540 465 505 445 ${MARILIA.x} ${MARILIA.y}`;

  const CITIES = [
    { n: "São Paulo", x: 1510, y: 930 },
    { n: "Sorocaba", x: 1120, y: 890 },
    { n: "Botucatu", x: 835, y: 645 },
    { n: "Bauru", x: 545, y: 455 },
  ];

  function terrain() {
    const blobs = [
      [300, 1250, 420, 180, "#cbd6b2"], [900, 1100, 500, 200, "#d4ddbd"],
      [1700, 650, 430, 190, "#cbd6b2"], [600, 800, 460, 210, "#d8e0c3"],
      [1300, 420, 380, 170, "#d4ddbd"], [250, 500, 300, 160, "#d8e0c3"],
      [2050, 880, 330, 170, "#d4ddbd"], [1050, 250, 420, 160, "#dce3c9"],
    ];
    let s = blobs.map(([x, y, rx, ry, f]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" opacity=".8"/>`).join("");
    // rios
    s += `<path d="M 700 90 C 760 300 620 520 780 760 C 880 900 800 1060 900 1230" fill="none" stroke="#a9c9de" stroke-width="10" opacity=".65" stroke-linecap="round"/>
          <path d="M 1900 120 C 1830 330 1960 520 1840 700" fill="none" stroke="#a9c9de" stroke-width="8" opacity=".55" stroke-linecap="round"/>`;
    // matinhas
    const dots = [];
    const rnd = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647)(42);
    for (let i = 0; i < 90; i++) {
      const x = 120 + rnd() * 2160, y = 120 + rnd() * 1150;
      dots.push(`<circle cx="${x}" cy="${y}" r="${5 + rnd() * 9}" fill="#9db584" opacity=".5"/>`);
    }
    return s + dots.join("");
  }

  function serra() {
    // Serra do Mar acompanhando o litoral
    let s = "";
    for (let i = 0; i < 9; i++) {
      const x = 1530 + i * 95, y = 1065 - i * 8;
      const h = 58 + (i % 3) * 22;
      s += `<path d="M ${x - 60} ${y + 40} L ${x} ${y - h} L ${x + 60} ${y + 40} Z" fill="#8aa677" opacity=".85"/>
            <path d="M ${x - 8} ${y - h + 14} L ${x} ${y - h} L ${x + 14} ${y - h + 22} L ${x} ${y - h + 30} Z" fill="#f2f0e4" opacity=".9"/>`;
    }
    return `<g transform="rotate(-9 1900 1100)">${s}</g>`;
  }

  function label(x, y, text, big, dx, dy) {
    const w = text.length * (big ? 21 : 12) + (big ? 44 : 24);
    const hh = big ? 52 : 30;
    return `<g class="city-label" opacity="0">
      <line x1="${x}" y1="${y}" x2="${x + dx + (dx < 0 ? w : 0)}" y2="${y + dy + hh / 2}" stroke="#2a2f36" stroke-width="2.5" opacity=".8"/>
      <circle cx="${x}" cy="${y}" r="${big ? 10 : 6}" fill="#c84a3c" stroke="#fffdf6" stroke-width="3"/>
      <rect x="${x + dx}" y="${y + dy}" width="${w}" height="${hh}" rx="8" fill="#23282f" opacity=".93"/>
      <text x="${x + dx + w / 2}" y="${y + dy + hh / 2 + (big ? 8 : 5)}" text-anchor="middle"
        font-size="${big ? 26 : 15}" font-weight="700" letter-spacing="${big ? 3 : 1.5}" fill="#fffdf6">${text}</text>
    </g>`;
  }

  /* ---------- a van ---------- */
  function van() {
    return `
    <g id="van">
      <g id="van-bob">
        <g id="smoke"></g>
        <!-- bagageiro: bustos primeiro, malas na frente -->
        <g id="roof">
          ${bust("v-homem2", -34, -56, 92)}
          ${bust("v-mulher2", 38, -56, 94)}
          ${bust("v-menina", 112, -56, 76)}
          <rect x="-86" y="-62" width="252" height="8" rx="4" fill="#6b4a2f"/>
          <g transform="rotate(-3 -40 -78)"><rect x="-82" y="-96" width="76" height="36" rx="6" fill="#e2a23c" stroke="#9c6d22" stroke-width="3"/><rect x="-52" y="-96" width="8" height="36" fill="#9c6d22" opacity=".55"/></g>
          <g transform="rotate(2 40 -76)"><rect x="2" y="-90" width="70" height="30" rx="6" fill="#7fb6a4" stroke="#4e8070" stroke-width="3"/><rect x="30" y="-90" width="8" height="30" fill="#4e8070" opacity=".55"/></g>
          <g transform="rotate(-2 110 -72)"><rect x="82" y="-84" width="54" height="24" rx="5" fill="#a8744f" stroke="#6b4a2f" stroke-width="3"/></g>
        </g>
        <!-- carroceria -->
        <path d="M -175 40 L -175 -6 Q -174 -20 -158 -23 L -116 -27 Q -98 -56 -74 -58 L 148 -58 Q 170 -56 170 -34 L 170 40 Q 170 52 156 52 L -160 52 Q -175 52 -175 40 Z"
          fill="#f5e2b8" stroke="#7c4a33" stroke-width="4"/>
        <path d="M -175 10 L 170 10 L 170 40 Q 170 52 156 52 L -160 52 Q -175 52 -175 40 Z" fill="#c84a3c"/>
        <path d="M -175 10 L 170 10 L 170 17 L -175 17 Z" fill="#fffdf6" opacity=".85"/>
        <!-- janelas -->
        <path d="M -112 -22 L -72 -50 L -58 -50 L -58 -8 L -108 -8 Q -116 -8 -112 -22 Z" fill="#bfe0ee" stroke="#7c4a33" stroke-width="3.5"/>
        <clipPath id="cpw0"><path d="M -112 -22 L -72 -50 L -58 -50 L -58 -8 L -108 -8 Q -116 -8 -112 -22 Z"/></clipPath>
        <g clip-path="url(#cpw0)">${bust("v-vovo", -80, -4, 62)}</g>
        ${[["cpw1", -16, "v-vo"], ["cpw2", 56, "v-mulher1"], ["cpw3", 128, "v-homem1"]].map(([id, cx, who]) => `
          <rect x="${cx - 31}" y="-50" width="62" height="44" rx="8" fill="#bfe0ee" stroke="#7c4a33" stroke-width="3.5"/>
          <clipPath id="${id}"><rect x="${cx - 31}" y="-50" width="62" height="44" rx="8"/></clipPath>
          <g clip-path="url(#${id})">${bust(who, cx, -2, 58)}</g>`).join("")}
        <!-- detalhes -->
        <circle cx="-158" cy="2" r="11" fill="#ffd97a" stroke="#7c4a33" stroke-width="3.5"/>
        <rect x="-181" y="28" width="26" height="12" rx="5" fill="#cfc5ad" stroke="#7c4a33" stroke-width="3"/>
        <rect x="150" y="26" width="26" height="12" rx="5" fill="#cfc5ad" stroke="#7c4a33" stroke-width="3"/>
        <rect x="-150" y="24" width="30" height="9" rx="4" fill="#fffdf6" stroke="#7c4a33" stroke-width="2.5"/>
        <text x="-135" y="31.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#4a3f2e" letter-spacing="1">MAR-2512</text>
        <line x1="-54" y1="-4" x2="-54" y2="46" stroke="#7c4a33" stroke-width="3" opacity=".6"/>
        <circle cx="-64" cy="26" r="3.5" fill="#7c4a33"/>
        <!-- rodas -->
        <g class="wheel" transform="translate(-108 58)"><circle r="29" fill="#2e2a24"/><circle r="14" fill="#cfc5ad"/><path d="M 0 -11 V 11 M -11 0 H 11" stroke="#2e2a24" stroke-width="4"/></g>
        <g class="wheel" transform="translate(104 58)"><circle r="29" fill="#2e2a24"/><circle r="14" fill="#cfc5ad"/><path d="M 0 -11 V 11 M -11 0 H 11" stroke="#2e2a24" stroke-width="4"/></g>
      </g>
    </g>`;
  }

  /* ---------- recepção em Marília ---------- */
  function reception() {
    return `
    <g id="reception">
      <g class="xtree" transform="translate(95 352) scale(1.15)">
        <rect x="-8" y="52" width="16" height="20" rx="3" fill="#8a5a33"/>
        <path d="M0 -58 L34 -6 L14 -6 L42 34 L18 34 L48 70 L-48 70 L-18 34 L-42 34 L-14 -6 L-34 -6 Z" fill="#3d6b45" stroke="#2c5234" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="-16" cy="22" r="5" fill="#c84a3c"/><circle cx="18" cy="48" r="5" fill="#d9a62e"/>
        <circle cx="10" cy="12" r="4.5" fill="#d9a62e"/><circle cx="-22" cy="52" r="5" fill="#c84a3c"/>
        <path class="star" d="M0 -78 L5 -65 L19 -65 L8 -56 L12 -43 L0 -51 L-12 -43 L-8 -56 L-19 -65 L-5 -65 Z" fill="#e8b93c" stroke="#c89a25" stroke-width="2"/>
      </g>
      <g id="banner">
        <line x1="168" y1="238" x2="168" y2="310" stroke="#8a5a33" stroke-width="5"/>
        <line x1="390" y1="238" x2="390" y2="310" stroke="#8a5a33" stroke-width="5"/>
        <g id="banner-cloth">
          <path d="M 168 240 Q 279 260 390 240 L 390 282 Q 279 302 168 282 Z" fill="#fffdf6" stroke="#c84a3c" stroke-width="3.5"/>
          <text x="279" y="272" text-anchor="middle" font-size="24" font-weight="700" letter-spacing="2.5" fill="#c84a3c">BEM-VINDOS!</text>
        </g>
      </g>
      <g id="greeters">
        ${bust("m-pai", 204, 420, 105)}
        ${bust("m-mae", 274, 422, 98)}
        ${bust("m-menino", 334, 420, 80)}
        ${bust("m-bebe", 160, 418, 52)}
      </g>
      <rect x="154" y="404" width="262" height="28" rx="14" fill="#7fa06b"/>
      <rect x="144" y="412" width="282" height="26" rx="13" fill="#90b17a"/>
    </g>`;
  }

  /* ---------- SVG do mundo ---------- */
  const SVG = `
  <svg id="world" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" font-family="Montserrat, sans-serif">
    <defs>
      <pattern id="mapgrid" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M120 0H0V120" fill="none" stroke="#c9c3ab" stroke-width="1" opacity=".5"/>
      </pattern>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8fbdd6"/><stop offset="1" stop-color="#5e97ba"/>
      </linearGradient>
      <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="14"/>
      </filter>
      <mask id="trailmask">
        <path id="trail-reveal" d="${ROAD}" fill="none" stroke="#fff" stroke-width="60" stroke-linecap="round"/>
      </mask>
    </defs>

    <rect width="${W}" height="${H}" fill="#e9e5d2"/>
    <rect width="${W}" height="${H}" fill="url(#mapgrid)"/>
    ${terrain()}

    <!-- oceano -->
    <path d="M 2400 880 L 2400 1500 L 1040 1500 Q 1320 1465 1580 1375 Q 1910 1260 2160 1065 Q 2310 940 2400 880 Z" fill="url(#sea)"/>
    <path d="M 1250 1468 q 40 -18 80 0 q 40 18 80 0 M 1560 1390 q 40 -18 80 0 q 40 18 80 0 M 1900 1255 q 40 -18 80 0 M 2150 1070 q 40 -18 80 0" stroke="#dff0f7" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>
    <text x="1820" y="1408" font-size="34" letter-spacing="14" fill="#38719a" opacity=".75" font-style="italic" font-family="Cormorant Garamond, serif">OCEANO  ATLÂNTICO</text>

    ${serra()}

    <!-- Santos: cidadezinha na costa -->
    <g id="santos-town">
      <rect x="1880" y="1118" width="26" height="46" fill="#d8c088"/><rect x="1876" y="1108" width="34" height="10" fill="#c84a3c"/>
      <rect x="1914" y="1132" width="20" height="32" fill="#e3d4ac"/>
      <rect x="1848" y="1138" width="18" height="26" fill="#e3d4ac"/>
      <path d="M 1992 1150 l 0 -40 q 26 12 0 26" stroke="#8a5a33" stroke-width="5" fill="#c84a3c"/>
      <ellipse cx="1930" cy="1172" rx="95" ry="10" fill="#d9ce9f" opacity=".7"/>
    </g>

    <!-- cidades do caminho -->
    ${CITIES.map(c => `<g class="midcity" opacity="0"><circle cx="${c.x}" cy="${c.y}" r="5" fill="#6b655a"/><text x="${c.x + 14}" y="${c.y + 5}" font-size="17" font-weight="600" fill="#6b655a" letter-spacing="1">${c.n}</text></g>`).join("")}

    <!-- rota: prévia + rastro brilhante -->
    <path id="route-hint" d="${ROAD}" fill="none" stroke="#8d8471" stroke-width="5" stroke-dasharray="3 20" stroke-linecap="round" opacity="0"/>
    <g mask="url(#trailmask)">
      <path d="${ROAD}" fill="none" stroke="#49e85e" stroke-width="26" stroke-linecap="round" filter="url(#glow)" opacity=".85"/>
      <path d="${ROAD}" fill="none" stroke="#b9f7ae" stroke-width="8" stroke-linecap="round"/>
    </g>

    ${reception()}
    ${label(MARILIA.x, MARILIA.y, "MARÍLIA", true, 10, -160)}
    ${label(SANTOS.x, SANTOS.y, "SANTOS", true, -295, 6)}

    <g id="confetti"></g>
    <g id="van-holder">${van()}</g>

    <!-- nuvens -->
    <g class="cloud" opacity=".55" transform="translate(700 220)"><ellipse rx="85" ry="26" fill="#fff"/><ellipse cx="55" cy="-14" rx="55" ry="22" fill="#fff"/><ellipse cx="-60" cy="-8" rx="48" ry="18" fill="#fff"/></g>
    <g class="cloud" opacity=".45" transform="translate(1750 420)"><ellipse rx="75" ry="22" fill="#fff"/><ellipse cx="48" cy="-12" rx="48" ry="19" fill="#fff"/></g>
    <g class="cloud" opacity=".5" transform="translate(1150 1080)"><ellipse rx="65" ry="20" fill="#fff"/><ellipse cx="-42" cy="-10" rx="42" ry="16" fill="#fff"/></g>
  </svg>`;

  /* ---------- câmera ---------- */
  let svgEl = null;
  const cam = { x: SANTOS.x, y: SANTOS.y, w: 1200 };
  function applyCam() {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    let w = cam.w, h = w / aspect;
    if (h > H) { h = H; w = h * aspect; }
    if (w > W) { w = W; h = w / aspect; }
    const x = Math.max(0, Math.min(W - w, cam.x - w / 2));
    const y = Math.max(0, Math.min(H - h, cam.y - h / 2));
    svgEl.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  }

  let tl = null, puffTimer = null;

  function buildScene() {
    const holder = document.getElementById("map-holder");
    holder.innerHTML = SVG;
    svgEl = holder.querySelector("svg");
    applyCam();
    window.addEventListener("resize", applyCam);
  }

  function setCaption(txt) {
    const c = document.getElementById("cap");
    gsap.killTweensOf(c);
    if (!txt) { gsap.to(c, { opacity: 0, duration: 0.4 }); return; }
    gsap.fromTo(c, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.55 });
    c.textContent = txt;
  }

  function puff() {
    if (!svgEl) return;
    const g = svgEl.querySelector("#smoke");
    const ns = "http://www.w3.org/2000/svg";
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("r", 7 + Math.random() * 5);
    c.setAttribute("fill", "#efe9da");
    c.setAttribute("opacity", ".85");
    c.setAttribute("cx", 182); c.setAttribute("cy", 38);
    g.appendChild(c);
    gsap.to(c, { x: 60 + Math.random() * 40, y: -34 - Math.random() * 20, scale: 2.6, opacity: 0, duration: 1.4, ease: "power1.out", onComplete: () => c.remove() });
  }

  function confetti() {
    const g = svgEl.querySelector("#confetti");
    const colors = ["#c84a3c", "#3d6b45", "#d9a62e", "#7ea8c9", "#b08d3f", "#e8b93c"];
    const ns = "http://www.w3.org/2000/svg";
    for (let i = 0; i < 36; i++) {
      const r = document.createElementNS(ns, "rect");
      r.setAttribute("x", -5); r.setAttribute("y", -8);
      r.setAttribute("width", 10); r.setAttribute("height", 15);
      r.setAttribute("rx", 2.5);
      r.setAttribute("fill", colors[i % colors.length]);
      g.appendChild(r);
      gsap.fromTo(r,
        { x: 320, y: 320, rotation: 0, opacity: 1 },
        { x: 320 + gsap.utils.random(-300, 300), y: 320 + gsap.utils.random(-60, 310),
          rotation: gsap.utils.random(-420, 420), opacity: 0,
          duration: gsap.utils.random(1.3, 2.4), ease: "power2.out" });
    }
  }

  function play(onDone) {
    buildScene();
    const q = (s) => svgEl.querySelector(s);
    const qa = (s) => svgEl.querySelectorAll(s);

    const reveal = q("#trail-reveal");
    const L = reveal.getTotalLength();
    gsap.set(reveal, { strokeDasharray: L, strokeDashoffset: L });

    const vanEl = q("#van");
    const roadPath = { rawPath: MotionPathPlugin.getRawPath(ROAD) };
    MotionPathPlugin.cacheRawPathMeasurements(roadPath.rawPath);
    const posAt = (p) => MotionPathPlugin.getPositionOnPath(roadPath.rawPath, p);

    // van estacionada em Santos (rodas sobre a linha da estrada)
    const VS = 0.56;
    const LIFT = -52;
    gsap.set(vanEl, { x: SANTOS.x, y: SANTOS.y + LIFT, scale: VS, transformOrigin: "center bottom" });
    gsap.set(qa("#van .bust"), { scale: 0, transformOrigin: "50% 100%" });
    gsap.set("#banner-cloth", { scaleY: 0, svgOrigin: "279 244" });
    gsap.set(qa("#greeters .bust"), { y: 26, opacity: 0 });

    // nuvens ao vento o tempo todo
    qa(".cloud").forEach((c, i) => gsap.to(c, { x: 90 + i * 40, duration: 24 + i * 7, repeat: -1, yoyo: true, ease: "sine.inOut" }));

    const DRIVE = 7.2;
    tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: onDone });

    tl
      // 1) abertura: visão do litoral
      .set(cam, { x: SANTOS.x - 160, y: SANTOS.y - 140, w: 2000, onUpdate: applyCam })
      .from(svgEl, { opacity: 0, duration: 0.8 })
      .call(() => setCaption("Dezembro de 2026 · uma viagem em família"))
      .to(q("#route-hint"), { opacity: 0.5, duration: 0.8 }, "<")
      .to(qa(".city-label")[1], { opacity: 1, duration: 0.5 }, 0.7)
      // 2) zoom em Santos + embarque
      .to(cam, { x: SANTOS.x - 40, y: SANTOS.y - 60, w: 860, duration: 1.6, ease: "power2.inOut", onUpdate: applyCam }, 0.9)
      .call(() => setCaption("todo mundo a bordo! 🧳"))
      .to(qa("#van .bust"), {
        scale: 1, duration: 0.5, ease: "back.out(2.4)", stagger: 0.14,
        onStart: () => gsap.fromTo("#van-bob", { y: 0 }, { y: 2.5, duration: 0.09, repeat: 13, yoyo: true }),
      }, 2.2)
      // 3) partida
      .call(() => { setCaption("Santos ➜ Marília · lá vamos nós! 🎄"); puffTimer = setInterval(puff, 260); }, null, 4.1)
      .to(qa(".midcity"), { opacity: 1, duration: 0.6, stagger: 0.1 }, 4.4)
      .to(reveal, { strokeDashoffset: 0, duration: DRIVE, ease: "power1.inOut" }, "trip")
      .to(vanEl, {
        motionPath: { path: ROAD, autoRotate: false, offsetY: LIFT },
        duration: DRIVE, ease: "power1.inOut",
        onUpdate: function () {
          const p = this.ratio;
          const a = posAt(Math.max(0, p - 0.008));
          const b = posAt(Math.min(1, p + 0.008));
          const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
          // van anda para a esquerda: inclina suave conforme a estrada
          let tilt = ang + 180;
          if (tilt > 180) tilt -= 360;
          gsap.set(vanEl, { rotation: Math.max(-13, Math.min(13, -tilt * 0.45)) });
          const pos = posAt(p);
          cam.x = pos.x; cam.y = pos.y; applyCam();
        },
      }, "trip")
      .to(cam, { w: 980, duration: 1.4, ease: "power1.inOut", onUpdate: applyCam }, "trip")
      .to(qa("#van .wheel"), { rotation: -1440, transformOrigin: "center", duration: DRIVE, ease: "power1.inOut" }, "trip")
      .to(q("#van-bob"), { y: -3, duration: 0.2, repeat: Math.floor(DRIVE / 0.2) - 1, yoyo: true, ease: "sine.inOut" }, "trip")
      .call(() => setCaption("mais de 400 km de saudade pela frente…"), null, "trip+=2.8")
      // 4) chegada
      .call(() => { clearInterval(puffTimer); puffTimer = null; setCaption(null); })
      .to(cam, { x: 360, y: 390, w: 780, duration: 1.1, ease: "power2.inOut", onUpdate: applyCam })
      .to(qa(".city-label")[0], { opacity: 1, duration: 0.5 }, "<+=0.3")
      .call(() => setCaption("chegamos! 🎉 …quer dizer, falta pouco!"))
      .to(qa("#greeters .bust"), { y: 0, opacity: 1, duration: 0.55, ease: "back.out(2.6)", stagger: 0.13 })
      .to("#banner-cloth", { scaleY: 1, duration: 0.6, ease: "bounce.out" }, "<+=0.3")
      .to(q(".star"), { scale: 1.4, transformOrigin: "center", repeat: 3, yoyo: true, duration: 0.24 }, "<")
      .call(confetti)
      .to(qa("#greeters .bust"), { y: -9, duration: 0.24, repeat: 3, yoyo: true, ease: "sine.inOut", stagger: 0.08 }, "<+=0.2")
      .to({}, { duration: 1.5 });
  }

  function stop() {
    if (tl) { tl.kill(); tl = null; }
    if (puffTimer) { clearInterval(puffTimer); puffTimer = null; }
    setCaption(null);
  }

  window.IntroAnim = { play, stop };
})();
