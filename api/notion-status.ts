import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from "@notionhq/client";

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_SECRET,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
  const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
  if (match && match[1]) {
    return match[1];
  }

  throw Error("Failed to extract page ID from Notion page URL");
}

const NOTION_PAGE_ID = process.env.NOTION_PAGE_URL 
  ? extractPageIdFromUrl(process.env.NOTION_PAGE_URL)
  : "";

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