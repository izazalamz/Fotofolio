const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

const dbPath = path.join(dataDir, 'app.db');
console.log(`Using database at: ${dbPath}`);

// Check if database already exists
if (fs.existsSync(dbPath)) {
  console.log('⚠️  Database file already exists. Will attempt to recreate tables.');
}

// Read schema file
const schemaPath = path.join(__dirname, 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found:', schemaPath);
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');
console.log('✓ Schema file loaded');

// Create database and run schema
let db;
try {
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  console.log('✓ Database connection established');
} catch (error) {
  console.error('❌ Failed to create database:', error.message);
  process.exit(1);
}

// Drop existing tables if they exist (to avoid conflicts)
console.log('\nCleaning existing tables...');
const dropTables = [
  'DROP TABLE IF EXISTS Review',
  'DROP TABLE IF EXISTS Portfolio', 
  'DROP TABLE IF EXISTS Payment',
  'DROP TABLE IF EXISTS Booking_Application',
  'DROP TABLE IF EXISTS Booking',
  'DROP TABLE IF EXISTS Photographer',
  'DROP TABLE IF EXISTS Client',
  'DROP TABLE IF EXISTS User'
];

dropTables.forEach((dropStmt, index) => {
  try {
    db.exec(dropStmt);
    console.log(`✓ Dropped table ${index + 1}`);
  } catch (error) {
    console.log(`⚠️  Could not drop table ${index + 1}:`, error.message);
  }
});

// Split schema into individual statements and execute
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`\nExecuting ${statements.length} schema statements...`);

statements.forEach((statement, index) => {
  try {
    if (statement.trim()) {
      db.exec(statement);
      console.log(`✓ Schema statement ${index + 1}`);
    }
  } catch (error) {
    console.error(`✗ Error in schema statement ${index + 1}:`, error.message);
    console.error('Statement:', statement.substring(0, 100) + '...');
  }
});

// Check if seed file exists and run it
const seedPath = path.join(__dirname, 'seed.sql');
if (fs.existsSync(seedPath)) {
  console.log('\nRunning seed data...');
  const seed = fs.readFileSync(seedPath, 'utf8');
  
  // Better parsing for seed data - extract INSERT statements
  const insertStatements = [];
  const lines = seed.split('\n');
  let currentStatement = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comment-only lines
    if (!trimmedLine || trimmedLine.startsWith('--')) {
      continue;
    }
    
    // If line contains INSERT, start collecting
    if (trimmedLine.toUpperCase().includes('INSERT')) {
      currentStatement = trimmedLine;
    } else if (currentStatement) {
      // Continue building the statement
      currentStatement += ' ' + trimmedLine;
    }
    
    // If statement ends with semicolon, save it
    if (currentStatement && currentStatement.endsWith(';')) {
      insertStatements.push(currentStatement);
      currentStatement = '';
    }
  }

  console.log(`Executing ${insertStatements.length} INSERT statements...`);

  insertStatements.forEach((statement, index) => {
    try {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      db.exec(statement);
      console.log(`✓ Seed statement ${index + 1}`);
    } catch (error) {
      console.error(`✗ Error in seed statement ${index + 1}:`, error.message);
      console.error('Statement:', statement.substring(0, 100) + '...');
    }
  });
} else {
  console.log('\n⚠️  Seed file not found, skipping seed data');
}

// Verify tables were created
try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📋 Created tables:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
} catch (error) {
  console.error('❌ Error checking tables:', error.message);
}

// Verify some data was inserted
try {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM User").get();
  const clientCount = db.prepare("SELECT COUNT(*) as count FROM Client").get();
  const photographerCount = db.prepare("SELECT COUNT(*) as count FROM Photographer").get();
  const bookingCount = db.prepare("SELECT COUNT(*) as count FROM Booking").get();
  
  console.log('\n📊 Data summary:');
  console.log(`  - Users: ${userCount.count}`);
  console.log(`  - Clients: ${clientCount.count}`);
  console.log(`  - Photographers: ${photographerCount.count}`);
  console.log(`  - Bookings: ${bookingCount.count}`);
} catch (error) {
  console.error('❌ Error checking data:', error.message);
}

db.close();
console.log('\n✅ Database initialization complete!');
console.log(`Database file: ${dbPath}`);
console.log('\nYou can now start the server with: npm run dev');
