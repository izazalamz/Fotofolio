// Categories Module
class CategoriesService {
    constructor() {
        this.categories = [];
        this.init();
    }

    // Initialize categories service
    init() {
        this.loadCategories();
    }

    // Load categories from API
    async loadCategories() {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.CATEGORIES);
            
            if (response.success) {
                this.categories = response.data;
                this.updateCategoriesGrid();
            } else {
                showToast('Error loading categories', 'error');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            showToast('Failed to load categories', 'error');
        }
    }

    // Update categories grid
    updateCategoriesGrid() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        grid.innerHTML = '';
        
        this.categories.forEach(category => {
            const categoryCard = this.createCategoryCard(category);
            grid.appendChild(categoryCard);
        });
    }

    // Create category card element
    createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.categoryId = category.id;

        // Get category icon based on name
        const icon = this.getCategoryIcon(category.name);

        card.innerHTML = `
            <div class="category-icon">
                <i class="${icon}"></i>
            </div>
            <h3>${category.name}</h3>
            <p>${this.getCategoryDescription(category.name)}</p>
            <div class="category-stats">${category.photos_count || 0} photos</div>
        `;

        // Add click event
        card.addEventListener('click', () => {
            this.handleCategoryClick(category);
        });

        return card;
    }

    // Get category icon based on name
    getCategoryIcon(categoryName) {
        const iconMap = {
            'Nature': 'fas fa-tree',
            'Portrait': 'fas fa-user',
            'Landscape': 'fas fa-mountain',
            'Street': 'fas fa-road',
            'Architecture': 'fas fa-building',
            'Wildlife': 'fas fa-paw',
            'Macro': 'fas fa-search',
            'Abstract': 'fas fa-palette',
            'Black & White': 'fas fa-adjust',
            'Travel': 'fas fa-plane'
        };

        return iconMap[categoryName] || 'fas fa-camera';
    }

    // Get category description
    getCategoryDescription(categoryName) {
        const descriptionMap = {
            'Nature': 'Beautiful landscapes and natural wonders',
            'Portrait': 'Capturing human emotions and expressions',
            'Landscape': 'Breathtaking views of the world',
            'Street': 'Urban life and city moments',
            'Architecture': 'Man-made structures and designs',
            'Wildlife': 'Animals in their natural habitat',
            'Macro': 'Close-up details and textures',
            'Abstract': 'Creative and artistic interpretations',
            'Black & White': 'Timeless monochrome photography',
            'Travel': 'Adventures and destinations around the world'
        };

        return descriptionMap[categoryName] || 'Explore amazing photography';
    }

    // Handle category click
    handleCategoryClick(category) {
        // Filter photos by category
        if (photosService) {
            photosService.filterByCategory(category.id);
        }

        // Scroll to photos section
        const photosSection = document.getElementById('explore');
        if (photosSection) {
            ui.scrollToElement(photosSection);
        }

        // Show toast
        showToast(`Showing photos in ${category.name}`, 'info');
    }

    // Get category by ID
    getCategoryById(id) {
        return this.categories.find(cat => cat.id === id);
    }

    // Get category name by ID
    getCategoryNameById(id) {
        const category = this.getCategoryById(id);
        return category ? category.name : 'Unknown';
    }

    // Get all categories
    getAllCategories() {
        return [...this.categories];
    }

    // Refresh categories
    refreshCategories() {
        this.loadCategories();
    }
}

// Create global categories service instance
const categoriesService = new CategoriesService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoriesService;
} else {
    // Browser environment
    window.CategoriesService = CategoriesService;
    window.categoriesService = categoriesService;
}
