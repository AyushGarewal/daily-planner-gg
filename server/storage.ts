import { 
  users, customCategories, dailyReflections, challenges, projectNotes,
  type User, type InsertUser, 
  type CustomCategory, type InsertCustomCategory,
  type DailyReflection, type InsertDailyReflection,
  type Challenge, type InsertChallenge,
  type ProjectNote, type InsertProjectNote
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Custom categories
  getCustomCategories(): Promise<CustomCategory[]>;
  createCustomCategory(category: InsertCustomCategory): Promise<CustomCategory>;
  
  // Daily reflections
  getDailyReflections(userId: string): Promise<DailyReflection[]>;
  getDailyReflectionByDate(userId: string, date: string): Promise<DailyReflection | undefined>;
  createDailyReflection(reflection: InsertDailyReflection): Promise<DailyReflection>;
  updateDailyReflection(id: string, updates: Partial<DailyReflection>): Promise<DailyReflection>;
  
  // Challenges
  getChallenges(userId: string): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge>;
  
  // Project notes
  getProjectNotes(userId: string, projectId?: string): Promise<ProjectNote[]>;
  createProjectNote(note: InsertProjectNote): Promise<ProjectNote>;
  updateProjectNote(id: string, updates: Partial<ProjectNote>): Promise<ProjectNote>;
  
  // Data reset
  resetUserData(userId: string): Promise<void>;
}

import { db } from "./db";
import { eq, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Database error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Custom categories
  async getCustomCategories(): Promise<CustomCategory[]> {
    return await db.select().from(customCategories).orderBy(customCategories.name);
  }

  async createCustomCategory(category: InsertCustomCategory): Promise<CustomCategory> {
    const result = await db.insert(customCategories).values(category).returning();
    return result[0];
  }

  // Daily reflections
  async getDailyReflections(userId: string): Promise<DailyReflection[]> {
    return await db.select().from(dailyReflections)
      .where(eq(dailyReflections.userId, userId))
      .orderBy(dailyReflections.reflectionDate);
  }

  async getDailyReflectionByDate(userId: string, date: string): Promise<DailyReflection | undefined> {
    const result = await db.select().from(dailyReflections)
      .where(and(
        eq(dailyReflections.userId, userId),
        eq(dailyReflections.reflectionDate, date)
      ))
      .limit(1);
    return result[0];
  }

  async createDailyReflection(reflection: InsertDailyReflection): Promise<DailyReflection> {
    const result = await db.insert(dailyReflections).values(reflection).returning();
    return result[0];
  }

  async updateDailyReflection(id: string, updates: Partial<DailyReflection>): Promise<DailyReflection> {
    const result = await db.update(dailyReflections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dailyReflections.id, id))
      .returning();
    return result[0];
  }

  // Challenges
  async getChallenges(userId: string): Promise<Challenge[]> {
    return await db.select().from(challenges)
      .where(eq(challenges.userId, userId))
      .orderBy(challenges.createdAt);
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const result = await db.insert(challenges).values(challenge).returning();
    return result[0];
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    const result = await db.update(challenges)
      .set(updates)
      .where(eq(challenges.id, id))
      .returning();
    return result[0];
  }

  // Project notes
  async getProjectNotes(userId: string, projectId?: string): Promise<ProjectNote[]> {
    if (projectId) {
      return await db.select().from(projectNotes)
        .where(and(
          eq(projectNotes.userId, userId),
          eq(projectNotes.projectId, projectId)
        ))
        .orderBy(projectNotes.createdAt);
    }
    
    return await db.select().from(projectNotes)
      .where(eq(projectNotes.userId, userId))
      .orderBy(projectNotes.createdAt);
  }

  async createProjectNote(note: InsertProjectNote): Promise<ProjectNote> {
    const result = await db.insert(projectNotes).values(note).returning();
    return result[0];
  }

  async updateProjectNote(id: string, updates: Partial<ProjectNote>): Promise<ProjectNote> {
    const result = await db.update(projectNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projectNotes.id, id))
      .returning();
    return result[0];
  }

  // Data reset
  async resetUserData(userId: string): Promise<void> {
    await db.delete(dailyReflections).where(eq(dailyReflections.userId, userId));
    await db.delete(challenges).where(eq(challenges.userId, userId));
    await db.delete(projectNotes).where(eq(projectNotes.userId, userId));
  }
}

export const storage = new DatabaseStorage();
