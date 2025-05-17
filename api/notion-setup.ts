import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAirdropsDatabase } from './notion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const database = await createAirdropsDatabase();
    return res.json({ success: true, database });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}