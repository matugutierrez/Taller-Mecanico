const Utils = {
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  debounce(fn, ms = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  },

  formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  },

  formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  },

  slugify(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  },

  starsHtml(rating, size = 20) {
    let html = '<span class="reviews-stars">';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" class="star-filled"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      } else {
        html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" class="star-empty" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      }
    }
    html += '</span>';
    return html;
  },

  getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  },

  getMondayBased(day) {
    return day === 0 ? 6 : day - 1;
  },

  isToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  },

  isPastDate(year, month, day) {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  },

  getReadingTime(text) {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  },

  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  dayNames: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  dayNamesFull: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
};
