// Photos Module
class PhotosService {
    constructor() {
        this.currentPage = 1;
        this.currentLimit = CONFIG.APP.DEFAULT_PAGE_SIZE;
        this.hasMorePhotos = true;
        this.currentFilters = {};
        this.currentSort = 'newest';
        this.photos = [];
        this.isLoading = false;
        this.init();
    }

    // Initialize photos service
    init() {
        this.setupEventListeners();
        this.loadInitialPhotos();
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', ui.debounce((e) => {
                this.handleSearch(e.target.value);
            }, CONFIG.APP.SEARCH_DELAY));
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput ? searchInput.value.trim() : '';
                this.handleSearch(query);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePhotos();
            });
        }

        // Navigation controls
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousPage();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextPage();
            });
        }

        // Listen for authentication events
        window.addEventListener('auth:login', () => {
            this.refreshPhotos();
        });

        window.addEventListener('auth:logout', () => {
            this.refreshPhotos();
        });
    }

    // Handle search
    handleSearch(query) {
        if (query.length < CONFIG.APP.MIN_SEARCH_LENGTH && query.length > 0) {
            return;
        }

        this.currentFilters.search = query;
        this.currentPage = 1;
        this.photos = [];
        this.loadPhotos();
    }

    // Load initial photos
    async loadInitialPhotos() {
        await this.loadPhotos();
        this.updateHeroStats();
    }

    // Load photos with current filters and pagination
    async loadPhotos() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const queryParams = {
                page: this.currentPage,
                limit: this.currentLimit,
                ...this.currentFilters
            };

            if (this.currentSort !== 'newest') {
                queryParams.sort = this.currentSort;
            }

            const response = await api.get(CONFIG.API.ENDPOINTS.PHOTOS, {}, {
                query: queryParams,
                useCache: false
            });

            if (response.success) {
                const { photos, pagination } = response.data;
                
                if (this.currentPage === 1) {
                    this.photos = photos;
                } else {
                    this.photos = [...this.photos, ...photos];
                }

                this.hasMorePhotos = this.currentPage < pagination.pages;
                this.updatePhotosGrid();
                this.updatePaginationControls();
                this.updateLoadMoreButton();
            } else {
                showToast('Error loading photos', 'error');
            }
        } catch (error) {
            console.error('Error loading photos:', error);
            showToast('Failed to load photos', 'error');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // Load more photos
    async loadMorePhotos() {
        if (this.isLoading || !this.hasMorePhotos) return;

        this.currentPage++;
        await this.loadPhotos();
    }

    // Previous page
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.photos = [];
            this.loadPhotos();
        }
    }

    // Next page
    nextPage() {
        if (this.hasMorePhotos) {
            this.currentPage++;
            this.photos = [];
            this.loadPhotos();
        }
    }

    // Refresh photos
    refreshPhotos() {
        this.currentPage = 1;
        this.photos = [];
        this.loadPhotos();
    }

    // Show loading state
    showLoadingState() {
        const grid = document.getElementById('featuredPhotosGrid');
        if (grid && this.currentPage === 1) {
            grid.innerHTML = '';
            const skeletons = ui.createSkeleton('card', 6);
            skeletons.forEach(skeleton => grid.appendChild(skeleton));
        }
    }

    // Hide loading state
    hideLoadingState() {
        // Loading state is handled by the photos grid update
    }

    // Update photos grid
    updatePhotosGrid() {
        const grid = document.getElementById('featuredPhotosGrid');
        if (!grid) return;

        if (this.currentPage === 1) {
            grid.innerHTML = '';
        }

        this.photos.forEach(photo => {
            const photoCard = this.createPhotoCard(photo);
            grid.appendChild(photoCard);
        });

        // Setup lazy loading for new images
        ui.setupLazyLoading();
    }

    // Create photo card element
    createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.photoId = photo.id;

        // Use placeholder image if file_path is not accessible
        const imageSrc = photo.file_path && photo.file_path !== '/uploads/photo1.jpg' 
            ? photo.file_path 
            : `https://picsum.photos/400/300?random=${photo.id}`;

        card.innerHTML = `
            <div class="photo-image">
                <img src="${imageSrc}" alt="${photo.title}" loading="lazy">
                <div class="photo-overlay">
                    <div class="photo-info">
                        <h4 class="photo-title">${photo.title}</h4>
                        <p class="photo-artist">by ${photo.username || 'Unknown Artist'}</p>
                    </div>
                </div>
                <div class="photo-actions">
                    <button class="photo-action" data-action="like" title="Like">
                        <i class="fas fa-heart ${photo.isLiked ? 'liked' : ''}"></i>
                    </button>
                    <button class="photo-action" data-action="comment" title="Comment">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="photo-action" data-action="share" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.setupPhotoCardListeners(card, photo);

        return card;
    }

    // Setup photo card event listeners
    setupPhotoCardListeners(card, photo) {
        // Card click - show photo modal
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.photo-action')) {
                this.showPhotoModal(photo);
            }
        });

        // Like button
        const likeBtn = card.querySelector('[data-action="like"]');
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLike(photo, likeBtn);
            });
        }

        // Comment button
        const commentBtn = card.querySelector('[data-action="comment"]');
        if (commentBtn) {
            commentBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPhotoModal(photo, 'comments');
            });
        }

        // Share button
        const shareBtn = card.querySelector('[data-action="share"]');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sharePhoto(photo);
            });
        }
    }

    // Toggle like on photo
    async toggleLike(photo, likeBtn) {
        if (!auth.checkAuth()) {
            showToast('Please log in to like photos', 'warning');
            return;
        }

        try {
            const icon = likeBtn.querySelector('i');
            const isLiked = icon.classList.contains('liked');

            if (isLiked) {
                // Unlike
                const response = await api.delete(CONFIG.API.ENDPOINTS.UNLIKE_PHOTO, { photoId: photo.id });
                if (response.success) {
                    icon.classList.remove('liked');
                    showToast('Like removed', 'success');
                }
            } else {
                // Like
                const response = await api.post(CONFIG.API.ENDPOINTS.LIKE_PHOTO, {}, { photoId: photo.id });
                if (response.success) {
                    icon.classList.add('liked');
                    showToast('Photo liked!', 'success');
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            showToast('Failed to update like', 'error');
        }
    }

    // Show photo modal
    showPhotoModal(photo, focusSection = null) {
        const modal = document.getElementById('photoModal');
        if (!modal) return;

        // Update modal content
        this.updatePhotoModal(photo);
        
        // Show modal
        modal.classList.add('show');
        
        // Focus on specific section if requested
        if (focusSection === 'comments') {
            const commentText = document.getElementById('commentText');
            if (commentText) {
                setTimeout(() => commentText.focus(), 300);
            }
        }

        // Load comments
        this.loadPhotoComments(photo.id);
        
        // Check if user liked this photo
        this.checkPhotoLikeStatus(photo.id);
    }

    // Update photo modal content
    updatePhotoModal(photo) {
        const modalTitle = document.getElementById('photoModalTitle');
        const modalImage = document.getElementById('photoModalImage');
        const modalTitleText = document.getElementById('photoModalTitleText');
        const modalDescription = document.getElementById('photoModalDescription');
        const modalArtist = document.getElementById('photoModalArtist');
        const modalViews = document.getElementById('photoModalViews');
        const modalLikes = document.getElementById('photoModalLikes');

        if (modalTitle) modalTitle.textContent = photo.title;
        if (modalImage) modalImage.src = photo.file_path || `https://picsum.photos/800/600?random=${photo.id}`;
        if (modalTitleText) modalTitleText.textContent = photo.title;
        if (modalDescription) modalDescription.textContent = photo.description || 'No description available';
        if (modalArtist) modalArtist.textContent = photo.username || 'Unknown Artist';
        if (modalViews) modalViews.textContent = photo.views_count || 0;
        if (modalLikes) modalLikes.textContent = photo.likes_count || 0;

        // Update modal title
        if (modalTitle) {
            modalTitle.textContent = photo.title;
        }
    }

    // Load photo comments
    async loadPhotoComments(photoId) {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.PHOTO_COMMENTS, { photoId });
            
            if (response.success) {
                const comments = response.data.comments || [];
                this.updateCommentsList(comments);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    // Update comments list
    updateCommentsList(comments) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;

        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="text-center">No comments yet</p>';
            return;
        }

        comments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    }

    // Create comment element
    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.username || 'Unknown User'}</span>
                <span class="comment-date">${ui.formatDate(comment.created_at)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        `;
        return commentDiv;
    }

    // Check photo like status
    async checkPhotoLikeStatus(photoId) {
        if (!auth.checkAuth()) return;

        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.CHECK_LIKE, { photoId });
            
            if (response.success) {
                const isLiked = response.data.liked;
                const likeBtn = document.getElementById('likePhotoBtn');
                if (likeBtn) {
                    const icon = likeBtn.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('liked', isLiked);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    }

    // Share photo
    sharePhoto(photo) {
        if (navigator.share) {
            navigator.share({
                title: photo.title,
                text: photo.description || `Check out this amazing photo: ${photo.title}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy link to clipboard
            const shareUrl = `${window.location.origin}/photo/${photo.id}`;
            ui.copyToClipboard(shareUrl).then(success => {
                if (success) {
                    showToast('Link copied to clipboard!', 'success');
                } else {
                    showToast('Failed to copy link', 'error');
                }
            });
        }
    }

    // Update pagination controls
    updatePaginationControls() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = !this.hasMorePhotos;
        }
    }

    // Update load more button
    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = this.hasMorePhotos ? 'block' : 'none';
            loadMoreBtn.disabled = this.isLoading;
        }
    }

    // Update hero stats
    async updateHeroStats() {
        try {
            // Get total photos count
            const photosResponse = await api.get(CONFIG.API.ENDPOINTS.PHOTOS, {}, {
                query: { limit: 1 },
                useCache: true
            });

            if (photosResponse.success) {
                const totalPhotos = photosResponse.data.pagination?.total || 0;
                const totalPhotosElement = document.getElementById('totalPhotos');
                if (totalPhotosElement) {
                    totalPhotosElement.textContent = totalPhotos.toLocaleString();
                }
            }

            // Get total users count
            const usersResponse = await api.get(CONFIG.API.ENDPOINTS.USERS, {}, {
                query: { limit: 1 },
                useCache: true
            });

            if (usersResponse.success) {
                const totalUsers = usersResponse.data.pagination?.total || 0;
                const totalArtistsElement = document.getElementById('totalArtists');
                if (totalArtistsElement) {
                    totalArtistsElement.textContent = totalUsers.toLocaleString();
                }
            }

            // Get total categories count
            const categoriesResponse = await api.get(CONFIG.API.ENDPOINTS.CATEGORIES, {}, {
                useCache: true
            });

            if (categoriesResponse.success) {
                const totalCategories = categoriesResponse.data.length || 0;
                const totalCategoriesElement = document.getElementById('totalCategories');
                if (totalCategoriesElement) {
                    totalCategoriesElement.textContent = totalCategories.toLocaleString();
                }
            }
        } catch (error) {
            console.error('Error updating hero stats:', error);
        }
    }

    // Filter photos by category
    filterByCategory(categoryId) {
        this.currentFilters.category = categoryId;
        this.currentPage = 1;
        this.photos = [];
        this.loadPhotos();
    }

    // Sort photos
    sortPhotos(sortBy) {
        this.currentSort = sortBy;
        this.currentPage = 1;
        this.photos = [];
        this.loadPhotos();
    }

    // Get current photos
    getCurrentPhotos() {
        return this.photos;
    }

    // Get current filters
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    // Clear filters
    clearFilters() {
        this.currentFilters = {};
        this.currentPage = 1;
        this.photos = [];
        this.loadPhotos();
    }
}

// Create global photos service instance
const photosService = new PhotosService();

// Setup comment form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!auth.checkAuth()) {
                showToast('Please log in to comment', 'warning');
                return;
            }

            const commentText = document.getElementById('commentText');
            const content = commentText.value.trim();
            
            if (!content) {
                showToast('Please enter a comment', 'warning');
                return;
            }

            // Get current photo ID from modal
            const photoModal = document.getElementById('photoModal');
            if (!photoModal || !photoModal.classList.contains('show')) {
                showToast('No photo selected', 'error');
                return;
            }

            // For now, we'll use a placeholder photo ID
            // In a real implementation, you'd store the current photo ID
            const photoId = 1; // This should be dynamic

            try {
                const response = await api.post(CONFIG.API.ENDPOINTS.PHOTO_COMMENTS, {
                    content: content
                }, { photoId });

                if (response.success) {
                    showToast('Comment added successfully!', 'success');
                    commentText.value = '';
                    
                    // Reload comments
                    photosService.loadPhotoComments(photoId);
                } else {
                    showToast('Failed to add comment', 'error');
                }
            } catch (error) {
                console.error('Error adding comment:', error);
                showToast('Failed to add comment', 'error');
            }
        });
    }

    // Photo modal close button
    const photoModalClose = document.getElementById('photoModalClose');
    if (photoModalClose) {
        photoModalClose.addEventListener('click', () => {
            const modal = document.getElementById('photoModal');
            if (modal) modal.classList.remove('show');
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotosService;
} else {
    // Browser environment
    window.PhotosService = PhotosService;
    window.photosService = photosService;
}
