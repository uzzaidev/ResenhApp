"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_id?: string;
};

type Post = {
  id: string;
  content: string | null;
  created_at: string;
  author_name: string;
  author_id?: string;
};

export function PostDetailClient({
  post,
  initialComments,
  currentUserId,
}: {
  post: Post;
  initialComments: Comment[];
  currentUserId: string;
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [reacted, setReacted] = useState(false);

  const refresh = async () => {
    const response = await fetch(`/api/social/posts/${post.id}`);
    const data = await response.json();
    if (response.ok) {
      setComments(data.comments || []);
    }
  };

  const addComment = async () => {
    const trimmed = content.trim();
    if (trimmed.length < 3) return;
    setSending(true);
    try {
      const response = await fetch(`/api/social/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (response.ok) {
        setContent("");
        await refresh();
      }
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/social/posts/${post.id}/comments/${commentId}`, {
      method: "DELETE",
    });
    await refresh();
  };

  const toggleReaction = async () => {
    if (reacted) {
      await fetch(`/api/social/posts/${post.id}/react`, { method: "DELETE" });
    } else {
      await fetch(`/api/social/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: "like" }),
      });
    }
    setReacted((v) => !v);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{post.author_name}</CardTitle>
          <CardDescription>{new Date(post.created_at).toLocaleString("pt-BR")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="whitespace-pre-wrap text-sm">{post.content || "Post sem texto"}</p>
          <Button size="sm" variant={reacted ? "default" : "outline"} onClick={toggleReaction}>
            {reacted ? "Descurtir" : "Curtir"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comentar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
          />
          <Button onClick={addComment} disabled={sending || content.trim().length < 3}>
            {sending ? "Enviando..." : "Comentar"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comentários ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem comentários ainda.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  {comment.author_name} • {new Date(comment.created_at).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
                {comment.author_id === currentUserId && (
                  <Button
                    className="mt-2"
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteComment(comment.id)}
                  >
                    Excluir comentário
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
