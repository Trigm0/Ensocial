// ---------- Sticky nav shadow ----------
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Mobile menu ----------
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});
links.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// ---------- Scroll-triggered reveal ----------
const revealables = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
revealables.forEach((el) => io.observe(el));

// ---------- Odometer metric counters ----------
const buildOdometer = (el) => {
  const value = String(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  el.innerHTML = "";
  el.classList.add("odometer");
  for (const ch of value) {
    if (/[0-9]/.test(ch)) {
      const col = document.createElement("span");
      col.className = "odo-col";
      const inner = document.createElement("span");
      inner.className = "odo-col-inner";
      for (let i = 0; i <= 9; i++) {
        const d = document.createElement("span");
        d.textContent = i;
        inner.appendChild(d);
      }
      col.appendChild(inner);
      col.dataset.target = ch;
      el.appendChild(col);
    } else {
      const sep = document.createElement("span");
      sep.className = "odo-sep";
      sep.textContent = ch;
      el.appendChild(sep);
    }
  }
  if (suffix) {
    const s = document.createElement("span");
    s.className = "odo-suffix";
    s.textContent = suffix;
    el.appendChild(s);
  }
};

const rollOdometer = (el) => {
  const cols = el.querySelectorAll(".odo-col");
  cols.forEach((col, i) => {
    const target = Number(col.dataset.target);
    const inner = col.querySelector(".odo-col-inner");
    setTimeout(() => {
      inner.style.transform = `translateY(-${target}em)`;
    }, i * 110);
  });
};

document.querySelectorAll(".metric strong[data-count]").forEach(buildOdometer);

const metricsStrip = document.querySelector(".metrics");
if (metricsStrip) {
  const metricIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          const metrics = entry.target.querySelectorAll(".metric strong[data-count]");
          metrics.forEach((el, i) => {
            setTimeout(() => rollOdometer(el), i * 180);
          });
          metricIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );
  metricIO.observe(metricsStrip);
}

// ---------- Contact form ----------
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  status.classList.remove("error");
  const data = Object.fromEntries(new FormData(form));
  if (!data.name || !data.email || !data.message) {
    status.textContent = "Please fill in name, email, and message.";
    status.classList.add("error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    status.textContent = "That email doesn't look right — mind checking it?";
    status.classList.add("error");
    return;
  }
  console.log("Form submitted:", data);
  status.textContent = `Thanks, ${data.name.split(" ")[0]} — we'll reply within 48 hours.`;
  form.reset();
});

// ---------- 3D tilt + cursor spotlight ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

const attachTilt = (el, maxTilt = 9) => {
  let raf = 0;
  let pending = null;

  const apply = () => {
    if (!pending) return;
    const { x, y, w, h } = pending;
    const rx = ((y / h) - 0.5) * -2 * maxTilt;
    const ry = ((x / w) - 0.5) *  2 * maxTilt;
    el.style.setProperty("--rx", rx + "deg");
    el.style.setProperty("--ry", ry + "deg");
    el.style.setProperty("--mx", (x / w * 100) + "%");
    el.style.setProperty("--my", (y / h * 100) + "%");
    raf = 0;
  };

  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    pending = {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      w: r.width,
      h: r.height,
    };
    if (!raf) raf = requestAnimationFrame(apply);
  });

  el.addEventListener("mouseleave", () => {
    pending = null;
    if (raf) cancelAnimationFrame(raf), raf = 0;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  });
};

// ---------- Magnetic buttons ----------
const attachMagnetic = (btn, strength = 0.3) => {
  let raf = 0;
  let pending = null;

  const apply = () => {
    if (!pending) return;
    btn.style.setProperty("--bx", pending.x + "px");
    btn.style.setProperty("--by", pending.y + "px");
    raf = 0;
  };

  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    pending = {
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
    };
    if (!raf) raf = requestAnimationFrame(apply);
  });

  btn.addEventListener("mouseleave", () => {
    pending = null;
    if (raf) cancelAnimationFrame(raf), raf = 0;
    btn.style.setProperty("--bx", "0px");
    btn.style.setProperty("--by", "0px");
  });
};

if (!reduceMotion && !isTouch) {
  document.querySelectorAll(".svc, .case").forEach((el) => attachTilt(el, 8));
  document.querySelectorAll(".btn").forEach((el) => attachMagnetic(el, 0.25));
}

// ---------- Interactive particle field behind contact form ----------
(function initCtaField() {
  const canvas = document.getElementById("ctaCanvas");
  const section = document.getElementById("contact");
  if (!canvas || !section) return;

  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999, active: false };
  let dots = [];
  let w = 0, h = 0;
  const spacing = 34;
  const radius = 180;

  const resize = () => {
    const r = section.getBoundingClientRect();
    w = r.width; h = r.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const offX = (w - (cols - 1) * spacing) / 2;
    const offY = (h - (rows - 1) * spacing) / 2;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dots.push({
          baseX: offX + i * spacing,
          baseY: offY + j * spacing,
          x: offX + i * spacing,
          y: offY + j * spacing,
        });
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const dx = d.baseX - mouse.x;
      const dy = d.baseY - mouse.y;
      const dist = Math.hypot(dx, dy);
      const t = mouse.active ? Math.max(0, 1 - dist / radius) : 0;
      const push = t * 18;
      const ang = Math.atan2(dy, dx);
      d.x += ((d.baseX + Math.cos(ang) * push) - d.x) * 0.18;
      d.y += ((d.baseY + Math.sin(ang) * push) - d.y) * 0.18;
      const alpha = 0.1 + t * 0.85;
      const size = 1 + t * 2.4;
      ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  section.addEventListener("mousemove", (e) => {
    const r = section.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
    section.style.setProperty("--cx", (mouse.x / r.width * 100) + "%");
    section.style.setProperty("--cy", (mouse.y / r.height * 100) + "%");
  });
  section.addEventListener("mouseleave", () => { mouse.active = false; });

  window.addEventListener("resize", resize);
  resize();
  if (!reduceMotion) draw();
  else {
    // draw once so dots are still visible at base opacity
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      ctx.fillStyle = "rgba(167, 139, 250, 0.12)";
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
})();

// ---------- Hero water ripple (WebGL) ----------
(function initHeroRipple() {
  const canvas = document.getElementById("heroRipple");
  const hero = document.getElementById("hero");
  if (!canvas || !hero || reduceMotion) return;

  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) return;

  const SIM = 256;
  const DAMPING = 0.97;
  const DROP_RADIUS = 3;
  const DROP_STRENGTH = 0.4;

  let w = 0, h = 0;
  let current = new Float32Array(SIM * SIM);
  let previous = new Float32Array(SIM * SIM);
  const texture = new Float32Array(SIM * SIM * 4);

  const vertSrc = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform vec2 u_resolution;
    void main() {
      vec4 data = texture2D(u_tex, v_uv);
      float h = data.r;
      float dx = texture2D(u_tex, v_uv + vec2(1.0 / ${SIM}.0, 0.0)).r
               - texture2D(u_tex, v_uv - vec2(1.0 / ${SIM}.0, 0.0)).r;
      float dy = texture2D(u_tex, v_uv + vec2(0.0, 1.0 / ${SIM}.0)).r
               - texture2D(u_tex, v_uv - vec2(0.0, 1.0 / ${SIM}.0)).r;
      float light = 0.0;
      light += clamp(dx * 6.0, -1.0, 1.0);
      light += clamp(dy * 6.0, -1.0, 1.0);
      float base = 0.0;
      float bright = base + light * 0.7;
      vec3 purple = vec3(0.486, 0.227, 0.929);
      vec3 purpleLight = vec3(0.655, 0.545, 0.98);
      vec3 col = mix(purple, purpleLight, clamp(bright + 0.3, 0.0, 1.0));
      float alpha = abs(h) * 3.0 + abs(light) * 0.6;
      alpha = clamp(alpha, 0.0, 0.45);
      col += vec3(1.0) * clamp(light * 0.5, 0.0, 1.0);
      gl_FragColor = vec4(col, alpha);
    }
  `;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const uRes = gl.getUniformLocation(prog, "u_resolution");

  const resize = () => {
    const r = hero.getBoundingClientRect();
    w = r.width; h = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  window.addEventListener("resize", resize);
  resize();

  const drop = (nx, ny) => {
    const cx = Math.floor(nx * SIM);
    const cy = Math.floor(ny * SIM);
    for (let dx = -DROP_RADIUS; dx <= DROP_RADIUS; dx++) {
      for (let dy = -DROP_RADIUS; dy <= DROP_RADIUS; dy++) {
        const px = cx + dx;
        const py = cy + dy;
        if (px < 0 || px >= SIM || py < 0 || py >= SIM) continue;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > DROP_RADIUS) continue;
        const falloff = 1 - dist / DROP_RADIUS;
        current[py * SIM + px] += DROP_STRENGTH * falloff * falloff;
      }
    }
  };

  const stepSim = () => {
    for (let y = 1; y < SIM - 1; y++) {
      for (let x = 1; x < SIM - 1; x++) {
        const i = y * SIM + x;
        const avg = (
          current[i - 1] + current[i + 1] +
          current[i - SIM] + current[i + SIM]
        ) * 0.5 - previous[i];
        previous[i] = avg * DAMPING;
      }
    }
    const tmp = current;
    current = previous;
    previous = tmp;
  };

  const hasFloat = !!gl.getExtension("OES_texture_float");
  const texU8 = hasFloat ? null : new Uint8Array(SIM * SIM * 4);

  const uploadTexture = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (hasFloat) {
      for (let i = 0; i < SIM * SIM; i++) {
        const v = current[i] * 0.5 + 0.5;
        texture[i * 4] = v;
        texture[i * 4 + 1] = v;
        texture[i * 4 + 2] = v;
        texture[i * 4 + 3] = 1;
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM, SIM, 0, gl.RGBA, gl.FLOAT, texture);
    } else {
      for (let i = 0; i < SIM * SIM; i++) {
        const v = Math.max(0, Math.min(255, (current[i] * 0.5 + 0.5) * 255)) | 0;
        texU8[i * 4] = v;
        texU8[i * 4 + 1] = v;
        texU8[i * 4 + 2] = v;
        texU8[i * 4 + 3] = 255;
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM, SIM, 0, gl.RGBA, gl.UNSIGNED_BYTE, texU8);
    }
  };

  let lastDrop = 0;
  const autoDropInterval = 2200;

  const loop = () => {
    stepSim();
    stepSim();

    const now = performance.now();
    if (now - lastDrop > autoDropInterval) {
      drop(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.7);
      lastDrop = now;
    }

    uploadTexture();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
  };

  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = 1 - (e.clientY - r.top) / r.height;
    drop(nx, ny);
  });

  hero.addEventListener("click", (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = 1 - (e.clientY - r.top) / r.height;
    for (let i = 0; i < 3; i++) {
      drop(nx + (Math.random() - 0.5) * 0.05, ny + (Math.random() - 0.5) * 0.05);
    }
  });

  hero.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const r = hero.getBoundingClientRect();
    const nx = (touch.clientX - r.left) / r.width;
    const ny = 1 - (touch.clientY - r.top) / r.height;
    drop(nx, ny);
  }, { passive: true });

  hero.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const r = hero.getBoundingClientRect();
    const nx = (touch.clientX - r.left) / r.width;
    const ny = 1 - (touch.clientY - r.top) / r.height;
    drop(nx, ny);
  }, { passive: true });

  drop(0.5, 0.5);
  drop(0.3, 0.6);
  drop(0.7, 0.4);
  lastDrop = performance.now();

  requestAnimationFrame(loop);
})();

// ---------- Scroll progress bar ----------
(function initScrollProgress() {
  const bar = document.getElementById("scrollBar");
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = pct + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// ---------- Custom cursor ----------
(function initCursor() {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring || isTouch || reduceMotion) return;

  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  const loop = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  const hoverable = "a, button, .btn, .faq-q, .svc, .case, .metric, .marquee-slide span, input, textarea, summary, .floating-cta";
  document.querySelectorAll(hoverable).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      dot.classList.add("is-hover");
      ring.classList.add("is-hover");
    });
    el.addEventListener("mouseleave", () => {
      dot.classList.remove("is-hover");
      ring.classList.remove("is-hover");
    });
  });

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });
})();

// ---------- The Difference scrubber ----------
(function initScrubber() {
  const input = document.getElementById("scrubInput");
  const dayValue = document.getElementById("dayValue");
  const sliderFill = document.getElementById("sliderFill");
  const mediafyFill = document.getElementById("mediafyFill");
  const tradFill = document.getElementById("tradFill");
  const mediafyStatus = document.getElementById("mediafyStatus");
  const tradStatus = document.getElementById("tradStatus");
  const playBtn = document.getElementById("playBtn");
  const playLabel = document.getElementById("playLabel");
  if (!input) return;

  const lanes = document.querySelectorAll("#difference .lane");
  const maxDay = 30;
  const mediafyComplete = 5;

  const mediafyScript = [
    { day: 0, text: "Ready on day 1." },
    { day: 1, text: "Strategy locked." },
    { day: 2, text: "Creative shipped." },
    { day: 4, text: "Campaign deployed." },
    { day: 5, text: "Shipped. Iterating weekly." },
  ];
  const tradScript = [
    { day: 0, text: "Scheduling kickoff." },
    { day: 4, text: "Kickoff meetings done." },
    { day: 10, text: "Drafting strategy deck." },
    { day: 20, text: "Reviewing creative v3." },
    { day: 28, text: "Final approvals in flight." },
    { day: 30, text: "Shipped. Monthly recap due." },
  ];
  const pickStatus = (script, day) => {
    let match = script[0].text;
    for (const s of script) if (day >= s.day) match = s.text;
    return match;
  };

  const setDay = (day) => {
    day = Math.max(0, Math.min(maxDay, day));
    const pct = (day / maxDay) * 100;
    dayValue.textContent = String(day).padStart(2, "0");
    sliderFill.style.width = pct + "%";

    const mPct = Math.min(day, mediafyComplete) / maxDay * 100;
    mediafyFill.style.width = mPct + "%";

    tradFill.style.width = pct + "%";

    document.querySelectorAll("#difference .milestone").forEach((m) => {
      const mday = Number(m.dataset.day);
      m.classList.toggle("is-done", day >= mday);
    });

    lanes[0].classList.toggle("is-shipped", day >= mediafyComplete);
    lanes[1].classList.toggle("is-shipped", day >= maxDay);

    mediafyStatus.textContent = pickStatus(mediafyScript, day);
    tradStatus.textContent = pickStatus(tradScript, day);
  };

  input.addEventListener("input", () => setDay(Number(input.value)));
  setDay(0);

  let playing = false;
  let raf = 0;

  const stopPlay = () => {
    playing = false;
    playBtn.classList.remove("is-playing");
    playLabel.textContent = "Auto-play";
    cancelAnimationFrame(raf);
  };

  const play = () => {
    playing = true;
    playBtn.classList.add("is-playing");
    playLabel.textContent = "Pause";
    const startDay = Number(input.value) >= maxDay ? 0 : Number(input.value);
    const duration = 6000;
    const start = performance.now();

    const step = (now) => {
      if (!playing) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const day = Math.round(startDay + (maxDay - startDay) * progress);
      input.value = day;
      setDay(day);
      if (progress < 1) raf = requestAnimationFrame(step);
      else stopPlay();
    };
    raf = requestAnimationFrame(step);
  };

  playBtn.addEventListener("click", () => {
    if (playing) stopPlay();
    else play();
  });
  input.addEventListener("pointerdown", () => { if (playing) stopPlay(); });

  const scrubIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !reduceMotion) {
        setTimeout(play, 400);
        scrubIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  const diff = document.getElementById("difference");
  if (diff) scrubIO.observe(diff);
})();

// ---------- FAQ accordion ----------
(function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", String(open));
    });
  });
})();

// ---------- Brand marquee (duplicate slides for seamless loop) ----------
(function initMarquee() {
  document.querySelectorAll(".marquee-track").forEach((track) => {
    const slide = track.querySelector(".marquee-slide");
    if (!slide) return;
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
  });
})();

// ---------- Case study liquid art ----------
(function initCaseLiquid() {
  const canvases = document.querySelectorAll(".case-liquid");
  if (!canvases.length || reduceMotion) return;

  const themes = [
    {
      blobs: [
        { color: [124, 58, 237], r: 0.35, x: 0.3, y: 0.4, sx: 0.6, sy: 0.8 },
        { color: [167, 139, 250], r: 0.28, x: 0.7, y: 0.3, sx: 0.9, sy: 0.5 },
        { color: [91, 33, 182], r: 0.32, x: 0.5, y: 0.7, sx: 0.4, sy: 0.7 },
        { color: [196, 181, 253], r: 0.18, x: 0.2, y: 0.6, sx: 1.1, sy: 0.3 },
      ],
      bg: [10, 6, 24],
    },
    {
      blobs: [
        { color: [46, 16, 101], r: 0.4, x: 0.6, y: 0.5, sx: 0.3, sy: 0.6 },
        { color: [124, 58, 237], r: 0.3, x: 0.25, y: 0.35, sx: 0.7, sy: 0.4 },
        { color: [59, 130, 246], r: 0.22, x: 0.8, y: 0.7, sx: 0.5, sy: 0.9 },
        { color: [139, 92, 246], r: 0.25, x: 0.4, y: 0.2, sx: 0.8, sy: 0.5 },
      ],
      bg: [8, 8, 18],
    },
    {
      blobs: [
        { color: [167, 139, 250], r: 0.38, x: 0.5, y: 0.5, sx: 0.5, sy: 0.7 },
        { color: [76, 29, 149], r: 0.3, x: 0.2, y: 0.3, sx: 0.8, sy: 0.3 },
        { color: [232, 121, 249], r: 0.2, x: 0.75, y: 0.6, sx: 0.6, sy: 0.8 },
        { color: [124, 58, 237], r: 0.26, x: 0.6, y: 0.25, sx: 0.4, sy: 0.6 },
      ],
      bg: [12, 5, 20],
    },
    {
      blobs: [
        { color: [30, 27, 75], r: 0.42, x: 0.4, y: 0.5, sx: 0.7, sy: 0.4 },
        { color: [124, 58, 237], r: 0.28, x: 0.7, y: 0.3, sx: 0.3, sy: 0.8 },
        { color: [91, 33, 182], r: 0.24, x: 0.3, y: 0.7, sx: 0.9, sy: 0.5 },
        { color: [255, 255, 255], r: 0.1, x: 0.8, y: 0.6, sx: 0.5, sy: 1.0 },
      ],
      bg: [6, 6, 14],
    },
  ];

  canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const themeIdx = parseInt(canvas.dataset.theme, 10) || 0;
    const theme = themes[themeIdx % themes.length];
    const art = canvas.parentElement;

    let w = 0, h = 0;
    let mx = 0.5, my = 0.5, active = false;

    const blobs = theme.blobs.map((b) => ({
      ...b,
      cx: b.x, cy: b.y, phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const r = art.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(art);
    resize();

    art.addEventListener("mousemove", (e) => {
      const r = art.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
      active = true;
    });
    art.addEventListener("mouseleave", () => { active = false; });

    const draw = (t) => {
      const s = t * 0.001;
      ctx.fillStyle = `rgb(${theme.bg[0]}, ${theme.bg[1]}, ${theme.bg[2]})`;
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        const drift = active ? 0.08 : 0;
        const tx = b.x + Math.sin(s * b.sx + b.phase) * 0.15 + (mx - 0.5) * drift;
        const ty = b.y + Math.cos(s * b.sy + b.phase) * 0.12 + (my - 0.5) * drift;
        b.cx += (tx - b.cx) * 0.04;
        b.cy += (ty - b.cy) * 0.04;

        const px = b.cx * w;
        const py = b.cy * h;
        const rad = b.r * Math.max(w, h);

        const grad = ctx.createRadialGradient(px, py, 0, px, py, rad);
        grad.addColorStop(0, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0.85)`);
        grad.addColorStop(0.5, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0.35)`);
        grad.addColorStop(1, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0)`);

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    let running = false;
    const loop = (t) => {
      if (!running) return;
      draw(t);
      requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !running) {
          running = true;
          requestAnimationFrame(loop);
        } else if (!entry.isIntersecting) {
          running = false;
        }
      });
    }, { threshold: 0.05 });
    io.observe(art);
  });
})();

// ---------- Case study flip cards ----------
(function initCaseFlip() {
  document.querySelectorAll(".case").forEach((card) => {
    const flip = () => {
      const open = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", open ? "true" : "false");
    };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flip();
      }
    });
  });
})();

// ---------- Floating CTA visibility ----------
(function initFloatingCta() {
  const cta = document.getElementById("floatingCta");
  if (!cta) return;
  const threshold = 700;
  const onScroll = () => {
    const nearFooter = window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 200;
    const past = window.scrollY > threshold;
    cta.classList.toggle("is-visible", past && !nearFooter);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
