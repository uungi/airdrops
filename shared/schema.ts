import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema (keeping the existing one)
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

// Airdrops schema
export const airdrops = pgTable("airdrops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("upcoming"), // "active", "upcoming", "ended"
  platform: text("platform").notNull(),
  estimatedValue: text("estimated_value"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  timing: text("timing"),
  imageUrl: text("image_url"),
  projectUrl: text("project_url"),
  featured: boolean("featured").notNull().default(false),
  notionId: text("notion_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertAirdropSchema = createInsertSchema(airdrops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAirdrop = z.infer<typeof insertAirdropSchema>;
export type Airdrop = typeof airdrops.$inferSelect;

// Types for Notion integration
export interface NotionConnectionStatus {
  notion_connected: boolean;
  page_id?: string;
  error?: string;
}

export interface NotionDatabase {
  id: string;
  title: any; // Using any for Notion's nested title structure
  properties: Record<string, any>;
  url: string;
  created_time: string;
  last_edited_time: string;
}
