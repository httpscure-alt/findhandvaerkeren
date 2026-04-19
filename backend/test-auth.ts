import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: 'test_superadmin_id', role: 'SUPERADMIN' },
  process.env.JWT_SECRET || 'your-super-secret-jwt-key'
);
console.log(token);
