const Animations = {
  _observer: null,
  _typingTimer: null,

  init() {
    this._observer = UI.initScrollReveal();
    this.initHeroCanvas();
  },

  refresh() {
    if (this._observer) this._observer.disconnect();
    this._observer = UI.initScrollReveal();
  },

  initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => {
      resize();
      particles = [];
      for (let i = 0; i < 40; i++) createParticle();
    });

    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.4 + 0.1
      };
    }

    for (let i = 0; i < 40; i++) particles.push(createParticle());

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,49,49,${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,49,49,${0.08 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  },

  typeWriter(element, text, speed = 50, callback) {
    if (this._typingTimer) clearInterval(this._typingTimer);
    element.innerHTML = '';
    let i = 0;
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor';
    function type() {
      if (i < text.length) {
        element.innerHTML = text.substring(0, i + 1);
        element.appendChild(cursorSpan);
        i++;
        Animations._typingTimer = setTimeout(type, speed);
      } else {
        if (callback) callback();
      }
    }
    type();
  },

  animateCounter(element, target, duration = 1500) {
    const start = performance.now();
    let current = 0;
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      element.textContent = current.toLocaleString('es-AR');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
};
