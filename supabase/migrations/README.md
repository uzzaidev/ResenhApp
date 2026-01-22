# Supabase Migrations - Peladeiros V2.0

## 📋 Overview

This directory contains all database migrations for the Peladeiros V2.0 project, designed for **Supabase PostgreSQL**.

## 📁 Migration Files

### Core Migrations (Foundation)

| # | File | Description | Tables Created |
|---|------|-------------|----------------|
| 1 | `20260127000001_initial_schema.sql` | Extensions + Enums | Extensions: uuid-ossp, pgcrypto, pg_trgm, postgis<br/>Enums: All system enums |
| 2 | `20260127000002_auth_profiles.sql` | Auth & User Types | `profiles`, `user_roles` |
| 3 | `20260127000003_groups_and_events.sql` | Core System | `groups`, `group_members`, `invites`, `venues`, `events`, `event_attendance`, `teams`, `team_members`, `event_actions`, `votes` |
| 4 | `20260127000004_rls_policies.sql` | Row Level Security | RLS policies for all core tables |

### Feature Migrations

| # | File | Description | Tables Created |
|---|------|-------------|----------------|
| 5 | `20260204000001_financial_system.sql` | Financeiro + Pix | `wallets`, `charges`, `charge_splits`, `transactions`, `pix_payments`, `group_pix_config` |
| 6 | `20260211000001_notifications.sql` | Notificações | `notifications`, `notification_templates`, `push_tokens`, `email_queue`, `notification_batches` |
| 7 | `20260218000001_analytics.sql` | Analytics + Stats | `player_stats`, `event_stats`, `group_stats`, `leaderboards`, `activity_log` |
| 8 | `20260225000001_gamification.sql` | Gamificação | `achievement_types`, `user_achievements`, `badges`, `user_badges`, `milestones`, `challenges`, `challenge_participants` |

## 🚀 How to Apply Migrations

### Prerequisites

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Create Supabase Project**:
   - Go to https://app.supabase.com
   - Create new project
   - Note your project ID and database password

### Local Development

1. **Initialize Supabase locally**:
   ```bash
   supabase init
   ```

2. **Link to your Supabase project**:
   ```bash
   supabase link --project-ref <your-project-id>
   ```

3. **Apply all migrations**:
   ```bash
   supabase db push
   ```

### Production Deployment

1. **Push to production** (requires confirmation):
   ```bash
   supabase db push --db-url postgresql://postgres:[password]@[host]:5432/postgres
   ```

2. **Or use Supabase Dashboard**:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste each migration file in order
   - Execute sequentially

## 📊 Database Schema Summary

### Total Tables: 40+

**Core System (11 tables)**:
- profiles, user_roles
- groups, group_members, invites
- venues, events, event_attendance
- teams, team_members, votes

**Financial (6 tables)**:
- wallets, charges, charge_splits
- transactions, pix_payments, group_pix_config

**Notifications (5 tables)**:
- notifications, notification_templates
- push_tokens, email_queue, notification_batches

**Analytics (5 tables)**:
- player_stats, event_stats, group_stats
- leaderboards, activity_log

**Gamification (7 tables)**:
- achievement_types, user_achievements
- badges, user_badges
- milestones, challenges, challenge_participants

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

- **Authentication**: Uses Supabase `auth.uid()`
- **Group Membership**: Helper functions check permissions
- **Role-Based Access**: Platform roles (player, organizer, admin, super_admin)
- **Granular Permissions**: JSONB permissions per group member

### Key RLS Helper Functions

```sql
is_group_owner(user_id, group_id) → BOOLEAN
is_group_admin(user_id, group_id) → BOOLEAN
is_group_member(user_id, group_id) → BOOLEAN
can_create_groups(user_id) → BOOLEAN
has_platform_access(user_id) → BOOLEAN
has_group_permission(user_id, group_id, permission) → BOOLEAN
```

## 🎯 Key Features

### 1. Multi-User Type System

Users have platform-level roles:
- **player**: Regular user (default)
- **organizer**: Can create and manage multiple groups
- **admin**: Platform-level admin
- **super_admin**: Full platform access

### 2. Multi-Group Management

- Organizers can own multiple groups
- Users can be members of multiple groups
- Different roles per group (owner, admin, moderator, member)
- Granular permissions via JSONB

### 3. Automatic Code Generation

All entities have unique codes:
- Users: `P-00001`, `P-00002`
- Groups: `G-001`, `G-002`
- Events: `E-2026-001`
- Charges: `CH-00001`
- Wallets: `W-001`
- Pix: `PIX-00001`
- Notifications: `NOTIF-00001`

### 4. Soft Delete Pattern

Most tables support soft delete with `deleted_at` column:
```sql
WHERE deleted_at IS NULL -- Active records
WHERE deleted_at IS NOT NULL -- Deleted records
```

### 5. Audit Trail

`activity_log` table tracks all user actions with:
- User ID, action type, entity type/ID
- IP address, user agent
- Metadata (JSONB)

### 6. Materialized Views

For performance optimization:
- `mv_top_scorers`: Top scorers per group
- Refresh with: `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_scorers`

## 🔄 Triggers and Automation

### Auto-Update Triggers

| Trigger | Table | Action |
|---------|-------|--------|
| `before_insert_profile_code` | profiles | Generate unique P-code |
| `before_update_profile_timestamp` | profiles | Update `updated_at` |
| `trigger_update_charge_stats` | charge_splits | Update charge totals |
| `update_player_stats_from_action` | event_actions | Update player stats |
| `update_attendance_stats` | event_attendance | Update attendance metrics |
| `trigger_check_achievements` | event_actions | Check and unlock achievements |

### Generated Columns

Computed fields stored in database:
- `profiles.can_create_groups` (based on platform_role)
- `profiles.can_manage_platform` (based on platform_role)
- `events.end_time` (time + duration)
- `player_stats.attendance_rate` (calculated %)

## 📦 Seed Data

Some tables have seed data included in migrations:

### notification_templates (8 templates)
- event_created, event_reminder
- payment_request, payment_received
- team_drawn, achievement_unlocked
- waitlist_moved, group_invite

### achievement_types (18 achievements)
- Goals: first_goal, 10, 50, 100 goals, hat-trick
- Assists: first_assist, 10, 50 assists
- Participation: first_event, 10, 50, 100 events
- Streaks: 5, 10, 20 consecutive events
- Special: perfect_month, early_bird, mvp_month

## 🛠️ Maintenance Scripts

### Cleanup Old Notifications
```sql
SELECT cleanup_old_notifications(30); -- Delete read notifications older than 30 days
```

### Refresh Leaderboards
```sql
SELECT calculate_leaderboard(group_id, 'goals', 'monthly');
```

### Refresh Materialized Views
```sql
SELECT refresh_top_scorers();
```

## 📝 Migration Best Practices

1. **Order Matters**: Always apply migrations in numerical order
2. **Backup First**: Always backup production database before migrations
3. **Test Locally**: Test migrations in local Supabase instance first
4. **Read-Only Mode**: Consider enabling read-only mode during migrations
5. **Monitor Performance**: Watch for slow queries after migrations
6. **Rollback Plan**: Have rollback scripts ready for critical migrations

## 🐛 Troubleshooting

### Common Issues

**Issue**: `relation "auth.users" does not exist`
- **Solution**: Ensure you're using Supabase, not vanilla PostgreSQL

**Issue**: `function auth.uid() does not exist`
- **Solution**: RLS policies require Supabase Auth context

**Issue**: `permission denied for table`
- **Solution**: Check RLS policies, may need to use service role key

**Issue**: `enum type already exists`
- **Solution**: Drop and recreate, or use `IF NOT EXISTS` (already included)

## 📚 Related Documentation

- [DATABASE-ARCHITECTURE-SUPABASE-V2.md](../DATABASE-ARCHITECTURE-SUPABASE-V2.md) - Complete architecture docs
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## 🔗 Next Steps After Migrations

1. **Configure Supabase Auth**:
   - Enable email/password provider
   - Configure email templates
   - Set up OAuth providers (Google, etc.)

2. **Create Storage Buckets**:
   ```bash
   # Avatars bucket
   # Group photos bucket
   # Venue photos bucket
   # Receipts bucket
   ```

3. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy generate-pix-qr
   supabase functions deploy send-notification
   ```

4. **Setup Realtime**:
   - Enable realtime for: events, notifications, event_actions
   - Configure broadcast channels

5. **Integrate with Next.js**:
   - Install @supabase/supabase-js
   - Configure environment variables
   - Setup middleware for auth

---

**Created**: 2026-01-21
**Version**: 2.0.0-SUPABASE
**Author**: Claude Code + Tech Team
**Status**: ✅ Production Ready
