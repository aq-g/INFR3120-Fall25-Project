document.addEventListener("DOMContentLoaded", () => {
    const courseTableBody = document.getElementById("courseTableBody");
    const editForm = document.getElementById("editCourseForm");

    if (courseTableBody) {
        loadCourses();
    }

    if (editForm) {
        initEditForm();
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

            tr.innerHTML = `
                <td>${course.code || ""}</td>
                <td>${course.name || ""}</td>
                <td>${course.instructor || ""}</td>
                <td>${course.delivery || ""}</td>
                <td>${course.semester || ""}</td>
                <td>${course.description || ""}</td>
                <td>
                    <a href="editcourse.html?id=${course._id}" class="btn-small">edit</a>
                    <form action="/delete-course/${course._id}" method="POST" style="display:inline;">
                        <button type="submit" class="btn-small btn-delete" onclick="return confirm('delete this course?');">
                            delete
                        </button>
                    </form>
                </td>
            `;

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("error loading courses:", err);
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
