// API Service Module
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.API.TIMEOUT;
        this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS;
        this.retryDelay = CONFIG.API.RETRY_DELAY;
        this.cache = new Map();
        this.cacheDuration = CONFIG.APP.CACHE_DURATION;
    }

    // Get authentication token from localStorage
    getAuthToken() {
        return localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN);
    }

    // Set authentication token in localStorage
    setAuthToken(token) {
        if (token) {
            localStorage.setItem(CONFIG.STORAGE.AUTH_TOKEN, token);
        } else {
            localStorage.removeItem(CONFIG.STORAGE.AUTH_TOKEN);
        }
    }

    // Get default headers for requests
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Build full URL
    buildUrl(endpoint, params = {}) {
        let url = this.baseUrl + endpoint;
        
        // Replace URL parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        
        return url;
    }

    // Add query parameters to URL
    addQueryParams(url, params = {}) {
        if (Object.keys(params).length === 0) return url;
        
        const queryString = Object.keys(params)
            .filter(key => params[key] !== null && params[key] !== undefined)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        return `${url}?${queryString}`;
    }

    // Check if response is successful
    isSuccessfulResponse(status) {
        return status >= 200 && status < 300;
    }

    // Handle API errors
    handleError(error, status) {
        let message = CONFIG.ERRORS.UNKNOWN;
        
        if (error.message) {
            message = error.message;
        } else if (status === 401) {
            message = CONFIG.ERRORS.UNAUTHORIZED;
            this.setAuthToken(null);
            // Trigger logout event
            window.dispatchEvent(new CustomEvent('auth:logout'));
        } else if (status === 403) {
            message = CONFIG.ERRORS.FORBIDDEN;
        } else if (status === 404) {
            message = CONFIG.ERRORS.NOT_FOUND;
        } else if (status === 500) {
            message = CONFIG.ERRORS.SERVER_ERROR;
        } else if (status === 0) {
            message = CONFIG.ERRORS.NETWORK;
        }

        return {
            success: false,
            error: message,
            status: status
        };
    }

    // Retry request with exponential backoff
    async retryRequest(requestFn, attempt = 1) {
        try {
            return await requestFn();
        } catch (error) {
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
                return this.retryRequest(requestFn, attempt + 1);
            }
            throw error;
        }
    }

    // Check if error should trigger a retry
    shouldRetry(error) {
        // Retry on network errors, 5xx server errors, and timeouts
        return error.status === 0 || 
               (error.status >= 500 && error.status < 600) ||
               error.name === 'TimeoutError';
    }

    // Delay function for retries
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Create timeout promise
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timeout'));
            }, ms);
        });
    }

    // Make HTTP request with timeout and retry logic
    async makeRequest(method, url, options = {}) {
        const requestFn = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            try {
                const response = await fetch(url, {
                    method,
                    headers: options.headers || this.getHeaders(options.includeAuth !== false),
                    body: options.body,
                    signal: controller.signal,
                    ...options
                });

                clearTimeout(timeoutId);

                if (this.isSuccessfulResponse(response.status)) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        return { success: true, data, status: response.status };
                    } else {
                        const text = await response.text();
                        return { success: true, data: text, status: response.status };
                    }
                } else {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = { message: `HTTP ${response.status}` };
                    }
                    
                    throw {
                        message: errorData.error || errorData.message || `HTTP ${response.status}`,
                        status: response.status,
                        data: errorData
                    };
                }
            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    throw { message: CONFIG.ERRORS.TIMEOUT, status: 0 };
                }
                
                throw error;
            }
        };

        return this.retryRequest(requestFn);
    }

    // GET request
    async get(endpoint, params = {}, options = {}) {
        const url = this.addQueryParams(this.buildUrl(endpoint, params), options.query);
        
        // Check cache for GET requests
        if (options.useCache !== false) {
            const cacheKey = `${method}:${url}`;
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
                return cached.data;
            }
        }

        const result = await this.makeRequest('GET', url, options);
        
        // Cache successful GET responses
        if (result.success && options.useCache !== false) {
            const cacheKey = `GET:${url}`;
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
        }
        
        return result;
    }

    // POST request
    async post(endpoint, data = {}, params = {}, options = {}) {
        const url = this.buildUrl(endpoint, params);
        const body = JSON.stringify(data);
        
        return this.makeRequest('POST', url, { body, ...options });
    }

    // PUT request
    async put(endpoint, data = {}, params = {}, options = {}) {
        const url = this.buildUrl(endpoint, params);
        const body = JSON.stringify(data);
        
        return this.makeRequest('PUT', url, { body, ...options });
    }

    // DELETE request
    async delete(endpoint, params = {}, options = {}) {
        const url = this.buildUrl(endpoint, params);
        
        return this.makeRequest('DELETE', url, options);
    }

    // PATCH request
    async patch(endpoint, data = {}, params = {}, options = {}) {
        const url = this.buildUrl(endpoint, params);
        const body = JSON.stringify(data);
        
        return this.makeRequest('PATCH', url, { body, ...options });
    }

    // Upload file
    async uploadFile(endpoint, file, params = {}, options = {}) {
        const url = this.buildUrl(endpoint, params);
        
        const formData = new FormData();
        formData.append('photo', file);
        
        // Add additional data
        if (options.data) {
            Object.keys(options.data).forEach(key => {
                formData.append(key, options.data[key]);
            });
        }
        
        const headers = this.getHeaders(options.includeAuth !== false);
        delete headers['Content-Type']; // Let browser set content-type for FormData
        
        return this.makeRequest('POST', url, {
            body: formData,
            headers,
            ...options
        });
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Clear expired cache entries
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheDuration) {
                this.cache.delete(key);
            }
        }
    }

    // Health check
    async healthCheck() {
        try {
            const result = await this.get(CONFIG.API.ENDPOINTS.HEALTH, {}, { useCache: false });
            return result.success;
        } catch (error) {
            return false;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getAuthToken();
    }

    // Logout (clear token and cache)
    logout() {
        this.setAuthToken(null);
        this.clearCache();
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }
}

// Create global API service instance
const api = new ApiService();

// Clear expired cache entries periodically
setInterval(() => {
    api.clearExpiredCache();
}, 60000); // Every minute

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
} else {
    // Browser environment
    window.ApiService = ApiService;
    window.api = api;
}
