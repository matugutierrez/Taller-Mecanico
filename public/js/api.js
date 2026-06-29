const API = {
  _base: '/api',

  async _fetch(path, opts = {}) {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    };
    const res = await fetch(this._base + path, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error de conexión');
    return data;
  },

  get:   (path)       => API._fetch(path),
  post:  (path, body) => API._fetch(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:   (path, body) => API._fetch(path, { method: 'PUT',   body: JSON.stringify(body) }),
  del:   (path)       => API._fetch(path, { method: 'DELETE' }),

  getServices:     ()                    => API.get('/services'),
  getService:      (id)                 => API.get(`/services/${id}`),
  getAppointments: (params)             => API.get(`/appointments?${new URLSearchParams(params)}`),
  getAvailability: (date)               => API.get(`/appointments/availability?date=${date}`),
  createAppointment:(data)              => API.post('/appointments', data),
  getReviews:      (all)                => API.get(`/reviews${all ? '?all=true' : ''}`),
  createReview:    (data)               => API.post('/reviews', data),
  getBlogPosts:    (params)             => API.get(`/blog?${new URLSearchParams(params)}`),
  getBlogPost:     (slug)               => API.get(`/blog/${slug}`),
  createBlogPost:  (data)               => API.post('/blog', data),
  sendContact:     (data)               => API.post('/contact', data),
  getGallery:      (category)           => API.get(`/gallery${category ? `?category=${category}` : ''}`),
  getFAQ:          (category)           => API.get(`/faq${category ? `?category=${category}` : ''}`),
  getStats:        ()                   => API.get('/stats')
};
