import logger from "@/lib/logger";

type SqlLike = any;

async function tableExists(db: SqlLike, tableName: string): Promise<boolean> {
  const result = await db<{ exists: string | null }[]>`
    SELECT to_regclass(${`public.${tableName}`})::TEXT AS exists
  `;
  return Boolean(result[0]?.exists);
}

export type InAppNotificationInput = {
  userId: string;
  type:
    | "event_created"
    | "event_updated"
    | "event_cancelled"
    | "event_reminder"
    | "rsvp_confirmed"
    | "waitlist_moved"
    | "team_drawn"
    | "payment_request"
    | "payment_received"
    | "achievement_unlocked"
    | "group_invite";
  title: string;
  body: string;
  actionUrl?: string | null;
  relatedType?: "event" | "group" | "charge" | "achievement" | null;
  relatedId?: number | string | null;
};

export async function createInAppNotification(
  db: SqlLike,
  input: InAppNotificationInput
): Promise<{ created: boolean; deferred: boolean }> {
  try {
    const ready = await tableExists(db, "notifications");
    if (!ready) {
      return { created: false, deferred: true };
    }

    const maxCodeResult = await db<{ next_code: string }[]>`
      SELECT
        'NOTIF-' || LPAD(
          (COALESCE(MAX(CAST(SUBSTRING(code FROM 7) AS INTEGER)), 0) + 1)::TEXT,
          5,
          '0'
        ) AS next_code
      FROM notifications
      WHERE code ~ '^NOTIF-[0-9]+$'
    `;
    const nextCode = maxCodeResult[0]?.next_code || `NOTIF-${Date.now()}`;

    const relatedIdValue =
      input.relatedId === undefined || input.relatedId === null
        ? null
        : Number(input.relatedId);

    await db`
      INSERT INTO notifications (
        code,
        user_id,
        type,
        title,
        body,
        action_url,
        related_type,
        related_id
      )
      VALUES (
        ${nextCode},
        ${input.userId}::UUID,
        ${input.type},
        ${input.title},
        ${input.body},
        ${input.actionUrl || null},
        ${input.relatedType || null},
        ${relatedIdValue}
      )
    `;

    return { created: true, deferred: false };
  } catch (error) {
    logger.warn({ error, input }, "Failed to create in-app notification");
    return { created: false, deferred: false };
  }
}
