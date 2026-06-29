const auth = {
    init() {
        this.updateUI();
    },

    updateUI() {
        const isAuth = api.isAuthenticated();
        const user = api.getUser();
        const navAuth = document.getElementById('navAuth');
        const navUser = document.getElementById('navUser');
        const navUserName = document.getElementById('navUserName');
        const adminLink = document.getElementById('adminLink');
        const loginBtn = document.getElementById('loginBtn');

        if (isAuth && user) {
            navAuth.style.display = 'none';
            navUser.style.display = 'block';
            navUserName.textContent = user.full_name || user.username;
            if (adminLink) {
                adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
                adminLink.href = '#/admin';
            }
            if (loginBtn) loginBtn.textContent = 'Mi Cuenta';
        } else {
            navAuth.style.display = 'flex';
            navUser.style.display = 'none';
            if (loginBtn) loginBtn.textContent = 'Ingresar';
        }
    },

    async login(email, password) {
        try {
            const result = await api.login(email, password);
            api.setToken(result.access_token, result.refresh_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            this.updateUI();
            app.showToast('Inicio de sesión exitoso', 'success');
            app.navigate('#/');
            return result;
        } catch (error) {
            app.showToast(error.error || 'Error al iniciar sesión', 'error');
            throw error;
        }
    },

    async register(data) {
        try {
            const result = await api.register(data);
            api.setToken(result.access_token, result.refresh_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            this.updateUI();
            app.showToast('Registro exitoso', 'success');
            app.navigate('#/');
            return result;
        } catch (error) {
            app.showToast(error.error || 'Error al registrarse', 'error');
            throw error;
        }
    },

    logout() {
        api.logout();
        this.updateUI();
        app.showToast('Sesión cerrada', 'info');
        app.navigate('#/');
    },

    async checkAuth() {
        if (!api.isAuthenticated()) return false;
        try {
            await api.getProfile();
            return true;
        } catch {
            this.logout();
            return false;
        }
    },
};
