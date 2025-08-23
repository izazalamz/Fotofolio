// Application Configuration
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:3000',
        ENDPOINTS: {
            // Authentication
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            PROFILE: '/api/auth/profile',
            CHANGE_PASSWORD: '/api/auth/change-password',
            
            // Users
            USERS: '/api/users',
            USER_PROFILE: '/api/users/:id',
            USER_FOLLOW: '/api/users/:id/follow',
            USER_FOLLOWERS: '/api/users/:id/followers',
            USER_FOLLOWING: '/api/users/:id/following',
            
            // Photos
            PHOTOS: '/api/photos',
            PHOTO_DETAIL: '/api/photos/:id',
            USER_PHOTOS: '/api/photos/user/:userId',
            
            // Albums
            ALBUMS: '/api/albums',
            ALBUM_DETAIL: '/api/albums/:id',
            USER_ALBUMS: '/api/albums/user/:userId',
            
            // Categories
            CATEGORIES: '/api/categories',
            CATEGORY_DETAIL: '/api/categories/:id',
            CATEGORY_PHOTOS: '/api/categories/:id/photos',
            
            // Comments
            PHOTO_COMMENTS: '/api/comments/photo/:photoId',
            USER_COMMENTS: '/api/comments/user/:userId',
            
            // Likes
            PHOTO_LIKES: '/api/likes/photo/:photoId',
            LIKE_PHOTO: '/api/likes/photo/:photoId',
            UNLIKE_PHOTO: '/api/likes/photo/:photoId',
            CHECK_LIKE: '/api/likes/photo/:photoId/check',
            USER_LIKES: '/api/likes/user/:userId',
            LIKE_COUNT: '/api/likes/photo/:photoId/count',
            
            // Health
            HEALTH: '/health'
        },
        
        // Request configuration
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },
    
    // Application settings
    APP: {
        NAME: 'Fotofolio',
        VERSION: '1.0.0',
        DESCRIPTION: 'Photography Portfolio Platform',
        
        // Pagination
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100,
        
        // Search
        SEARCH_DELAY: 500,
        MIN_SEARCH_LENGTH: 2,
        
        // Cache
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
        
        // UI
        TOAST_DURATION: 5000,
        LOADING_DELAY: 300,
        
        // File upload
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    
    // Local storage keys
    STORAGE: {
        AUTH_TOKEN: 'fotofolio_auth_token',
        USER_DATA: 'fotofolio_user_data',
        THEME: 'fotofolio_theme',
        LANGUAGE: 'fotofolio_language',
        SEARCH_HISTORY: 'fotofolio_search_history',
        VIEW_PREFERENCES: 'fotofolio_view_preferences'
    },
    
    // Theme configuration
    THEMES: {
        LIGHT: {
            name: 'light',
            label: 'Light Mode',
            icon: 'fas fa-sun'
        },
        DARK: {
            name: 'dark',
            label: 'Dark Mode',
            icon: 'fas fa-moon'
        },
        AUTO: {
            name: 'auto',
            label: 'Auto',
            icon: 'fas fa-adjust'
        }
    },
    
    // Error messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection.',
        UNAUTHORIZED: 'Please log in to continue.',
        FORBIDDEN: 'You don\'t have permission to perform this action.',
        NOT_FOUND: 'The requested resource was not found.',
        SERVER_ERROR: 'Server error. Please try again later.',
        VALIDATION: 'Please check your input and try again.',
        TIMEOUT: 'Request timed out. Please try again.',
        UNKNOWN: 'An unexpected error occurred.'
    },
    
    // Success messages
    SUCCESS: {
        LOGIN: 'Successfully logged in!',
        REGISTER: 'Account created successfully!',
        LOGOUT: 'Successfully logged out!',
        PROFILE_UPDATE: 'Profile updated successfully!',
        PASSWORD_CHANGE: 'Password changed successfully!',
        PHOTO_UPLOAD: 'Photo uploaded successfully!',
        PHOTO_UPDATE: 'Photo updated successfully!',
        PHOTO_DELETE: 'Photo deleted successfully!',
        COMMENT_ADD: 'Comment added successfully!',
        COMMENT_UPDATE: 'Comment updated successfully!',
        COMMENT_DELETE: 'Comment deleted successfully!',
        LIKE_ADD: 'Photo liked successfully!',
        LIKE_REMOVE: 'Like removed successfully!',
        FOLLOW: 'Successfully followed user!',
        UNFOLLOW: 'Successfully unfollowed user!'
    },
    
    // Loading states
    LOADING: {
        INITIAL: 'Loading...',
        PHOTOS: 'Loading photos...',
        USERS: 'Loading users...',
        CATEGORIES: 'Loading categories...',
        COMMENTS: 'Loading comments...',
        UPLOAD: 'Uploading...',
        SEARCH: 'Searching...',
        SAVING: 'Saving...',
        DELETING: 'Deleting...'
    },
    
    // Validation rules
    VALIDATION: {
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 50,
            PATTERN: /^[a-zA-Z0-9_]+$/
        },
        PASSWORD: {
            MIN_LENGTH: 6,
            MAX_LENGTH: 128
        },
        EMAIL: {
            PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        PHOTO_TITLE: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 200
        },
        PHOTO_DESCRIPTION: {
            MAX_LENGTH: 1000
        },
        COMMENT: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 500
        }
    },
    
    // Animation durations
    ANIMATIONS: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500,
        VERY_SLOW: 800
    },
    
    // Breakpoints for responsive design
    BREAKPOINTS: {
        XS: 576,
        SM: 768,
        MD: 992,
        LG: 1200,
        XL: 1400
    }
};

// Utility function to build API URLs
function buildApiUrl(endpoint, params = {}) {
    let url = CONFIG.API.BASE_URL + endpoint;
    
    // Replace URL parameters
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
}

// Utility function to get current breakpoint
function getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width < CONFIG.BREAKPOINTS.XS) return 'xs';
    if (width < CONFIG.BREAKPOINTS.SM) return 'sm';
    if (width < CONFIG.BREAKPOINTS.MD) return 'md';
    if (width < CONFIG.BREAKPOINTS.LG) return 'lg';
    if (width < CONFIG.BREAKPOINTS.XL) return 'xl';
    return 'xxl';
}

// Utility function to check if device is mobile
function isMobile() {
    return getCurrentBreakpoint() === 'xs' || getCurrentBreakpoint() === 'sm';
}

// Utility function to check if device is tablet
function isTablet() {
    return getCurrentBreakpoint() === 'md';
}

// Utility function to check if device is desktop
function isDesktop() {
    return getCurrentBreakpoint() === 'lg' || getCurrentBreakpoint() === 'xl' || getCurrentBreakpoint() === 'xxl';
}

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    // Browser environment
    window.CONFIG = CONFIG;
    window.buildApiUrl = buildApiUrl;
    window.getCurrentBreakpoint = getCurrentBreakpoint;
    window.isMobile = isMobile;
    window.isTablet = isTablet;
    window.isDesktop = isDesktop;
}
