import type { VercelRequest, VercelResponse } from '@vercel/node';
import { notion, NOTION_PAGE_ID } from './notion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.NOTION_INTEGRATION_SECRET) {
      return res.json({
        notion_connected: false,
        error: "NOTION_INTEGRATION_SECRET is not defined in your environment variables",
      });
    }

    if (!process.env.NOTION_PAGE_URL) {
      return res.json({
        notion_connected: false,
        error: "NOTION_PAGE_URL is not defined in your environment variables",
      });
    }

    // Test Notion API connection
    const response = await notion.users.list({});

    return res.json({
      notion_connected: true,
      page_id: NOTION_PAGE_ID,
    });
  } catch (error: any) {
    return res.json({
      notion_connected: false,
      error: error.message,
    });
  }
}