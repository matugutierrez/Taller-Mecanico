const Search = {
  _allData: null,
  _focusedIndex: -1,

  init() {
    document.getElementById('searchToggle')?.addEventListener('click', () => this.open());
    document.getElementById('searchClose')?.addEventListener('click', () => this.close());
    document.getElementById('searchBackdrop')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowDown' && !document.getElementById('searchModal').hidden) {
        e.preventDefault();
        this._focusedIndex = Math.min(this._focusedIndex + 1, document.querySelectorAll('.search-result-item').length - 1);
        this.focusItem();
      }
      if (e.key === 'ArrowUp' && !document.getElementById('searchModal').hidden) {
        e.preventDefault();
        this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
        this.focusItem();
      }
      if (e.key === 'Enter' && this._focusedIndex >= 0 && !document.getElementById('searchModal').hidden) {
        const item = document.querySelectorAll('.search-result-item')[this._focusedIndex];
        if (item) item.click();
      }
    });
    const input = document.getElementById('searchInput');
    if (input) {
      input.addEventListener('input', Utils.debounce(() => this.performSearch(), 300));
      input.addEventListener('focus', () => { if (this._allData) this.performSearch(); });
    }
  },

  async open() {
    const modal = document.getElementById('searchModal');
    if (!modal) return;
    modal.hidden = false;
    if (!this._allData) {
      try {
        const [services, faqs, posts] = await Promise.all([
          API.getServices().catch(() => []),
          API.getFAQ().catch(() => []),
          API.getBlogPosts({}).catch(() => [])
        ]);
        this._allData = [
          ...services.map(s => ({ type: 'Servicio', title: s.name, desc: s.description, url: '#/servicios' })),
          ...faqs.map(f => ({ type: 'FAQ', title: f.question, desc: f.answer, url: '#/faq' })),
          ...posts.map(p => ({ type: 'Blog', title: p.title, desc: p.excerpt, url: `#/blog?post=${p.slug}` }))
        ];
      } catch { this._allData = []; }
    }
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
      this.performSearch();
    }, 100);
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('searchModal').hidden = true;
    document.body.style.overflow = '';
    this._focusedIndex = -1;
  },

  performSearch() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const container = document.getElementById('searchResults');
    if (!container) return;
    if (!query) {
      container.innerHTML = '<div class="search-hint">Escribí para buscar en servicios, blog y FAQ...</div>';
      this._focusedIndex = -1;
      return;
    }
    if (!this._allData || !this._allData.length) {
      container.innerHTML = '<div class="search-empty">No hay datos para buscar</div>';
      return;
    }
    const results = this._allData.filter(item =>
      item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)
    );
    if (!results.length) {
      container.innerHTML = '<div class="search-empty">No se encontraron resultados</div>';
      this._focusedIndex = -1;
      return;
    }
    container.innerHTML = results.slice(0, 10).map((r, i) => `
      <a href="${r.url}" class="search-result-item" data-index="${i}">
        <div class="sri-title">${this.highlight(r.title, query)}</div>
        <div class="sri-desc">${this.highlight(r.desc.substring(0, 100), query)}</div>
        <span class="sri-tag">${r.type}</span>
      </a>
    `).join('');
    this._focusedIndex = -1;
    container.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate(el.getAttribute('href').slice(1));
        this.close();
      });
    });
  },

  highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return Utils.escapeHtml(text);
    return Utils.escapeHtml(text.substring(0, idx)) +
      '<strong style="color:var(--primary)">' + Utils.escapeHtml(text.substring(idx, idx + query.length)) + '</strong>' +
      Utils.escapeHtml(text.substring(idx + query.length));
  },

  focusItem() {
    document.querySelectorAll('.search-result-item').forEach((el, i) => {
      el.classList.toggle('focused', i === this._focusedIndex);
      if (i === this._focusedIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }
};
