import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: { email: string; role: string };
}

export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.adminToken;

  if (!token) {
    res.status(401).json({ error: 'Token manquant' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      role: string;
    };
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token invalide' });
  }
};
