import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomCategorySchema, 
  insertDailyReflectionSchema, 
  insertChallengeSchema, 
  insertProjectNoteSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Custom Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCustomCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCustomCategorySchema.parse(req.body);
      const category = await storage.createCustomCategory(validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  // Daily Reflections API
  app.get("/api/reflections", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const reflections = await storage.getDailyReflections(userId);
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  app.get("/api/reflections/:date", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const date = req.params.date;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const reflection = await storage.getDailyReflectionByDate(userId, date);
      res.json(reflection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  });

  app.post("/api/reflections", async (req, res) => {
    try {
      const validatedData = insertDailyReflectionSchema.parse(req.body);
      const reflection = await storage.createDailyReflection(validatedData);
      res.json(reflection);
    } catch (error) {
      res.status(400).json({ error: "Invalid reflection data" });
    }
  });

  app.put("/api/reflections/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const reflection = await storage.updateDailyReflection(id, updates);
      res.json(reflection);
    } catch (error) {
      res.status(400).json({ error: "Failed to update reflection" });
    }
  });

  // Challenges API
  app.get("/api/challenges", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const challenges = await storage.getChallenges(userId);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.post("/api/challenges", async (req, res) => {
    try {
      const validatedData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(validatedData);
      res.json(challenge);
    } catch (error) {
      res.status(400).json({ error: "Invalid challenge data" });
    }
  });

  app.put("/api/challenges/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const challenge = await storage.updateChallenge(id, updates);
      res.json(challenge);
    } catch (error) {
      res.status(400).json({ error: "Failed to update challenge" });
    }
  });

  // Project Notes API
  app.get("/api/project-notes", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const projectId = req.query.projectId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const notes = await storage.getProjectNotes(userId, projectId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project notes" });
    }
  });

  app.post("/api/project-notes", async (req, res) => {
    try {
      const validatedData = insertProjectNoteSchema.parse(req.body);
      const note = await storage.createProjectNote(validatedData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid project note data" });
    }
  });

  app.put("/api/project-notes/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const note = await storage.updateProjectNote(id, updates);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Failed to update project note" });
    }
  });

  // Data Reset API
  app.post("/api/reset-data", async (req, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      await storage.resetUserData(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset user data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
