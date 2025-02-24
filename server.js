const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./todo.db', (err) => {
    if (err) throw err;
    console.log("✅ Connected to SQLite database");
});

// Create Table if not exists
db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0
)`, (err) => {
    if (err) throw err;
    console.log("✅ Todos table is ready");
});

// 📝 Routes (CRUD Operations)

// 1️⃣ Get all todos
app.get('/todos', (req, res) => {
    db.all("SELECT * FROM todos", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2️⃣ Add a new todo
app.post('/todos', (req, res) => {
    const { text } = req.body;
    db.run("INSERT INTO todos (text) VALUES (?)", [text], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, text, completed: false });
    });
});

// 3️⃣ Update a todo (mark as completed)
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Todo updated" });
    });
});

// 4️⃣ Delete a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM todos WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Todo deleted" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
