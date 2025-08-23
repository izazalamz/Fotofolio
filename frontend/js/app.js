/**
 * Main Application Module - Initializes and coordinates all services
 */
class App {
    constructor() {
        this.currentPage = 'home';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApp());
            } else {
                this.setupApp();
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize application');
        }
    }

    setupApp() {
        // Initialize all services
        this.initializeServices();
        
        // Set up global event listeners
        this.setupGlobalEventListeners();
        
        // Initialize authentication state
        this.initializeAuth();
        
        // Load initial data
        this.loadInitialData();
        
        // Set up routing
        this.setupRouting();
        
        // Mark as initialized
        this.isInitialized = true;
        
        // Hide loading spinner if exists
        UIUtils.hideLoadingSpinner();
        
        console.log('Fotofolio application initialized successfully');
    }

    initializeServices() {
        // All services are already initialized in their respective files
        // This method can be used for any service coordination if needed
        console.log('Services initialized');
    }

    setupGlobalEventListeners() {
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showError('An unexpected error occurred');
        });

        // Global unhandled promise rejection handling
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showError('A network error occurred');
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange(e.state?.page || 'home');
        });

        // Handle escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UIUtils.closeAllModals();
            }
        });

        // Handle clicks outside modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                UIUtils.closeAllModals();
            }
        });

        // Handle search form submission
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        // Handle category filter clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                const categoryCard = e.target.closest('.category-card');
                const categoryId = categoryCard.dataset.categoryId;
                if (categoryId) {
                    this.filterByCategory(categoryId);
                }
            }
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const navLink = e.target.closest('.nav-link');
                const targetPage = navLink.dataset.page || navLink.getAttribute('href')?.replace('#', '');
                if (targetPage) {
                    this.navigateTo(targetPage);
                }
            }
        });
    }

    initializeAuth() {
        // Check if user is already authenticated
        if (AuthService.isAuthenticated()) {
            this.updateUIForAuthenticatedUser();
        } else {
            this.updateUIForUnauthenticatedUser();
        }

        // Listen for auth state changes
        AuthService.onAuthStateChange((isAuthenticated) => {
            if (isAuthenticated) {
                this.updateUIForAuthenticatedUser();
            } else {
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

    updateUIForAuthenticatedUser() {
        const user = AuthService.getCurrentUser();
        
        // Update navigation
        const authLinks = document.querySelectorAll('.auth-required');
        const guestLinks = document.querySelectorAll('.guest-only');
        
        authLinks.forEach(link => link.style.display = 'block');
        guestLinks.forEach(link => link.style.display = 'none');
        
        // Update user info in navigation
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            const username = userMenu.querySelector('.username');
            const avatar = userMenu.querySelector('.user-avatar');
            
            if (username) username.textContent = user.username;
            if (avatar) {
                avatar.src = user.avatar || '/images/default-avatar.png';
                avatar.alt = user.username;
            }
        }

        // Load user-specific data
        this.loadUserData();
    }

    updateUIForUnauthenticatedUser() {
        // Update navigation
        const authLinks = document.querySelectorAll('.auth-required');
        const guestLinks = document.querySelectorAll('.guest-only');
        
        authLinks.forEach(link => link.style.display = 'none');
        guestLinks.forEach(link => link.style.display = 'block');

        // Reset user-specific data
        this.resetUserData();
    }

    async loadInitialData() {
        try {
            UIUtils.showLoadingSpinner();
            
            // Load categories
            await categoriesService.loadCategories();
            
            // Load featured photos
            await photosService.loadFeaturedPhotos();
            
            // Load top users
            await usersService.loadTopUsers();
            
            // Update hero statistics
            await this.updateHeroStats();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load initial data');
        } finally {
            UIUtils.hideLoadingSpinner();
        }
    }

    async loadUserData() {
        if (!AuthService.isAuthenticated()) return;

        try {
            // Load user's photos
            await photosService.loadUserPhotos();
            
            // Load user's liked photos
            await likesService.loadLikedPhotos();
            
            // Update user statistics
            await usersService.updateUserStats();
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    resetUserData() {
        // Reset all user-specific data
        photosService.resetUserPhotos();
        likesService.resetLikes();
        usersService.resetUserStats();
    }

    async updateHeroStats() {
        try {
            // Get total photos count
            const photosResponse = await ApiService.get('/photos?limit=1');
            const totalPhotos = photosResponse.total || 0;
            
            // Get total users count
            const usersResponse = await ApiService.get('/users?limit=1');
            const totalUsers = usersResponse.total || 0;
            
            // Update hero statistics
            const statsContainer = document.querySelector('.hero-stats');
            if (statsContainer) {
                const photosCount = statsContainer.querySelector('.photos-count');
                const usersCount = statsContainer.querySelector('.users-count');
                
                if (photosCount) photosCount.textContent = totalPhotos.toLocaleString();
                if (usersCount) usersCount.textContent = usersCount.toLocaleString();
            }
        } catch (error) {
            console.error('Error updating hero stats:', error);
        }
    }

    setupRouting() {
        // Simple client-side routing
        const currentHash = window.location.hash.slice(1) || 'home';
        this.handleRouteChange(currentHash);
    }

    navigateTo(page) {
        // Update URL without page reload
        window.history.pushState({ page }, '', `#${page}`);
        this.handleRouteChange(page);
    }

    handleRouteChange(page) {
        this.currentPage = page;
        
        // Update active navigation
        this.updateActiveNavigation(page);
        
        // Handle page-specific logic
        switch (page) {
            case 'home':
                this.showHomePage();
                break;
            case 'photos':
                this.showPhotosPage();
                break;
            case 'categories':
                this.showCategoriesPage();
                break;
            case 'artists':
                this.showArtistsPage();
                break;
            case 'about':
                this.showAboutPage();
                break;
            case 'profile':
                this.showProfilePage();
                break;
            case 'upload':
                this.showUploadPage();
                break;
            default:
                this.showHomePage();
        }
    }

    updateActiveNavigation(page) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    showHomePage() {
        // Home page is already visible by default
        // Just ensure it's properly displayed
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'block';
        });
    }

    showPhotosPage() {
        // Show photos grid with filters
        this.hideAllSections();
        const photosSection = document.querySelector('.photos-section');
        if (photosSection) {
            photosSection.style.display = 'block';
            photosService.loadPhotos();
        }
    }

    showCategoriesPage() {
        // Show categories grid
        this.hideAllSections();
        const categoriesSection = document.querySelector('.categories-section');
        if (categoriesSection) {
            categoriesSection.style.display = 'block';
            categoriesService.loadCategories();
        }
    }

    showArtistsPage() {
        // Show artists grid
        this.hideAllSections();
        const artistsSection = document.querySelector('.artists-section');
        if (artistsSection) {
            artistsSection.style.display = 'block';
            usersService.loadTopUsers();
        }
    }

    showAboutPage() {
        // Show about section
        this.hideAllSections();
        const aboutSection = document.querySelector('.about-section');
        if (aboutSection) {
            aboutSection.style.display = 'block';
        }
    }

    showProfilePage() {
        if (!AuthService.isAuthenticated()) {
            UIUtils.showModal('login-modal');
            return;
        }
        
        // Show user profile
        AuthService.showProfileModal();
    }

    showUploadPage() {
        if (!AuthService.isAuthenticated()) {
            UIUtils.showModal('login-modal');
            return;
        }
        
        // Show upload modal or redirect to upload page
        // For now, just show a message
        UIUtils.showToast('Upload functionality coming soon!', 'info');
    }

    hideAllSections() {
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'none';
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput?.value?.trim();
        
        if (query) {
            this.performSearch(query);
        }
    }

    async performSearch(query) {
        try {
            UIUtils.showLoadingSpinner();
            
            // Search in photos
            const photosResponse = await ApiService.get(`/photos?search=${encodeURIComponent(query)}`);
            
            // Search in users
            const usersResponse = await ApiService.get(`/users?search=${encodeURIComponent(query)}`);
            
            // Display search results
            this.displaySearchResults(query, photosResponse.data || [], usersResponse.data || []);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed');
        } finally {
            UIUtils.hideLoadingSpinner();
        }
    }

    displaySearchResults(query, photos, users) {
        // Create and show search results modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content search-results-modal">
                <div class="modal-header">
                    <h3>Search Results for "${query}"</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="search-tabs">
                        <button class="tab-btn active" data-tab="photos">Photos (${photos.length})</button>
                        <button class="tab-btn" data-tab="users">Users (${users.length})</button>
                    </div>
                    <div class="tab-content">
                        <div class="tab-pane active" id="photos-tab">
                            ${this.renderSearchPhotos(photos)}
                        </div>
                        <div class="tab-pane" id="users-tab">
                            ${this.renderSearchUsers(users)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const tabBtns = modal.querySelectorAll('.tab-btn');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchSearchTab(btn.dataset.tab);
            });
        });

        document.body.appendChild(modal);
    }

    renderSearchPhotos(photos) {
        if (photos.length === 0) {
            return '<p class="no-results">No photos found</p>';
        }
        
        return `
            <div class="search-photos-grid">
                ${photos.map(photo => `
                    <div class="search-photo-card" onclick="photosService.showPhotoDetail(${photo.id})">
                        <img src="${photo.image_url}" alt="${photo.title}" loading="lazy">
                        <div class="photo-info">
                            <h4>${photo.title}</h4>
                            <p>by ${photo.user.username}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSearchUsers(users) {
        if (users.length === 0) {
            return '<p class="no-results">No users found</p>';
        }
        
        return `
            <div class="search-users-grid">
                ${users.map(user => `
                    <div class="search-user-card" onclick="usersService.showUserProfile(${user.id})">
                        <img src="${user.avatar || '/images/default-avatar.png'}" alt="${user.username}" class="user-avatar">
                        <div class="user-info">
                            <h4>${user.username}</h4>
                            <p>${user.bio || 'No bio available'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    switchSearchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update active tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });
    }

    filterByCategory(categoryId) {
        // Navigate to photos page and filter by category
        this.navigateTo('photos');
        
        // Set category filter
        setTimeout(() => {
            photosService.filterByCategory(categoryId);
        }, 100);
    }

    showError(message) {
        UIUtils.showToast(message, 'error');
    }

    // Public methods for external use
    static getInstance() {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    // Method to check if app is ready
    isReady() {
        return this.isInitialized;
    }

    // Method to refresh current page
    refresh() {
        this.handleRouteChange(this.currentPage);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = App.getInstance();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
