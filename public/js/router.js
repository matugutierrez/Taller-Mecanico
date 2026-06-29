const Router = {
  _routes: {},

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

  handleRoute() {
    const path = this.getCurrentPath();
    const viewFn = this._routes[path];
    const app = document.getElementById('app');
    if (!app) return;

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));
    const matchingLink = document.querySelector(`.nav-link[data-route="${path === '/' ? 'home' : path.replace('/', '')}"]`);
    if (matchingLink) matchingLink.classList.add('active');

    if (!viewFn) {
      app.innerHTML = '<div class="error-state view"><h3>Página no encontrada</h3><p>La página que buscás no existe.</p><a href="#/" class="btn-primary">Volver al inicio</a></div>';
      return;
    }

    try {
      const html = viewFn(this.getParams());
      if (html && html.then) {
        html.then(h => {
          app.innerHTML = h;
          if (window.App) App.afterRender();
        }).catch(err => {
          app.innerHTML = `<div class="error-state view"><h3>Error al cargar</h3><p>${Utils.escapeHtml(err.message)}</p><button class="btn-primary" onclick="location.reload()">Reintentar</button></div>`;
        });
      } else {
        app.innerHTML = html;
        if (window.App) App.afterRender();
      }
    } catch (err) {
      app.innerHTML = `<div class="error-state view"><h3>Error al cargar</h3><p>${Utils.escapeHtml(err.message)}</p><button class="btn-primary" onclick="location.reload()">Reintentar</button></div>`;
    }
  },

  init() {
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href') || link.dataset.route);
      }
    });
  }
};
