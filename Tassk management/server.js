const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");

const app = express();

const PORT = 5000;
const JWT_SECRET = "my_secret_key";

const db = new Database("tasks.db");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// ---------------- DATABASE ----------------

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    due_date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
`);


// ---------------- TOKEN ----------------

function createToken(user) {

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}


// ---------------- AUTH MIDDLEWARE ----------------

function auth(req, res, next) {

    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    const token = header.split(" ")[1];

    try {

        const user = jwt.verify(token, JWT_SECRET);

        req.user = user;

        next();

    } catch {

        res.status(401).json({
            message: "Invalid token"
        });
    }
}


// ---------------- REGISTER ----------------

app.post("/api/auth/register", async (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password.length < 6) {

        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    const existingUser = db.prepare(
        "SELECT * FROM users WHERE email = ?"
    ).get(email);

    if (existingUser) {

        return res.status(400).json({
            message: "Email already registered"
        });
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const result = db.prepare(`
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
    `).run(
        name,
        email,
        hashedPassword
    );

    const user = {
        id: result.lastInsertRowid,
        name: name,
        email: email
    };

    const token = createToken(user);

    res.json({
        message: "Registration successful",
        token: token,
        user: user
    });
});


// ---------------- LOGIN ----------------

app.post("/api/auth/login", async (req, res) => {

    const {
        email,
        password
    } = req.body;

    const user = db.prepare(
        "SELECT * FROM users WHERE email = ?"
    ).get(email);

    if (!user) {

        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const validPassword =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!validPassword) {

        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    const token = createToken(safeUser);

    res.json({
        message: "Login successful",
        token: token,
        user: safeUser
    });
});


// ---------------- GET TASKS ----------------

app.get("/api/tasks", auth, (req, res) => {

    const tasks = db.prepare(`
        SELECT *
        FROM tasks
        WHERE user_id = ?
        ORDER BY id DESC
    `).all(req.user.id);

    res.json(tasks);
});


// ---------------- CREATE TASK ----------------

app.post("/api/tasks", auth, (req, res) => {

    const {
        title,
        description,
        status,
        due_date
    } = req.body;

    if (!title) {

        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const result = db.prepare(`
        INSERT INTO tasks
        (user_id, title, description, status, due_date)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        req.user.id,
        title,
        description || "",
        status || "Pending",
        due_date || ""
    );

    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.json(task);
});


// ---------------- UPDATE TASK ----------------

app.put("/api/tasks/:id", auth, (req, res) => {

    const id = req.params.id;

    const {
        title,
        description,
        status,
        due_date
    } = req.body;

    const task = db.prepare(`
        SELECT *
        FROM tasks
        WHERE id = ? AND user_id = ?
    `).get(id, req.user.id);

    if (!task) {

        return res.status(404).json({
            message: "Task not found"
        });
    }

    db.prepare(`
        UPDATE tasks
        SET
        title = ?,
        description = ?,
        status = ?,
        due_date = ?
        WHERE id = ? AND user_id = ?
    `).run(
        title,
        description,
        status,
        due_date,
        id,
        req.user.id
    );

    res.json({
        message: "Task updated successfully"
    });
});


// ---------------- DELETE TASK ----------------

app.delete("/api/tasks/:id", auth, (req, res) => {

    const id = req.params.id;

    const result = db.prepare(`
        DELETE FROM tasks
        WHERE id = ? AND user_id = ?
    `).run(
        id,
        req.user.id
    );

    if (!result.changes) {

        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json({
        message: "Task deleted successfully"
    });
});


// ---------------- START SERVER ----------------

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});