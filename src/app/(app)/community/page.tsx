

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getContributors, getPosts, togglePostLike, addCommentToPost } from "@/lib/firestore";
import { Medal, MessageCircle, Send, ThumbsUp, Search } from "lucide-react";
import Image from "next/image";
import { CreatePost } from "./create-post";
import { useEffect, useState, useOptimistic, useTransition, FormEvent, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";


interface Comment {
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: Date;
}

interface Post {
    id: string;
    author: string;
    handle: string;
    time: string;
    avatar: string;
    content: string;
    image?: string;
    imageHint?: string;
    likes: number;
    comments: Comment[];
    liked: boolean; // Is the post liked by the current user?
}

interface Contributor {
    id: string;
    handle: string;
    name: string;
    avatar: string;
    contributions: number;
    role?: string;
}


export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [contributorSearch, setContributorSearch] = useState("");


  const refreshPosts = async () => {
    setLoading(true);
    const postsData = await getPosts("Approved");
    const contributorsData = await getContributors();
    setPosts(postsData as Post[]);
    setContributors(contributorsData as Contributor[]);
    setLoading(false);
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const filteredContributors = useMemo(() => {
    return contributors.filter(c => c.name.toLowerCase().includes(contributorSearch.toLowerCase()));
  }, [contributors, contributorSearch]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Community Hub</h1>
        <p className="text-muted-foreground">Connect with peers, share your projects, and ask questions.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
            <CreatePost onPostCreated={refreshPosts} />

            {loading ? (
                Array.from({length: 3}).map((_, i) => <PostSkeleton key={i} />)
            ) : posts.length > 0 ? (
                posts.map((post) => (
                   <PostCard key={post.id} post={post} onUpdate={setPosts} />
                ))
            ) : (
                <Card>
                    <CardContent>
                        <p className="p-8 text-center text-muted-foreground">
                            No community posts yet. Be the first to share something!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="lg:col-span-1 space-y-6 sticky top-24">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Top Contributors</CardTitle>
                    <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search contributors..." 
                            className="pl-8"
                            value={contributorSearch}
                            onChange={(e) => setContributorSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        Array.from({length: 3}).map((_, i) => <ContributorSkeleton key={i} />)
                    ) : filteredContributors.length > 0 ? (
                        filteredContributors.map((contributor) => {
                           return (
                             <div key={contributor.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                    <AvatarImage src={contributor.avatar} />
                                    <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                    {contributor.role === 'Coach' ? (
                                        <Link href={`/coaches/${contributor.id}`} className="font-semibold hover:underline">{contributor.name}</Link>
                                    ) : (
                                        <p className="font-semibold">{contributor.name}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Medal className="h-4 w-4 text-amber-500"/>{contributor.contributions} contributions
                                    </p>
                                    </div>
                                </div>
                                {contributor.role === 'Coach' ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/coaches/${contributor.id}`}>Profile</Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled>Profile</Button>
                                )}
                            </div>
                           )
                        })
                    ) : (
                        <p className="text-sm text-center text-muted-foreground pt-4">No contributors found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}


function PostCard({ post, onUpdate }: { post: Post, onUpdate: React.Dispatch<React.SetStateAction<Post[]>> }) {
    const [optimisticPost, setOptimisticPost] = useOptimistic(
        post,
        (state: Post, { action, payload }: { action: 'like' | 'comment', payload: any }) => {
            if (action === 'like') {
                const newLikedState = !state.liked;
                return {
                    ...state,
                    liked: newLikedState,
                    likes: newLikedState ? state.likes + 1 : state.likes - 1,
                };
            }
            if (action === 'comment') {
                 return {
                    ...state,
                    comments: [...state.comments, payload],
                };
            }
            return state;
        }
    );
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleLikeClick = async () => {
        const user = auth.currentUser;
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in to like a post.' });
            return;
        }
        
        startTransition(() => {
            setOptimisticPost({ action: 'like', payload: null });
        });

        try {
            await togglePostLike(optimisticPost.id, user.uid);
            onUpdate(prevPosts => prevPosts.map(p => 
                p.id === optimisticPost.id 
                ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
                : p
            ));
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to update like.', description: error.message });
        }
    };

    const handleCommentSubmit = async (commentText: string) => {
        const user = auth.currentUser;
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in to comment.'});
            return;
        }
        if (!commentText.trim()) return;

        const newComment: Comment = {
            text: commentText,
            userId: user.uid,
            userName: user.displayName || "User",
            userAvatar: user.photoURL || "",
            createdAt: new Date()
        };

        startTransition(() => {
            setOptimisticPost({ action: 'comment', payload: newComment });
        });
        
        try {
            await addCommentToPost(optimisticPost.id, commentText);
            onUpdate(prev => prev.map(p => p.id === optimisticPost.id ? { ...p, comments: [...p.comments, newComment] } : p));
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to add comment', description: error.message });
        }
    };

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={optimisticPost.avatar} />
                    <AvatarFallback>{optimisticPost.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base font-semibold">{optimisticPost.author}</CardTitle>
                    <CardDescription>{optimisticPost.handle} · {optimisticPost.time}</CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-foreground/90 whitespace-pre-wrap">{optimisticPost.content}</p>
                {optimisticPost.image && <Image src={optimisticPost.image} alt={optimisticPost.imageHint || "Post image"} width={600} height={400} className="rounded-lg border object-cover" data-ai-hint={optimisticPost.imageHint} />}
            </CardContent>
            <CardFooter className="flex gap-4 border-t pt-4 mt-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary data-[liked=true]:text-primary"
                    data-liked={optimisticPost.liked}
                    onClick={handleLikeClick}
                    disabled={isPending}
                >
                    <ThumbsUp className="h-4 w-4" /> {optimisticPost.likes}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <MessageCircle className="h-4 w-4" /> {optimisticPost.comments?.length || 0}
                </Button>
            </CardFooter>
            <CommentSection comments={optimisticPost.comments} onCommentSubmit={handleCommentSubmit} />
        </Card>
    );
}



const PostSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="mt-4 aspect-video w-full" />
        </CardContent>
        <CardFooter className="flex gap-4 border-t pt-4 mt-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
        </CardFooter>
    </Card>
);

const ContributorSkeleton = () => (
     <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
        <Skeleton className="h-8 w-20" />
    </div>
)


function CommentSection({ comments, onCommentSubmit }: { comments: Comment[], onCommentSubmit: (commentText: string) => Promise<void> }) {
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, startTransition] = useTransition();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text) return;

        startTransition(async () => {
            await onCommentSubmit(text);
            setCommentText("");
        });
    }

    return (
        <div className="px-6 pb-6">
            <Separator className="my-4"/>
            <form onSubmit={handleSubmit} className="flex items-start gap-3">
                 <Avatar className="h-9 w-9 mt-1">
                    <AvatarImage src={auth.currentUser?.photoURL || ''} />
                    <AvatarFallback>{auth.currentUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Textarea 
                    placeholder="Add a comment..." 
                    rows={1} 
                    className="flex-1"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmitting}
                />
                <Button type="submit" size="icon" disabled={!commentText.trim() || isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
            </form>
            <div className="mt-4 space-y-4">
                 {comments && comments.length > 0 ? comments.map((comment, index) => (
                     <div key={index} className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                             <AvatarImage src={comment.userAvatar} />
                             <AvatarFallback>{comment.userName?.charAt(0) || 'A'}</AvatarFallback>
                         </Avatar>
                         <div className="bg-secondary rounded-lg px-3 py-2 text-sm w-full">
                             <p className="font-semibold">{comment.userName}</p>
                             <p className="text-muted-foreground whitespace-pre-wrap">{comment.text}</p>
                         </div>
                     </div>
                 )) : (
                     <p className="text-sm text-muted-foreground text-center py-2">No comments yet. Be the first to reply!</p>
                 )}
            </div>
        </div>
    );
}
