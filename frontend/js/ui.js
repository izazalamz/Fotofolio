// UI Utilities Module
class UIUtils {
    constructor() {
        this.toastContainer = null;
        this.loadingSpinner = null;
        this.init();
    }

    // Initialize UI utilities
    init() {
        this.toastContainer = document.getElementById('toastContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.setupGlobalEventListeners();
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Handle escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle click outside modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    }

    // Show toast notification
    showToast(message, type = 'info', duration = CONFIG.APP.TOAST_DURATION) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${this.getToastTitle(type)}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        // Add close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Add to container
        this.toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        return toast;
    }

    // Remove toast notification
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // Get toast title based on type
    getToastTitle(type) {
        switch (type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'warning': return 'Warning';
            case 'info': default: return 'Info';
        }
    }

    // Show loading spinner
    showLoading(message = CONFIG.LOADING.INITIAL) {
        if (!this.loadingSpinner) return;

        const spinnerText = this.loadingSpinner.querySelector('.spinner-text');
        if (spinnerText) {
            spinnerText.textContent = message;
        }

        this.loadingSpinner.classList.add('show');
    }

    // Hide loading spinner
    hideLoading() {
        if (!this.loadingSpinner) return;
        this.loadingSpinner.classList.remove('show');
    }

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus first input if exists
            const firstInput = modal.querySelector('input, textarea, button');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    // Toggle modal
    toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (modal.classList.contains('show')) {
                this.hideModal(modalId);
            } else {
                this.showModal(modalId);
            }
        }
    }

    // Show confirmation dialog
    showConfirm(message, onConfirm, onCancel) {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal show';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirm Action</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="confirmCancel">Cancel</button>
                    <button class="btn btn-primary" id="confirmOk">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);

        // Setup event listeners
        const cancelBtn = confirmModal.querySelector('#confirmCancel');
        const okBtn = confirmModal.querySelector('#confirmOk');

        const cleanup = () => {
            document.body.removeChild(confirmModal);
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        okBtn.addEventListener('click', () => {
            cleanup();
            if (onConfirm) onConfirm();
        });

        // Close on outside click
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                cleanup();
                if (onCancel) onCancel();
            }
        });
    }

    // Show alert dialog
    showAlert(message, type = 'info', onClose) {
        const alertModal = document.createElement('div');
        alertModal.className = 'modal show';
        alertModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.getAlertTitle(type)}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="alertOk">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(alertModal);

        const okBtn = alertModal.querySelector('#alertOk');
        const cleanup = () => {
            document.body.removeChild(alertModal);
        };

        okBtn.addEventListener('click', () => {
            cleanup();
            if (onClose) onClose();
        });

        // Close on outside click
        alertModal.addEventListener('click', (e) => {
            if (e.target === alertModal) {
                cleanup();
                if (onClose) onClose();
            }
        });
    }

    // Create loading skeleton
    createSkeleton(type = 'card', count = 1) {
        const skeletons = [];
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${type}`;
            
            switch (type) {
                case 'card':
                    skeleton.innerHTML = `
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                        </div>
                    `;
                    break;
                case 'text':
                    skeleton.innerHTML = `
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                    `;
                    break;
                case 'avatar':
                    skeleton.innerHTML = '<div class="skeleton-circle"></div>';
                    break;
                default:
                    skeleton.innerHTML = '<div class="skeleton-rectangle"></div>';
            }
            
            skeletons.push(skeleton);
        }
        
        return skeletons;
    }

    // Animate element in
    animateIn(element, animation = 'fadeIn', duration = CONFIG.ANIMATIONS.NORMAL) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = `all ${duration}ms ease-out`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // Animate element out
    animateOut(element, animation = 'fadeOut', duration = CONFIG.ANIMATIONS.NORMAL) {
        return new Promise(resolve => {
            element.style.transition = `all ${duration}ms ease-in`;
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(resolve, duration);
        });
    }

    // Smooth scroll to element
    scrollToElement(element, offset = 80) {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Smooth scroll to top
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Format date
    formatDate(date, format = 'relative') {
        if (!date) return '';
        
        const dateObj = new Date(date);
        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);
        
        if (format === 'relative') {
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
            if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
            return `${Math.floor(diffInSeconds / 31536000)}y ago`;
        } else {
            return dateObj.toLocaleDateString();
        }
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    }

    // Download file
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Lazy load images
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Add CSS class to body
    addBodyClass(className) {
        document.body.classList.add(className);
    }

    // Remove CSS class from body
    removeBodyClass(className) {
        document.body.classList.remove(className);
    }

    // Toggle CSS class on body
    toggleBodyClass(className) {
        document.body.classList.toggle(className);
    }

    // Get computed style value
    getComputedStyleValue(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    // Set CSS custom property
    setCSSVariable(name, value) {
        document.documentElement.style.setProperty(`--${name}`, value);
    }

    // Get CSS custom property
    getCSSVariable(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
    }
}

// Create global UI utilities instance
const ui = new UIUtils();

// Global functions for easy access
function showToast(message, type = 'info', duration) {
    return ui.showToast(message, type, duration);
}

function showLoading(message) {
    return ui.showLoading(message);
}

function hideLoading() {
    return ui.hideLoading();
}

function showModal(modalId) {
    return ui.showModal(modalId);
}

function hideModal(modalId) {
    return ui.hideModal(modalId);
}

function showConfirm(message, onConfirm, onCancel) {
    return ui.showConfirm(message, onConfirm, onCancel);
}

function showAlert(message, type, onClose) {
    return ui.showAlert(message, type, onClose);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;
} else {
    // Browser environment
    window.UIUtils = UIUtils;
    window.ui = ui;
    window.showToast = showToast;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.showModal = showModal;
    window.hideModal = hideModal;
    window.showConfirm = showConfirm;
    window.showAlert = showAlert;
}
