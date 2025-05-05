import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scheduleData: jsonb("schedule_data").notNull(), // Stores the parsed schedule data
  metadata: jsonb("metadata").notNull(), // Stores dates, residents, etc.
  pgyLevels: jsonb("pgy_levels").notNull(), // Stores PGY levels for residents
  rawHtml: text("raw_html").notNull(), // Original HTML/text for reimporting
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  name: true,
  scheduleData: true,
  metadata: true,
  pgyLevels: true,
  rawHtml: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;
