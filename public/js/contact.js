const Contact = {
  render() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const isOpen = day >= 1 && day <= 5 && ((hour >= 9 && hour < 13) || (hour >= 14 && hour < 18));
    return `
    <div class="contact-page view">
      <div class="section-header reveal">
        <span class="section-tag">Contacto</span>
        <h2 class="section-title">Estamos para ayudarte</h2>
        <p class="section-desc">Escribinos, llamanos o pasate por el taller. Te esperamos.</p>
      </div>
      <div class="contact-grid">
        <div class="contact-info-card reveal-left">
          <h3>Información</h3>
          <div class="contact-detail">
            <div class="contact-detail-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <h4>Teléfono / WhatsApp</h4>
              <p><a href="https://wa.me/5491159371225" target="_blank" rel="noopener" style="color:var(--red)">+54 9 11 5937-1225</a></p>
            </div>
          </div>
          <div class="contact-detail">
            <div class="contact-detail-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div>
              <h4>Email</h4>
              <p><a href="mailto:matugutierrez7@gmail.com" style="color:var(--red)">matugutierrez7@gmail.com</a></p>
            </div>
          </div>
          <div class="contact-detail">
            <div class="contact-detail-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <h4>Ubicación</h4>
              <p>Juan Hernández 1785, El Jagüel, Monte Grande</p>
            </div>
          </div>
          <div class="contact-hours">
            <h4>Horarios</h4>
            <div class="hours-row">
              <span>Lunes a Viernes</span>
              <span>09:00 - 13:00 / 14:00 - 18:00</span>
            </div>
            <div class="hours-row">
              <span>Sábado</span>
              <span class="closed-indicator">Cerrado</span>
            </div>
            <div class="hours-row">
              <span>Domingo</span>
              <span class="closed-indicator">Cerrado</span>
            </div>
            <div class="hours-row" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color)">
              <span>Estado actual</span>
              <span class="${isOpen ? 'open-indicator' : 'closed-indicator'}">${isOpen ? 'Abierto ahora' : 'Cerrado ahora'}</span>
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap">
            <a href="https://wa.me/5491159371225" target="_blank" rel="noopener" class="btn-primary">WhatsApp</a>
            <a href="https://www.google.com/maps/place/Juan+Hern%C3%A1ndez+1785,+B1842+Monte+Grande,+Provincia+de+Buenos+Aires" target="_blank" rel="noopener" class="btn-secondary">Cómo llegar</a>
          </div>
        </div>
        <div class="contact-form-card reveal-right">
          <h3>Envianos un mensaje</h3>
          <form id="contactForm" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="contactName">Nombre *</label>
                <input type="text" id="contactName" required minlength="2" placeholder="Tu nombre">
              </div>
              <div class="form-group">
                <label for="contactEmail">Email *</label>
                <input type="email" id="contactEmail" required placeholder="tu@email.com">
              </div>
            </div>
            <div class="form-group">
              <label for="contactPhone">Teléfono</label>
              <input type="tel" id="contactPhone" placeholder="+54 9 11 ...">
            </div>
            <div class="form-group">
              <label for="contactSubject">Asunto *</label>
              <input type="text" id="contactSubject" required minlength="3" placeholder="¿En qué podemos ayudarte?">
            </div>
            <div class="form-group">
              <label for="contactMessage">Mensaje *</label>
              <textarea id="contactMessage" required minlength="10" maxlength="2000" placeholder="Escribí tu mensaje..."></textarea>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">Enviar mensaje</button>
          </form>
        </div>
      </div>
      <div class="map-container reveal" style="margin-top:32px">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3274.488919841785!2d-58.4802665!3d-34.8439404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd14b5df6ffc5%3A0xf264e953d0a58a7c!2sJuan%20Hern%C3%A1ndez%201785%2C%20B1842%20Monte%20Grande%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1779847371840!5m2!1ses!2sar" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Ubicación del taller"></iframe>
      </div>
    </div>`;
  },

  afterRender() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errors = [];
      const fields = {
        name: document.getElementById('contactName'),
        email: document.getElementById('contactEmail'),
        phone: document.getElementById('contactPhone'),
        subject: document.getElementById('contactSubject'),
        message: document.getElementById('contactMessage')
      };
      document.querySelectorAll('.form-error').forEach(el => el.remove());
      document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
      if (!fields.name.value.trim() || fields.name.value.trim().length < 2) errors.push({ field: 'contactName', msg: 'Nombre inválido' });
      if (!fields.email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) errors.push({ field: 'contactEmail', msg: 'Email inválido' });
      if (!fields.subject.value.trim() || fields.subject.value.trim().length < 3) errors.push({ field: 'contactSubject', msg: 'Asunto inválido' });
      if (!fields.message.value.trim() || fields.message.value.trim().length < 10) errors.push({ field: 'contactMessage', msg: 'Mensaje demasiado corto (mín. 10 caracteres)' });
      if (errors.length) {
        errors.forEach(err => {
          const input = document.getElementById(err.field);
          if (input) {
            input.closest('.form-group')?.classList.add('error');
            const errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            errorEl.textContent = err.msg;
            input.parentNode.appendChild(errorEl);
          }
        });
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      try {
        await API.sendContact({
          name: fields.name.value.trim(),
          email: fields.email.value.trim(),
          phone: fields.phone.value.trim(),
          subject: fields.subject.value.trim(),
          message: fields.message.value.trim()
        });
        form.innerHTML = `
          <div class="form-success">
            <div class="form-success-icon">✓</div>
            <h3 style="font-size:22px;margin-bottom:8px">Mensaje enviado</h3>
            <p style="color:var(--text-secondary)">Gracias por contactarnos. Te responderemos a la brevedad.</p>
          </div>`;
        UI.toast('Mensaje enviado correctamente', 'success');
      } catch (err) {
        UI.toast(err.message || 'Error al enviar mensaje', 'error');
        btn.disabled = false;
        btn.textContent = 'Enviar mensaje';
      }
    });
  }
};
