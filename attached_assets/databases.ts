
import { type Request, Response } from "express";
import { getNotionDatabases } from "../../notion";

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const databases = await getNotionDatabases();
    res.json({ databases });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch Notion databases"
    });
  }
}
