export const login = async (email, password) => {
    try {
        const response = await fetch('/api/auth/sign-in/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('isLoggedIn', 'true');
            if (data.user?.role === 'admin') {
                localStorage.setItem('userRole', 'admin');
            }
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Login failed' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const register = async (name, email, password) => {
    try {
        const response = await fetch('/api/auth/sign-up/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('isLoggedIn', 'true');
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Registration failed' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const logout = async () => {
    try {
        await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch (e) {
        console.error('Logout error', e);
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    window.location.reload();
};

export const isAuthenticated = () => {
    return localStorage.getItem('isLoggedIn') === 'true';
};
