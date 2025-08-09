// Code Copy Functionality for Blog Posts
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize code copy functionality
    initializeCodeCopy();
    
    function initializeCodeCopy() {
        // Find all code blocks
        const codeBlocks = document.querySelectorAll('pre code, .highlight pre');
        
        codeBlocks.forEach((codeBlock, index) => {
            const pre = codeBlock.tagName === 'PRE' ? codeBlock : codeBlock.parentElement;
            
            // Skip if already processed
            if (pre.querySelector('.code-copy-btn')) return;
            
            // Create copy button
            const copyButton = createCopyButton(codeBlock, index);
            
            // Add copy button to the pre element
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
            
            // Detect language and add data attribute
            detectAndSetLanguage(pre, codeBlock);
        });
    }
    
    function createCopyButton(codeBlock, index) {
        const button = document.createElement('button');
        button.className = 'code-copy-btn';
        button.innerHTML = '<i class="far fa-copy"></i> Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        button.setAttribute('data-code-index', index);
        
        // Add click event
        button.addEventListener('click', () => copyCodeToClipboard(codeBlock, button));
        
        return button;
    }
    
    async function copyCodeToClipboard(codeBlock, button) {
        try {
            // Get the code text
            const codeText = getCodeText(codeBlock);
            
            // Copy to clipboard
            await navigator.clipboard.writeText(codeText);
            
            // Show success feedback
            showCopySuccess(button);
            
            // Analytics (optional)
            trackCopyEvent(codeBlock);
            
        } catch (err) {
            console.error('Failed to copy code: ', err);
            
            // Fallback for older browsers
            fallbackCopyTextToClipboard(getCodeText(codeBlock), button);
        }
    }
    
    function getCodeText(codeBlock) {
        // Create a clone to avoid modifying the original
        const clone = codeBlock.cloneNode(true);
        
        // Remove copy button if it exists in the clone
        const copyBtn = clone.querySelector('.code-copy-btn');
        if (copyBtn) copyBtn.remove();
        
        // Remove line number elements if they exist
        const lineNumbers = clone.querySelectorAll('.line-number');
        lineNumbers.forEach(ln => ln.remove());
        
        // Get text content and clean it up
        let text = clone.textContent || clone.innerText;
        
        // Remove extra whitespace and normalize line endings
        text = text.replace(/^\s+|\s+$/g, ''); // Trim
        text = text.replace(/\r\n/g, '\n'); // Normalize line endings
        
        return text;
    }
    
    function showCopySuccess(button) {
        const originalContent = button.innerHTML;
        
        // Change button appearance
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    }
    
    function fallbackCopyTextToClipboard(text, button) {
        // Create temporary textarea
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        try {
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            
            if (successful) {
                showCopySuccess(button);
            } else {
                throw new Error('Copy command failed');
            }
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            button.innerHTML = '<i class="fas fa-times"></i> Failed';
            setTimeout(() => {
                button.innerHTML = '<i class="far fa-copy"></i> Copy';
            }, 2000);
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    function detectAndSetLanguage(pre, codeBlock) {
        // Check for existing language class
        const classes = (pre.className + ' ' + codeBlock.className).split(' ');
        let language = '';
        
        for (const className of classes) {
            if (className.startsWith('language-')) {
                language = className.replace('language-', '');
                break;
            } else if (className.startsWith('highlight-')) {
                language = className.replace('highlight-', '');
                break;
            }
        }
        
        // If no language detected, try to guess from content
        if (!language) {
            language = guessLanguage(getCodeText(codeBlock));
        }
        
        // Set data attribute for styling
        if (language) {
            pre.setAttribute('data-language', language);
            pre.classList.add(`language-${language}`);
        }
    }
    
    function guessLanguage(code) {
        // Simple language detection based on common patterns
        const patterns = {
            javascript: [/function\s*\(/g, /const\s+/g, /let\s+/g, /=>/g, /console\.log/g],
            css: [/\{[^}]*\}/g, /#[a-fA-F0-9]{3,6}/g, /:\s*[^;]+;/g],
            html: [/<[^>]+>/g, /<!DOCTYPE/gi, /<\/[^>]+>/g],
            json: [/\{[\s\S]*\}/g, /"\w+":/g],
            bash: [/^[\$#]\s/gm, /sudo\s/g, /apt\s/g, /npm\s/g],
            python: [/def\s+\w+/g, /import\s+/g, /from\s+\w+\s+import/g],
            yaml: [/^[\w-]+:/gm, /^\s*-\s/gm]
        };
        
        let maxMatches = 0;
        let detectedLanguage = '';
        
        for (const [lang, regexes] of Object.entries(patterns)) {
            let matches = 0;
            regexes.forEach(regex => {
                const match = code.match(regex);
                if (match) matches += match.length;
            });
            
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedLanguage = lang;
            }
        }
        
        return detectedLanguage;
    }
    
    function trackCopyEvent(codeBlock) {
        // Optional: Track copy events for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'code_copy', {
                event_category: 'engagement',
                event_label: 'code_snippet',
                value: 1
            });
        }
        
        // Console log for debugging
        console.log('Code copied:', {
            language: codeBlock.parentElement.getAttribute('data-language'),
            length: getCodeText(codeBlock).length
        });
    }
    
    // Add keyboard shortcut for copying focused code block
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Shift + C to copy code
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            const focusedCodeBlock = document.querySelector('pre:hover code, .highlight:hover pre');
            if (focusedCodeBlock) {
                e.preventDefault();
                const copyButton = focusedCodeBlock.parentElement.querySelector('.code-copy-btn');
                if (copyButton) {
                    copyButton.click();
                }
            }
        }
    });
    
    // Add hover effect for better UX
    const style = document.createElement('style');
    style.textContent = `
        pre:hover .code-copy-btn {
            opacity: 1;
            transform: translateY(0);
        }
        
        .code-copy-btn {
            opacity: 0.7;
            transform: translateY(-2px);
            transition: all 0.2s ease;
        }
        
        /* Tooltip for copy button */
        .code-copy-btn::before {
            content: 'Copy code (Ctrl+Shift+C)';
            position: absolute;
            bottom: 100%;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transform: translateY(5px);
            transition: all 0.2s ease;
            z-index: 1000;
        }
        
        .code-copy-btn:hover::before {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Hide tooltip on mobile */
        @media (max-width: 768px) {
            .code-copy-btn::before {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
});