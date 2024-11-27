import { voiceOptions } from './config.js';

// DOM Utilities
const dom = {
    get: (id) => document.getElementById(id),
    getValue: (id) => document.getElementById(id)?.value?.trim(),
    setContent: (element, content, isError = false) => {
        if (!element) return;
        if (isError) {
            element.textContent = content;
            element.className = 'output-area error';
            return;
        }
        element.innerHTML = formatOutput(content);
        element.className = 'output-area';
    },
    updateStatus: (message, type = 'default') => {
        const badge = document.getElementById('status-badge');
        if (badge) {
            badge.textContent = message;
            badge.className = `status-badge ${type}`;
        }
    },
    updateWordCount: (text = '') => {
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const wordCountElement = document.querySelector('.word-count');
        if (wordCountElement) {
            wordCountElement.textContent = `${wordCount} words`;
        }
    }
};

// Debounce utility
function debounce(func, wait) {
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

// Text Conversion
async function convertText() {
    const text = dom.getValue('originalText')?.trim();
    const voiceType = dom.getValue('style');
    const customInput = dom.get('custom-voice');
    const specific = customInput ? customInput.value : dom.getValue('style-specifics');
    const targetLanguage = dom.getValue('output-language');
    
    if (!text || !voiceType || !specific) {
        return;
    }

    try {
        dom.updateStatus('Converting...', 'processing');
        const outputElement = dom.get('styledText');
        
        const response = await fetch('/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                voice_type: voiceType,
                specific: specific,
                target_language: targetLanguage
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        dom.setContent(outputElement, data.converted_text);
        dom.updateStatus('Converted', 'done');
    } catch (error) {
        const outputElement = dom.get('styledText');
        dom.setContent(outputElement, `Error: ${error.message}`, true);
        dom.updateStatus('Error', 'error');
    }
}

// Event Setup
document.addEventListener('DOMContentLoaded', () => {
    const debouncedConvert = debounce(convertText, 500);
    
    // Setup event listeners for all relevant inputs
    const originalText = dom.get('originalText');
    if (originalText) {
        originalText.addEventListener('input', (e) => {
            dom.updateWordCount(e.target.value);
            debouncedConvert();
        });
    }
    
    // Initialize word count
    dom.updateWordCount('');
    
    const styleSelect = document.getElementById('style');
    const specificsSelect = document.getElementById('style-specifics');

    // Listen for style changes
    styleSelect.addEventListener('change', () => {
        const voiceType = styleSelect.value;
        
        // Remove any existing custom input field
        const existingCustomInput = dom.get('custom-voice');
        if (existingCustomInput) {
            existingCustomInput.remove();
        }
        
        if (voiceOptions[voiceType]) {
            const { label, options } = voiceOptions[voiceType];
            specificsSelect.innerHTML = `
                <option value="" disabled selected>Select ${label}...</option>
                ${options.map(option => 
                    `<option value="${option}">${option}</option>`
                ).join('')}
            `;
            specificsSelect.style.display = 'block';
            specificsSelect.classList.add('visible');
        }
    });

    // Add listener for specific voice selection changes
    specificsSelect.addEventListener('change', () => {
        const selectedValue = specificsSelect.value;
        
        // Remove any existing custom input field
        const existingCustomInput = dom.get('custom-voice');
        if (existingCustomInput) {
            existingCustomInput.remove();
        }
        
        // Show the dropdown again if it was hidden
        specificsSelect.style.display = 'block';

        if (selectedValue.includes('Custom')) {
            // Handle custom input
            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.id = 'custom-voice';
            customInput.className = 'style-select custom-input';
            customInput.placeholder = "Example: A wise tree that speaks in disco slang...";
            
            specificsSelect.style.display = 'none';
            specificsSelect.parentNode.insertBefore(customInput, specificsSelect.nextSibling);
            customInput.focus();
            
            customInput.addEventListener('input', debounce(() => {
                if (customInput.value.trim()) {
                    convertText();
                }
            }, 500));
        } else {
            // Trigger conversion for predefined voices
            debouncedConvert();
        }
    });

    // Add language change listener
    dom.get('output-language')?.addEventListener('change', debouncedConvert);
});

// Add formatting function
function formatOutput(inputText) {
    // Remove extra whitespace and normalize line breaks
    const cleanText = inputText.replace(/\s+/g, ' ').trim();
    
    // Split by section markers and filter empty strings
    const sections = cleanText.split('**').filter(section => section.trim());
    let formattedHtml = '<div class="formatted-output">';

    for (const section of sections) {
        if (section.includes(':')) {
            // It's a section header
            const [title, content] = section.split(':').map(s => s.trim());
            formattedHtml += `
                <section>
                    <h2>${title}</h2>
                    <div class="section-content">
                        ${content}
                    </div>
                </section>`;
        } else {
            // It's content
            formattedHtml += `<div class="section-content">${section.trim()}</div>`;
        }
    }

    formattedHtml += '</div>';
    return formattedHtml;
} 