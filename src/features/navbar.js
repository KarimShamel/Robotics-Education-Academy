import { renderAuthUI } from './auth/auth-client.js';

export function injectNavbar() {
    const header = document.querySelector('header');
    if (!header) return;
    
    // Set standard class and contents
    header.className = "bg-white border-b border-outline-variant w-full top-0 z-50 relative";
    header.innerHTML = `
<div class="flex justify-between items-center w-full px-margin-mobile lg:px-margin-desktop py-3 max-w-7xl mx-auto">
    <div class="flex items-center">
        <a href="../home/index.html">
            <img src="../../assets/logo.png" alt="Robotics Education Academy Logo" style="height: 48px; width: auto;" class="mr-4 object-contain" />
        </a>
    </div>
    <button id="mobile-menu-btn" class="lg:hidden text-text-dark hover:text-primary-blue flex items-center ml-auto mr-4 cursor-pointer">
        <span class="material-symbols-outlined text-3xl">menu</span>
    </button>
    <nav id="navbar-links" class="hidden lg:flex absolute lg:static top-full left-0 w-full lg:w-auto bg-white lg:bg-transparent shadow-lg lg:shadow-none flex-col lg:flex-row p-6 lg:p-0 gap-6 lg:gap-0 lg:space-x-6 items-start lg:items-center z-50 border-b lg:border-none border-outline-variant">
        <a class="text-text-dark font-medium hover:text-primary-blue transition-colors duration-200 font-label-caps text-label-caps" href="../home/index.html">Home</a>
        <div class="relative group">
            <button class="flex items-center text-text-dark font-medium hover:text-primary-blue transition-colors duration-200 font-label-caps text-label-caps cursor-pointer">
                Competitions ▾
            </button>
            <div class="static lg:absolute lg:left-0 lg:mt-2 w-full lg:w-56 bg-transparent lg:bg-white border-0 lg:border border-outline-variant rounded-none lg:rounded-lg shadow-none lg:shadow-lg opacity-100 visible lg:opacity-0 lg:invisible translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:visible transition-all duration-300 mt-2 pl-4 lg:pl-0 ease-[cubic-bezier(0.25,1,0.5,1)] z-50 overflow-hidden">
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
