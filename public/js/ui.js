const UI = {
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${Utils.escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  },

  showPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    const fill = document.getElementById('preloaderFill');
    if (fill) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) { progress = 100; clearInterval(interval); }
        fill.style.width = `${Math.min(progress, 100)}%`;
      }, 200);
      setTimeout(() => {
        clearInterval(interval);
        fill.style.width = '100%';
        setTimeout(() => preloader.classList.add('hidden'), 400);
      }, 1500);
    } else {
      setTimeout(() => preloader.classList.add('hidden'), 1000);
    }
    setTimeout(() => this.hidePreloader(), 5000);
  },

  initCookieConsent() {
    if (localStorage.getItem('cookieConsent')) return;
    const banner = document.getElementById('cookieConsent');
    if (!banner) return;
    banner.hidden = false;
    document.getElementById('cookieAccept').onclick = () => {
      localStorage.setItem('cookieConsent', 'accepted');
      banner.hidden = true;
    };
    document.getElementById('cookieDecline').onclick = () => {
      localStorage.setItem('cookieConsent', 'declined');
      banner.hidden = true;
    };
  },

  initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    const fill = document.getElementById('bttFill');
    const circumference = 100;
    window.addEventListener('scroll', Utils.debounce(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * circumference : 0;
      if (fill) fill.style.strokeDashoffset = circumference - progress;
      btn.classList.toggle('visible', scrollTop > 400);
    }, 50));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },

  initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');
    if (!hamburger || !navMenu) return;
    const toggle = () => {
      const open = navMenu.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      if (overlay) overlay.classList.toggle('visible', open);
      hamburger.setAttribute('aria-expanded', open);
    };
    hamburger.addEventListener('click', toggle);
    if (overlay) overlay.addEventListener('click', toggle);
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
      if (window.innerWidth <= 768) toggle();
    }));
  },

  initScrollReveal() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));
      return observer;
    } else {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => el.classList.add('revealed'));
    }
  },

  setActiveFilter(container, activeBtn) {
    container.querySelectorAll('.filter-btn, .faq-cat-btn').forEach(b => b.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
  }
};
