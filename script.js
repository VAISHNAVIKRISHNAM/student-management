const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const studentCount = document.getElementById("studentCount");
const emptyMessage = document.getElementById("emptyMessage");
const message = document.getElementById("message");

async function loadStudents() {
    try {
        const response = await fetch("/api/students");

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const students = await response.json();

        studentList.innerHTML = "";

        studentCount.textContent =
            `${students.length} Student${students.length !== 1 ? "s" : ""}`;

        emptyMessage.style.display =
            students.length === 0 ? "block" : "none";

        students.forEach((student) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.id}</td>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(student.email)}</td>
                <td>${escapeHtml(student.course)}</td>
                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteStudent(${student.id})"
                    >
                        Delete
                    </button>
                </td>
            `;

            studentList.appendChild(row);
        });

    } catch (error) {
        showMessage("Unable to load students.", "error");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const course = document.getElementById("course").value.trim();

    if (!name || !email || !course) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    try {
        const response = await fetch("/api/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                course
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to add student");
        }

        form.reset();

        showMessage(
            "Student added successfully!",
            "success"
        );

        loadStudents();

    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function deleteStudent(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/api/students/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to delete student"
            );
        }

        showMessage(
            "Student deleted successfully!",
            "success"
        );

        loadStudents();

    } catch (error) {
        showMessage(error.message, "error");
    }
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;

    setTimeout(() => {
        message.textContent = "";
        message.className = "";
    }, 3000);
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

loadStudents();
