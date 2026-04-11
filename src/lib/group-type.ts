export type LegacyGroupType = "athletic" | "pelada";
export type CanonicalGroupType = "atletica" | "modality_group" | "standalone";
export type AnyGroupType = LegacyGroupType | CanonicalGroupType;

export function fromDbGroupType(
  dbGroupType: string | null | undefined,
  parentGroupId?: string | null
): CanonicalGroupType {
  if (dbGroupType === "atletica") return "atletica";
  if (dbGroupType === "modality_group") return "modality_group";
  if (dbGroupType === "standalone") return "standalone";

  if (dbGroupType === "athletic") return "atletica";
  if (dbGroupType === "pelada") {
    return parentGroupId ? "modality_group" : "standalone";
  }

  return parentGroupId ? "modality_group" : "standalone";
}

export function normalizeRequestedGroupType(
  requested: AnyGroupType | undefined,
  parentGroupId?: string | null
): CanonicalGroupType {
  if (!requested) {
    return parentGroupId ? "modality_group" : "standalone";
  }

  if (requested === "athletic") return "atletica";
  if (requested === "pelada") return parentGroupId ? "modality_group" : "standalone";
  return requested;
}

export function toDbGroupType(groupType: CanonicalGroupType): LegacyGroupType {
  return groupType === "atletica" ? "athletic" : "pelada";
}

export function isAthleticGroupType(groupType: string | null | undefined): boolean {
  return groupType === "atletica" || groupType === "athletic";
}
