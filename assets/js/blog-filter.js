// Blog Filtering and Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const blogCards = document.querySelectorAll('.blog-card');
    const noResults = document.getElementById('no-results');
    
    let currentFilter = 'all';
    let currentSearch = '';
    
    // Initialize filters
    initializeFilters();
    
    function initializeFilters() {
        // Add event listeners to filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Update current filter
                currentFilter = category;
                
                // Apply filters
                applyFilters();
                
                // Add ripple effect
                createRipple(this);
            });
        });
        
        // Add search functionality
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentSearch = this.value.toLowerCase().trim();
                applyFilters();
            });
            
            // Add search on Enter key
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    applyFilters();
                }
            });
        }
    }
    
    function applyFilters() {
        let visibleCount = 0;
        
        blogCards.forEach((card, index) => {
            const category = card.getAttribute('data-category') || '';
            const title = card.getAttribute('data-title') || card.querySelector('.blog-title')?.textContent.toLowerCase() || '';
            const content = card.getAttribute('data-content') || card.querySelector('.blog-excerpt')?.textContent.toLowerCase() || '';
            
            // Check category filter
            const categoryMatch = currentFilter === 'all' || category === currentFilter;
            
            // Check search filter
            const searchMatch = currentSearch === '' || 
                               title.includes(currentSearch) || 
                               content.includes(currentSearch);
            
            const shouldShow = categoryMatch && searchMatch;
            
            if (shouldShow) {
                showCard(card, index * 0.1);
                visibleCount++;
            } else {
                hideCard(card);
            }
        });
        
        // Show/hide no results message
        if (noResults) {
            if (visibleCount === 0) {
                noResults.style.display = 'block';
                updateNoResultsMessage();
            } else {
                noResults.style.display = 'none';
            }
        }
        
        // Update URL without refreshing page
        updateURL();
    }
    
    function showCard(card, delay = 0) {
        card.style.display = 'block';
        card.style.animationDelay = `${delay}s`;
        card.classList.remove('fade-out');
        card.classList.add('animate-fadeInUp');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            card.classList.remove('animate-fadeInUp');
            card.style.animationDelay = '';
        }, 600 + (delay * 1000));
    }
    
    function hideCard(card) {
        card.classList.add('fade-out');
        setTimeout(() => {
            card.style.display = 'none';
        }, 300);
    }
    
    function updateNoResultsMessage() {
        const noResultsContent = document.querySelector('.no-results-content');
        if (noResultsContent) {
            let message = '';
            
            if (currentSearch && currentFilter !== 'all') {
                message = `No articles found for "${currentSearch}" in ${getCurrentFilterName()}`;
            } else if (currentSearch) {
                message = `No articles found for "${currentSearch}"`;
            } else if (currentFilter !== 'all') {
                message = `No articles found in ${getCurrentFilterName()}`;
            } else {
                message = 'No articles found';
            }
            
            const messageElement = noResultsContent.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }
    
    function getCurrentFilterName() {
        const activeButton = document.querySelector('.filter-btn.active');
        return activeButton ? activeButton.textContent : 'this category';
    }
    
    function updateURL() {
        const params = new URLSearchParams();
        
        if (currentFilter !== 'all') {
            params.set('category', currentFilter);
        }
        
        if (currentSearch) {
            params.set('search', currentSearch);
        }
        
        const newURL = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        
        window.history.replaceState({}, '', newURL);
    }
    
    function createRipple(button) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(255, 255, 255, 0.3);
            width: ${size}px;
            height: ${size}px;
            left: ${rect.width / 2 - size / 2}px;
            top: ${rect.height / 2 - size / 2}px;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Initialize from URL parameters
    function initializeFromURL() {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get('category');
        const searchParam = params.get('search');
        
        if (categoryParam) {
            const categoryButton = document.querySelector(`[data-category="${categoryParam}"]`);
            if (categoryButton) {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                categoryButton.classList.add('active');
                currentFilter = categoryParam;
            }
        }
        
        if (searchParam && searchInput) {
            searchInput.value = searchParam;
            currentSearch = searchParam;
        }
        
        // Apply initial filters
        applyFilters();
    }
    
    // Clear filters function
    window.clearFilters = function() {
        // Reset filter buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const allButton = document.querySelector('[data-category="all"]');
        if (allButton) {
            allButton.classList.add('active');
        }
        
        // Clear search
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset state
        currentFilter = 'all';
        currentSearch = '';
        
        // Apply filters
        applyFilters();
    };
    
    // Advanced search functionality
    function setupAdvancedSearch() {
        const searchBox = document.querySelector('.search-box');
        if (!searchBox) return;
        
        // Add search suggestions
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        suggestions.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-top: none;
            border-radius: 0 0 0.5rem 0.5rem;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            backdrop-filter: blur(10px);
        `;
        
        searchBox.appendChild(suggestions);
        
        // Popular search terms
        const popularSearches = [
            'performance optimization',
            'edge delivery',
            'mobile development',
            'core web vitals',
            'javascript',
            'css techniques',
            'responsive design'
        ];
        
        searchInput.addEventListener('focus', () => {
            if (currentSearch === '') {
                showSuggestions(popularSearches, 'Popular searches:');
            }
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestions.style.display = 'none';
            }, 200);
        });
        
        function showSuggestions(items, title) {
            suggestions.innerHTML = `
                <div style="padding: 0.75rem; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                    <div style="font-size: 0.75rem; color: rgb(148, 163, 184); text-transform: uppercase; font-weight: 600;">
                        ${title}
                    </div>
                </div>
            `;
            
            items.forEach(item => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.textContent = item;
                suggestionItem.style.cssText = `
                    padding: 0.75rem;
                    cursor: pointer;
                    color: rgb(203, 213, 225);
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.05);
                `;
                
                suggestionItem.addEventListener('mouseenter', () => {
                    suggestionItem.style.background = 'rgba(249, 115, 22, 0.1)';
                    suggestionItem.style.color = '#f97316';
                });
                
                suggestionItem.addEventListener('mouseleave', () => {
                    suggestionItem.style.background = 'transparent';
                    suggestionItem.style.color = 'rgb(203, 213, 225)';
                });
                
                suggestionItem.addEventListener('click', () => {
                    searchInput.value = item;
                    currentSearch = item.toLowerCase();
                    suggestions.style.display = 'none';
                    applyFilters();
                });
                
                suggestions.appendChild(suggestionItem);
            });
            
            suggestions.style.display = 'block';
        }
    }
    
    // Add keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.blur();
                if (currentSearch) {
                    clearFilters();
                }
            }
            
            // Number keys for category filters
            if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && document.activeElement !== searchInput) {
                const index = parseInt(e.key) - 1;
                const button = filterButtons[index];
                if (button) {
                    button.click();
                }
            }
        });
    }
    
    // Add fade out animation styles
    const style = document.createElement('style');
    style.textContent = `
        .fade-out {
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .search-suggestions::-webkit-scrollbar {
            width: 6px;
        }
        
        .search-suggestions::-webkit-scrollbar-track {
            background: rgba(148, 163, 184, 0.1);
        }
        
        .search-suggestions::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.3);
            border-radius: 3px;
        }
        
        .search-suggestions::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.5);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize all features
    initializeFromURL();
    setupAdvancedSearch();
    setupKeyboardShortcuts();
    
    // Add search shortcut hint
    if (searchInput) {
        searchInput.setAttribute('placeholder', searchInput.getAttribute('placeholder') + ' (Ctrl+K)');
    }
});