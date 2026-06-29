const app = {
    currentRoute: '',
    currentPage: 1,

    init() {
        auth.init();
        this.setupNav();
        this.setupRouter();
        this.setupGlobalListeners();
    },

    setupNav() {
        document.getElementById('navToggle').addEventListener('click', () => {
            document.getElementById('navMenu').classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('navMenu').classList.remove('active');
            });
        });

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    },

    setupRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    setupGlobalListeners() {
        document.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal && e.target === modal) {
                modal.remove();
            }
        });
    },

    navigate(hash) {
        window.location.hash = hash;
    },

    handleRoute() {
        const hash = window.location.hash || '#/';
        const path = hash.replace('#', '') || '/';

        if (path === this.currentRoute) return;
        this.currentRoute = path;

        this.showLoading(true);

        const routes = {
            '/': () => this.renderHome(),
            '/servicios': () => this.renderServices(),
            '/galeria': () => this.renderGallery(),
            '/reservar': () => this.renderBooking(),
            '/testimonios': () => this.renderTestimonials(),
            '/contacto': () => this.renderContact(),
            '/login': () => this.renderLogin(),
            '/registro': () => this.renderRegister(),
            '/perfil': () => this.renderProfile(),
            '/mis-turnos': () => this.renderMyAppointments(),
            '/admin': () => this.renderAdmin(),
        };

        const handler = routes[path];
        if (handler) {
            handler();
        } else if (path.startsWith('/servicios/')) {
            const slug = path.split('/')[2];
            this.renderServiceDetail(slug);
        } else {
            this.renderNotFound();
        }

        this.updateActiveNavLink(path);
    },

    updateActiveNavLink(path) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${path}`) {
                link.classList.add('active');
            }
        });
    },

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        const content = document.getElementById('page-content');
        if (show) {
            spinner.classList.remove('hidden');
            content.innerHTML = '';
        } else {
            spinner.classList.add('hidden');
        }
    },

    setContent(html) {
        const content = document.getElementById('page-content');
        content.innerHTML = html;
        this.showLoading(false);
    },

    showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: 'check-circle', error: 'times-circle', info: 'info-circle', warning: 'exclamation-triangle' };
        toast.innerHTML = `<i class="fas fa-${icons[type] || icons.info}"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // === HOME ===
    async renderHome() {
        try {
            const servicesRes = await api.getServices({ featured: 'true', per_page: 4 });
            const reviewsRes = await api.getReviews({ featured: 'true', approved: 'true', per_page: 3 });

            const services = servicesRes.services || [];
            const reviews = reviewsRes.reviews || [];

            const servicesHtml = services.map(s => `
                <div class="service-card">
                    <div class="service-icon"><i class="fas fa-${s.icon || 'wrench'}"></i></div>
                    <h3>${s.name}</h3>
                    <p>${s.short_description || s.description?.substring(0, 120) + '...'}</p>
                    <div class="service-card-footer">
                        <div>
                            <div class="service-price">$${s.discount_price || s.price} <small>${s.discount_price ? `$${s.price}` : ''}</small></div>
                        </div>
                        <div class="service-duration"><i class="far fa-clock"></i> ${s.duration_minutes} min</div>
                    </div>
                </div>
            `).join('');

            const reviewsHtml = reviews.map(r => `
                <div class="testimonial-card">
                    <div class="testimonial-stars">${'<i class="fas fa-star"></i>'.repeat(r.rating)}${'<i class="far fa-star"></i>'.repeat(5 - r.rating)}</div>
                    <blockquote>"${r.comment}"</blockquote>
                    <div class="testimonial-author">
                        <div class="testimonial-avatar">${r.author_name?.charAt(0) || 'A'}</div>
                        <div>
                            <h4>${r.author_name}</h4>
                            <p>${r.service_used || 'Cliente'}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            this.setContent(`
                <section class="hero">
                    <div class="hero-bg"></div>
                    <div class="hero-overlay"></div>
                    <div class="hero-container">
                        <div class="hero-text">
                            <div class="hero-badge"><i class="fas fa-certificate"></i> Excelencia Automotriz desde 2004</div>
                            <h1>El <span>Mejor Taller</span> para tu Auto</h1>
                            <p>Diagnóstico computarizado de última generación, técnicos especializados y la garantía que tu vehículo merece. Servicio premium con resultados visibles.</p>
                            <div class="hero-actions">
                                <a href="#/reservar" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i> Reserva tu Turno</a>
                                <a href="#/servicios" class="btn btn-outline btn-lg"><i class="fas fa-tools"></i> Ver Servicios</a>
                            </div>
                            <div class="hero-stats">
                                <div class="hero-stat"><h3>20+</h3><p>Años de Experiencia</p></div>
                                <div class="hero-stat"><h3>15K+</h3><p>Autos Reparados</p></div>
                                <div class="hero-stat"><h3>98%</h3><p>Clientes Satisfechos</p></div>
                            </div>
                        </div>
                        <div class="hero-visual">
                            <div class="hero-card">
                                <div class="hero-card-grid">
                                    <div class="hero-card-item"><i class="fas fa-oil-can"></i><h4>Cambio de Aceite</h4><p>Desde $4.500</p></div>
                                    <div class="hero-card-item"><i class="fas fa-car-battery"></i><h4>Diagnóstico</h4><p>Desde $3.500</p></div>
                                    <div class="hero-card-item"><i class="fas fa-brake-warning"></i><h4>Frenos</h4><p>Desde $8.500</p></div>
                                    <div class="hero-card-item"><i class="fas fa-car-side"></i><h4>Suspensión</h4><p>Desde $12.000</p></div>
                                </div>
                            </div>
                            <div class="hero-float-card">
                                <i class="fas fa-shield-alt"></i>
                                <div>
                                    <h4>Garantía 12 Meses</h4>
                                    <p>En todos nuestros servicios</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="why-us">
                    <div class="section">
                        <div class="section-header">
                            <div class="section-tag"><i class="fas fa-star"></i> ¿Por qué Elegirnos?</div>
                            <h2>Excelencia que se Siente en Cada Kilómetro</h2>
                            <p>No somos un taller común. Somos apasionados por la mecánica de precisión.</p>
                        </div>
                        <div class="features-grid">
                            <div class="feature-card"><i class="fas fa-microchip"></i><h3>Tecnología de Punta</h3><p>Escáneres multimarca, alineación 3D y equipamiento alemán para diagnósticos precisos.</p></div>
                            <div class="feature-card"><i class="fas fa-user-tie"></i><h3>Técnicos Certificados</h3><p>Nuestro equipo cuenta con certificaciones internacionales y formación continua.</p></div>
                            <div class="feature-card"><i class="fas fa-shield-halved"></i><h3>Garantía Escrita</h3><p>Todos nuestros servicios incluyen garantía de 12 meses en mano de obra y repuestos.</p></div>
                            <div class="feature-card"><i class="fas fa-clock"></i><h3>Servicio Rápido</h3><p>Optimizamos tu tiempo con diagnóstico exprés y cumplimiento puntual de entregas.</p></div>
                            <div class="feature-card"><i class="fas fa-hand-holding-dollar"></i><h3>Mejor Precio</h3><p>Relación calidad-precio inigualable con presupuestos sin cargo ni compromiso.</p></div>
                            <div class="feature-card"><i class="fas fa-truck"></i><h3>Grúa Propia</h3><p>Asistencia y remolque inmediato ante cualquier emergencia en CABA y GBA.</p></div>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="section">
                        <div class="section-header">
                            <div class="section-tag"><i class="fas fa-wrench"></i> Servicios Destacados</div>
                            <h2>Lo que Hacemos Mejor</h2>
                            <p>Ofrecemos soluciones completas para tu vehículo con la más alta calidad.</p>
                        </div>
                        <div class="services-grid">${servicesHtml}</div>
                        <div style="text-align:center;margin-top:32px">
                            <a href="#/servicios" class="btn btn-primary"><i class="fas fa-arrow-right"></i> Ver Todos los Servicios</a>
                        </div>
                    </div>
                </section>

                <section class="why-us">
                    <div class="section">
                        <div class="section-header">
                            <div class="section-tag"><i class="fas fa-comments"></i> Lo que Dicen Nuestros Clientes</div>
                            <h2>Testimonios Reales</h2>
                            <p>La satisfacción de nuestros clientes habla por sí sola.</p>
                        </div>
                        <div class="testimonials-grid">${reviewsHtml || '<p style="text-align:center;color:var(--gray)">Sé el primero en dejar tu reseña.</p>'}</div>
                        <div style="text-align:center;margin-top:32px">
                            <a href="#/testimonios" class="btn btn-outline">Ver Todos los Testimonios</a>
                        </div>
                    </div>
                </section>
            `);
        } catch (error) {
            this.setContent('<div class="section"><p style="text-align:center;color:var(--primary)">Error al cargar la página. Intenta de nuevo.</p></div>');
        }
    },

    // === SERVICES ===
    async renderServices() {
        try {
            const params = new URLSearchParams(window.location.search);
            const category = new URLSearchParams(window.location.hash.split('?')[1]).get('category') || '';
            const search = new URLSearchParams(window.location.hash.split('?')[1]).get('search') || '';
            const page = parseInt(new URLSearchParams(window.location.hash.split('?')[1]).get('page')) || 1;

            const res = await api.getServices({ per_page: 12, page, category: category || undefined, search: search || undefined });
            const categoriesRes = await api.getCategories();

            const services = res.services || [];
            const categories = categoriesRes.categories || [];

            const servicesHtml = services.map(s => `
                <div class="service-card" onclick="app.navigate('#/servicios/${s.slug}')" style="cursor:pointer">
                    <div class="service-icon"><i class="fas fa-${s.icon || 'wrench'}"></i></div>
                    <h3>${s.name}</h3>
                    <p>${s.short_description || s.description?.substring(0, 120) + '...'}</p>
                    <div style="margin-bottom:12px"><span style="font-size:.75rem;color:var(--accent);background:rgba(69,123,157,.1);padding:2px 10px;border-radius:50px">${s.category}</span></div>
                    <div class="service-card-footer">
                        <div class="service-price">$${s.discount_price || s.price} <small>${s.discount_price ? `$${s.price}` : ''}</small></div>
                        <div class="service-duration"><i class="far fa-clock"></i> ${s.duration_minutes} min</div>
                    </div>
                </div>
            `).join('');

            const pagHtml = res.pages > 1 ? `
                <div style="display:flex;justify-content:center;gap:8px;margin-top:32px">
                    ${Array.from({length: res.pages}, (_, i) => `
                        <a href="#/servicios?page=${i + 1}${category ? `&category=${category}` : ''}" 
                           class="btn btn-sm ${i + 1 === page ? 'btn-primary' : 'btn-outline'}" 
                           style="min-width:40px">${i + 1}</a>
                    `).join('')}
                </div>
            ` : '';

            const catsHtml = categories.map(c => `
                <a href="#/servicios?category=${encodeURIComponent(c)}" class="btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}">${c}</a>
            `).join('');

            this.setContent(`
                <div class="section">
                    <div class="section-header">
                        <div class="section-tag"><i class="fas fa-tools"></i> Servicios</div>
                        <h2>Todos Nuestros Servicios</h2>
                        <p>Desde mantenimiento básico hasta reparaciones complejas.</p>
                    </div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:32px">
                        <a href="#/servicios" class="btn btn-sm ${!category ? 'btn-primary' : 'btn-outline'}">Todos</a>
                        ${catsHtml}
                    </div>
                    <div style="max-width:500px;margin:0 auto 40px">
                        <input type="text" id="searchServices" placeholder="Buscar servicios..." value="${search}" 
                               style="width:100%;padding:12px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius-sm);color:var(--white);font-size:.9rem"
                               onkeyup="if(event.key==='Enter'){app.navigate('#/servicios?search='+encodeURIComponent(this.value))}">
                    </div>
                    <div class="services-grid">${servicesHtml || '<p style="text-align:center;color:var(--gray);grid-column:1/-1">No se encontraron servicios.</p>'}</div>
                    ${pagHtml}
                </div>
            `);
        } catch (error) {
            this.setContent('<div class="section"><p style="text-align:center;color:var(--primary)">Error al cargar servicios.</p></div>');
        }
    },

    async renderServiceDetail(slug) {
        try {
            const res = await api.getService(slug);
            const s = res.service;
            if (!s) { this.renderNotFound(); return; }

            this.setContent(`
                <div class="section" style="max-width:800px">
                    <a href="#/servicios" class="btn btn-outline btn-sm" style="margin-bottom:24px"><i class="fas fa-arrow-left"></i> Volver</a>
                    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius-lg);padding:40px">
                        <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
                            <div style="width:70px;height:70px;background:rgba(230,57,70,.1);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--primary)">
                                <i class="fas fa-${s.icon || 'wrench'}"></i>
                            </div>
                            <div>
                                <h2 style="font-size:1.8rem">${s.name}</h2>
                                <span style="font-size:.85rem;color:var(--accent);background:rgba(69,123,157,.1);padding:4px 12px;border-radius:50px">${s.category}</span>
                            </div>
                        </div>
                        <p style="color:var(--gray-light);line-height:1.8;margin-bottom:24px">${s.description}</p>
                        <div style="display:flex;gap:32px;flex-wrap:wrap;padding:20px;background:rgba(255,255,255,.03);border-radius:var(--radius-md);margin-bottom:24px">
                            <div><span style="color:var(--gray);font-size:.8rem">Precio</span><div style="font-size:1.8rem;font-weight:800;color:var(--primary)">$${s.discount_price || s.price} ${s.discount_price ? `<small style="font-size:.9rem;color:var(--gray);text-decoration:line-through">$${s.price}</small>` : ''}</div></div>
                            <div><span style="color:var(--gray);font-size:.8rem">Duración</span><div style="font-size:1.2rem;font-weight:600"><i class="far fa-clock"></i> ${s.duration_minutes} minutos</div></div>
                        </div>
                        <a href="#/reservar?service=${s.id}" class="btn btn-primary btn-lg" style="width:100%"><i class="fas fa-calendar-check"></i> Reservar este Servicio</a>
                    </div>
                </div>
            `);
        } catch {
            this.renderNotFound();
        }
    },

    // === GALLERY ===
    async renderGallery() {
        try {
            const res = await api.getGallery({ per_page: 30 });
            const images = res.images || [];

            const html = images.map(img => `
                <div class="gallery-item" onclick="app.openGalleryModal('${img.image_url}','${img.title}')">
                    <img src="${img.image_url}" alt="${img.alt_text || img.title || 'Taller'}" loading="lazy">
                    <div class="gallery-item-overlay"><h4>${img.title || 'Trabajo realizado'}</h4></div>
                </div>
            `).join('');

            this.setContent(`
                <div class="section">
                    <div class="section-header">
                        <div class="section-tag"><i class="fas fa-images"></i> Galería</div>
                        <h2>Nuestros Trabajos</h2>
                        <p>Mirá la calidad de nuestro trabajo en cada detalle.</p>
                    </div>
                    <div class="gallery-grid">${html || '<p style="text-align:center;color:var(--gray);grid-column:1/-1">Galería próximamente.</p>'}</div>
                </div>
            `);
        } catch {
            this.setContent('<div class="section"><p style="text-align:center;color:var(--gray)">Galería no disponible.</p></div>');
        }
    },

    openGalleryModal(src, title) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div style="max-width:900px;width:100%;background:transparent;text-align:center">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()" style="color:var(--white);background:rgba(0,0,0,.5)"><i class="fas fa-times"></i></button>
                <img src="${src}" alt="${title}" style="width:100%;border-radius:12px;max-height:80vh;object-fit:contain">
                ${title ? `<p style="color:var(--white);margin-top:12px;font-size:.9rem">${title}</p>` : ''}
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // === BOOKING ===
    async renderBooking() {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const preselectedService = params.get('service');

        try {
            const servicesRes = await api.getServices({ is_active: 'true', per_page: 50 });
            const services = servicesRes.services || [];
            const serviceOptions = services.map(s =>
                `<option value="${s.id}" ${preselectedService == s.id ? 'selected' : ''}>${s.name} - $${s.discount_price || s.price} (${s.duration_minutes} min)</option>`
            ).join('');

            this.setContent(`
                <div class="section">
                    <div class="section-header">
                        <div class="section-tag"><i class="fas fa-calendar-check"></i> Reserva</div>
                        <h2>Reserva tu Turno</h2>
                        <p>Elegí el servicio, la fecha y te confirmamos al instante.</p>
                    </div>
                    <div class="booking-form">
                        <form id="bookingForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Servicio *</label>
                                    <select id="bookingService" required onchange="app.loadTimeSlots()">
                                        <option value="">Seleccionar servicio...</option>
                                        ${serviceOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Fecha *</label>
                                    <input type="date" id="bookingDate" required min="${new Date().toISOString().split('T')[0]}" onchange="app.loadTimeSlots()">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Horario Disponible</label>
                                <div id="timeSlotsContainer" style="color:var(--gray);font-size:.85rem">Seleccioná un servicio y fecha para ver horarios.</div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Marca del Vehículo *</label>
                                    <input type="text" id="bookingBrand" placeholder="Ej: Toyota, Ford, VW" required>
                                </div>
                                <div class="form-group">
                                    <label>Modelo *</label>
                                    <input type="text" id="bookingModel" placeholder="Ej: Corolla, Focus, Golf" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Año</label>
                                    <input type="number" id="bookingYear" placeholder="Ej: 2020" min="1980" max="${new Date().getFullYear() + 1}">
                                </div>
                                <div class="form-group">
                                    <label>Patente</label>
                                    <input type="text" id="bookingLicense" placeholder="Ej: ABC123" style="text-transform:uppercase">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notas</label>
                                <textarea id="bookingNotes" placeholder="Contanos detalles adicionales (opcional)"></textarea>
                            </div>
                            <div id="bookingSummary" style="display:none;background:rgba(45,106,79,.1);border:1px solid rgba(45,106,79,.3);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px"></div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary btn-lg" style="width:100%"><i class="fas fa-calendar-check"></i> Confirmar Reserva</button>
                            </div>
                            <p style="text-align:center;margin-top:16px;font-size:.8rem;color:var(--gray)">${api.isAuthenticated() ? '' : '¿Ya tenés cuenta? <a href="#/login" style="color:var(--primary)">Iniciá sesión</a> para una experiencia más rápida.'}</p>
                        </form>
                    </div>
                </div>
            `);

            document.getElementById('bookingForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitBooking();
            });

            if (preselectedService) {
                this.loadTimeSlots();
            }
        } catch (error) {
            this.setContent('<div class="section"><p style="text-align:center;color:var(--primary)">Error al cargar el formulario.</p></div>');
        }
    },

    selectedTimeSlot: null,

    async loadTimeSlots() {
        const serviceId = document.getElementById('bookingService')?.value;
        const date = document.getElementById('bookingDate')?.value;
        const container = document.getElementById('timeSlotsContainer');

        if (!serviceId || !date) {
            if (container) container.innerHTML = '<span style="color:var(--gray)">Seleccioná un servicio y fecha para ver horarios.</span>';
            return;
        }

        container.innerHTML = '<span style="color:var(--gray)"><i class="fas fa-spinner fa-spin"></i> Cargando horarios...</span>';

        try {
            const res = await api.getAvailableSlots(serviceId, date);
            const slots = res.slots || [];

            if (slots.length === 0) {
                container.innerHTML = '<span style="color:var(--primary)">No hay horarios disponibles para esta fecha. Probá con otra.</span>';
                return;
            }

            container.innerHTML = `<div class="time-slots">${slots.map(s => `
                <div class="time-slot ${s.available ? '' : 'unavailable'}" 
                     data-time="${s.time}" data-end="${s.end_time}"
                     onclick="${s.available ? `app.selectTimeSlot(this,'${s.time}','${s.end_time}')` : ''}">
                    ${s.time}
                </div>
            `).join('')}</div>`;
        } catch {
            if (container) container.innerHTML = '<span style="color:var(--primary)">Error al cargar horarios.</span>';
        }
    },

    selectTimeSlot(el, time, endTime) {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedTimeSlot = { time, endTime };
    },

    async submitBooking() {
        const serviceId = document.getElementById('bookingService').value;
        const date = document.getElementById('bookingDate').value;
        const brand = document.getElementById('bookingBrand').value;
        const model = document.getElementById('bookingModel').value;
        const year = document.getElementById('bookingYear').value;
        const license = document.getElementById('bookingLicense').value;
        const notes = document.getElementById('bookingNotes').value;

        if (!this.selectedTimeSlot) {
            this.showToast('Seleccioná un horario disponible', 'warning');
            return;
        }

        if (!api.isAuthenticated()) {
            this.showToast('Iniciá sesión para reservar un turno', 'warning');
            setTimeout(() => this.navigate('#/login'), 1500);
            return;
        }

        try {
            await api.createAppointment({
                service_id: parseInt(serviceId),
                appointment_date: date,
                appointment_time: this.selectedTimeSlot.time,
                vehicle_brand: brand,
                vehicle_model: model,
                vehicle_year: year ? parseInt(year) : undefined,
                vehicle_license: license,
                notes,
            });

            this.showToast('Turno reservado con éxito', 'success');
            document.getElementById('bookingForm').reset();
            this.selectedTimeSlot = null;
            document.getElementById('timeSlotsContainer').innerHTML = '<span style="color:var(--gray)">Turno confirmado. Revisá tu email.</span>';
        } catch (error) {
            this.showToast(error.error || 'Error al reservar', 'error');
        }
    },

    // === TESTIMONIALS ===
    async renderTestimonials() {
        try {
            const res = await api.getReviews({ approved: 'true', per_page: 50 });
            const reviews = res.reviews || [];

            const html = reviews.map(r => `
                <div class="testimonial-card">
                    <div class="testimonial-stars">${'<i class="fas fa-star"></i>'.repeat(r.rating)}${'<i class="far fa-star"></i>'.repeat(5 - r.rating)}</div>
                    <blockquote>"${r.comment}"</blockquote>
                    <div class="testimonial-author">
                        <div class="testimonial-avatar">${r.author_name?.charAt(0) || 'A'}</div>
                        <div>
                            <h4>${r.author_name}</h4>
                            <p>${r.service_used || 'Cliente'}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            this.setContent(`
                <div class="section">
                    <div class="section-header">
                        <div class="section-tag"><i class="fas fa-star"></i> Testimonios</div>
                        <h2>Lo que Dicen Nuestros Clientes</h2>
                        <p>Calificación promedio: ${res.average_rating ? Math.round(res.average_rating * 10) / 10 + ' / 5' : 'Sé el primero en calificar'}</p>
                    </div>
                    <div class="testimonials-grid">${html || '<p style="text-align:center;color:var(--gray);grid-column:1/-1">No hay testimonios aún. ¡Dejá tu reseña!</p>'}</div>
                    ${api.isAuthenticated() ? `
                        <div style="max-width:500px;margin:40px auto 0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius-lg);padding:32px">
                            <h3 style="text-align:center;margin-bottom:20px">Dejá tu Reseña</h3>
                            <form id="reviewForm">
                                <div class="form-group">
                                    <label>Calificación</label>
                                    <div id="ratingStars" style="display:flex;gap:4px;font-size:1.5rem;color:var(--warning);cursor:pointer">
                                        ${Array.from({length:5}, (_, i) => `<i class="far fa-star" data-rating="${i+1}" onmouseover="this.className='fas fa-star';this.style.color='var(--warning)'" onmouseout="document.querySelectorAll('#ratingStars i').forEach((s,j)=>s.className=j<=(this.dataset.rating-1)?'fas fa-star':'far fa-star')" onclick="document.getElementById('reviewRating').value=${i+1};document.querySelectorAll('#ratingStars i').forEach((s,j)=>s.className=j<=${i}?'fas fa-star':'far fa-star')"></i>`).join('')}
                                    </div>
                                    <input type="hidden" id="reviewRating" value="5">
                                </div>
                                <div class="form-group">
                                    <label>Servicio Utilizado</label>
                                    <input type="text" id="reviewService" placeholder="Ej: Cambio de Aceite">
                                </div>
                                <div class="form-group">
                                    <label>Comentario *</label>
                                    <textarea id="reviewComment" placeholder="Contá tu experiencia..." required minlength="10"></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width:100%">Enviar Reseña</button>
                            </form>
                        </div>
                    ` : '<p style="text-align:center;margin-top:32px"><a href="#/login" style="color:var(--primary)">Iniciá sesión</a> para dejar tu reseña.</p>'}
                </div>
            `);

            const reviewForm = document.getElementById('reviewForm');
            if (reviewForm) {
                reviewForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const rating = document.getElementById('reviewRating').value;
                    const comment = document.getElementById('reviewComment').value;
                    const serviceUsed = document.getElementById('reviewService').value;
                    try {
                        await api.createReview({ rating: parseInt(rating), comment, service_used: serviceUsed });
                        this.showToast('Reseña enviada para aprobación', 'success');
                        reviewForm.reset();
                    } catch (error) {
                        this.showToast(error.error || 'Error al enviar reseña', 'error');
                    }
                });
            }
        } catch {
            this.setContent('<div class="section"><p style="text-align:center;color:var(--primary)">Error al cargar testimonios.</p></div>');
        }
    },

    // === CONTACT ===
    renderContact() {
        this.setContent(`
            <div class="section">
                <div class="section-header">
                    <div class="section-tag"><i class="fas fa-envelope"></i> Contacto</div>
                    <h2>Estamos para Ayudarte</h2>
                    <p>Respondemos en menos de 2 horas hábiles.</p>
                </div>
                <div class="contact-grid">
                    <div>
                        <form id="contactForm" class="contact-form">
                            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                                <div class="form-group">
                                    <label>Nombre *</label>
                                    <input type="text" id="contactName" required minlength="2">
                                </div>
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" id="contactEmail" required>
                                </div>
                            </div>
                            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                                <div class="form-group">
                                    <label>Teléfono</label>
                                    <input type="tel" id="contactPhone">
                                </div>
                                <div class="form-group">
                                    <label>Asunto *</label>
                                    <select id="contactSubject" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="Consulta">Consulta</option>
                                        <option value="Presupuesto">Pedir Presupuesto</option>
                                        <option value="Urgencia">Urgencia</option>
                                        <option value="Reclamo">Reclamo</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Mensaje *</label>
                                <textarea id="contactMessage" required minlength="10"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-lg" style="width:100%"><i class="fas fa-paper-plane"></i> Enviar Mensaje</button>
                        </form>
                    </div>
                    <div class="contact-info">
                        <div class="contact-info-card">
                            <i class="fas fa-map-marker-alt"></i>
                            <div><h4>Ubicación</h4><p>Av. Corrientes 1234, CABA, Argentina</p></div>
                        </div>
                        <div class="contact-info-card">
                            <i class="fas fa-phone-alt"></i>
                            <div><h4>Teléfono</h4><p>+54 11 1234-5678<br><span style="font-size:.8rem;color:var(--primary)">Urgencias 24/7</span></p></div>
                        </div>
                        <div class="contact-info-card">
                            <i class="fas fa-envelope"></i>
                            <div><h4>Email</h4><p>info@tallerpremium.com</p></div>
                        </div>
                        <div class="contact-info-card">
                            <i class="fas fa-clock"></i>
                            <div><h4>Horarios</h4><p>Lun - Vie: 8:00 - 18:00<br>Sáb: 8:00 - 13:00</p></div>
                        </div>
                        <div style="border-radius:var(--radius-lg);overflow:hidden;height:250px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;color:var(--gray)">
                            <div style="text-align:center"><i class="fas fa-map" style="font-size:2rem;color:var(--primary);margin-bottom:8px"></i><p>Mapa interactivo</p></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value,
            };
            try {
                await api.sendContact(data);
                this.showToast('Mensaje enviado con éxito', 'success');
                e.target.reset();
            } catch (error) {
                this.showToast(error.error || 'Error al enviar mensaje', 'error');
            }
        });
    },

    // === AUTH PAGES ===
    renderLogin() {
        if (api.isAuthenticated()) { this.navigate('#/'); return; }
        this.setContent(`
            <div class="auth-container">
                <div class="auth-box">
                    <h2><i class="fas fa-wrench" style="color:var(--primary)"></i> Bienvenido</h2>
                    <p class="auth-subtitle">Iniciá sesión en tu cuenta</p>
                    <form id="loginForm">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="loginEmail" required placeholder="tu@email.com">
                        </div>
                        <div class="form-group">
                            <label>Contraseña</label>
                            <input type="password" id="loginPassword" required placeholder="••••••••" minlength="6">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Iniciar Sesión</button>
                        </div>
                        <div class="form-footer">¿No tenés cuenta? <a href="#/registro">Registrate</a></div>
                    </form>
                </div>
            </div>
        `);

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await auth.login(email, password);
        });
    },

    renderRegister() {
        if (api.isAuthenticated()) { this.navigate('#/'); return; }
        this.setContent(`
            <div class="auth-container">
                <div class="auth-box">
                    <h2><i class="fas fa-wrench" style="color:var(--primary)"></i> Crear Cuenta</h2>
                    <p class="auth-subtitle">Unite a nuestro taller premium</p>
                    <form id="registerForm">
                        <div class="form-group">
                            <label>Nombre Completo *</label>
                            <input type="text" id="regName" required placeholder="Juan Pérez">
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" id="regEmail" required placeholder="tu@email.com">
                        </div>
                        <div class="form-group">
                            <label>Usuario *</label>
                            <input type="text" id="regUsername" required placeholder="juanperez" minlength="3">
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="regPhone" placeholder="+54 11 1234-5678">
                        </div>
                        <div class="form-group">
                            <label>Contraseña *</label>
                            <input type="password" id="regPassword" required placeholder="Mín. 8 caracteres" minlength="8">
                            <small style="color:var(--gray);font-size:.75rem">Debe tener mayúscula, minúscula y número.</small>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Crear Cuenta</button>
                        </div>
                        <div class="form-footer">¿Ya tenés cuenta? <a href="#/login">Iniciá sesión</a></div>
                    </form>
                </div>
            </div>
        `);

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                full_name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                username: document.getElementById('regUsername').value,
                phone: document.getElementById('regPhone').value,
                password: document.getElementById('regPassword').value,
            };
            await auth.register(data);
        });
    },

    // === PROFILE ===
    async renderProfile() {
        if (!api.isAuthenticated()) { this.navigate('#/login'); return; }
        try {
            const res = await api.getProfile();
            const user = res.user;

            this.setContent(`
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-avatar">${user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}</div>
                        <div class="profile-info">
                            <h2>${user.full_name}</h2>
                            <p>@${user.username} · ${user.email} · ${user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                        </div>
                    </div>
                    <div style="max-width:600px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius-lg);padding:32px">
                        <h3 style="margin-bottom:24px">Editar Perfil</h3>
                        <form id="profileForm">
                            <div class="form-group">
                                <label>Nombre Completo</label>
                                <input type="text" id="profileName" value="${user.full_name || ''}">
                            </div>
                            <div class="form-group">
                                <label>Teléfono</label>
                                <input type="tel" id="profilePhone" value="${user.phone || ''}">
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        </form>
                        <hr style="border:none;border-top:1px solid rgba(255,255,255,.06);margin:24px 0">
                        <h3 style="margin-bottom:24px">Cambiar Contraseña</h3>
                        <form id="passwordForm">
                            <div class="form-group">
                                <label>Contraseña Actual</label>
                                <input type="password" id="currentPassword" required>
                            </div>
                            <div class="form-group">
                                <label>Nueva Contraseña</label>
                                <input type="password" id="newPassword" required minlength="8">
                            </div>
                            <button type="submit" class="btn btn-outline">Cambiar Contraseña</button>
                        </form>
                    </div>
                </div>
            `);

            document.getElementById('profileForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const res = await api.updateProfile({
                        full_name: document.getElementById('profileName').value,
                        phone: document.getElementById('profilePhone').value,
                    });
                    localStorage.setItem('user', JSON.stringify(res.user));
                    auth.updateUI();
                    this.showToast('Perfil actualizado', 'success');
                } catch (error) {
                    this.showToast(error.error || 'Error al actualizar', 'error');
                }
            });

            document.getElementById('passwordForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await api.put('/auth/change-password', {
                        current_password: document.getElementById('currentPassword').value,
                        new_password: document.getElementById('newPassword').value,
                    });
                    this.showToast('Contraseña cambiada', 'success');
                    e.target.reset();
                } catch (error) {
                    this.showToast(error.error || 'Error al cambiar contraseña', 'error');
                }
            });
        } catch {
            this.navigate('#/login');
        }
    },

    // === MY APPOINTMENTS ===
    async renderMyAppointments() {
        if (!api.isAuthenticated()) { this.navigate('#/login'); return; }
        try {
            const res = await api.getAppointments({ per_page: 50 });
            const appointments = res.appointments || [];

            const statusColors = { pending: '#ff9f1c', confirmed: '#457b9d', completed: '#2d6a4f', cancelled: '#e63946' };
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            const html = appointments.map(a => {
                const d = new Date(a.appointment_date);
                return `
                    <div class="appointment-card">
                        <div class="appointment-date">
                            <span class="day">${d.getDate()}</span>
                            <span class="month">${monthNames[d.getMonth()]}</span>
                        </div>
                        <div class="appointment-info">
                            <h4>${a.service_name || 'Servicio'}</h4>
                            <p>${a.vehicle_brand} ${a.vehicle_model} · ${a.appointment_time}hs · <span style="color:${statusColors[a.status]}">$${a.total_price}</span></p>
                        </div>
                        <div style="text-align:right">
                            <span class="appointment-status ${a.status}">${a.status === 'pending' ? 'Pendiente' : a.status === 'confirmed' ? 'Confirmado' : a.status === 'completed' ? 'Completado' : 'Cancelado'}</span>
                        </div>
                    </div>
                `;
            }).join('');

            this.setContent(`
                <div class="section">
                    <div class="appointments-header">
                        <div>
                            <div class="section-tag"><i class="fas fa-calendar-alt"></i> Mis Turnos</div>
                            <h2>Mis Turnos</h2>
                        </div>
                        <a href="#/reservar" class="btn btn-primary"><i class="fas fa-plus"></i> Nuevo Turno</a>
                    </div>
                    ${html || '<p style="text-align:center;color:var(--gray);padding:40px">No tenés turnos reservados. <a href="#/reservar" style="color:var(--primary)">Reservá tu primer turno</a>.</p>'}
                </div>
            `);
        } catch {
            this.setContent('<div class="section"><p style="text-align:center;color:var(--primary)">Error al cargar turnos.</p></div>');
        }
    },

    // === ADMIN ===
    async renderAdmin() {
        if (!api.isAuthenticated()) { this.navigate('#/login'); return; }
        const user = api.getUser();
        if (!user || user.role !== 'admin') { this.navigate('#/'); return; }

        try {
            const dash = await api.getDashboard();

            this.setContent(`
                <div class="admin-container">
                    <div class="section-header" style="text-align:left">
                        <div class="section-tag"><i class="fas fa-shield-alt"></i> Admin</div>
                        <h2>Panel de Administración</h2>
                    </div>

                    <div class="admin-stats">
                        <div class="admin-stat-card"><h3>${dash.total_appointments}</h3><p>Total Turnos</p></div>
                        <div class="admin-stat-card"><h3 style="color:var(--warning)">${dash.pending_appointments}</h3><p>Pendientes</p></div>
                        <div class="admin-stat-card"><h3 style="color:var(--accent)">${dash.today_appointments}</h3><p>Hoy</p></div>
                        <div class="admin-stat-card"><h3 style="color:var(--success)">$${dash.total_revenue_month?.toLocaleString() || 0}</h3><p>Ingresos del Mes</p></div>
                        <div class="admin-stat-card"><h3>${dash.total_users}</h3><p>Usuarios</p></div>
                        <div class="admin-stat-card"><h3 style="color:var(--warning)">${dash.pending_reviews}</h3><p>Reseñas Pendientes</p></div>
                        <div class="admin-stat-card"><h3 style="color:var(--primary)">${dash.unread_messages}</h3><p>Mensajes Sin Leer</p></div>
                    </div>

                    <div class="admin-tabs">
                        <button class="admin-tab active" data-tab="appointments" onclick="app.switchAdminTab('appointments')">Turnos</button>
                        <button class="admin-tab" data-tab="users" onclick="app.switchAdminTab('users')">Usuarios</button>
                        <button class="admin-tab" data-tab="messages" onclick="app.switchAdminTab('messages')">Mensajes</button>
                        <button class="admin-tab" data-tab="reviews" onclick="app.switchAdminTab('reviews')">Reseñas</button>
                        <button class="admin-tab" data-tab="reports" onclick="app.switchAdminTab('reports')">Reportes</button>
                    </div>
                    <div id="adminContent">
                        <p style="text-align:center;color:var(--gray)">Cargando...</p>
                    </div>
                </div>
            `);

            this.switchAdminTab('appointments');
        } catch {
            this.setContent('<div class="section"><p style="text-align:center;color:var(--primary)">Error al cargar panel admin.</p></div>');
        }
    },

    async switchAdminTab(tab) {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        const container = document.getElementById('adminContent');
        if (!container) return;

        container.innerHTML = '<p style="text-align:center;color:var(--gray)"><i class="fas fa-spinner fa-spin"></i> Cargando...</p>';

        try {
            if (tab === 'appointments') {
                const res = await api.getAppointments({ per_page: 100 });
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const rows = (res.appointments || []).map(a => {
                    const d = new Date(a.appointment_date);
                    return `<tr>
                        <td>#${a.id}</td>
                        <td>${a.client_name || 'N/A'}</td>
                        <td>${a.service_name || 'N/A'}</td>
                        <td>${d.getDate()} ${monthNames[d.getMonth()]}</td>
                        <td>${a.appointment_time}hs</td>
                        <td>${a.vehicle_brand} ${a.vehicle_model}</td>
                        <td>$${a.total_price}</td>
                        <td><span class="appointment-status ${a.status}">${a.status}</span></td>
                    </tr>`;
                }).join('');
                container.innerHTML = `<div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>ID</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Vehículo</th><th>Total</th><th>Estado</th></tr></thead><tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:var(--gray)">Sin turnos</td></tr>'}</tbody></table></div>`;
            } else if (tab === 'users') {
                const res = await api.getUsers({ per_page: 100 });
                const rows = (res.users || []).map(u => `<tr>
                    <td>${u.id}</td>
                    <td>${u.full_name}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td><span style="color:${u.is_active ? 'var(--success)' : 'var(--primary)'}">${u.is_active ? 'Activo' : 'Inactivo'}</span></td>
                    <td>${u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                </tr>`).join('');
                container.innerHTML = `<div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Registro</th></tr></thead><tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:var(--gray)">Sin usuarios</td></tr>'}</tbody></table></div>`;
            } else if (tab === 'messages') {
                const res = await api.getContactMessages({ per_page: 100 });
                const rows = (res.messages || []).map(m => `<tr>
                    <td>${m.name}</td>
                    <td>${m.email}</td>
                    <td>${m.subject}</td>
                    <td>${m.message?.substring(0, 60)}...</td>
                    <td><span style="color:${m.is_read ? 'var(--success)' : 'var(--warning)'}">${m.is_read ? 'Leído' : 'No leído'}</span></td>
                    <td>${new Date(m.created_at).toLocaleDateString()}</td>
                </tr>`).join('');
                container.innerHTML = `<div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>Nombre</th><th>Email</th><th>Asunto</th><th>Mensaje</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:var(--gray)">Sin mensajes</td></tr>'}</tbody></table></div>`;
            } else if (tab === 'reviews') {
                const res = await api.getReviews({ approved: 'false', per_page: 100 });
                const rows = (res.reviews || []).map(r => `<tr>
                    <td>${r.author_name}</td>
                    <td>${'★'.repeat(r.rating)}</td>
                    <td>${r.comment?.substring(0, 80)}...</td>
                    <td><span style="color:var(--warning)">Pendiente</span></td>
                    <td>${new Date(r.created_at).toLocaleDateString()}</td>
                </tr>`).join('');
                container.innerHTML = `<div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>Autor</th><th>Rating</th><th>Comentario</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:var(--gray)">Sin reseñas pendientes</td></tr>'}</tbody></table></div>`;
            } else if (tab === 'reports') {
                const revRes = await api.getRevenueReport('month');
                container.innerHTML = `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
                        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius-lg);padding:24px">
                            <h3 style="margin-bottom:16px">Ingresos del Mes</h3>
                            <div style="font-size:2.5rem;font-weight:800;color:var(--success)">$${(revRes.total_revenue || 0).toLocaleString()}</div>
                            <p style="color:var(--gray)">${revRes.total_appointments || 0} servicios realizados</p>
                            <p style="color:var(--gray)">Promedio: $${(revRes.average_per_appointment || 0).toLocaleString()} por servicio</p>
                        </div>
                        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius-lg);padding:24px">
                            <h3 style="margin-bottom:16px">Distribución Diaria</h3>
                            ${(revRes.daily_revenue || []).map(d => `
                                <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem">
                                    <span style="color:var(--gray)">${d.date}</span>
                                    <span style="font-weight:600">$${d.revenue.toLocaleString()}</span>
                                </div>
                            `).join('') || '<p style="color:var(--gray)">Sin datos</p>'}
                        </div>
                    </div>
                `;
            }
        } catch {
            container.innerHTML = '<p style="text-align:center;color:var(--primary)">Error al cargar datos.</p>';
        }
    },

    // === NOT FOUND ===
    renderNotFound() {
        this.setContent(`
            <div class="not-found">
                <h1>404</h1>
                <p>Página no encontrada</p>
                <a href="#/" class="btn btn-primary"><i class="fas fa-home"></i> Volver al Inicio</a>
            </div>
        `);
    },
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
