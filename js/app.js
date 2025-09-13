// Main application controller
class App {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Initialize the app - show home page immediately
        const homePage = document.getElementById('home-page');
        const navbar = document.getElementById('top-navbar');
        
        if (homePage) {
            homePage.classList.add('active');
        }
        
        // Hide navbar on home page with aggressive styling
        if (navbar) {
            navbar.style.setProperty('display', 'none', 'important');
            navbar.style.setProperty('visibility', 'hidden', 'important');
            navbar.style.setProperty('height', '0px', 'important');
            navbar.style.setProperty('position', 'absolute', 'important');
            navbar.style.setProperty('top', '-10000px', 'important');
        }
        
        // Add home-active class to body
        document.body.classList.add('home-active');
        
        // Load data on startup with delay
        setTimeout(() => {
            this.loadInitialData();
        }, 100);
    }

    async loadInitialData() {
        // Load layouts and rosters for dropdowns
        await this.populateLayoutSelect();
        await this.populateRosterSelect();
    }

    async populateLayoutSelect() {
        const layouts = StorageService.getAllLayouts();
        const select = document.getElementById('layout-select');
        if (select) {
            select.innerHTML = '<option value="">Select a Layout</option>';
            layouts.forEach(layout => {
                const option = document.createElement('option');
                option.value = layout.id;
                option.textContent = layout.name;
                select.appendChild(option);
            });
        }
    }

    async populateRosterSelect() {
        const rosters = StorageService.getAllRosters();
        const select = document.getElementById('roster-select');
        if (select) {
            select.innerHTML = '<option value="">Select a Roster</option>';
            rosters.forEach(roster => {
                const option = document.createElement('option');
                option.value = roster.id;
                option.textContent = roster.name;
                select.appendChild(option);
            });
        }
    }
}

// Global navigation functions
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Hide all pages and their toolbars
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.setProperty('display', 'none', 'important');
        page.style.setProperty('visibility', 'hidden', 'important');
    });
    
    // Hide all toolbars
    const toolbars = document.querySelectorAll('.toolbar');
    toolbars.forEach(toolbar => {
        toolbar.style.setProperty('display', 'none', 'important');
        toolbar.style.setProperty('visibility', 'hidden', 'important');
    });
    
    // Control navbar visibility with body classes
    const navbar = document.getElementById('top-navbar');
    const body = document.body;
    
    if (pageId === 'home-page') {
        // Add home-active class and aggressively hide navbar
        body.classList.add('home-active');
        if (navbar) {
            navbar.style.setProperty('display', 'none', 'important');
            navbar.style.setProperty('visibility', 'hidden', 'important');
            navbar.style.setProperty('height', '0px', 'important');
            navbar.style.setProperty('position', 'absolute', 'important');
            navbar.style.setProperty('top', '-10000px', 'important');
        }
    } else {
        // Remove home-active class and show navbar
        body.classList.remove('home-active');
        if (navbar) {
            navbar.style.setProperty('display', 'block', 'important');
            navbar.style.setProperty('visibility', 'visible', 'important');
            navbar.style.setProperty('height', 'auto', 'important');
            navbar.style.setProperty('position', 'static', 'important');
            navbar.style.setProperty('top', 'auto', 'important');
        }
    }
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.setProperty('display', 'block', 'important');
        targetPage.style.setProperty('visibility', 'visible', 'important');
        targetPage.style.setProperty('opacity', '1', 'important');
        
        // Show toolbar only for pages that need it
        if (pageId === 'layout-editor' || pageId === 'rosters' || pageId === 'plan-editor') {
            const pageToolbar = targetPage.querySelector('.toolbar');
            if (pageToolbar) {
                pageToolbar.style.setProperty('display', 'flex', 'important');
                pageToolbar.style.setProperty('visibility', 'visible', 'important');
            }
        }
        
        if (app) {
            app.currentPage = pageId;
        }
        
        // Initialize page-specific functionality
        switch(pageId) {
            case 'layout-editor':
                if (window.layoutEditor) {
                    layoutEditor.initializeGrid();
                } else {
                    // Ensure layout editor is initialized
                    setTimeout(() => {
                        if (window.layoutEditor) {
                            layoutEditor.initializeGrid();
                        }
                    }, 100);
                }
                break;
            case 'rosters':
                if (window.rosterManager) {
                    rosterManager.loadRosterList();
                } else {
                    // Ensure roster manager is initialized
                    setTimeout(() => {
                        if (window.rosterManager) {
                            rosterManager.loadRosterList();
                        }
                    }, 100);
                }
                break;
            case 'plan-editor':
                if (window.planEditor) {
                    planEditor.initialize();
                } else {
                    // Ensure plan editor is initialized
                    setTimeout(() => {
                        if (window.planEditor) {
                            planEditor.initialize();
                        }
                    }, 100);
                }
                break;
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const messageEl = document.getElementById('notification-message');
    
    // Set content
    messageEl.textContent = message;
    
    // Set icon based on type
    switch(type) {
        case 'success':
            icon.textContent = '✓';
            break;
        case 'error':
            icon.textContent = '✗';
            break;
        case 'info':
        default:
            icon.textContent = 'i';
            break;
    }
    
    // Remove previous type classes and add new one
    notification.className = `notification notification-${type}`;
    notification.style.display = 'flex';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
}

// Utility functions
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing SmartSchool app...');
        app = new App();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // Ensure home page is still visible
        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.style.display = 'block';
        }
    }
});

// Dark mode functionality
function initializeDarkMode() {
    // Check if user has a preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }
}

function setDarkMode(isDark) {
    const html = document.documentElement;
    const toggleIcon = document.getElementById('dark-mode-icon');

    if (isDark) {
        html.setAttribute('data-theme', 'dark');
        toggleIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        html.removeAttribute('data-theme');
        toggleIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    setDarkMode(!isDark);
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
});

// Export for global access
window.showPage = showPage;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.formatDate = formatDate;
window.generateId = generateId;
window.toggleDarkMode = toggleDarkMode;