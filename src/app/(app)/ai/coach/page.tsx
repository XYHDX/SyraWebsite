
"use client";
export const dynamic = 'force-dynamic';

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useChat } from 'ai/react';
import { ScrollArea } from "@/components/ui/scroll-area";
// Firebase will be imported lazily inside effects to avoid SSR/prerender usage
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  role?: string;
  name?: string;
}

export default function AiCoachPage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let unsubscribe: undefined | (() => void);
        let isMounted = true;

        const init = async () => {
            const firebase = await import('@/lib/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            const { doc, getDoc } = await import('firebase/firestore');

            if (!isMounted) return;
            unsubscribe = onAuthStateChanged(firebase.auth, async (currentUser) => {
                if (currentUser) {
                    const userDocRef = doc(firebase.db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const profile = userDocSnap.data() as UserProfile;
                        setUserProfile(profile);
                        if (profile.role !== 'Admin' && profile.role !== 'Coach') {
                            router.push('/dashboard');
                        }
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    router.push('/login');
                }
                setLoading(false);
            });
        };

        void init();
        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, [router]);
    
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        body: {
            userName: userProfile?.name || 'Coach',
        },
        initialMessages: [
            {
                id: 'initial',
                role: 'assistant',
                content: `Hello ${userProfile?.name || 'Coach'}! I am your AI coaching assistant. Ask me anything about robotics coaching, from technical questions to team management strategies.`
            }
        ],
    });
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    if (loading || !userProfile) {
        return (
             <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="mb-8 text-center">
                    <Skeleton className="h-9 w-48 mx-auto" />
                    <Skeleton className="h-5 w-80 mx-auto mt-2" />
                </div>
                <Card className="max-w-3xl mx-auto w-full">
                    <CardHeader><Skeleton className="h-7 w-32" /></CardHeader>
                    <CardContent><Skeleton className="h-[50vh] w-full" /></CardContent>
                    <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">AI Coach</h1>
                <p className="text-muted-foreground">Your personal AI assistant for robotics coaching excellence.</p>
            </div>
            <div className="flex-1 flex flex-col justify-end">
                <Card className="max-w-3xl mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot /> Chat</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ScrollArea className="h-[50vh] space-y-4 pr-4" ref={scrollAreaRef}>
                         {messages.map((msg) => (
                             <div key={msg.id} className={cn("flex items-start gap-3 my-4", msg.role === 'user' ? 'justify-end' : '')}>
                                {msg.role === 'assistant' && (
                                    <Avatar className="h-9 w-9 flex-shrink-0">
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Bot className="h-5 w-5"/>
                                        </div>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "rounded-lg px-4 py-2 text-sm max-w-[80%] whitespace-pre-wrap",
                                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                                )}>
                                    <p>{msg.content}</p>
                                </div>
                                 {msg.role === 'user' && (
                                    <Avatar className="h-9 w-9 flex-shrink-0">
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                                            <User className="h-5 w-5"/>
                                        </div>
                                    </Avatar>
                                 )}
                             </div>
                        ))}
                       </ScrollArea>
                    </CardContent>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
                            <Input
                                id="chat-input"
                                name="prompt" 
                                placeholder="Ask a question..." 
                                className="flex-1" 
                                value={input}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
