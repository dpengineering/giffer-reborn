// Confetti for decoding the secret phrase (Tools > Decode Phrase).
//   Confetti.celebrate("YOURPHRASE")  banner + two confetti cannons + a shower from the top
//   Confetti.burst()                  just the confetti
var Confetti = (function () {
  "use strict";

  var COLORS = ["#f94144", "#f3722c", "#f9c74f", "#90be6d", "#43aa8b", "#4d96ff", "#9b5de5", "#f15bb5"];
  var EMOJIS = ["🎉", "🎊", "✨", "⭐", "💡"];
  var canvas = null, ctx = null, pieces = [], frame = null, lastTime = 0;

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setup() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "confetti-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      window.addEventListener("resize", size);
    }
    size();
  }

  function size() {
    if (!canvas) { return; }
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function piece(x, y, angle, speed, delay) {
    var emoji = Math.random() < 0.06;
    return {
      x: x, y: y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      w: rand(6, 11), h: rand(10, 18),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: emoji ? "emoji" : (Math.random() < 0.3 ? "circle" : (Math.random() < 0.5 ? "ribbon" : "rect")),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      spin: rand(0, Math.PI * 2), spinSpeed: rand(-12, 12),
      flip: rand(0, Math.PI * 2), flipSpeed: rand(6, 14),
      wobble: rand(0, Math.PI * 2),
      delay: delay || 0, life: 0
    };
  }

  // Two cannons from the bottom corners, then a shower from the top.
  function burst() {
    if (reducedMotion()) { return; }
    setup();
    var w = window.innerWidth, h = window.innerHeight;
    for (var i = 0; i < 110; i++) {
      pieces.push(piece(-10, h * 0.85, rand(-1.35, -0.75), rand(14, 24) * Math.min(1.2, h / 700), rand(0, 0.25)));
      pieces.push(piece(w + 10, h * 0.85, Math.PI - rand(-1.35, -0.75), rand(14, 24) * Math.min(1.2, h / 700), rand(0, 0.25)));
    }
    for (var j = 0; j < 160; j++) {
      pieces.push(piece(rand(0, w), rand(-80, -10), Math.PI / 2, rand(1, 4), rand(0.5, 2.2)));
    }
    if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
  }

  function tick(now) {
    var dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter(function (p) {
      if (p.delay > 0) { p.delay -= dt; return true; }
      p.life += dt;
      p.vy += 30 * dt;                           // gravity
      p.vx *= Math.pow(0.35, dt);                // air drag
      p.vy = Math.min(p.vy, 6 + (p.shape === "emoji" ? 1 : 0));   // flutter, don't plummet
      p.wobble += dt * 4;
      p.x += (p.vx + Math.sin(p.wobble) * 1.2) * dt * 60;
      p.y += p.vy * dt * 60;
      p.spin += p.spinSpeed * dt;
      p.flip += p.flipSpeed * dt;
      draw(p);
      return p.y < h + 40 && p.life < 9;
    });
    if (pieces.length) {
      frame = requestAnimationFrame(tick);
    } else {
      frame = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin);
    if (p.shape === "emoji") {
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.emoji, 0, 0);
    } else {
      ctx.scale(1, Math.cos(p.flip));         // tumbling paper
      ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === "ribbon") {
        ctx.fillRect(-p.w / 4, -p.h, p.w / 2, p.h * 2);
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
    }
    ctx.restore();
  }

  // Banner with the decoded phrase (click or Escape to close), plus confetti.
  function celebrate(phrase) {
    var old = document.getElementById("confetti-banner");
    if (old) { old.remove(); }
    var banner = document.createElement("div");
    banner.id = "confetti-banner";
    banner.className = "confetti-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Secret phrase decoded");
    var card = document.createElement("div");
    card.className = "confetti-card";
    var title = document.createElement("div");
    title.className = "confetti-title";
    title.textContent = "🎉 You cracked it! 🎉";
    var label = document.createElement("div");
    label.className = "confetti-label";
    label.textContent = "Your secret phrase is";
    var text = document.createElement("div");
    text.className = "confetti-phrase";
    String(phrase).split("").forEach(function (ch, i) {
      var s = document.createElement("span");
      s.textContent = ch;
      s.style.animationDelay = (0.25 + i * 0.06) + "s";
      text.appendChild(s);
    });
    var close = document.createElement("button");
    close.type = "button";
    close.className = "btn btn-primary confetti-close";
    close.textContent = "Woohoo!";
    card.appendChild(title);
    card.appendChild(label);
    card.appendChild(text);
    card.appendChild(close);
    banner.appendChild(card);
    document.body.appendChild(banner);

    function dismiss() {
      banner.classList.add("confetti-leaving");
      document.removeEventListener("keydown", onKey);
      setTimeout(function () { banner.remove(); }, 300);
    }
    function onKey(e) { if (e.key === "Escape" || e.key === "Enter") { dismiss(); } }
    close.onclick = dismiss;
    banner.addEventListener("click", function (e) { if (e.target === banner) { dismiss(); } });
    document.addEventListener("keydown", onKey);
    close.focus();

    burst();
    setTimeout(burst, 1400);
  }

  return { burst: burst, celebrate: celebrate };
})();
