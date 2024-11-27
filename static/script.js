// DOM Utilities
const dom = {
    get: (id) => document.getElementById(id),
    getValue: (id) => document.getElementById(id)?.value,
    setContent: (element, content, isError = false) => {
        if (element) {
            if (isError) {
                element.textContent = content;
                element.className = 'output-area error';
                return;
            }

            // Format the content
            const formattedContent = formatOutput(content);
            element.innerHTML = formattedContent;
            element.className = 'output-area';
        }
    },
    updateStatus: (message, type = 'default') => {
        const badge = document.getElementById('status-badge');
        if (badge) {
            badge.textContent = message;
            badge.className = `status-badge ${type}`;
        }
    },
    updateWordCount: (text) => {
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
    const outputElement = dom.get('styledText');
    const style = dom.getValue('style');
    const styleExample = dom.getValue('style-examples');
    const styleSpecific = dom.getValue('style-specifics');
    const targetLanguage = dom.getValue('output-language');
    
    if (!text || !style) {
        dom.setContent(outputElement, '');
        dom.updateStatus('Ready');
        return;
    }

    try {
        dom.updateStatus('Converting...', 'processing');
        
        const response = await fetch('/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                style,
                example: styleExample,
                specific: styleSpecific,
                target_language: targetLanguage,
                context_type: 'style'
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        dom.setContent(outputElement, data.converted_text || data.styled_text);
        dom.updateStatus('Converted', 'done');
    } catch (error) {
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
    
    dom.get('style')?.addEventListener('change', debouncedConvert);
    dom.get('style-examples')?.addEventListener('change', debouncedConvert);
    dom.get('style-specifics')?.addEventListener('change', debouncedConvert);
    
    // Add language change listener
    dom.get('output-language')?.addEventListener('change', debouncedConvert);
});

// Add this to your existing script.js
const styleExamples = {
    formal: [
        "Academic Paper",
        "Research Report",
        "Legal Document",
        "Technical Documentation",
        "Custom Format..."
    ],
    professional: [
        "Business Email",
        "Executive Summary",
        "Project Proposal",
        "Meeting Minutes",
        "Custom Format..."
    ],
    casual: [
        "Friendly Email",
        "Blog Post",
        "Social Media",
        "Personal Message",
        "Custom Format..."
    ],
    creative: [
        "Historical Voice",
        "Character Voice",
        "Storytelling",
        "Custom Voice..."
    ]
};

const creativeSubOptions = {
    'historical-voice': [
        "Cave Person Era (Prehistoric)",
        "Ancient Egyptian",
        "Classical Greek",
        "Roman Empire",
        "Medieval Times",
        "Renaissance",
        "Victorian Era",
        "Roaring 20s",
        "1950s America",
        "1960s Counterculture",
        "1980s Pop Culture",
        "1990s Valley Girl",
        "Y2K Era",
        "Modern Gen Z",
        "Custom Era..."
    ],
    'character-voice': [
        "Shakespearean",
        "Yoda",
        "Pirate Captain",
        "Royal Decree",
        "Mystical Wizard",
        "Custom Character..."
    ],
    'storytelling': [
        "Epic Fantasy",
        "Mystery Novel",
        "Children's Story",
        "Science Fiction",
        "Folk Tale",
        "Horror Story",
        "Romance Novel",
        "Historical Fiction",
        "Adventure Tale",
        "Custom Style..."
    ]
};

// Add third-level options
const subCategoryOptions = {
    // Historical voice sub-options
    'cave-person-era': [
        "Hunter Gatherer",
        "Early Tools Era",
        "Cave Paintings Era",
        "Custom Prehistoric..."
    ],
    'ancient-egyptian': [
        "Pharaoh's Court",
        "Temple Scribe",
        "Common Speech",
        "Custom Egyptian..."
    ],
    'victorian-era': [
        "Upper Class",
        "Literary Style",
        "Street Speech",
        "Custom Victorian..."
    ],
    // Character voice sub-options
    'shakespearean': [
        "Tragic Hero",
        "Comic Relief",
        "Royal Court",
        "Custom Shakespeare..."
    ],
    'detective-noir': [
        "Hard-boiled Detective",
        "Femme Fatale",
        "Street Informant",
        "Custom Noir..."
    ],
    // Add more sub-options for other categories...
    'epic-fantasy': [
        "High Fantasy",
        "Dark Fantasy",
        "Sword and Sorcery",
        "Mythological Fantasy",
        "Custom Fantasy..."
    ],
    'mystery-novel': [
        "Detective Noir",
        "Cozy Mystery",
        "Police Procedural",
        "Thriller Style",
        "Custom Mystery..."
    ],
    'childrens-story': [
        "Picture Book",
        "Middle Grade",
        "Young Adventure",
        "Educational Tale",
        "Custom Children's..."
    ],
    'science-fiction': [
        "Space Opera",
        "Cyberpunk",
        "Post-Apocalyptic",
        "Hard Sci-Fi",
        "Custom Sci-Fi..."
    ],
    'folk-tale': [
        "Fairy Tale",
        "Cultural Legend",
        "Moral Story",
        "Mythological Tale",
        "Custom Folk Tale..."
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    const styleSelect = document.getElementById('style');
    const examplesContainer = document.getElementById('examples-container');
    const examplesSelect = document.getElementById('style-examples');
    const customInput = document.getElementById('custom-example');

    // Update examples when style changes
    styleSelect.addEventListener('change', function() {
        const style = this.value;
        const examples = styleExamples[style] || [];
        
        // Show and populate the sub-select
        examplesSelect.innerHTML = `<option value="" disabled selected>Select ${style} style...</option>` +
            examples.map(example => 
                `<option value="${example.toLowerCase().replace(/ /g, '-')}">${example}</option>`
            ).join('');
        
        examplesSelect.style.display = 'block';
        examplesSelect.classList.add('visible');
        customInput.style.display = 'none';
    });

    // Handle sub-options selection
    examplesSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        const style = styleSelect.value;
        const styleSpecifics = document.getElementById('style-specifics');
        
        // Hide third dropdown initially
        styleSpecifics.style.display = 'none';
        styleSpecifics.classList.remove('visible');

        if (selectedValue === 'historical-voice') {
            // Show historical era options
            const historicalOptions = creativeSubOptions['historical-voice'];
            styleSpecifics.innerHTML = `
                <option value="" disabled selected>Select historical era...</option>
                ${historicalOptions.map(option => 
                    `<option value="${option.toLowerCase().replace(/ /g, '-')}">${option}</option>`
                ).join('')}
            `;
            styleSpecifics.style.display = 'block';
            setTimeout(() => styleSpecifics.classList.add('visible'), 0);
        } else if (selectedValue === 'character-voice') {
            // Show character options
            const characterOptions = creativeSubOptions['character-voice'];
            styleSpecifics.innerHTML = `
                <option value="" disabled selected>Select character type...</option>
                ${characterOptions.map(option => 
                    `<option value="${option.toLowerCase().replace(/ /g, '-')}">${option}</option>`
                ).join('')}
            `;
            styleSpecifics.style.display = 'block';
            setTimeout(() => styleSpecifics.classList.add('visible'), 0);
        } else if (selectedValue === 'storytelling') {
            // Show storytelling options
            const storytellingOptions = creativeSubOptions['storytelling'];
            styleSpecifics.innerHTML = `
                <option value="" disabled selected>Select storytelling style...</option>
                ${storytellingOptions.map(option => 
                    `<option value="${option.toLowerCase().replace(/ /g, '-')}">${option}</option>`
                ).join('')}
            `;
            styleSpecifics.style.display = 'block';
            setTimeout(() => styleSpecifics.classList.add('visible'), 0);
        }
        // Add similar handling for other options
    });

    // Handle the third dropdown's custom options
    styleSpecifics.addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue.includes('custom-')) {
            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.id = 'custom-specifics';
            customInput.className = 'style-select custom-input';
            customInput.placeholder = 'Describe your specific style...';
            
            this.style.display = 'none';
            this.parentNode.insertBefore(customInput, this.nextSibling);
            customInput.focus();
        }
    });

    // Update the convertText function to include example/custom format
    const originalConvertText = convertText;
    convertText = async function() {
        const text = dom.getValue('originalText')?.trim();
        const style = dom.getValue('style');
        const example = dom.getValue('style-examples');
        const customFormat = dom.getValue('custom-example');
        
        // Include example/custom format in the request
        const requestData = {
            text,
            style,
            example: example === 'custom-format...' ? customFormat : example
        };

        // ... rest of your conversion logic
    };
});

// Add formatting function
function formatOutput(text) {
    // Remove extra whitespace and normalize line breaks
    text = text.replace(/\s+/g, ' ').trim();
    
    // Split by section markers and filter empty strings
    const sections = text.split('**').filter(section => section.trim());
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