
import { type Request, Response } from "express";
import { checkNotionConnection } from "../../notion";

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = await checkNotionConnection();
    res.json({
      notion_connected: status.connected,
      error: status.error
    });
  } catch (error: any) {
    res.status(500).json({
      notion_connected: false,
      error: error.message || "Failed to check Notion connection"
    });
  }
}
