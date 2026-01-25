import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { rsvpSchema } from "@/lib/validations";
import logger from "@/lib/logger";
import { generatePixForCharge } from "@/lib/pix-helpers";

type Params = Promise<{ eventId: string }>;

// POST /api/events/:eventId/rsvp - RSVP to an event
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { eventId } = await params;
    const user = await requireAuth();

    const body = await request.json();
    const validation = rsvpSchema.safeParse({ ...body, eventId });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { status, role, preferredPosition, secondaryPosition } = validation.data;

    // Get event details
    const eventQuery = await sql`
      SELECT * FROM events WHERE id = ${eventId}
    `;
    const event = eventQuery[0];

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    // Check if user is member of the group
    const membershipQuery = await sql`
      SELECT * FROM group_members
      WHERE group_id = ${event.group_id} AND user_id = ${user.id}
    `;
    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // Count current confirmations (excluding the current user to avoid double-counting)
    const countsQuery = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'yes' AND role = 'gk') as gk_count,
        COUNT(*) FILTER (WHERE status = 'yes' AND role = 'line') as line_count
      FROM event_attendance
      WHERE event_id = ${eventId} AND user_id != ${user.id}
    `;
    const counts = countsQuery[0];

    let finalStatus = status;

    // Check if we need to put user in waitlist
    if (status === "yes") {
      const totalPlayers = parseInt(counts.gk_count) + parseInt(counts.line_count);
      const gkCount = parseInt(counts.gk_count);

      if (role === "gk" && gkCount >= event.max_goalkeepers) {
        finalStatus = event.waitlist_enabled ? "waitlist" : "yes";
      } else if (totalPlayers >= event.max_players) {
        finalStatus = event.waitlist_enabled ? "waitlist" : "yes";
      }
    }

    // Get current attendance status to track self-removal
    const currentAttendanceQuery = await sql`
      SELECT status FROM event_attendance
      WHERE event_id = ${eventId} AND user_id = ${user.id}
    `;
    const currentAttendance = currentAttendanceQuery[0];

    // Determine if this is a self-removal (yes → no) or re-confirmation (no → yes)
    const isSelfRemoval = currentAttendance?.status === 'yes' && status === 'no';
    const isReconfirmation = currentAttendance?.status === 'no' && status === 'yes';

    // Upsert attendance
    const attendanceQuery = await sql`
      INSERT INTO event_attendance (event_id, user_id, role, status, preferred_position, secondary_position, removed_by_self_at)
      VALUES (
        ${eventId},
        ${user.id},
        ${role},
        ${finalStatus},
        ${preferredPosition || null},
        ${secondaryPosition || null},
        ${isSelfRemoval ? sql`NOW()` : null}
      )
      ON CONFLICT (event_id, user_id)
      DO UPDATE SET
        role = ${role},
        status = ${finalStatus},
        preferred_position = ${preferredPosition || null},
        secondary_position = ${secondaryPosition || null},
        removed_by_self_at = CASE
          WHEN ${isSelfRemoval} THEN NOW()
          WHEN ${isReconfirmation} THEN NULL
          ELSE event_attendance.removed_by_self_at
        END,
        updated_at = NOW()
      RETURNING *
    `;
    const attendance = attendanceQuery[0];

    // If user changed to "no" or "waitlist" to "yes", check waitlist
    if (status === "no" || (finalStatus === "yes" && event.waitlist_enabled)) {
      // Move first person from waitlist to confirmed
      const firstInWaitlistQuery = await sql`
        SELECT * FROM event_attendance
        WHERE event_id = ${eventId} AND status = 'waitlist'
        ORDER BY created_at ASC
        LIMIT 1
      `;
      const firstInWaitlist = firstInWaitlistQuery[0];

      if (firstInWaitlist) {
        const updatedCountsQuery = await sql`
          SELECT
            COUNT(*) FILTER (WHERE status = 'yes' AND role = 'gk') as gk_count,
            COUNT(*) FILTER (WHERE status = 'yes' AND role = 'line') as line_count
          FROM event_attendance
          WHERE event_id = ${eventId}
        `;
        const updatedCounts = updatedCountsQuery[0];

        const totalPlayers = parseInt(updatedCounts.gk_count) + parseInt(updatedCounts.line_count);
        const gkCount = parseInt(updatedCounts.gk_count);

        let canConfirm = false;
        if (firstInWaitlist.role === "gk" && gkCount < event.max_goalkeepers) {
          canConfirm = true;
        } else if (totalPlayers < event.max_players) {
          canConfirm = true;
        }

        if (canConfirm) {
          await sql`
            UPDATE event_attendance
            SET status = 'yes', updated_at = NOW()
            WHERE id = ${firstInWaitlist.id}
          `;
        }
      }
    }

    // =====================================================
    // SPRINT 2: Auto-Generate Charge on RSVP
    // =====================================================
    let charge = null;

    // If RSVP=yes AND event has price AND auto_charge is enabled
    if (finalStatus === 'yes') {
      // Get event pricing details (use event we already fetched)
      const eventPricing = {
        price: event.price,
        receiver_profile_id: event.receiver_profile_id,
        auto_charge_on_rsvp: event.auto_charge_on_rsvp,
        starts_at: event.starts_at,
      };

      // Check if we should create a charge
      if (
        eventPricing?.price &&
        parseFloat(eventPricing.price) > 0 &&
        eventPricing.auto_charge_on_rsvp !== false
      ) {
        // Check if charge split already exists for this user and event (avoid duplicates)
        // Use event.id (BIGINT) from the event we already fetched
        const existingChargeSplitQuery = await sql`
          SELECT cs.id, cs.charge_id
          FROM charge_splits cs
          INNER JOIN charges c ON cs.charge_id = c.id
          WHERE c.event_id = ${event.id}
            AND cs.user_id = ${user.id}
            AND cs.status = 'pending'
          LIMIT 1
        `;

        if (!existingChargeSplitQuery || existingChargeSplitQuery.length === 0) {
          try {
            // Calculate due date (1 day before event)
            const dueDate = eventPricing.starts_at 
              ? new Date(new Date(eventPricing.starts_at).getTime() - 24 * 60 * 60 * 1000)
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 7 days from now

            // Check if a charge already exists for this event (multiple users can share same charge)
            let chargeId: bigint | null = null;
            
            const existingChargeQuery = await sql`
              SELECT id FROM charges
              WHERE event_id = ${event.id}
              LIMIT 1
            `;

            if (existingChargeQuery && existingChargeQuery.length > 0) {
              // Use existing charge
              chargeId = (existingChargeQuery[0] as any).id;
            } else {
              // Create new charge for this event
              const chargeQuery = await sql`
                INSERT INTO charges (
                  group_id,
                  event_id,
                  description,
                  amount,
                  quantity,
                  due_date,
                  receiver_profile_id,
                  status,
                  created_by
                )
                VALUES (
                  ${event.group_id},
                  ${event.id},
                  ${`Cobrança referente ao treino`},
                  ${parseFloat(eventPricing.price)},
                  1,
                  ${dueDate.toISOString().split('T')[0]},
                  ${eventPricing.receiver_profile_id || null},
                  'pending',
                  ${user.id}
                )
                RETURNING id
              `;
              chargeId = (chargeQuery[0] as any).id;
            }

            // Create charge split for this user
            // chargeId is bigint, need to ensure it's not null
            if (!chargeId) {
              throw new Error("Charge ID is null");
            }
            // Convert bigint to string for SQL template (PostgreSQL will cast it)
            const chargeIdStr = chargeId.toString();
            const chargeSplitQuery = await sql`
              INSERT INTO charge_splits (
                charge_id,
                user_id,
                amount,
                status
              )
              VALUES (
                ${chargeIdStr}::BIGINT,
                ${user.id},
                ${parseFloat(eventPricing.price)},
                'pending'
              )
              RETURNING *
            `;

            // Get full charge details for response
            const chargeDetailsQuery = await sql`
              SELECT * FROM charges WHERE id = ${chargeIdStr}::BIGINT
            `;
            charge = chargeDetailsQuery[0];

            // SPRINT 3: Auto-generate Pix QR Code
            try {
              const pixResult = await generatePixForCharge(chargeId);
              if (pixResult.success) {
                logger.info(
                  { chargeId: chargeId.toString() },
                  "Pix QR Code auto-generated for charge"
                );
              } else {
                logger.warn(
                  { chargeId: chargeId.toString(), error: pixResult.error },
                  "Failed to auto-generate Pix QR Code"
                );
              }
            } catch (pixError) {
              // Log but don't fail - Pix can be generated later
              logger.warn(
                { error: pixError, chargeId: chargeId.toString() },
                "Error auto-generating Pix QR Code"
              );
            }

            // Create notification (if notifications table exists)
            try {
              await sql`
                INSERT INTO notifications (user_id, type, title, message, action_url)
                VALUES (
                  ${user.id},
                  'charge_created',
                  'Nova cobrança',
                  ${`Você tem uma cobrança de R$ ${eventPricing.price} referente ao treino`},
                  ${`/financeiro/charges/${charge.id}`}
                )
              `;
            } catch (notifError) {
              // Notifications table might not exist yet, log but don't fail
              logger.warn({ error: notifError }, "Failed to create notification");
            }

            logger.info(
              { eventId, userId: user.id, chargeId: charge.id, amount: eventPricing.price },
              "Charge auto-generated on RSVP"
            );
          } catch (chargeError) {
            // Log error but don't fail the RSVP
            logger.error(
              { error: chargeError, eventId, userId: user.id },
              "Failed to auto-generate charge on RSVP"
            );
          }
        }
      }
    }

    logger.info(
      { eventId, userId: user.id, status: finalStatus, chargeCreated: !!charge },
      "RSVP updated"
    );

    return NextResponse.json({ 
      attendance,
      charge: charge || null 
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error updating RSVP");
    return NextResponse.json(
      { error: "Erro ao atualizar confirmação" },
      { status: 500 }
    );
  }
}
