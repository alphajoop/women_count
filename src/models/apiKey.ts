import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey extends Document {
  key: string;
  description: string;
  created_at: Date;
  last_used: Date;
  is_active: boolean;
}

const apiKeySchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  last_used: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
});

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
