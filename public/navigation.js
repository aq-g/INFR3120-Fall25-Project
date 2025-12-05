// check authentication status when page loads
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        // update navigation based on login status
        updateNavigation(data.isAuthenticated, data.username, data.profilePicture);
        
        return data.isAuthenticated;
    } catch (error) {
        console.error('error checking auth:', error);
        updateNavigation(false);
        return false;
    }
}

// update navigation bar html based on authentication
function updateNavigation(isAuthenticated, username = '', profilePicture = '') {
    const nav = document.getElementById('mainNav');
    
    // if nav doesn't exist, exit
    if (!nav) return;
    
    if (isAuthenticated) {
        // Create profile picture
        const picHtml = profilePicture ? 
            `<img src="${profilePicture}" 
                  alt="Profile" 
                  style="width:35px; 
                         height:35px; 
                         border-radius:50%; 
                         margin-right:10px; 
                         vertical-align:middle;
                         object-fit: cover;
                         border: 2px solid #23afa4;">` 
            : '';
        
        nav.innerHTML = `
            ${picHtml}
            <a href="/profile.html" class="nav-link">My Profile</a>
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
            <a href="/login.html" class="nav-link">Login</a>
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