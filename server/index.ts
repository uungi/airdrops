import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

// Initialize Express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// CORS middleware for Vercel deployment
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

// Initialize server
const initServer = async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // Configure server based on environment
  const isVercel = process.env.VERCEL === "1";
  const isDev = app.get("env") === "development";

  if (isDev) {
    // Development environment - use Vite for HMR
    await setupVite(app, server);
  } else {
    // Production environment - serve static files
    const staticPath = path.join(process.cwd(), "dist/public");
    app.use(express.static(staticPath));
    app.get("*", (req, res) => {
      // Skip API routes
      if (req.path.startsWith("/api")) return next();
      // Serve index.html for all other routes
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  // In Vercel serverless environment, we export the app
  if (isVercel) {
    log("Running in Vercel serverless environment");
    return app;
  }

  // For local development or other environments, start the server
  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on port ${port}`);
  });

  return app;
};

// Execute the server initialization
const serverPromise = initServer();

// Export for Vercel serverless functions
export default async (req: Request, res: Response) => {
  const app = await serverPromise;
  return app(req, res);
};
