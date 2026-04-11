import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { FeedClient } from "@/components/social/feed-client";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const posts = await sql`
    SELECT
      sp.id,
      sp.author_id,
      sp.post_type,
      sp.content,
      sp.created_at,
      sp.group_id,
      COALESCE(u.name, 'Usuário') AS author_name,
      COUNT(DISTINCT sr.id)::INTEGER AS reactions_count,
      COUNT(DISTINCT sc.id)::INTEGER AS comments_count
    FROM social_posts sp
    LEFT JOIN users u ON u.id = sp.author_id
    LEFT JOIN social_reactions sr ON sr.post_id = sp.id
    LEFT JOIN social_comments sc ON sc.post_id = sp.id AND sc.deleted_at IS NULL
    WHERE sp.deleted_at IS NULL
      AND sp.privacy IN ('public', 'group')
    GROUP BY sp.id, u.name
    ORDER BY sp.created_at DESC
    LIMIT 30
  `;

  return (
    <div className="container mx-auto max-w-4xl space-y-4 py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Feed</h1>
        <p className="text-muted-foreground">Atualizações esportivas da comunidade.</p>
      </div>

      <FeedClient initialPosts={posts as any[]} currentUserId={user.id} />
    </div>
  );
}
