const Services = {
  render(params) {
    const category = params.categoria || '';
    return `
    <div class="services-page view">
      <div class="section-header reveal">
        <span class="section-tag">Servicios</span>
        <h2 class="section-title">Nuestros Servicios</h2>
        <p class="section-desc">Soluciones completas para todas las marcas con garantía y calidad.</p>
      </div>
      <div class="services-filter reveal" id="servicesFilter">
        <button class="filter-btn ${!category ? 'active' : ''}" data-filter="">Todos</button>
        <button class="filter-btn ${category === 'motor' ? 'active' : ''}" data-filter="motor">Motores</button>
        <button class="filter-btn ${category === 'electricidad' ? 'active' : ''}" data-filter="electricidad">Electricidad</button>
        <button class="filter-btn ${category === 'escaneo' ? 'active' : ''}" data-filter="escaneo">Escaneo</button>
        <button class="filter-btn ${category === 'diagnostico' ? 'active' : ''}" data-filter="diagnostico">Diagnóstico</button>
        <button class="filter-btn ${category === 'mantenimiento' ? 'active' : ''}" data-filter="mantenimiento">Mantenimiento</button>
      </div>
      <div class="services-grid" id="servicesGrid">
        <div class="loading-state"><div class="loading-spinner"></div></div>
      </div>
    </div>`;
  },

  async afterRender() {
    const params = Router.getParams();
    this.loadServices(params.categoria || '');
    const filter = document.getElementById('servicesFilter');
    if (filter) {
      filter.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        UI.setActiveFilter(filter, btn);
        const cat = btn.dataset.filter;
        Router.navigate(cat ? `/servicios?categoria=${cat}` : '/servicios');
        this.loadServices(cat);
      });
    }
  },

  async loadServices(category) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
    try {
      const params = category ? { category } : {};
      const services = await API.getServices(params);
      if (!services.length) { grid.innerHTML = '<div class="empty-state">No hay servicios en esta categoría</div>'; return; }
      grid.innerHTML = services.map(s => `
        <div class="service-card reveal">
          <div class="service-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <h3>${Utils.escapeHtml(s.name)}</h3>
          <p>${Utils.escapeHtml(s.description)}</p>
          ${s.price ? `<div class="service-card-price">$${s.price.toLocaleString('es-AR')}</div>` : ''}
          ${s.features?.length ? `
          <ul class="service-card-features">
            ${s.features.map(f => `<li>${Utils.escapeHtml(f)}</li>`).join('')}
          </ul>` : ''}
          <a href="#/reservar" class="btn-primary" data-route="booking">Solicitar Turno</a>
        </div>
      `).join('');
      Animations.refresh();
    } catch (err) {
      grid.innerHTML = `<div class="error-state"><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }
  }
};
