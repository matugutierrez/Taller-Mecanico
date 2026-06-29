const FAQ = {
  render() {
    return `
    <div class="section-page view">
      <div class="section-header reveal">
        <span class="section-tag">FAQ</span>
        <h2 class="section-title">Preguntas Frecuentes</h2>
        <p class="section-desc">Respondemos las dudas más comunes sobre nuestros servicios.</p>
      </div>
      <div class="faq-container">
        <div class="faq-search reveal">
          <svg class="faq-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="faqSearchInput" placeholder="Buscá tu pregunta..." aria-label="Buscar en FAQ">
        </div>
        <div class="faq-actions reveal">
          <button class="faq-action-btn" id="expandAll">Expandir todo</button>
          <button class="faq-action-btn" id="collapseAll">Colapsar todo</button>
        </div>
        <div class="faq-categories reveal" id="faqCategories">
          <button class="faq-cat-btn active" data-filter="">Todas</button>
          <button class="faq-cat-btn" data-filter="general">General</button>
          <button class="faq-cat-btn" data-filter="servicios">Servicios</button>
          <button class="faq-cat-btn" data-filter="turnos">Turnos</button>
          <button class="faq-cat-btn" data-filter="precios">Precios</button>
          <button class="faq-cat-btn" data-filter="vehiculos">Vehículos</button>
        </div>
        <div id="faqList"><div class="loading-state"><div class="loading-spinner"></div></div></div>
      </div>
    </div>`;
  },

  afterRender() {
    this.loadFAQ();
    const searchInput = document.getElementById('faqSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(() => this.filterFAQ(), 250));
    }
    const cats = document.getElementById('faqCategories');
    if (cats) {
      cats.addEventListener('click', (e) => {
        const btn = e.target.closest('.faq-cat-btn');
        if (!btn) return;
        UI.setActiveFilter(cats, btn);
        this._currentCategory = btn.dataset.filter;
        this.filterFAQ();
      });
    }
    document.getElementById('expandAll')?.addEventListener('click', () => {
      document.querySelectorAll('.faq-item').forEach(el => el.classList.add('open'));
    });
    document.getElementById('collapseAll')?.addEventListener('click', () => {
      document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    });
  },

  _currentCategory: '',
  _faqs: [],

  async loadFAQ() {
    const container = document.getElementById('faqList');
    if (!container) return;
    try {
      this._faqs = await API.getFAQ();
      if (!this._faqs.length) { container.innerHTML = '<div class="empty-state">No hay preguntas frecuentes aún</div>'; return; }
      this.renderFAQ();
    } catch (err) {
      container.innerHTML = `<div class="error-state"><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }
  },

  renderFAQ() {
    const container = document.getElementById('faqList');
    if (!container) return;
    const searchTerm = (document.getElementById('faqSearchInput')?.value || '').toLowerCase();
    const filtered = this._faqs.filter(f => {
      const matchSearch = !searchTerm || f.question.toLowerCase().includes(searchTerm) || f.answer.toLowerCase().includes(searchTerm);
      const matchCat = !this._currentCategory || f.category === this._currentCategory;
      return matchSearch && matchCat;
    });
    if (!filtered.length) {
      container.innerHTML = '<div class="faq-empty">No encontramos resultados para tu búsqueda</div>';
      return;
    }
    container.innerHTML = filtered.map(f => `
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          <span>${Utils.escapeHtml(f.question)}</span>
          <svg class="faq-question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <div class="faq-answer"><p>${f.answer}</p></div>
      </div>
    `).join('');
    container.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
      });
    });
  },

  filterFAQ() {
    this.renderFAQ();
  }
};
