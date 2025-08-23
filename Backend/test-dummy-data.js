const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'fotofolio.db');
const db = new sqlite3.Database(dbPath);

console.log('Testing dummy data in database...\n');

// Test function to display data from a table
function displayTableData(tableName, columns = '*') {
  return new Promise((resolve, reject) => {
    db.all(`SELECT ${columns} FROM ${tableName} LIMIT 10`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log(`\n=== ${tableName.toUpperCase()} TABLE (showing up to 10 rows) ===`);
        console.table(rows);
        resolve(rows);
      }
    });
  });
}

// Test function to count records in a table
function countTableRecords(tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
}

async function testDatabase() {
  try {
    // Count records in each table
    console.log('=== DATABASE RECORD COUNTS ===');
    const tables = ['users', 'categories', 'albums', 'photos', 'comments', 'likes', 'tags', 'photo_tags', 'followers'];
    
    for (const table of tables) {
      const count = await countTableRecords(table);
      console.log(`${table}: ${count} records`);
    }

    // Display sample data from each table
    await displayTableData('users', 'id, username, first_name, last_name, is_verified');
    await displayTableData('categories', 'id, name');
    await displayTableData('albums', 'id, title, user_id, is_public');
    await displayTableData('photos', 'id, title, user_id, category_id, views_count');
    await displayTableData('comments', 'id, content, user_id, photo_id');
    await displayTableData('likes', 'id, user_id, photo_id');
    await displayTableData('tags', 'id, name');
    await displayTableData('photo_tags', 'photo_id, tag_id');
    await displayTableData('followers', 'follower_id, following_id');

    // Test some relationships
    console.log('\n=== SAMPLE RELATIONSHIPS ===');
    
    // Show photos with their categories and users
    db.all(`
      SELECT p.title, p.views_count, c.name as category, u.username as photographer
      FROM photos p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LIMIT 5
    `, (err, rows) => {
      if (err) {
        console.error('Error querying relationships:', err);
      } else {
        console.log('\nPhotos with categories and photographers:');
        console.table(rows);
      }
    });

    // Show albums with photo counts
    db.all(`
      SELECT a.title, a.description, u.username as owner, COUNT(p.id) as photo_count
      FROM albums a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN photos p ON a.id = p.album_id
      GROUP BY a.id
      LIMIT 5
    `, (err, rows) => {
      if (err) {
        console.error('Error querying albums:', err);
      } else {
        console.log('\nAlbums with photo counts:');
        console.table(rows);
      }
    });

    // Show user statistics
    db.all(`
      SELECT 
        u.username,
        COUNT(DISTINCT p.id) as photos_count,
        COUNT(DISTINCT a.id) as albums_count,
        COUNT(DISTINCT f.following_id) as following_count,
        COUNT(DISTINCT f2.follower_id) as followers_count
      FROM users u
      LEFT JOIN photos p ON u.id = p.user_id
      LEFT JOIN albums a ON u.id = a.user_id
      LEFT JOIN followers f ON u.id = f.follower_id
      LEFT JOIN followers f2 ON u.id = f2.following_id
      GROUP BY u.id
      LIMIT 5
    `, (err, rows) => {
      if (err) {
        console.error('Error querying user stats:', err);
      } else {
        console.log('\nUser statistics:');
        console.table(rows);
      }
    });

  } catch (error) {
    console.error('Error testing database:', error);
  }
}

// Run the test
testDatabase().then(() => {
  // Close database after a delay to allow async queries to complete
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase test completed successfully!');
      }
    });
  }, 2000);
});
