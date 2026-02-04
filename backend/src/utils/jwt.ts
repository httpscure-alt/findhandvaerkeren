import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
};

export const verifyToken = (token: string): { userId: string; role: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
};
