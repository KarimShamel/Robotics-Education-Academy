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
            localStorage.setItem('userRole', data.user?.role || 'client');
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Login failed' };
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

// Store session cache temporarily to avoid multiple immediate requests
let cachedSession = null;
let lastSessionFetch = 0;

export const getSession = async (force = false) => {
    const now = Date.now();
    if (!force && cachedSession && (now - lastSessionFetch < 5000)) {
        return cachedSession;
    }
    try {
        const res = await fetch('/api/auth/get-session');
        if (res.ok) {
            const data = await res.json();
            cachedSession = data;
            lastSessionFetch = now;
            return data;
        }
    } catch (e) {
        console.error('Failed to get session:', e);
    }
    cachedSession = { authenticated: false };
    lastSessionFetch = now;
    return cachedSession;
};

export const isAuthenticated = async () => {
    const session = await getSession();
    return session.authenticated === true;
};

export const getUserRole = async () => {
    const session = await getSession();
    return session.user?.role || 'client';
};

export const renderAuthUI = async (authSectionElement, relativePath = '../') => {
    if (!authSectionElement) return;
    
    // 1. Render immediate UI based on localStorage to avoid visual delay
    const isLocalAuth = localStorage.getItem('isLoggedIn') === 'true';
    const localRole = localStorage.getItem('userRole') || 'client';

    const renderAuthHTML = (isAuth, role) => {
        if (isAuth) {
            const dashboardLink = role === 'admin' 
                ? `<a href="${relativePath}achievements/index.html" class="text-text-dark hover:text-primary-blue font-button-text font-bold px-3 py-2 mr-2">Manage Achievements</a>` 
                : '';
            return `
                ${dashboardLink}
                <a href="${relativePath}contact/index.html" class="hidden lg:inline-block border-2 border-accent-green text-accent-green bg-transparent hover:bg-accent-green hover:text-white font-button-text font-bold px-5 py-1.5 rounded-full transition-all duration-200 shadow-sm whitespace-nowrap">
                    Enroll Now
                </a>
                <button id="logoutBtn" class="ml-4 border-2 border-red-500 text-red-500 bg-white font-button-text font-bold px-5 py-1.5 rounded-full hover:bg-red-50 hover:shadow transition-all duration-200">
                    Logout
                </button>
            `;
        } else {
            return `
                <a href="${relativePath}contact/index.html" class="hidden lg:inline-block border-2 border-accent-green text-accent-green bg-transparent hover:bg-accent-green hover:text-white font-button-text font-bold px-5 py-1.5 rounded-full transition-all duration-200 shadow-sm whitespace-nowrap">
                    Enroll Now
                </a>
                <div class="h-6 w-px bg-outline-variant mx-1 hidden lg:block"></div>
                <a href="${relativePath}auth/login.html" class="text-text-dark hover:text-primary-blue font-button-text font-bold px-3 py-2 transition-colors duration-200">
                    Login
                </a>
            `;
        }
    };

    authSectionElement.innerHTML = renderAuthHTML(isLocalAuth, localRole);
    if (isLocalAuth) {
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
    }
    
    // 2. Fetch auth status in background to verify
    const isAuth = await isAuthenticated();
    const actualRole = await getUserRole();
    
    // 3. Swap to actual authenticated UI if there is a mismatch
    if (isAuth !== isLocalAuth || (isAuth && actualRole !== localRole)) {
        if (!isAuth) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
        } else {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', actualRole);
        }
        authSectionElement.innerHTML = renderAuthHTML(isAuth, actualRole);
        if (isAuth) {
            document.getElementById('logoutBtn')?.addEventListener('click', logout);
        }
    }
};

// --- Global Scroll-to-Top Button Injection ---
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('login')) return;
        if (document.getElementById('scrollToTopBtn')) return;

        const scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollToTopBtn';
        scrollBtn.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
        scrollBtn.className = 'fixed bottom-8 right-8 bg-primary-blue text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 translate-y-10 transition-all duration-300 z-50 hover:bg-blue-700 hover:scale-110 hover:shadow-xl pointer-events-none cursor-pointer border-none';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        
        document.body.appendChild(scrollBtn);
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                scrollBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            } else {
                scrollBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                scrollBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            }
        });
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}
