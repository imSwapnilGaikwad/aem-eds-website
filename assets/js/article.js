// Dynamic Table of Contents and Related Articles for Blog Posts

console.log("Article JS");
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize article enhancements
    initializeTableOfContents();
    initializeRelatedArticles();
    initializeArticleProgress();
    
    function initializeTableOfContents() {
        const tocContainer = document.getElementById('toc');
        const articleBody = document.querySelector('.article-body');
        
        if (!tocContainer || !articleBody) return;
        
        // Find all headings in the article
        const headings = articleBody.querySelectorAll('h2, h3, h4, h5, h6');
        
        if (headings.length === 0) {
            // Hide TOC widget if no headings
            const tocWidget = tocContainer.closest('.sidebar-widget');
            if (tocWidget) tocWidget.style.display = 'none';
            return;
        }
        
        // Generate table of contents
        const tocList = generateTOC(headings);
        tocContainer.innerHTML = '';
        tocContainer.appendChild(tocList);
        
        // Add smooth scrolling and active states
        setupTOCInteractions(headings);
        
        // Add intersection observer for active states
        observeHeadings(headings);
    }
    
    function generateTOC(headings) {
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        
        let currentLevel = 2; // Start with h2
        let currentList = tocList;
        const listStack = [tocList];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const id = generateHeadingId(heading, index);
            const text = heading.textContent.trim();
            
            // Add ID to heading for linking
            heading.id = id;
            
            // Create list item
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = text;
            link.className = 'toc-link';
            link.setAttribute('data-heading-id', id);
            
            // Handle nesting based on heading level
            if (level > currentLevel) {
                // Create nested list
                const nestedList = document.createElement('ul');
                nestedList.className = 'toc-nested';
                const lastItem = currentList.lastElementChild;
                if (lastItem) {
                    lastItem.appendChild(nestedList);
                }
                currentList = nestedList;
                listStack.push(nestedList);
            } else if (level < currentLevel) {
                // Go back to appropriate level
                const levelDiff = currentLevel - level;
                for (let i = 0; i < levelDiff; i++) {
                    listStack.pop();
                }
                currentList = listStack[listStack.length - 1] || tocList;
            }
            
            currentLevel = level;
            listItem.appendChild(link);
            currentList.appendChild(listItem);
        });
        
        return tocList;
    }
    
    function generateHeadingId(heading, index) {
        // Create URL-friendly ID from heading text
        let id = heading.textContent
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
        
        // Ensure ID is unique
        if (document.getElementById(id)) {
            id += `-${index}`;
        }
        
        return id || `heading-${index}`;
    }
    
    function setupTOCInteractions(headings) {
        const tocLinks = document.querySelectorAll('.toc-link');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbar = document.querySelector('.navbar');
                    const offset = navbar ? navbar.offsetHeight + 20 : 20;
                    
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active state
                    updateActiveTOCLink(this);
                }
            });
        });
    }
    
    function observeHeadings(headings) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocLink = document.querySelector(`[data-heading-id="${id}"]`);
                
                if (entry.isIntersecting) {
                    updateActiveTOCLink(tocLink);
                }
            });
        }, observerOptions);
        
        headings.forEach(heading => observer.observe(heading));
    }
    
    function updateActiveTOCLink(activeLink) {
        // Remove active class from all links
        document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    async function initializeRelatedArticles() {
        const relatedContainer = document.querySelector('.related-articles');
        if (!relatedContainer) return;
        
        // Get current article tags and category
        const currentTags = getCurrentArticleTags();
        const currentCategory = getCurrentArticleCategory();
        const currentTitle = getCurrentArticleTitle();
        
        if (!currentTags.length && !currentCategory) {
            hideRelatedArticlesWidget();
            return;
        }
        
        try {
            // Fetch related articles
            const relatedArticles = await fetchRelatedArticles(currentTags, currentCategory, currentTitle);
            
            if (relatedArticles.length === 0) {
                hideRelatedArticlesWidget();
                return;
            }
            
            // Render related articles
            renderRelatedArticles(relatedArticles, relatedContainer);
            
        } catch (error) {
            console.error('Failed to load related articles:', error);
            hideRelatedArticlesWidget();
        }
    }
    
    function getCurrentArticleTags() {
        const tagsContainer = document.querySelector('.tags-list');
        if (!tagsContainer) return [];
        
        return Array.from(tagsContainer.querySelectorAll('.tag'))
            .map(tag => tag.textContent.trim().toLowerCase());
    }
    
    function getCurrentArticleCategory() {
        const categoryElement = document.querySelector('.article-category');
        return categoryElement ? categoryElement.textContent.trim().toLowerCase() : '';
    }
    
    function getCurrentArticleTitle() {
        const titleElement = document.querySelector('.article-title');
        return titleElement ? titleElement.textContent.trim() : '';
    }
    
    async function fetchRelatedArticles(tags, category, currentTitle) {
        // In a real Jekyll site, you would have access to site.posts
        // For now, we'll simulate fetching from a JSON file or API
        
        try {
            // Option 1: Fetch from JSON file (you can generate this in Jekyll)
            const response = await fetch('/assets/data/articles.json');
            if (!response.ok) {
                // Option 2: Fallback to parsing existing DOM elements
                return getRelatedArticlesFromDOM(tags, category, currentTitle);
            }
            
            const articles = await response.json();
            return findRelatedArticles(articles, tags, category, currentTitle);
            
        } catch (error) {
            console.warn('Could not fetch articles.json, falling back to DOM parsing');
            return getRelatedArticlesFromDOM(tags, category, currentTitle);
        }
    }
    
    function getRelatedArticlesFromDOM(tags, category, currentTitle) {
        // Parse articles from blog listing page if available
        const blogCards = document.querySelectorAll('.blog-card');
        const articles = [];
        
        blogCards.forEach(card => {
            const title = card.querySelector('.blog-title')?.textContent?.trim();
            const link = card.querySelector('.blog-title a')?.href;
            const excerpt = card.querySelector('.blog-excerpt')?.textContent?.trim();
            const date = card.querySelector('.blog-date')?.textContent?.trim();
            const cardCategory = card.getAttribute('data-category') || 
                               card.querySelector('.blog-category')?.textContent?.trim().toLowerCase();
            
            if (title && title !== currentTitle && link) {
                articles.push({
                    title,
                    link,
                    excerpt,
                    date,
                    category: cardCategory,
                    tags: [] // DOM parsing might not have tag info
                });
            }
        });
        
        return findRelatedArticles(articles, tags, category, currentTitle);
    }
    
    function findRelatedArticles(articles, tags, category, currentTitle, maxResults = 3) {
        // Score articles based on relevance
        const scoredArticles = articles
            .filter(article => article.title !== currentTitle)
            .map(article => {
                let score = 0;
                
                // Category match (highest weight)
                if (article.category && category && article.category.toLowerCase() === category) {
                    score += 10;
                }
                
                // Tag matches
                if (article.tags && tags.length > 0) {
                    const articleTags = article.tags.map(tag => tag.toLowerCase());
                    const matchingTags = tags.filter(tag => articleTags.includes(tag));
                    score += matchingTags.length * 5;
                }
                
                // Title similarity (basic check)
                if (article.title && currentTitle) {
                    const titleWords = currentTitle.toLowerCase().split(' ');
                    const articleWords = article.title.toLowerCase().split(' ');
                    const commonWords = titleWords.filter(word => 
                        word.length > 3 && articleWords.includes(word)
                    );
                    score += commonWords.length * 2;
                }
                
                return { ...article, score };
            })
            .filter(article => article.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
        
        return scoredArticles;
    }
    
    function renderRelatedArticles(articles, container) {
        container.innerHTML = '';
        
        articles.forEach(article => {
            const articleElement = createRelatedArticleElement(article);
            container.appendChild(articleElement);
        });
    }
    
    function createRelatedArticleElement(article) {
        const articleEl = document.createElement('article');
        articleEl.className = 'related-article';
        
        // Determine icon based on category
        const icon = getCategoryIcon(article.category);
        
        articleEl.innerHTML = `
            <div class="related-image">
                <i class="${icon}"></i>
            </div>
            <div class="related-content">
                <h4><a href="${article.link}">${article.title}</a></h4>
                <span class="related-date">${formatDate(article.date)}</span>
                ${article.excerpt ? `<p class="related-excerpt">${truncateText(article.excerpt, 80)}</p>` : ''}
            </div>
        `;
        
        return articleEl;
    }
    
    function getCategoryIcon(category) {
        const iconMap = {
            'performance': 'fas fa-tachometer-alt',
            'development': 'fas fa-code-branch',
            'mobile': 'fas fa-mobile-alt',
            'tutorials': 'fas fa-graduation-cap',
            'css': 'fab fa-css3-alt',
            'javascript': 'fab fa-js-square',
            'html': 'fab fa-html5'
        };
        
        return iconMap[category?.toLowerCase()] || 'fas fa-file-alt';
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString; // Return original if parsing fails
        }
    }
    
    function truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    
    function hideRelatedArticlesWidget() {
        const widget = document.querySelector('.related-articles')?.closest('.sidebar-widget');
        if (widget) {
            widget.style.display = 'none';
        }
    }
    
    function initializeArticleProgress() {
        const article = document.querySelector('.article-body');
        if (!article) return;
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'article-progress';
        progressBar.innerHTML = '<div class="article-progress-bar"></div>';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .article-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(148, 163, 184, 0.2);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .article-progress.visible {
                opacity: 1;
            }
            
            .article-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #f97316, #ea580c);
                width: 0%;
                transition: width 0.1s ease;
            }
            
            .toc-link.active {
                color: #f97316;
                border-left-color: #f97316;
                background: rgba(249, 115, 22, 0.1);
                border-radius: 0 0.25rem 0.25rem 0;
            }
            
            .related-excerpt {
                font-size: 0.8rem;
                color: rgb(148, 163, 184);
                margin-top: 0.25rem;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(progressBar);
        
        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressBarFill = progressBar.querySelector('.article-progress-bar');
            progressBarFill.style.width = Math.min(scrollPercent, 100) + '%';
            
            // Show/hide progress bar
            if (scrollTop > 100) {
                progressBar.classList.add('visible');
            } else {
                progressBar.classList.remove('visible');
            }
        });
    }
    
    // Expose functions for external use
    window.articleEnhancements = {
        refreshRelatedArticles: initializeRelatedArticles,
        updateTOC: initializeTableOfContents
    };
});