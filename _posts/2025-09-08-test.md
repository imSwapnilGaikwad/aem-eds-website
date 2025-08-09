---
layout: post
title: "AEM Edge Delivery: Advanced Block Development Patterns"
date: 2025-03-20 10:00:00 +0000
category: Development
tags: [AEM Edge, JavaScript, CSS, Blocks, Performance]
author: AEM Edge Expert
excerpt: "Learn advanced patterns for developing high-performance blocks in AEM Edge Delivery Services with practical examples and best practices."
featured: false
reading_time: 12
---

## Introduction

In this comprehensive guide, we'll explore advanced block development patterns for AEM Edge Delivery Services. These techniques will help you build more performant, maintainable, and scalable components.

## Basic Block Structure

Every AEM Edge block follows a simple pattern. Here's the fundamental structure:

```javascript
export default function decorate(block) {
  const rows = [...block.children];
  
  rows.forEach((row, index) => {
    const cells = [...row.children];
    row.className = `row row-${index}`;
    
    cells.forEach((cell, cellIndex) => {
      cell.className = `cell cell-${cellIndex}`;
    });
  });
}
```

## Advanced Block with Configuration

Here's a more sophisticated example that handles configuration and multiple content types:

```javascript
import { loadCSS, createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // Load block-specific CSS
  await loadCSS(`${window.hlx.codeBasePath}/blocks/hero/hero.css`);
  
  const config = readBlockConfig(block);
  const rows = [...block.children];
  
  // Create hero structure
  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';
  
  rows.forEach((row) => {
    const [contentCell, imageCell] = row.children;
    
    if (contentCell) {
      const content = processContent(contentCell);
      heroContent.appendChild(content);
    }
    
    if (imageCell) {
      const picture = createOptimizedPicture(
        imageCell.querySelector('img')?.src,
        imageCell.querySelector('img')?.alt || 'Hero image',
        false,
        [{ width: '750' }, { width: '2000' }]
      );
      
      const imageContainer = document.createElement('div');
      imageContainer.className = 'hero-image';
      imageContainer.appendChild(picture);
      block.appendChild(imageContainer);
    }
  });
  
  block.textContent = '';
  block.appendChild(heroContent);
  
  // Add intersection observer for animations
  observeBlock(block);
}

function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 2 && cols[0].textContent && cols[1].textContent) {
      const key = cols[0].textContent.trim().toLowerCase();
      const value = cols[1].textContent.trim();
      config[key] = value;
    }
  });
  return config;
}

function processContent(cell) {
  const wrapper = document.createElement('div');
  wrapper.className = 'content-wrapper';
  wrapper.innerHTML = cell.innerHTML;
  
  // Process CTAs
  const links = wrapper.querySelectorAll('a');
  links.forEach(link => {
    if (link.textContent.includes('CTA:')) {
      link.className = 'btn btn-primary';
      link.textContent = link.textContent.replace('CTA:', '').trim();
    }
  });
  
  return wrapper;
}

function observeBlock(block) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(block);
}
```

## CSS for Advanced Styling

Here's the corresponding CSS that creates a modern, performant hero block:

```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.hero.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-content h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  font-size: 1.25rem;
  line-height: 1.6;
  color: rgb(203, 213, 225);
  max-width: 50ch;
}

.hero-image {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.hero-image picture img {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-image:hover picture img {
  transform: scale(1.05);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: #f97316;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: fit-content;
}

.btn:hover {
  background: #ea580c;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
}

/* Responsive design */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
    min-height: auto;
    padding: 2rem 1rem;
  }
  
  .hero-image {
    order: -1;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .hero,
  .hero-image picture img,
  .btn {
    transition: none;
  }
  
  .hero.animate-in {
    transform: none;
  }
}
```

## YAML Configuration Example

For complex blocks, you can use YAML configuration in your Markdown:

```yaml
---
block_config:
  hero:
    animation: "fade-up"
    background: "gradient"
    layout: "split"
    cta_style: "primary"
---
```

## Terminal Commands

Here are some useful commands for AEM Edge development:

```bash
# Install AEM CLI
npm install -g @adobe/aem-cli

# Create new project
aem create myproject

# Start local development
npm run up

# Build for production
npm run build

# Deploy to staging
aem deploy --target=staging

# Performance audit
npm run test:lighthouse
```

## JSON Configuration

Example block configuration in JSON format:

```json
{
  "blocks": {
    "hero": {
      "styles": ["default", "centered", "full-width"],
      "variations": ["image-left", "image-right", "background"],
      "responsive": {
        "mobile": "stacked",
        "tablet": "side-by-side",
        "desktop": "split"
      }
    }
  },
  "performance": {
    "lazyLoad": true,
    "webp": true,
    "criticalCSS": true
  }
}
```

## Advanced TypeScript Integration

For larger projects, you might want to use TypeScript:

```typescript
interface BlockConfig {
  animation?: 'fade' | 'slide' | 'scale';
  layout?: 'default' | 'centered' | 'full-width';
  background?: string;
}

interface HeroBlock extends HTMLElement {
  dataset: {
    animation?: string;
    layout?: string;
  };
}

export default function decorate(block: HeroBlock): void {
  const config: BlockConfig = {
    animation: block.dataset.animation as BlockConfig['animation'] || 'fade',
    layout: block.dataset.layout as BlockConfig['layout'] || 'default'
  };
  
  // Implementation with type safety
  applyConfiguration(block, config);
}

function applyConfiguration(block: HeroBlock, config: BlockConfig): void {
  block.classList.add(`hero--${config.layout}`);
  block.classList.add(`hero--${config.animation}`);
  
  if (config.background) {
    block.style.background = config.background;
  }
}
```

## Performance Best Practices

Remember these key points for optimal performance:

1. **Lazy load non-critical resources**
2. **Use CSS containment for isolated blocks**
3. **Implement proper image optimization**
4. **Minimize JavaScript bundle size**
5. **Use Web Workers for heavy computations**

```css
/* CSS Containment for better performance */
.hero {
  contain: layout style paint;
}

/* Intersection observer optimizations */
.hero {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

This approach ensures your AEM Edge blocks are both performant and maintainable while providing an excellent developer experience.