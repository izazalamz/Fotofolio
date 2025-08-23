const fs = require('fs');
const path = require('path');

console.log('🔍 Fotofolio Backend Troubleshooting\n');

// Check 1: Node.js version
console.log('1️⃣ Checking Node.js version...');
const nodeVersion = process.version;
console.log(`   Node.js: ${nodeVersion}`);
if (parseInt(nodeVersion.slice(1).split('.')[0]) < 14) {
  console.log('   ⚠️  Warning: Node.js 14+ recommended');
} else {
  console.log('   ✅ Node.js version OK');
}

// Check 2: Dependencies
console.log('\n2️⃣ Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const requiredDeps = [
    'express', 'sqlite3', 'cors', 'helmet', 'morgan', 
    'multer', 'bcryptjs', 'jsonwebtoken', 'dotenv', 'express-validator'
  ];
  
  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: Missing`);
      allDepsPresent = false;
    }
  });
  
  if (allDepsPresent) {
    console.log('   ✅ All required dependencies present');
  } else {
    console.log('   ❌ Missing dependencies - run: npm install');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

// Check 3: Node modules
console.log('\n3️⃣ Checking node_modules...');
const nodeModulesPath = './node_modules';
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules directory exists');
  
  // Check if key modules are present
  const keyModules = ['express', 'sqlite3'];
  keyModules.forEach(module => {
    const modulePath = path.join(nodeModulesPath, module);
    if (fs.existsSync(modulePath)) {
      console.log(`   ✅ ${module} module found`);
    } else {
      console.log(`   ❌ ${module} module missing`);
    }
  });
} else {
  console.log('   ❌ node_modules directory missing - run: npm install');
}

// Check 4: Environment file
console.log('\n4️⃣ Checking environment configuration...');
const envPath = './config.env';
if (fs.existsSync(envPath)) {
  console.log('   ✅ config.env file exists');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        console.log(`   📝 ${key}: ${key === 'JWT_SECRET' ? '***' : value}`);
      }
    });
  } catch (error) {
    console.log('   ❌ Error reading config.env:', error.message);
  }
} else {
  console.log('   ❌ config.env file missing');
}

// Check 5: Database
console.log('\n5️⃣ Checking database...');
const dbPath = './database/fotofolio.db';
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log(`   ✅ Database file exists (${Math.round(stats.size / 1024)}KB)`);
} else {
  console.log('   ❌ Database file missing - run: npm run init-db');
}

// Check 6: Uploads directory
console.log('\n6️⃣ Checking uploads directory...');
const uploadsPath = './uploads';
if (fs.existsSync(uploadsPath)) {
  console.log('   ✅ Uploads directory exists');
} else {
  console.log('   ❌ Uploads directory missing');
}

// Check 7: Port availability
console.log('\n7️⃣ Checking port availability...');
const net = require('net');
const testPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
};

testPort(3000).then(available => {
  if (available) {
    console.log('   ✅ Port 3000 is available');
  } else {
    console.log('   ❌ Port 3000 is already in use');
    console.log('   💡 Try: npm run simple (uses dynamic route loading)');
  }
});

// Check 8: File permissions
console.log('\n8️⃣ Checking file permissions...');
try {
  const testFile = './test-permissions.tmp';
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('   ✅ Write permissions OK');
} catch (error) {
  console.log('   ❌ Write permission error:', error.message);
}

console.log('\n🔧 Troubleshooting complete!');
console.log('\n📋 Next steps:');
console.log('   1. If dependencies are missing: npm install');
console.log('   2. If database is missing: npm run init-db');
console.log('   3. Try starting server: npm run simple');
console.log('   4. Check console for error messages');
console.log('   5. Test basic routes: http://localhost:3000/health');
