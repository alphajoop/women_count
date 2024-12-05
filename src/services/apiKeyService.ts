import crypto from 'crypto';
import { ApiKey, IApiKey } from '../models/apiKey';

export const generateApiKey = async (description: string): Promise<IApiKey> => {
  const key = crypto.randomBytes(32).toString('hex');
  const apiKey = new ApiKey({
    key,
    description,
  });
  await apiKey.save();
  return apiKey;
};

export const validateApiKey = async (key: string): Promise<boolean> => {
  const apiKey = await ApiKey.findOne({ key, is_active: true });
  if (apiKey) {
    apiKey.last_used = new Date();
    await apiKey.save();
    return true;
  }
  return false;
};

export const deactivateApiKey = async (key: string): Promise<void> => {
  await ApiKey.updateOne({ key }, { is_active: false });
};

export const deleteApiKeyPermanently = async (key: string): Promise<void> => {
  await ApiKey.deleteOne({ key });
};

export const listApiKeys = async (): Promise<IApiKey[]> => {
  return ApiKey.find().sort({ created_at: -1 });
};
