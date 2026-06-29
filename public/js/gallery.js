const Gallery = {
  _lightboxOpen: false,
  _images: [],

  render() {
    return `
    <div class="section-page view">
      <div class="section-header reveal">
        <span class="section-tag">Galería</span>
        <h2 class="section-title">Nuestros Trabajos</h2>
        <p class="section-desc">Mirá algunos de los trabajos que realizamos en nuestro taller.</p>
      </div>
      <div class="services-filter reveal" id="galleryFilter">
        <button class="filter-btn active" data-filter="">Todas</button>
        <button class="filter-btn" data-filter="motores">Motores</button>
        <button class="filter-btn" data-filter="electricidad">Electricidad</button>
        <button class="filter-btn" data-filter="escaneo">Escaneo</button>
        <button class="filter-btn" data-filter="diagnostico">Diagnóstico</button>
      </div>
      <div class="gallery-grid" id="galleryGrid">
        <div class="loading-state"><div class="loading-spinner"></div></div>
      </div>
    </div>
    <div id="lightbox" class="lightbox" hidden role="dialog" aria-label="Vista ampliada"></div>`;
  },

  async afterRender() {
    this._images = [];
    const filter = document.getElementById('galleryFilter');
    if (filter) {
      filter.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        UI.setActiveFilter(filter, btn);
        this.loadGallery(btn.dataset.filter);
      });
    }
    this.loadGallery('');
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._lightboxOpen) this.closeLightbox();
      if (e.key === 'ArrowLeft' && this._lightboxOpen) this.navigateLightbox(-1);
      if (e.key === 'ArrowRight' && this._lightboxOpen) this.navigateLightbox(1);
    });
  },

  async loadGallery(category) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
    try {
      const images = await API.getGallery(category || undefined);
      this._images = images;
      if (!images.length) { grid.innerHTML = '<div class="empty-state">No hay imágenes en esta categoría</div>'; return; }
      grid.innerHTML = images.map((img, idx) => `
        <div class="gallery-item reveal" data-index="${idx}">
          <div class="gallery-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          </div>
          <div class="gallery-item-overlay">
            <h4>${Utils.escapeHtml(img.title)}</h4>
            <p>${Utils.escapeHtml(img.description || '')}</p>
          </div>
        </div>
      `).join('');
      grid.querySelectorAll('.gallery-item').forEach(el => {
        el.addEventListener('click', () => this.openLightbox(parseInt(el.dataset.index)));
      });
      Animations.refresh();
    } catch (err) {
      grid.innerHTML = `<div class="error-state"><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }
  },

  openLightbox(index) {
    this._lightboxOpen = true;
    document.body.style.overflow = 'hidden';
    this._currentIndex = index;
    this.renderLightbox();
  },

  renderLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const img = this._images[this._currentIndex];
    if (!img) return;
    lb.hidden = false;
    lb.innerHTML = `
      <button class="lightbox-close" id="lbClose" aria-label="Cerrar">✕</button>
      <button class="lightbox-prev" id="lbPrev" aria-label="Anterior">‹</button>
      <div class="lightbox-content">
        <div style="width:400px;height:300px;background:var(--bg-card);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:48px;margin:0 auto">🖼</div>
        <div class="lightbox-info">
          <h3>${Utils.escapeHtml(img.title)}</h3>
          <p>${Utils.escapeHtml(img.description || '')}</p>
        </div>
      </div>
      <button class="lightbox-next" id="lbNext" aria-label="Siguiente">›</button>`;
    document.getElementById('lbClose').onclick = () => this.closeLightbox();
    document.getElementById('lbPrev').onclick = () => this.navigateLightbox(-1);
    document.getElementById('lbNext').onclick = () => this.navigateLightbox(1);
  },

  navigateLightbox(dir) {
    const newIdx = this._currentIndex + dir;
    if (newIdx < 0 || newIdx >= this._images.length) return;
    this._currentIndex = newIdx;
    this.renderLightbox();
  },

  closeLightbox() {
    this._lightboxOpen = false;
    document.body.style.overflow = '';
    const lb = document.getElementById('lightbox');
    if (lb) lb.hidden = true;
  }
};
