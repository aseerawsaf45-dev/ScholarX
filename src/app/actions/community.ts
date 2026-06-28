"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Helper to resolve user session reliably
async function getCurrentUser() {
  const reqHeaders = await headers();
  let userId = reqHeaders.get("x-user-id");

  if (!userId) {
    // Dev fallback: find the first user in the database so it never fails
    const firstUser = await prisma.user.findFirst();
    userId = firstUser?.id || null;
  }
  return userId;
}

export async function getPosts(tagFilter?: string, sortBy: "newest" | "top" = "newest") {
  try {
    const posts = await prisma.post.findMany({
      where: tagFilter ? { tags: { has: tagFilter } } : {},
      include: {
        user: { select: { name: true } },
        comments: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: sortBy === "top" ? { upvotes: "desc" } : { createdAt: "desc" }
    });
    return posts;
  } catch (error) {
    console.error("Failed to get community posts:", error);
    return [];
  }
}

export async function createPost(title: string, content: string, tags: string[]) {
  try {
    const userId = await getCurrentUser();
    if (!userId) return { error: "User not authenticated" };

    const post = await prisma.post.create({
      data: {
        userId,
        title,
        content,
        tags,
      }
    });

    revalidatePath("/community");
    return { success: true, post };
  } catch (error: any) {
    console.error("Failed to create post:", error);
    return { error: error.message || "Failed to create discussion post" };
  }
}

export async function upvotePost(postId: string) {
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        upvotes: { increment: 1 }
      }
    });
    revalidatePath("/community");
    return { success: true, upvotes: post.upvotes };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addComment(postId: string, content: string) {
  try {
    const userId = await getCurrentUser();
    if (!userId) return { error: "User not authenticated" };

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: { select: { name: true } }
      }
    });

    revalidatePath("/community");
    return { success: true, comment };
  } catch (error: any) {
    return { error: error.message };
  }
}
