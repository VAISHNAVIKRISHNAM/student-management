const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database("./students.db");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            course TEXT NOT NULL
        )
    `);
});

// Get all students
app.get("/api/students", (req, res) => {
    db.all(
        "SELECT * FROM students ORDER BY id DESC",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});

// Add student
app.post("/api/students", (req, res) => {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO students (name, email, course)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [name.trim(), email.trim(), course.trim()],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                id: this.lastID,
                name,
                email,
                course
            });
        }
    );
});

// Delete student
app.delete("/api/students/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            error: "Invalid student ID"
        });
    }

    db.run(
        "DELETE FROM students WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                message: "Student deleted successfully"
            });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
