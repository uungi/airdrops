import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { users, airdrops, type User, type InsertUser, type Airdrop, type InsertAirdrop } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Airdrop methods
  getAllAirdrops(): Promise<Airdrop[]>;
  getFeaturedAirdrops(): Promise<Airdrop[]>;
  getAirdropById(id: number): Promise<Airdrop | undefined>;
  createAirdrop(airdrop: InsertAirdrop): Promise<Airdrop>;
  updateAirdrop(id: number, airdrop: Partial<InsertAirdrop>): Promise<Airdrop | undefined>;
  deleteAirdrop(id: number): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  private db;

  constructor() {
    // Connect to the database using Supabase connection string via Drizzle
    const sql = neon(process.env.DATABASE_URL || "");
    this.db = drizzle(sql);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(({ id: userId }) => userId.eq(id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(({ username: un }) => un.eq(username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Airdrop methods
  async getAllAirdrops(): Promise<Airdrop[]> {
    return await this.db.select().from(airdrops).orderBy(({ createdAt }) => createdAt.desc());
  }

  async getFeaturedAirdrops(): Promise<Airdrop[]> {
    return await this.db.select().from(airdrops).where(({ featured: f }) => f.eq(true)).orderBy(({ createdAt }) => createdAt.desc());
  }

  async getAirdropById(id: number): Promise<Airdrop | undefined> {
    const result = await this.db.select().from(airdrops).where(({ id: airdropId }) => airdropId.eq(id)).limit(1);
    return result[0];
  }

  async createAirdrop(airdropData: InsertAirdrop): Promise<Airdrop> {
    const result = await this.db.insert(airdrops).values(airdropData).returning();
    return result[0];
  }

  async updateAirdrop(id: number, airdropData: Partial<InsertAirdrop>): Promise<Airdrop | undefined> {
    const result = await this.db
      .update(airdrops)
      .set({ ...airdropData, updatedAt: new Date() })
      .where(({ id: airdropId }) => airdropId.eq(id))
      .returning();
    return result[0];
  }

  async deleteAirdrop(id: number): Promise<boolean> {
    const result = await this.db
      .delete(airdrops)
      .where(({ id: airdropId }) => airdropId.eq(id))
      .returning({ id });
    return result.length > 0;
  }
}

// For fallback or testing
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private airdropsMap: Map<number, Airdrop>;
  private currentUserId: number;
  private currentAirdropId: number;

  constructor() {
    this.usersMap = new Map();
    this.airdropsMap = new Map();
    this.currentUserId = 1;
    this.currentAirdropId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }

  // Airdrop methods
  async getAllAirdrops(): Promise<Airdrop[]> {
    return Array.from(this.airdropsMap.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getFeaturedAirdrops(): Promise<Airdrop[]> {
    return Array.from(this.airdropsMap.values())
      .filter(airdrop => airdrop.featured)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAirdropById(id: number): Promise<Airdrop | undefined> {
    return this.airdropsMap.get(id);
  }

  async createAirdrop(airdropData: InsertAirdrop): Promise<Airdrop> {
    const id = this.currentAirdropId++;
    const airdrop: Airdrop = { 
      ...airdropData, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.airdropsMap.set(id, airdrop);
    return airdrop;
  }

  async updateAirdrop(id: number, airdropData: Partial<InsertAirdrop>): Promise<Airdrop | undefined> {
    const airdrop = this.airdropsMap.get(id);
    if (!airdrop) return undefined;
    
    const updatedAirdrop = { 
      ...airdrop, 
      ...airdropData, 
      updatedAt: new Date() 
    };
    this.airdropsMap.set(id, updatedAirdrop);
    return updatedAirdrop;
  }

  async deleteAirdrop(id: number): Promise<boolean> {
    return this.airdropsMap.delete(id);
  }
}

// Initialize storage based on environment
export const storage = process.env.DATABASE_URL 
  ? new SupabaseStorage() 
  : new MemStorage();
