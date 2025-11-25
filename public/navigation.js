// check authentication status when page loads
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        // update navigation based on login status
        updateNavigation(data.isAuthenticated, data.username);
        
        return data.isAuthenticated;
    } catch (error) {
        console.error('error checking auth:', error);
        updateNavigation(false);
        return false;
    }
}

// update navigation bar html based on authentication
function updateNavigation(isAuthenticated, username = '') {
    const nav = document.getElementById('mainNav');
    
    // if nav doesn't exist, exit
    if (!nav) return;
    
    if (isAuthenticated) {
        // user is logged in - show welcome and logout
        nav.innerHTML = `
            <span class="welcome-msg">Welcome, ${username}!</span>
            <a href="/logout" class="logout-btn">Logout</a>
        `;
        
        // show add course button
        const addBtn = document.getElementById('addCourseBtn');
        if (addBtn) addBtn.style.display = 'inline-block';
        
        // show actions column in table
        const actionsHeader = document.getElementById('actionsHeader');
        if (actionsHeader) actionsHeader.style.display = 'table-cell';
        
    } else {
        // user is logged out - show login link
        nav.innerHTML = `
            <a href="/login.html" class="nav-link">Login with GitHub</a>
        `;
        
        // hide add course button
        const addBtn = document.getElementById('addCourseBtn');
        if (addBtn) addBtn.style.display = 'none';
        
        // hide actions column
        const actionsHeader = document.getElementById('actionsHeader');
        if (actionsHeader) actionsHeader.style.display = 'none';
    }
}

// redirect to login if not authenticated
async function requireAuth() {
    const isAuth = await checkAuthStatus();
    
    if (!isAuth) {
        alert('please login to access this page');
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// run check when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});