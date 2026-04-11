import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function PublicProfilePage({ params }: PageProps) {
  const me = await getCurrentUser();
  if (!me) {
    redirect("/auth/signin");
  }

  const { userId } = await params;

  const userResult = await sql`
    SELECT id, name, email, image, created_at
    FROM users
    WHERE id = ${userId}::UUID
    LIMIT 1
  `;
  const user = userResult[0] as any;

  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Perfil não encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  const posts = await sql`
    SELECT id, post_type, content, created_at
    FROM social_posts
    WHERE author_id = ${userId}::UUID
      AND deleted_at IS NULL
      AND privacy IN ('public', 'group')
    ORDER BY created_at DESC
    LIMIT 20
  `;

  return (
    <div className="container mx-auto max-w-3xl space-y-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{user.name || "Usuário"}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem posts públicos.</p>
          ) : (
            posts.map((post: any) => (
              <div key={post.id} className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  {post.post_type} • {new Date(post.created_at).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{post.content || "Post sem texto"}</p>
                <Link href={`/feed/${post.id}`} className="mt-2 inline-block text-xs text-primary hover:underline">
                  Abrir post
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
