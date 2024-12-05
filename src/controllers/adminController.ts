import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  generateApiKey,
  deactivateApiKey,
  deleteApiKeyPermanently,
  listApiKeys as getApiKeys,
} from '../services/apiKeyService';

interface ApiKey {
  key: string;
  description: string;
  created_at: string;
  is_active: boolean;
}

export const renderLoginPage = (req: Request, res: Response): void => {
  res.render('admin/login');
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (email !== process.env.ADMIN_EMAIL) {
      res.status(401).render('admin/login', { error: 'Email invalide' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH!
    );

    if (!isPasswordValid) {
      res.status(401).render('admin/login', { error: 'Mot de passe invalide' });
      return;
    }

    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.redirect('/admin/dashboard');
  } catch (error) {
    res
      .status(500)
      .render('admin/login', { error: 'Erreur lors de la connexion' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
};

export const renderDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apiKeys = await getApiKeys();
    res.render('admin/dashboard', { apiKeys });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Erreur lors du chargement du tableau de bord',
    });
  }
};

export const createApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const description =
      typeof req.body.description === 'string'
        ? req.body.description
        : 'Default API Key';
    const newApiKey = await generateApiKey(description);

    res.status(201).json({
      message: 'API Key generated successfully',
      apiKey: newApiKey,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to generate API key',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const revokeApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { key } = req.params;
  try {
    await deactivateApiKey(key);
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).render('error', {
      message: 'Erreur lors de la révocation de la clé API',
    });
  }
};

export const deleteApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { key } = req.params;
    await deleteApiKeyPermanently(key);
    res.status(200).json({
      message: 'API Key deleted permanently',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete API key',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listApiKeys = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apiKeys = await getApiKeys();
    res.json({ apiKeys });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des clés API' });
  }
};

export const adminController = {
  renderLoginPage,
  login,
  logout,
  renderDashboard,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  listApiKeys,
};
