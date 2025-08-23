// Authentication Module
class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    // Initialize authentication service
    init() {
        this.loadUserFromStorage();
        this.setupEventListeners();
    }

    // Load user data from localStorage
    loadUserFromStorage() {
        const token = localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN);
        const userData = localStorage.getItem(CONFIG.STORAGE.USER_DATA);
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateUI();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        }
    }

    // Save user data to localStorage
    saveUserToStorage(userData) {
        localStorage.setItem(CONFIG.STORAGE.USER_DATA, JSON.stringify(userData));
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for logout events
        window.addEventListener('auth:logout', () => {
            this.logout();
        });

        // Listen for storage changes (other tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === CONFIG.STORAGE.AUTH_TOKEN) {
                if (!event.newValue) {
                    this.logout();
                }
            }
        });
    }

    // Update UI based on authentication state
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const navAuth = document.querySelector('.nav-auth');

        if (this.isAuthenticated && this.currentUser) {
            // User is logged in
            if (navAuth) {
                navAuth.innerHTML = `
                    <div class="user-menu">
                        <button class="btn btn-outline" id="userMenuBtn">
                            <i class="fas fa-user"></i>
                            ${this.currentUser.username}
                        </button>
                        <div class="user-dropdown" id="userDropdown">
                            <a href="#" id="profileLink">
                                <i class="fas fa-user-circle"></i> Profile
                            </a>
                            <a href="#" id="settingsLink">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <a href="#" id="logoutLink">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </div>
                `;
                
                // Setup user menu event listeners
                this.setupUserMenuListeners();
            }
        } else {
            // User is not logged in
            if (navAuth) {
                navAuth.innerHTML = `
                    <button class="btn btn-outline" id="loginBtn">Login</button>
                    <button class="btn btn-primary" id="registerBtn">Sign Up</button>
                `;
                
                // Re-setup auth button listeners
                this.setupAuthButtonListeners();
            }
        }
    }

    // Setup user menu event listeners
    setupUserMenuListeners() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        const profileLink = document.getElementById('profileLink');
        const settingsLink = document.getElementById('settingsLink');
        const logoutLink = document.getElementById('logoutLink');

        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }

        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showProfileModal();
            });
        }

        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSettingsModal();
            });
        }

        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (userDropdown) {
                userDropdown.classList.remove('show');
            }
        });
    }

    // Setup authentication button event listeners
    setupAuthButtonListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showRegisterModal();
            });
        }
    }

    // Show login modal
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('show');
            document.getElementById('loginUsername').focus();
        }
    }

    // Show register modal
    showRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.classList.add('show');
            document.getElementById('registerUsername').focus();
        }
    }

    // Show profile modal
    showProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            this.loadUserProfile();
            modal.classList.add('show');
        }
    }

    // Show settings modal (placeholder)
    showSettingsModal() {
        // TODO: Implement settings modal
        console.log('Settings modal not implemented yet');
    }

    // User login
    async login(username, password) {
        try {
            const response = await api.post(CONFIG.API.ENDPOINTS.LOGIN, {
                username,
                password
            });

            if (response.success) {
                const { user, token } = response.data;
                
                // Save authentication data
                api.setAuthToken(token);
                this.saveUserToStorage(user);
                
                // Update state
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Update UI
                this.updateUI();
                
                // Close modal
                this.closeLoginModal();
                
                // Show success message
                showToast(CONFIG.SUCCESS.LOGIN, 'success');
                
                // Trigger login event
                window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
                
                return { success: true };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            return { success: false, error: error.message || CONFIG.ERRORS.UNKNOWN };
        }
    }

    // User registration
    async register(userData) {
        try {
            const response = await api.post(CONFIG.API.ENDPOINTS.REGISTER, userData);

            if (response.success) {
                const { user, token } = response.data;
                
                // Save authentication data
                api.setAuthToken(token);
                this.saveUserToStorage(user);
                
                // Update state
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Update UI
                this.updateUI();
                
                // Close modal
                this.closeRegisterModal();
                
                // Show success message
                showToast(CONFIG.SUCCESS.REGISTER, 'success');
                
                // Trigger login event
                window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
                
                return { success: true };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            return { success: false, error: error.message || CONFIG.ERRORS.UNKNOWN };
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            const response = await api.put(CONFIG.API.ENDPOINTS.PROFILE, profileData);

            if (response.success) {
                const updatedUser = response.data;
                
                // Update stored user data
                this.currentUser = { ...this.currentUser, ...updatedUser };
                this.saveUserToStorage(this.currentUser);
                
                // Show success message
                showToast(CONFIG.SUCCESS.PROFILE_UPDATE, 'success');
                
                // Trigger profile update event
                window.dispatchEvent(new CustomEvent('auth:profile-update', { detail: updatedUser }));
                
                return { success: true };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            return { success: false, error: error.message || CONFIG.ERRORS.UNKNOWN };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.put(CONFIG.API.ENDPOINTS.CHANGE_PASSWORD, {
                current_password: currentPassword,
                new_password: newPassword
            });

            if (response.success) {
                showToast(CONFIG.SUCCESS.PASSWORD_CHANGE, 'success');
                return { success: true };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            return { success: false, error: error.message || CONFIG.ERRORS.UNKNOWN };
        }
    }

    // Load user profile data
    async loadUserProfile() {
        if (!this.isAuthenticated) return;

        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.USER_PROFILE, { id: this.currentUser.id });
            
            if (response.success) {
                const userData = response.data;
                
                // Update profile modal content
                this.updateProfileModal(userData);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            showToast('Error loading profile data', 'error');
        }
    }

    // Update profile modal content
    updateProfileModal(userData) {
        const profileName = document.getElementById('profileName');
        const profileBio = document.getElementById('profileBio');
        const profilePhotos = document.getElementById('profilePhotos');
        const profileFollowers = document.getElementById('profileFollowers');
        const profileFollowing = document.getElementById('profileFollowing');
        const profileAvatar = document.getElementById('profileAvatar');

        if (profileName) profileName.textContent = `${userData.first_name} ${userData.last_name}`;
        if (profileBio) profileBio.textContent = userData.bio || 'No bio available';
        if (profilePhotos) profilePhotos.textContent = userData.photos_count || 0;
        if (profileFollowers) profileFollowers.textContent = userData.followers_count || 0;
        if (profileFollowing) profileFollowing.textContent = userData.following_count || 0;
        
        if (profileAvatar) {
            if (userData.profile_picture) {
                profileAvatar.src = userData.profile_picture;
            } else {
                profileAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSIjOUI5Q0FGIi8+CjxwYXRoIGQ9Ik0yMCA5NUMyMCA4NS4wNTc2IDI4LjA1NzYgNzcgMzggNzdIMTAyQzExMS45NDIgNzcgMTIwIDg1LjA1NzYgMTIwIDk1VjEyMEgyMFY5NVoiIGZpbGw9IiM5QjlDQUYiLz4KPC9zdmc+';
            }
        }

        // Load user photos
        this.loadUserPhotos(userData.id);
    }

    // Load user photos for profile
    async loadUserPhotos(userId) {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.USER_PHOTOS, { userId });
            
            if (response.success) {
                const photos = response.data.photos || [];
                this.updateProfilePhotosGrid(photos);
            }
        } catch (error) {
            console.error('Error loading user photos:', error);
        }
    }

    // Update profile photos grid
    updateProfilePhotosGrid(photos) {
        const photosGrid = document.getElementById('profilePhotosGrid');
        if (!photosGrid) return;

        photosGrid.innerHTML = '';
        
        if (photos.length === 0) {
            photosGrid.innerHTML = '<p class="text-center">No photos yet</p>';
            return;
        }

        photos.forEach(photo => {
            const photoElement = document.createElement('div');
            photoElement.className = 'profile-photo';
            photoElement.innerHTML = `
                <img src="${photo.file_path}" alt="${photo.title}" loading="lazy">
            `;
            
            photoElement.addEventListener('click', () => {
                this.showPhotoModal(photo);
            });
            
            photosGrid.appendChild(photoElement);
        });
    }

    // Show photo modal (placeholder)
    showPhotoModal(photo) {
        // TODO: Implement photo modal
        console.log('Photo modal not implemented yet');
    }

    // Close login modal
    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('show');
            // Reset form
            document.getElementById('loginForm').reset();
        }
    }

    // Close register modal
    closeRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.classList.remove('show');
            // Reset form
            document.getElementById('registerForm').reset();
        }
    }

    // Logout user
    logout() {
        // Clear authentication data
        api.logout();
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Update UI
        this.updateUI();
        
        // Show success message
        showToast(CONFIG.SUCCESS.LOGOUT, 'success');
        
        // Trigger logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    checkAuth() {
        return this.isAuthenticated;
    }

    // Validate form data
    validateForm(formData, formType) {
        const errors = {};

        if (formType === 'login') {
            if (!formData.username) errors.username = 'Username is required';
            if (!formData.password) errors.password = 'Password is required';
        } else if (formType === 'register') {
            if (!formData.username) errors.username = 'Username is required';
            if (formData.username && (formData.username.length < CONFIG.VALIDATION.USERNAME.MIN_LENGTH || 
                formData.username.length > CONFIG.VALIDATION.USERNAME.MAX_LENGTH)) {
                errors.username = `Username must be between ${CONFIG.VALIDATION.USERNAME.MIN_LENGTH} and ${CONFIG.VALIDATION.USERNAME.MAX_LENGTH} characters`;
            }
            if (!CONFIG.VALIDATION.USERNAME.PATTERN.test(formData.username)) {
                errors.username = 'Username can only contain letters, numbers, and underscores';
            }
            if (!formData.email) errors.email = 'Email is required';
            if (!CONFIG.VALIDATION.EMAIL.PATTERN.test(formData.email)) {
                errors.email = 'Please enter a valid email address';
            }
            if (!formData.password) errors.password = 'Password is required';
            if (formData.password && formData.password.length < CONFIG.VALIDATION.PASSWORD.MIN_LENGTH) {
                errors.password = `Password must be at least ${CONFIG.VALIDATION.PASSWORD.MIN_LENGTH} characters`;
            }
            if (!formData.first_name) errors.first_name = 'First name is required';
            if (!formData.last_name) errors.last_name = 'Last name is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

// Create global auth service instance
const auth = new AuthService();

// Setup form event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('loginUsername').value.trim(),
                password: document.getElementById('loginPassword').value
            };

            const validation = auth.validateForm(formData, 'login');
            if (!validation.isValid) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            const result = await auth.login(formData.username, formData.password);
            if (!result.success) {
                showToast(result.error, 'error');
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('registerUsername').value.trim(),
                email: document.getElementById('registerEmail').value.trim(),
                password: document.getElementById('registerPassword').value,
                first_name: document.getElementById('registerFirstName').value.trim(),
                last_name: document.getElementById('registerLastName').value.trim()
            };

            const validation = auth.validateForm(formData, 'register');
            if (!validation.isValid) {
                Object.keys(validation.errors).forEach(field => {
                    showToast(validation.errors[field], 'error');
                });
                return;
            }

            const result = await auth.register(formData);
            if (!result.success) {
                showToast(result.error, 'error');
            }
        });
    }

    // Modal close buttons
    const loginModalClose = document.getElementById('loginModalClose');
    const registerModalClose = document.getElementById('registerModalClose');
    const profileModalClose = document.getElementById('profileModalClose');

    if (loginModalClose) {
        loginModalClose.addEventListener('click', () => auth.closeLoginModal());
    }

    if (registerModalClose) {
        registerModalClose.addEventListener('click', () => auth.closeRegisterModal());
    }

    if (profileModalClose) {
        profileModalClose.addEventListener('click', () => {
            const modal = document.getElementById('profileModal');
            if (modal) modal.classList.remove('show');
        });
    }

    // Modal switch links
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            auth.closeLoginModal();
            auth.showRegisterModal();
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            auth.closeRegisterModal();
            auth.showLoginModal();
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Setup initial auth button listeners
    auth.setupAuthButtonListeners();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
} else {
    // Browser environment
    window.AuthService = AuthService;
    window.auth = auth;
}
