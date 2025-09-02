function ensurePortfolioSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS PhotographerPortfolioImage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photographer_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      caption TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (photographer_id) REFERENCES Photographer(photographer_id) ON DELETE CASCADE
    );
  `);
}

module.exports = { ensurePortfolioSchema };
