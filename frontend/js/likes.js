/**
 * Likes Service - Handles photo likes functionality
 */
class LikesService {
    constructor() {
        this.likedPhotos = new Set();
        this.likeCounts = new Map();
        this.init();
    }

    init() {
        this.loadLikedPhotos();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Global event delegation for like buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.like-btn') || e.target.closest('.like-btn')) {
                const likeBtn = e.target.closest('.like-btn');
                const photoId = likeBtn.dataset.photoId;
                if (photoId) {
                    this.toggleLike(photoId, likeBtn);
                }
            }
        });
    }

    async loadLikedPhotos() {
        if (!AuthService.isAuthenticated()) return;

        try {
            const response = await ApiService.get(`/likes/user/${AuthService.getCurrentUser().id}`);
            if (response.success) {
                this.likedPhotos.clear();
                response.data.forEach(like => {
                    this.likedPhotos.add(like.photo_id);
                });
                this.updateAllLikeButtons();
            }
        } catch (error) {
            console.error('Error loading liked photos:', error);
        }
    }

    async toggleLike(photoId, likeBtn) {
        if (!AuthService.isAuthenticated()) {
            UIUtils.showModal('login-modal');
            return;
        }

        const isLiked = this.likedPhotos.has(parseInt(photoId));
        const likeIcon = likeBtn.querySelector('.like-icon');
        const likeCount = likeBtn.querySelector('.like-count');

        try {
            UIUtils.showLoadingSpinner();
            
            if (isLiked) {
                // Unlike
                await ApiService.delete(`/likes/photo/${photoId}`);
                this.likedPhotos.delete(parseInt(photoId));
                this.updateLikeButton(likeBtn, false);
                UIUtils.showToast('Photo unliked', 'success');
            } else {
                // Like
                await ApiService.post(`/likes/photo/${photoId}`);
                this.likedPhotos.add(parseInt(photoId));
                this.updateLikeButton(likeBtn, true);
                UIUtils.showToast('Photo liked!', 'success');
            }

            // Update like count
            await this.updateLikeCount(photoId, likeCount);
            
        } catch (error) {
            console.error('Error toggling like:', error);
            UIUtils.showToast('Failed to update like', 'error');
        } finally {
            UIUtils.hideLoadingSpinner();
        }
    }

    updateLikeButton(likeBtn, isLiked) {
        const likeIcon = likeBtn.querySelector('.like-icon');
        const likeCount = likeBtn.querySelector('.like-count');

        if (isLiked) {
            likeBtn.classList.add('liked');
            likeIcon.innerHTML = '<i class="fas fa-heart"></i>';
            likeBtn.setAttribute('title', 'Unlike this photo');
        } else {
            likeBtn.classList.remove('liked');
            likeIcon.innerHTML = '<i class="far fa-heart"></i>';
            likeBtn.setAttribute('title', 'Like this photo');
        }
    }

    async updateLikeCount(photoId, likeCountElement) {
        try {
            const response = await ApiService.get(`/likes/photo/${photoId}/count`);
            if (response.success) {
                const count = response.data.count || 0;
                likeCountElement.textContent = count;
                this.likeCounts.set(parseInt(photoId), count);
            }
        } catch (error) {
            console.error('Error updating like count:', error);
        }
    }

    updateAllLikeButtons() {
        document.querySelectorAll('.like-btn').forEach(likeBtn => {
            const photoId = parseInt(likeBtn.dataset.photoId);
            if (photoId) {
                const isLiked = this.likedPhotos.has(photoId);
                this.updateLikeButton(likeBtn, isLiked);
            }
        });
    }

    async loadPhotoLikes(photoId, container) {
        try {
            const response = await ApiService.get(`/likes/photo/${photoId}`);
            if (response.success) {
                this.displayPhotoLikes(response.data, container);
            }
        } catch (error) {
            console.error('Error loading photo likes:', error);
        }
    }

    displayPhotoLikes(likes, container) {
        if (!likes || likes.length === 0) {
            container.innerHTML = '<p class="no-likes">No likes yet</p>';
            return;
        }

        const likesList = document.createElement('div');
        likesList.className = 'likes-list';

        likes.forEach(like => {
            const likeItem = document.createElement('div');
            likeItem.className = 'like-item';
            
            likeItem.innerHTML = `
                <div class="like-user">
                    <img src="${like.user.avatar || '/images/default-avatar.png'}" 
                         alt="${like.user.username}" 
                         class="like-avatar">
                    <span class="like-username">${like.user.username}</span>
                </div>
                <span class="like-date">${UIUtils.formatDate(like.created_at)}</span>
            `;

            // Make username clickable to show profile
            const username = likeItem.querySelector('.like-username');
            username.style.cursor = 'pointer';
            username.addEventListener('click', () => {
                UsersService.showUserProfile(like.user.id);
            });

            likesList.appendChild(likeItem);
        });

        container.innerHTML = '';
        container.appendChild(likesList);
    }

    async getLikeStats(photoId) {
        try {
            const response = await ApiService.get(`/likes/photo/${photoId}/count`);
            if (response.success) {
                return response.data.count || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error getting like stats:', error);
            return 0;
        }
    }

    isPhotoLiked(photoId) {
        return this.likedPhotos.has(parseInt(photoId));
    }

    getLikeCount(photoId) {
        return this.likeCounts.get(parseInt(photoId)) || 0;
    }

    // Update like counts for multiple photos
    async updateMultipleLikeCounts(photoIds) {
        const promises = photoIds.map(async (photoId) => {
            try {
                const count = await this.getLikeStats(photoId);
                this.likeCounts.set(parseInt(photoId), count);
                return { photoId, count };
            } catch (error) {
                console.error(`Error updating like count for photo ${photoId}:`, error);
                return { photoId, count: 0 };
            }
        });

        const results = await Promise.all(promises);
        this.updateLikeCountsInUI(results);
    }

    updateLikeCountsInUI(likeData) {
        likeData.forEach(({ photoId, count }) => {
            const likeBtn = document.querySelector(`.like-btn[data-photo-id="${photoId}"]`);
            if (likeBtn) {
                const likeCount = likeBtn.querySelector('.like-count');
                if (likeCount) {
                    likeCount.textContent = count;
                }
            }
        });
    }

    // Reset likes when user logs out
    resetLikes() {
        this.likedPhotos.clear();
        this.likeCounts.clear();
        this.updateAllLikeButtons();
    }

    // Export methods for external use
    static getInstance() {
        if (!LikesService.instance) {
            LikesService.instance = new LikesService();
        }
        return LikesService.instance;
    }
}

// Initialize likes service
const likesService = LikesService.getInstance();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LikesService;
}
