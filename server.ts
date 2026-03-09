import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("bookloop.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    location TEXT,
    avatar TEXT,
    trust_score REAL DEFAULT 5.0,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Ensure columns exist (for existing databases)
try { db.exec("ALTER TABLE users ADD COLUMN password TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN location TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN avatar TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN trust_score REAL DEFAULT 5.0"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); } catch(e) {}

// Migration for books table
try { db.exec("ALTER TABLE books ADD COLUMN city TEXT"); } catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    title TEXT,
    author TEXT,
    category TEXT,
    condition TEXT,
    description TEXT,
    image_url TEXT,
    availability TEXT, -- 'borrow', 'trade', 'both'
    status TEXT DEFAULT 'available', -- 'available', 'borrowed', 'traded'
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    requester_id INTEGER,
    owner_id INTEGER,
    type TEXT, -- 'borrow', 'trade'
    trade_book_id INTEGER, -- if type is 'trade'
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
    return_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(book_id) REFERENCES books(id),
    FOREIGN KEY(requester_id) REFERENCES users(id),
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES requests(id),
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    type TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial admin user if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get("kaushik.c9035@gmail.com");
if (!adminExists) {
  db.prepare("INSERT INTO users (email, password, name, role, location, avatar) VALUES (?, ?, ?, ?, ?, ?)").run(
    "kaushik.c9035@gmail.com", 
    "password123",
    "Kaushik C", 
    "admin", 
    "San Francisco", 
    "https://picsum.photos/seed/kaushik/200"
  );
  
  // Seed some books
  const books = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", condition: "Good", city: "San Francisco", availability: "both", image_url: "https://picsum.photos/seed/gatsby/400/600" },
    { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "History", condition: "Like New", city: "San Francisco", availability: "borrow", image_url: "https://picsum.photos/seed/sapiens/400/600" },
    { title: "Clean Code", author: "Robert C. Martin", category: "Technology", condition: "Good", city: "San Francisco", availability: "trade", image_url: "https://picsum.photos/seed/cleancode/400/600" },
    { title: "Atomic Habits", author: "James Clear", category: "Self Help", condition: "Like New", city: "San Francisco", availability: "both", image_url: "https://picsum.photos/seed/habits/400/600" },
    { title: "Dune", author: "Frank Herbert", category: "Fiction", condition: "Fair", city: "San Francisco", availability: "borrow", image_url: "https://picsum.photos/seed/dune/400/600" },
    { title: "The Silent Patient", author: "Alex Michaelides", category: "Mystery", condition: "Good", city: "San Francisco", availability: "both", image_url: "https://picsum.photos/seed/silent/400/600" },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Science", condition: "Like New", city: "Austin", availability: "trade", image_url: "https://picsum.photos/seed/thinking/400/600" },
    { title: "Pride and Prejudice", author: "Jane Austen", category: "Romance", condition: "Worn", city: "Portland", availability: "borrow", image_url: "https://picsum.photos/seed/pride/400/600" },
    { title: "The Art of War", author: "Sun Tzu", category: "History", condition: "Good", city: "Denver", availability: "both", image_url: "https://picsum.photos/seed/artofwar/400/600" },
    { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", category: "Fantasy", condition: "Good", city: "Miami", availability: "borrow", image_url: "https://picsum.photos/seed/hp1/400/600" },
    { title: "Educated", author: "Tara Westover", category: "Biography", condition: "Like New", city: "Philadelphia", availability: "both", image_url: "https://picsum.photos/seed/educated/400/600" },
    { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", condition: "Good", city: "Houston", availability: "trade", image_url: "https://picsum.photos/seed/alchemist/400/600" },
  ];

  const insertBook = db.prepare(`
    INSERT INTO books (owner_id, title, author, category, condition, description, image_url, availability, city)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const book of books) {
    insertBook.run(book.title, book.author, book.category, book.condition, `A great copy of ${book.title}.`, book.image_url, book.availability, book.city);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---

  // Auth
  app.post("/api/auth/signup", (req, res) => {
    let { email, password, name, location } = req.body;
    email = email?.trim().toLowerCase();
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      // Check if user already exists first for clearer error
      const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (existingUser) {
        console.log(`Signup attempt with existing email: ${email}`);
        return res.status(400).json({ error: "Email already exists. Please sign in instead." });
      }

      const result = db.prepare("INSERT INTO users (email, password, name, location, avatar) VALUES (?, ?, ?, ?, ?)")
        .run(email, password, name, location, `https://picsum.photos/seed/${name || 'user'}/200`);
      
      const userId = result.lastInsertRowid.toString();
      res.cookie("userId", userId, { httpOnly: true, sameSite: 'none', secure: true });
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      res.json(user);
    } catch (e: any) {
      console.error("Signup error details:", {
        message: e.message,
        code: e.code,
        email
      });
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Internal server error during signup" });
      }
    }
  });

  app.post("/api/auth/login", (req, res) => {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.cookie("userId", user.id, { httpOnly: true, sameSite: 'none', secure: true });
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("userId");
    res.json({ success: true });
  });

  app.get("/api/me", (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) return res.json(null);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    res.json(user || null);
  });

  // Books
  app.get("/api/books", (req, res) => {
    const { category, search, city } = req.query;
    let query = "SELECT b.*, u.name as owner_name, u.avatar as owner_avatar FROM books b JOIN users u ON b.owner_id = u.id WHERE b.status = 'available'";
    const params = [];

    if (category) {
      query += " AND b.category = ?";
      params.push(category);
    }
    if (search) {
      query += " AND (b.title LIKE ? OR b.author LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (city) {
      query += " AND b.city = ?";
      params.push(city);
    }

    const books = db.prepare(query).all(...params);
    res.json(books);
  });

  app.get("/api/books/:id", (req, res) => {
    const book = db.prepare("SELECT b.*, u.name as owner_name, u.avatar as owner_avatar, u.trust_score as owner_trust FROM books b JOIN users u ON b.owner_id = u.id WHERE b.id = ?").get(req.params.id);
    res.json(book);
  });

  app.post("/api/books", (req, res) => {
    const { owner_id, title, author, category, condition, description, image_url, availability, city } = req.body;
    const result = db.prepare(`
      INSERT INTO books (owner_id, title, author, category, condition, description, image_url, availability, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(owner_id, title, author, category, condition, description, image_url, availability, city);
    res.json({ id: result.lastInsertRowid });
  });

  // Requests
  app.post("/api/requests", (req, res) => {
    const { book_id, requester_id, owner_id, type, trade_book_id, return_date } = req.body;
    const result = db.prepare(`
      INSERT INTO requests (book_id, requester_id, owner_id, type, trade_book_id, return_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(book_id, requester_id, owner_id, type, trade_book_id, return_date);
    
    // Notify owner
    db.prepare("INSERT INTO notifications (user_id, content, type) VALUES (?, ?, ?)")
      .run(owner_id, `New ${type} request for your book!`, type);

    // Create initial message
    const requester = db.prepare("SELECT name FROM users WHERE id = ?").get(requester_id);
    const book = db.prepare("SELECT title FROM books WHERE id = ?").get(book_id);
    const initialContent = `Hi! I'm interested in ${type === 'borrow' ? 'borrowing' : 'trading for'} your book "${book.title}". Can we discuss the details?`;
    
    db.prepare("INSERT INTO messages (request_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)")
      .run(result.lastInsertRowid, requester_id, owner_id, initialContent);

    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/requests/me", (req, res) => {
    const userId = req.query.userId;
    const incoming = db.prepare(`
      SELECT r.*, b.title as book_title, u.name as requester_name 
      FROM requests r 
      JOIN books b ON r.book_id = b.id 
      JOIN users u ON r.requester_id = u.id 
      WHERE r.owner_id = ?
    `).all(userId);
    
    const outgoing = db.prepare(`
      SELECT r.*, b.title as book_title, u.name as owner_name 
      FROM requests r 
      JOIN books b ON r.book_id = b.id 
      JOIN users u ON r.owner_id = u.id 
      WHERE r.requester_id = ?
    `).all(userId);

    res.json({ incoming, outgoing });
  });

  app.patch("/api/requests/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, req.params.id);
    
    const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id);
    if (status === 'accepted') {
        db.prepare("UPDATE books SET status = ? WHERE id = ?").run('unavailable', request.book_id);
    }

    res.json({ success: true });
  });

  // Messages
  app.get("/api/messages/:requestId", (req, res) => {
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.request_id = ?
      ORDER BY m.timestamp ASC
    `).all(req.params.requestId);
    res.json(messages);
  });

  app.get("/api/conversations", (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // Get unique requests where the user is either requester or owner
    const conversations = db.prepare(`
      SELECT DISTINCT 
        r.id as request_id,
        b.title as book_title,
        CASE WHEN r.requester_id = ? THEN u_owner.name ELSE u_req.name END as other_name,
        CASE WHEN r.requester_id = ? THEN u_owner.avatar ELSE u_req.avatar END as other_avatar,
        CASE WHEN r.requester_id = ? THEN r.owner_id ELSE r.requester_id END as other_id,
        (SELECT content FROM messages WHERE request_id = r.id ORDER BY timestamp DESC LIMIT 1) as last_message,
        (SELECT timestamp FROM messages WHERE request_id = r.id ORDER BY timestamp DESC LIMIT 1) as last_timestamp
      FROM requests r
      JOIN books b ON r.book_id = b.id
      JOIN users u_req ON r.requester_id = u_req.id
      JOIN users u_owner ON r.owner_id = u_owner.id
      WHERE r.requester_id = ? OR r.owner_id = ?
      ORDER BY last_timestamp DESC
    `).all(userId, userId, userId, userId, userId);

    res.json(conversations);
  });

  app.post("/api/messages", (req, res) => {
    const { request_id, sender_id, receiver_id, content } = req.body;
    db.prepare("INSERT INTO messages (request_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)")
      .run(request_id, sender_id, receiver_id, content);
    res.json({ success: true });
  });

  // Admin
  app.get("/api/admin/stats", (req, res) => {
    const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    const booksCount = db.prepare("SELECT COUNT(*) as count FROM books").get().count;
    const borrowsCount = db.prepare("SELECT COUNT(*) as count FROM requests WHERE type = 'borrow'").get().count;
    const tradesCount = db.prepare("SELECT COUNT(*) as count FROM requests WHERE type = 'trade'").get().count;
    res.json({ usersCount, booksCount, borrowsCount, tradesCount });
  });

  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
