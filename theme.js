// theme.js - Logika Mode Terang & Gelap (Dengan Perbaikan Menu Mobile Final)

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    // Fungsi untuk menerapkan tema
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            if(themeToggle) themeToggle.checked = true;
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
            if(themeToggle) themeToggle.checked = false;
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    if(themeToggle) {
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // --- LOGIKA BUKA TUTUP MENU MOBILE ---
    const openSidebar = () => document.body.classList.add('sidebar-open');
    const closeSidebar = () => document.body.classList.remove('sidebar-open');

    if(menuToggle) {
        menuToggle.addEventListener('click', openSidebar);
    }
    if(sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', closeSidebar);
    }
    if(sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
});