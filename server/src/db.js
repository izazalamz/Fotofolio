const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

module.exports = db;



