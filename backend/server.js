const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const app = express();
const port = 3000;
const SECRET_KEY = "your_secret_key"; // 🔐 JWT用の秘密鍵（本番環境では.envに保存）


// SQLite3 データベースの接続（blog.db ファイル）
const db = new sqlite3.Database('./blog.db', (err) => {
  if (err) {
    console.error("SQLite3接続エラー:", err.message);
  } else {
    console.log("SQLite3に接続しました");
  }
});

// posts テーブルの作成（存在しない場合のみ）
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error("テーブル作成エラー:", err.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error("コメントテーブル作成エラー:", err.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companyName TEXT NOT NULL,
    industry TEXT,  -- 業界カラムを追加
    entryDate DATE,
    status TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("エントリーテーブル作成エラー:", err.message);
  });

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) console.error("テーブル作成エラー:", err.message);
    }
  );
});

// JSON 形式のリクエストボディを解析するミドルウェア
app.use(express.json());

/**
 * GET /api/posts
 * 全ての記事を取得
 */
app.get('/api/posts', (req, res) => {
  db.all("SELECT * FROM posts", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'サーバーエラー' });
    }
    res.json(rows);
  });
});

/**
 * GET /api/posts/:id
 * 指定した ID の記事を取得
 */
app.get('/api/posts/:id', (req, res) => {
  db.get("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'サーバーエラー' });
    }
    if (!row) {
      return res.status(404).json({ error: '記事が見つかりません' });
    }
    res.json(row);
  });
});

/**
 * POST /api/posts
 * 新規記事の作成
 */
app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'タイトルと内容は必須です' });
  }
  const sql = "INSERT INTO posts (title, content) VALUES (?, ?)";
  db.run(sql, [title, content], function(err) {
    if (err) {
      return res.status(500).json({ error: 'サーバーエラー' });
    }
    db.get("SELECT * FROM posts WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      res.status(201).json(row);
    });
  });
});

/**
 * GET /api/posts/:id/comments
 * 指定した記事のコメントを取得
 */
app.get('/api/posts/:id/comments', (req, res) => {
  db.all("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC", [req.params.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'サーバーエラー' });
    }
    res.json(rows);
  });
});

/**
 * POST /api/posts/:id/comments
 * 指定した記事にコメントを投稿
 */
app.post('/api/posts/:id/comments', (req, res) => {
  const { author = '匿名', content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'コメント内容は必須です' });
  }
  const sql = "INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)";
  db.run(sql, [req.params.id, author, content], function(err) {
    if (err) {
      return res.status(500).json({ error: 'サーバーエラー' });
    }
    db.get("SELECT * FROM comments WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      res.status(201).json(row);
    });
  });
});
/**
 * PUT /api/posts/:id
 * 指定したIDの記事を更新
 */
app.put('/api/posts/:id', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'タイトルと内容は必須です' });
    }
    const sql = "UPDATE posts SET title = ?, content = ? WHERE id = ?";
    db.run(sql, [title, content, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      res.json({ message: '記事を更新しました' });
    });
  });
  
/**
 * DELETE /api/posts
 * 複数の記事を削除
 */
app.delete('/api/posts', (req, res) => {
    const { ids } = req.body; // フロントエンドから削除対象のIDリストを受け取る
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '削除する記事を選択してください' });
    }
  
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM posts WHERE id IN (${placeholders})`;
  
    db.run(sql, ids, function (err) {
      if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      res.json({ message: `${this.changes} 件の記事を削除しました` });
    });
  });

  // 新規ユーザー登録 API
  app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "全ての項目を入力してください" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      function (err) {
        if (err) return res.status(501).json({ error: "登録したことのあるメールアドレスです" });
        res.status(201).json({ id: this.lastID, name, email });
      }
    );
  });
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "メールとパスワードを入力してください" });
  
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err || !user) return res.status(401).json({ error: "メールまたはパスワードが間違っています" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "メールまたはパスワードが間違っています" });
  
      const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
      res.json({ message: "ログイン成功", token });
    });
  });
  app.post('/api/entries', (req, res) => {
    const { companyName, industry, entryDate, status, notes } = req.body;
    if (!companyName) {
      return res.status(400).json({ error: '会社名は必須です' });
    }
    const sql = "INSERT INTO entries (companyName, industry, entryDate, status, notes) VALUES (?, ?, ?, ?, ?)";
    db.run(sql, [companyName, industry, entryDate, status, notes], function(err) {
        if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      db.get("SELECT * FROM entries WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'サーバーエラー' });
        }
        res.status(201).json(row);
      });
    });
  });

  app.get('/api/entries', (req, res) => {
    db.all("SELECT * FROM entries", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      res.json(rows);
    });
  });
/**
 * PUT /api/entries/:id
 * 指定したIDのエントリー情報を更新
 */
app.put('/api/entries/:id', (req, res) => {
    const { companyName, industry, entryDate, status, notes } = req.body;
    if (!companyName) {
      return res.status(400).json({ error: '会社名は必須です' });
    }
    const sql = "UPDATE entries SET companyName = ?, industry = ?, entryDate = ?, status = ?, notes = ? WHERE id = ?";
    db.run(sql, [companyName, industry, entryDate, status, notes, req.params.id], function(err) {
        if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      res.json({ message: 'エントリーを更新しました' });
    });
  });
  
  /**
   * DELETE /api/entries/:id
   * 指定したIDのエントリー情報を削除
   */
  app.delete('/api/entries/:id', (req, res) => {
    const sql = "DELETE FROM entries WHERE id = ?";
    db.run(sql, [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'サーバーエラー' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'エントリーが見つかりません' });
      }
      res.json({ message: 'エントリーを削除しました' });
    });
  });

  //  認証ミドルウェア（JWT トークン検証）
  const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "認証が必要です" });
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ error: "トークンが無効です" });
      req.user = user;
      next();
    });
  };

  // ✅ 4️⃣ ログインユーザー情報取得
app.get("/api/me", authenticateToken, (req, res) => {
    res.json(req.user);
  });

// app.get('/api/entries/:id/status', (req, res) => {
//   const sql = "SELECT status FROM entries WHERE id = ?";
//   db.get(sql, [req.params.id], (err, row) => {
//     if (err) {
//       return res.status(500).json({ error: 'サーバーエラー' });
//     }
//     if (!row) {
//       return res.status(404).json({ error: 'エントリーが見つかりません' });
//     }
//     res.json({ status: row.status });
//   });
// });

app.get('/api/entries/status', (req, res) => {
  const sql = "SELECT id, status FROM entries";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'サーバーエラー' });
    }
    res.json(rows);
  });
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーがポート ${port} で稼働中`);
});
// 
