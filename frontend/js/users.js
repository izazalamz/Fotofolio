// Users Module
class UsersService {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.init();
    }

    // Initialize users service
    init() {
        this.setupEventListeners();
        this.loadTopUsers();
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for authentication events
        window.addEventListener('auth:login', (event) => {
            this.currentUser = event.detail;
            this.refreshTopUsers();
        });

        window.addEventListener('auth:logout', () => {
            this.currentUser = null;
            this.refreshTopUsers();
        });
    }

    // Load top users
    async loadTopUsers() {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.USERS, {}, {
                query: { limit: 6, sort: 'photos_count' },
                useCache: true
            });
            
            if (response.success) {
                this.users = response.data.users || response.data || [];
                this.updateUsersGrid();
            } else {
                showToast('Error loading users', 'error');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showToast('Failed to load users', 'error');
        }
    }

    // Update users grid
    updateUsersGrid() {
        const grid = document.getElementById('artistsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        
        this.users.forEach(user => {
            const userCard = this.createUserCard(user);
            grid.appendChild(userCard);
        });
    }

    // Create user card element
    createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'artist-card';
        card.dataset.userId = user.id;

        // Use placeholder avatar if no profile picture
        const avatarSrc = user.profile_picture || `https://picsum.photos/100/100?random=${user.id}`;

        card.innerHTML = `
            <div class="artist-avatar">
                <img src="${avatarSrc}" alt="${user.username}" loading="lazy">
            </div>
            <h3>${user.first_name} ${user.last_name}</h3>
            <p class="artist-bio">${user.bio || 'No bio available'}</p>
            <div class="artist-stats">
                <div class="artist-stat">
                    <span class="artist-stat-number">${user.photos_count || 0}</span>
                    <span class="artist-stat-label">Photos</span>
                </div>
                <div class="artist-stat">
                    <span class="artist-stat-number">${user.followers_count || 0}</span>
                    <span class="artist-stat-label">Followers</span>
                </div>
                <div class="artist-stat">
                    <span class="artist-stat-number">${user.following_count || 0}</span>
                    <span class="artist-stat-label">Following</span>
                </div>
            </div>
            <button class="btn btn-outline follow-btn" data-user-id="${user.id}">
                <i class="fas fa-user-plus"></i> Follow
            </button>
        `;

        // Add event listeners
        this.setupUserCardListeners(card, user);

        return card;
    }

    // Setup user card event listeners
    setupUserCardListeners(card, user) {
        // Card click - show user profile
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.follow-btn')) {
                this.showUserProfile(user);
            }
        });

        // Follow button
        const followBtn = card.querySelector('.follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFollow(user, followBtn);
            });
        }
    }

    // Show user profile
    showUserProfile(user) {
        const modal = document.getElementById('profileModal');
        if (!modal) return;

        // Update modal content
        this.updateProfileModal(user);
        
        // Show modal
        modal.classList.add('show');
        
        // Load user photos
        this.loadUserPhotos(user.id);
        
        // Check follow status
        this.checkFollowStatus(user.id);
    }

    // Update profile modal content
    updateProfileModal(user) {
        const profileName = document.getElementById('profileName');
        const profileBio = document.getElementById('profileBio');
        const profilePhotos = document.getElementById('profilePhotos');
        const profileFollowers = document.getElementById('profileFollowers');
        const profileFollowing = document.getElementById('profileFollowing');
        const profileAvatar = document.getElementById('profileAvatar');
        const followProfileBtn = document.getElementById('followProfileBtn');

        if (profileName) profileName.textContent = `${user.first_name} ${user.last_name}`;
        if (profileBio) profileBio.textContent = user.bio || 'No bio available';
        if (profilePhotos) profilePhotos.textContent = user.photos_count || 0;
        if (profileFollowers) profileFollowers.textContent = user.followers_count || 0;
        if (profileFollowing) profileFollowing.textContent = user.following_count || 0;
        
        if (profileAvatar) {
            if (user.profile_picture) {
                profileAvatar.src = user.profile_picture;
            } else {
                profileAvatar.src = `https://picsum.photos/120/120?random=${user.id}`;
            }
        }

        // Update follow button
        if (followProfileBtn) {
            followProfileBtn.dataset.userId = user.id;
            followProfileBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
        }

        // Update modal title
        const modalTitle = document.getElementById('profileModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `${user.first_name} ${user.last_name}'s Profile`;
        }
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
                <img src="${photo.file_path || `https://picsum.photos/150/150?random=${photo.id}`}" 
                     alt="${photo.title}" loading="lazy">
            `;
            
            photoElement.addEventListener('click', () => {
                if (photosService) {
                    photosService.showPhotoModal(photo);
                }
            });
            
            photosGrid.appendChild(photoElement);
        });
    }

    // Toggle follow status
    async toggleFollow(user, followBtn) {
        if (!auth.checkAuth()) {
            showToast('Please log in to follow users', 'warning');
            return;
        }

        if (user.id === this.currentUser?.id) {
            showToast('You cannot follow yourself', 'warning');
            return;
        }

        try {
            const isFollowing = followBtn.classList.contains('following');
            
            if (isFollowing) {
                // Unfollow
                const response = await api.delete(CONFIG.API.ENDPOINTS.USER_FOLLOW, { id: user.id });
                if (response.success) {
                    followBtn.classList.remove('following');
                    followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
                    showToast('Unfollowed successfully', 'success');
                    
                    // Update user stats
                    user.followers_count = Math.max(0, (user.followers_count || 1) - 1);
                    this.updateUserStats(user);
                }
            } else {
                // Follow
                const response = await api.post(CONFIG.API.ENDPOINTS.USER_FOLLOW, {}, { id: user.id });
                if (response.success) {
                    followBtn.classList.add('following');
                    followBtn.innerHTML = '<i class="fas fa-user-check"></i> Following';
                    showToast('Followed successfully!', 'success');
                    
                    // Update user stats
                    user.followers_count = (user.followers_count || 0) + 1;
                    this.updateUserStats(user);
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            showToast('Failed to update follow status', 'error');
        }
    }

    // Check follow status
    async checkFollowStatus(userId) {
        if (!auth.checkAuth() || userId === this.currentUser?.id) return;

        try {
            // This would require a backend endpoint to check follow status
            // For now, we'll assume not following
            const followBtn = document.getElementById('followProfileBtn');
            if (followBtn) {
                followBtn.classList.remove('following');
                followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    }

    // Update user stats in UI
    updateUserStats(user) {
        // Update in users grid
        const userCard = document.querySelector(`[data-user-id="${user.id}"]`);
        if (userCard) {
            const followersStat = userCard.querySelector('.artist-stat:nth-child(2) .artist-stat-number');
            if (followersStat) {
                followersStat.textContent = user.followers_count || 0;
            }
        }

        // Update in profile modal if open
        const profileModal = document.getElementById('profileModal');
        if (profileModal && profileModal.classList.contains('show')) {
            const profileFollowers = document.getElementById('profileFollowers');
            if (profileFollowers) {
                profileFollowers.textContent = user.followers_count || 0;
            }
        }
    }

    // Get user by ID
    getUserById(id) {
        return this.users.find(user => user.id === id);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Refresh top users
    refreshTopUsers() {
        this.loadTopUsers();
    }

    // Search users
    async searchUsers(query, limit = 10) {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.USERS, {}, {
                query: { search: query, limit },
                useCache: false
            });
            
            if (response.success) {
                return response.data.users || response.data || [];
            }
            return [];
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }

    // Get user followers
    async getUserFollowers(userId, page = 1, limit = 20) {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.USER_FOLLOWERS, { id: userId }, {
                query: { page, limit },
                useCache: false
            });
            
            if (response.success) {
                return response.data.followers || response.data || [];
            }
            return [];
        } catch (error) {
            console.error('Error loading user followers:', error);
            return [];
        }
    }

    // Get user following
    async getUserFollowing(userId, page = 1, limit = 20) {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.USER_FOLLOWING, { id: userId }, {
                query: { page, limit },
                useCache: false
            });
            
            if (response.success) {
                return response.data.following || response.data || [];
            }
            return [];
        } catch (error) {
            console.error('Error loading user following:', error);
            return [];
        }
    }
}

// Create global users service instance
const usersService = new UsersService();

// Setup profile modal follow button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const followProfileBtn = document.getElementById('followProfileBtn');
    if (followProfileBtn) {
        followProfileBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const userId = followProfileBtn.dataset.userId;
            if (!userId) return;

            const user = usersService.getUserById(parseInt(userId));
            if (!user) return;

            // Create a temporary follow button for the toggle function
            const tempBtn = document.createElement('button');
            tempBtn.classList.add('follow-btn');
            tempBtn.classList.toggle('following', followProfileBtn.classList.contains('following'));
            
            await usersService.toggleFollow(user, tempBtn);
            
            // Update the profile follow button
            if (tempBtn.classList.contains('following')) {
                followProfileBtn.classList.add('following');
                followProfileBtn.innerHTML = '<i class="fas fa-user-check"></i> Following';
            } else {
                followProfileBtn.classList.remove('following');
                followProfileBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            }
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsersService;
} else {
    // Browser environment
    window.UsersService = UsersService;
    window.usersService = usersService;
}
