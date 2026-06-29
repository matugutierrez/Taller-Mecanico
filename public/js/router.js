const Router = {
  _routes: {},
  _currentView: null,

  route(path, viewFn) {
    this._routes[path] = viewFn;
  },

  navigate(path) {
    window.location.hash = path;
  },

  getCurrentPath() {
    const hash = window.location.hash.slice(1) || '/';
    return hash.split('?')[0];
  },

  getParams() {
    const hash = window.location.hash.slice(1);
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return {};
    const params = new URLSearchParams(hash.slice(qIdx));
    const obj = {};
    for (const [k, v] of params) obj[k] = v;
    return obj;
  },

  async handleRoute() {
    const path = this.getCurrentPath();
    const viewFn = this._routes[path];

    const app = document.getElementById('app');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));

    const matchingLink = document.querySelector(`.nav-link[data-route="${path === '/' ? 'home' : path.replace('/', '')}"]`);
    if (matchingLink) matchingLink.classList.add('active');

    if (!viewFn) {
      app.innerHTML = `
        <div class="error-state view">
          <h3>Página no encontrada</h3>
          <p>La página que buscás no existe.</p>
          <a href="#/" class="btn-primary">Volver al inicio</a>
        </div>`;
      return;
    }

    try {
      app.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Cargando...</p></div>';
      const html = await viewFn(this.getParams());
      app.innerHTML = html;
      app.querySelectorAll('.view').forEach(el => {
        el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
      });
      if (window.App) App.afterRender();
    } catch (err) {
      console.error(err);
      app.innerHTML = `
        <div class="error-state view">
          <h3>Error al cargar</h3>
          <p>${Utils.escapeHtml(err.message)}</p>
          <button class="btn-primary" onclick="Router.handleRoute()">Reintentar</button>
        </div>`;
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href') || link.dataset.route);
      }
    });
  }
};
