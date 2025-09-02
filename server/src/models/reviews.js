function ensureReviewSchema(db) {
  // Check if Review table exists and has the required structure
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='Review'
  `).get();

  if (!tableExists) {
    // Create the table if it doesn't exist
    db.exec(`
      CREATE TABLE Review (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL UNIQUE,
        client_id INTEGER NOT NULL,
        photographer_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES Client(client_id) ON DELETE CASCADE,
        FOREIGN KEY (photographer_id) REFERENCES Photographer(photographer_id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_review_photographer_id ON Review(photographer_id);
    `);
  } else {
    // Table exists, ensure the index exists
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_review_photographer_id ON Review(photographer_id);
    `);
  }
}

module.exports = { ensureReviewSchema };
