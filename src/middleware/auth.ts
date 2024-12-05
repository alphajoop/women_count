import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { validateApiKey } from '../services/apiKeyService';

export const authenticateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    res.status(401).json({ error: 'Clé API manquante' });
    return;
  }

  try {
    const isValid = await validateApiKey(apiKey);
    if (!isValid) {
      res.status(403).json({ error: 'Clé API invalide ou inactive' });
      return;
    }

    req.apiKey = apiKey;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la validation de la clé API' });
  }
};
