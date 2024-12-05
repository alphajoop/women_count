import dotenv from 'dotenv';
import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authenticateApiKey } from './middleware/auth';
import { authenticateAdmin } from './middleware/adminAuth';
import { ApiResponse } from './types';
import { connectDB } from './db/db';
import {
  renderLoginPage,
  login,
  logout,
  renderDashboard,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  listApiKeys,
} from './controllers/adminController';
import { WomenCountController } from './controllers/womenCountController';

dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();

// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuration CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  })
);

// Middleware pour parser le JSON, les form data et les cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes d'authentification admin
app.get('/admin/login', renderLoginPage);
app.post('/admin/login', login);
app.post('/admin/logout', logout);

// Routes admin protégées
app.get('/admin/dashboard', authenticateAdmin, renderDashboard);
app.post('/admin/api-keys/create', authenticateAdmin, createApiKey);
app.delete('/admin/api-keys/:key', authenticateAdmin, deleteApiKey);
app.post('/admin/api-keys/:key/revoke', authenticateAdmin, revokeApiKey);
app.get('/admin/api-keys', authenticateAdmin, listApiKeys);

// Routes Women Count protégées par clé API
app.post('/api/women', authenticateApiKey, WomenCountController.createWoman);
app.get('/api/women', authenticateApiKey, WomenCountController.getWomen);
app.get(
  '/api/women/:id',
  authenticateApiKey,
  WomenCountController.getWomanById
);
app.put('/api/women/:id', authenticateApiKey, WomenCountController.updateWoman);
app.delete(
  '/api/women/:id',
  authenticateApiKey,
  WomenCountController.deleteWoman
);
app.get('/api/statistiques', authenticateApiKey, WomenCountController.getStats);

// Route publique
app.get('/api', (req: Request, res: Response) => {
  const response: ApiResponse = {
    message: "Bienvenue sur l'API Women Count Sénégal",
    data: {
      description:
        'Accédez aux données statistiques sur les femmes au Sénégal via notre API sécurisée',
      endpoints: [
        '/api/women - Gestion des données des femmes (GET, POST)',
        '/api/women/:id - Opérations sur une femme spécifique (GET, PUT, DELETE)',
        '/api/stats - Statistiques détaillées',
      ],
      documentation: 'Programme Women Count - ONU Femmes Sénégal',
    },
  };
  res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Serveur Women Count démarré sur le port ${PORT}`);
});
