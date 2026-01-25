import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  privacy: z.enum(["private", "public"]).default("private"),
  groupType: z.enum(["athletic", "pelada"]).default("pelada"),
  parentGroupId: z.string().uuid().optional(),
});

export const createEventSchema = z.object({
  groupId: z.string().uuid(),
  startsAt: z.string().datetime(),
  venueId: z.string().uuid().optional(),
  maxPlayers: z.number().int().min(4).max(30).default(10),
  maxGoalkeepers: z.number().int().min(0).max(4).default(2),
  waitlistEnabled: z.boolean().default(true),
  // SPRINT 2: Payment fields
  price: z.number().min(0).optional().nullable(),
  receiverProfileId: z.string().uuid().optional().nullable(),
  autoChargeOnRsvp: z.boolean().optional().nullable(),
});

export const rsvpSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(["yes", "no", "waitlist"]),
  role: z.enum(["gk", "line"]).default("line"),
  preferredPosition: z.enum(["gk", "defender", "midfielder", "forward"]).optional(),
  secondaryPosition: z.enum(["gk", "defender", "midfielder", "forward"]).optional(),
});

export const eventActionSchema = z.object({
  eventId: z.string().uuid(),
  actorUserId: z.string().uuid(),
  actionType: z.enum([
    "goal",
    "assist",
    "save",
    "tackle",
    "error",
    "yellow_card",
    "red_card",
    "period_start",
    "period_end",
  ]),
  subjectUserId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  minute: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).optional(),
});

export const playerRatingSchema = z.object({
  eventId: z.string().uuid(),
  ratedUserId: z.string().uuid(),
});

// Modalidades
export const createModalitySchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
  icon: z.string().optional(),
  color: z.string().optional(),
  trainingsPerWeek: z.number().int().min(0).max(7).optional(),
  description: z.string().max(500).optional(),
});

export const updateModalitySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  trainingsPerWeek: z.number().int().min(0).max(7).optional(),
  description: z.string().max(500).optional(),
});

export const positionsSchema = z.object({
  positions: z.array(z.string().min(1).max(30)).min(1, "Deve ter pelo menos uma posição"),
});

// Atletas-Modalidades
export const athleteModalitySchema = z.object({
  modalityId: z.string().uuid(),
  rating: z.number().int().min(1).max(10).optional(),
  positions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateAthleteModalitySchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  positions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type EventActionInput = z.infer<typeof eventActionSchema>;
export type PlayerRatingInput = z.infer<typeof playerRatingSchema>;
export type CreateModalityInput = z.infer<typeof createModalitySchema>;
export type UpdateModalityInput = z.infer<typeof updateModalitySchema>;
export type PositionsInput = z.infer<typeof positionsSchema>;
export type AthleteModalityInput = z.infer<typeof athleteModalitySchema>;
export type UpdateAthleteModalityInput = z.infer<typeof updateAthleteModalitySchema>;
