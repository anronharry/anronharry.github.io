// Initialize Lucide icons after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    const app = document.querySelector('.app');
    
    // Check for user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        app.classList.replace('light-mode', 'dark-mode');
        updateDarkModeIcon();
    }
    
    // Load user preference from localStorage if available
    if (localStorage.getItem('darkMode') === 'enabled') {
        app.classList.replace('light-mode', 'dark-mode');
        updateDarkModeIcon();
    }
    
    darkModeToggle.addEventListener('click', () => {
        if (app.classList.contains('light-mode')) {
            app.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            app.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
        updateDarkModeIcon();
    });
    
    function updateDarkModeIcon() {
        const icon = darkModeToggle.querySelector('i');
        if (app.classList.contains('dark-mode')) {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
    }
    
    // Minimalist Reading Progress Indicator
    const readingProgress = document.getElementById('readingProgress');
    
    // Clear any existing content
    readingProgress.innerHTML = '';
    
    // Create SVG elements for circular progress
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'progress-circle');
    svg.setAttribute('viewBox', '0 0 36 36');
    
    const circleBackground = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleBackground.setAttribute('class', 'progress-circle-bg');
    circleBackground.setAttribute('cx', '18');
    circleBackground.setAttribute('cy', '18');
    circleBackground.setAttribute('r', '16');
    
    const circleForeground = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleForeground.setAttribute('class', 'progress-circle-fg');
    circleForeground.setAttribute('cx', '18');
    circleForeground.setAttribute('cy', '18');
    circleForeground.setAttribute('r', '16');
    
    svg.appendChild(circleBackground);
    svg.appendChild(circleForeground);
    
    // Add SVG to the progress indicator
    readingProgress.appendChild(svg);
    
    // Create span for percentage text
    const percentText = document.createElement('span');
    percentText.classList.add('percent-text');
    readingProgress.appendChild(percentText);
    
    // Smooth scroll to top when clicked
    readingProgress.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Update reading progress indicator on scroll
    window.addEventListener('scroll', () => {
        // Calculate scroll percentage with precision
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        const roundedPercent = Math.min(100, Math.round(scrollPercent));
        
        // Update progress indicator text
        percentText.textContent = `${roundedPercent}%`;
        
        // Update SVG circle progress
        const circumference = 2 * Math.PI * 16;
        circleForeground.style.strokeDasharray = `${circumference * roundedPercent / 100} ${circumference}`;
        
        // Show/hide based on scroll position
        if (scrollTop > 100) {
            readingProgress.style.opacity = '1';
        } else {
            readingProgress.style.opacity = '0';
        }
    });
    
    // Check if we're on the index page
    const isIndexPage = window.location.pathname.endsWith('Home.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/');
    
    // Only enable smooth scrolling on the index page
    if (isIndexPage) {
        // Set home link as active
        document.getElementById('homeLink').classList.add('active');
        
        // Smooth scrolling for scroll indicator on homepage
        document.getElementById('scrollIndicator').addEventListener('click', () => {
            document.getElementById('about').scrollIntoView({
                behavior: 'smooth'
            });
        });
        
        // Handle in-page navigation only on the index page
        const homeLink = document.getElementById('homeLink');
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Update active nav link on scroll (only on index page)
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            
            // Get all sections
            const sections = document.querySelectorAll('section');
            
            // Determine which section is currently in view
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (scrollPosition >= sectionTop - 100 && 
                   scrollPosition < sectionTop + sectionHeight - 100) {
                    const sectionId = section.getAttribute('id');
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-button').forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.textContent.toLowerCase() === sectionId) {
                            btn.classList.add('active');
                        }
                    });
                }
            });
        });
    }
    
    // Trigger scroll event to initialize the indicator
    window.dispatchEvent(new Event('scroll'));
});
