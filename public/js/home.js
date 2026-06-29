const Home = {
  render() {
    return `
    <section class="hero view" id="inicio">
      <canvas id="heroCanvas" class="hero-canvas"></canvas>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge reveal revealed">
          <span class="hero-badge-dot"></span>
          <span>Abierto hoy · Lun-Vie 9:00-18:00</span>
        </div>
        <h1 class="hero-title reveal revealed" style="transition-delay:0.1s">
          Tu auto en las<br>mejores <em>manos</em>
        </h1>
        <div class="hero-typing reveal revealed" style="transition-delay:0.2s" id="typingText"><span class="cursor"></span></div>
        <p class="hero-desc reveal revealed" style="transition-delay:0.25s">
          Más de 15 años cuidando los motores de El Jagüel y zona sur.
          Diagnóstico, reparación y mantenimiento con tecnología de punta.
        </p>
        <div class="hero-actions reveal revealed" style="transition-delay:0.3s">
          <a href="#/reservar" class="btn-primary" data-route="booking">Reservar Turno</a>
          <a href="#/servicios" class="btn-secondary" data-route="services">Ver Servicios</a>
        </div>
        <div class="hero-stats reveal revealed" style="transition-delay:0.35s">
          <div class="hero-stat">
            <div class="hero-stat-number" id="statYears">15+</div>
            <div class="hero-stat-label">Años de experiencia</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number" id="statServices">0</div>
            <div class="hero-stat-label">Servicios</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number" id="statRepairs">0</div>
            <div class="hero-stat-label">Reparaciones</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number" id="statRating">0.0</div>
            <div class="hero-stat-label">Calificación ★</div>
          </div>
        </div>
      </div>
    </section>
    <section class="section-page" id="featuredServices">
      <div class="section-header reveal">
        <span class="section-tag">Servicios</span>
        <h2 class="section-title">¿Qué hacemos?</h2>
        <p class="section-desc">Ofrecemos soluciones completas para tu vehículo con equipamiento profesional.</p>
      </div>
      <div class="services-grid" id="homeServicesGrid">
        <div class="loading-state"><div class="loading-spinner"></div></div>
      </div>
      <div style="text-align:center;margin-top:32px" class="reveal">
        <a href="#/servicios" class="btn-secondary" data-route="services">Ver todos los servicios</a>
      </div>
    </section>
    <section style="background:var(--bg-secondary);padding:80px 24px" id="featuredReviews">
      <div style="max-width:var(--max-width);margin:0 auto">
        <div class="section-header reveal">
          <span class="section-tag">Testimonios</span>
          <h2 class="section-title">Lo que dicen nuestros clientes</h2>
        </div>
        <div id="homeReviewsList" class="reviews-list" style="max-width:600px;margin:0 auto">
          <div class="loading-state"><div class="loading-spinner"></div></div>
        </div>
        <div style="text-align:center;margin-top:24px" class="reveal">
          <a href="#/contacto" class="btn-primary" data-route="contact">Dejanos tu opinión</a>
        </div>
      </div>
    </section>
    `;
  },

  afterRender() {
    Animations.initHeroCanvas();
    this.startTyping();
    this.loadStats();
    this.loadServices();
    this.loadReviews();
  },

  startTyping() {
    const texts = ['Diagnóstico computarizado', 'Reparación de motores', 'Electricidad del automóvil', 'Escaneo con scanner'];
    let idx = 0;
    const el = document.getElementById('typingText');
    if (!el) return;
    function typeLoop() {
      Animations.typeWriter(el, texts[idx], 60, () => {
        setTimeout(() => {
          let i = texts[idx].length;
          const cursorSpan = el.querySelector('.cursor');
          function erase() {
            if (i > 0) {
              el.innerHTML = texts[idx].substring(0, i - 1);
              if (cursorSpan) el.appendChild(cursorSpan);
              i--;
              setTimeout(erase, 25);
            } else {
              idx = (idx + 1) % texts.length;
              setTimeout(typeLoop, 500);
            }
          }
          erase();
        }, 2000);
      });
    }
    typeLoop();
  },

  async loadStats() {
    try {
      const stats = await API.getStats();
      const sS = document.getElementById('statServices');
      const sR = document.getElementById('statRepairs');
      const sRt = document.getElementById('statRating');
      const sY = document.getElementById('statYears');
      if (sS) sS.textContent = stats.services || 0;
      if (sR) sR.textContent = stats.appointments || 0;
      if (sRt) sRt.textContent = (stats.avgRating || 0).toFixed(1);
      if (sY) Animations.animateCounter(sY, Math.min(stats.appointments || 15, 15));
    } catch {}
  },

  async loadServices() {
    const grid = document.getElementById('homeServicesGrid');
    if (!grid) return;
    try {
      const services = await API.getServices();
      if (!services.length) { grid.innerHTML = '<div class="empty-state">Sin servicios disponibles</div>'; return; }
      grid.innerHTML = services.slice(0, 3).map(s => `
        <div class="service-card reveal">
          <div class="service-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <h3>${Utils.escapeHtml(s.name)}</h3>
          <p>${Utils.escapeHtml(s.description.substring(0, 120))}...</p>
          ${s.price ? `<div class="service-card-price">$${s.price.toLocaleString('es-AR')}</div>` : ''}
          <a href="#/reservar" class="btn-primary" data-route="booking">Solicitar Turno</a>
        </div>
      `).join('');
      Animations.refresh();
    } catch {
      grid.innerHTML = '<div class="empty-state">Error al cargar servicios</div>';
    }
  },

  async loadReviews() {
    const container = document.getElementById('homeReviewsList');
    if (!container) return;
    try {
      const data = await API.getReviews();
      if (!data.reviews?.length) {
        container.innerHTML = '<div class="empty-state">Sé el primero en dejar una reseña</div>';
        return;
      }
      container.innerHTML = data.reviews.slice(0, 3).map(r => `
        <div class="review-card review-card-mini reveal">
          <div class="review-card-header">
            <span class="review-card-name">${Utils.escapeHtml(r.clientName)}</span>
            ${Utils.starsHtml(r.rating, 16)}
          </div>
          <p class="review-card-text">${Utils.escapeHtml(r.comment)}</p>
        </div>
      `).join('');
      Animations.refresh();
    } catch {
      container.innerHTML = '<div class="empty-state">Sé el primero en dejar una reseña</div>';
    }
  }
};
