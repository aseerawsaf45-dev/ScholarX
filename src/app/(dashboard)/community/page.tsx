"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { getPosts, createPost, upvotePost, addComment, deletePost, deleteComment } from "@/app/actions/community";
import { motion, AnimatePresence } from "framer-motion";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string | null };
};

type Post = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  createdAt: Date;
  user: { name: string | null };
  comments: Comment[];
};

const POPULAR_TAGS = ["SOP", "CV", "IELTS", "Germany", "USA", "Scholarships", "General"];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "top">("newest");
  
  // Post expansion states
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  
  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCommunityData = async () => {
    const data = await getPosts(selectedTag || undefined, sortBy);
    setPosts(data as any[]);
  };

  useEffect(() => {
    fetchCommunityData();
  }, [selectedTag, sortBy]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tagsArray = newTags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const res = await createPost(newTitle, newContent, tagsArray.length > 0 ? tagsArray : ["General"]);
    
    if (res.success) {
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setShowCreateForm(false);
      fetchCommunityData();
    }
    setIsSubmitting(false);
  };

  const handleUpvote = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await upvotePost(postId);
    if (res.success) {
      setPosts(prev =>
          prev.map(p => (p.id === postId ? { ...p, upvotes: res.upvotes || p.upvotes + 1 } : p))
      );
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    const res = await addComment(postId, content);
    if (res.success) {
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      fetchCommunityData();
    }
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this thread?")) return;
    const res = await deletePost(postId);
    if (res.success) {
      fetchCommunityData();
    } else {
      alert(res.error || "Failed to delete post");
    }
  };

  const handleDeleteComment = async (commentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this reply?")) return;
    const res = await deleteComment(commentId);
    if (res.success) {
      fetchCommunityData();
    } else {
      alert(res.error || "Failed to delete comment");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Community Discussions</h1>
          <p className="text-muted-foreground mt-1">Connect, ask questions, and share scholarship advice with fellow applicants.</p>
        </div>
        <Button variant="premium" onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2 shrink-0">
          <Icon name="Plus" size={16} /> New Discussion
        </Button>
      </div>

      {/* Popular Tags Filters */}
      <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-2 rounded-xl border border-border/40">
        <span className="text-xs text-muted-foreground px-2 font-medium">Filter:</span>
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedTag === null
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          All Topics
        </button>
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTag === tag
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            #{tag}
          </button>
        ))}

        <div className="sm:ml-auto flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-semibold border-none focus:ring-0 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="top">Top Upvoted</option>
          </select>
        </div>
      </div>

      {/* New Post Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Create a New Discussion Thread</CardTitle>
                <CardDescription>Share your queries or knowledge with the community.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Topic/Title</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., How long did it take to receive your DAAD portal invitation?"
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Details</label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Describe your situation or advice in detail..."
                      className="w-full min-h-[120px] p-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Tags (comma-separated)</label>
                    <Input
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="e.g., DAAD, Germany, SOP"
                      className="bg-background"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="premium" disabled={isSubmitting}>
                      Post Thread
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discussion List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-border">
            <Icon name="Users" size={32} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-base">No discussions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Be the first to start a conversation in this topic!</p>
          </Card>
        ) : (
          posts.map(post => {
            const isExpanded = expandedPostId === post.id;
            return (
              <Card
                key={post.id}
                onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                className={`transition-all duration-300 border border-border/80 hover:border-primary/30 cursor-pointer ${
                  isExpanded ? "ring-1 ring-primary/20 bg-card" : "bg-card/50"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{post.user?.name || "Student"}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-heading font-bold text-base hover:text-primary transition-colors mt-1">
                        {post.title}
                      </h3>
                    </div>

                     {/* Upvote & Delete Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleUpvote(post.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all font-semibold text-xs"
                      >
                        <Icon name="ArrowUp" size={14} />
                        <span>{post.upvotes}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeletePost(post.id, e)}
                        className="p-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-muted-foreground"
                        title="Delete Thread"
                      >
                        <Icon name="trash-2" size={14} />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm text-muted-foreground leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="bg-primary/5 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}

                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Icon name="MessageSquare" size={14} />
                      <span>{post.comments?.length || 0} replies</span>
                    </div>
                  </div>

                  {/* Expanded Comments/Thread */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-border/60 pt-4 mt-4 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h4 className="text-xs font-bold text-foreground">Replies</h4>
                        
                        {/* List comments */}
                        <div className="space-y-3 pl-3 border-l-2 border-primary/20">
                          {post.comments?.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No replies yet. Be the first to answer!</p>
                          ) : (
                            post.comments.map(comment => (
                              <div key={comment.id} className="bg-muted/45 p-3 rounded-lg space-y-1 relative group">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span className="font-semibold text-foreground">{comment.user?.name || "Student"}</span>
                                  <div className="flex items-center gap-2">
                                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    <button
                                      onClick={(e) => handleDeleteComment(comment.id, e)}
                                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                                      title="Delete Reply"
                                    >
                                      <Icon name="trash-2" size={10} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add comment form */}
                        <form
                          onSubmit={(e) => handleAddComment(post.id, e)}
                          className="flex gap-2 pt-2"
                        >
                          <Input
                            placeholder="Write a reply..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                            }
                            className="h-10 bg-background text-xs"
                          />
                          <Button type="submit" variant="premium" className="h-10 text-xs px-4">
                            Reply
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
