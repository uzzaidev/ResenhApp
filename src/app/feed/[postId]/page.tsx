import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PostDetailClient } from "@/components/social/post-detail-client";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export default async function FeedPostPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const { postId } = await params;
  const postResult = await sql`
    SELECT
      sp.*,
      COALESCE(u.name, 'Usuário') AS author_name
    FROM social_posts sp
    LEFT JOIN users u ON u.id = sp.author_id
    WHERE sp.id = ${postId}::UUID
      AND sp.deleted_at IS NULL
    LIMIT 1
  `;

  const post = postResult[0] as any;
  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Post não encontrado.</p>
            <Link href="/feed" className="mt-2 inline-block text-sm text-primary hover:underline">
              Voltar ao feed
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const comments = await sql`
    SELECT
      sc.id,
      sc.author_id,
      sc.content,
      sc.created_at,
      COALESCE(u.name, 'Usuário') AS author_name
    FROM social_comments sc
    LEFT JOIN users u ON u.id = sc.author_id
    WHERE sc.post_id = ${postId}::UUID
      AND sc.deleted_at IS NULL
    ORDER BY sc.created_at ASC
  `;

  return (
    <div className="container mx-auto max-w-3xl space-y-4 py-8">
      <Link href="/feed" className="text-sm text-primary hover:underline">
        Voltar ao feed
      </Link>
      <PostDetailClient
        post={post as any}
        initialComments={comments as any[]}
        currentUserId={user.id}
      />
    </div>
  );
}
