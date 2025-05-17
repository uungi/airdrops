import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAirdropsFromNotion } from '../server/notion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const airdrops = await getAirdropsFromNotion();
    return res.json({ airdrops });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}