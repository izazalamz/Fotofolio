PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS User (
  user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('client','photographer','admin')),
  name          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Client (
  client_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER NOT NULL UNIQUE REFERENCES User(user_id) ON DELETE CASCADE,
  phone     TEXT
);

CREATE TABLE IF NOT EXISTS Photographer (
  photographer_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL UNIQUE REFERENCES User(user_id) ON DELETE CASCADE,
  phone             TEXT,
  specialization    TEXT,
  location          TEXT,
  profile_image_url TEXT
);

CREATE TABLE IF NOT EXISTS Booking (
  booking_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id       INTEGER NOT NULL REFERENCES Client(client_id) ON DELETE CASCADE,
  photographer_id INTEGER REFERENCES Photographer(photographer_id),
  event_date      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'OPEN'
                  CHECK (status IN ('OPEN','IN_REVIEW','LOCKED','COMPLETED','CANCELLED')),
  location        TEXT,
  event_type      TEXT,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Booking_Application (
  application_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id      INTEGER NOT NULL REFERENCES Booking(booking_id) ON DELETE CASCADE,
  photographer_id INTEGER NOT NULL REFERENCES Photographer(photographer_id) ON DELETE CASCADE,
  application_date TEXT NOT NULL DEFAULT (datetime('now')),
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','ACCEPTED','REJECTED','WITHDRAWN')),
  UNIQUE (booking_id, photographer_id)
);

CREATE TABLE IF NOT EXISTS Payment (
  payment_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id    INTEGER NOT NULL UNIQUE REFERENCES Booking(booking_id) ON DELETE CASCADE,
  amount        REAL NOT NULL DEFAULT 0,
  payment_date  TEXT,
  payment_method TEXT,
  status        TEXT NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PAID'))
);

CREATE TABLE IF NOT EXISTS Portfolio (
  portfolio_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  photographer_id INTEGER NOT NULL REFERENCES Photographer(photographer_id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  image_url      TEXT NOT NULL,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Review (
  review_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id      INTEGER NOT NULL UNIQUE REFERENCES Booking(booking_id) ON DELETE CASCADE,
  client_id       INTEGER NOT NULL REFERENCES Client(client_id) ON DELETE CASCADE,
  photographer_id INTEGER NOT NULL REFERENCES Photographer(photographer_id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  review_date     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_booking_status_date ON Booking(status, event_date);
CREATE INDEX IF NOT EXISTS idx_application_booking ON Booking_Application(booking_id, status);
CREATE INDEX IF NOT EXISTS idx_portfolio_photographer ON Portfolio(photographer_id);



