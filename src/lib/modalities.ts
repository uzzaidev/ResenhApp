/**
 * Modalities Helpers
 *
 * Funções auxiliares para gerenciar modalidades esportivas
 */

import { sql } from "@/db/client";

export interface Modality {
  id: string;
  groupId: string;
  name: string;
  icon?: string;
  color?: string;
  trainingsPerWeek?: number;
  description?: string;
  positions?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModalityWithStats extends Modality {
  athletesCount: number;
  averageAttendance?: number;
}

export interface AthleteModality {
  id: string;
  userId: string;
  modalityId: string;
  rating?: number;
  positions?: string[];
  isActive: boolean;
  createdAt: Date;
  modality?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  athlete?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

function normalizePositions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Obter modalidades do grupo com estatísticas
 */
export async function getGroupModalities(
  groupId: string
): Promise<ModalityWithStats[]> {
  const modalities = await sql`
    SELECT
      sm.id,
      sm.group_id as "groupId",
      sm.name,
      sm.icon,
      sm.color,
      sm.trainings_per_week as "trainingsPerWeek",
      sm.description,
      sm.positions,
      sm.is_active as "isActive",
      sm.created_at as "createdAt",
      sm.updated_at as "updatedAt",
      COALESCE(COUNT(DISTINCT am.user_id) FILTER (WHERE am.is_active = true), 0)::INTEGER as "athletesCount"
    FROM sport_modalities sm
    LEFT JOIN athlete_modalities am ON sm.id = am.modality_id
    WHERE sm.group_id = ${groupId}
      AND sm.is_active = true
    GROUP BY sm.id
    ORDER BY sm.name
  `;

  return modalities.map((m: any) => ({
    ...m,
    positions: normalizePositions(m.positions),
    athletesCount: Number(m.athletesCount) || 0,
  })) as ModalityWithStats[];
}

/**
 * Obter modalidade por ID com detalhes completos
 */
export async function getModalityById(
  modalityId: string
): Promise<ModalityWithStats | null> {
  const result = await sql`
    SELECT
      sm.id,
      sm.group_id as "groupId",
      sm.name,
      sm.icon,
      sm.color,
      sm.trainings_per_week as "trainingsPerWeek",
      sm.description,
      sm.positions,
      sm.is_active as "isActive",
      sm.created_at as "createdAt",
      sm.updated_at as "updatedAt",
      COALESCE(COUNT(DISTINCT am.user_id) FILTER (WHERE am.is_active = true), 0)::INTEGER as "athletesCount"
    FROM sport_modalities sm
    LEFT JOIN athlete_modalities am ON sm.id = am.modality_id
    WHERE sm.id = ${modalityId}
      AND sm.is_active = true
    GROUP BY sm.id
  `;

  if (!result || result.length === 0) {
    return null;
  }

  const modality = result[0] as any;
  return {
    ...modality,
    positions: normalizePositions(modality.positions),
    athletesCount: Number(modality.athletesCount) || 0,
  } as ModalityWithStats;
}

/**
 * Obter atletas de uma modalidade
 */
export async function getModalityAthletes(
  modalityId: string
): Promise<AthleteModality[]> {
  const athletes = await sql`
    SELECT
      am.id,
      am.user_id as "userId",
      am.modality_id as "modalityId",
      am.base_rating as rating,
      CASE
        WHEN am.preferred_position IS NOT NULL AND am.secondary_position IS NOT NULL
          THEN ARRAY[am.preferred_position, am.secondary_position]
        WHEN am.preferred_position IS NOT NULL
          THEN ARRAY[am.preferred_position]
        WHEN am.secondary_position IS NOT NULL
          THEN ARRAY[am.secondary_position]
        ELSE ARRAY[]::TEXT[]
      END as positions,
      am.is_active as "isActive",
      am.created_at as "createdAt",
      u.id as "athlete.id",
      COALESCE(u.name, 'Atleta') as "athlete.name",
      u.email as "athlete.email",
      u.image as "athlete.avatarUrl"
    FROM athlete_modalities am
    INNER JOIN users u ON am.user_id = u.id
    WHERE am.modality_id = ${modalityId}
      AND am.is_active = true
    ORDER BY am.base_rating DESC NULLS LAST, COALESCE(u.name, 'Atleta')
  `;

  return athletes.map((row: any) => ({
    id: row.id,
    userId: row.userId,
    modalityId: row.modalityId,
    rating: row.rating,
    positions: row.positions,
    isActive: row.isActive,
    createdAt: row.createdAt,
    athlete: {
      id: row["athlete.id"],
      name: row["athlete.name"],
      email: row["athlete.email"],
      avatarUrl: row["athlete.avatarUrl"],
    },
  })) as AthleteModality[];
}

/**
 * Obter posições disponíveis de uma modalidade
 */
export async function getAvailablePositions(
  modalityId: string
): Promise<string[]> {
  const result = await sql`
    SELECT positions
    FROM sport_modalities
    WHERE id = ${modalityId}
      AND is_active = true
  `;

  if (!result || result.length === 0) {
    return [];
  }

  return normalizePositions(result[0].positions);
}

/**
 * Obter modalidades de um atleta
 */
export async function getAthleteModalities(
  userId: string,
  groupId?: string
): Promise<AthleteModality[]> {
  let query;

  if (groupId) {
    query = sql`
      SELECT
        am.id,
        am.user_id as "userId",
        am.modality_id as "modalityId",
        am.base_rating as rating,
        CASE
          WHEN am.preferred_position IS NOT NULL AND am.secondary_position IS NOT NULL
            THEN ARRAY[am.preferred_position, am.secondary_position]
          WHEN am.preferred_position IS NOT NULL
            THEN ARRAY[am.preferred_position]
          WHEN am.secondary_position IS NOT NULL
            THEN ARRAY[am.secondary_position]
          ELSE ARRAY[]::TEXT[]
        END as positions,
        am.is_active as "isActive",
        am.created_at as "createdAt",
        sm.id as "modality.id",
        sm.name as "modality.name",
        sm.icon as "modality.icon",
        sm.color as "modality.color"
      FROM athlete_modalities am
      INNER JOIN sport_modalities sm ON am.modality_id = sm.id
      WHERE am.user_id = ${userId}
        AND sm.group_id = ${groupId}
        AND am.is_active = true
        AND sm.is_active = true
      ORDER BY sm.name
    `;
  } else {
    query = sql`
      SELECT
        am.id,
        am.user_id as "userId",
        am.modality_id as "modalityId",
        am.base_rating as rating,
        CASE
          WHEN am.preferred_position IS NOT NULL AND am.secondary_position IS NOT NULL
            THEN ARRAY[am.preferred_position, am.secondary_position]
          WHEN am.preferred_position IS NOT NULL
            THEN ARRAY[am.preferred_position]
          WHEN am.secondary_position IS NOT NULL
            THEN ARRAY[am.secondary_position]
          ELSE ARRAY[]::TEXT[]
        END as positions,
        am.is_active as "isActive",
        am.created_at as "createdAt",
        sm.id as "modality.id",
        sm.name as "modality.name",
        sm.icon as "modality.icon",
        sm.color as "modality.color"
      FROM athlete_modalities am
      INNER JOIN sport_modalities sm ON am.modality_id = sm.id
      WHERE am.user_id = ${userId}
        AND am.is_active = true
        AND sm.is_active = true
      ORDER BY sm.name
    `;
  }

  const modalities = await query;

  return modalities.map((row: any) => ({
    id: row.id,
    userId: row.userId,
    modalityId: row.modalityId,
    rating: row.rating,
    positions: row.positions,
    isActive: row.isActive,
    createdAt: row.createdAt,
    modality: {
      id: row["modality.id"],
      name: row["modality.name"],
      icon: row["modality.icon"],
      color: row["modality.color"],
    },
  })) as AthleteModality[];
}

/**
 * Verificar se atleta está em modalidade
 */
export async function isAthleteInModality(
  userId: string,
  modalityId: string
): Promise<boolean> {
  const result = await sql`
    SELECT 1
    FROM athlete_modalities
    WHERE user_id = ${userId}
      AND modality_id = ${modalityId}
      AND is_active = true
  `;

  return result.length > 0;
}

/**
 * Posições padrão por tipo de modalidade
 */
export const DEFAULT_POSITIONS: Record<string, string[]> = {
  futebol: ["Goleiro", "Zagueiro", "Lateral", "Meio-campo", "Atacante"],
  "futebol-11": ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meio-campo", "Ponta", "Atacante"],
  futsal: ["Goleiro", "Fixo", "Ala", "Pivô"],
  basquete: ["Armador", "Ala-Armador", "Ala", "Ala-Pivô", "Pivô"],
  volei: ["Levantador", "Ponteiro", "Oposto", "Central", "Líbero"],
  handebol: ["Goleiro", "Armador Central", "Armador Esquerdo", "Armador Direito", "Ponta Esquerda", "Ponta Direita", "Pivô"],
  tenis: ["Simples", "Duplas"],
  "tenis-mesa": ["Simples", "Duplas"],
  default: ["Posição 1", "Posição 2", "Posição 3", "Posição 4"],
};

/**
 * Obter posições padrão por tipo
 */
export function getDefaultPositions(modalityName: string): string[] {
  const key = modalityName.toLowerCase().trim();
  return DEFAULT_POSITIONS[key] || DEFAULT_POSITIONS.default;
}
