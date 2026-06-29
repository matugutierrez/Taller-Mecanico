const App = {
  async init() {
    Theme.init();
    UI.showPreloader();
    UI.initCookieConsent();
    UI.initBackToTop();
    UI.initMobileNav();
    Search.init();

    Router.route('/',           () => Home.render());
    Router.route('/servicios',  (p) => Services.render(p));
    Router.route('/galeria',    (p) => Gallery.render(p));
    Router.route('/blog',       (p) => Blog.render(p));
    Router.route('/faq',        () => FAQ.render());
    Router.route('/contacto',   () => Contact.render());
    Router.route('/reservar',   () => Booking.render());
    Router.route('/testimonios',() => Reviews.render());
    Router.route('/404',        () => '<div class="error-state view"><h3>Página no encontrada</h3><p>La página que buscás no existe.</p><a href="#/" class="btn-primary">Volver al inicio</a></div>');

    Router.init();
  },

  afterRender() {
    Animations.refresh();
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
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
