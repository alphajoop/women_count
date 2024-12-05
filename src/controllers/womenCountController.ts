import { Request, Response } from 'express';
import { WomenCountService } from '../services/womenCountService';
import {
  CreateWomanDto,
  UpdateWomanDto,
  QueryFilters,
} from '../types/womenTypes';

export const WomenCountController = {
  async createWoman(req: Request, res: Response): Promise<Response> {
    try {
      const womanData: CreateWomanDto = req.body;
      const woman = await WomenCountService.createWoman(womanData);
      return res.status(201).json(woman);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getWomen(req: Request, res: Response): Promise<Response> {
    try {
      const filters: QueryFilters = req.query;
      const women = await WomenCountService.getWomen(filters);
      return res.json(women);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getWomanById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const woman = await WomenCountService.getWomanById(id);

      if (!woman) {
        return res.status(404).json({ error: 'Femme non trouvée' });
      }

      return res.json(woman);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async updateWoman(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData: UpdateWomanDto = req.body;
      const woman = await WomenCountService.updateWoman(id, updateData);

      if (!woman) {
        return res.status(404).json({ error: 'Femme non trouvée' });
      }

      return res.json(woman);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async deleteWoman(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const deletedWoman = await WomenCountService.deleteWoman(id);

      if (!deletedWoman) {
        return res.status(404).json({ error: 'Femme non trouvée' });
      }

      return res.status(200).json({ message: 'Femme supprimée avec succès' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await WomenCountService.getStats();
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
};
