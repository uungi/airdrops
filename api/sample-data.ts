import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addSampleAirdrops } from './notion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await addSampleAirdrops();
    return res.json({ 
      success: true, 
      message: "Sample airdrops have been added to your Notion database" 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}