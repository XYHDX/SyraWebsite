
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Image as ImageIcon } from "lucide-react";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, just show success message since we haven't migrated posts to Prisma yet
      toast({
        title: "Success",
        description: "Post created successfully! (Mock implementation)",
      });
      
      // Reset form
      setTitle("");
      setContent("");
      setTags("");
      onPostCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Tell the community about your robotics journey, projects, or ask questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My First VEX Competition Experience"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your story, ask questions, or discuss robotics topics..."
              rows={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., VEX, Competition, Arduino, Python"
            />
            <p className="text-xs text-muted-foreground">
              Add relevant tags to help others find your post
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? "Creating..." : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Post
                </>
              )}
            </Button>
            
            <Button type="button" variant="outline" disabled>
              <ImageIcon className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
