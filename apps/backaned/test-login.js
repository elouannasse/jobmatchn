const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:4000/auth/login', {
      email: 'elouannassez@gmail.com',
      password: 'DYABLO2009'
    });
    console.log('Login successful!');
    console.log('Token received:', response.data.accessToken.substring(0, 20) + '...');
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin();
