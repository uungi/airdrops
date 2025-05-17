import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Airdrop schema - used for type consistency with Notion data
export const airdropSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  platform: z.string(),
  category: z.string(),
  status: z.string(),
  estimatedValue: z.string(),
  timing: z.string(),
  imageUrl: z.string(),
  featured: z.boolean(),
  website: z.string(),
  requirements: z.array(z.string()),
  steps: z.array(z.string()),
  createdAt: z.string()
});

export type Airdrop = z.infer<typeof airdropSchema>;

// Notion connection status schema
export const notionConnectionStatusSchema = z.object({
  notion_connected: z.boolean(),
  error: z.string().optional()
});

export type NotionConnectionStatus = z.infer<typeof notionConnectionStatusSchema>;

// Notion database schema
export const notionDatabaseSchema = z.object({
  id: z.string(),
  title: z.any(),
  properties: z.record(z.any())
});

export type NotionDatabase = z.infer<typeof notionDatabaseSchema>;
