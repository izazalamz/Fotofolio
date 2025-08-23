/**
 * Comments Service - Handles photo comments functionality
 */
class CommentsService {
    constructor() {
        this.comments = new Map(); // photoId -> comments array
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Global event delegation for comment actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-comment-btn')) {
                const photoId = e.target.dataset.photoId;
                if (photoId) {
                    this.showAddCommentForm(photoId);
                }
            } else if (e.target.matches('.submit-comment-btn')) {
                const photoId = e.target.dataset.photoId;
                if (photoId) {
                    this.submitComment(photoId);
                }
            } else if (e.target.matches('.edit-comment-btn')) {
                const commentId = e.target.dataset.commentId;
                if (commentId) {
                    this.showEditCommentForm(commentId);
                }
            } else if (e.target.matches('.delete-comment-btn')) {
                const commentId = e.target.dataset.commentId;
                if (commentId) {
                    this.deleteComment(commentId);
                }
            } else if (e.target.matches('.reply-comment-btn')) {
                const commentId = e.target.dataset.commentId;
                if (commentId) {
                    this.showReplyForm(commentId);
                }
            }
        });
    }

    async loadComments(photoId, container) {
        try {
            const response = await ApiService.get(`/comments/photo/${photoId}`);
            if (response.success) {
                this.comments.set(parseInt(photoId), response.data);
                this.displayComments(photoId, response.data, container);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            container.innerHTML = '<p class="error">Failed to load comments</p>';
        }
    }

    displayComments(photoId, comments, container) {
        if (!comments || comments.length === 0) {
            container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }

        const commentsList = document.createElement('div');
        commentsList.className = 'comments-list';

        comments.forEach(comment => {
            const commentElement = this.createCommentElement(comment, photoId);
            commentsList.appendChild(commentElement);
        });

        container.innerHTML = '';
        container.appendChild(commentsList);
    }

    createCommentElement(comment, photoId) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        commentDiv.dataset.commentId = comment.id;

        const isOwner = AuthService.isAuthenticated() && 
                       AuthService.getCurrentUser().id === comment.user_id;

        commentDiv.innerHTML = `
            <div class="comment-header">
                <div class="comment-user">
                    <img src="${comment.user.avatar || '/images/default-avatar.png'}" 
                         alt="${comment.user.username}" 
                         class="comment-avatar">
                    <span class="comment-username">${comment.user.username}</span>
                </div>
                <div class="comment-actions">
                    <span class="comment-date">${UIUtils.formatDate(comment.created_at)}</span>
                    ${isOwner ? `
                        <button class="edit-comment-btn" data-comment-id="${comment.id}" title="Edit comment">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-comment-btn" data-comment-id="${comment.id}" title="Delete comment">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                    <button class="reply-comment-btn" data-comment-id="${comment.id}" title="Reply to comment">
                        <i class="fas fa-reply"></i>
                    </button>
                </div>
            </div>
            <div class="comment-content">
                <p>${this.escapeHtml(comment.content)}</p>
            </div>
            <div class="comment-replies" id="replies-${comment.id}"></div>
        `;

        // Make username clickable to show profile
        const username = commentDiv.querySelector('.comment-username');
        username.style.cursor = 'pointer';
        username.addEventListener('click', () => {
            UsersService.showUserProfile(comment.user.id);
        });

        // Load replies if any
        if (comment.replies && comment.replies.length > 0) {
            this.displayReplies(comment.id, comment.replies, commentDiv.querySelector('.comment-replies'));
        }

        return commentDiv;
    }

    displayReplies(commentId, replies, container) {
        const repliesList = document.createElement('div');
        repliesList.className = 'replies-list';

        replies.forEach(reply => {
            const replyElement = this.createReplyElement(reply);
            repliesList.appendChild(replyElement);
        });

        container.appendChild(repliesList);
    }

    createReplyElement(reply) {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'reply-item';
        replyDiv.dataset.replyId = reply.id;

        const isOwner = AuthService.isAuthenticated() && 
                       AuthService.getCurrentUser().id === reply.user_id;

        replyDiv.innerHTML = `
            <div class="reply-header">
                <div class="reply-user">
                    <img src="${reply.user.avatar || '/images/default-avatar.png'}" 
                         alt="${reply.user.username}" 
                         class="reply-avatar">
                    <span class="reply-username">${reply.user.username}</span>
                </div>
                <div class="reply-actions">
                    <span class="reply-date">${UIUtils.formatDate(reply.created_at)}</span>
                    ${isOwner ? `
                        <button class="edit-reply-btn" data-reply-id="${reply.id}" title="Edit reply">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-reply-btn" data-reply-id="${reply.id}" title="Delete reply">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="reply-content">
                <p>${this.escapeHtml(reply.content)}</p>
            </div>
        `;

        // Make username clickable
        const username = replyDiv.querySelector('.reply-username');
        username.style.cursor = 'pointer';
        username.addEventListener('click', () => {
            UsersService.showUserProfile(reply.user.id);
        });

        return replyDiv;
    }

    showAddCommentForm(photoId) {
        if (!AuthService.isAuthenticated()) {
            UIUtils.showModal('login-modal');
            return;
        }

        const container = document.querySelector(`#comments-${photoId}`);
        if (!container) return;

        const formContainer = document.createElement('div');
        formContainer.className = 'comment-form-container';
        formContainer.innerHTML = `
            <form class="comment-form" id="comment-form-${photoId}">
                <textarea 
                    class="comment-input" 
                    placeholder="Write a comment..." 
                    required
                    maxlength="500"
                ></textarea>
                <div class="comment-form-actions">
                    <span class="char-count">0/500</span>
                    <button type="submit" class="submit-comment-btn" data-photo-id="${photoId}">
                        Post Comment
                    </button>
                    <button type="button" class="cancel-comment-btn">Cancel</button>
                </div>
            </form>
        `;

        // Insert at the top of comments
        container.insertBefore(formContainer, container.firstChild);

        // Set up form event listeners
        const form = formContainer.querySelector('.comment-form');
        const textarea = form.querySelector('.comment-input');
        const charCount = form.querySelector('.char-count');
        const cancelBtn = form.querySelector('.cancel-comment-btn');

        // Character count
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = `${count}/500`;
            charCount.classList.toggle('limit-reached', count >= 500);
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            container.removeChild(formContainer);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment(photoId);
        });

        // Focus on textarea
        textarea.focus();
    }

    async submitComment(photoId) {
        const form = document.getElementById(`comment-form-${photoId}`);
        const textarea = form.querySelector('.comment-input');
        const content = textarea.value.trim();

        if (!content) {
            UIUtils.showToast('Comment cannot be empty', 'error');
            return;
        }

        try {
            UIUtils.showLoadingSpinner();

            const response = await ApiService.post(`/comments/photo/${photoId}`, {
                content: content
            });

            if (response.success) {
                // Clear form
                textarea.value = '';
                
                // Reload comments
                const container = document.querySelector(`#comments-${photoId}`);
                if (container) {
                    await this.loadComments(photoId, container);
                }

                // Remove form
                const formContainer = form.closest('.comment-form-container');
                if (formContainer) {
                    formContainer.remove();
                }

                UIUtils.showToast('Comment posted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            UIUtils.showToast('Failed to post comment', 'error');
        } finally {
            UIUtils.hideLoadingSpinner();
        }
    }

    showEditCommentForm(commentId) {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentElement) return;

        const contentElement = commentElement.querySelector('.comment-content p');
        const currentContent = contentElement.textContent;

        // Create edit form
        const editForm = document.createElement('div');
        editForm.className = 'edit-comment-form';
        editForm.innerHTML = `
            <textarea class="edit-comment-input" maxlength="500">${currentContent}</textarea>
            <div class="edit-form-actions">
                <span class="char-count">${currentContent.length}/500</span>
                <button class="save-edit-btn" data-comment-id="${commentId}">Save</button>
                <button class="cancel-edit-btn">Cancel</button>
            </div>
        `;

        // Replace content with edit form
        contentElement.style.display = 'none';
        commentElement.insertBefore(editForm, contentElement);

        // Set up event listeners
        const textarea = editForm.querySelector('.edit-comment-input');
        const charCount = editForm.querySelector('.char-count');
        const saveBtn = editForm.querySelector('.save-edit-btn');
        const cancelBtn = editForm.querySelector('.cancel-edit-btn');

        // Character count
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = `${count}/500`;
            charCount.classList.toggle('limit-reached', count >= 500);
        });

        // Save button
        saveBtn.addEventListener('click', () => {
            this.updateComment(commentId, textarea.value.trim());
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            contentElement.style.display = 'block';
            commentElement.removeChild(editForm);
        });

        // Focus and select all text
        textarea.focus();
        textarea.select();
    }

    async updateComment(commentId, newContent) {
        if (!newContent.trim()) {
            UIUtils.showToast('Comment cannot be empty', 'error');
            return;
        }

        try {
            UIUtils.showLoadingSpinner();

            const response = await ApiService.put(`/comments/${commentId}`, {
                content: newContent
            });

            if (response.success) {
                // Update the comment content
                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                const contentElement = commentElement.querySelector('.comment-content p');
                const editForm = commentElement.querySelector('.edit-comment-form');

                contentElement.textContent = newContent;
                contentElement.style.display = 'block';
                commentElement.removeChild(editForm);

                UIUtils.showToast('Comment updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            UIUtils.showToast('Failed to update comment', 'error');
        } finally {
            UIUtils.hideLoadingSpinner();
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            UIUtils.showLoadingSpinner();

            const response = await ApiService.delete(`/comments/${commentId}`);

            if (response.success) {
                // Remove comment element
                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                if (commentElement) {
                    commentElement.remove();
                }

                UIUtils.showToast('Comment deleted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            UIUtils.showToast('Failed to delete comment', 'error');
        } finally {
            UIUtils.hideLoadingSpinner();
        }
    }

    showReplyForm(commentId) {
        if (!AuthService.isAuthenticated()) {
            UIUtils.showModal('login-modal');
            return;
        }

        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentElement) return;

        const repliesContainer = commentElement.querySelector('.comment-replies');
        
        // Check if reply form already exists
        if (repliesContainer.querySelector('.reply-form-container')) {
            return;
        }

        const formContainer = document.createElement('div');
        formContainer.className = 'reply-form-container';
        formContainer.innerHTML = `
            <form class="reply-form" id="reply-form-${commentId}">
                <textarea 
                    class="reply-input" 
                    placeholder="Write a reply..." 
                    required
                    maxlength="300"
                ></textarea>
                <div class="reply-form-actions">
                    <span class="char-count">0/300</span>
                    <button type="submit" class="submit-reply-btn" data-comment-id="${commentId}">
                        Post Reply
                    </button>
                    <button type="button" class="cancel-reply-btn">Cancel</button>
                </div>
            </form>
        `;

        repliesContainer.appendChild(formContainer);

        // Set up form event listeners
        const form = formContainer.querySelector('.reply-form');
        const textarea = form.querySelector('.reply-input');
        const charCount = form.querySelector('.char-count');
        const cancelBtn = form.querySelector('.cancel-reply-btn');

        // Character count
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = `${count}/300`;
            charCount.classList.toggle('limit-reached', count >= 300);
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            repliesContainer.removeChild(formContainer);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReply(commentId, textarea.value.trim());
        });

        // Focus on textarea
        textarea.focus();
    }

    async submitReply(commentId, content) {
        if (!content.trim()) {
            UIUtils.showToast('Reply cannot be empty', 'error');
            return;
        }

        try {
            UIUtils.showLoadingSpinner();

            const response = await ApiService.post(`/comments/${commentId}/reply`, {
                content: content
            });

            if (response.success) {
                // Reload the specific comment to show the new reply
                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                const photoId = this.getPhotoIdFromComment(commentId);
                
                if (photoId) {
                    await this.loadComments(photoId, document.querySelector(`#comments-${photoId}`));
                }

                UIUtils.showToast('Reply posted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error posting reply:', error);
            UIUtils.showToast('Failed to post reply', 'error');
        } finally {
            UIUtils.hideLoadingSpinner();
        }
    }

    getPhotoIdFromComment(commentId) {
        // Find the photo container that contains this comment
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (commentElement) {
            const commentsContainer = commentElement.closest('[id^="comments-"]');
            if (commentsContainer) {
                return commentsContainer.id.replace('comments-', '');
            }
        }
        return null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get comment count for a photo
    async getCommentCount(photoId) {
        try {
            const response = await ApiService.get(`/comments/photo/${photoId}`);
            if (response.success) {
                return response.data.length || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error getting comment count:', error);
            return 0;
        }
    }

    // Update comment counts for multiple photos
    async updateMultipleCommentCounts(photoIds) {
        const promises = photoIds.map(async (photoId) => {
            try {
                const count = await this.getCommentCount(photoId);
                return { photoId, count };
            } catch (error) {
                console.error(`Error updating comment count for photo ${photoId}:`, error);
                return { photoId, count: 0 };
            }
        });

        const results = await Promise.all(promises);
        this.updateCommentCountsInUI(results);
    }

    updateCommentCountsInUI(commentData) {
        commentData.forEach(({ photoId, count }) => {
            const commentCountElement = document.querySelector(`[data-photo-id="${photoId}"] .comment-count`);
            if (commentCountElement) {
                commentCountElement.textContent = count;
            }
        });
    }

    // Reset comments when user logs out
    resetComments() {
        this.comments.clear();
        // Clear all comment forms
        document.querySelectorAll('.comment-form-container, .reply-form-container').forEach(form => {
            form.remove();
        });
    }

    // Export methods for external use
    static getInstance() {
        if (!CommentsService.instance) {
            CommentsService.instance = new CommentsService();
        }
        return CommentsService.instance;
    }
}

// Initialize comments service
const commentsService = CommentsService.getInstance();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommentsService;
}
