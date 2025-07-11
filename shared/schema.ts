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
  conditionType: text("condition_type").notNull(), // 'task_completion' | 'habit_streak' | 'xp_gain' | 'custom'
  conditionTarget: integer("condition_target").notNull(),
  conditionDuration: integer("condition_duration"), // days
  xpReward: integer("xp_reward").default(0),
  badgeName: text("badge_name"),
  startDate: date("start_date").notNull().defaultNow(),
  endDate: date("end_date"),
  isCompleted: boolean("is_completed").default(false),
  progress: integer("progress").default(0),
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
  conditionType: true,
  conditionTarget: true,
  conditionDuration: true,
  xpReward: true,
  badgeName: true,
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
