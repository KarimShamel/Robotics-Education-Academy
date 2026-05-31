import { renderAuthUI } from './auth/auth-client.js';

export function injectNavbar() {
    const header = document.querySelector('header');
    if (!header) return;
    
    // Set standard class and contents
    header.className = "bg-white border-b border-outline-variant w-full top-0 z-50 relative";
    header.innerHTML = `
<div class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-3 max-w-7xl mx-auto">
    <div class="flex items-center">
        <a href="../home/index.html">
            <img src="../../assets/logo.png" alt="Robotics Education Academy Logo" style="height: 48px; width: auto;" class="mr-4 object-contain" />
        </a>
    </div>
    <button id="mobile-menu-btn" class="md:hidden text-text-dark hover:text-primary-blue flex items-center ml-auto mr-4 cursor-pointer">
        <span class="material-symbols-outlined text-3xl">menu</span>
    </button>
    <nav id="navbar-links" class="hidden md:flex absolute md:static top-full left-0 w-full md:w-auto bg-white md:bg-transparent shadow-lg md:shadow-none flex-col md:flex-row p-6 md:p-0 gap-6 md:gap-0 md:space-x-6 items-start md:items-center z-50 border-b md:border-none border-outline-variant">
        <a class="text-text-dark font-medium hover:text-primary-blue transition-colors duration-200 font-label-caps text-label-caps" href="../home/index.html">Home</a>
        <div class="relative group">
            <button class="flex items-center text-text-dark font-medium hover:text-primary-blue transition-colors duration-200 font-label-caps text-label-caps cursor-pointer">
                Competitions ▾
            </button>
            <div class="static md:absolute md:left-0 md:mt-2 w-full md:w-56 bg-transparent md:bg-white border-0 md:border border-outline-variant rounded-none md:rounded-lg shadow-none md:shadow-lg opacity-100 visible md:opacity-0 md:invisible translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:visible transition-all duration-300 mt-2 pl-4 md:pl-0 ease-[cubic-bezier(0.25,1,0.5,1)] z-50 overflow-hidden">
                <a class="block px-4 py-3 text-text-dark font-medium hover:bg-bg-light hover:text-primary-blue font-label-caps text-sm border-b border-outline-variant last:border-0 transition-colors" href="../fll/index.html">First Lego League (FLL)</a>
                <a class="block px-4 py-3 text-text-dark font-medium hover:bg-bg-light hover:text-primary-blue font-label-caps text-sm border-b border-outline-variant last:border-0 transition-colors" href="../impact_quest/index.html">Impact Quest (IQ)</a>
            </div>
        </div>
        <a class="text-text-dark font-medium hover:text-primary-blue transition-colors duration-200 font-label-caps text-label-caps" href="../achievements/index.html">Achievements</a>
        <a class="text-text-dark font-medium hover:text-primary-blue transition-colors duration-200 font-label-caps text-label-caps" href="../contact/index.html">Contact</a>
    </nav>
    <div id="auth-section" class="flex items-center gap-4">
        <!-- Auth buttons will be injected here via JS -->
    </div>
</div>
    `;

    // Toggle menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navbarLinks = document.getElementById('navbar-links');
    if (mobileMenuBtn && navbarLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navbarLinks.classList.toggle('hidden');
            navbarLinks.classList.toggle('flex');
        });
    }

    // Load auth buttons
    renderAuthUI(document.getElementById('auth-section'), '../');
}

// Automatically inject when loaded as a module
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
} else {
    injectNavbar();
}
