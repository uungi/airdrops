import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { notion, NOTION_PAGE_ID, getNotionDatabases, findDatabaseByTitle, createAirdropsDatabase, getAirdropsFromNotion, addSampleAirdrops } from "./notion";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notion status endpoint
  app.get("/api/notion/status", async (req, res) => {
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
      await notion.users.me();

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
  });

  // Get Notion databases
  app.get("/api/notion/databases", async (req, res) => {
    try {
      const databases = await getNotionDatabases();
      return res.json({ databases });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create Notion Airdrops database
  app.post("/api/notion/setup", async (req, res) => {
    try {
      const database = await createAirdropsDatabase();
      return res.json({ success: true, database });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Add sample airdrops data
  app.post("/api/notion/sample-data", async (req, res) => {
    try {
      await addSampleAirdrops();
      return res.json({ 
        success: true, 
        message: "Sample airdrops have been added to your Notion database" 
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // CORS test endpoint
  app.get("/api/notion/test-cors", (req, res) => {
    return res.json({ success: true });
  });

  // Get featured airdrops
  app.get("/api/airdrops/featured", async (req, res) => {
    try {
      const airdrops = await getAirdropsFromNotion(true);
      return res.json({ airdrops });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all airdrops
  app.get("/api/airdrops", async (req, res) => {
    try {
      const airdrops = await getAirdropsFromNotion();
      return res.json({ airdrops });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
