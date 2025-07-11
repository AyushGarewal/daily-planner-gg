import { pgTable, text, serial, integer, boolean, uuid, date, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customCategories = pgTable("custom_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // 'task' | 'habit' | 'project' | 'goal'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyReflections = pgTable("daily_reflections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // will be session-based for now
  reflectionDate: date("reflection_date").notNull(),
  mood: integer("mood"), // 1-5 scale
  content: text("content"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  challengeType: text("challenge_type").notNull(), // 'streak' | 'frequency' | 'milestone' | 'avoidance' | 'completion' | 'combo'
  linkedHabits: text("linked_habits").array(), // habit IDs
  habitTypes: text("habit_types").array(), // 'normal' | 'side' | 'negative'
  targetValue: integer("target_value").notNull(),
  currentProgress: integer("current_progress").default(0),
  timeLimit: integer("time_limit"), // days
  xpReward: integer("xp_reward").default(0),
  badgeReward: text("badge_reward"),
  startDate: date("start_date").notNull().defaultNow(),
  endDate: date("end_date"),
  isCompleted: boolean("is_completed").default(false),
  isFailed: boolean("is_failed").default(false),
  isActive: boolean("is_active").default(true),
  dailyProgress: text("daily_progress"), // JSON string for daily tracking
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const projectNotes = pgTable("project_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCustomCategorySchema = createInsertSchema(customCategories).pick({
  name: true,
  type: true,
});

export const insertDailyReflectionSchema = createInsertSchema(dailyReflections).pick({
  userId: true,
  reflectionDate: true,
  mood: true,
  content: true,
  tags: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  userId: true,
  title: true,
  description: true,
  challengeType: true,
  linkedHabits: true,
  habitTypes: true,
  targetValue: true,
  timeLimit: true,
  xpReward: true,
  badgeReward: true,
  startDate: true,
  endDate: true,
});

export const insertProjectNoteSchema = createInsertSchema(projectNotes).pick({
  projectId: true,
  userId: true,
  title: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CustomCategory = typeof customCategories.$inferSelect;
export type InsertCustomCategory = z.infer<typeof insertCustomCategorySchema>;
export type DailyReflection = typeof dailyReflections.$inferSelect;
export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type ProjectNote = typeof projectNotes.$inferSelect;
export type InsertProjectNote = z.infer<typeof insertProjectNoteSchema>;
