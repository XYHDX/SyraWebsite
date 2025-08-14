

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MessageCircle, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated posts to Prisma yet
        const mockPosts: Post[] = [
          {
            id: '1',
            title: 'VEX Robotics Competition Success!',
            content: 'Our team just won first place at the regional VEX competition! The journey was challenging but incredibly rewarding. Special thanks to our coach and all the support from the academy.',
            author: {
              name: 'Ahmed Al-Rashid',
              avatar: '/avatars/ahmed.jpg',
              role: 'Student'
            },
            createdAt: '2024-01-15T10:30:00Z',
            likes: 24,
            comments: 8,
            tags: ['VEX', 'Competition', 'Success']
          },
          {
            id: '2',
            title: 'New Arduino Project Ideas',
            content: 'Looking for inspiration for our next Arduino project. We\'re thinking of building a smart irrigation system for our school garden. Anyone have experience with soil moisture sensors?',
            author: {
              name: 'Sarah Mahmoud',
              avatar: '/avatars/sarah.jpg',
              role: 'Coach'
            },
            createdAt: '2024-01-14T14:20:00Z',
            likes: 18,
            comments: 12,
            tags: ['Arduino', 'IoT', 'Garden']
          },
          {
            id: '3',
            title: 'Python Programming Workshop',
            content: 'Great workshop today on Python programming for robotics! We covered basic concepts and built a simple robot control system. The hands-on approach really helped everyone understand the concepts better.',
            author: {
              name: 'Omar Khalil',
              avatar: '/avatars/omar.jpg',
              role: 'Coach'
            },
            createdAt: '2024-01-13T16:45:00Z',
            likes: 31,
            comments: 15,
            tags: ['Python', 'Workshop', 'Programming']
          }
        ];
        
        setPosts(mockPosts);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-muted-foreground">Share your robotics journey with fellow enthusiasts</p>
      </div>

      <div className="mb-6">
        <Link href="/community/create-post">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{post.author.name}</span>
                    <Badge variant="secondary">{post.author.role}</Badge>
                    <span>•</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{post.content}</p>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
}
