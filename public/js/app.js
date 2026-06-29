window.onerror = function(msg, url, line, col, err) {
  console.error('Error global:', msg, err);
  const app = document.getElementById('app');
  if (app && !app.innerHTML.trim()) {
    app.innerHTML = '<div class="error-state view"><h3>Algo salió mal</h3><p>Ocurrió un error inesperado. Recargá la página.</p><button class="btn-primary" onclick="location.reload()">Recargar</button></div>';
  }
  UI.hidePreloader();
};

const App = {
  init() {
    try {
      Theme.init();
      UI.showPreloader();
      UI.initCookieConsent();
      UI.initBackToTop();
      UI.initMobileNav();
      Search.init();

      Router.route('/',        () => Home.render());
      Router.route('/servicios', (p) => Services.render(p));
      Router.route('/galeria',   (p) => Gallery.render(p));
      Router.route('/blog',      (p) => Blog.render(p));
      Router.route('/faq',       () => FAQ.render());
      Router.route('/contacto',  () => Contact.render());
      Router.route('/reservar',  () => Booking.render());
      Router.route('/testimonios',() => Reviews.render());

      Router.init();
    } catch (err) {
      console.error('Error en App.init:', err);
      document.getElementById('app').innerHTML = '<div class="error-state view"><h3>Error de inicialización</h3><p>Recargá la página para intentar de nuevo.</p><button class="btn-primary" onclick="location.reload()">Recargar</button></div>';
      UI.hidePreloader();
    }
  },

  afterRender() {
    Animations.refresh();
    try {
      const path = Router.getCurrentPath();
      switch (path) {
        case '/': Home.afterRender(); break;
        case '/servicios': Services.afterRender(); break;
        case '/galeria': Gallery.afterRender(); break;
        case '/blog': Blog.afterRender(); break;
        case '/faq': FAQ.afterRender(); break;
        case '/contacto': Contact.afterRender(); break;
        case '/reservar': Booking.afterRender(); break;
        case '/testimonios': Reviews.afterRender(); break;
      }
    } catch (err) {
      console.error('Error en afterRender:', err);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
