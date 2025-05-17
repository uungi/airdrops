import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  checkNotionConnection, 
  getNotionDatabases, 
  setupAirdropsDatabase,
  addSampleAirdrops,
  getAirdrops,
  getFeaturedAirdrops
} from "./notion";

export const handler = async function registerRoutes(app: Express): Promise<Server> {
  // API routes for Notion integration

  // Check Notion connection status
  app.get('/api/notion/status', async (req, res) => {
    try {
      const status = await checkNotionConnection();
      res.json({
        notion_connected: status.connected,
        error: status.error
      });
    } catch (error: any) {
      console.error("Error checking Notion status:", error);
      res.status(500).json({
        notion_connected: false,
        error: error.message || "Failed to check Notion connection"
      });
    }
  });

  // Get all databases from Notion
  app.get('/api/notion/databases', async (req, res) => {
    try {
      const databases = await getNotionDatabases();
      res.json({ databases });
    } catch (error: any) {
      console.error("Error fetching Notion databases:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch Notion databases"
      });
    }
  });

  // Setup Airdrops database in Notion
  app.post('/api/notion/setup', async (req, res) => {
    try {
      // Setup the Airdrops database
      const db = await setupAirdropsDatabase();
      res.json({
        success: true,
        database_id: db.id,
        message: "Airdrops database created successfully"
      });
    } catch (error: any) {
      console.error("Error setting up Notion database:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to setup Notion database"
      });
    }
  });

  // Add sample airdrops to the database
  app.post('/api/notion/sample-data', async (req, res) => {
    try {
      const result = await addSampleAirdrops();
      res.json({
        success: true,
        message: `Added ${result.count} sample airdrops successfully`
      });
    } catch (error: any) {
      console.error("Error adding sample data:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to add sample airdrops"
      });
    }
  });

  // Get all airdrops
  app.get('/api/airdrops', async (req, res) => {
    try {
      const airdrops = await getAirdrops();
      res.json({ airdrops });
    } catch (error: any) {
      console.error("Error fetching airdrops:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch airdrops"
      });
    }
  });

  // Get featured airdrops
  app.get('/api/airdrops/featured', async (req, res) => {
    try {
      const airdrops = await getFeaturedAirdrops();
      res.json({ airdrops });
    } catch (error: any) {
      console.error("Error fetching featured airdrops:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch featured airdrops"
      });
    }
  });

  // Test CORS configuration
  app.options('/api/notion/test-cors', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(200).end();
  });

  app.get('/api/notion/test-cors', (req, res) => {
    res.json({ success: true, message: "CORS configuration is working correctly" });
  });

  // Get recent error logs
  app.get('/api/notion/logs', (req, res) => {
    // In a real application, you would fetch logs from a logging service
    // For this example, we'll return mock logs to demonstrate the API structure
    res.json({
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: "info",
          message: "API endpoint accessed",
          details: "GET /api/notion/logs"
        }
      ]
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}