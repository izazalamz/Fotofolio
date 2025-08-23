const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test configuration
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpass123',
  first_name: 'Test',
  last_name: 'User'
};

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check:', healthResponse.data.message, '\n');

    // Test 2: Get Categories
    console.log('2. Testing Get Categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Categories:', categoriesResponse.data.categories.length, 'categories found\n');

    // Test 3: User Registration
    console.log('3. Testing User Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    authToken = registerResponse.data.token;
    console.log('✅ User registered:', registerResponse.data.user.username, '\n');

    // Test 4: User Login
    console.log('4. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ User logged in:', loginResponse.data.user.username, '\n');

    // Test 5: Get User Profile
    console.log('5. Testing Get User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.user.username, '\n');

    // Test 6: Get Users
    console.log('6. Testing Get Users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    console.log('✅ Users:', usersResponse.data.users.length, 'users found\n');

    // Test 7: Create Album
    console.log('7. Testing Create Album...');
    const albumResponse = await axios.post(`${BASE_URL}/albums`, {
      title: 'Test Album',
      description: 'A test album for testing purposes',
      is_public: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Album created:', albumResponse.data.album.title, '\n');

    // Test 8: Get Albums
    console.log('8. Testing Get Albums...');
    const albumsResponse = await axios.get(`${BASE_URL}/albums`);
    console.log('✅ Albums:', albumsResponse.data.albums.length, 'albums found\n');

    console.log('🎉 All tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('- Health check: ✅');
    console.log('- Categories: ✅');
    console.log('- User registration: ✅');
    console.log('- User login: ✅');
    console.log('- User profile: ✅');
    console.log('- Users list: ✅');
    console.log('- Album creation: ✅');
    console.log('- Albums list: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    console.error('Status:', error.response?.status);
    console.error('Details:', error.response?.data);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000/health');
    console.log('✅ Server is running, starting tests...\n');
    await testAPI();
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first:');
    console.error('   npm run dev');
    console.error('\nThen run this test script:');
    console.error('   node test-api.js');
  }
}

// Run the test
checkServer();
