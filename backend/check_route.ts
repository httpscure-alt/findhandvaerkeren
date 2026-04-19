import jwt from 'jsonwebtoken';
import https from 'https';

// 1. Generate a mock SUPERADMIN token using the local JWT_SECRET
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign(
  { userId: 'test_superadmin_id', role: 'SUPERADMIN' },
  process.env.JWT_SECRET || 'fallback-secret'
);

console.log("Token:", token.substring(0, 20) + "...");

// 2. Make the POST request to the production URL
const data = JSON.stringify({
  email: 'test_auto_' + Date.now() + '@example.com',
  password: 'Password123!',
  companyName: 'Test Route Company',
  category: 'tomrer',
  location: 'København'
});

const options = {
  hostname: 'findhandvaerkeren.onrender.com',
  port: 443,
  path: '/api/admin/onboard',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let responseData = '';
  res.on('data', (d) => { responseData += d; });
  res.on('end', () => { console.log('Response:', responseData); });
});

req.on('error', (error) => { console.error('Error:', error); });
req.write(data);
req.end();
