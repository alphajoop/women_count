import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  user?: {
    id?: string;
    role?: string;
    [key: string]: any;
  };
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}
