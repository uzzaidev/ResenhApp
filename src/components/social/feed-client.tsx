"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type SocialPost = {
  id: string;
  post_type: string;
  content: string | null;
  created_at: string;
  author_id?: string;
  author_name: string;
  reactions_count: number;
  comments_count: number;
  my_reaction?: string | null;
};

export function FeedClient({
  initialPosts,
  currentUserId,
}: {
  initialPosts: SocialPost[];
  currentUserId: string;
}) {
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/social/feed");
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const createPost = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postType: "text_update",
          content: trimmed,
          privacy: "public",
        }),
      });
      if (response.ok) {
        setContent("");
        await loadFeed();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reactToPost = async (post: SocialPost) => {
    if (post.my_reaction) {
      await fetch(`/api/social/posts/${post.id}/react`, { method: "DELETE" });
    } else {
      await fetch(`/api/social/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: "like" }),
      });
    }
    await loadFeed();
  };

  const deletePost = async (postId: string) => {
    await fetch(`/api/social/posts/${postId}`, { method: "DELETE" });
    await loadFeed();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Criar post</CardTitle>
          <CardDescription>Compartilhe atualizações do seu treino.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Como foi seu treino hoje?"
            rows={4}
          />
          <div className="flex justify-end">
            <Button onClick={createPost} disabled={submitting || !content.trim()}>
              {submitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Carregando feed...
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum post ainda.
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{post.author_name}</CardTitle>
                <Badge variant="outline">{post.post_type}</Badge>
              </div>
              <CardDescription>
                {new Date(post.created_at).toLocaleString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{post.content || "Post sem texto"}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button size="sm" variant={post.my_reaction ? "default" : "outline"} onClick={() => reactToPost(post)}>
                    {post.my_reaction ? "Descurtir" : "Curtir"} ({post.reactions_count})
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/feed/${post.id}`}>Comentar ({post.comments_count})</Link>
                  </Button>
                </div>
                {post.author_id === currentUserId && (
                  <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)}>
                    Excluir
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
