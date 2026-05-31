import { isAuthenticated, getUserRole } from '../auth/auth-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('achievements-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    const filterTabs = document.getElementById('filter-tabs');
    const totalCountDisplay = document.getElementById('total-count-display');
    const ctaContainer = document.getElementById('cta-container');
    
    // Modal elements
    const modal = document.getElementById('achievement-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const form = document.getElementById('achievement-form');
    const modalTitle = document.getElementById('modal-title');
    const idField = document.getElementById('achievement-id');
    const titleField = document.getElementById('achievement-title');
    const categoryField = document.getElementById('achievement-category');
    const classField = document.getElementById('achievement-class');
    const contentField = document.getElementById('achievement-content');
    const imagesInput = document.getElementById('achievement-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const featuredCheckbox = document.getElementById('achievement-featured');
    const submitBtn = document.getElementById('submit-achievement-btn');

    const LIMIT = 8;
    let currentPage = 1;
    let currentCategory = 'ALL';
    let achievements = [];
    let uploadedImages = [];
    let mainImageUrl = '';
    let hasNextPageGlobal = false;

    // Optimistic UI path: check localStorage synchronously to show admin controls instantly
    const localAuth = localStorage.getItem('isLoggedIn') === 'true';
    const localRole = localStorage.getItem('userRole') || 'client';
    let isAdmin = localAuth && localRole === 'admin';

    // Render admin buttons synchronously if localStorage indicates admin
    if (isAdmin) {
        renderAdminButton();
    }

    // Verify admin session securely in the background to prevent blocking page render
    (async () => {
        try {
            const isAuth = await isAuthenticated();
            const actualRole = isAuth ? await getUserRole() : 'client';
            const actualAdmin = isAuth && actualRole === 'admin';
            
            // If the actual backend session differs from localStorage cache, update UI
            if (actualAdmin !== isAdmin) {
                isAdmin = actualAdmin;
                if (isAdmin) {
                    renderAdminButton();
                } else {
                    document.getElementById('admin-add-btn')?.remove();
                }
                // Refresh grid to reflect the true permission state
                if (achievements.length > 0) {
                    grid.innerHTML = '';
                    renderGrid(achievements, hasNextPageGlobal);
                }
            }
        } catch (e) {
            console.error('Session verification failed:', e);
        }
    })();

    // Render filter tabs active states
    filterTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-tab-btn');
        if (!btn) return;
        
        // Remove active class from all
        filterTabs.querySelectorAll('.filter-tab-btn').forEach(b => {
            b.classList.remove('active', 'bg-primary-blue', 'text-white', 'shadow-md');
            b.classList.add('bg-white', 'text-text-dark', 'border', 'border-outline-variant', 'hover:bg-bg-light');
        });
        
        // Add active to clicked
        btn.classList.add('active', 'bg-primary-blue', 'text-white', 'shadow-md');
        btn.classList.remove('bg-white', 'text-text-dark', 'border', 'border-outline-variant', 'hover:bg-bg-light');

        currentCategory = btn.dataset.category;
        loadAchievements(1, true); // Reset page to 1 and clear achievements
    });

    const escapeHtml = (unsafe) => {
        if (!unsafe) return '';
        return String(unsafe)
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    function renderAdminButton() {
        if (document.getElementById('admin-add-btn')) return;
        
        const filterTabs = document.getElementById('filter-tabs');
        if (filterTabs) {
            const adminBtn = document.createElement('button');
            adminBtn.id = 'admin-add-btn';
            adminBtn.className = 'px-6 py-2.5 rounded-full font-button-text font-bold text-sm bg-accent-green text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-none flex items-center gap-2 hover:bg-green-600';
            adminBtn.innerHTML = '<span class="material-symbols-outlined text-sm font-semibold">add</span> Add Achievement';
            adminBtn.addEventListener('click', () => openModal());
            
            filterTabs.appendChild(adminBtn);
        }
    }

    function renderCTA() {
        ctaContainer.innerHTML = `
            <section class="px-margin-desktop md:px-margin-desktop px-margin-mobile max-w-5xl mx-auto w-full mt-16 mb-16">
                <div class="bg-gradient-to-br from-primary-blue to-blue-700 rounded-[2rem] p-12 text-center text-pure-white relative overflow-hidden shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
                    <div class="absolute -right-20 -top-20 opacity-20 pointer-events-none">
                        <span class="material-symbols-outlined text-[300px]" data-weight="fill" style="font-variation-settings: 'FILL' 1;">rocket_launch</span>
                    </div>
                    <h2 class="font-headline-lg text-4xl mb-4 relative z-10 drop-shadow-md">Ready to join the Hall of Fame?</h2>
                    <p class="font-body-lg text-body-lg mb-8 max-w-2xl mx-auto relative z-10 text-white/90">Enrollment for our upcoming FLL and IQ seasons is now open. Start building your legacy today.</p>
                    <a href="../contact/index.html" class="inline-block bg-accent-yellow text-text-dark font-button-text font-bold py-3.5 px-8 rounded-xl hover:scale-105 active:scale-95 transition-all relative z-10 shadow-lg">Apply for Enrollment</a>
                </div>
            </section>
        `;
    }

    async function loadAchievements(page, reset = false) {
        if (reset) {
            currentPage = 1;
            achievements = [];
            
            // Render a high-fidelity pulse skeleton grid matching the actual cards
            let skeletons = '';
            for (let i = 0; i < 4; i++) {
                skeletons += `
                    <div class="bg-white border border-outline-variant/20 rounded-[1.25rem] overflow-hidden shadow-sm flex flex-col min-h-[380px] animate-pulse">
                        <div class="aspect-video bg-gray-200 w-full relative">
                            <div class="absolute top-4 left-4 w-12 h-5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow gap-3">
                            <div class="h-5 bg-gray-300 rounded w-5/6"></div>
                            <div class="flex flex-col gap-2 mt-2 flex-grow">
                                <div class="h-3 bg-gray-200 rounded w-full"></div>
                                <div class="h-3 bg-gray-200 rounded w-11/12"></div>
                                <div class="h-3 bg-gray-200 rounded w-4/5"></div>
                            </div>
                            <div class="mt-auto">
                                <hr class="border-t border-gray-100 mb-4" />
                                <div class="flex justify-between items-center pt-1">
                                    <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                                    <div class="w-4 h-4 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            grid.innerHTML = skeletons;
        }

        try {
            const response = await fetch(`/api/blogs?page=${page}&limit=${LIMIT}&category=${currentCategory}`);
            if (!response.ok) throw new Error('Failed to fetch achievements');
            
            const result = await response.json();
            const data = result.data || [];
            const meta = result.meta || {};

            if (reset) {
                grid.innerHTML = '';
            }

            // Append dynamic achievements
            achievements = achievements.concat(data);
            totalCountDisplay.textContent = meta.total !== undefined ? meta.total : achievements.length;

            hasNextPageGlobal = meta.has_next_page;
            renderGrid(data, hasNextPageGlobal);
        } catch (error) {
            console.error('Failed to load achievements:', error);
            grid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <span class="material-symbols-outlined text-6xl text-accent-red opacity-85 mb-4 font-bold">warning</span>
                    <h2 class="font-headline-lg text-2xl text-text-dark mb-2">Error Loading Achievements</h2>
                    <p class="font-body-md text-sm text-text-dark opacity-65">Please try again later.</p>
                </div>
            `;
        }
    }

    function renderGrid(newItems, hasNextPage) {
        // Remove loading spin if present
        const spinner = grid.querySelector('.col-span-full');
        if (spinner) spinner.remove();

        // Render new achievement cards
        newItems.forEach(item => {
            const card = document.createElement('div');
            card.className = "bg-white border border-outline-variant/30 rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col relative group min-h-[380px]";
            
            // Category styling mapped exactly to the screenshot design
            const cat = item.category || 'ALL';
            let catClass = 'bg-[#0C469B] text-white'; // default to primary blue
            if (cat.toUpperCase() === 'FLL') catClass = 'bg-[#00A651] text-white';
            else if (cat.toUpperCase() === 'VEX IQ') catClass = 'bg-[#F9BF15] text-[#1E293B]';
            else if (cat.toUpperCase() === 'ALUMNI') catClass = 'bg-[#0C469B] text-white';

            const titleSafe = escapeHtml(item.title);
            const contentSafe = escapeHtml(item.content || '');
            const subSafe = escapeHtml(item.subtitle || '');

            card.innerHTML = `
                <!-- Image Section -->
                <div class="relative overflow-hidden aspect-video bg-gray-50 flex-shrink-0">
                    ${item.image_url 
                        ? `<img src="${escapeHtml(item.image_url)}" alt="${titleSafe}" class="absolute inset-0 w-full h-full object-cover">` 
                        : `<div class="absolute inset-0 bg-gradient-to-br from-primary-blue to-blue-400 flex items-center justify-center"><span class="material-symbols-outlined text-5xl text-white opacity-60">emoji_events</span></div>`
                    }
                    <!-- Category Badge -->
                    <span class="absolute top-4 left-4 font-label-caps font-bold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-sm z-10 ${catClass}">${cat.toUpperCase()}</span>
                    
                    <!-- Admin Actions -->
                    ${isAdmin ? `
                        <div class="absolute top-4 right-4 flex gap-2 z-20">
                            <button class="edit-btn p-2 rounded-full bg-white/90 hover:bg-white text-primary-blue shadow cursor-pointer border-none flex items-center justify-center transition-all hover:scale-110" data-id="${item.id}" aria-label="Edit achievement">
                                <span class="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button class="delete-btn p-2 rounded-full bg-white/90 hover:bg-white text-accent-red shadow cursor-pointer border-none flex items-center justify-center transition-all hover:scale-110" data-id="${item.id}" aria-label="Delete achievement">
                                <span class="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Content Section -->
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="font-headline-md text-base md:text-lg text-text-dark font-bold mb-2 line-clamp-2 leading-snug tracking-tight">${titleSafe}</h3>
                    <p class="font-body-md text-xs md:text-sm text-text-dark opacity-75 line-clamp-3 leading-relaxed mb-4 flex-grow">${contentSafe}</p>
                    
                    <div class="mt-auto">
                        <hr class="border-t border-outline-variant/30 mb-4" />
                        <div class="flex justify-between items-center text-xs text-text-dark opacity-75 font-semibold font-body-md pt-1">
                            <span>${subSafe || 'Robotics Achievement'}</span>
                            <a href="../blog/index.html?id=${item.id}" class="text-primary-blue hover:text-blue-700 transition-colors flex items-center justify-center after:absolute after:inset-0 after:z-10" aria-label="Read achievement details">
                                <svg class="w-4 h-4 text-primary-blue group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });

        // Add special dotted Admin card at the end of the grid if user is admin
        if (isAdmin && !grid.querySelector('#add-achievement-card')) {
            const addCard = document.createElement('div');
            addCard.id = "add-achievement-card";
            addCard.className = "bg-transparent border-2 border-dashed border-gray-300 rounded-[1.25rem] p-8 flex flex-col justify-center items-center text-center gap-4 cursor-pointer hover:border-primary-blue hover:bg-blue-50/20 hover:scale-[1.01] transition-all duration-300 min-h-[380px] group shadow-sm";
            addCard.innerHTML = `
                <div class="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-primary-blue group-hover:text-primary-blue transition-colors bg-white shadow-sm">
                    <span class="material-symbols-outlined text-2xl font-bold">add</span>
                </div>
                <h3 class="font-headline-md text-base text-text-dark font-bold mt-2">New Achievement?</h3>
                <p class="font-body-md text-xs text-text-dark opacity-65 max-w-[200px] leading-relaxed">Our library is constantly growing as our students innovate.</p>
            `;
            grid.appendChild(addCard);

            // Open creation modal on click
            addCard.addEventListener('click', () => openModal());
        }

        // Manage Load More button visibility
        if (hasNextPage) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }

    // Attach load more trigger
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadAchievements(currentPage, false);
    });

    // Admin Modal Logic
    function openModal(achievement = null) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        uploadedImages = [];
        mainImageUrl = '';
        imagePreviewContainer.innerHTML = '';
        form.reset();

        if (achievement) {
            modalTitle.textContent = 'Edit Achievement';
            idField.value = achievement.id;
            titleField.value = achievement.title || '';
            categoryField.value = achievement.category || 'FLL';
            classField.value = achievement.subtitle || '';
            contentField.value = achievement.content || '';
            featuredCheckbox.checked = achievement.is_featured || false;
            
            // Populate images
            if (achievement.images) {
                uploadedImages = typeof achievement.images === 'string' 
                    ? JSON.parse(achievement.images) 
                    : achievement.images;
            }
            mainImageUrl = achievement.image_url || '';
            if (mainImageUrl && !uploadedImages.includes(mainImageUrl)) {
                uploadedImages.unshift(mainImageUrl);
            }
            renderImagePreviews();
        } else {
            modalTitle.textContent = 'Create Achievement';
            idField.value = '';
        }
    }

    const toggleModal = (show) => {
        if (show) {
            openModal();
        } else {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            form.reset();
            idField.value = '';
            uploadedImages = [];
            mainImageUrl = '';
            imagePreviewContainer.innerHTML = '';
        }
    };

    closeModalBtn.addEventListener('click', () => toggleModal(false));
    cancelModalBtn.addEventListener('click', () => toggleModal(false));

    // Handle editing and deleting clicks on items (using delegation)
    grid.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        
        if (editBtn) {
            e.stopPropagation();
            const id = editBtn.dataset.id;
            try {
                const res = await fetch(`/api/blogs/${id}`);
                if (!res.ok) throw new Error('Failed to fetch details');
                const achievement = await res.json();
                openModal(achievement);
            } catch (err) {
                alert('Error loading achievement: ' + err.message);
            }
        } else if (deleteBtn) {
            e.stopPropagation();
            const id = deleteBtn.dataset.id;
            if (!confirm('Are you sure you want to delete this achievement?')) return;
            
            try {
                const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Delete failed');
                loadAchievements(1, true); // Refresh
            } catch (err) {
                alert('Error deleting: ' + err.message);
            }
        }
    });

    // Image Uploading logic inside modal
    imagesInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || !files.length) return;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2">progress_activity</span> Uploading...';
        
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            
            try {
                const res = await fetch('/api/upload/blog', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                
                uploadedImages.push(data.url);
                if (!mainImageUrl) mainImageUrl = data.url;
            } catch (err) {
                console.error(err);
                alert('Upload error: ' + err.message);
            }
        }
        
        imagesInput.value = '';
        renderImagePreviews();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save Achievement';
    });

    function renderImagePreviews() {
        imagePreviewContainer.innerHTML = '';
        uploadedImages.forEach((img) => {
            const div = document.createElement('div');
            div.className = "relative w-20 h-20 rounded-xl overflow-hidden shadow-sm group/preview border border-outline-variant";
            
            const isMain = img === mainImageUrl;
            
            div.innerHTML = `
                <img src="${img}" class="w-full h-full object-cover" />
                <button type="button" class="remove-img-btn absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 border-none cursor-pointer flex items-center justify-center hover:bg-black transition-colors" data-url="${img}">
                    <span class="material-symbols-outlined text-xs">close</span>
                </button>
                <button type="button" class="set-main-btn absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full border-none cursor-pointer tracking-wider ${isMain ? 'bg-accent-green text-white' : 'bg-white/80 hover:bg-white text-text-dark'} shadow-sm transition-all" data-url="${img}">
                    ${isMain ? 'MAIN' : 'SET MAIN'}
                </button>
            `;
            imagePreviewContainer.appendChild(div);
        });

        // Attach buttons handlers
        imagePreviewContainer.querySelectorAll('.remove-img-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = btn.dataset.url;
                uploadedImages = uploadedImages.filter(x => x !== url);
                if (mainImageUrl === url) {
                    mainImageUrl = uploadedImages.length > 0 ? uploadedImages[0] : '';
                }
                renderImagePreviews();
            });
        });

        imagePreviewContainer.querySelectorAll('.set-main-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = btn.dataset.url;
                mainImageUrl = url;
                renderImagePreviews();
            });
        });
    }

    // Handle Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = idField.value;
        const payload = {
            title: titleField.value,
            category: categoryField.value,
            subtitle: classField.value,
            content: contentField.value,
            image_url: mainImageUrl,
            images: uploadedImages,
            is_featured: featuredCheckbox.checked
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2">progress_activity</span> Saving...';

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/blogs/${id}` : '/api/blogs';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Save request failed');
            
            toggleModal(false);
            loadAchievements(1, true); // Refresh and reset grid
        } catch (err) {
            alert('Save error: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Save Achievement';
        }
    });

    // Initialize Layout
    loadAchievements(1, true);
    renderCTA();
});
