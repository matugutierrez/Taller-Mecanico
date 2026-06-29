const Blog = {
  async render(params) {
    if (params.post) {
      return `<div class="section-page view"><div class="blog-single" id="blogSingle"><div class="loading-state"><div class="loading-spinner"></div></div></div></div>`;
    }
    return `
    <div class="section-page view">
      <div class="section-header reveal">
        <span class="section-tag">Blog</span>
        <h2 class="section-title">Consejos y novedades</h2>
        <p class="section-desc">Información útil para cuidar tu vehículo y estar al día.</p>
      </div>
      <div class="services-filter reveal" id="blogFilter">
        <button class="filter-btn active" data-filter="">Todos</button>
        <button class="filter-btn" data-filter="consejos">Consejos</button>
        <button class="filter-btn" data-filter="mantenimiento">Mantenimiento</button>
        <button class="filter-btn" data-filter="tecnologia">Tecnología</button>
        <button class="filter-btn" data-filter="tutoriales">Tutoriales</button>
        <button class="filter-btn" data-filter="noticias">Noticias</button>
      </div>
      <div class="blog-grid" id="blogGrid">
        <div class="loading-state"><div class="loading-spinner"></div></div>
      </div>
    </div>`;
  },

  async afterRender() {
    const params = Router.getParams();
    if (params.post) {
      this.loadPost(params.post);
      return;
    }
    const filter = document.getElementById('blogFilter');
    if (filter) {
      filter.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        UI.setActiveFilter(filter, btn);
        this.loadPosts(btn.dataset.filter);
      });
    }
    this.loadPosts('');
  },

  async loadPosts(category) {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
    try {
      const params = {};
      if (category) params.category = category;
      const posts = await API.getBlogPosts(params);
      if (!posts.length) { grid.innerHTML = '<div class="empty-state">No hay artículos aún</div>'; return; }
      grid.innerHTML = posts.map(p => `
        <div class="blog-card reveal">
          <div class="blog-card-body">
            <span class="blog-card-category">${Utils.escapeHtml(p.category)}</span>
            <h3>${Utils.escapeHtml(p.title)}</h3>
            <p>${Utils.escapeHtml(p.excerpt)}</p>
            <div class="blog-card-meta">
              <span>${Utils.formatDate(p.createdAt)}</span>
              <span>· ${Utils.getReadingTime(p.content)} min de lectura</span>
              <span>· ${p.viewCount || 0} vistas</span>
            </div>
            <a href="#/blog?post=${p.slug}" class="btn-primary" data-route="blog">Leer más</a>
          </div>
        </div>
      `).join('');
      Animations.refresh();
    } catch (err) {
      grid.innerHTML = `<div class="error-state"><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }
  },

  async loadPost(slug) {
    const container = document.getElementById('blogSingle');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
    try {
      const post = await API.getBlogPost(slug);
      container.innerHTML = `
        <a href="#/blog" class="btn-secondary" style="margin-bottom:24px" data-route="blog">← Volver al blog</a>
        <h1>${Utils.escapeHtml(post.title)}</h1>
        <div class="blog-single-meta">
          <span>${Utils.formatDate(post.createdAt)}</span>
          <span>· ${Utils.getReadingTime(post.content)} min de lectura</span>
          <span>· ${post.viewCount} vistas</span>
          <span>· ${Utils.escapeHtml(post.author)}</span>
        </div>
        ${post.tags?.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">${post.tags.map(t => `<span style="padding:4px 12px;border-radius:999px;background:var(--red-soft);color:var(--red);font-size:12px;font-weight:600">#${Utils.escapeHtml(t)}</span>`).join('')}</div>` : ''}
        <div class="blog-single-content">${post.content}</div>
        <a href="#/blog" class="btn-secondary" style="margin-top:32px" data-route="blog">← Volver al blog</a>`;
    } catch (err) {
      container.innerHTML = `<div class="error-state"><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }
  }
};
