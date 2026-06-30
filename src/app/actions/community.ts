"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Create DB client at runtime (inside functions), not at module level
function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getCurrentUser() {
  const db = getDb();
  const reqHeaders = await headers();
  let userId = reqHeaders.get("x-user-id");

  if (!userId) {
    const { data } = await db.from("User").select("id").limit(1).single();
    userId = data?.id || null;
  }

  if (userId) {
    const { data: exists } = await db.from("User").select("id").eq("id", userId).single();
    if (!exists) {
      await db.from("User").insert({ id: userId, name: "Community User" });
    }
  }

  return userId;
}

export async function getPosts(tagFilter?: string, sortBy: "newest" | "top" = "newest") {
  try {
    const db = getDb();
    let query = db
      .from("Post")
      .select(`
        id, title, content, tags, upvotes, createdAt, userId,
        user:User(name),
        comments:Comment(
          id, content, createdAt, userId,
          user:User(name)
        )
      `);

    if (tagFilter) query = query.contains("tags", [tagFilter]);

    if (sortBy === "top") {
      query = query.order("upvotes", { ascending: false });
    } else {
      query = query.order("createdAt", { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to get community posts:", error.message);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Failed to get community posts:", error);
    return [];
  }
}

export async function createPost(title: string, content: string, tags: string[]) {
  try {
    const db = getDb();
    const userId = await getCurrentUser();
    if (!userId) return { error: "User not authenticated" };

    const { data: post, error } = await db
      .from("Post")
      .insert({ id: crypto.randomUUID(), userId, title, content, tags, upvotes: 0, createdAt: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      console.error("Failed to create post:", error.message);
      return { error: error.message || "Failed to create discussion post" };
    }

    revalidatePath("/community");
    return { success: true, post };
  } catch (error: any) {
    console.error("Failed to create post:", error);
    return { error: error.message || "Failed to create discussion post" };
  }
}

export async function upvotePost(postId: string) {
  try {
    const db = getDb();
    const { data: post } = await db.from("Post").select("upvotes").eq("id", postId).single();
    const currentUpvotes = post?.upvotes ?? 0;

    const { data: updated, error } = await db
      .from("Post")
      .update({ upvotes: currentUpvotes + 1 })
      .eq("id", postId)
      .select("upvotes")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/community");
    return { success: true, upvotes: updated?.upvotes };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addComment(postId: string, content: string) {
  try {
    const db = getDb();
    const userId = await getCurrentUser();
    if (!userId) return { error: "User not authenticated" };

    const { data: comment, error } = await db
      .from("Comment")
      .insert({ id: crypto.randomUUID(), postId, userId, content, createdAt: new Date().toISOString() })
      .select(`id, content, createdAt, userId, user:User(name)`)
      .single();

    if (error) return { error: error.message };
    revalidatePath("/community");
    return { success: true, comment };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePost(postId: string) {
  try {
    const db = getDb();
    const userId = await getCurrentUser();
    if (!userId) return { error: "User not authenticated" };

    const { data: post } = await db.from("Post").select("userId").eq("id", postId).single();
    if (!post) return { error: "Post not found" };

    if (post.userId !== userId) {
      const { data: firstUser } = await db.from("User").select("id").limit(1).single();
      if (firstUser?.id !== userId) return { error: "Not authorized to delete this post" };
    }

    await db.from("Comment").delete().eq("postId", postId);
    await db.from("Post").delete().eq("id", postId);

    revalidatePath("/community");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const db = getDb();
    const userId = await getCurrentUser();
    if (!userId) return { error: "User not authenticated" };

    const { data: comment } = await db.from("Comment").select("userId").eq("id", commentId).single();
    if (!comment) return { error: "Comment not found" };

    if (comment.userId !== userId) {
      const { data: firstUser } = await db.from("User").select("id").limit(1).single();
      if (firstUser?.id !== userId) return { error: "Not authorized to delete this comment" };
    }

    await db.from("Comment").delete().eq("id", commentId);
    revalidatePath("/community");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
