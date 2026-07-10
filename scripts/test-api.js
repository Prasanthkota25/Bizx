const axios = require('axios');

const base = process.env.API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function test() {
  const url = base.replace(/\/$/, '') + '/health';
  console.log('Testing API URL:', url);
  try {
    const res = await axios.get(url);
    console.log('OK', res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response error', err.response.status, err.response.data);
    } else {
      console.error('Request error', err.message);
    }
    process.exitCode = 1;
  }
}

test();
