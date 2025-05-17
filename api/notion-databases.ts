import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getNotionDatabases } from './notion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const databases = await getNotionDatabases();
    return res.json({ databases });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}