

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generatePost } from "@/ai/flows/generate-post-flow";
import { Wand2, Copy, Trash2, Loader2 } from "lucide-react";


export default function GeneratePostPage() {
    const [topic, setTopic] = useState("");
    const [generatedTitle, setGeneratedTitle] = useState("");
    const [generatedContent, setGeneratedContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a topic to generate a post.",
            });
            return;
        }
        setIsLoading(true);
        setGeneratedTitle("");
        setGeneratedContent("");
        try {
            const result = await generatePost({ topic });
            setGeneratedTitle(result.postTitle);
            setGeneratedContent(result.postContent);
            toast({
                title: "Success!",
                description: "Post content generated.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to generate content",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        const fullPost = `Title: ${generatedTitle}\n\n${generatedContent}`;
        navigator.clipboard.writeText(fullPost);
        toast({ title: "Copied to clipboard!" });
    }

    const handleClear = () => {
        setTopic("");
        setGeneratedTitle("");
        setGeneratedContent("");
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">AI Post Generator</h1>
                <p className="text-muted-foreground">Generate ideas and drafts for your community posts.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Generate Post Content</CardTitle>
                    <CardDescription>Enter a topic and let our AI assistant draft a post for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Input 
                            id="topic" 
                            placeholder="e.g., 'Tips for building your first SumoBot'" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="generated-title">Generated Title</Label>
                        <Input
                            id="generated-title"
                            placeholder="AI-generated title will appear here..."
                            value={generatedTitle}
                            onChange={(e) => setGeneratedTitle(e.target.value)}
                            disabled={isLoading}
                            readOnly
                            className="font-bold text-lg"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="generated-content">Generated Content</Label>
                        <Textarea
                            id="generated-content"
                            placeholder="AI-generated post will appear here..."
                            value={generatedContent}
                            onChange={(e) => setGeneratedContent(e.target.value)}
                            disabled={isLoading}
                            readOnly
                            rows={10}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div>
                         <Button variant="outline" onClick={handleCopy} disabled={!generatedContent || isLoading}>
                            <Copy className="h-4 w-4 mr-2" />Copy
                        </Button>
                         <Button variant="ghost" onClick={handleClear} disabled={isLoading} className="ml-2">
                            <Trash2 className="h-4 w-4 mr-2" />Clear
                        </Button>
                    </div>
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="h-4 w-4 mr-2" />Generate Post</>}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
