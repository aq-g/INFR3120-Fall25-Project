window.isUserAuthenticated = false;

// Form validation
function validateCourseForm(formData) {
    const errors = [];
    
    // course code: 4 letters + 4 digits (ex INFR3120)
    const codePattern = /^[A-Z]{4}\d{4}$/;
    if (!codePattern.test(formData.code.toUpperCase())) {
        errors.push('Course code must be 4 letters + 4 numbers (Example: INFR3120)');
    }
    
    // coursename length
    if (formData.name.length < 3) {
        errors.push('Course name must be at least 3 characters');
    }
    
    // instructor name
    if (formData.instructor.length < 2) {
        errors.push('Please enter instructor name');
    }
    
    // delivery mode
    if (!formData.delivery) {
        errors.push('Please select a delivery mode');
    }
    
    // semester
    if (!formData.semester) {
        errors.push('Please select a semester');
    }
    
    return errors;
}

function showMessage(message, type = 'info') {
    const main = document.querySelector('main');
    if (!main) {
        alert(message); // fallback if no <main>
        return;
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.marginBottom = '20px';
    alert.textContent = message;
    
    
    const existingAlert = main.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    main.insertBefore(alert, main.firstChild);
    
    // auto remove after 5 seconds
    setTimeout(() => alert.remove(), 5000);
}


// Waits till loaded to run script

document.addEventListener("DOMContentLoaded", async () => {
    const courseTableBody = document.getElementById("courseTableBody");
    const addForm = document.getElementById("addCourseForm");
    const editForm = document.getElementById("editCourseForm");

    // 1) Check auth status first
    await checkAuthForDisplay();

    // 2) protect add and edit pages
    const path = window.location.pathname;

    if (path.endsWith('addcourse.html')) {
        if (!window.isUserAuthenticated) {
            alert('please login to add courses');
            window.location.href = '/login.html';
            return;
        }
    }

    if (path.endsWith('editcourse.html')) {
        if (!window.isUserAuthenticated) {
            alert('please login to edit courses');
            window.location.href = '/login.html';
            return;
        }
    }

    // 3) load table of courses if on list page
    if (courseTableBody) {
        loadCourses();
    }

    // 4) If on edit pageload course data into form
    if (editForm && path.endsWith('editcourse.html')) {
        initEditForm();
    }

    // 5) Attach validation toadd form
    if (addForm) {
        addForm.addEventListener("submit", function (e) {
            e.preventDefault(); // stop immediate submit

            const formData = {
                code: document.getElementById("code").value.trim(),
                name: document.getElementById("name").value.trim(),
                instructor: document.getElementById("instructor").value.trim(),
                delivery: document.getElementById("delivery").value,
                semester: document.getElementById("semester").value,
                description: document.getElementById("description").value.trim()
            };

            const errors = validateCourseForm(formData);

            if (errors.length > 0) {
                showMessage(errors.join('. '), 'error');
            } else {
                showMessage('Saving course...', 'info');
                this.submit(); // now actually submit
            }
        });
    }

    // 6) Attach validation to edit form
    if (editForm) {
        editForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = {
                code: document.getElementById("code").value.trim(),
                name: document.getElementById("name").value.trim(),
                instructor: document.getElementById("instructor").value.trim(),
                delivery: document.getElementById("delivery").value,
                semester: document.getElementById("semester").value,
                description: document.getElementById("description").value.trim()
            };

            const errors = validateCourseForm(formData);

            if (errors.length > 0) {
                showMessage(errors.join('. '), 'error');
            } else {
                showMessage('Updating course...', 'info');
                this.submit();
            }
        });
    }
});


async function loadCourses() {
    try {
        const res = await fetch("/api/courses");
        if (!res.ok) {
            console.error("failed to fetch courses");
            return;
        }

        const courses = await res.json();
        const tbody = document.getElementById("courseTableBody");
        tbody.innerHTML = "";

        courses.forEach(course => {
            const tr = document.createElement("tr");

            const actionButtons = window.isUserAuthenticated ? `
                <td>
                    <a href="editcourse.html?id=${course._id}" class="btn-small">edit</a>
                    <form action="/delete-course/${course._id}" method="POST" style="display:inline;">
                        <button type="submit" class="btn-small btn-delete" onclick="return confirm('delete this course?');">
                            delete
                        </button>
                    </form>
                </td>
            ` : '';

            tr.innerHTML = `
                <td>${course.code || ""}</td>
                <td>${course.name || ""}</td>
                <td>${course.instructor || ""}</td>
                <td>${course.delivery || ""}</td>
                <td>${course.semester || ""}</td>
                <td>${course.description || ""}</td>
                ${actionButtons}
            `;

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("error loading courses:", err);
    }
}

async function checkAuthForDisplay() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        window.isUserAuthenticated = data.isAuthenticated;
    } catch (error) {
        console.error('error checking auth:', error);
        window.isUserAuthenticated = false;
    }
}

async function initEditForm() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        console.warn("no course id in url");
        return;
    }

    try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) {
            console.error("failed to fetch course");
            return;
        }

        const course = await res.json();

        document.getElementById("courseId").value = course._id;
        document.getElementById("code").value = course.code || "";
        document.getElementById("name").value = course.name || "";
        document.getElementById("instructor").value = course.instructor || "";
        document.getElementById("delivery").value = course.delivery || "";
        document.getElementById("semester").value = course.semester || "";
        document.getElementById("description").value = course.description || "";
    } catch (err) {
        console.error("error loading course for edit:", err);
    }
}
