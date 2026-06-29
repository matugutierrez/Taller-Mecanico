const Reviews = {
  render() {
    return `
    <div class="reviews-page view" id="reviewsPage">
      <div class="section-header reveal">
        <span class="section-tag">Testimonios</span>
        <h2 class="section-title">Opiniones de clientes</h2>
        <p class="section-desc">Tu opinión nos ayuda a mejorar. Dejanos tu reseña.</p>
      </div>
      <div id="reviewsContent"><div class="loading-state"><div class="loading-spinner"></div></div></div>
    </div>
    <div id="reviewModal" class="review-modal" hidden role="dialog" aria-label="Nueva reseña">
      <div class="review-modal-backdrop"></div>
      <div class="review-modal-content">
        <h3 style="font-size:22px;font-weight:700;margin-bottom:24px">Dejanos tu opinión</h3>
        <form id="reviewForm" novalidate>
          <div class="form-group">
            <label>Puntuación *</label>
            <div class="star-rating" id="starRating">
              ${[1,2,3,4,5].map(n => `
                <button type="button" data-rating="${n}" aria-label="${n} estrellas">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </button>
              `).join('')}
            </div>
            <div class="form-error" id="ratingError" hidden>Seleccioná una puntuación</div>
          </div>
          <div class="form-group">
            <label for="reviewName">Nombre *</label>
            <input type="text" id="reviewName" required minlength="2" placeholder="Tu nombre">
          </div>
          <div class="form-group">
            <label for="reviewComment">Comentario *</label>
            <textarea id="reviewComment" required minlength="5" maxlength="1000" rows="4" placeholder="Contanos tu experiencia..."></textarea>
          </div>
          <button type="submit" class="btn-primary" style="width:100%">Enviar reseña</button>
        </form>
      </div>
    </div>`;
  },

  afterRender() {
    this.loadReviews();
    const modal = document.getElementById('reviewModal');
    if (modal) {
      modal.querySelector('.review-modal-backdrop')?.addEventListener('click', () => modal.hidden = true);
      this.setupStarRating();
      const form = document.getElementById('reviewForm');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const rating = document.querySelector('#starRating .selected');
          const name = document.getElementById('reviewName').value.trim();
          const comment = document.getElementById('reviewComment').value.trim();
          if (!rating) { document.getElementById('ratingError').hidden = false; return; }
          document.getElementById('ratingError').hidden = true;
          try {
            await API.createReview({
              clientName: name,
              rating: parseInt(rating.dataset.rating),
              comment: comment
            });
            UI.toast('Gracias por tu reseña. Será publicada después de revisión.', 'success');
            modal.hidden = true;
            form.reset();
            document.querySelectorAll('#starRating button').forEach(b => b.querySelector('svg').setAttribute('fill', 'none'));
            document.querySelectorAll('#starRating .selected').forEach(b => b.classList.remove('selected'));
          } catch (err) {
            UI.toast(err.message || 'Error al enviar reseña', 'error');
          }
        });
      }
    }
  },

  async loadReviews() {
    const container = document.getElementById('reviewsContent');
    if (!container) return;
    try {
      const data = await API.getReviews();
      container.innerHTML = `
        <div class="reviews-header reveal">
          <div class="reviews-stats">
            <div class="reviews-avg">
              <div class="reviews-avg-number">${(data.stats?.avg || 0).toFixed(1)}</div>
              <div class="reviews-avg-label">${Utils.starsHtml(Math.round(data.stats?.avg || 0))}</div>
              <div class="reviews-avg-label">${data.stats?.count || 0} reseñas</div>
            </div>
          </div>
          <button class="btn-primary" id="addReviewBtn">Escribir reseña</button>
        </div>
        <div class="reviews-list">
          ${data.reviews?.length ? data.reviews.map(r => `
            <div class="review-card reveal">
              <div class="review-card-header">
                <span class="review-card-name">${Utils.escapeHtml(r.clientName)}</span>
                <span class="review-card-date">${Utils.formatDate(r.createdAt)}</span>
              </div>
              ${Utils.starsHtml(r.rating)}
              <p class="review-card-text" style="margin-top:8px">${Utils.escapeHtml(r.comment)}</p>
            </div>
          `).join('') : '<div class="empty-state">No hay reseñas aún. ¡Sé el primero!</div>'}
        </div>`;
      document.getElementById('addReviewBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('reviewModal');
        if (modal) modal.hidden = false;
      });
      Animations.refresh();
    } catch (err) {
      container.innerHTML = `<div class="error-state"><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }
  },

  setupStarRating() {
    const container = document.getElementById('starRating');
    if (!container) return;
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const rating = parseInt(btn.dataset.rating);
      container.querySelectorAll('.selected').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      container.querySelectorAll('button').forEach((b, i) => {
        const svg = b.querySelector('svg');
        if (svg) svg.setAttribute('fill', i < rating ? '#fbbf24' : 'none');
      });
    });
  }
};
