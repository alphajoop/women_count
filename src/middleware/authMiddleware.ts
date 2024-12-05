import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Type guard to check if decoded is an object (JwtPayload)
    if (typeof decoded !== 'string') {
      (req as AuthenticatedRequest).user = {
        id: decoded.id,
        role: decoded.role,
        ...decoded,
      };
    }
    next();
  } catch (error) {
    res.clearCookie('adminToken');
    return res.redirect('/admin/login');
  }
};

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).render('error', { message: 'Accès non autorisé' });
  }
};
