const Booking = {
  _step: 1,
  _data: {
    service: '',
    date: null,
    time: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    notes: ''
  },
  _currentMonth: new Date().getMonth(),
  _currentYear: new Date().getFullYear(),

  render() {
    return `
    <div class="booking-page view">
      <div class="section-header reveal">
        <span class="section-tag">Turnos</span>
        <h2 class="section-title">Reservá tu turno</h2>
        <p class="section-desc">En 3 pasos simples. Sin necesidad de llamar.</p>
      </div>
      <div id="bookingApp"></div>
    </div>`;
  },

  afterRender() {
    this._step = 1;
    this._data = { service: '', date: null, time: '', clientName: '', clientPhone: '', clientEmail: '', vehicleBrand: '', vehicleModel: '', vehicleYear: '', notes: '' };
    this._currentMonth = new Date().getMonth();
    this._currentYear = new Date().getFullYear();
    this.renderStep();
  },

  renderStep() {
    const container = document.getElementById('bookingApp');
    if (!container) return;
    const steps = ['Servicio', 'Fecha y hora', 'Tus datos'];
    container.innerHTML = `
      <div class="booking-steps">
        ${steps.map((s, i) => `
          <div class="booking-step ${i + 1 === this._step ? 'active' : ''} ${i + 1 < this._step ? 'completed' : ''}">
            <span class="booking-step-number">${i + 1 < this._step ? '✓' : i + 1}</span>
            <span>${s}</span>
          </div>
        `).join('')}
      </div>
      <div class="booking-form-card">
        ${this._step === 1 ? this.renderStep1() : ''}
        ${this._step === 2 ? this.renderStep2() : ''}
        ${this._step === 3 ? this.renderStep3() : ''}
        ${this._step === 4 ? this.renderStep4() : ''}
      </div>`;
    this.attachStepListeners();
  },

  renderStep1() {
    return `
      <h3>Seleccioná el servicio</h3>
      <div id="bookingServices"><div class="loading-state"><div class="loading-spinner"></div></div></div>`;
  },

  renderStep2() {
    const days = Utils.getMonthDays(this._currentYear, this._currentMonth);
    const firstDayIndex = days.findIndex(d => d !== null);
    const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    return `
      <h3>Elegí fecha y horario</h3>
      <div class="calendar-grid">
        <div class="calendar-header">
          <button id="calPrev" aria-label="Mes anterior">‹</button>
          <span>${Utils.monthNames[this._currentMonth]} ${this._currentYear}</span>
          <button id="calNext" aria-label="Mes siguiente">›</button>
        </div>
        ${dayNames.map(d => `<div class="calendar-day-name">${d}</div>`).join('')}
        ${days.map((d, i) => {
          if (d === null) return '<div class="calendar-day empty"></div>';
          const isDisabled = Utils.isPastDate(this._currentYear, this._currentMonth, d) || (i % 7 === 0 || i % 7 === 6);
          const isSelected = this._data.date && new Date(this._data.date).getTime() === new Date(this._currentYear, this._currentMonth, d).getTime();
          const isToday = Utils.isToday(this._currentYear, this._currentMonth, d);
          return `<div class="calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" data-day="${d}">${d}</div>`;
        }).join('')}
      </div>
      <div id="timeSlotsContainer">
        ${this._data.date ? '<h4 style="margin-bottom:12px;font-size:15px">Horarios disponibles</h4><div class="time-slots" id="timeSlots"><div class="loading-state" style="padding:20px"><div class="loading-spinner"></div></div></div>' : '<p style="color:var(--text-muted);text-align:center;padding:20px">Seleccioná una fecha para ver los horarios disponibles</p>'}
      </div>
      <div class="booking-nav">
        <button class="booking-prev" id="bookingStepBack">Atrás</button>
        <button class="booking-next" id="bookingStepNext" ${!this._data.time ? 'disabled' : ''}>Continuar</button>
      </div>`;
  },

  renderStep3() {
    return `
      <h3>Tus datos y vehículo</h3>
      <form id="bookingForm" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label for="bName">Nombre *</label>
            <input type="text" id="bName" required minlength="2" value="${Utils.escapeHtml(this._data.clientName)}" placeholder="Tu nombre completo">
          </div>
          <div class="form-group">
            <label for="bPhone">Teléfono *</label>
            <input type="tel" id="bPhone" required value="${Utils.escapeHtml(this._data.clientPhone)}" placeholder="+54 9 11 ...">
          </div>
        </div>
        <div class="form-group">
          <label for="bEmail">Email</label>
          <input type="email" id="bEmail" value="${Utils.escapeHtml(this._data.clientEmail)}" placeholder="tu@email.com">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="bBrand">Marca *</label>
            <input type="text" id="bBrand" required value="${Utils.escapeHtml(this._data.vehicleBrand)}" placeholder="Ej: Volkswagen">
          </div>
          <div class="form-group">
            <label for="bModel">Modelo *</label>
            <input type="text" id="bModel" required value="${Utils.escapeHtml(this._data.vehicleModel)}" placeholder="Ej: Gol">
          </div>
        </div>
        <div class="form-group">
          <label for="bYear">Año *</label>
          <input type="number" id="bYear" required min="1980" max="2030" value="${Utils.escapeHtml(this._data.vehicleYear)}" placeholder="Ej: 2015">
        </div>
        <div class="form-group">
          <label for="bNotes">Notas adicionales</label>
          <textarea id="bNotes" rows="3" placeholder="Contanos el problema o cualquier detalle...">${Utils.escapeHtml(this._data.notes)}</textarea>
        </div>
      </form>
      <div class="booking-nav">
        <button class="booking-prev" id="bookingStepBack">Atrás</button>
        <button class="booking-next" id="bookingStepNext">Confirmar turno</button>
      </div>`;
  },

  renderStep4() {
    return `
      <div class="form-success">
        <div class="form-success-icon">✓</div>
        <h3 style="font-size:22px;margin-bottom:8px">Turno solicitado</h3>
        <p style="color:var(--text-secondary);margin-bottom:24px">Te confirmaremos por WhatsApp a la brevedad.</p>
        <div class="booking-summary">
          <div class="booking-summary-row"><span>Servicio</span><span>${Utils.escapeHtml(this._data.service)}</span></div>
          <div class="booking-summary-row"><span>Fecha</span><span>${Utils.formatDate(this._data.date)}</span></div>
          <div class="booking-summary-row"><span>Horario</span><span>${this._data.time}</span></div>
          <div class="booking-summary-row"><span>Vehículo</span><span>${Utils.escapeHtml(this._data.vehicleBrand)} ${Utils.escapeHtml(this._data.vehicleModel)} (${this._data.vehicleYear})</span></div>
          <div class="booking-summary-row"><span>Nombre</span><span>${Utils.escapeHtml(this._data.clientName)}</span></div>
        </div>
        <a href="#/" class="btn-primary" data-route="home">Volver al inicio</a>
      </div>`;
  },

  attachStepListeners() {
    if (this._step === 1) {
      const container = document.getElementById('bookingServices');
      if (container) this.loadServices();
    }
    if (this._step === 2) {
      this.attachCalendarListeners();
      if (this._data.date) this.loadTimeSlots();
    }
    document.getElementById('bookingStepBack')?.addEventListener('click', () => {
      if (this._step > 1) { this._step--; this.renderStep(); }
    });
    document.getElementById('bookingStepNext')?.addEventListener('click', () => {
      if (this._step === 3) {
        if (this.validateStep3()) {
          this.submitBooking();
        }
      } else if (this._step === 2 && this._data.time) {
        this._step++;
        this.renderStep();
      } else if (this._step === 1 && this._data.service) {
        this._step++;
        this.renderStep();
      }
    });
  },

  async loadServices() {
    const container = document.getElementById('bookingServices');
    if (!container) return;
    try {
      const services = await API.getServices();
      container.innerHTML = services.map(s => `
        <div class="service-card" style="cursor:pointer;margin-bottom:12px" data-service="${Utils.escapeHtml(s.name)}">
          <h3>${Utils.escapeHtml(s.name)}</h3>
          <p>${Utils.escapeHtml(s.description.substring(0, 100))}...</p>
          ${s.price ? `<div class="service-card-price">$${s.price.toLocaleString('es-AR')}</div>` : ''}
        </div>
      `).join('');
      container.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
          container.querySelectorAll('.service-card').forEach(c => c.style.borderColor = '');
          card.style.borderColor = 'var(--primary)';
          this._data.service = card.dataset.service;
        });
      });
    } catch (err) {
      container.innerHTML = `<div class="error-state"><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }
  },

  attachCalendarListeners() {
    document.querySelectorAll('.calendar-day:not(.disabled):not(.empty)').forEach(el => {
      el.addEventListener('click', () => {
        const day = parseInt(el.dataset.day);
        this._data.date = new Date(this._currentYear, this._currentMonth, day).toISOString();
        this._data.time = '';
        this.renderStep();
      });
    });
    document.getElementById('calPrev')?.addEventListener('click', () => {
      this._currentMonth--;
      if (this._currentMonth < 0) { this._currentMonth = 11; this._currentYear--; }
      this.renderStep();
    });
    document.getElementById('calNext')?.addEventListener('click', () => {
      this._currentMonth++;
      if (this._currentMonth > 11) { this._currentMonth = 0; this._currentYear++; }
      this.renderStep();
    });
  },

  async loadTimeSlots() {
    const container = document.getElementById('timeSlots');
    if (!container) return;
    try {
      const dateStr = this._data.date.split('T')[0];
      const data = await API.getAvailability(dateStr);
      if (!data.slots || !data.slots.length) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:12px">No hay horarios disponibles para esta fecha</p>';
        return;
      }
      container.innerHTML = data.slots.map(s => `
        <button class="time-slot ${this._data.time === s ? 'selected' : ''}" data-time="${s}">${s}</button>
      `).join('');
      container.querySelectorAll('.time-slot').forEach(el => {
        el.addEventListener('click', () => {
          container.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
          el.classList.add('selected');
          this._data.time = el.dataset.time;
          document.getElementById('bookingStepNext').disabled = false;
        });
      });
    } catch {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:12px">Error al cargar horarios</p>';
    }
  },

  validateStep3() {
    const errors = [];
    const fields = {
      name: document.getElementById('bName'),
      phone: document.getElementById('bPhone'),
      email: document.getElementById('bEmail'),
      brand: document.getElementById('bBrand'),
      model: document.getElementById('bModel'),
      year: document.getElementById('bYear')
    };
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
    if (!fields.name.value.trim() || fields.name.value.trim().length < 2) errors.push({ field: 'bName', msg: 'Nombre inválido' });
    if (!fields.phone.value.trim() || fields.phone.value.trim().length < 7) errors.push({ field: 'bPhone', msg: 'Teléfono inválido' });
    if (!fields.brand.value.trim()) errors.push({ field: 'bBrand', msg: 'Marca requerida' });
    if (!fields.model.value.trim()) errors.push({ field: 'bModel', msg: 'Modelo requerido' });
    if (!fields.year.value || fields.year.value < 1980 || fields.year.value > 2030) errors.push({ field: 'bYear', msg: 'Año inválido (1980-2030)' });
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
      return false;
    }
    this._data.clientName = fields.name.value.trim();
    this._data.clientPhone = fields.phone.value.trim();
    this._data.clientEmail = fields.email.value.trim();
    this._data.vehicleBrand = fields.brand.value.trim();
    this._data.vehicleModel = fields.model.value.trim();
    this._data.vehicleYear = parseInt(fields.year.value);
    this._data.notes = document.getElementById('bNotes')?.value.trim() || '';
    return true;
  },

  async submitBooking() {
    const btn = document.getElementById('bookingStepNext');
    btn.disabled = true;
    btn.textContent = 'Reservando...';
    try {
      await API.createAppointment({
        clientName: this._data.clientName,
        clientPhone: this._data.clientPhone,
        clientEmail: this._data.clientEmail,
        vehicleBrand: this._data.vehicleBrand,
        vehicleModel: this._data.vehicleModel,
        vehicleYear: this._data.vehicleYear,
        service: this._data.service,
        date: this._data.date,
        time: this._data.time,
        notes: this._data.notes
      });
      this._step = 4;
      this.renderStep();
      UI.toast('Turno reservado con éxito', 'success');
    } catch (err) {
      UI.toast(err.message || 'Error al reservar turno', 'error');
      btn.disabled = false;
      btn.textContent = 'Confirmar turno';
    }
  }
};
